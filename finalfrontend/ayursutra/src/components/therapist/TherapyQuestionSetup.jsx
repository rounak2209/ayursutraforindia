import React, { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Save, AlertCircle, FileEdit } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function TherapyQuestionSetup() {
  const [loading, setLoading] = useState(true);
  const [specializations, setSpecializations] = useState([]);
  const [questionsByTherapy, setQuestionsByTherapy] = useState({});
  const [savingFor, setSavingFor] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiGet("/api/therapy-questions/my");

        const specs = res.specializations || [];
        const byTherapy = res.questionsByTherapy || {};

        const normalized = {};
        specs.forEach(t => {
          normalized[t] = Array.isArray(byTherapy[t]) ? byTherapy[t] : [];
        });

        setSpecializations(specs);
        setQuestionsByTherapy(normalized);
      } catch (err) {
        toast({
          title: "Load failed",
          description: err?.message || "Server error",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const addQuestion = (therapy) => {
    setQuestionsByTherapy(prev => {
      const arr = prev[therapy] ? [...prev[therapy]] : [];
      arr.push({ text: "", maxScore: 10 });
      return { ...prev, [therapy]: arr };
    });
  };

  const updateQuestion = (therapy, index, value) => {
    setQuestionsByTherapy(prev => {
      const arr = [...(prev[therapy] || [])];
      arr[index] = { ...arr[index], text: value };
      return { ...prev, [therapy]: arr };
    });
  };

  const removeQuestion = (therapy, index) => {
    setQuestionsByTherapy(prev => {
      const arr = [...(prev[therapy] || [])];
      arr.splice(index, 1);
      return { ...prev, [therapy]: arr };
    });
  };

  const saveForTherapy = async (therapy) => {
    try {
      setSavingFor(therapy);
      const questions = (questionsByTherapy[therapy] || []).map(q => ({ text: q.text || "" }));
      
      if (questions.length === 0) {
        toast({ title: "Add questions", description: "Please add at least one question before saving.", variant: "destructive" });
        setSavingFor(null);
        return;
      }
      await apiPost("/api/therapy-questions", { therapyType: therapy, questions });
      toast({ title: "Saved", description: `Questions saved for ${therapy}` });
    } catch (err) {
      toast({ title: "Save failed", description: err?.message || "Server error", variant: "destructive" });
    } finally {
      setSavingFor(null);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-teal-800 animate-pulse font-black uppercase tracking-widest text-lg min-h-[50vh] flex items-center justify-center">Loading Setup...</div>;
  }

  if (!specializations || specializations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white/20 backdrop-blur-[40px] rounded-[3rem] border-[1.5px] border-white/50 shadow-[0_10px_40px_rgba(0,0,0,0.05)] relative overflow-hidden w-full max-w-4xl mx-auto mt-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="w-24 h-24 bg-white/40 border-[1.5px] border-white/70 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.1)] relative z-10">
           <AlertCircle className="w-12 h-12 text-teal-600 drop-shadow-sm" />
        </div>
        <h3 className="text-3xl font-black text-teal-950 mb-2 relative z-10">No Therapies Found</h3>
        <p className="text-teal-900/70 font-bold uppercase tracking-widest text-sm relative z-10 text-center max-w-md mb-8">
          You haven't selected any specializations yet. Please update your profile to add therapies you practice.
        </p>
        <Button onClick={() => window.location.href="/therapist/profile"} className="h-14 px-8 rounded-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-black shadow-[0_8px_20px_rgba(20,184,166,0.3)] transition-all hover:scale-[1.02] hover:-translate-y-0.5 relative z-10">
          Go to Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="relative animate-in fade-in duration-700 w-full max-w-7xl mx-auto space-y-8 pb-10">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border-[1.5px] border-white/70 shadow-sm backdrop-blur-md mb-3">
             <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
             <span className="text-teal-900 font-extrabold text-[10px] tracking-widest uppercase">Configuration</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-teal-950 flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-white/50 backdrop-blur-xl rounded-2xl border-[1.5px] border-white/70 flex items-center justify-center shadow-sm">
               <FileEdit className="w-6 h-6 text-teal-700" />
            </div>
            Question Setup
          </h2>
        </div>
        <div className="px-5 py-2.5 bg-white/40 backdrop-blur-md border-[1.5px] border-white/70 shadow-sm rounded-full text-teal-900 font-black text-sm tracking-wide flex items-center gap-2">
           <span className="w-5 h-5 bg-teal-600 text-white rounded-full flex items-center justify-center text-xs">{specializations.length}</span> Active Therapies
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {specializations.map((therapy) => {
          const questions = questionsByTherapy[therapy] || [];

          return (
            <div key={therapy} className="group relative overflow-hidden rounded-[2.5rem] bg-white/20 backdrop-blur-[30px] border-[1.5px] border-white/50 hover:shadow-[0_15px_40px_rgba(20,184,166,0.15)] hover:border-white/80 transition-all duration-500 flex flex-col h-[500px]" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)' }}>
              
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-400/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>

              <div className="p-6 md:p-8 flex flex-col relative z-10 h-full">
                <div className="flex items-center justify-between mb-6 pb-4 border-b-[1.5px] border-white/40">
                   <h3 className="text-2xl font-black text-teal-950 truncate drop-shadow-sm pr-2">{therapy}</h3>
                   <Badge className="bg-white/50 text-teal-950 border-[1.5px] border-white/70 shadow-sm px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shrink-0">
                     {questions.length} Qs
                   </Badge>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/60 [&::-webkit-scrollbar-thumb]:rounded-full mb-6">
                  {questions.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 border-[2px] border-dashed border-white/60 rounded-[1.5rem] bg-white/30">
                       <FileEdit className="w-8 h-8 text-teal-900/30 mb-2" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-teal-900/50">No questions configured.</span>
                    </div>
                  ) : (
                    questions.map((q, idx) => (
                      <div key={idx} className="flex gap-3 items-center group/item bg-white/40 p-3 rounded-[1.25rem] border-[1.5px] border-white/60 shadow-sm hover:bg-white/60 transition-colors">
                        <span className="text-[10px] font-black text-teal-900/40 w-4 text-right shrink-0">{idx + 1}.</span>
                        <Input
                          placeholder="Enter question text..."
                          value={q.text}
                          onChange={(e) => updateQuestion(therapy, idx, e.target.value)}
                          className="h-10 text-sm font-bold text-teal-950 border-0 bg-white/50 focus:bg-white/80 focus:ring-2 focus:ring-teal-400 rounded-xl px-4 flex-1 shadow-inner placeholder:text-teal-900/30 transition-all"
                        />
                        <div className="text-[9px] font-black uppercase tracking-widest text-teal-900/50 text-center bg-white/50 px-2 py-1.5 rounded-lg border border-white/70 shadow-sm shrink-0">
                          Max 10
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeQuestion(therapy, idx)}
                          className="h-10 w-10 shrink-0 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl border border-rose-400/30 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
                
                <div className="pt-4 border-t-[1.5px] border-white/40 flex gap-3 mt-auto shrink-0">
                   <Button 
                     variant="outline" 
                     onClick={() => addQuestion(therapy)}
                     className="flex-1 h-12 bg-white/40 hover:bg-white/60 border-[1.5px] border-white/70 text-teal-950 font-black text-[10px] uppercase tracking-widest shadow-sm rounded-xl transition-all"
                   >
                     <Plus className="h-4 w-4 mr-2" /> Add
                   </Button>
                   <Button 
                     onClick={() => saveForTherapy(therapy)} 
                     disabled={savingFor === therapy}
                     className="flex-1 h-12 bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-black text-[10px] uppercase tracking-widest shadow-[0_4px_15px_rgba(20,184,166,0.3)] rounded-xl transition-all hover:scale-[1.02] hover:-translate-y-0.5"
                   >
                     {savingFor === therapy ? "Saving..." : <><Save className="h-4 w-4 mr-2" /> Save</>}
                   </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}