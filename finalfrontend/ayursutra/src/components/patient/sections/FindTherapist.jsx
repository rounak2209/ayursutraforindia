import React, { useEffect, useMemo, useState } from "react";
import { 
  User, Award, MapPin, Clock, Calendar as CalendarIcon, 
  Search, Stethoscope, Banknote, Sparkles, AlertCircle, 
  X, Languages, CalendarDays, Phone, Mail, CheckCircle2, ChevronRight, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { apiGet, apiPost,apiPostMultipart } from "@/lib/api";

const generateAllDayTimeSlots = () => {
  const slots = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      slots.push(time);
    }
  }
  return slots;
};
const ALL_TIME_SLOTS = generateAllDayTimeSlots();

export default function FindTherapist() {
  const [loading, setLoading] = useState(true);
  const [allTherapists, setAllTherapists] = useState([]); 
  const [filteredTherapists, setFilteredTherapists] = useState([]); 
  const [patientTherapies, setPatientTherapies] = useState([]);

  const [filters, setFilters] = useState({
    date: null,
    therapy: "any",
    duration: "any",
    time: "any",
    location: "any",
    minExperience: "any",
    maxFees: "any",
    search: ""
  });

  const [isSearching, setIsSearching] = useState(false);
  const [searchResultsMap, setSearchResultsMap] = useState({}); 

  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedTherapist, setSelectedTherapist] = useState(null);
  const [selectedSlotToBook, setSelectedSlotToBook] = useState(null);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  
  const [prescriptionFile, setPrescriptionFile] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const patient = await apiGet(`/api/patients/profile/${userId}`);
          setPatientTherapies(patient?.prescriptionDetails?.therapies || []);
        }
        
        const data = await apiGet("/api/therapists");
        
        const normalized = (data || []).map((t) => {
          let specs = [];
          if (Array.isArray(t.specializations)) {
              specs = t.specializations;
          } else if (typeof t.specializations === 'string') {
              try { 
                  specs = JSON.parse(t.specializations); 
              } catch(e) { 
                  specs = t.specializations.includes(',') 
                      ? t.specializations.split(',') 
                      : [t.specializations]; 
              }
          }
          specs = specs.filter(Boolean).map(s => String(s).trim());

          return {
            ...t,
            id: t._id || t.id,
            name: t.name || "Unnamed",
            specialization: specs[0] || "General",
            subSpecialties: specs,
            fees: t.money || 0,
            experience: t.experience || 0,
            location: t.location || "—",
            languages: t.languages || ["English"], 
            workingDays: t.workingDays || ["Mon", "Tue", "Wed", "Thu", "Fri"],
            photoUrl: t.profilePic || t.photoUrl,
            email: t.email || "—",
            phone: t.phone || "—",
            bio: t.bio || "Dedicated to providing delightful healing experiences and personalized Ayurvedic care."
          };
        });

        setAllTherapists(normalized);
        setFilteredTherapists(normalized); 
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const locationOptions = useMemo(() => {
    const setL = new Set();
    allTherapists.forEach(t => setL.add((t.location || "").toLowerCase()));
    return Array.from(setL).filter(x => x && x !== "—").sort();
  }, [allTherapists]);

  const handleFilterChange = (field, value) => {
      setFilters(prev => {
          const newFilters = { ...prev, [field]: value };
          if (field === 'therapy' && value === 'any') newFilters.duration = 'any';
          return newFilters;
      });
  };

  const isCompulsoryFilled = filters.date && filters.therapy !== 'any' && filters.duration !== 'any';

  const applyFilters = async () => {
    if (!isCompulsoryFilled) {
        toast({ title: "Filters Required", description: "Start Date, Therapy, and Duration are compulsory.", variant: "destructive" });
        return;
    }

    setIsSearching(true);
    setLoading(true);
    
    try {
        const query = new URLSearchParams({
          date: filters.date.toLocaleDateString("en-CA"),
          time: filters.time,
          therapyType: filters.therapy,
          durationDays: filters.duration.match(/\d+/)?.[0] || "1"
        });

        const res = await apiGet(`/api/bookings/search?${query.toString()}`);
        
        const availableData = res.availableTherapists || [];
        
        const availabilityMap = {};
        const availableIds = [];
        availableData.forEach(item => {
            availabilityMap[item.id] = item.availableSlots;
            availableIds.push(item.id);
        });

        setSearchResultsMap(availabilityMap);

        let matches = allTherapists.filter(t => availableIds.includes(t.id));

        if (filters.therapy !== 'any') {
            const selectedTherapyClean = filters.therapy.trim().toLowerCase();
            matches = matches.filter(t => 
                t.subSpecialties.some(spec => spec.toLowerCase() === selectedTherapyClean)
            );
        }

        if (filters.location !== 'any') {
            matches = matches.filter(t => t.location.toLowerCase().includes(filters.location.toLowerCase()));
        }
        if (filters.minExperience !== 'any') {
            matches = matches.filter(t => t.experience >= parseInt(filters.minExperience));
        }
        if (filters.maxFees !== 'any') {
            matches = matches.filter(t => parseInt(t.fees) <= parseInt(filters.maxFees));
        }
        if (filters.search.trim()) {
            const s = filters.search.trim().toLowerCase();
            matches = matches.filter(t => 
                t.name.toLowerCase().includes(s) || 
                t.subSpecialties.join(" ").toLowerCase().includes(s)
            );
        }

        setFilteredTherapists(matches);
        
        if(matches.length > 0) {
            toast({ description: `Found ${matches.length} valid therapists.` });
        } else {
            toast({ description: "No therapist matches the EXACT therapy selected.", variant: "destructive" });
        }

    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Search failed.", variant: "destructive" });
    } finally {
      setIsSearching(false);
      setLoading(false);
    }
  };

  const handleSlotClick = (therapist, slot) => {
      setSelectedTherapist(therapist);
      setSelectedSlotToBook(slot);
      setPrescriptionFile(null); 
      setConfirmModalOpen(true);
  };

