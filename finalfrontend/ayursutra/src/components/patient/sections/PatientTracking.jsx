import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/lib/api";
import { Moon, AlertCircle, CheckCircle, Send, Activity, ThumbsUp, ThumbsDown } from "lucide-react"; 
import { Label } from "@/components/ui/label";

//  Update 1: Accept 'hideFeedback' prop (default is false)
export default function PatientTracking({ hideFeedback = false }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Answers Store
  const [progressAnswers, setProgressAnswers] = useState({});
  const [feedbackAnswers, setFeedbackAnswers] = useState({});
  
  // Virechana State
  const [motionData, setMotionData] = useState({ quantity: "Medium", feeling: "Relieved" });

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); 
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    try {
      const data = await apiGet("/api/tracking/status");
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (q, store, setStore) => {
    const val = store[q.id || q._id] || (q.type === 'scale' ? 5 : "");
    const handleChange = (v) => setStore(prev => ({ ...prev, [q.id || q._id]: v }));

    if (q.type === 'scale' || q.maxScore) {
      const max = q.maxScore || 10;
      return (
        <div className="bg-white/40 p-4 rounded-[1.5rem] border-[1.5px] border-white/60 shadow-sm relative overflow-hidden group hover:bg-white/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-teal-400/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>
          <div className="flex justify-between items-center mb-4 relative z-10">
            <span className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest bg-white/50 px-3 py-1.5 rounded-full border border-white/70 shadow-sm">Low (1)</span>
            <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-teal-950 drop-shadow-sm">{val}</span>
               <span className="text-[9px] font-bold text-teal-900/50 uppercase tracking-widest">Score</span>
            </div>
            <span className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest bg-white/50 px-3 py-1.5 rounded-full border border-white/70 shadow-sm">High ({max})</span>
          </div>
          <div className="relative z-10 px-2">
             <Slider value={[Number(val)]} max={max} step={1} min={1} onValueChange={(v) => handleChange(v[0])} className="py-2 cursor-pointer" />
          </div>
        </div>
      );
    }

    if (q.type === 'binary') {
      return (
        <div className="flex gap-3 mt-2">
          <div onClick={() => handleChange("Yes")} className={`flex-1 cursor-pointer p-4 rounded-[1.5rem] border-[1.5px] flex flex-col items-center gap-2 transition-all duration-300 shadow-sm ${val === "Yes" ? "border-emerald-400 bg-emerald-500/20 text-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-[1.02]" : "border-white/50 bg-white/30 text-teal-950/60 hover:bg-white/50 hover:border-white/80"}`}>
            <div className={`p-3 rounded-full shadow-inner ${val === "Yes" ? "bg-emerald-400/40 border border-emerald-400/50" : "bg-white/50 border border-white/70"}`}>
               <ThumbsUp className={`w-5 h-5 ${val === "Yes" ? "fill-emerald-700 text-emerald-700 drop-shadow-sm" : ""}`} />
            </div>
            <span className="font-black text-xs uppercase tracking-widest">Yes</span>
          </div>
          <div onClick={() => handleChange("No")} className={`flex-1 cursor-pointer p-4 rounded-[1.5rem] border-[1.5px] flex flex-col items-center gap-2 transition-all duration-300 shadow-sm ${val === "No" ? "border-rose-400 bg-rose-500/20 text-rose-950 shadow-[0_0_15px_rgba(244,63,94,0.2)] scale-[1.02]" : "border-white/50 bg-white/30 text-teal-950/60 hover:bg-white/50 hover:border-white/80"}`}>
            <div className={`p-3 rounded-full shadow-inner ${val === "No" ? "bg-rose-400/40 border border-rose-400/50" : "bg-white/50 border border-white/70"}`}>
               <ThumbsDown className={`w-5 h-5 ${val === "No" ? "fill-rose-700 text-rose-700 drop-shadow-sm" : ""}`} />
            </div>
            <span className="font-black text-xs uppercase tracking-widest">No</span>
          </div>
        </div>
      );
    }
    
    return <Input value={val} onChange={(e) => handleChange(e.target.value)} placeholder="Type your answer here..." className="mt-2 bg-white/40 hover:bg-white/60 backdrop-blur-md border-[1.5px] border-white/60 h-12 rounded-xl px-4 font-bold text-teal-950 placeholder:text-teal-950/40 shadow-sm focus:bg-white/80 focus:border-teal-400/50 transition-all text-sm" />;
  };

  const submitProgress = async () => {
    const formatted = status.progressQuestions.map(q => ({ questionId: q.id || q._id, questionText: q.text, answer: progressAnswers[q.id || q._id] }));
    await apiPost("/api/tracking/progress", { answers: formatted });
    toast({ title: "Good Morning!", description: "Progress logged." });
    fetchStatus();
  };

  const submitFeedback = async () => {
    const formatted = status.feedbackQuestions.map(q => ({ questionId: q.id || q._id, questionText: q.text, answer: feedbackAnswers[q.id || q._id] }));
    await apiPost("/api/tracking/feedback", { answers: formatted });
    toast({ title: "Feedback Sent", description: "Therapist notified." });
    fetchStatus();
  };

  const submitVirechana = async () => {
    await apiPost("/api/tracking/virechana/add", motionData);
    toast({ title: "Recorded", description: "Motion logged." });
    setMotionData({ quantity: "Medium", feeling: "Relieved" }); 
  };

  if (loading) return null;

  //  Update 2: Logic to HIDE component if only feedback is pending AND hideFeedback is true
  const shouldShow = status && (
    status.sessionStatus === 'started' || 
    status.showProgressCheck || 
    status.showVirechanaCounter || 
    (!hideFeedback && status.showFeedbackCheck) // Only show feedback if hideFeedback is false
  );

  if (!shouldShow) return null;

  return (
    <div className="space-y-6 max-w-xl mx-auto mb-8 w-full animate-in fade-in duration-700">

      {/* 1. SESSION IN PROGRESS */}
      {status.sessionStatus === 'started' && !status.showVirechanaCounter && (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-blue-400/20 backdrop-blur-[40px] border-[1.5px] border-blue-400/50 shadow-[0_15px_40px_-10px_rgba(59,130,246,0.3)] p-6 group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-400/30 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
          
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-16 h-16 bg-blue-500/20 backdrop-blur-md rounded-[1.5rem] border-[1.5px] border-blue-400/50 shadow-inner flex items-center justify-center shrink-0 animate-[pulse_3s_ease-in-out_infinite]">
               <Activity className="w-8 h-8 text-blue-700 animate-[spin_4s_linear_infinite] drop-shadow-md" />
            </div>
            <div>
              <h3 className="text-xl font-black text-blue-950 tracking-tight mb-1 drop-shadow-sm">Therapy in Progress</h3>
              <p className="text-xs font-bold text-blue-900/70 uppercase tracking-widest">Please wait for the therapist to complete.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* 2. MORNING PROGRESS */}
      {status.showProgressCheck && (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white/20 backdrop-blur-[40px] border-[1.5px] border-white/50 shadow-[0_15px_40px_-10px_rgba(20,184,166,0.15)] p-8">
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/20 rounded-full blur-[60px] pointer-events-none -z-10"></div>
          
          <div className="flex items-center gap-4 mb-8 relative z-10 border-b-[1.5px] border-white/40 pb-4">
             <div className="w-14 h-14 bg-white/40 backdrop-blur-md rounded-2xl border-[1.5px] border-white/70 shadow-sm flex items-center justify-center shrink-0">
                <Moon className="w-7 h-7 text-teal-800 drop-shadow-sm" />
             </div>
             <div>
               <h3 className="text-2xl font-black text-teal-950 tracking-tight leading-none mb-1.5 drop-shadow-sm">Morning Check-in</h3>
               <p className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest">Daily Progress Tracker</p>
             </div>
          </div>

          <div className="space-y-6 relative z-10">
            {status.progressQuestions.map((q, i) => (
              <div key={i} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <Label className="mb-3 block text-base font-black text-teal-950 leading-snug px-2 drop-shadow-sm">{q.text}</Label>
                {renderInput(q, progressAnswers, setProgressAnswers)}
              </div>
            ))}
            
            <div className="pt-4">
               <Button onClick={submitProgress} className="w-full h-14 text-base font-black shadow-[0_8px_20px_rgba(20,184,166,0.3)] bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white rounded-full transition-all hover:scale-[1.02] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                 <Send className="w-5 h-5" /> Submit Progress
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* 3. VIRECHANA */}
      {status.showVirechanaCounter && (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-amber-400/20 backdrop-blur-[40px] border-[1.5px] border-amber-400/50 shadow-[0_15px_40px_-10px_rgba(245,158,11,0.2)] p-8 animate-[pulse_6s_ease-in-out_infinite]">
          <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/20 rounded-full blur-[80px] pointer-events-none -z-10"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-orange-400/20 rounded-full blur-[80px] pointer-events-none -z-10"></div>
          
          <div className="flex items-center gap-4 mb-8 relative z-10 border-b-[1.5px] border-amber-400/40 pb-4">
             <div className="w-14 h-14 bg-amber-500/20 backdrop-blur-md rounded-2xl border-[1.5px] border-amber-400/50 shadow-inner flex items-center justify-center shrink-0">
                <AlertCircle className="w-7 h-7 text-amber-700 drop-shadow-sm" />
             </div>
             <div>
               <h3 className="text-2xl font-black text-amber-950 tracking-tight leading-none mb-1.5 drop-shadow-sm">Virechana Tracker</h3>
               <p className="text-[10px] font-black text-amber-900/60 uppercase tracking-widest flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> Active Session</p>
             </div>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-2.5">
               <Label className="text-[10px] font-black text-amber-900/70 uppercase tracking-widest pl-2">Quantity</Label>
               <div className="grid grid-cols-3 gap-3">
                 {["Small", "Medium", "Large"].map(q => (
                    <div 
                      key={q} 
                      onClick={() => setMotionData({...motionData, quantity:q})}
                      className={`cursor-pointer h-12 rounded-xl border-[1.5px] flex items-center justify-center font-black text-sm transition-all shadow-sm
                        ${motionData.quantity === q 
                          ? "bg-amber-500/30 border-amber-500/50 text-amber-950 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105" 
                          : "bg-white/40 border-white/60 text-amber-900/60 hover:bg-white/60"
                        }
                      `}
                    >
                      {q}
                    </div>
                 ))}
               </div>
            </div>
            
            <div className="space-y-2.5">
               <Label className="text-[10px] font-black text-amber-900/70 uppercase tracking-widest pl-2">Feeling</Label>
               <Select value={motionData.feeling} onValueChange={(v)=>setMotionData({...motionData, feeling:v})}>
                 <SelectTrigger className="w-full h-14 bg-white/50 hover:bg-white/70 backdrop-blur-md border-[1.5px] border-white/70 rounded-[1.25rem] px-5 font-black text-amber-950 shadow-sm focus:ring-2 focus:ring-amber-400 transition-all text-base">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="bg-white/90 backdrop-blur-xl border-white/80 rounded-2xl shadow-xl">
                   <SelectItem value="Relieved" className="font-bold text-amber-950 focus:bg-amber-100">Relieved</SelectItem>
                   <SelectItem value="Tired" className="font-bold text-amber-950 focus:bg-amber-100">Tired</SelectItem>
                   <SelectItem value="Dizzy" className="font-bold text-rose-700 focus:bg-rose-100">Dizzy (Alert Dr)</SelectItem>
                 </SelectContent>
               </Select>
            </div>
            
            <div className="pt-2">
               <Button onClick={submitVirechana} className="w-full h-14 text-base font-black shadow-[0_8px_20px_rgba(217,119,6,0.3)] bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white rounded-full transition-all hover:scale-[1.02] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                 🚽 Record Motion
               </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. FEEDBACK (Conditionally Rendered) */}
      {!hideFeedback && status.showFeedbackCheck && (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white/20 backdrop-blur-[40px] border-[1.5px] border-white/50 shadow-[0_15px_40px_-10px_rgba(59,130,246,0.15)] p-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px] pointer-events-none -z-10"></div>
          
          <div className="flex items-center gap-4 mb-8 relative z-10 border-b-[1.5px] border-white/40 pb-4">
             <div className="w-14 h-14 bg-white/40 backdrop-blur-md rounded-2xl border-[1.5px] border-white/70 shadow-sm flex items-center justify-center shrink-0">
                <CheckCircle className="w-7 h-7 text-blue-700 drop-shadow-sm" />
             </div>
             <div>
               <h3 className="text-2xl font-black text-blue-950 tracking-tight leading-none mb-1.5 drop-shadow-sm">Post-Therapy Feedback</h3>
               <p className="text-[10px] font-black text-blue-900/60 uppercase tracking-widest">Update your therapist</p>
             </div>
          </div>

          <div className="space-y-6 relative z-10">
            {status.feedbackQuestions.map((q, i) => (
              <div key={i} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                <Label className="mb-3 block text-base font-black text-blue-950 leading-snug px-2 drop-shadow-sm">{q.text}</Label>
                {renderInput(q, feedbackAnswers, setFeedbackAnswers)}
              </div>
            ))}
            
            <div className="pt-4">
               <Button onClick={submitFeedback} className="w-full h-14 text-base font-black shadow-[0_8px_20px_rgba(59,130,246,0.3)] bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white rounded-full transition-all hover:scale-[1.02] hover:-translate-y-0.5 flex items-center justify-center gap-2">
                 <Send className="w-5 h-5" /> Submit Feedback
               </Button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}