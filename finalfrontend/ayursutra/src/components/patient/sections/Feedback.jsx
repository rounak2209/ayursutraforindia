import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider"; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, CheckCircle, Clock, ChevronDown, ChevronUp, 
  Send, ThumbsUp, ThumbsDown, HeartPulse, Activity, Star
} from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

// --- SUB-COMPONENT: History Card ---
function HistoryCard({ sess }) {
  const [expanded, setExpanded] = useState(false);
  const questions = sess.questions || sess.feedback?.answers || []; 
  const PREVIEW_COUNT = 2;
  const hiddenCount = questions.length - PREVIEW_COUNT;
  const displayQuestions = expanded ? questions : questions.slice(0, PREVIEW_COUNT);

  return (
    <div className="group relative overflow-hidden rounded-[2rem] bg-white/20 backdrop-blur-[30px] border-[1.5px] border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_40px_rgba(20,184,166,0.15)] hover:border-white/80 transition-all duration-500 mb-4">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-teal-400/10 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
      
      <div className="p-5 md:p-6 border-b border-white/30 flex justify-between items-center relative z-10 bg-white/10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/40 border-[1.5px] border-white/60 shadow-sm flex items-center justify-center shrink-0">
            <CheckCircle className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="font-black text-teal-950 text-base">Feedback Sent</p>
            <p className="text-xs font-bold text-teal-900/60 uppercase tracking-widest mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> {new Date(sess.createdAt || sess.respondedAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-white/40 border-[1.5px] border-white/70 shadow-sm text-[10px] font-black text-teal-900 uppercase tracking-widest">
           {sess.isDailyLog ? "Daily Log" : "Manual"}
        </div>
      </div>

      <div className="p-6 relative z-10 space-y-4">
        {displayQuestions.map((q, i) => (
          <div key={i} className="flex justify-between items-start gap-4 p-4 rounded-2xl bg-white/30 border-[1.5px] border-white/40 shadow-sm">
            <span className="text-sm font-bold text-teal-950 leading-relaxed flex-1">{q.questionText || q.text}</span>
            <div className="px-4 py-1.5 rounded-xl bg-white/60 border border-white/80 font-black text-teal-900 text-sm shadow-sm whitespace-nowrap">
              {q.answer ?? "—"}
            </div>
          </div>
        ))}
        
        {hiddenCount > 0 && (
          <button onClick={() => setExpanded(!expanded)} className="w-full py-3 flex items-center justify-center gap-2 text-xs font-black text-teal-900 uppercase tracking-widest bg-white/40 border-[1.5px] border-white/60 rounded-2xl hover:bg-white/60 transition-all shadow-sm">
            {expanded ? <><ChevronUp className="w-4 h-4" /> Show Less</> : <><ChevronDown className="w-4 h-4" /> View {hiddenCount} More Answers</>}
          </button>
        )}

        {sess.patientNotes && (
          <div className="mt-2 bg-amber-50/50 backdrop-blur-md p-4 rounded-2xl border-[1.5px] border-amber-200/50 flex gap-3 items-start shadow-sm">
             <div className="w-8 h-8 rounded-full bg-amber-200/50 flex items-center justify-center shrink-0 border border-amber-300/50">
               <MessageSquare className="w-4 h-4 text-amber-700" />
             </div>
             <div>
               <span className="font-black text-[10px] uppercase tracking-widest text-amber-900/60 block mb-1">Your Note</span>
               <span className="font-bold text-sm text-amber-950 leading-relaxed italic">"{sess.patientNotes}"</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function Feedback() {
  const [pending, setPending] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({}); 
  const [patientNotes, setPatientNotes] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const combinedPending = [];

      const trackingStatus = await apiGet('/api/tracking/status');
      
      if (trackingStatus && trackingStatus.showFeedbackCheck && trackingStatus.feedbackQuestions) {
          const dailySession = {
              _id: "daily_feedback_active", 
              sentAt: new Date(),
              therapistId: { name: "Daily Tracker" },
              isDailyLog: true, 
              questions: trackingStatus.feedbackQuestions.map(q => ({
                  id: q._id || q.id,
                  text: q.text,
                  type: q.type || 'scale',
                  maxScore: q.maxScore || 10,
                  category: q.category || 'therapy' 
              }))
          };
          combinedPending.push(dailySession);
      }

      const manualPending = await apiGet('/api/feedbacks/pending');
      if (Array.isArray(manualPending)) {
          combinedPending.push(...manualPending);
      }

      setPending(combinedPending);
      
      const h = await apiGet('/api/feedbacks/history'); 
      setHistory(Array.isArray(h) ? h : []);

    } catch (err) {
      console.error("Failed to load feedback data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const submitSession = async (session) => {
    const finalAnswers = { ...answers };
    
    session.questions.forEach(q => {
      if ((q.type === 'scale' || q.maxScore) && finalAnswers[q.id] === undefined) {
        finalAnswers[q.id] = 5;
      }
    });

    try {
      if (session.isDailyLog) {
        const formatted = session.questions.map(q => ({
            questionId: q.id,
            questionText: q.text,
            answer: finalAnswers[q.id]
        }));
        await apiPost("/api/tracking/feedback", { answers: formatted, patientNotes: patientNotes });
      } else {
        await apiPost('/api/feedbacks/submit', {
            sessionId: session._id,
            answers: finalAnswers,
            patientNotes
        });
      }

      toast({ title: "Feedback Sent!", description: "Your therapist has been updated." });
      setAnswers({});
      setPatientNotes("");
      loadData(); 
    } catch (err) {
      console.error(err);
      toast({ title: "Submission Failed", description: "Please try again.", variant: "destructive" });
    }
  };

  // --- RENDER INPUTS ---
  const renderInput = (q) => {
    if (q.type === 'scale' || q.maxScore) {
      const max = q.maxScore || 10;
      const currentVal = answers[q.id] !== undefined ? answers[q.id] : 5;
      const getEmoji = (v) => {
        const p = v / max;
        if (p <= 0.3) return "😔";
        if (p <= 0.7) return "😐";
        return "😃";
      };
      
      return (
        <div className="bg-white/30 backdrop-blur-md p-6 rounded-[2rem] border-[1.5px] border-white/50 shadow-sm relative overflow-hidden group hover:bg-white/40 transition-colors">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-400/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <span className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest bg-white/50 px-3 py-1.5 rounded-full border border-white/70 shadow-sm">Rating Scale</span>
            <div className="w-12 h-12 bg-white/60 border-[1.5px] border-white/80 rounded-2xl shadow-sm flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
               {getEmoji(currentVal)}
            </div>
          </div>
          
          <div className="relative z-10 px-2">
             <Slider defaultValue={[5]} value={[Number(currentVal)]} max={max} step={1} min={1} onValueChange={(v) => handleAnswer(q.id, v[0])} className="py-2" />
          </div>
          
          <div className="flex justify-between mt-4 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-900/50 bg-white/40 px-2 py-1 rounded-lg">Low (1)</span>
            <div className="flex flex-col items-center">
               <span className="text-2xl font-black text-teal-950">{currentVal}</span>
               <span className="text-[10px] font-bold text-teal-900/50 uppercase tracking-widest">Score</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-900/50 bg-white/40 px-2 py-1 rounded-lg">High ({max})</span>
          </div>
        </div>
      );
    }

    if (q.type === 'binary') {
      const currentVal = answers[q.id];
      return (
        <div className="flex gap-4 mt-3">
          <div onClick={() => handleAnswer(q.id, "Yes")} className={`flex-1 cursor-pointer p-5 rounded-[1.5rem] border-[2px] flex flex-col items-center gap-3 transition-all duration-300 shadow-sm ${currentVal === "Yes" ? "border-emerald-400 bg-emerald-500/20 text-emerald-950 shadow-[0_0_15px_rgba(16,185,129,0.2)] scale-[1.02]" : "border-white/60 bg-white/30 text-teal-900/60 hover:bg-white/50"}`}>
            <div className={`p-3 rounded-full ${currentVal === "Yes" ? "bg-emerald-400/40" : "bg-white/50"}`}>
               <ThumbsUp className={`w-6 h-6 ${currentVal === "Yes" ? "fill-emerald-700 text-emerald-700" : ""}`} />
            </div>
            <span className="font-black text-sm uppercase tracking-widest">Yes</span>
          </div>
          <div onClick={() => handleAnswer(q.id, "No")} className={`flex-1 cursor-pointer p-5 rounded-[1.5rem] border-[2px] flex flex-col items-center gap-3 transition-all duration-300 shadow-sm ${currentVal === "No" ? "border-rose-400 bg-rose-500/20 text-rose-950 shadow-[0_0_15px_rgba(244,63,94,0.2)] scale-[1.02]" : "border-white/60 bg-white/30 text-teal-900/60 hover:bg-white/50"}`}>
            <div className={`p-3 rounded-full ${currentVal === "No" ? "bg-rose-400/40" : "bg-white/50"}`}>
               <ThumbsDown className={`w-6 h-6 ${currentVal === "No" ? "fill-rose-700 text-rose-700" : ""}`} />
            </div>
            <span className="font-black text-sm uppercase tracking-widest">No</span>
          </div>
        </div>
      );
    }

    return (
      <Input placeholder="Type your answer..." className="mt-3 bg-white/50 hover:bg-white/60 backdrop-blur-md border-[1.5px] border-white/60 h-14 rounded-[1.25rem] px-5 font-bold text-teal-950 placeholder:text-teal-900/40 shadow-sm focus:bg-white/80 transition-all" onChange={(e) => handleAnswer(q.id, e.target.value)} />
    );
  };

  if (loading) return <div className="flex justify-center py-32 text-teal-900 font-black text-xl tracking-widest uppercase animate-pulse">Loading feedback...</div>;

  return (
    <div className="relative animate-in fade-in duration-700 w-full max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border-[1.5px] border-white/70 shadow-sm backdrop-blur-md mb-3">
             <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
             <span className="text-teal-900 font-extrabold text-[10px] tracking-widest uppercase">Health Updates</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-teal-950 flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-white/50 backdrop-blur-xl rounded-2xl border-[1.5px] border-white/70 flex items-center justify-center shadow-sm">
               <HeartPulse className="w-6 h-6 text-rose-600" />
            </div>
            Daily Feedback
          </h2>
        </div>
        {pending.length > 0 && (
           <div className="px-5 py-2.5 bg-rose-500/20 backdrop-blur-md border-[1.5px] border-rose-400/50 shadow-[0_0_15px_rgba(244,63,94,0.2)] rounded-full text-rose-950 font-black text-sm tracking-wide animate-pulse">
             Action Required
           </div>
        )}
      </div>

      <Tabs defaultValue="inbox" className="w-full relative z-10">
        <TabsList className="flex w-full max-w-md mx-auto bg-white/30 backdrop-blur-xl p-1.5 rounded-full mb-10 border-[1.5px] border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.05)] h-14">
          <TabsTrigger value="inbox" className="flex-1 rounded-full font-black text-sm uppercase tracking-widest data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-teal-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-teal-900/60 h-full">
            Inbox {pending.length > 0 && `(${pending.length})`}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 rounded-full font-black text-sm uppercase tracking-widest data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-teal-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-teal-900/60 h-full">
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-8 max-w-3xl mx-auto">
          {pending.length === 0 && (
             <div className="flex flex-col items-center justify-center py-20 bg-white/20 backdrop-blur-[30px] rounded-[3rem] border-[1.5px] border-white/50 shadow-sm">
               <div className="w-24 h-24 bg-white/50 border-[1.5px] border-white/80 rounded-full flex items-center justify-center mb-6 shadow-inner">
                 <CheckCircle className="w-12 h-12 text-teal-600" />
               </div>
               <h3 className="text-3xl font-black text-teal-950 mb-2">All Caught Up!</h3>
               <p className="text-teal-900/70 font-bold">You have no pending feedback requests.</p>
             </div>
          )}

          {pending.map((sess) => (
            <div key={sess._id} className="relative overflow-hidden rounded-[3rem] bg-white/10 backdrop-blur-[40px] border-[1.5px] border-white/50 shadow-[0_20px_60px_-10px_rgba(20,184,166,0.15)] flex flex-col mb-10" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)' }}>
              
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px] pointer-events-none -z-10"></div>
              
              <div className="bg-white/20 backdrop-blur-md p-8 border-b border-white/30 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 relative z-10">
                <div className="flex items-center gap-4">
                   <div className="w-14 h-14 bg-white/50 rounded-2xl border-[1.5px] border-white/80 shadow-sm flex items-center justify-center shrink-0">
                      <MessageSquare className="w-6 h-6 text-teal-800" />
                   </div>
                   <div>
                     <h3 className="text-2xl font-black text-teal-950 tracking-tight leading-none mb-1">Post-Therapy Survey</h3>
                     <p className="text-xs font-bold text-teal-900/70 uppercase tracking-widest">{sess.isDailyLog ? "Automatic Daily Check-in" : "Requested by Therapist"}</p>
                   </div>
                </div>
                <div className="px-5 py-2 bg-white/60 border-[1.5px] border-white/80 rounded-full text-xs font-black text-teal-950 uppercase tracking-widest shadow-sm self-start sm:self-auto">Today</div>
              </div>

              <div className="p-6 md:p-10 space-y-10 relative z-10">
                {['general', 'therapy', 'custom'].map(cat => {
                  const catQuestions = sess.questions.filter(q => q.category === cat);
                  if (catQuestions.length === 0) return null;
                  
                  const titles = { general: "General Health", therapy: "Therapy Specific", custom: "Additional Details" };
                  const icons = { general: Activity, therapy: Star, custom: MessageSquare };
                  const Icon = icons[cat];
                  
                  return (
                    <div key={cat} className="space-y-6">
                      <div className="flex items-center gap-3 text-teal-900 font-black text-lg uppercase tracking-widest border-b-[2px] border-white/40 pb-3 pl-2">
                        <Icon className="w-6 h-6" /> {titles[cat]}
                      </div>
                      <div className="space-y-8">
                        {catQuestions.map((q, idx) => (
                          <div key={q.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            <Label className="mb-4 block text-base md:text-lg font-black text-teal-950 leading-snug px-2">{q.text}</Label>
                            {renderInput(q)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}

                <div className="bg-amber-50/40 backdrop-blur-xl p-8 rounded-[2rem] border-[1.5px] border-amber-200/50 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                  <Label className="mb-4 block font-black text-amber-950 text-sm uppercase tracking-widest flex items-center gap-2 relative z-10">
                     <MessageSquare className="w-5 h-5 text-amber-600" /> Additional Notes
                  </Label>
                  <Textarea 
                     placeholder="Any side effects, concerns, or feelings you want to share..." 
                     rows={4} 
                     value={patientNotes} 
                     onChange={(e) => setPatientNotes(e.target.value)} 
                     className="bg-white/60 hover:bg-white/80 border-[1.5px] border-amber-200/60 rounded-2xl resize-none font-bold text-amber-950 placeholder:text-amber-900/40 shadow-inner focus:bg-white transition-colors relative z-10" 
                  />
                </div>

                <Button onClick={() => submitSession(sess)} className="w-full h-16 text-lg font-black shadow-[0_10px_30px_rgba(20,184,166,0.3)] bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white rounded-full transition-all hover:scale-[1.02] hover:-translate-y-1 flex items-center justify-center gap-3">
                  <Send className="w-6 h-6" /> Submit Feedback
                </Button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="history" className="max-w-3xl mx-auto">
          {history.length === 0 ? (
            <div className="text-center py-20 text-teal-900/50 font-bold bg-white/20 backdrop-blur-xl border-[1.5px] border-white/40 rounded-[3rem] shadow-sm">You haven't sent any feedback yet.</div>
          ) : (
            <div className="space-y-6">
              {history.map((sess, i) => <HistoryCard key={i} sess={sess} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}