const confirmBooking = async () => {
    setBookingInProgress(true);
    try {
      const data = new FormData();
      data.append("therapistId", selectedTherapist.id);
      data.append("therapyType", filters.therapy);
      data.append("durationDays", filters.duration.match(/\d+/)?.[0] || "7");
      data.append("date", filters.date.toLocaleDateString("en-CA"));
      data.append("startTime", selectedSlotToBook);
      data.append("fee", selectedTherapist.fees || 0);

      if (prescriptionFile) {
        data.append("prescription", prescriptionFile);
      }

      
      // Ye function URL, Token, aur Error Handling khud manage kar lega
      await apiPostMultipart("/api/bookings/book", data);

      
      toast({ title: "Booking Confirmed! 🎉", description: `Scheduled for ${selectedSlotToBook}` });
      setConfirmModalOpen(false);
      setSelectedTherapist(null);
      setSelectedSlotToBook(null);
      setPrescriptionFile(null);
      applyFilters();
      
    } catch (err) {
      toast({ title: "Booking Failed", description: err.message, variant: "destructive" });
    } finally {
      setBookingInProgress(false);
    }
  };

  const resetFilters = () => {
    setFilters({ date: null, time: "any", therapy: "any", duration: "any", location: "any", minExperience: "any", maxFees: "any", search: "" });
    setFilteredTherapists(allTherapists);
    setSearchResultsMap({});
  };

  return (
    <div className="relative animate-in fade-in duration-700 w-full max-w-7xl mx-auto space-y-8 pb-10">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border-[1.5px] border-white/70 shadow-sm backdrop-blur-md mb-3">
             <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
             <span className="text-teal-900 font-extrabold text-[10px] tracking-widest uppercase">Professional Directory</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-teal-950 flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-white/50 backdrop-blur-xl rounded-2xl border-[1.5px] border-white/70 flex items-center justify-center shadow-sm">
               <Stethoscope className="w-6 h-6 text-blue-600" />
            </div>
            Find Therapist
          </h2>
        </div>
        <div className="px-5 py-2.5 bg-white/40 backdrop-blur-md border-[1.5px] border-white/70 shadow-sm rounded-full text-teal-900 font-black text-sm tracking-wide">
          {filteredTherapists.length} Specialists
        </div>
      </div>

      <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_-10px_rgba(20,184,166,0.15)] border-[1.5px] border-white/60 group">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-400/20 via-emerald-400/20 to-blue-400/20 blur-xl pointer-events-none -z-10 group-hover:opacity-100 opacity-60 transition-opacity duration-700"></div>
        <img src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=80" alt="Bg" className="absolute inset-0 w-full h-full object-cover -z-20 opacity-30 mix-blend-overlay"/>
        
        <div className="relative z-10 bg-white/40 backdrop-blur-[30px] p-6 md:p-8 border-t border-white/50">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 text-teal-950 font-black text-xl drop-shadow-sm">
              <Search className="w-6 h-6 text-teal-600" /> Search Availability
            </div>
            <Button variant="ghost" onClick={resetFilters} className="text-teal-900 font-bold hover:bg-white/40 rounded-xl px-4">Reset</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="space-y-1.5 z-10">
              <Label className="text-[10px] font-black text-teal-900/70 uppercase tracking-widest ml-1">Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={`w-full justify-start text-left font-bold h-12 bg-white/60 hover:bg-white/80 backdrop-blur-md border-[1.5px] border-white/80 rounded-xl shadow-sm transition-all ${!filters.date && "text-teal-900/50"}`}>
                    <CalendarIcon className="mr-3 h-4 w-4 text-teal-600" />
                    {filters.date ? filters.date.toLocaleDateString() : <span>Select Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-2xl border-white/80 shadow-xl bg-white/90 backdrop-blur-xl">
                  <Calendar mode="single" selected={filters.date} onSelect={(d) => handleFilterChange('date', d)} disabled={(date) => date < new Date().setHours(0,0,0,0)} initialFocus className="p-3" />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5 z-10">
              <Label className="text-[10px] font-black text-teal-900/70 uppercase tracking-widest ml-1">Therapy *</Label>
              <div className="relative">
                <select className="w-full h-12 bg-white/60 hover:bg-white/80 backdrop-blur-md border-[1.5px] border-white/80 rounded-xl px-4 pl-10 font-bold text-teal-950 shadow-sm transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400" value={filters.therapy} onChange={(e) => handleFilterChange('therapy', e.target.value)}>
                  <option value="any">Select...</option>
                  {[...new Set(patientTherapies.map(t => t.therapy))].map((name, i) => <option key={i} value={name}>{name}</option>)}
                </select>
                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5 z-10">
              <Label className="text-[10px] font-black text-teal-900/70 uppercase tracking-widest ml-1">Duration *</Label>
              <div className="relative">
                <select className="w-full h-12 bg-white/60 hover:bg-white/80 backdrop-blur-md border-[1.5px] border-white/80 rounded-xl px-4 pl-10 font-bold text-teal-950 shadow-sm transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-50" value={filters.duration} onChange={(e) => handleFilterChange('duration', e.target.value)} disabled={filters.therapy === 'any'}>
                  <option value="any">Select...</option>
                  {patientTherapies.filter(t => t.therapy === filters.therapy)
                    .map(t => (t.duration || "").trim()).filter(d => d !== "")
                    .reduce((acc, curr) => acc.some(x => x.toLowerCase() === curr.toLowerCase()) ? acc : [...acc, curr], [])
                    .map((dur, i) => <option key={i} value={dur}>{dur}</option>)
                  }
                </select>
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5 z-10">
              <Label className="text-[10px] font-black text-teal-900/70 uppercase tracking-widest ml-1">Time Slot</Label>
              <div className="relative">
                <select className="w-full h-12 bg-white/60 hover:bg-white/80 backdrop-blur-md border-[1.5px] border-white/80 rounded-xl px-4 pl-10 font-bold text-teal-950 shadow-sm transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400" value={filters.time} onChange={(e) => handleFilterChange('time', e.target.value)}>
                  <option value="any">Any Time</option>
                  {ALL_TIME_SLOTS.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                </select>
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5 z-10">
              <Label className="text-[10px] font-black text-teal-900/70 uppercase tracking-widest ml-1">Location</Label>
              <div className="relative">
                <select className="w-full h-12 bg-white/60 hover:bg-white/80 backdrop-blur-md border-[1.5px] border-white/80 rounded-xl px-4 pl-10 font-bold text-teal-950 shadow-sm transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400" value={filters.location} onChange={(e) => handleFilterChange("location", e.target.value)}>
                  <option value="any">Any Location</option>
                  {locationOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5 z-10">
              <Label className="text-[10px] font-black text-teal-900/70 uppercase tracking-widest ml-1">Max Fee (₹)</Label>
              <div className="relative">
                <select className="w-full h-12 bg-white/60 hover:bg-white/80 backdrop-blur-md border-[1.5px] border-white/80 rounded-xl px-4 pl-10 font-bold text-teal-950 shadow-sm transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400" value={filters.maxFees} onChange={(e) => handleFilterChange("maxFees", e.target.value)}>
                  <option value="any">Any Price</option>
                  <option value="500">₹500</option>
                  <option value="1000">₹1000</option>
                  <option value="1500">₹1500</option>
                  <option value="2000">₹2000</option>
                  <option value="5000">₹5000</option>
                </select>
                <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-600 pointer-events-none" />
              </div>
            </div>
            
            <div className="space-y-1.5 z-10 md:col-span-2 flex flex-col justify-end">
               <Label className="text-[10px] font-black text-teal-900/70 uppercase tracking-widest ml-1">Name</Label>
               <div className="flex gap-3 h-12">
                 <div className="relative flex-1">
                    <input className="w-full h-full bg-white/60 hover:bg-white/80 backdrop-blur-md border-[1.5px] border-white/80 rounded-xl px-4 font-bold text-teal-950 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-teal-900/40" placeholder="Search therapist name..." value={filters.search} onChange={(e) => handleFilterChange("search", e.target.value)} />
                 </div>
                 <Button onClick={applyFilters} disabled={isSearching || !isCompulsoryFilled} className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-black text-sm px-8 rounded-xl shadow-[0_8px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_12px_25px_rgba(20,184,166,0.5)] transition-all hover:-translate-y-0.5">
                   {isSearching ? "Searching..." : "Apply Filters"}
                 </Button>
               </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-60 text-teal-800 animate-pulse font-black tracking-widest uppercase">Loading specialists...</div>
      ) : filteredTherapists.length === 0 ? (
        <div className="text-center py-20 bg-white/20 backdrop-blur-[30px] rounded-[3rem] border-[1.5px] border-white/50 shadow-sm">
           <AlertCircle className="w-16 h-16 text-rose-400/50 mx-auto mb-4" />
           <p className="text-xl font-black text-teal-950">No therapists found matching criteria.</p>
           {!isCompulsoryFilled && <p className="text-sm font-bold text-teal-900/60 mt-2 uppercase tracking-widest">Please select Date, Therapy, and Duration to see availability.</p>}
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredTherapists.map(t => {
            const availableSlots = searchResultsMap[t.id] || [];
            
            return (
            <div key={t.id} className="group relative overflow-hidden rounded-[2.5rem] bg-white/10 backdrop-blur-[30px] border-[1.5px] border-white/50 hover:border-white/80 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_50px_-12px_rgba(20,184,166,0.25)] hover:-translate-y-2 transition-all duration-500 p-6 flex flex-col"
                 style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)' }}>
              
              <div className="flex flex-col items-center text-center mb-6 pt-4">
                 <div className="w-24 h-24 rounded-[1.5rem] bg-white/30 border-[2px] border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.1)] flex items-center justify-center mb-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-300/30 to-teal-300/30 backdrop-blur-md"></div>
                    {t.photoUrl ? <img src={t.photoUrl} className="w-full h-full object-cover relative z-10" /> : <User className="w-10 h-10 text-teal-900 relative z-10 drop-shadow-sm" />}
                 </div>
                 <h3 className="text-2xl font-black text-teal-950 leading-tight mb-1 group-hover:text-blue-800 transition-colors">
                    {t.name}
                 </h3>
                 <p className="text-xs font-bold text-teal-900/70 flex items-center justify-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5" /> 
                    <span className="truncate max-w-[200px]">{t.subSpecialties.join(", ")}</span>
                 </p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                 <div className="bg-white/20 group-hover:bg-white/30 transition-colors duration-500 backdrop-blur-md border-[1.5px] border-white/50 group-hover:border-white/70 rounded-[1.25rem] p-4 text-center shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
                    <p className="text-2xl font-black text-teal-950 flex items-center justify-center gap-1">
                      <span className="text-sm font-bold text-emerald-600">₹</span>{t.fees}
                    </p>
                    <p className="text-[10px] font-bold text-teal-900/70 uppercase tracking-widest mt-1">Session Fee</p>
                 </div>
                 <div className="bg-white/20 group-hover:bg-white/30 transition-colors duration-500 backdrop-blur-md border-[1.5px] border-white/50 group-hover:border-white/70 rounded-[1.25rem] p-4 text-center shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
                    <p className="text-2xl font-black text-teal-950 flex items-center justify-center gap-1">
                      {t.experience} <span className="text-sm font-bold text-teal-900/60">Yrs</span>
                    </p>
                    <p className="text-[10px] font-bold text-teal-900/70 uppercase tracking-widest mt-1">Experience</p>
                 </div>
              </div>

              {isCompulsoryFilled && (
                  <div className="mb-5 bg-white/20 backdrop-blur-md border-[1.5px] border-white/50 rounded-[1.5rem] p-4 shadow-sm">
                    <p className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <CalendarDays className="w-3.5 h-3.5" /> Available on {filters.date?.toLocaleDateString()}
                    </p>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/60 [&::-webkit-scrollbar-thumb]:rounded-full">
                        {availableSlots.length > 0 ? availableSlots.map(slot => (
                            <Button 
                                key={slot} 
                                variant="outline" 
                                size="sm" 
                                className="h-9 px-4 rounded-xl text-xs font-black border-[1.5px] border-white/70 text-teal-900 bg-white/40 hover:bg-emerald-500 hover:border-emerald-400 hover:text-white transition-all shadow-sm"
                                onClick={() => handleSlotClick(t, slot)}
                            >
                                {slot}
                            </Button>
                        )) : (
                            <span className="text-xs font-bold text-rose-500/80 italic p-2 border border-dashed border-rose-200/50 rounded-xl w-full text-center">No slots matching criteria.</span>
                        )}
                    </div>
                  </div>
              )}

              <div className="mt-auto pt-2 flex gap-3">
                 <Button variant="outline" onClick={() => { setSelectedTherapist(t); setDetailsModalOpen(true); }} className="flex-1 rounded-full h-12 bg-white/40 hover:bg-white/60 backdrop-blur-md border-[1.5px] border-white/60 text-teal-950 font-black shadow-sm transition-all group-hover:shadow-md">
                    View Profile
                 </Button>
                 {!isCompulsoryFilled && (
                    <Button disabled className="flex-1 rounded-full h-12 bg-white/20 text-teal-950/40 border-[1.5px] border-white/30 cursor-not-allowed font-black">
                        Select to Book
                    </Button>
                 )}
              </div>
            </div>
          )})}
        </div>
      )}

      {}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] sm:max-w-[400px] w-[90vw] max-h-[85vh] p-0 overflow-y-auto overflow-x-hidden bg-white/30 backdrop-blur-[40px] border-[1.5px] border-white/60 shadow-[0_30px_80px_rgba(0,0,0,0.2)] rounded-[2.5rem] [&::-webkit-scrollbar]:hidden z-[100] [&>button]:hidden">
          
          {/* Inner Glowing Orbs for deep glass effect */}
          <div className="absolute -top-10 -left-10 w-48 h-48 bg-teal-400/30 rounded-full blur-[60px] pointer-events-none z-0"></div>
          <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-emerald-400/20 rounded-full blur-[60px] pointer-events-none z-0"></div>
          
          {selectedTherapist && (
             <div className="p-8 relative z-10 flex flex-col items-center text-center">
                
                {/* Single Custom Close Button */}
                <button onClick={() => setDetailsModalOpen(false)} className="absolute top-6 right-6 text-teal-900/60 hover:text-teal-950 transition-colors bg-white/40 hover:bg-white/60 rounded-full p-2 backdrop-blur-md z-50 border border-white/50">
                  <X className="w-5 h-5" />
                </button>

                {/* Profile Image (Glowing center) */}
                <div className="w-28 h-28 rounded-full bg-white/40 p-[3px] border-[1.5px] border-white/70 shadow-[0_10px_25px_rgba(20,184,166,0.15)] mb-5 relative mt-4">
                   <div className="w-full h-full rounded-full overflow-hidden bg-white/60 backdrop-blur-md flex items-center justify-center">
                     {selectedTherapist.photoUrl ? (
                       <img src={selectedTherapist.photoUrl} className="w-full h-full object-cover" />
                     ) : (
                       <User className="w-12 h-12 text-teal-800/50" />
                     )}
                   </div>
                </div>

                {/* Name & Bio */}
                <h3 className="text-[1.7rem] font-black text-teal-950 tracking-tight drop-shadow-sm mb-2">
                  {selectedTherapist.name}
                </h3>
                <p className="text-sm font-bold text-teal-900/70 mb-6 px-2 leading-relaxed">
                  "{selectedTherapist.bio || 'Dedicated to providing delightful healing experiences and personalized Ayurvedic care.'}"
                </p>

                {/* 3 Stats Grid */}
                <div className="grid grid-cols-3 gap-3 w-full mb-3">
                   <div className="bg-white/40 border-[1.5px] border-white/60 rounded-[1.25rem] p-4 shadow-sm hover:bg-white/50 transition-all flex flex-col items-center justify-center cursor-default">
                      <p className="text-xl font-black text-teal-950 mb-0.5">{selectedTherapist.experience}</p>
                      <p className="text-[9px] font-bold text-teal-900/60 uppercase tracking-widest">Exp</p>
                   </div>
                   <div className="bg-white/40 border-[1.5px] border-white/60 rounded-[1.25rem] p-4 shadow-sm hover:bg-white/50 transition-all flex flex-col items-center justify-center cursor-default">
                      <p className="text-xl font-black text-teal-950 mb-0.5">₹{selectedTherapist.fees}</p>
                      <p className="text-[9px] font-bold text-teal-900/60 uppercase tracking-widest">Fee</p>
                   </div>
                   <div className="bg-white/40 border-[1.5px] border-white/60 rounded-[1.25rem] p-4 shadow-sm hover:bg-white/50 transition-all flex flex-col items-center justify-center cursor-default">
                      <p className="text-xs font-black text-teal-950 mb-1 w-full text-center leading-tight line-clamp-3">{selectedTherapist.location}</p>
                      <p className="text-[9px] font-bold text-teal-900/60 uppercase tracking-widest">Loc</p>
                   </div>
                </div>

                {/* 2 Stats Grid */}
                <div className="grid grid-cols-2 gap-3 w-full mb-3">
                   <div className="bg-white/40 border-[1.5px] border-white/60 rounded-[1.25rem] p-4 flex flex-col items-center justify-center hover:bg-white/50 transition-all cursor-default shadow-sm">
                      <div className="flex gap-2 mb-1 flex-wrap justify-center items-center">
                         <Stethoscope className="w-4 h-4 text-emerald-600" />
                         <span className="text-sm font-black text-teal-950 w-full text-center leading-tight line-clamp-3">{selectedTherapist.subSpecialties[0] || 'General'}</span>
                      </div>
                      <p className="text-[9px] font-bold text-teal-900/60 uppercase tracking-widest mt-1">Specialty</p>
                   </div>
                   <div className="bg-white/40 border-[1.5px] border-white/60 rounded-[1.25rem] p-4 flex flex-col items-center justify-center hover:bg-white/50 transition-all cursor-default shadow-sm">
                      <div className="flex gap-2 mb-1 flex-wrap justify-center items-center">
                         <Languages className="w-4 h-4 text-emerald-600" />
                         <span className="text-sm font-black text-teal-950 truncate max-w-[100px]">{selectedTherapist.languages[0] || 'English'}</span>
                      </div>
                      <p className="text-[9px] font-bold text-teal-900/60 uppercase tracking-widest mt-1">Language</p>
                   </div>
                </div>

                {/* Working Days */}
                <div className="w-full bg-white/40 border-[1.5px] border-white/60 rounded-[1.25rem] p-4 mb-8 shadow-sm flex flex-col items-center justify-center hover:bg-white/50 transition-all cursor-default">
                   <div className="flex flex-wrap gap-1.5 justify-center mb-1">
                      {selectedTherapist.workingDays.map(d => (
                         <Badge key={d} className="bg-white/60 text-teal-950 border border-white/80 shadow-sm px-2 py-0.5 text-[10px] font-bold">
                            {d.slice(0,3)}
                         </Badge>
                      ))}
                   </div>
                   <p className="text-[9px] font-bold text-teal-900/60 uppercase tracking-widest mt-1 flex items-center gap-1">
                      <CalendarDays className="w-3 h-3 text-emerald-600" /> Working Days
                   </p>
                </div>


                {/* Action Button */}
                <Button 
                  onClick={() => setDetailsModalOpen(false)} 
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white rounded-full py-7 text-base font-black shadow-[0_8px_20px_rgba(20,184,166,0.3)] transition-all hover:scale-[1.02] hover:-translate-y-0.5"
                >
                   Close Profile
                </Button>
             </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION MODAL */}
      <Dialog open={confirmModalOpen} onOpenChange={setConfirmModalOpen}>
        <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] sm:max-w-md w-[90vw] max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 bg-white/30 backdrop-blur-[50px] border-[1.5px] border-white/60 shadow-[0_30px_80px_rgba(0,0,0,0.3)] [&::-webkit-scrollbar]:hidden z-[100] [&>button]:hidden">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <DialogTitle className="text-2xl font-black text-teal-950">Confirm Booking</DialogTitle>
              <button onClick={() => setConfirmModalOpen(false)} className="text-teal-900 hover:text-teal-950 transition-colors bg-white/40 rounded-full p-2 backdrop-blur-md border border-white/50">
                 <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-white/40 backdrop-blur-md p-5 rounded-[1.5rem] border-[1.5px] border-white/60 shadow-sm">
                 <h4 className="font-black text-teal-950 text-lg mb-1">{selectedTherapist?.name}</h4>
                 <p className="text-xs font-bold text-teal-900/70 uppercase tracking-widest">{filters.therapy} • {filters.duration}</p>
              </div>
              
              <div className="bg-white/20 backdrop-blur-md p-5 rounded-[1.5rem] border-[1.5px] border-white/50 shadow-sm space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/40"><span className="text-xs font-black text-teal-900/60 uppercase tracking-widest">Date</span><span className="font-black text-teal-950">{filters.date?.toLocaleDateString()}</span></div>
                <div className="flex justify-between items-center pb-3 border-b border-white/40"><span className="text-xs font-black text-teal-900/60 uppercase tracking-widest">Time</span><span className="font-black text-blue-700 bg-white/50 px-3 py-1 rounded-lg border border-white/60">{selectedSlotToBook}</span></div>
                <div className="flex justify-between items-center"><span className="text-xs font-black text-teal-900/60 uppercase tracking-widest">Fee</span><span className="font-black text-emerald-700 text-lg">₹{selectedTherapist?.fees}</span></div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-md p-5 rounded-[1.5rem] border-[1.5px] border-white/50 shadow-sm">
                 <Label className="text-xs font-black text-teal-900/70 uppercase tracking-widest mb-2 block">Upload Prescription (Optional)</Label>
                 <div className="relative overflow-hidden">
                   <input 
                      type="file" 
                      accept=".pdf,.jpg,.jpeg,.png" 
                      onChange={(e) => setPrescriptionFile(e.target.files[0])}
                      className="w-full text-xs font-bold text-teal-900 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-white/60 file:text-teal-950 hover:file:bg-white/80 file:shadow-sm file:transition-all cursor-pointer bg-white/30 rounded-xl border-[1.5px] border-white/60 backdrop-blur-md focus:outline-none"
                   />
                 </div>
                 <p className="text-[10px] font-bold text-teal-900/50 mt-2">Helps therapist understand your case better. PDF/JPG/PNG only.</p>
              </div>
            </div>
            
            <DialogFooter className="mt-8 flex gap-3 sm:justify-between">
               <Button variant="outline" onClick={() => setConfirmModalOpen(false)} className="flex-1 rounded-full h-12 bg-white/40 hover:bg-white/60 backdrop-blur-md border-[1.5px] border-white/60 text-teal-950 font-black shadow-sm transition-all">Cancel</Button>
               <Button onClick={confirmBooking} disabled={bookingInProgress} className="flex-1 rounded-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black shadow-[0_8px_20px_rgba(16,185,129,0.3)] transition-all">
                 {bookingInProgress ? "Booking..." : "Confirm Booking"}
               </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}