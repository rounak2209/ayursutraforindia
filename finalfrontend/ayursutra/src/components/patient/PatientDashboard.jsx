import React, { useEffect, useState } from "react";
import Navigation from "./Navigation";
import Reminders from "./sections/Reminders";
import AssignedTherapies from "./sections/AssignedTherapies";
import Feedback from "./sections/Feedback";
import FindTherapist from "./sections/FindTherapist";
import AssignedTherapists from "./sections/AssignedTherapists";
import ProgressDashboard from "./sections/ProgressDashboard";
import PatientTracking from "./sections/PatientTracking"; 
import { apiGet } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, Clock, MapPin, User, ArrowRight, 
  Activity, HeartPulse, Stethoscope, 
  CheckCircle2, Droplets, Banknote
} from "lucide-react";

const PatientDashboard = () => {
  const [activeView, setActiveView] = useState("dashboard");
  const [patientData, setPatientData] = useState(null);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");

  //  Auto-Refresh Logic (Functionality Preserved completely)
  useEffect(() => {
    const fetchData = async () => {
      if (!patientData) setLoading(true); 
      setError(null);
      try {
        if (!userId) {
          window.location.href = "/login";
          return;
        }

        // 1. Fetch Profile
        const profileRes = await apiGet(`/api/patients/profile/${userId}`);
        const profile = profileRes?.patient ?? profileRes;
        setPatientData(profile);

        // 2. Fetch Assigned Therapies
        const therapyRes = await apiGet("/api/assigned-therapies/my");
        processUpcomingSessions(Array.isArray(therapyRes) ? therapyRes : []);

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData(); 
    const intervalId = setInterval(fetchData, 30000); // 30 sec refresh
    return () => clearInterval(intervalId);

  }, [userId]); 

  const processUpcomingSessions = (therapies) => {
    const sessions = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextTwoDays = new Date(today);
    nextTwoDays.setDate(today.getDate() + 2);

    therapies.forEach((therapy) => {
      if (!therapy.startDate) return;

      const start = new Date(therapy.startDate);
      const durationStr = String(therapy.duration || "1"); 
      const durationDays = parseInt(durationStr.match(/\d+/)?.[0] || "1");
      
      const end = new Date(start);
      end.setDate(start.getDate() + durationDays - 1);

      start.setHours(0,0,0,0);
      end.setHours(0,0,0,0);

      const therapist = therapy.therapistId || {};
      const sessionDuration = therapist.sessionDuration || 60;
      const location = therapist.personalInfo?.location || therapist.location || "Clinic";
      const money = therapist.professional?.money || therapist.money || "0"; 
      const sessionsCompleted = therapy.sessionsCompleted || 0;
      
      const realTimeSlot = therapy.timeSlot || "09:00"; 

      for (let d = new Date(today); d < nextTwoDays; d.setDate(d.getDate() + 1)) {
        if (d >= start && d <= end) {
          const diffTime = Math.abs(d - start);
          const dayNumber = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

          sessions.push({
            id: `${therapy._id}-${d.toISOString()}`,
            type: therapy.therapy || therapy.therapyName,
            dateString: d.toLocaleDateString("en-IN", { weekday: 'long', day: 'numeric', month: 'short' }),
            rawDate: new Date(d),
            time: realTimeSlot, 
            durationMins: sessionDuration, 
            location: location,
            cost: money,
            sessionsCompleted: sessionsCompleted,
            therapist: therapist.name || "Assigned Therapist",
            status: d.getTime() === today.getTime() ? "Today" : "Tomorrow",
            dayNumber: dayNumber,
            totalDays: durationDays,
          });
        }
      }
    });

    sessions.sort((a, b) => a.rawDate - b.rawDate);
    setUpcomingSessions(sessions);
  };

  const p = patientData || {};
  const personal = p.personalDetails || {};
  const health = p.healthProfile || {};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");
    window.location.href = "/"; 
  };

  const uniqueTherapies = [...new Set(patientData?.prescriptionDetails?.therapies?.map(t => t.therapy))];
  
  const allTherapies = uniqueTherapies.length > 0
    ? uniqueTherapies.join(", ")
    : "General Wellness Protocol";

  const view = {
    name: p.name || personal.name || "Patient",
    age: personal.age || "—",
    gender: personal.gender || "—",
    prakritiType: health.prakritiType || "—",
    doshaImbalance: health.doshaImbalance || "—",
    prescribedProtocol: allTherapies
  };

  const renderDashboardView = () => {
    if (loading) return <div className="min-h-[60vh] flex items-center justify-center text-teal-600 font-black text-xl animate-pulse tracking-widest uppercase">Healing your dashboard...</div>;
    if (error) return <div className="p-6 text-center text-rose-600 bg-rose-50/50 backdrop-blur-md rounded-2xl border border-rose-200 font-bold shadow-sm">{error}</div>;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* --- COMPACT HERO SECTION (Liquid Glassmorphism) --- */}
        <div className="relative overflow-hidden rounded-[2rem] bg-white/20 backdrop-blur-[40px] border border-white/50 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 group hover:shadow-[0_15px_40px_rgba(20,184,166,0.1)] transition-all duration-500">
          
          {}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-emerald-400/20 rounded-full blur-[60px] opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-teal-400/20 rounded-full blur-[60px] opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

          {}
          <div className="relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-[1.5rem] border-4 border-white/60 bg-gradient-to-br from-white/80 to-white/30 flex items-center justify-center backdrop-blur-md shadow-md overflow-hidden shrink-0 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-500">
            {patientData?.profilePic ? (
                <img src={patientData.profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                <span className="text-3xl md:text-4xl font-black text-teal-800 drop-shadow-sm">
                  {view.name.charAt(0)}
                </span>
            )}
          </div>
          
          {/* Details */}
          <div className="relative z-10 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 border border-white/60 shadow-sm backdrop-blur-md mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-teal-900 font-extrabold text-[10px] tracking-widest uppercase">Active Patient</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black text-teal-950 tracking-tight leading-tight mb-3">
              Namaste, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">{view.name}</span>
            </h1>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge className="bg-white/40 hover:bg-white/60 text-teal-900 border border-white/50 px-4 py-1.5 backdrop-blur-md text-xs font-bold shadow-sm transition-all">
                 Age: {view.age}
              </Badge>
              <Badge className="bg-emerald-100/50 hover:bg-emerald-200/60 text-emerald-900 border border-emerald-200/50 px-4 py-1.5 backdrop-blur-md text-xs font-bold shadow-sm transition-all">
                 Prakriti: {view.prakritiType}
              </Badge>
              <Badge className="bg-teal-100/50 hover:bg-teal-200/60 text-teal-900 border border-teal-200/50 px-4 py-1.5 backdrop-blur-md text-xs font-bold shadow-sm transition-all">
                 Dosha: {view.doshaImbalance}
              </Badge>
            </div>
          </div>

          {/* Prescribed Protocol Pill */}
          <div className="relative z-10 bg-white/40 border border-white/60 p-4 rounded-2xl backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 min-w-[200px] text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-teal-800 text-[10px] font-black uppercase tracking-widest mb-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-600" /> Prescribed Protocol
            </div>
            <div className="text-lg font-black text-teal-950 leading-snug">{view.prescribedProtocol}</div>
          </div>
        </div>

        {}
        <div className="relative z-10 w-full mb-2">
           <PatientTracking hideFeedback={true} />
        </div>

        {/* --- STATS GRID (Removed Current Phase as requested, kept compact) --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-10">
          <div className="group relative overflow-hidden bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[1.5rem] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(20,184,166,0.1)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 cursor-default">
            <div className="w-14 h-14 rounded-xl bg-white/60 border border-white/80 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:rotate-6 transition-all duration-300">
              <Activity className="w-7 h-7 text-indigo-600 drop-shadow-sm" />
            </div>
            <div>
              <p className="text-teal-900/60 font-black text-[10px] uppercase tracking-widest mb-0.5">Wellness Score</p>
              <h3 className="text-3xl font-black text-teal-950 drop-shadow-sm">85%</h3>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-white/30 backdrop-blur-2xl border border-white/50 rounded-[1.5rem] p-5 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(20,184,166,0.1)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-4 cursor-default">
            <div className="w-14 h-14 rounded-xl bg-white/60 border border-white/80 shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:-rotate-6 transition-all duration-300">
              <Droplets className="w-7 h-7 text-rose-500 drop-shadow-sm" />
            </div>
            <div>
              <p className="text-teal-900/60 font-black text-[10px] uppercase tracking-widest mb-0.5">Next Session</p>
              <h3 className="text-xl font-black text-teal-950 drop-shadow-sm leading-tight truncate">{upcomingSessions[0]?.type || "Rest Day"}</h3>
            </div>
          </div>
        </div>

        {/* --- SCHEDULE SECTION --- */}
        <div className="space-y-5 relative z-10 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-teal-950 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/50 backdrop-blur-md rounded-xl border border-white/60 flex items-center justify-center shadow-sm">
                 <Calendar className="w-5 h-5 text-emerald-600" />
              </div>
              Upcoming Sessions
            </h2>
            <button onClick={() => setActiveView("therapies")} className="group flex items-center justify-center gap-2 px-5 py-2.5 bg-white/40 hover:bg-white/60 backdrop-blur-md border border-white/60 rounded-full text-teal-900 font-extrabold shadow-sm hover:shadow-md transition-all text-sm">
              View Full Plan <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {upcomingSessions.length === 0 ? (
            <div className="bg-white/30 backdrop-blur-2xl rounded-[2rem] p-10 text-center border border-white/50 shadow-sm">
              <div className="w-16 h-16 bg-white/60 border border-white/80 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm animate-[bounce_3s_ease-in-out_infinite]">
                 <HeartPulse className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-teal-950 mb-2">Rest & Rejuvenate</h3>
              <p className="text-teal-900/70 font-bold text-sm max-w-sm mx-auto">No sessions scheduled for the next 48 hours. Follow your diet chart and stay hydrated.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {upcomingSessions.map((session) => (
                <div key={session.id} className="group relative bg-white/30 backdrop-blur-2xl border border-white/50 p-6 rounded-[1.5rem] shadow-sm hover:shadow-[0_10px_30px_rgba(20,184,166,0.12)] hover:-translate-y-1.5 transition-all duration-400 overflow-hidden flex flex-col">
                  
                  {/* Small liquid orb on hover */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-400/20 rounded-full blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                  <div className="flex justify-between items-start mb-5 relative z-10">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                         <h3 className="text-xl font-black text-teal-950">{session.type}</h3>
                         {session.status === 'Today' && (
                           <span className="relative flex h-2.5 w-2.5">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                             <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                           </span>
                         )}
                      </div>
                      <p className="text-[11px] font-black text-teal-900/60 uppercase tracking-widest">
                        Day {session.dayNumber} of {session.totalDays} • {session.durationMins} mins
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-full bg-white/70 border border-white/80 shadow-sm backdrop-blur-md text-teal-950 font-black text-[10px] tracking-wider uppercase">
                      {session.status === 'Today' ? 'TODAY' : 'TOMORROW'}
                    </div>
                  </div>
                  
                  <div className="space-y-3 relative z-10 mt-auto">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 backdrop-blur-sm border border-white/60 text-teal-950 shadow-inner group-hover:bg-white/60 transition-colors">
                      <Calendar className="w-5 h-5 text-emerald-600" /><span className="font-extrabold text-sm">{session.dateString}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-xs text-teal-900 font-bold bg-white/40 backdrop-blur-sm border border-white/50 p-2.5 rounded-xl shadow-sm"><Clock className="w-4 h-4 text-emerald-600" />{session.time}</div>
                      <div className="flex items-center gap-2 text-xs text-teal-900 font-bold bg-white/40 backdrop-blur-sm border border-white/50 p-2.5 rounded-xl shadow-sm truncate"><MapPin className="w-4 h-4 text-emerald-600 shrink-0" /><span className="truncate">{session.location}</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-xs text-teal-900 font-bold bg-white/40 backdrop-blur-sm border border-white/50 p-2.5 rounded-xl shadow-sm"><Banknote className="w-4 h-4 text-emerald-600" /><span>₹{session.cost}</span></div>
                      <div className="flex items-center gap-2 text-xs text-teal-900 font-bold bg-white/40 backdrop-blur-sm border border-white/50 p-2.5 rounded-xl shadow-sm"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>{session.sessionsCompleted} Done</span></div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-teal-900 font-bold p-3 mt-1 bg-white/30 rounded-xl border border-white/40">
                      <User className="w-4 h-4 text-teal-700" /><span>Therapist: <span className="font-black text-teal-950">{session.therapist}</span></span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    );
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard": return renderDashboardView();
      case "reminders": return <Reminders />;
      case "progress": return <ProgressDashboard patientId={userId} />; 
      case "therapies": return <AssignedTherapies />;
      case "feedback": return <Feedback />;
      case "find-therapist": return <FindTherapist />;
      case "assigned-therapists": return <AssignedTherapists />;
      default: return renderDashboardView();
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative overflow-hidden">
      {}
      <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] bg-teal-400/20 rounded-full blur-[100px] pointer-events-none animate-[pulse_10s_ease-in-out_infinite] z-0"></div>
      <div className="absolute bottom-[-10%] left-[-5%] w-[35vw] h-[35vw] bg-emerald-400/15 rounded-full blur-[100px] pointer-events-none animate-[pulse_12s_ease-in-out_infinite] z-0" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-50">
        <Navigation activeView={activeView} onViewChange={setActiveView} onLogout={handleLogout} />
      </div>

      <main className="p-4 md:p-6 lg:p-8 relative z-10">
        <div className="max-w-6xl mx-auto">{renderContent()}</div>
      </main>
    </div>
  );
};

export default PatientDashboard;