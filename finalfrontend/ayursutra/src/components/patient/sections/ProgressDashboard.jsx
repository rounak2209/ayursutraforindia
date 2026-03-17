import React, { useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api"; 
import CircularProgressSVG from "./CircularProgressSVG";
import LineChartSVG from "./LineChartSVG";
import VerticalTimeline from "./VerticalTimeline";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; 
import { Activity, ClipboardCheck, TrendingUp, CheckCircle, Calendar, Maximize2, X, Sparkles } from "lucide-react";

export default function ProgressDashboard({ patientId }) {
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState(null);
  const [selectedTherapy, setSelectedTherapy] = useState(null);
  const [dailyQuestions, setDailyQuestions] = useState([]); 
  const [answers, setAnswers] = useState({}); 
  const [answered, setAnswered] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    let pid = patientId;
    if (!pid) pid = localStorage.getItem("userId");
    
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiGet(`/api/progress/patient/${pid}`);
        setPayload(data);
        if (data?.therapies?.length && !selectedTherapy) setSelectedTherapy(data.therapies[0]);
      } catch (err) {
        console.error("Failed to load progress:", err);
        setPayload(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [patientId, refreshTrigger]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const res = await apiGet("/api/progress-responses/today");
        if (Array.isArray(res)) {
          const latestQuestionsMap = {};
          res.forEach((doc) => { latestQuestionsMap[doc.therapyType] = doc; });
          setDailyQuestions(Object.values(latestQuestionsMap));
        } else {
          setDailyQuestions([]);
        }
      } catch (err) { console.error(err); }
    };
    loadQuestions();
  }, [refreshTrigger]);

  const handleAnswerChange = (responseId, idx, value) => {
    setAnswers(prev => ({ ...prev, [responseId]: { ...prev[responseId], [idx]: value } }));
  };

  const handleSubmitAnswers = async (responseId) => {
    const responseDoc = dailyQuestions.find(d => d._id === responseId);
    if (!responseDoc) return;
    const ansObj = answers[responseId] || {};
    const ansArray = responseDoc.questions.map((_, idx) => ansObj[idx] !== undefined ? Number(ansObj[idx]) : 0);
    try {
      await apiPut(`/api/progress-responses/${responseId}`, { answers: ansArray });
      setAnswered(prev => ({ ...prev, [responseId]: true }));
      setRefreshTrigger(prev => prev + 1);
    } catch (err) { console.error("Failed to submit answers:", err); }
  };

  if (loading) return <div className="flex items-center justify-center h-96 text-teal-800 font-black tracking-widest uppercase animate-pulse">Analyzing healing data...</div>;
  if (!payload) return <div className="text-center py-20 text-teal-900/50 font-bold bg-white/20 backdrop-blur-xl border-[1.5px] border-white/40 rounded-[3rem] shadow-sm">No progress data available yet.</div>;

  const therapies = payload?.therapies || [];

  return (
    <div className="relative animate-in fade-in duration-700 w-full max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border-[1.5px] border-white/70 shadow-sm backdrop-blur-md mb-3">
             <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
             <span className="text-teal-900 font-extrabold text-[10px] tracking-widest uppercase">Analytics Hub</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-teal-950 flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-white/50 backdrop-blur-xl rounded-2xl border-[1.5px] border-white/70 flex items-center justify-center shadow-sm">
               <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            Recovery Progress
          </h2>
        </div>
      </div>

      {/* THERAPY OVERVIEW CARDS (GLASSMORPHISM) */}
      <div className="grid md:grid-cols-3 gap-6 relative z-10">
        {therapies.map((t) => {
          const isSelected = selectedTherapy?.assignedTherapyId === t.assignedTherapyId;
          return (
            <div 
              key={t.assignedTherapyId} 
              onClick={() => setSelectedTherapy(t)}
              className={`
                group relative overflow-hidden rounded-[2.5rem] p-6 cursor-pointer transition-all duration-500 flex flex-col items-center justify-center min-h-[220px]
                ${isSelected 
                  ? 'bg-white/40 backdrop-blur-md border-[2px] border-teal-400 shadow-[0_15px_40px_rgba(20,184,166,0.2)] scale-[1.02]' 
                  : 'bg-white/20 backdrop-blur-[30px] border-[1.5px] border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:bg-white/30 hover:shadow-[0_15px_40px_rgba(20,184,166,0.15)] hover:-translate-y-1 hover:border-white/80'
                }
              `}
              style={{ background: isSelected ? '' : 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)' }}
            >
              {isSelected && <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-emerald-400/10 pointer-events-none"></div>}
              
              <div className="relative z-10 drop-shadow-sm transition-transform duration-500 group-hover:scale-105">
                <CircularProgressSVG 
                  sessionsCompleted={t.dailyCount} 
                  totalSessions={t.totalSessions} 
                  label={t.therapy} 
                  size={140}
                />
              </div>
              
              <div className={`mt-4 text-center transition-all duration-500 ${isSelected ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"}`}>
                 <span className="px-3 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full text-[10px] font-black text-teal-900 uppercase tracking-widest shadow-sm">
                   {isSelected ? 'Currently Viewing' : 'Click to View'}
                 </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAILED ANALYSIS SECTION (LIQUID GLASS) */}
      {selectedTherapy && (
        <div className="relative rounded-[3rem] overflow-hidden bg-white/20 backdrop-blur-[40px] border-[1.5px] border-white/50 shadow-[0_20px_60px_-10px_rgba(20,184,166,0.15)] p-8 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-400/20 rounded-full blur-[80px] pointer-events-none z-0"></div>
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-400/20 rounded-full blur-[80px] pointer-events-none z-0"></div>

          <div className="flex items-center gap-4 mb-10 relative z-10">
             <div className="w-16 h-16 bg-white/40 backdrop-blur-md rounded-2xl border-[1.5px] border-white/70 shadow-sm flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-emerald-600 drop-shadow-sm" />
             </div>
             <div>
               <h3 className="text-3xl font-black text-teal-950 tracking-tight leading-none mb-1">{ selectedTherapy.therapy} Analytics</h3>
               <p className="text-xs font-bold text-teal-900/60 uppercase tracking-widest">Real-time recovery data</p>
             </div>
          </div>

          <div className="relative z-10">
             <TherapyTrend 
               assignedTherapyId={selectedTherapy.assignedTherapyId} 
               refreshTrigger={refreshTrigger}
             />
          </div>
        </div>
      )}
      
      {/* DAILY QUESTIONS SECTION */}
      <div className="space-y-6 relative z-10 pt-4">
        <h3 className="text-2xl font-black text-teal-950 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-xl border-[1.5px] border-white/60 flex items-center justify-center shadow-sm">
            <ClipboardCheck className="w-5 h-5 text-indigo-600" />
          </div>
          Pending Feedback
        </h3>
        
        {dailyQuestions.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {dailyQuestions.map(doc => (
              <div key={doc._id} className="relative overflow-hidden bg-white/30 backdrop-blur-2xl rounded-[2.5rem] border-[1.5px] border-white/50 p-8 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_40px_rgba(20,184,166,0.1)] transition-all duration-500">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-400 to-teal-400"></div>
                
                <div className="flex justify-between items-start mb-8 pl-2 relative z-10">
                  <div>
                    <h4 className="font-black text-2xl text-teal-950 leading-tight mb-1">{doc.therapyType}</h4>
                    <p className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest">Daily Check-in Required</p>
                  </div>
                  <div className="px-4 py-1.5 bg-white/50 border border-white/70 rounded-full text-[10px] font-black text-teal-900 uppercase tracking-widest shadow-sm">
                    {new Date(doc.dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                <div className="space-y-4 pl-2 relative z-10">
                  {doc.questions.map((q, idx) => (
                    <div key={idx} className="bg-white/40 backdrop-blur-md p-5 rounded-[1.5rem] border-[1.5px] border-white/60 shadow-sm hover:bg-white/50 transition-colors">
                      <p className="text-sm font-bold text-teal-950 mb-4">{q.text}</p>
                      
                      {answered[doc._id] || doc.percentage > 0 ? (
                        <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-widest bg-emerald-400/20 border border-emerald-400/30 px-4 py-2 rounded-xl w-fit shadow-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-600" /> Answered
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-4 bg-white/30 p-2 pl-4 rounded-xl border border-white/50">
                           <span className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest">Rating (0-{q.maxScore})</span>
                           <input
                            type="number"
                            min="0"
                            max={q.maxScore}
                            className="w-16 h-10 bg-white/80 border-[1.5px] border-white/90 rounded-lg text-center font-black text-teal-950 shadow-inner focus:ring-2 focus:ring-teal-400 outline-none transition-all"
                            placeholder="-"
                            value={answers[doc._id]?.[idx] ?? ""}
                            onChange={(e) => handleAnswerChange(doc._id, idx, e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {!(answered[doc._id] || doc.percentage > 0) && (
                  <div className="mt-8 pl-2 relative z-10">
                    <Button 
                      className="w-full bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white rounded-full py-6 text-base font-black shadow-[0_8px_20px_rgba(20,184,166,0.3)] transition-all hover:scale-[1.02] hover:-translate-y-0.5" 
                      onClick={() => handleSubmitAnswers(doc._id)}
                    >
                      Submit Feedback
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white/20 backdrop-blur-[30px] rounded-[3rem] border-[1.5px] border-white/50 shadow-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-white/40 border border-white/60 rounded-full flex items-center justify-center mb-4 shadow-inner">
               <Sparkles className="w-10 h-10 text-teal-600" />
            </div>
            <p className="text-xl font-black text-teal-950">All caught up!</p>
            <p className="text-xs font-bold text-teal-900/60 mt-1 uppercase tracking-widest">No new questions for today.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TherapyTrend({ assignedTherapyId, refreshTrigger }) {
  const [daily, setDaily] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandChart, setExpandChart] = useState(false); 
  
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await apiGet(`/api/progress/therapy/${assignedTherapyId}`);
        setMeta(res.assignedTherapy);
        setDaily(res.daily || []);
      } catch (err) { setDaily([]); } 
      finally { setLoading(false); }
    };
    load();
  }, [assignedTherapyId, refreshTrigger]);

  const sessionsDone = meta?.sessionsCompleted ? Number(meta.sessionsCompleted) : 0;
  const totalNeeded = meta?.duration ? parseInt(meta.duration) : 1;
  const latestRecovery = daily.length > 0 ? daily[daily.length - 1].percentage : 0;

  const milestones = [
    { title: "Started Journey", description: "First session completed successfully.", achieved: sessionsDone >= 1 },
    { title: "Halfway Point", description: "You are making consistent progress.", achieved: totalNeeded > 0 && sessionsDone >= (totalNeeded / 2) },
    { title: "Significant Recovery", description: "Body is responding well to therapy.", achieved: totalNeeded > 0 && sessionsDone >= (totalNeeded * 0.8) },
    { title: "Protocol Complete", description: "Full therapy cycle finished.", achieved: totalNeeded > 0 && sessionsDone >= totalNeeded }
  ];

  if (loading) return <div className="p-10 text-center animate-pulse font-black text-teal-800 uppercase tracking-widest">Loading trend analysis...</div>;

  return (
    <div className="space-y-8">
      {/* Stat Card */}
      <div className="bg-gradient-to-r from-teal-500 to-emerald-400 rounded-[2rem] p-8 text-white shadow-[0_10px_30px_rgba(16,185,129,0.3)] flex items-center justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10">
           <p className="text-white/80 font-black text-[10px] uppercase tracking-widest mb-1.5">Current Recovery Score</p>
           <h3 className="text-5xl font-black drop-shadow-md">{latestRecovery}%</h3>
        </div>
        <div className="h-16 w-16 bg-white/20 backdrop-blur-md border border-white/40 rounded-2xl flex items-center justify-center shadow-inner relative z-10 rotate-3 group-hover:rotate-12 transition-transform duration-500">
           <Activity className="w-8 h-8 text-white drop-shadow-sm" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Chart Section - Clickable */}
        <div 
          className="bg-white/30 backdrop-blur-md rounded-[2.5rem] p-6 border-[1.5px] border-white/60 shadow-sm cursor-pointer hover:shadow-[0_10px_30px_rgba(20,184,166,0.1)] hover:bg-white/40 transition-all duration-300 relative group flex flex-col"
          onClick={() => setExpandChart(true)}
        >
           <div className="absolute top-6 right-6 w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-teal-900/50 group-hover:text-teal-950 group-hover:bg-white/80 transition-all shadow-sm z-10">
              <Maximize2 className="w-5 h-5" />
           </div>
           
           <div className="h-[450px] w-full flex-1 flex items-center justify-center relative z-0">
              <LineChartSVG 
                data={daily.map(d => ({ dateString: d.dateString, percentage: d.percentage }))} 
                width={800} height={450} 
              />
           </div>
           <p className="text-center text-[10px] font-black text-teal-900/50 uppercase tracking-widest mt-4">Click to expand chart</p>
        </div>

        {/* Timeline & History */}
        <div className="space-y-6">
          <div className="bg-white/30 backdrop-blur-md rounded-[2.5rem] p-8 border-[1.5px] border-white/60 shadow-sm">
             <h4 className="font-black text-teal-950 mb-6 flex items-center gap-3 text-lg">
                <div className="p-2 bg-white/50 rounded-lg border border-white/70 shadow-sm"><CheckCircle className="w-5 h-5 text-emerald-600" /></div> Milestones
             </h4>
             <VerticalTimeline milestones={milestones} />
          </div>

          <div className="bg-white/30 backdrop-blur-md rounded-[2.5rem] p-8 border-[1.5px] border-white/60 shadow-sm max-h-[300px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/60 [&::-webkit-scrollbar-thumb]:rounded-full relative">
            <h4 className="font-black text-teal-950 mb-5 sticky top-0 bg-white/80 backdrop-blur-xl p-3 -mt-3 -mx-3 rounded-2xl flex items-center gap-3 text-lg shadow-sm z-10">
               <div className="p-2 bg-white/50 rounded-lg border border-white/70 shadow-sm"><Calendar className="w-5 h-5 text-indigo-600" /></div> Recent Sessions
            </h4>
            <div className="space-y-3 pt-2">
              {daily.slice().reverse().map((d, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-[1.25rem] bg-white/40 hover:bg-white/60 transition-colors border-[1.5px] border-white/50 shadow-sm">
                  <span className="text-xs font-black text-teal-950 uppercase tracking-widest">
                    {new Date(d.dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                  <Badge className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-sm border border-white/50
                    ${d.percentage >= 70 ? 'bg-emerald-400/30 text-emerald-900' : 
                      d.percentage >= 40 ? 'bg-amber-400/30 text-amber-900' : 
                      'bg-rose-400/30 text-rose-900'}
                  `}>
                    {d.percentage}% Recovery
                  </Badge>
                </div>
              ))}
              {daily.length === 0 && <p className="text-xs font-bold text-teal-900/50 uppercase tracking-widest text-center py-4 bg-white/20 rounded-xl border border-dashed border-white/50">No daily logs yet.</p>}
            </div>
          </div>
        </div>
      </div>

      {}
      {expandChart && (
        <div className="fixed inset-0 z-[100] bg-teal-950/60 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300" onClick={() => setExpandChart(false)}>
          <div className="bg-white/20 backdrop-blur-[50px] border-[1.5px] border-white/60 rounded-[3rem] p-6 md:p-10 w-full max-w-6xl h-[85vh] shadow-[0_30px_80px_rgba(0,0,0,0.3)] relative flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-400/20 rounded-full blur-[80px] pointer-events-none z-0"></div>
            
            <button onClick={() => setExpandChart(false)} className="absolute top-6 right-6 md:top-8 md:right-8 p-3 bg-white/30 hover:bg-white/50 text-teal-950 rounded-full transition-all shadow-sm border border-white/50 hover:rotate-90 z-50">
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
               <div className="w-14 h-14 bg-white/40 backdrop-blur-md rounded-2xl border-[1.5px] border-white/70 shadow-sm flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600 drop-shadow-sm" />
               </div>
               <h3 className="text-2xl md:text-3xl font-black text-teal-950 tracking-tight">Expanded Recovery Trend</h3>
            </div>

              <div className="flex-1 w-full min-h-0 bg-white/90 backdrop-blur-3xl border-[1.5px] border-white/80 rounded-[2rem] p-4 flex items-center justify-center shadow-lg relative z-10">
              <LineChartSVG 
                data={daily.map(d => ({ dateString: d.dateString, percentage: d.percentage }))} 
                width={1200} height={600} 
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}