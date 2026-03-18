import React, { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { 
  Calendar, Clock, User, CheckCircle2, MapPin, Sparkles, 
  Activity, ArrowRight, Phone, Mail, FileText, Stethoscope, X 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Helper to normalize patient data safely
const normalizePatient = (raw = {}) => ({
  name: raw.name || raw.personalDetails?.name || "Unknown Patient",
  email: raw.email || "—",
  phone: raw.personalDetails?.contactNumber || raw.phone || "—",
  age: raw.personalDetails?.age || raw.healthProfile?.age || "—",
  gender: raw.personalDetails?.gender || "—",
  healthProfile: raw.healthProfile || {},
  prescriptionDetails: raw.prescriptionDetails || {}
});

export default function TodaySchedule() {
  const [todaySessions, setTodaySessions] = useState([]);
  const [tomorrowSessions, setTomorrowSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State for the View Profile Modal
  const [selectedSession, setSelectedSession] = useState(null);

  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        // Fetch FROM NEW ROUTE (Live Bookings from AssignedTherapy)
        const data = await apiGet("/api/assigned-therapies/therapist/schedule");
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const activeToday = [];
        const activeTomorrow = [];

        (data || []).forEach(session => {
          if (!session.startDate) return;

          // Parse Dates directly (ISO format from DB)
          const start = new Date(session.startDate);
          const end = new Date(session.endDate); 
          
          start.setHours(0,0,0,0);
          end.setHours(0,0,0,0);

          // Logic: If Today is within the range [Start, End]
          if (today >= start && today <= end) {
            const diffTime = Math.abs(today - start);
            const currentDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            activeToday.push({ 
              ...session, 
              currentDay, 
              totalDays: session.totalDays || session.duration || 1, 
              sessionDate: today,
              displayTime: session.appointmentTime || "09:00" 
            });
          }

          // Logic: If Tomorrow is within the range [Start, End]
          if (tomorrow >= start && tomorrow <= end) {
            const diffTime = Math.abs(tomorrow - start);
            const currentDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
            
            activeTomorrow.push({ 
              ...session, 
              currentDay, 
              totalDays: session.totalDays || session.duration || 1,
              sessionDate: tomorrow,
              displayTime: session.appointmentTime || "09:00"
            });
          }
        });

        const timeSorter = (a, b) => (a.displayTime || "").localeCompare(b.displayTime || "");
        
        setTodaySessions(activeToday.sort(timeSorter));
        setTomorrowSessions(activeTomorrow.sort(timeSorter));

      } catch (err) {
        console.error("Failed to load schedule:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSessions();
  }, []);

  const renderSessionCard = (s, isTomorrow = false) => (
    <div 
      key={s._id + (isTomorrow ? "_tom" : "_tod")} 
      className="group relative overflow-hidden rounded-[2rem] bg-white/20 backdrop-blur-[30px] border-[1.5px] border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_40px_rgba(20,184,166,0.15)] hover:border-white/80 transition-all duration-500 flex flex-col w-full"
      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)' }}
    >
      {/* Decorative Blob */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700 ${isTomorrow ? 'bg-indigo-400/20' : 'bg-teal-400/20'}`}></div>

      <div className="p-5 md:p-8 flex-1 flex flex-col relative z-10 w-full min-w-0">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div className="w-full sm:w-auto min-w-0">
            <div className="flex items-center gap-3 mb-1">
                <h3 className="text-xl sm:text-2xl font-black text-teal-950 tracking-tight leading-none drop-shadow-sm truncate">
                  {s.patientId?.name || "Unknown"}
                </h3>
                {!isTomorrow && (
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                  </span>
                )}
            </div>
            <p className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest flex items-center gap-1.5 mt-2 truncate">
              <Activity className="w-3.5 h-3.5 text-teal-700 shrink-0" />
              <span className="truncate">{s.therapyType} • Day {s.currentDay} / {s.totalDays}</span>
            </p>
          </div>
          
          <Badge className={`border-[1.5px] px-3 sm:px-4 py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest shadow-sm shrink-0 whitespace-nowrap ${isTomorrow ? "bg-indigo-500/10 text-indigo-900 border-indigo-400/50" : "bg-teal-500/10 text-teal-950 border-teal-400/50"}`}>
            {isTomorrow ? "Tomorrow" : "Today"} • {s.displayTime}
          </Badge>
        </div>

        <div className="space-y-4 w-full min-w-0">
          <div className="flex items-center justify-between p-3 sm:p-4 rounded-[1.5rem] bg-white/40 border-[1.5px] border-white/60 shadow-sm text-teal-950 w-full min-w-0">
            <div className="flex items-center gap-3 sm:gap-4 w-full min-w-0">
               <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shrink-0 border border-white/80 shadow-inner">
                 <User className="w-5 h-5 text-teal-700" />
               </div>
               <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-black text-[10px] sm:text-xs uppercase tracking-widest text-teal-900/60 mb-0.5">Patient Contact</span>
                  <span className="font-bold text-xs sm:text-sm truncate block w-full" title={s.patientId?.email || "No email provided"}>
                    {s.patientId?.email || "No email provided"}
                  </span>
               </div>
            </div>
          </div>
          
          <div className="flex flex-row items-center justify-between pt-2 gap-2">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-800 bg-emerald-400/20 px-2 sm:px-3 py-1.5 rounded-lg border border-emerald-400/30 shadow-sm shrink-0 whitespace-nowrap">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0" />
              <span>Confirmed</span>
            </div>
            {/* Functional View Profile Button */}
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setSelectedSession(s)}
              className="bg-white/50 hover:bg-white/70 border-[1.5px] border-white/70 text-teal-950 shadow-sm transition-all h-8 sm:h-9 px-3 sm:px-4 rounded-xl font-black text-[9px] sm:text-xs uppercase tracking-widest group-hover:shadow-md shrink-0 whitespace-nowrap"
            >
              View Profile <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1 sm:ml-1.5 shrink-0" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="p-12 text-center text-teal-900 font-black text-xl tracking-widest uppercase animate-pulse">Loading schedule...</div>;

  return (
    <div className="relative w-full space-y-8 sm:space-y-10 animate-in fade-in duration-700">
      
      {/* ZERO SESSIONS STATE */}
      {todaySessions.length === 0 && tomorrowSessions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4 bg-white/20 backdrop-blur-[40px] rounded-[2rem] sm:rounded-[3rem] border-[1.5px] border-white/50 shadow-[0_10px_40px_rgba(0,0,0,0.05)] relative overflow-hidden text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/40 border-[1.5px] border-white/70 rounded-2xl sm:rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.1)] relative z-10 animate-[bounce_3s_ease-in-out_infinite]">
            <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-teal-600 drop-shadow-sm" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-teal-950 mb-2 relative z-10">Clear Schedule</h3>
          <p className="text-teal-900/70 font-bold uppercase tracking-widest text-xs sm:text-sm relative z-10 text-center max-w-md">You have no sessions scheduled for today or tomorrow. Enjoy your time off!</p>
        </div>
      )}

      {/* Today's Section */}
      {todaySessions.length > 0 && (
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-teal-950 flex items-center gap-2 sm:gap-3 drop-shadow-sm uppercase tracking-widest pl-1 sm:pl-2">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-teal-700" />
              Today
            </h2>
            <Badge className="bg-white/40 border-[1.5px] border-white/60 text-teal-950 shadow-sm px-3 sm:px-4 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              {todaySessions.length} Active
            </Badge>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {todaySessions.map(s => renderSessionCard(s, false))}
          </div>
        </div>
      )}

      {/* Tomorrow's Section */}
      {tomorrowSessions.length > 0 && (
        <div className="space-y-4 sm:space-y-6 pt-6 border-t-[1.5px] border-white/30">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-black text-indigo-950 flex items-center gap-2 sm:gap-3 drop-shadow-sm uppercase tracking-widest pl-1 sm:pl-2">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-700" />
              Tomorrow
            </h3>
            <Badge className="bg-white/40 border-[1.5px] border-white/60 text-indigo-950 shadow-sm px-3 sm:px-4 py-1 sm:py-1.5 text-[9px] sm:text-[10px] font-black uppercase tracking-widest backdrop-blur-md">
              {tomorrowSessions.length} Upcoming
            </Badge>
          </div>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {tomorrowSessions.map(s => renderSessionCard(s, true))}
          </div>
        </div>
      )}

      {/* Profile Modal */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-3xl w-[95vw] sm:w-[90vw] max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 bg-white/30 backdrop-blur-[50px] border-[1.5px] border-white/60 shadow-[0_30px_80px_rgba(0,0,0,0.3)] rounded-[2rem] sm:rounded-[3rem] [&::-webkit-scrollbar]:hidden z-[100] [&>button]:hidden">
          
          {selectedSession && (() => {
            const p = normalizePatient(selectedSession.patientId);
            
            return (
              <div className="relative">
                {/* Header Section */}
                <div className="p-6 sm:p-8 md:p-10 border-b border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 relative overflow-hidden bg-white/10" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(255,255,255,0.05) 100%)' }}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-[60px] pointer-events-none -z-10"></div>
                  
                  <div className="flex items-center gap-4 sm:gap-6 relative z-10 w-full pr-8 sm:pr-0 min-w-0">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-[1.25rem] sm:rounded-[1.5rem] bg-white/40 border-[1.5px] border-white/70 flex items-center justify-center text-2xl sm:text-3xl font-black text-teal-950 shadow-[0_8px_25px_rgba(20,184,166,0.15)] shrink-0 backdrop-blur-md">
                      {p.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <DialogTitle className="text-xl sm:text-3xl font-black text-teal-950 tracking-tight leading-none mb-2 sm:mb-3 drop-shadow-sm truncate">{p.name}</DialogTitle>
                      <div className="flex flex-wrap gap-2 sm:gap-3 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-teal-900/70">
                        <span className="flex items-center gap-1 sm:gap-1.5 bg-white/50 px-2 sm:px-3 py-1 rounded-md border border-white/60 shadow-sm"><Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5"/> {p.phone}</span>
                        <span className="flex items-center gap-1 sm:gap-1.5 bg-white/50 px-2 sm:px-3 py-1 rounded-md border border-white/60 shadow-sm max-w-full"><Mail className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 mt-0.5"/> <span className="truncate">{p.email}</span></span>
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={() => setSelectedSession(null)} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-teal-900 hover:text-teal-950 transition-colors bg-white/40 rounded-full p-2 sm:p-2.5 backdrop-blur-md border border-white/50 shadow-sm z-50">
                     <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                {/* Body Section */}
                <div className="p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-8 relative z-10">
                  
                  <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                    
                    {/* Personal & Health Info */}
                    <div className="space-y-6">
                      <div className="bg-white/40 backdrop-blur-md p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-[1.5px] border-white/60 shadow-sm">
                        <h4 className="text-base sm:text-lg font-black text-teal-950 uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 border-b-[1.5px] border-white/50 pb-3 sm:pb-4">
                          <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-teal-700"/> Health Profile
                        </h4>
                        
                        <div className="space-y-3 sm:space-y-5">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 bg-white/30 p-3 sm:p-4 rounded-xl sm:rounded-[1.25rem] border border-white/50">
                            <span className="text-[9px] sm:text-[10px] font-black text-teal-900/60 uppercase tracking-widest">Gender / Age</span>
                            <span className="font-black text-xs sm:text-sm text-teal-950">{p.gender}, {p.age}</span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 bg-white/30 p-3 sm:p-4 rounded-xl sm:rounded-[1.25rem] border border-white/50">
                            <span className="text-[9px] sm:text-[10px] font-black text-teal-900/60 uppercase tracking-widest">Prakriti</span>
                            <Badge className="bg-teal-500/20 text-teal-950 border border-teal-400/50 shadow-none px-2 sm:px-3 py-0.5 sm:py-1 uppercase tracking-widest text-[8px] sm:text-[9px] w-fit">{p.healthProfile?.prakritiType || "—"}</Badge>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 bg-white/30 p-3 sm:p-4 rounded-xl sm:rounded-[1.25rem] border border-white/50">
                            <span className="text-[9px] sm:text-[10px] font-black text-teal-900/60 uppercase tracking-widest">Dosha</span>
                            <span className="font-black text-xs sm:text-sm text-rose-700">{p.healthProfile?.doshaImbalance || "—"}</span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0 bg-white/30 p-3 sm:p-4 rounded-xl sm:rounded-[1.25rem] border border-white/50">
                            <span className="text-[9px] sm:text-[10px] font-black text-teal-900/60 uppercase tracking-widest">Allergies</span>
                            <span className="font-black text-xs sm:text-sm text-rose-700">{p.healthProfile?.allergies || "—"}</span>
                          </div>
                          
                          <div className="bg-white/30 p-4 sm:p-5 rounded-xl sm:rounded-[1.5rem] border border-white/50">
                            <span className="text-[9px] sm:text-[10px] font-black text-teal-900/60 uppercase tracking-widest block mb-1.5 sm:mb-2">Medical History</span>
                            <p className="font-bold text-xs sm:text-sm text-teal-950 leading-relaxed italic">
                              {p.healthProfile?.medicalHistory || "None recorded."}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Therapy Info */}
                    <div className="space-y-6 sm:space-y-8">
                      {/* Current Session */}
                      <div className="bg-white/40 backdrop-blur-md p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-[1.5px] border-white/60 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                        
                        <h4 className="text-base sm:text-lg font-black text-teal-950 uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 border-b-[1.5px] border-white/50 pb-3 sm:pb-4 relative z-10">
                          <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600"/> Current Session
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5 relative z-10">
                          <div className="bg-indigo-500/10 border-[1.5px] border-indigo-400/30 p-3 sm:p-4 rounded-xl sm:rounded-[1.25rem] text-center shadow-sm min-w-0">
                            <div className="text-[8px] sm:text-[9px] text-indigo-900/70 font-black uppercase tracking-widest mb-0.5 sm:mb-1">Therapy</div>
                            <div className="text-indigo-950 font-black text-xs sm:text-sm truncate px-1">{selectedSession.therapyType || "—"}</div>
                          </div>
                          <div className="bg-emerald-500/10 border-[1.5px] border-emerald-400/30 p-3 sm:p-4 rounded-xl sm:rounded-[1.25rem] text-center shadow-sm min-w-0">
                            <div className="text-[8px] sm:text-[9px] text-emerald-900/70 font-black uppercase tracking-widest mb-0.5 sm:mb-1">Progress</div>
                            <div className="text-emerald-950 font-black text-xs sm:text-sm truncate px-1">Day {selectedSession.currentDay} / {selectedSession.totalDays}</div>
                          </div>
                        </div>
                        
                        <div className="bg-white/50 p-3 sm:p-4 rounded-xl sm:rounded-[1.25rem] flex flex-col gap-2 sm:gap-3 border border-white/70 shadow-sm relative z-10">
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-teal-900/70"><Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5"/> Date</div>
                             <div className="font-black text-xs sm:text-sm text-teal-950">{selectedSession.sessionDate ? new Date(selectedSession.sessionDate).toLocaleDateString("en-IN") : "—"}</div>
                           </div>
                           <div className="h-[1px] w-full bg-white/60"></div>
                           <div className="flex items-center justify-between">
                             <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-teal-900/70"><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5"/> Time</div>
                             <div className="font-black text-xs sm:text-sm text-teal-950">{selectedSession.displayTime || "—"}</div>
                           </div>
                        </div>
                      </div>

                      {/* Prescriptions */}
                      <div className="bg-white/40 backdrop-blur-md p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-[1.5px] border-white/60 shadow-sm">
                        <h4 className="text-base sm:text-lg font-black text-teal-950 uppercase tracking-widest mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3 border-b-[1.5px] border-white/50 pb-3 sm:pb-4">
                          <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600"/> Prescriptions
                        </h4>
                        
                        {Array.isArray(p.prescriptionDetails?.therapies) && p.prescriptionDetails.therapies.length > 0 ? (
                          <div className="space-y-2 sm:space-y-3">
                            {p.prescriptionDetails.therapies.map((t, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 sm:p-4 bg-white/50 rounded-xl sm:rounded-[1.25rem] border border-white/70 shadow-sm gap-2">
                                <span className="font-black text-xs sm:text-sm text-teal-950 truncate">{t.therapy || "Therapy"}</span>
                                <Badge className="bg-amber-500/20 text-amber-950 border border-amber-400/50 shadow-none px-2 sm:px-3 py-0.5 sm:py-1 uppercase tracking-widest text-[8px] sm:text-[9px] shrink-0 whitespace-nowrap">{t.duration || "—"}</Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 sm:py-6 text-teal-900/50 text-[10px] sm:text-xs font-bold uppercase tracking-widest bg-white/30 rounded-xl sm:rounded-2xl border border-dashed border-white/60">
                             No prescriptions found.
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
                
                {/* Footer Button */}
                <div className="p-4 sm:p-8 bg-white/20 border-t-[1.5px] border-white/40 flex justify-center sm:justify-end">
                   <Button 
                     onClick={() => setSelectedSession(null)} 
                     className="w-full sm:w-auto bg-white/60 hover:bg-white/80 border-[1.5px] border-white/80 text-teal-950 shadow-sm h-12 px-8 rounded-full font-black uppercase tracking-widest transition-all hover:-translate-y-0.5"
                   >
                     Close Profile
                   </Button>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

    </div>
  );
}