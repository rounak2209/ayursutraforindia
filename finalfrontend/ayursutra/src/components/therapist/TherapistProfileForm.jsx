import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Clock, Upload, Stethoscope, MapPin, Phone, User, Activity, Banknote, CalendarDays } from "lucide-react";
import { apiGet, apiPut, apiPutMultipart } from "@/lib/api"; 
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TherapistProfileForm = ({ onProfileComplete }) => {
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    specializations: [],
    therapyDurations: {}, 
    workingDays: [],
    startTime: "09:00",
    endTime: "17:00",
    phone: "",
    bio: "",
    money: "",
    experience: "",
    profilePic: null 
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [specInput, setSpecInput] = useState("");
  const navigate = useNavigate();

  const AVAILABLE_THERAPIES = ["Nasya", "Vamana", "Virechana", "Basti", "Raktamokshana", "Shirodhara", "Abhyanga"];
  const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

  useEffect(() => {
    const load = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      try {
        const data = await apiGet(`/api/therapists/profile/${userId}`);
        if (data) {
          setFormData(prev => ({
            ...prev,
            ...data,
            therapyDurations: data.therapyDurations || {},
            profilePic: null 
          }));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, profilePic: e.target.files[0] });
    }
  };

  const toggleDay = (day) => {
    setFormData(prev => {
      const days = prev.workingDays.includes(day) ? prev.workingDays.filter(d => d !== day) : [...prev.workingDays, day];
      return { ...prev, workingDays: days };
    });
  };

  const addSpecialization = () => {
    if (specInput && !formData.specializations.includes(specInput)) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, specInput],
        therapyDurations: { ...prev.therapyDurations, [specInput]: 60 }
      }));
      setSpecInput("");
    }
  };

  const removeSpecialization = (spec) => {
    setFormData(prev => {
      const newDurations = { ...prev.therapyDurations };
      delete newDurations[spec];
      return {
        ...prev,
        specializations: prev.specializations.filter(s => s !== spec),
        therapyDurations: newDurations
      };
    });
  };

  const updateDuration = (therapy, minutes) => {
    setFormData(prev => ({ ...prev, therapyDurations: { ...prev.therapyDurations, [therapy]: parseInt(minutes) } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const userId = localStorage.getItem("userId");
    
    try {
      if (formData.profilePic instanceof File) {
         const fileData = new FormData();
         fileData.append("profilePic", formData.profilePic);
         
         await apiPutMultipart(`/api/therapists/profile/${userId}`, fileData);
      }

      const jsonPayload = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        startTime: formData.startTime,
        endTime: formData.endTime,
        experience: formData.experience,
        money: formData.money,
        bio: formData.bio,
        profileStatus: "completed",
        specializations: formData.specializations,
        workingDays: formData.workingDays,
        therapyDurations: formData.therapyDurations
      };

      await apiPut(`/api/therapists/profile/${userId}`, jsonPayload);

      if (onProfileComplete) onProfileComplete();
      else navigate("/therapist/dashboard");

    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-teal-800 font-black uppercase tracking-widest animate-pulse bg-transparent">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center py-12 px-4 relative overflow-hidden">
      
      <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-teal-400/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-emerald-400/20 rounded-full blur-[80px] pointer-events-none"></div>
      
      <div className="text-center mb-10 relative z-10">
         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/40 border-[1.5px] border-white/70 shadow-sm backdrop-blur-md mb-4">
             <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
             <span className="text-teal-950 font-extrabold text-[10px] tracking-widest uppercase">Professional Setup</span>
         </div>
         <h1 className="text-4xl md:text-5xl font-black text-teal-950 tracking-tight drop-shadow-md">Profile Configuration</h1>
         <p className="text-teal-900/70 font-bold mt-2">Personalize your therapy offerings and schedule.</p>
      </div>

      <div className="w-full max-w-4xl bg-white/20 backdrop-blur-[40px] border-[1.5px] border-white/50 shadow-[0_30px_80px_rgba(20,184,166,0.15)] rounded-[3rem] p-8 md:p-12 relative z-10" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)' }}>
        <form onSubmit={handleSubmit} className="space-y-10">
          
          <div className="flex flex-col items-center gap-4 relative">
             <div className="w-36 h-36 bg-white/40 backdrop-blur-xl rounded-[2rem] flex items-center justify-center overflow-hidden border-[2px] border-white/70 shadow-[0_10px_30px_rgba(20,184,166,0.15)] relative group transition-all duration-300 hover:scale-105 hover:border-teal-400">
                {formData.profilePic ? (
                    <img src={URL.createObjectURL(formData.profilePic)} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <User className="w-14 h-14 text-teal-800/40" />
                )}
                <label htmlFor="t-pic" className="absolute inset-0 bg-white/60 flex flex-col items-center justify-center text-teal-950 opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300 backdrop-blur-md">
                   <Upload className="w-6 h-6 mb-1 text-teal-700" />
                   <span className="text-[10px] font-black uppercase tracking-widest">Upload</span>
                </label>
             </div>
             <Input id="t-pic" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
             <div className="text-center">
               <h3 className="text-teal-950 font-black text-xl drop-shadow-sm">Profile Picture</h3>
               <p className="text-[10px] text-teal-900/50 font-bold uppercase tracking-widest">JPG, PNG, max 5MB</p>
             </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
               <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Full Name</Label>
               <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-700/50" />
                  <Input name="name" value={formData.name} onChange={handleChange} required className="h-14 bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-black text-base pl-12 rounded-[1.25rem] focus:bg-white/80 focus:border-teal-400 transition-all placeholder:text-teal-900/40 shadow-sm" placeholder="Dr. John Doe" />
               </div>
            </div>
            
            <div className="space-y-3">
               <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Phone Number</Label>
               <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-700/50" />
                  <Input name="phone" value={formData.phone} onChange={handleChange} required className="h-14 bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-black text-base pl-12 rounded-[1.25rem] focus:bg-white/80 focus:border-teal-400 transition-all placeholder:text-teal-900/40 shadow-sm" placeholder="+91 9876543210" />
               </div>
            </div>

            <div className="md:col-span-2 space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Location / Clinic Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-700/50" />
                  <Input name="location" value={formData.location} onChange={handleChange} required className="h-14 bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-black text-base pl-12 rounded-[1.25rem] focus:bg-white/80 focus:border-teal-400 transition-all placeholder:text-teal-900/40 shadow-sm" placeholder="e.g. 123 Wellness Center, MG Road, Bangalore" />
                </div>
            </div>
          </div>

          <div className="bg-white/30 border-[1.5px] border-white/50 p-6 md:p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/20 rounded-full blur-[30px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
             
             <Label className="text-lg font-black text-teal-950 mb-6 flex items-center gap-3 drop-shadow-sm border-b-[1.5px] border-white/40 pb-4">
                <Stethoscope className="w-6 h-6 text-teal-600"/> Therapies & Durations
             </Label>
             
             <div className="flex flex-col sm:flex-row gap-3 mb-6 relative z-10">
              <Select onValueChange={(val) => setSpecInput(val)}>
                <SelectTrigger className="h-14 bg-white/50 hover:bg-white/70 border-[1.5px] border-white/70 text-teal-950 font-black rounded-[1.25rem] focus:ring-2 focus:ring-teal-400 transition-all w-full sm:w-[250px] shadow-sm">
                   <SelectValue placeholder="Select Therapy" />
                </SelectTrigger>
                <SelectContent className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-2xl shadow-xl">
                   {AVAILABLE_THERAPIES.map(t => <SelectItem key={t} value={t} className="text-teal-950 font-bold focus:bg-teal-100">{t}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addSpecialization} className="h-14 px-8 rounded-[1.25rem] bg-teal-600 hover:bg-teal-500 text-white font-black uppercase tracking-widest shadow-[0_4px_15px_rgba(20,184,166,0.3)] transition-all w-full sm:w-auto hover:-translate-y-0.5">
                 <Plus className="w-5 h-5 mr-2" /> Add
              </Button>
            </div>

            <div className="space-y-3 relative z-10">
              {formData.specializations.length === 0 && (
                <div className="text-center py-6 text-teal-900/40 font-black uppercase tracking-widest text-[10px] border-[2px] border-dashed border-white/60 rounded-xl bg-white/20">No therapies added yet.</div>
              )}
              {formData.specializations.map(spec => (
                <div key={spec} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/50 p-4 rounded-[1.5rem] border-[1.5px] border-white/70 shadow-sm hover:bg-white/70 transition-colors gap-4">
                  <span className="font-black text-teal-950 flex items-center gap-3">
                     <span className="w-2.5 h-2.5 rounded-full bg-teal-500 shadow-sm"></span> {spec}
                  </span>
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <div className="flex items-center gap-3 bg-white/60 px-4 py-2 rounded-xl border border-white/80 w-full sm:w-auto shadow-inner">
                      <Clock className="w-4 h-4 text-teal-700" />
                      <Select value={String(formData.therapyDurations[spec] || 60)} onValueChange={(val) => updateDuration(spec, val)}>
                        <SelectTrigger className="h-8 w-full sm:w-[120px] text-xs font-black text-teal-950 border-0 bg-transparent focus:ring-0 shadow-none px-0">
                           <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white/90 backdrop-blur-xl border border-white/80 rounded-xl shadow-xl">
                          <SelectItem value="30" className="text-teal-950 font-bold focus:bg-teal-100">30 mins</SelectItem>
                          <SelectItem value="60" className="text-teal-950 font-bold focus:bg-teal-100">60 mins</SelectItem>
                          <SelectItem value="90" className="text-teal-950 font-bold focus:bg-teal-100">90 mins</SelectItem>
                          <SelectItem value="120" className="text-teal-950 font-bold focus:bg-teal-100">120 mins</SelectItem>
                          <SelectItem value="150" className="text-teal-950 font-bold focus:bg-teal-100">150 mins</SelectItem>
                          <SelectItem value="180" className="text-teal-950 font-bold focus:bg-teal-100">180 mins</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="ghost" size="icon" type="button" onClick={() => removeSpecialization(spec)} className="text-rose-500 hover:text-rose-700 hover:bg-rose-500/20 rounded-xl shrink-0 h-10 w-10 border border-transparent hover:border-rose-400/50 bg-white/40 transition-all">
                       <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-3">
               <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Start Time</Label>
               <Input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="h-14 bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-black text-lg px-6 rounded-[1.25rem] focus:bg-white/80 focus:border-teal-400 transition-all shadow-sm" />
            </div>
            <div className="space-y-3">
               <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">End Time</Label>
               <Input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className="h-14 bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-black text-lg px-6 rounded-[1.25rem] focus:bg-white/80 focus:border-teal-400 transition-all shadow-sm" />
            </div>
          </div>

          <div className="bg-white/30 border-[1.5px] border-white/50 p-6 md:p-8 rounded-[2rem] shadow-sm relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-indigo-400/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
            <Label className="text-lg font-black text-teal-950 mb-6 flex items-center gap-3 drop-shadow-sm border-b-[1.5px] border-white/40 pb-4 relative z-10">
               <CalendarDays className="w-6 h-6 text-indigo-600"/> Operating Days
            </Label>
            <div className="flex flex-wrap gap-3 relative z-10">
              {daysOfWeek.map(day => (
                <div 
                  key={day} 
                  className={`cursor-pointer px-5 py-3 rounded-xl border-[1.5px] font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-sm
                    ${formData.workingDays.includes(day) 
                      ? "bg-indigo-500/20 border-indigo-400/50 text-indigo-950 shadow-[0_0_15px_rgba(99,102,241,0.2)] scale-105" 
                      : "bg-white/40 border-white/60 text-teal-900/50 hover:bg-white/60 hover:text-teal-950"
                    }`} 
                  onClick={() => toggleDay(day)}
                >
                  {day.slice(0,3)}
                </div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Experience (Years)</Label>
                <div className="relative">
                  <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-700/50" />
                  <Input type="number" name="experience" value={formData.experience} onChange={handleChange} className="h-14 bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-black text-base pl-12 rounded-[1.25rem] focus:bg-white/80 focus:border-teal-400 transition-all placeholder:text-teal-900/40 shadow-sm" placeholder="0" />
                </div>
             </div>
             <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Session Fee (₹)</Label>
                <div className="relative">
                  <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-700/50" />
                  <Input type="number" name="money" value={formData.money} onChange={handleChange} className="h-14 bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-black text-base pl-12 rounded-[1.25rem] focus:bg-white/80 focus:border-teal-400 transition-all placeholder:text-teal-900/40 shadow-sm" placeholder="1000" />
                </div>
             </div>
          </div>

          <div className="space-y-3">
             <Label className="text-[10px] font-black uppercase tracking-widest text-teal-900/60 pl-2">Professional Bio</Label>
             <Textarea name="bio" value={formData.bio} onChange={handleChange} placeholder="Describe your expertise, approach, and philosophy..." className="bg-white/50 border-[1.5px] border-white/70 text-teal-950 font-bold text-base p-6 rounded-[1.5rem] focus:bg-white/80 focus:border-teal-400 transition-all placeholder:text-teal-900/40 shadow-sm min-h-[150px] resize-none" />
          </div>

          <div className="pt-6 border-t-[1.5px] border-white/40">
            <Button type="submit" disabled={saving} className="w-full h-16 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-black text-lg uppercase tracking-widest shadow-[0_10px_30px_rgba(20,184,166,0.3)] transition-all hover:scale-[1.02] hover:-translate-y-1">
              {saving ? "Processing..." : "Save Profile & Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TherapistProfileForm;