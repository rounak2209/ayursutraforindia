import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar"; 
import { 
  LayoutDashboard, Users, Calendar as CalendarIcon, MessageSquare, FileText, 
  LogOut, Edit, Clock, Mail, Phone, CheckCircle2, 
  AlertCircle, Award, Stethoscope, ChevronRight, Menu, X, User, CalendarDays,
  MapPin, Banknote, Hourglass, ChevronDown, ChevronUp, Sparkles, Activity
} from "lucide-react";
import { apiGet, apiPut } from "@/lib/api";

import Patients from "./Patients";
import FeedbackTab from "./FeedbackTab";
import TherapyQuestionSetup from "./TherapyQuestionSetup";
import TodaySchedule from "./TodaySchedule";
import AutomationSettings from "./AutomationSettings";

const emptyTherapist = {
  personalInfo: { fullName: "Therapist", mobile: "", email: "", bio: "", location: "" },
  professional: { specializations: [], experience: "", workingDays: [], workingHours: { start: "", end: "" }, money: "", sessionDuration: "" },
  stats: { totalPatients: 0, completedSessions: 0, avgRating: 0 },
  availability: { unavailableDates: [] }
};

const TopNavbar = ({ activeView, setActiveView, handleLogout, therapistName }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "patients", label: "Patients", icon: Users },
    { id: "schedule", label: "Schedule", icon: CalendarIcon }, 
    { id: "feedback", label: "Feedback", icon: MessageSquare },
    { id: "questions", label: "Setup", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/20 backdrop-blur-[40px] border-b border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.05)] h-20 transition-all duration-300">
      <div className="absolute inset-0 bg-gradient-to-r from-teal-400/5 via-transparent to-emerald-400/5 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveView("overview")}>
          <div className="bg-white/40 border-[1.5px] border-white/70 backdrop-blur-md p-2.5 rounded-[1rem] shadow-sm group-hover:scale-105 transition-transform duration-300 group-hover:bg-white/60">
            <Stethoscope className="w-6 h-6 text-teal-700 drop-shadow-sm"/>
          </div>
          <span className="text-xl font-black text-teal-950 tracking-tight drop-shadow-sm">Ayursutra</span>
        </div>

        <nav className="hidden lg:flex items-center gap-2 bg-white/30 backdrop-blur-xl p-1.5 rounded-[1.25rem] border-[1.5px] border-white/50 shadow-sm">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500 relative overflow-hidden ${
                activeView === item.id 
                  ? "bg-white/60 text-teal-950 shadow-[0_4px_15px_rgba(20,184,166,0.1)] border-[1.5px] border-white/80 scale-105" 
                  : "text-teal-900/60 hover:text-teal-950 hover:bg-white/40 border-[1.5px] border-transparent"
              }`}
            >
              {activeView === item.id && <div className="absolute inset-0 bg-gradient-to-r from-teal-400/10 to-transparent pointer-events-none"></div>}
              <item.icon className={`w-4 h-4 relative z-10 transition-colors ${activeView === item.id ? "text-teal-700" : ""}`}/>
              <span className="relative z-10">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-black text-teal-950 truncate max-w-[120px] drop-shadow-sm">{therapistName}</p>
            <div className="flex items-center justify-end gap-1.5 mt-0.5">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <p className="text-[9px] text-emerald-800 font-black uppercase tracking-widest">Online</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="bg-white/30 backdrop-blur-md text-rose-700 hover:bg-rose-500/20 hover:text-rose-950 rounded-xl border-[1.5px] border-white/50 hover:border-rose-400/50 shadow-sm transition-all"><LogOut className="w-5 h-5" /></Button>
          <Button variant="ghost" size="icon" className="lg:hidden bg-white/30 backdrop-blur-md rounded-xl border-[1.5px] border-white/50 text-teal-950" onClick={() => setIsOpen(!isOpen)}>{isOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}</Button>
        </div>
      </div>
      
      <div className={`lg:hidden absolute top-full left-0 w-full bg-white/60 backdrop-blur-[50px] border-b border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-300 origin-top overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="p-6 space-y-3">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveView(item.id); setIsOpen(false); }} className={`w-full flex justify-between items-center p-4 rounded-[1.25rem] font-black text-sm uppercase tracking-widest transition-all border-[1.5px] ${activeView === item.id ? 'bg-white/80 text-teal-950 border-white/90 shadow-sm' : 'bg-white/30 text-teal-900/60 border-transparent hover:bg-white/50'}`}>
              <div className="flex items-center gap-4"><item.icon className={`w-5 h-5 ${activeView === item.id ? 'text-teal-700' : ''}`}/> {item.label}</div>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

