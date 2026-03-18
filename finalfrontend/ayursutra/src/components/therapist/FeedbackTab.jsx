import React, { useEffect, useState, useMemo } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {CheckCircle2, Trash2, Plus, Send, Settings, History, Save, FileText, MessageSquare, Activity, Search, Filter, X, Calendar, User, Phone, Mail, Clock, Play, CheckSquare, ChevronRight, ExternalLink } from "lucide-react";
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

export default function FeedbackTab() {
  const [patients, setPatients] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTherapy, setFilterTherapy] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const [isRequestOpen, setIsRequestOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);

  const [globalGeneral, setGlobalGeneral] = useState([]);
  const [globalTherapy, setGlobalTherapy] = useState({});
  
  const [questions, setQuestions] = useState([]); 
  const [selectedTherapy, setSelectedTherapy] = useState("");
  
  const [genNewText, setGenNewText] = useState("");
  const [genNewType, setGenNewType] = useState("scale");
  const [thNewText, setThNewText] = useState("");
  const [thNewType, setThNewType] = useState("scale");

  const therapistId = localStorage.getItem("userId");
  const THERAPY_TYPES = ["Vamana", "Virechana", "Basti", "Nasya", "Raktamokshana"];

  useEffect(() => {
    if (therapistId) {
      loadPatients();
      loadTemplates();
    }
  }, [therapistId]);

  const loadPatients = async () => {
    try {
      const data = await apiGet(`/api/requests/therapists/${therapistId}/patients`);
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error(err); 
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await apiGet('/api/feedbacks/templates');
      if (data) {
        setGlobalGeneral(data.generalQuestions || []);
        setGlobalTherapy(data.therapyQuestions || {});
      }
    } catch (err) { 
      console.error(err); 
    }
  };

  const openRequestModal = (item) => {
    setSelectedPatient(item);

    const defaultGeneral = globalGeneral.map(q => ({
      ...q,
      id: `gen_${Date.now()}_${Math.random()}`, 
      category: 'general'
    }));

    let combinedQuestions = [...defaultGeneral];
    let initialTherapy = "";

    const tType = item.therapyType || item.therapy; 

    if (tType && THERAPY_TYPES.includes(tType)) {
       initialTherapy = tType;
       const specificQs = globalTherapy[tType] || [];
       
       if (specificQs.length > 0) {
         const formattedTherapyQs = specificQs.map(q => ({
            ...q,
            id: `th_${Date.now()}_${Math.random()}`,
            category: 'therapy'
         }));
         combinedQuestions = [...combinedQuestions, ...formattedTherapyQs];
       }
    }

    setQuestions(combinedQuestions);
    setSelectedTherapy(initialTherapy);

    setGenNewText(""); setGenNewType("scale");
    setThNewText(""); setThNewType("scale");
    
    setIsRequestOpen(true);
  };

  const handleTherapySelect = (val) => {
    setSelectedTherapy(val);

    const others = questions.filter(q => q.category !== 'therapy');
    
    const templateQs = globalTherapy[val] || [];

    const formatted = templateQs.map(q => ({
      ...q,
      id: `th_${Date.now()}_${Math.random()}`,
      category: 'therapy'
    }));

    setQuestions([...others, ...formatted]);
  };

  const addGeneralQuestion = () => {
    if (!genNewText) return;
    const newQ = {
      id: `cust_gen_${Date.now()}`,
      category: 'general',
      type: genNewType,
      text: genNewText
    };
    setQuestions([...questions, newQ]);
    setGenNewText("");
  };

  const addTherapyQuestion = () => {
    if (!thNewText) return;
    const newQ = {
      id: `cust_th_${Date.now()}`,
      category: 'therapy',
      type: thNewType,
      text: thNewText
    };
    setQuestions([...questions, newQ]);
    setThNewText("");
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const sendRequest = async () => {
    if(!selectedPatient) return;
    try {
      await apiPost('/api/feedbacks/request', {
        patientId: selectedPatient.patient._id,
        questions: questions
      });
      toast({ title: "Sent!", description: "Feedback request sent." });
      setIsRequestOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "Failed to send request", variant: "destructive" });
    }
  };

  const filteredPatients = useMemo(() => {
    return patients.filter(item => {
      const pName = item.patient?.name?.toLowerCase() || "";
      const pEmail = item.patient?.email?.toLowerCase() || "";
      const q = searchQuery.toLowerCase();
      
      const nameMatch = pName.includes(q) || pEmail.includes(q);
      const therapyMatch = filterTherapy === "all" || (item.therapyType === filterTherapy);
      
      let dateMatch = true;
      if (filterDate) {
        const itemDate = new Date(item.appointmentDate).toDateString();
        const filterD = new Date(filterDate).toDateString();
        dateMatch = itemDate === filterD;
      }

      return nameMatch && therapyMatch && dateMatch;
    });
  }, [patients, searchQuery, filterTherapy, filterDate]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterTherapy("all");
    setFilterDate("");
  };

  const openHistoryModal = async (item) => {
    setSelectedPatient(item);
    try {
      const data = await apiGet(`/api/feedbacks/history/${item.patient._id}`);
      setPatientHistory(data || []);
      setIsHistoryOpen(true);
    } catch (err) { console.error(err); }
  };

  const saveGlobalTemplates = async () => {
    try {
      await apiPost('/api/feedbacks/templates', {
        generalQuestions: globalGeneral,
        therapyQuestions: globalTherapy
      });
      toast({ title: "Templates Saved", description: "Future requests will use these defaults." });
      setIsTemplateOpen(false);
    } catch (err) { toast({ title: "Save Failed", variant: "destructive" }); }
  };

  const addGlobalGen = () => {
    setGlobalGeneral([...globalGeneral, { id: Date.now(), type: 'scale', text: 'New Question' }]);
  };

  const updateGlobalGen = (idx, field, val) => {
    const updated = [...globalGeneral];
    updated[idx][field] = val;
    setGlobalGeneral(updated);
  };

  return (
    <div className="relative animate-in fade-in duration-700 w-full max-w-7xl mx-auto space-y-8 pb-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border-[1.5px] border-white/70 shadow-sm backdrop-blur-md mb-3">
             <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></span>
             <span className="text-teal-900 font-extrabold text-[10px] tracking-widest uppercase">Communication Hub</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-teal-950 flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-white/50 backdrop-blur-xl rounded-2xl border-[1.5px] border-white/70 flex items-center justify-center shadow-sm">
               <MessageSquare className="w-6 h-6 text-teal-700" />
            </div>
            Patient Feedback
          </h2>
        </div>
        <Button onClick={() => setIsTemplateOpen(true)} className="w-full md:w-auto h-12 px-6 rounded-full bg-white/40 hover:bg-white/60 backdrop-blur-md border-[1.5px] border-white/70 text-teal-950 font-black shadow-sm transition-all flex items-center justify-center gap-2">
          <Settings className="w-4 h-4" /> Global Templates
        </Button>
      </div>

      <div className="bg-white/30 backdrop-blur-[40px] border-[1.5px] border-white/50 p-4 md:p-5 rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row gap-4 items-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-400/10 rounded-full blur-[40px] pointer-events-none"></div>
        
        <div className="relative flex-1 w-full z-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-teal-900/40" />
          <Input placeholder="Search patients..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-11 bg-white/50 hover:bg-white/70 border-[1.5px] border-white/70 h-12 rounded-[1.25rem] font-bold text-teal-950 placeholder:text-teal-900/40 shadow-inner focus:ring-2 focus:ring-teal-400 transition-all" />
        </div>
        <div className="w-full lg:w-48 z-10">
          <Select value={filterTherapy} onValueChange={setFilterTherapy}>
            <SelectTrigger className="bg-white/50 hover:bg-white/70 border-[1.5px] border-white/70 h-12 rounded-[1.25rem] font-bold text-teal-950 shadow-sm transition-all focus:ring-2 focus:ring-teal-400">
               <SelectValue placeholder="Therapy" />
            </SelectTrigger>
            <SelectContent className="bg-white/90 backdrop-blur-xl border-white/80 rounded-2xl shadow-xl">
               <SelectItem value="all" className="font-bold text-teal-950 focus:bg-teal-100">All Therapies</SelectItem>
               {THERAPY_TYPES.map(t => <SelectItem key={t} value={t} className="font-bold text-teal-950 focus:bg-teal-100">{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full lg:w-auto z-10">
           <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-white/50 hover:bg-white/70 border-[1.5px] border-white/70 h-12 rounded-[1.25rem] font-bold text-teal-950 shadow-sm focus:ring-2 focus:ring-teal-400 w-full lg:w-48 transition-all" />
        </div>
        {(searchQuery || filterTherapy !== "all" || filterDate) && (
          <Button variant="ghost" onClick={clearFilters} className="w-full lg:w-auto text-rose-700 hover:text-rose-900 hover:bg-rose-500/20 font-black uppercase tracking-widest text-[10px] h-12 px-5 rounded-[1.25rem] border-[1.5px] border-rose-400/30 transition-all z-10 bg-white/30">
             <X className="w-4 h-4 mr-1.5" /> Clear
          </Button>
        )}
      </div>

      {filteredPatients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/20 backdrop-blur-[30px] rounded-[3rem] border-[1.5px] border-white/50 shadow-sm relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/20 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="w-20 h-20 bg-white/40 border border-white/60 rounded-full flex items-center justify-center mb-4 shadow-inner relative z-10">
             <Filter className="w-10 h-10 text-teal-600/50" />
          </div>
          <h3 className="text-2xl font-black text-teal-950 relative z-10">No Matches</h3>
          <p className="text-xs font-bold text-teal-900/60 mt-1 uppercase tracking-widest relative z-10">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredPatients.map((item) => {
            const p = normalizePatient(item.patient);
            
            return (
              <div key={item.requestId || item._id} className="group relative overflow-hidden rounded-[2.5rem] bg-white/20 backdrop-blur-[30px] border-[1.5px] border-white/50 hover:shadow-[0_15px_40px_rgba(20,184,166,0.15)] hover:border-white/80 transition-all duration-500 flex flex-col" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)' }}>
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-teal-400/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>

                <div className="p-6 flex flex-col gap-6 relative z-10 h-full">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-white/40 border-[1.5px] border-white/70 shadow-[0_4px_15px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden backdrop-blur-md shrink-0">
                      {p.profilePic ? (
                          <img src={p.profilePic} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                          <span className="text-2xl font-black text-teal-800/50">{p.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <h3 className="text-xl font-black text-teal-950 truncate mb-2 drop-shadow-sm">{p.name}</h3>
                      {item.therapyType && <Badge className="bg-white/50 text-teal-950 border-[1.5px] border-white/70 shadow-sm px-3 py-1 text-[9px] font-black uppercase tracking-widest">{item.therapyType}</Badge>}
                    </div>
                  </div>

                  <div className="mt-auto space-y-3 pt-2">
                    <Button variant="outline" className="w-full bg-white/40 hover:bg-white/60 border-[1.5px] border-white/70 text-teal-950 shadow-sm h-12 rounded-xl font-black text-sm uppercase tracking-widest transition-all" onClick={() => openHistoryModal(item)}>
                      <History className="w-4 h-4 mr-2 text-teal-700" /> View History
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- MODAL 1: REQUEST COMPOSER --- */}
      <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
        <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-4xl w-[95vw] md:w-[90vw] max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 bg-white/30 backdrop-blur-[50px] border-[1.5px] border-white/60 shadow-[0_30px_80px_rgba(0,0,0,0.3)] rounded-[2rem] md:rounded-[3rem] [&::-webkit-scrollbar]:hidden z-[100] [&>button]:hidden">
          
          <div className="relative w-full min-w-0">
            <div className="p-6 md:p-10 border-b border-white/30 flex items-center justify-between gap-4 md:gap-6 relative overflow-hidden bg-white/10" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(255,255,255,0.05) 100%)' }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-[60px] pointer-events-none -z-10"></div>
              
              <div className="flex items-center gap-3 md:gap-4 relative z-10 w-full min-w-0">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white/40 backdrop-blur-md rounded-xl md:rounded-2xl border-[1.5px] border-white/70 shadow-sm flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5 md:w-6 md:h-6 text-teal-800 drop-shadow-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl md:text-3xl font-black text-teal-950 tracking-tight leading-none mb-1 drop-shadow-sm truncate">Request Feedback</DialogTitle>
                  <DialogDescription className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-teal-900/60 truncate">For {selectedPatient?.patient?.name}</DialogDescription>
                </div>
              </div>
              <button onClick={() => setIsRequestOpen(false)} className="text-teal-900 hover:text-teal-950 transition-colors bg-white/40 rounded-full p-2 backdrop-blur-md border border-white/50 shadow-sm relative z-50 shrink-0">
                 <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
            
            <div className="p-4 md:p-10 space-y-6 md:space-y-8 relative z-10 w-full overflow-hidden">
              
              {/* General Qs */}
              <div className="bg-white/40 backdrop-blur-md p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-[1.5px] border-white/60 shadow-sm relative overflow-hidden group max-w-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                <h3 className="font-black text-base md:text-lg text-teal-950 mb-4 md:mb-6 flex items-center gap-2 md:gap-3 uppercase tracking-widest border-b-[1.5px] border-white/50 pb-3 md:pb-4 relative z-10"><Activity className="w-4 h-4 md:w-5 md:h-5 text-blue-600" /> General Health</h3>
                
                <div className="space-y-3 md:space-y-4 relative z-10 max-w-full">
                  {questions.filter(q => q.category === 'general').map(q => (
                    <div key={q.id} className="flex flex-col sm:flex-row gap-2 md:gap-3 items-start sm:items-center bg-white/50 p-3 rounded-xl md:rounded-[1.25rem] border border-white/70 shadow-sm w-full max-w-full overflow-hidden">
                      <Badge className="bg-white/80 text-teal-950 border border-white/90 shadow-none px-3 py-1 uppercase tracking-widest text-[9px] shrink-0 w-full sm:w-20 justify-center">{q.type}</Badge>
                      <Input value={q.text} onChange={(e) => setQuestions(questions.map(x => x.id === q.id ? {...x, text: e.target.value} : x))} className="h-10 bg-white/40 border-[1.5px] border-white/60 rounded-xl font-bold text-teal-950 focus:bg-white/80 transition-colors flex-1 w-full min-w-0" />
                      <Button size="icon" variant="ghost" className="h-10 w-full sm:w-10 shrink-0 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl border border-rose-400/30" onClick={() => removeQuestion(q.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-6 pt-4 md:pt-6 border-t-[1.5px] border-white/50 items-center relative z-10 bg-white/20 p-3 md:p-4 rounded-xl md:rounded-[1.5rem] w-full max-w-full">
                   <Select value={genNewType} onValueChange={setGenNewType}>
                      <SelectTrigger className="w-full sm:w-[120px] h-12 bg-white/60 border-[1.5px] border-white/80 rounded-xl md:rounded-[1rem] font-black text-xs text-teal-950 shrink-0"><SelectValue /></SelectTrigger>
                      <SelectContent className="bg-white/90 backdrop-blur-xl border-white/80 rounded-2xl shadow-xl"><SelectItem value="scale" className="font-bold">Scale</SelectItem><SelectItem value="binary" className="font-bold">Yes/No</SelectItem><SelectItem value="text" className="font-bold">Text</SelectItem></SelectContent>
                   </Select>
                   <Input placeholder="Type custom general question..." value={genNewText} onChange={e=>setGenNewText(e.target.value)} className="h-12 bg-white/60 border-[1.5px] border-white/80 rounded-xl md:rounded-[1rem] font-bold text-teal-950 placeholder:text-teal-900/40 w-full flex-1 min-w-0" />
                   <Button variant="secondary" onClick={addGeneralQuestion} className="h-auto min-h-[3rem] px-6 py-2 rounded-xl md:rounded-[1rem] bg-teal-500/20 hover:bg-teal-500/30 text-teal-950 font-black uppercase tracking-widest border border-teal-400/50 shadow-sm w-full sm:w-auto shrink-0 whitespace-normal break-words"><Plus className="w-4 h-4 mr-2 inline"/> Add</Button>
                </div>
              </div>

              {/* Therapy Qs */}
              <div className="bg-white/40 backdrop-blur-md p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-[1.5px] border-white/60 shadow-sm relative overflow-hidden group max-w-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-400/10 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>
                
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-4 mb-4 md:mb-6 border-b-[1.5px] border-white/50 pb-3 md:pb-4 relative z-10">
                  <h3 className="font-black text-base md:text-lg text-teal-950 flex items-center gap-2 md:gap-3 uppercase tracking-widest"><FileText className="w-4 h-4 md:w-5 md:h-5 text-purple-600" /> Therapy Specific</h3>
                  <Select value={selectedTherapy} onValueChange={handleTherapySelect}>
                    <SelectTrigger className="w-full md:w-[200px] h-12 bg-purple-500/10 border-[1.5px] border-purple-400/30 rounded-xl md:rounded-[1rem] font-black text-xs text-purple-950 uppercase tracking-widest shadow-sm"><SelectValue placeholder="Select Therapy" /></SelectTrigger>
                    <SelectContent className="bg-white/90 backdrop-blur-xl border-white/80 rounded-2xl shadow-xl">{THERAPY_TYPES.map(t => <SelectItem key={t} value={t} className="font-bold">{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3 md:space-y-4 relative z-10 max-w-full">
                  {questions.filter(q => q.category === 'therapy').map(q => (
                    <div key={q.id} className="flex flex-col sm:flex-row gap-2 md:gap-3 items-start sm:items-center bg-white/50 p-3 rounded-xl md:rounded-[1.25rem] border border-white/70 shadow-sm w-full max-w-full overflow-hidden">
                      <Badge className="bg-purple-500/20 text-purple-950 border border-purple-400/50 shadow-none px-3 py-1 uppercase tracking-widest text-[9px] shrink-0 w-full sm:w-20 justify-center">{q.type}</Badge>
                      <Input value={q.text} onChange={(e) => setQuestions(questions.map(x => x.id === q.id ? {...x, text: e.target.value} : x))} className="h-10 bg-white/40 border-[1.5px] border-white/60 rounded-xl font-bold text-teal-950 focus:bg-white/80 transition-colors flex-1 w-full min-w-0" />
                      <Button size="icon" variant="ghost" className="h-10 w-full sm:w-10 shrink-0 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl border border-rose-400/30" onClick={() => removeQuestion(q.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  ))}
                  {questions.filter(q => q.category === 'therapy').length === 0 && (
                      <div className="text-center py-4 md:py-6 text-teal-900/50 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-white/30 rounded-xl md:rounded-2xl border border-dashed border-white/60">No therapy questions added.</div>
                  )}
                </div>
                
                {selectedTherapy && (
                    <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-6 pt-4 md:pt-6 border-t-[1.5px] border-white/50 items-center relative z-10 bg-white/20 p-3 md:p-4 rounded-xl md:rounded-[1.5rem] w-full max-w-full">
                      <Select value={thNewType} onValueChange={setThNewType}>
                        <SelectTrigger className="w-full sm:w-[120px] h-12 bg-white/60 border-[1.5px] border-white/80 rounded-xl md:rounded-[1rem] font-black text-xs text-teal-950 shrink-0"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-white/90 backdrop-blur-xl border-white/80 rounded-2xl shadow-xl"><SelectItem value="scale" className="font-bold">Scale</SelectItem><SelectItem value="binary" className="font-bold">Yes/No</SelectItem><SelectItem value="text" className="font-bold">Text</SelectItem></SelectContent>
                      </Select>
                      <Input placeholder={`Type custom ${selectedTherapy} question...`} value={thNewText} onChange={e=>setThNewText(e.target.value)} className="h-12 bg-white/60 border-[1.5px] border-white/80 rounded-xl md:rounded-[1rem] font-bold text-teal-950 placeholder:text-teal-900/40 flex-1 w-full min-w-0" />
                      <Button variant="secondary" onClick={addTherapyQuestion} className="h-auto min-h-[3rem] px-6 py-2 rounded-xl md:rounded-[1rem] bg-purple-500/20 hover:bg-purple-500/30 text-purple-950 font-black uppercase tracking-widest border border-purple-400/50 shadow-sm w-full sm:w-auto shrink-0 whitespace-normal break-words"><Plus className="w-4 h-4 mr-2 inline"/> Add</Button>
                    </div>
                )}
              </div>
            </div>
            
            <div className="p-4 md:p-8 bg-white/20 border-t-[1.5px] border-white/40 flex flex-col sm:flex-row justify-end gap-3 md:gap-4 w-full">
               <Button onClick={() => setIsRequestOpen(false)} variant="outline" className="w-full sm:w-auto bg-white/50 hover:bg-white/70 border-[1.5px] border-white/80 text-teal-950 shadow-sm h-12 md:h-14 px-6 md:px-8 rounded-full font-black uppercase tracking-widest transition-all">Cancel</Button>
               <Button onClick={sendRequest} className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white shadow-[0_8px_20px_rgba(20,184,166,0.3)] h-12 md:h-14 px-8 md:px-10 rounded-full font-black uppercase tracking-widest transition-all hover:scale-[1.02] hover:-translate-y-0.5"><Send className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Send Request</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 2: HISTORY --- */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-3xl w-[95vw] md:w-[90vw] max-h-[85vh] overflow-y-auto overflow-x-hidden p-0 bg-white/30 backdrop-blur-[50px] border-[1.5px] border-white/60 shadow-[0_30px_80px_rgba(0,0,0,0.3)] rounded-[2rem] md:rounded-[3rem] [&::-webkit-scrollbar]:hidden z-[100] [&>button]:hidden">
          
          <div className="relative w-full min-w-0">
            <div className="p-6 md:p-10 border-b border-white/30 flex items-center justify-between gap-4 md:gap-6 relative overflow-hidden bg-white/10" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(255,255,255,0.05) 100%)' }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-[60px] pointer-events-none -z-10"></div>
              
              <div className="flex items-center gap-3 md:gap-4 relative z-10 w-full min-w-0">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white/40 backdrop-blur-md rounded-xl md:rounded-2xl border-[1.5px] border-white/70 shadow-sm flex items-center justify-center shrink-0">
                  <History className="w-5 h-5 md:w-6 md:h-6 text-teal-800 drop-shadow-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl md:text-3xl font-black text-teal-950 tracking-tight leading-none mb-1 drop-shadow-sm truncate">History</DialogTitle>
                  <DialogDescription className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-teal-900/60 truncate">For {selectedPatient?.patient?.name}</DialogDescription>
                </div>
              </div>
              <button onClick={() => setIsHistoryOpen(false)} className="text-teal-900 hover:text-teal-950 transition-colors bg-white/40 rounded-full p-2 backdrop-blur-md border border-white/50 shadow-sm relative z-50 shrink-0">
                 <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
            
            <div className="p-4 md:p-10 space-y-4 md:space-y-6 relative z-10 w-full overflow-hidden">
              {patientHistory.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 md:py-16 bg-white/30 backdrop-blur-md rounded-[1.5rem] md:rounded-[2rem] border-[1.5px] border-white/50 shadow-inner w-full">
                   <div className="w-12 h-12 md:w-16 md:h-16 bg-white/50 rounded-full flex items-center justify-center mb-3 md:mb-4 shadow-sm border border-white/70">
                     <History className="w-6 h-6 md:w-8 md:h-8 text-teal-600/50" />
                   </div>
                   <p className="text-base md:text-lg font-black text-teal-950">No History Found</p>
                   <p className="text-[9px] md:text-[10px] font-bold text-teal-900/60 uppercase tracking-widest mt-1 text-center px-4">Patient hasn't submitted feedback yet.</p>
                </div>
              ) : patientHistory.map(sess => (
                <div key={sess._id} className="bg-white/40 backdrop-blur-md border-[1.5px] border-white/60 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden group hover:bg-white/50 transition-colors w-full">
                   <div className="bg-white/30 px-4 md:px-6 py-3 md:py-4 border-b border-white/50 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 relative z-10">
                      <span className="font-black text-xs md:text-sm text-teal-950 flex items-center gap-2 truncate"><Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-teal-700 shrink-0"/> {new Date(sess.respondedAt).toLocaleDateString("en-IN", { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      <Badge className="bg-emerald-500/20 text-emerald-950 border border-emerald-400/50 shadow-none px-2 md:px-3 py-1 uppercase tracking-widest text-[8px] md:text-[9px] flex items-center gap-1.5 w-fit shrink-0"><CheckCircle2 className="w-3 h-3"/> Completed</Badge>
                   </div>
                   <div className="p-4 md:p-6 space-y-3 md:space-y-4 relative z-10 w-full">
                      {sess.questions.map((q, i) => (
                         <div key={i} className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl bg-white/30 border border-white/50 shadow-sm w-full max-w-full overflow-hidden">
                            <span className="text-xs md:text-sm font-bold text-teal-950 leading-relaxed flex-1 w-full min-w-0 break-words">{q.text}</span>
                            <div className="px-3 md:px-4 py-1.5 rounded-lg md:rounded-xl bg-white/60 border border-white/80 font-black text-teal-950 text-xs md:text-sm shadow-sm whitespace-nowrap w-fit shrink-0">
                              {String(q.answer)}
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MODAL 3: TEMPLATES (FIXED FOR HORIZONTAL OVERFLOW ON MOBILE) --- */}
      <Dialog open={isTemplateOpen} onOpenChange={setIsTemplateOpen}>
        <DialogContent className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] max-w-5xl w-[95vw] md:w-[90vw] max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 bg-white/30 backdrop-blur-[50px] border-[1.5px] border-white/60 shadow-[0_30px_80px_rgba(0,0,0,0.3)] rounded-[2rem] md:rounded-[3rem] [&::-webkit-scrollbar]:hidden z-[100] [&>button]:hidden">
          
          <div className="relative w-full min-w-0">
            <div className="p-6 md:p-10 border-b border-white/30 flex items-center justify-between gap-4 md:gap-6 relative overflow-hidden bg-white/10" style={{ background: 'linear-gradient(135deg, rgba(20,184,166,0.2) 0%, rgba(255,255,255,0.05) 100%)' }}>
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-[60px] pointer-events-none -z-10"></div>
              
              <div className="flex items-center gap-3 md:gap-4 relative z-10 w-full min-w-0">
                <div className="w-10 h-10 md:w-14 md:h-14 bg-white/40 backdrop-blur-md rounded-xl md:rounded-2xl border-[1.5px] border-white/70 shadow-sm flex items-center justify-center shrink-0">
                  <Settings className="w-5 h-5 md:w-6 md:h-6 text-teal-800 drop-shadow-sm" />
                </div>
                <div className="min-w-0 flex-1">
                  <DialogTitle className="text-xl md:text-3xl font-black text-teal-950 tracking-tight leading-none mb-1 drop-shadow-sm truncate">Templates</DialogTitle>
                  <DialogDescription className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-teal-900/60 hidden sm:block truncate">Configure default questions for all patients</DialogDescription>
                </div>
              </div>
              <button onClick={() => setIsTemplateOpen(false)} className="text-teal-900 hover:text-teal-950 transition-colors bg-white/40 rounded-full p-2 backdrop-blur-md border border-white/50 shadow-sm relative z-50 shrink-0">
                 <X className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
            
            <div className="p-4 md:p-10 relative z-10 w-full min-w-0">
              <Tabs defaultValue="general" className="w-full flex flex-col min-w-0">
                <TabsList className="flex flex-col sm:flex-row w-full max-w-md mx-auto bg-white/30 backdrop-blur-xl p-1.5 rounded-2xl sm:rounded-full mb-6 md:mb-10 border-[1.5px] border-white/60 shadow-[0_8px_30px_rgba(0,0,0,0.05)] h-auto sm:h-14">
                  <TabsTrigger value="general" className="w-full sm:flex-1 py-3 sm:py-0 rounded-xl sm:rounded-full font-black text-[10px] sm:text-sm uppercase tracking-widest data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-teal-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-teal-900/60 h-full">
                    General Health
                  </TabsTrigger>
                  <TabsTrigger value="therapy" className="w-full sm:flex-1 py-3 sm:py-0 rounded-xl sm:rounded-full font-black text-[10px] sm:text-sm uppercase tracking-widest data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-teal-400 data-[state=active]:text-white data-[state=active]:shadow-md transition-all text-teal-900/60 h-full mt-1 sm:mt-0">
                    Therapy Specific
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="mt-0 w-full min-w-0">
                  <div className="bg-white/40 backdrop-blur-md p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-[1.5px] border-white/60 shadow-sm w-full min-w-0 overflow-hidden">
                     <div className="space-y-3 md:space-y-4 mb-5 md:mb-6 w-full min-w-0">
                        {globalGeneral.map((q, idx) => (
                           <div key={idx} className="flex flex-col sm:flex-row gap-2 md:gap-3 items-start sm:items-center bg-white/50 p-3 rounded-xl md:rounded-[1.25rem] border border-white/70 shadow-sm w-full min-w-0 overflow-hidden">
                              <Badge className="bg-white/80 text-teal-950 border border-white/90 shadow-none px-3 md:px-4 py-1.5 md:py-2 uppercase tracking-widest text-[9px] md:text-[10px] shrink-0 w-full sm:w-24 justify-center">{q.type}</Badge>
                              <Input value={q.text} onChange={(e) => updateGlobalGen(idx, 'text', e.target.value)} className="h-10 md:h-12 bg-white/40 border-[1.5px] border-white/60 rounded-xl font-bold text-teal-950 focus:bg-white/80 transition-colors flex-1 w-full min-w-0 text-sm md:text-base" />
                              <Button size="icon" variant="ghost" className="h-10 md:h-12 w-full sm:w-12 shrink-0 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl border border-rose-400/30" onClick={() => setGlobalGeneral(globalGeneral.filter((_, i) => i !== idx))}><Trash2 className="w-4 h-4 md:w-5 md:h-5" /></Button>
                           </div>
                        ))}
                     </div>
                     <Button variant="secondary" onClick={addGlobalGen} className="w-full h-auto min-h-[3rem] md:min-h-[3.5rem] py-2 rounded-xl md:rounded-[1.25rem] bg-teal-500/20 hover:bg-teal-500/30 text-teal-950 font-black text-xs md:text-sm uppercase tracking-widest border-[1.5px] border-teal-400/50 shadow-sm transition-all border-dashed whitespace-normal break-words flex items-center justify-center"><Plus className="w-4 h-4 md:w-5 md:h-5 mr-2 shrink-0"/> Add General Question</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="therapy" className="mt-0 w-full min-w-0">
                  <div className="bg-white/40 backdrop-blur-md p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border-[1.5px] border-white/60 shadow-sm w-full min-w-0 overflow-hidden">
                     <Tabs defaultValue="Vamana" className="w-full flex flex-col md:flex-row gap-4 md:gap-8 min-w-0">
                        
                       
                        <div className="w-full min-w-0 overflow-hidden md:w-56 shrink-0">
                           <TabsList className="flex flex-row md:flex-col h-auto w-full bg-white/30 backdrop-blur-md p-2 rounded-2xl md:rounded-[1.5rem] border-[1.5px] border-white/50 shadow-inner gap-2 overflow-x-auto flex-nowrap pb-3 md:pb-2 scrollbar-hide">
                              {THERAPY_TYPES.map(t => 
                                <TabsTrigger key={t} value={t} className="w-fit md:w-full justify-center md:justify-start px-4 md:px-5 py-2.5 md:py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest data-[state=active]:bg-white/80 data-[state=active]:text-teal-950 data-[state=active]:shadow-sm text-teal-900/60 transition-all border-[1.5px] border-transparent data-[state=active]:border-white/90 whitespace-nowrap shrink-0">
                                  {t}
                                </TabsTrigger>
                              )}
                           </TabsList>
                        </div>
                        
                        <div className="flex-1 w-full min-w-0 overflow-hidden">
                          {THERAPY_TYPES.map(t => (
                             <TabsContent key={t} value={t} className="space-y-4 md:space-y-6 mt-0 w-full min-w-0">
                                <h3 className="font-black text-lg md:text-xl text-teal-950 drop-shadow-sm mb-3 md:mb-4 border-b-[1.5px] border-white/50 pb-2 md:pb-4 truncate">{t} Questions</h3>
                                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6 w-full min-w-0">
                                  {(globalTherapy[t] || []).map((q, idx) => (
                                     <div key={idx} className="flex flex-col sm:flex-row gap-2 md:gap-3 items-start sm:items-center bg-white/50 p-3 rounded-xl md:rounded-[1.25rem] border border-white/70 shadow-sm w-full min-w-0 overflow-hidden">
                                        <Badge className="bg-white/80 text-teal-950 border border-white/90 shadow-none px-3 md:px-4 py-1.5 md:py-2 uppercase tracking-widest text-[9px] md:text-[10px] shrink-0 w-full sm:w-24 justify-center">{q.type}</Badge>
                                        <Input value={q.text} onChange={(e) => { const n=[...(globalTherapy[t]||[])]; n[idx].text=e.target.value; setGlobalTherapy({...globalTherapy,[t]:n}); }} className="h-10 md:h-12 bg-white/40 border-[1.5px] border-white/60 rounded-xl font-bold text-teal-950 focus:bg-white/80 transition-colors flex-1 w-full min-w-0 text-sm md:text-base" />
                                        <Button size="icon" variant="ghost" className="h-10 md:h-12 w-full sm:w-12 shrink-0 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 rounded-xl border border-rose-400/30" onClick={() => { const n=(globalTherapy[t]||[]).filter((_,i)=>i!==idx); setGlobalTherapy({...globalTherapy,[t]:n}); }}><Trash2 className="w-4 h-4 md:w-5 md:h-5" /></Button>
                                     </div>
                                  ))}
                                  {(globalTherapy[t] || []).length === 0 && (
                                    <div className="text-center py-6 md:py-10 text-teal-900/50 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-white/30 rounded-xl md:rounded-[1.5rem] border-[2px] border-dashed border-white/60">No template questions for {t}.</div>
                                  )}
                                </div>
                                <Button variant="secondary" onClick={() => { const n=[...(globalTherapy[t]||[]), {type:'scale',text:'New Question'}]; setGlobalTherapy({...globalTherapy,[t]:n}); }} className="w-full h-auto min-h-[3rem] md:min-h-[3.5rem] py-3 rounded-xl md:rounded-[1.25rem] bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-950 font-black text-xs md:text-sm uppercase tracking-widest border-[1.5px] border-indigo-400/30 shadow-sm transition-all border-dashed whitespace-normal break-words flex items-center justify-center"><Plus className="w-4 h-4 md:w-5 md:h-5 mr-2 shrink-0"/> Add to {t}</Button>
                             </TabsContent>
                          ))}
                        </div>
                     </Tabs>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            <div className="p-4 md:p-8 bg-white/20 border-t-[1.5px] border-white/40 flex flex-col sm:flex-row justify-end gap-3 md:gap-4 w-full">
               <Button onClick={() => setIsTemplateOpen(false)} variant="outline" className="w-full sm:w-auto bg-white/50 hover:bg-white/70 border-[1.5px] border-white/80 text-teal-950 shadow-sm h-12 md:h-14 px-6 md:px-8 rounded-full font-black uppercase tracking-widest transition-all">Cancel</Button>
               <Button onClick={saveGlobalTemplates} className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white shadow-[0_8px_20px_rgba(20,184,166,0.3)] h-12 md:h-14 px-8 md:px-10 rounded-full font-black uppercase tracking-widest transition-all hover:scale-[1.02] hover:-translate-y-0.5"><Save className="w-4 h-4 md:w-5 md:h-5 mr-2" /> Save Templates</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}