import React, { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, Clock, CheckCircle, Calendar, 
  Sparkles, Stethoscope, User, ArrowRight, Activity,
  CheckCircle2, Banknote, History, X
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AssignedTherapies() {
  const [therapies, setTherapies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTherapy, setSelectedTherapy] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
          setTherapies([]);
          return;
        }

        const data = await apiGet(`/api/assigned-therapies/patients/${userId}`);

        const normalized = (data || []).map((t, idx) => {
          const therapistInfo = t.therapistId || {};
          
          return {
            id: t._id || `therapy-${idx}`,
            name: t.therapyName, 
            status: t.status || "ongoing",
            startDate: t.startDate ? t.startDate.split("T")[0] : null,
            endDate: t.endDate ? t.endDate.split("T")[0] : null,
            therapist: therapistInfo.name || t.therapistName || "-",
            duration: t.duration || "—",
            sessionFee: t.sessionFee || "0", 
            sessionsCompleted: t.sessionsCompleted || 0,
            timeSlot: t.timeSlot || "—",
            completedDates: t.completedDates || [] 
          };
        });

        setTherapies(normalized);
      } catch (err) {
        console.error("AssignedTherapies load error:", err);
        toast({
          title: "Could not load therapies",
          variant: "destructive"
        });
        setTherapies([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getStatusStyles = (status) => {
    switch(status?.toLowerCase()) {
      case "completed": return "bg-emerald-500/20 text-emerald-900 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
      case "scheduled": return "bg-blue-500/20 text-blue-900 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]";
      default: return "bg-amber-500/20 text-amber-900 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse";
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[40vh] text-teal-800 animate-pulse font-black tracking-widest uppercase">
      Loading your therapy plan...
    </div>
  );

  return (
    <div className="relative animate-in fade-in duration-700 w-full max-w-7xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border-[1.5px] border-white/70 shadow-sm backdrop-blur-md mb-3">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
             <span className="text-teal-900 font-extrabold text-[10px] tracking-widest uppercase">Treatment Protocol</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-teal-950 flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-white/50 backdrop-blur-xl rounded-2xl border-[1.5px] border-white/70 flex items-center justify-center shadow-sm">
               <Sparkles className="w-6 h-6 text-teal-600" />
            </div>
            Therapy Plan
          </h2>
        </div>
        <div className="px-5 py-2.5 bg-white/40 backdrop-blur-md border-[1.5px] border-white/70 shadow-sm rounded-full text-teal-900 font-black text-sm tracking-wide">
          {therapies.length} Prescribed
        </div>
      </div>

      {therapies.length === 0 && (
        <div className="bg-white/20 backdrop-blur-[40px] rounded-[3rem] p-16 text-center border-[1.5px] border-white/60 shadow-[0_10px_40px_rgba(0,0,0,0.05)]">
          <div className="w-24 h-24 bg-white/50 border-[1.5px] border-white/80 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-[bounce_3s_ease-in-out_infinite]">
            <Heart className="w-12 h-12 text-rose-500" />
          </div>
          <h3 className="text-3xl font-black text-teal-950 mb-3">No Therapies Assigned</h3>
          <p className="text-teal-900/70 font-bold text-lg max-w-md mx-auto">
            Your wellness plan is currently empty. Consult with a doctor to get a prescribed plan.
          </p>
        </div>
      )}

      {}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {therapies.map((therapy) => (
          <div 
            key={therapy.id}
            onClick={() => setSelectedTherapy(therapy)}
            className="group relative overflow-hidden rounded-[2.5rem] bg-white/10 backdrop-blur-[30px] border-[1.5px] border-white/50 hover:border-white/80 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.1)] hover:shadow-[0_25px_50px_-12px_rgba(20,184,166,0.25)] hover:-translate-y-2 transition-all duration-500 p-6 flex flex-col cursor-pointer"
            style={{ 
               background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)'
            }}
          >
            
            {/* Top Section - Profile / Icon style from image */}
            <div className="flex flex-col items-center text-center mb-6 pt-4">
               <div className="w-20 h-20 rounded-full bg-white/30 border-[2px] border-white/80 shadow-[0_8px_20px_rgba(0,0,0,0.1)] flex items-center justify-center mb-4 relative overflow-hidden group-hover:scale-105 transition-transform duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-300/30 to-emerald-300/30 backdrop-blur-md"></div>
                  <Activity className="w-8 h-8 text-teal-900 relative z-10 drop-shadow-sm" />
               </div>
               <h3 className="text-2xl font-black text-teal-950 leading-tight mb-1 group-hover:text-teal-800 transition-colors">
                  {therapy.name}
               </h3>
               <p className="text-sm font-bold text-teal-900/70 uppercase tracking-widest">
                  {therapy.duration} Days Plan
               </p>
            </div>

            {/* Stats Grid style from image with strong borders */}
            <div className="grid grid-cols-2 gap-3 mb-3">
               <div className="bg-white/20 group-hover:bg-white/30 transition-colors duration-500 backdrop-blur-md border-[1.5px] border-white/50 group-hover:border-white/70 rounded-[1.25rem] p-4 text-center shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
                  <p className="text-2xl font-black text-teal-950 drop-shadow-sm">{therapy.sessionsCompleted}</p>
                  <p className="text-[10px] font-bold text-teal-900/70 uppercase tracking-widest mt-1">Completed</p>
               </div>
               <div className="bg-white/20 group-hover:bg-white/30 transition-colors duration-500 backdrop-blur-md border-[1.5px] border-white/50 group-hover:border-white/70 rounded-[1.25rem] p-4 text-center shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
                  <p className="text-2xl font-black text-teal-950 drop-shadow-sm">{therapy.timeSlot || "--:--"}</p>
                  <p className="text-[10px] font-bold text-teal-900/70 uppercase tracking-widest mt-1">Time Slot</p>
               </div>
            </div>

            {/* Bottom details style from image with strong borders */}
            <div className="grid grid-cols-2 gap-3 mb-6">
               <div className="bg-white/20 group-hover:bg-white/30 transition-colors duration-500 backdrop-blur-md border-[1.5px] border-white/50 group-hover:border-white/70 rounded-[1.25rem] py-3 px-2 text-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex items-center justify-center gap-2">
                  <User className="w-4 h-4 text-teal-800" />
                  <span className="text-xs font-bold text-teal-950 truncate max-w-[80px]">{therapy.therapist}</span>
               </div>
               <div className={`backdrop-blur-md border-[1.5px] rounded-[1.25rem] py-3 px-2 text-center shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex items-center justify-center ${getStatusStyles(therapy.status)}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest truncate">{therapy.status}</span>
               </div>
            </div>

            {/* Button style from image with prominent border */}
            <div className="mt-auto pt-2">
               <div className="w-full py-4 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-md border-[1.5px] border-white/60 text-teal-950 font-black text-sm tracking-wide shadow-[0_4px_15px_rgba(0,0,0,0.05)] flex items-center justify-center gap-2 transition-all duration-300 group-hover:shadow-[0_8px_20px_rgba(20,184,166,0.15)] group-hover:border-white/90">
                  <ArrowRight className="w-4 h-4" /> View Details
               </div>
            </div>

          </div>
        ))}
      </div>

      {/* ===== DETAILS OVERLAY (Modal) ===== */}
      {selectedTherapy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-teal-950/50 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white/20 backdrop-blur-[50px] border-[1.5px] border-white/60 rounded-[3rem] shadow-[0_30px_80px_rgba(0,0,0,0.3)] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] relative">
            
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/40 to-transparent pointer-events-none"></div>

            <div className="p-8 pb-4 relative z-10 flex justify-between items-start border-b border-white/30">
              <div>
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border-[1.5px] border-white/70 shadow-sm backdrop-blur-md mb-3">
                   <Stethoscope className="w-3 h-3 text-teal-900" />
                   <span className="text-teal-950 font-extrabold text-[10px] tracking-widest uppercase">Therapy Details</span>
                 </div>
                 <h3 className="text-3xl font-black text-teal-950 tracking-tight leading-none drop-shadow-sm">
                   {selectedTherapy.name}
                 </h3>
              </div>
              <button 
                onClick={() => setSelectedTherapy(null)}
                className="bg-white/40 hover:bg-white/60 text-teal-950 border-[1.5px] border-white/70 rounded-full p-2.5 transition-all shadow-sm hover:rotate-90 hover:scale-110"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 pt-4 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden relative z-10">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/20 backdrop-blur-md border-[1.5px] border-white/60 p-5 rounded-[1.5rem] shadow-sm hover:bg-white/30 transition-colors">
                  <p className="text-[10px] font-black text-teal-950/60 uppercase tracking-widest mb-1.5">Status</p>
                  <div className={`w-fit px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border-[1.5px] ${getStatusStyles(selectedTherapy.status)}`}>
                    {selectedTherapy.status}
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur-md border-[1.5px] border-white/60 p-5 rounded-[1.5rem] shadow-sm hover:bg-white/30 transition-colors">
                  <p className="text-[10px] font-black text-teal-950/60 uppercase tracking-widest mb-1">Assigned To</p>
                  <p className="font-black text-teal-950 flex items-center gap-2 truncate">
                    <User className="w-4 h-4 text-teal-800 shrink-0" />
                    <span className="truncate">{selectedTherapy.therapist}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 backdrop-blur-md border-[1.5px] border-white/60 p-5 rounded-[1.5rem] shadow-sm hover:bg-white/30 transition-colors">
                    <p className="text-[10px] font-black text-teal-950/60 uppercase tracking-widest mb-1">Sessions Done</p>
                    <p className="font-black text-teal-950 text-2xl flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                      {selectedTherapy.sessionsCompleted}
                    </p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-md border-[1.5px] border-white/60 p-5 rounded-[1.5rem] shadow-sm hover:bg-white/30 transition-colors">
                    <p className="text-[10px] font-black text-teal-950/60 uppercase tracking-widest mb-1">Session Fee</p>
                    <p className="font-black text-teal-950 text-2xl flex items-center gap-1">
                      <Banknote className="w-5 h-5 text-emerald-700" />
                      {selectedTherapy.sessionFee}
                    </p>
                  </div>
              </div>

              <div className="bg-white/20 backdrop-blur-md border-[1.5px] border-white/60 p-6 rounded-[2rem] shadow-sm relative overflow-hidden group hover:bg-white/30 transition-colors">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl pointer-events-none"></div>
                <h4 className="font-black text-teal-950 mb-5 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-800" /> Timeline & Slot
                </h4>
                
                <div className="flex items-center justify-between relative mb-5">
                   <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white/60 shadow-sm -z-10"></div>
                   
                   <div className="bg-white/50 backdrop-blur-md p-3 rounded-xl border-[1.5px] border-white/80 shadow-sm text-center z-10 w-[45%]">
                      <p className="text-[10px] text-teal-950/70 font-black uppercase tracking-widest">Start</p>
                      <p className="font-black text-teal-950 text-sm mt-0.5">{selectedTherapy.startDate || "?"}</p>
                   </div>
                   <div className="bg-white/50 backdrop-blur-md p-3 rounded-xl border-[1.5px] border-white/80 shadow-sm text-center z-10 w-[45%]">
                      <p className="text-[10px] text-teal-950/70 font-black uppercase tracking-widest">End</p>
                      <p className="font-black text-teal-950 text-sm mt-0.5">{selectedTherapy.endDate || "?"}</p>
                   </div>
                </div>
                
                <div className="bg-white/40 backdrop-blur-md p-4 rounded-[1.5rem] border-[1.5px] border-white/70 shadow-sm flex justify-between items-center">
                    <p className="text-xs text-teal-950/70 font-black uppercase tracking-widest">Daily Slot</p>
                    <p className="font-black text-teal-950 text-xl">{selectedTherapy.timeSlot}</p>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-md border-[1.5px] border-white/60 p-6 rounded-[2rem] shadow-sm">
                 <h4 className="font-black text-teal-950 mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-teal-800" /> Session History
                 </h4>
                 
                 {selectedTherapy.completedDates && selectedTherapy.completedDates.length > 0 ? (
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/60 [&::-webkit-scrollbar-thumb]:rounded-full">
                       {selectedTherapy.completedDates.map((dateStr, i) => (
                          <div key={i} className="flex items-center justify-between bg-white/40 backdrop-blur-md p-4 rounded-[1.25rem] border-[1.5px] border-white/70 shadow-sm hover:bg-white/50 transition-colors">
                             <span className="text-xs font-black text-teal-950/70 uppercase tracking-widest">
                                Session {i + 1}
                             </span>
                             <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-teal-950 drop-shadow-sm">
                                   {new Date(dateStr).toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric', month: 'short' })}
                                </span>
                                <CheckCircle className="w-5 h-5 text-emerald-700" />
                             </div>
                          </div>
                       ))}
                    </div>
                 ) : (
                    <div className="text-center py-6 text-teal-950/60 text-sm font-bold bg-white/10 border-[2px] border-dashed border-white/60 rounded-[1.5rem]">
                       No sessions completed yet.
                    </div>
                 )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}