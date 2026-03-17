import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Bell, Clock, CheckCircle2, AlertTriangle, 
  Info, Calendar, ArrowRight, Stethoscope 
} from "lucide-react";

export default function Reminders() {
  const reminders = [
    { 
      id: 1, 
      type: "pre-care", 
      title: "Pre-Vamana Preparation", 
      description: "Complete fasting for 12 hours required. Drink only warm water if thirsty.", 
      time: "Tomorrow, 8:00 AM", 
      status: "pending", 
      urgent: true 
    },
    { 
      id: 2, 
      type: "post-care", 
      title: "Post-Virechana Diet", 
      description: "Strictly avoid oily, spicy, and heavy foods. Stick to the prescribed Khichdi diet.", 
      time: "Today, 6:00 PM", 
      status: "pending", 
      urgent: false 
    },
    { 
      id: 3, 
      type: "therapist-note", 
      title: "Session Rescheduled", 
      description: "Dr. Priya has moved your appointment to a later slot due to an emergency.", 
      time: "2 hours ago", 
      status: "new", 
      urgent: false 
    },
    { 
      id: 4, 
      type: "medication", 
      title: "Evening Supplements", 
      description: "Take 2 tablets of Triphala with warm water after dinner.", 
      time: "Daily, 9:00 PM", 
      status: "pending", 
      urgent: false 
    }
  ];

  const getStyleConfig = (r) => {
    if (r.urgent) {
      return {
        bg: "bg-rose-500/20",
        border: "border-rose-400/50",
        iconBg: "bg-rose-400/40",
        iconColor: "text-rose-700",
        icon: AlertTriangle,
        badge: "bg-rose-400/30 text-rose-950 border-rose-400/50 shadow-[0_0_10px_rgba(244,63,94,0.2)]"
      };
    }
    
    switch (r.type) {
      case "pre-care":
        return {
          bg: "bg-blue-500/20",
          border: "border-blue-400/50",
          iconBg: "bg-blue-400/40",
          iconColor: "text-blue-700",
          icon: Clock,
          badge: "bg-blue-400/30 text-blue-950 border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
        };
      case "post-care":
        return {
          bg: "bg-emerald-500/20",
          border: "border-emerald-400/50",
          iconBg: "bg-emerald-400/40",
          iconColor: "text-emerald-700",
          icon: CheckCircle2,
          badge: "bg-emerald-400/30 text-emerald-950 border-emerald-400/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
        };
      case "therapist-note":
        return {
          bg: "bg-amber-500/20",
          border: "border-amber-400/50",
          iconBg: "bg-amber-400/40",
          iconColor: "text-amber-700",
          icon: Info,
          badge: "bg-amber-400/30 text-amber-950 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
        };
      default:
        return {
          bg: "bg-teal-500/20",
          border: "border-teal-400/50",
          iconBg: "bg-teal-400/40",
          iconColor: "text-teal-700",
          icon: Bell,
          badge: "bg-teal-400/30 text-teal-950 border-teal-400/50 shadow-[0_0_10px_rgba(20,184,166,0.2)]"
        };
    }
  };

  return (
    <div className="relative animate-in fade-in duration-700 w-full max-w-7xl mx-auto space-y-8 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/40 border-[1.5px] border-white/70 shadow-sm backdrop-blur-md mb-3">
             <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
             <span className="text-teal-900 font-extrabold text-[10px] tracking-widest uppercase">Action Center</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-teal-950 flex items-center gap-3 tracking-tight">
            <div className="w-12 h-12 bg-white/50 backdrop-blur-xl rounded-2xl border-[1.5px] border-white/70 flex items-center justify-center shadow-sm">
               <Bell className="w-6 h-6 text-amber-600" />
            </div>
            My Reminders
          </h2>
        </div>
        <div className="px-5 py-2.5 bg-white/40 backdrop-blur-md border-[1.5px] border-white/70 shadow-sm rounded-full text-teal-900 font-black text-sm tracking-wide flex items-center gap-2">
          <span className="w-5 h-5 bg-amber-500 text-white rounded-full flex items-center justify-center text-xs">{reminders.filter(r => r.status === 'pending' || r.status === 'new').length}</span> Active Alerts
        </div>
      </div>

      {/* REMINDERS LIST */}
      <div className="space-y-6 relative z-10">
        {reminders.map((r) => {
          const config = getStyleConfig(r);
          const Icon = config.icon;

          return (
            <div 
              key={r.id} 
              className={`group relative overflow-hidden rounded-[2.5rem] bg-white/20 backdrop-blur-[30px] border-[1.5px] ${r.urgent ? 'border-rose-400' : 'border-white/50 hover:border-white/80'} shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_40px_rgba(20,184,166,0.15)] transition-all duration-500 flex flex-col md:flex-row`}
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%)' }}
            >
              
              {/* Liquid Hover Background */}
              <div className="absolute top-0 left-0 w-48 h-48 bg-white/20 rounded-full blur-[40px] pointer-events-none group-hover:scale-150 transition-transform duration-700"></div>

              {/* Left Color Indicator (Mobile Top, Desktop Left) */}
              <div className={`h-2 md:h-auto md:w-3 shrink-0 ${r.urgent ? 'bg-gradient-to-b from-rose-500 to-rose-400' : 'bg-gradient-to-b from-teal-400 to-emerald-400'}`}></div>

              {/* Icon Column */}
              <div className={`p-6 md:p-8 flex items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-white/30 ${config.bg} backdrop-blur-md`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner border border-white/50 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ${config.iconBg}`}>
                  <Icon className={`w-8 h-8 ${config.iconColor} drop-shadow-sm`} />
                </div>
              </div>

              {/* Content Column */}
              <div className="p-6 md:p-8 flex-1 flex flex-col justify-center relative z-10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      {r.urgent && (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
                        </span>
                      )}
                      <h3 className="font-black text-2xl text-teal-950 tracking-tight leading-none drop-shadow-sm">{r.title}</h3>
                    </div>
                    <Badge className={`uppercase text-[9px] font-black tracking-widest px-3 py-1 mt-2 border-[1.5px] ${config.badge}`}>
                      {r.type.replace("-", " ")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-white/40 border-[1.5px] border-white/60 px-4 py-2 rounded-xl shadow-sm backdrop-blur-md shrink-0">
                    <Calendar className="w-4 h-4 text-teal-700" />
                    <span className="text-xs font-black text-teal-950 uppercase tracking-widest">{r.time}</span>
                  </div>
                </div>

                <p className="text-sm font-bold text-teal-950/80 leading-relaxed mb-4 max-w-2xl">
                  {r.description}
                </p>
                
                {r.urgent && <span className="text-xs font-black text-rose-600 uppercase tracking-widest bg-rose-500/10 px-3 py-1 rounded-md w-fit border border-rose-200">Action Required Immediately</span>}
              </div>

              {/* Action Column */}
              <div className="p-6 md:p-8 flex items-center justify-center border-t md:border-t-0 md:border-l border-white/30 bg-white/10 backdrop-blur-md">
                <Button 
                  className="w-full md:w-auto h-14 px-8 rounded-full bg-white/50 hover:bg-white border-[1.5px] border-white/80 text-teal-950 font-black shadow-sm transition-all group-hover:shadow-[0_8px_20px_rgba(20,184,166,0.15)] group-hover:-translate-y-0.5 flex items-center gap-2 text-sm"
                >
                  Mark Done <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </Button>
              </div>

            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {reminders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-white/20 backdrop-blur-[40px] rounded-[3rem] border-[1.5px] border-white/50 shadow-[0_10px_40px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-400/20 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="w-24 h-24 bg-white/40 border-[1.5px] border-white/70 rounded-[2rem] flex items-center justify-center mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.1)] relative z-10 animate-[bounce_3s_ease-in-out_infinite]">
            <Stethoscope className="w-12 h-12 text-teal-600 drop-shadow-sm" />
          </div>
          <h3 className="text-3xl font-black text-teal-950 mb-2 relative z-10">No Reminders</h3>
          <p className="text-teal-900/70 font-bold uppercase tracking-widest text-sm relative z-10 text-center max-w-sm">You are all caught up! Enjoy your day and stay hydrated.</p>
        </div>
      )}

    </div>
  );
}