export default function TherapistDashboard() {
  const [activeView, setActiveView] = useState("overview");
  const [therapist, setTherapist] = useState(emptyTherapist);
  const [loading, setLoading] = useState(true);
  const [profileExpanded, setProfileExpanded] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const userId = localStorage.getItem("userId");
      try {
        const apiResp = await apiGet(`/api/therapists/profile/${userId}`);
        const profileData = apiResp || {};

        const allReq = await apiGet("/api/requests");

        const myAccepted = (allReq || []).filter(r => r.status === "accepted" && (r.therapistId === userId || r.therapistId?._id === userId));
        const uniquePatients = new Set(myAccepted.map(r => typeof r.patientId === "object" ? r.patientId._id : r.patientId)).size;

        const unavailableDates = (profileData.unavailableDates || []).map(d => new Date(d));

        setTherapist({
          profilePic: profileData.profilePic || null,
          personalInfo: { 
            fullName: profileData.name || "Therapist", 
            mobile: profileData.phone || "—", 
            email: profileData.email || "—", 
            bio: profileData.bio || "Dedicated to providing delightful healing experiences and personalized Ayurvedic care.", 
            location: profileData.location || "—" 
          },
          professional: { 
            specializations: profileData.specializations || [], 
            experience: profileData.experience || "0", 
            workingDays: profileData.workingDays || [],
            workingHours: { start: profileData.startTime || "—", end: profileData.endTime || "—" }, 
            money: profileData.money || "0", 
            sessionDuration: profileData.sessionDuration || "60"
          },
          stats: { 
            totalPatients: uniquePatients, 
            completedSessions: profileData.completedSessions || 0, 
            avgRating: profileData.avgRating || 0 
          },
          availability: { unavailableDates }
        });

      } catch (err) { console.warn(err); } 
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role"); 
    window.location.href = "/"; 
  };

  const toggleUnavailable = async (dateObj) => {
    if (!dateObj) return;
    
    const target = new Date(dateObj);
    target.setHours(0,0,0,0);

    const exists = therapist.availability.unavailableDates.some(d => {
      const current = new Date(d);
      current.setHours(0,0,0,0);
      return current.getTime() === target.getTime();
    });

    let newDates;
    if (exists) {
      newDates = therapist.availability.unavailableDates.filter(d => {
        const current = new Date(d);
        current.setHours(0,0,0,0);
        return current.getTime() !== target.getTime();
      });
    } else {
      newDates = [...therapist.availability.unavailableDates, target];
    }

    setTherapist(prev => ({
      ...prev,
      availability: { ...prev.availability, unavailableDates: newDates }
    }));

    try {
      const userId = localStorage.getItem("userId");
      const dateStrings = newDates.map(d => d.toISOString());
      await apiPut(`/api/therapists/profile/${userId}`, { unavailableDates: dateStrings });
    } catch (e) {
      console.error("Failed to save availability", e);
    }
  };

  const upcomingUnavailable = therapist.availability.unavailableDates
    .filter(d => d >= new Date().setHours(0,0,0,0))
    .sort((a, b) => a - b);

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="relative overflow-hidden rounded-[3rem] shadow-[0_20px_60px_-10px_rgba(20,184,166,0.15)] bg-white/20 backdrop-blur-[40px] border-[1.5px] border-white/50 p-8 md:p-10 transition-all duration-500 group flex flex-col items-center justify-center text-center h-full" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)' }}>
                <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-teal-400/20 rounded-full blur-[60px] pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-300/20 rounded-full blur-[60px] pointer-events-none"></div>
                
                <div className="absolute top-6 right-6 z-20">
                   <Button variant="secondary" size="sm" className="bg-white/40 hover:bg-white/60 text-teal-950 backdrop-blur-md border-[1.5px] border-white/70 rounded-[1rem] shadow-sm font-black px-4 transition-all" onClick={() => window.location.href="/therapist/profile"}>
                      <Edit className="w-4 h-4 mr-2" /> Edit
                   </Button>
                </div>

                <div className="relative z-10 w-full flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-white/40 p-[4px] border-[1.5px] border-white/70 shadow-[0_10px_25px_rgba(20,184,166,0.2)] mb-6 relative">
                     <div className="w-full h-full rounded-full overflow-hidden bg-white/60 backdrop-blur-md flex items-center justify-center">
                       {therapist.profilePic ? (
                           <img src={therapist.profilePic} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                           <User className="w-14 h-14 text-teal-800/50" />
                       )}
                     </div>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-black tracking-tight text-teal-950 drop-shadow-sm mb-4">
                    Dr. {therapist.personalInfo.fullName.split(' ')[0]}
                  </h2>
                  <p className="text-sm font-bold text-teal-900/70 max-w-sm leading-relaxed mb-6 px-2">
                    "{therapist.personalInfo.bio}"
                  </p>

                  <div className="flex flex-col w-full max-w-md gap-3 mt-auto">
                    <div className="flex items-start gap-3 bg-white/40 backdrop-blur-md px-5 py-3 rounded-2xl border-[1.5px] border-white/60 shadow-sm text-xs font-black text-teal-950 uppercase tracking-widest text-left">
                       <Mail className="w-4 h-4 text-teal-700 shrink-0 mt-0.5"/> 
                       <span className="break-all leading-tight">{therapist.personalInfo.email}</span>
                    </div>
                    <div className="flex items-start gap-3 bg-white/40 backdrop-blur-md px-5 py-3 rounded-2xl border-[1.5px] border-white/60 shadow-sm text-xs font-black text-teal-950 uppercase tracking-widest text-left">
                       <MapPin className="w-4 h-4 text-teal-700 shrink-0 mt-0.5"/> 
                       <span className="break-words leading-tight line-clamp-3">{therapist.personalInfo.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[3rem] shadow-[0_20px_60px_-10px_rgba(20,184,166,0.15)] bg-white/20 backdrop-blur-[40px] border-[1.5px] border-white/50 p-8 md:p-10 transition-all duration-500 flex flex-col h-full" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)' }}>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-400/20 rounded-full blur-[60px] pointer-events-none -z-10"></div>
                
                <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                   <div className="bg-white/40 border-[1.5px] border-white/60 rounded-[2rem] p-5 shadow-sm hover:bg-white/50 transition-all flex items-center gap-4 cursor-default">
                     <div className="w-12 h-12 bg-white/60 rounded-[1.25rem] shadow-inner flex items-center justify-center shrink-0 border border-white/70">
                       <Users className="w-5 h-5 text-indigo-700" />
                     </div>
                     <div>
                       <p className="text-[9px] text-teal-900/60 font-black uppercase tracking-widest mb-0.5">Patients</p>
                       <h3 className="text-2xl font-black text-teal-950">{therapist.stats.totalPatients}</h3>
                     </div>
                   </div>
                   <div className="bg-white/40 border-[1.5px] border-white/60 rounded-[2rem] p-5 shadow-sm hover:bg-white/50 transition-all flex items-center gap-4 cursor-default">
                     <div className="w-12 h-12 bg-white/60 rounded-[1.25rem] shadow-inner flex items-center justify-center shrink-0 border border-white/70">
                       <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                     </div>
                     <div>
                       <p className="text-[9px] text-teal-900/60 font-black uppercase tracking-widest mb-0.5">Sessions</p>
                       <h3 className="text-2xl font-black text-teal-950">{therapist.stats.completedSessions}</h3>
                     </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10 flex-1">
                  <div className="col-span-2 bg-white/30 backdrop-blur-md p-5 rounded-[1.5rem] border-[1.5px] border-white/50 shadow-sm hover:bg-white/40 transition-colors flex flex-col justify-center">
                    <p className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Stethoscope className="w-3.5 h-3.5 text-teal-700"/> Expertise Area</p>
                    <div className="flex flex-wrap gap-2">
                      {therapist.professional.specializations.length > 0 ? (
                         therapist.professional.specializations.map(s => <Badge key={s} className="bg-white/50 text-teal-950 border border-white/70 shadow-sm px-3 py-1 text-[10px] uppercase font-bold">{s}</Badge>)
                      ) : (
                         <span className="text-xs font-bold text-teal-900/50 px-2">Not specified</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="bg-white/30 backdrop-blur-md p-5 rounded-[1.5rem] border-[1.5px] border-white/50 shadow-sm hover:bg-white/40 transition-colors flex flex-col items-center justify-center text-center h-full">
                    <p className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5 text-emerald-600"/> Session Fee</p>
                    <div className="text-3xl font-black text-teal-950 drop-shadow-sm">
                      ₹{therapist.professional.money}
                    </div>
                  </div>
                  
                  <div className="bg-white/30 backdrop-blur-md p-5 rounded-[1.5rem] border-[1.5px] border-white/50 shadow-sm hover:bg-white/40 transition-colors flex flex-col items-center justify-center text-center h-full">
                    <p className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-blue-600"/> Timings</p>
                    <div className="text-lg font-black text-teal-950 tracking-tight drop-shadow-sm">
                      {therapist.professional.workingHours.start || '--'} - {therapist.professional.workingHours.end || '--'}
                    </div>
                  </div>

                  <div className="col-span-2 bg-white/30 backdrop-blur-md p-5 rounded-[1.5rem] border-[1.5px] border-white/50 shadow-sm hover:bg-white/40 transition-colors flex flex-col justify-center">
                     <p className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-indigo-600" /> Operating Days
                     </p>
                     <div className="flex flex-wrap gap-2">
                        {therapist.professional.workingDays.length > 0 ? (
                           therapist.professional.workingDays.map(d => (
                              <Badge key={d} className="bg-white/60 text-teal-950 border border-white/80 shadow-sm px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider">
                                 {d.slice(0,3)}
                              </Badge>
                           ))
                        ) : (
                           <span className="text-xs font-bold text-teal-900/50 px-2">No working days set</span>
                        )}
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between pl-2">
                   <h3 className="text-xl font-black text-teal-950 flex items-center gap-2 drop-shadow-sm uppercase tracking-widest">
                     <CalendarIcon className="w-5 h-5 text-teal-700"/> Today's Schedule
                   </h3>
                </div>
                <div className="bg-white/20 backdrop-blur-[40px] border-[1.5px] border-white/50 shadow-[0_20px_60px_-10px_rgba(20,184,166,0.15)] rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-[80px] pointer-events-none -z-10"></div>
                   <div className="relative z-10">
                     <TodaySchedule />
                   </div>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="flex items-center justify-between pl-2">
                   <h3 className="text-xl font-black text-teal-950 flex items-center gap-2 drop-shadow-sm uppercase tracking-widest">
                     <Sparkles className="w-5 h-5 text-indigo-600"/> Automation
                   </h3>
                </div>
                <div className="bg-white/20 backdrop-blur-[40px] border-[1.5px] border-white/50 shadow-[0_20px_60px_-10px_rgba(20,184,166,0.15)] rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden group">
                   <div className="absolute top-0 left-0 w-48 h-48 bg-indigo-400/10 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-1000 -z-10"></div>
                   <div className="relative z-10 h-full">
                     <AutomationSettings />
                   </div>
                </div>
              </div>

            </div>
          </div>
        );
      
      case "schedule":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
            <div className="bg-white/20 backdrop-blur-[40px] rounded-[3rem] border-[1.5px] border-white/50 shadow-[0_20px_60px_-10px_rgba(20,184,166,0.15)] overflow-hidden relative" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)' }}>
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-teal-400/20 rounded-full blur-[60px] pointer-events-none z-0"></div>
              
              <div className="bg-white/30 backdrop-blur-md border-b border-white/40 p-8 relative z-10">
                <h3 className="flex items-center gap-4 text-2xl text-teal-950 font-black tracking-tight">
                  <div className="bg-white/50 p-3 rounded-[1rem] shadow-sm border-[1.5px] border-white/70">
                    <CalendarIcon className="h-6 w-6 text-teal-700"/>
                  </div>
                  Availability Manager
                </h3>
              </div>
              <div className="p-8 relative z-10">
                <div className="bg-white/40 backdrop-blur-md border-[1.5px] border-white/60 rounded-[2rem] p-4 md:p-6 shadow-sm">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(d) => { setSelectedDate(d); toggleUnavailable(d); }}
                    modifiers={{ blocked: therapist.availability.unavailableDates }}
                    modifiersClassNames={{ blocked: "bg-rose-500/20 text-rose-950 font-black hover:bg-rose-500/30 rounded-xl border border-rose-400/50 shadow-sm" }}
                    className="w-full font-bold text-teal-950 [&_.rdp-day_button]:font-bold [&_.rdp-head_cell]:font-black [&_.rdp-head_cell]:uppercase [&_.rdp-head_cell]:tracking-widest"
                  />
                </div>
                <div className="mt-8 p-5 bg-white/40 backdrop-blur-md rounded-[1.5rem] border-[1.5px] border-teal-100/50 text-sm text-teal-950 font-bold flex gap-4 shadow-sm items-start">
                   <div className="p-2 bg-white/50 rounded-lg shadow-sm border border-white/60 shrink-0 mt-0.5">
                     <AlertCircle className="w-5 h-5 text-teal-700" /> 
                   </div>
                   <p className="leading-relaxed pt-1">Tap dates to mark as <strong>Unavailable</strong>. <span className="text-rose-600 bg-rose-100 px-2 py-0.5 rounded-md">Red dates</span> are blocked for patients.</p>
                </div>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-[40px] rounded-[3rem] border-[1.5px] border-white/50 shadow-[0_20px_60px_-10px_rgba(20,184,166,0.15)] overflow-hidden h-fit relative" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)' }}>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-rose-400/10 rounded-full blur-[60px] pointer-events-none z-0"></div>
              
              <div className="bg-white/30 backdrop-blur-md border-b border-white/40 p-8 relative z-10">
                <h3 className="text-2xl text-teal-950 font-black tracking-tight">Blocked Dates</h3>
              </div>
              <div className="p-8 relative z-10">
                <div className="space-y-4">
                  {upcomingUnavailable.length === 0 ? (
                    <div className="py-16 text-center bg-white/30 backdrop-blur-md rounded-[2rem] border-[2px] border-dashed border-white/60 shadow-inner flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-white/50 rounded-full flex items-center justify-center mb-3 shadow-sm border border-white/70">
                         <Sparkles className="w-8 h-8 text-teal-600/50"/>
                      </div>
                      <p className="font-black text-teal-950/60 uppercase tracking-widest text-sm">No future blocked dates.</p>
                    </div>
                  ) : (
                    upcomingUnavailable.map((date, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-white/40 backdrop-blur-md border-[1.5px] border-white/60 rounded-[1.5rem] shadow-sm hover:shadow-md hover:bg-white/60 transition-all hover:-translate-y-0.5">
                        <div className="flex items-center gap-5">
                          <div className="bg-rose-500/10 text-rose-700 border-[1.5px] border-rose-400/50 w-14 h-14 flex items-center justify-center rounded-2xl font-black text-lg shadow-sm">
                            {date.getDate()}
                          </div>
                          <div>
                            <p className="font-black text-teal-950 text-lg mb-0.5">{date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</p>
                            <p className="text-[10px] text-teal-900/60 font-black uppercase tracking-widest">{date.toLocaleDateString('en-IN', { weekday: 'long' })}</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => toggleUnavailable(date)} className="text-rose-700 font-black hover:bg-rose-500/20 hover:text-rose-950 rounded-xl bg-white/50 border-[1.5px] border-white/70 shadow-sm h-10 px-5 transition-all">Unblock</Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "patients": return <Patients />;
      case "feedback": return <FeedbackTab />;
      case "questions": return <TherapyQuestionSetup />;
      default: return null;
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-teal-900 font-black text-xl tracking-widest uppercase animate-pulse bg-transparent">Loading ecosystem...</div>;

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-900 pb-10">
      <TopNavbar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        handleLogout={handleLogout} 
        therapistName={therapist.personalInfo.fullName}
      />
      <main className="max-w-[90rem] mx-auto p-4 md:p-8 space-y-8 relative z-0">
        {activeView !== 'overview' && (
          <div className="flex items-center gap-4 mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
             <div className="w-14 h-14 bg-white/40 backdrop-blur-md rounded-2xl shadow-sm border-[1.5px] border-white/70 flex items-center justify-center">
               {activeView === 'schedule' ? <CalendarIcon className="w-6 h-6 text-teal-800"/> : <LayoutDashboard className="w-6 h-6 text-teal-800"/>}
             </div>
             <div>
               <h1 className="text-3xl md:text-4xl font-black text-teal-950 capitalize tracking-tight drop-shadow-sm mb-1">{activeView.replace("-", " ")}</h1>
               <p className="text-[10px] font-black text-teal-900/60 uppercase tracking-widest">Manage your {activeView} details</p>
             </div>
          </div>
        )}
        {renderContent()}
      </main>
    </div>
  );
}