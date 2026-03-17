import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, Users,X,Stethoscope,Phone, Mail, Calendar, Clock, Play, CheckSquare, 
  ChevronRight, Activity, FileText, ExternalLink, ShieldCheck 
} from "lucide-react"; 
import { toast } from "@/hooks/use-toast";

const normalizePatient = (raw = {}) => ({
  name: raw.name || raw.personalDetails?.name || "Unknown Patient",
  email: raw.email || "—",
  phone: raw.personalDetails?.contactNumber || raw.phone || "—",
  age: raw.personalDetails?.age || raw.healthProfile?.age || "—",
  gender: raw.personalDetails?.gender || "—",
  healthProfile: raw.healthProfile || {},
  prescriptionDetails: raw.prescriptionDetails || {},
  todaysSessionStatus: raw.todaysSessionStatus,
  profilePic: raw.profilePic || null,
  documents: raw.prescriptionDetails?.documents || [] 
});

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); 
  const therapistId = localStorage.getItem("userId");

  useEffect(() => {
    const loadPatients = async () => {
      setLoading(true);
      try {
        if (!therapistId) return setPatients([]);
        const data = await apiGet(`/api/requests/therapists/${therapistId}/patients`);
        setPatients(Array.isArray(data) ? data : []);
      } catch (err) {
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [therapistId]);

  const handleSessionToggle = async (patientId, currentStatus) => {
    let newStatus = 'started';
    if (currentStatus === 'started') newStatus = 'completed';
    if (currentStatus === 'completed') return; 

    setPatients(prevList => prevList.map(item => {
      const pId = item.patient?._id || item.patientId; 
      
      if (pId === patientId) {
        return { 
          ...item, 
          todaysSessionStatus: newStatus, 
          patient: { ...item.patient, todaysSessionStatus: newStatus } 
        };
      }
      return item;
    }));

    try {
      await apiPost("/api/tracking/toggle-session", { patientId, status: newStatus });
      toast({ title: "Updated", description: `Session marked as ${newStatus}` });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update session." });
    }
  };

  if (loading) return <div className="p-12 text-center text-teal-800 animate-pulse font-black uppercase tracking-widest text-lg min-h-[50vh] flex items-center justify-center">Loading patient records...</div>;

  return (
    <div className="relative animate-in fade-in duration-700 w-full max-w-7xl mx-auto space-y-8 pb-10">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border-[1.5px] border-white/70 shadow-sm backdrop-blur-md mb-3">
             <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
             <span className="text-teal-900 font-extrabold text-[10px] tracking-widest uppercase">Patient Roster</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-teal-950 flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-white/50 backdrop-blur-xl rounded-2xl border-[1.5px] border-white/70 flex items-center justify-center shadow-sm">
               <Users className="w-6 h-6 text-teal-700" />
            </div>
            My Patients
          </h2>
        </div>
        <div className="px-5 py-2.5 bg-white/40 backdrop-blur-md border-[1.5px] border-white/70 shadow-sm rounded-full text-teal-900 font-black text-sm tracking-wide flex items-center gap-2">
           <span className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs">{patients.length}</span> Total Active
        </div>
      </div>

      {patients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/20 backdrop-blur-[40px] rounded-[3rem] border-[1.5px] border-white/50 shadow-[0_10px_40px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="w-24 h-24 bg-white/40 border-[1.5px] border-white/70 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.1)] relative z-10">
            <ShieldCheck className="w-12 h-12 text-teal-600 drop-shadow-sm" />
          </div>
          <h3 className="text-3xl font-black text-teal-950 mb-2 relative z-10">No Active Patients</h3>
          <p className="text-teal-900/70 font-bold uppercase tracking-widest text-sm relative z-10 text-center max-w-md">You currently have no accepted patient requests.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {patients.map((item) => {
            const p = normalizePatient(item.patient);
            const date = item.appointmentDate ? new Date(item.appointmentDate).toLocaleDateString("en-IN", { month: 'short', day: 'numeric' }) : "—";
            const patientId = item.patient?._id || item.patientId; 
            const sessionStatus = item.todaysSessionStatus || p.todaysSessionStatus || 'pending';

            return (
              <div key={item.requestId || item._id} className="group relative overflow-hidden rounded-[2.5rem] bg-white/20 backdrop-blur-[30px] border-[1.5px] border-white/50 hover:shadow-[0_15px_40px_rgba(20,184,166,0.15)] hover:border-white/80 transition-all duration-500 flex flex-col" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)' }}>
                
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-400/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>

                <div className="p-6 md:p-8 flex flex-col gap-6 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-[1.25rem] bg-white/40 border-[1.5px] border-white/70 shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden backdrop-blur-md">
                        {p.profilePic ? (
                            <img src={p.profilePic} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-2xl font-black text-teal-800/50">{p.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="text-xl font-black text-teal-950 truncate mb-1 drop-shadow-sm">{p.name}</h3>
                      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-teal-900/60 break-all leading-tight">
                         <Mail className="w-3.5 h-3.5 shrink-0" /> {p.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/40 border-[1.5px] border-white/60 rounded-[1.5rem] shadow-sm backdrop-blur-md">
                    <div className="flex flex-col">
                       <span className="text-[9px] font-black uppercase tracking-widest text-teal-900/60 mb-0.5">Date</span>
                       <span className="text-sm font-black text-teal-950 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-teal-700"/> {date}</span>
                    </div>
                    <div className="w-px h-8 bg-white/60"></div>
                    <div className="flex flex-col items-end">
                       <span className="text-[9px] font-black uppercase tracking-widest text-teal-900/60 mb-0.5">Time</span>
                       <span className="text-sm font-black text-teal-950 flex items-center gap-1.5">{item.appointmentTime || "—"} <Clock className="w-3.5 h-3.5 text-teal-700"/></span>
                    </div>
                  </div>

                  <div className="bg-white/30 p-5 rounded-[1.5rem] border-[1.5px] border-white/50 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4 relative z-10">
                      <span className="text-[10px] font-black text-teal-900/70 uppercase tracking-widest flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-teal-600"/> Today's Session</span>
                      <Badge className={`border-[1.5px] shadow-none px-3 py-1 text-[9px] font-black uppercase tracking-widest ${
                        sessionStatus === 'completed' ? 'bg-emerald-500/20 text-emerald-950 border-emerald-400/50' : 
                        sessionStatus === 'started' ? 'bg-amber-500/20 text-amber-950 border-amber-400/50' : 
                        'bg-white/50 text-teal-900/60 border-white/60'
                      }`}>
                        {sessionStatus === 'completed' ? 'Completed' : sessionStatus === 'started' ? 'In Progress' : 'Pending'}
                      </Badge>
                    </div>
                    
                    <Button 
                        size="sm"
                        onClick={() => handleSessionToggle(patientId, sessionStatus)}
                        disabled={sessionStatus === 'completed'}
                        className={`w-full h-12 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm transition-all relative z-10 ${
                            sessionStatus === 'completed' 
                            ? "bg-emerald-500/10 text-emerald-800 border-[1.5px] border-emerald-400/50 opacity-100 cursor-default"
                            : sessionStatus === 'started' 
                                ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:-translate-y-0.5" 
                                : "bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-[0_4px_15px_rgba(20,184,166,0.3)] hover:-translate-y-0.5"
                        }`}
                      >
                        {sessionStatus === 'completed' ? (
                             <><CheckSquare className="w-4 h-4 mr-2" /> Session Done</>
                        ) : sessionStatus === 'started' ? (
                             <><CheckSquare className="w-4 h-4 mr-2" /> Mark Complete</>
                        ) : (
                             <><Play className="w-4 h-4 mr-2 fill-current" /> Start Session</>
                        )}
                      </Button>
                  </div>
                </div>

                <div className="p-4 md:p-6 border-t-[1.5px] border-white/30 bg-white/10 mt-auto">
                  <Button variant="ghost" className="w-full bg-white/40 hover:bg-white/60 border-[1.5px] border-white/60 text-teal-950 shadow-sm h-12 rounded-xl font-black text-xs uppercase tracking-widest transition-all group/btn" onClick={() => setSelected(item)}>
                    Full Profile <ChevronRight className="w-4 h-4 ml-2 opacity-50 group-hover/btn:opacity-100 transition-opacity group-hover/btn:translate-x-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL PATIENT PROFILE MODAL (GLASSMORPHISM) */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 bg-white/30 backdrop-blur-[50px] border-[1.5px] border-white/60 shadow-[0_30px_80px_rgba(0,0,0,0.3)] rounded-[3rem] [&::-webkit-scrollbar]:hidden z-[100] [&>button]:hidden">
          
          {selected && (() => {
            const p = normalizePatient(selected.patient);
            return (
              <div className="relative">
                {/* Header Section */}
                <div className="p-8 md:p-10 border-b border-white/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden bg-white/10" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(255,255,255,0.05) 100%)' }}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-[60px] pointer-events-none -z-10"></div>
                  
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="h-20 w-20 rounded-[1.5rem] bg-white/40 border-[1.5px] border-white/70 flex items-center justify-center text-3xl font-black text-teal-950 shadow-[0_8px_25px_rgba(20,184,166,0.15)] shrink-0 backdrop-blur-md overflow-hidden">
                        {p.profilePic ? (
                            <img src={p.profilePic} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                            p.name.charAt(0)
                        )}
                    </div>
                    <div>
                      <DialogTitle className="text-3xl font-black text-teal-950 tracking-tight leading-none mb-3 drop-shadow-sm">{p.name}</DialogTitle>
                      <div className="flex flex-wrap gap-3 text-[10px] font-black uppercase tracking-widest text-teal-900/70">
                        <span className="flex items-center gap-1.5 bg-white/50 px-3 py-1.5 rounded-md border border-white/60 shadow-sm"><Phone className="w-3.5 h-3.5"/> {p.phone}</span>
                        <span className="flex items-start gap-1.5 bg-white/50 px-3 py-1.5 rounded-md border border-white/60 shadow-sm max-w-[200px]"><Mail className="w-3.5 h-3.5 shrink-0 mt-0.5"/> <span className="break-all leading-tight">{p.email}</span></span>
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={() => setSelected(null)} className="absolute top-6 right-6 text-teal-900 hover:text-teal-950 transition-colors bg-white/40 rounded-full p-2.5 backdrop-blur-md border border-white/50 shadow-sm z-50">
                     <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Body Section */}
                <div className="p-8 md:p-10 space-y-8 relative z-10">
                  <div className="grid lg:grid-cols-2 gap-8">
                    
                    {/* Left Column: Health Profile */}
                    <div className="space-y-6">
                      <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border-[1.5px] border-white/60 shadow-sm">
                        <h4 className="text-lg font-black text-teal-950 uppercase tracking-widest mb-6 flex items-center gap-3 border-b-[1.5px] border-white/50 pb-4">
                          <Activity className="w-5 h-5 text-teal-700"/> Health Profile
                        </h4>
                        
                        <div className="bg-white/30 p-5 rounded-[1.5rem] border border-white/50 mb-5">
                          <span className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest block mb-2">Medical History</span>
                          <p className="font-bold text-sm text-teal-950 leading-relaxed italic">
                            {p.healthProfile?.medicalHistory || "No history provided."}
                          </p>
                        </div>

                        <div className="space-y-3">
                           <div className="flex justify-between items-center bg-white/30 p-4 rounded-[1.25rem] border border-white/50">
                             <span className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest">Gender / Age</span>
                             <span className="font-black text-sm text-teal-950">{p.gender}, {p.age}</span>
                           </div>
                           <div className="flex justify-between items-center bg-white/30 p-4 rounded-[1.25rem] border border-white/50">
                             <span className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest">Prakriti</span>
                             <Badge className="bg-teal-500/20 text-teal-950 border border-teal-400/50 shadow-none px-3 py-1 uppercase tracking-widest text-[9px]">{p.healthProfile?.prakritiType || "—"}</Badge>
                           </div>
                           <div className="flex justify-between items-center bg-white/30 p-4 rounded-[1.25rem] border border-white/50">
                             <span className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest">Dosha</span>
                             <span className="font-black text-sm text-rose-700">{p.healthProfile?.doshaImbalance || "—"}</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Docs & Prescriptions */}
                    <div className="space-y-8">
                      {p.documents && p.documents.length > 0 && (
                        <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border-[1.5px] border-white/60 shadow-sm relative overflow-hidden group">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                          
                          <h4 className="text-lg font-black text-teal-950 uppercase tracking-widest mb-6 flex items-center gap-3 border-b-[1.5px] border-white/50 pb-4 relative z-10">
                            <FileText className="w-5 h-5 text-indigo-600"/> Documents
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                            {p.documents.map((docUrl, index) => (
                              <a 
                                key={index} 
                                href={docUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-4 rounded-[1.25rem] border-[1.5px] border-white/60 bg-white/50 hover:bg-white/70 hover:shadow-md transition-all group/link"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="p-2.5 bg-indigo-500/10 rounded-xl shadow-inner text-indigo-700 group-hover/link:bg-indigo-500/20 border border-indigo-400/30">
                                    <FileText className="w-4 h-4" />
                                  </div>
                                  <span className="text-xs font-black uppercase tracking-widest text-teal-950">Doc {index + 1}</span>
                                </div>
                                <ExternalLink className="w-4 h-4 text-teal-900/40 group-hover/link:text-indigo-600 transition-colors" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Prescriptions (If needed later) */}
                      {Array.isArray(p.prescriptionDetails?.therapies) && p.prescriptionDetails.therapies.length > 0 && (
                         <div className="bg-white/40 backdrop-blur-md p-8 rounded-[2rem] border-[1.5px] border-white/60 shadow-sm">
                           <h4 className="text-lg font-black text-teal-950 uppercase tracking-widest mb-6 flex items-center gap-3 border-b-[1.5px] border-white/50 pb-4">
                             <Stethoscope className="w-5 h-5 text-emerald-600"/> Prescriptions
                           </h4>
                           <div className="space-y-3">
                             {p.prescriptionDetails.therapies.map((t, idx) => (
                               <div key={idx} className="flex justify-between items-center p-4 bg-white/50 rounded-[1.25rem] border border-white/70 shadow-sm">
                                 <span className="font-black text-sm text-teal-950">{t.therapy || "Therapy"}</span>
                                 <Badge className="bg-emerald-500/20 text-emerald-950 border border-emerald-400/50 shadow-none px-3 py-1 uppercase tracking-widest text-[9px]">{t.duration || "—"}</Badge>
                               </div>
                             ))}
                           </div>
                         </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Button */}
                <div className="p-8 bg-white/20 border-t-[1.5px] border-white/40 flex justify-end">
                   <Button 
                     onClick={() => setSelected(null)} 
                     className="bg-white/60 hover:bg-white/80 border-[1.5px] border-white/80 text-teal-950 shadow-sm h-12 px-8 rounded-full font-black uppercase tracking-widest transition-all hover:-translate-y-0.5"
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