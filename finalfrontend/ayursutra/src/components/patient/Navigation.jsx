import React, { useState, useEffect } from "react";
import { 
  LogOut, User, ClipboardCheck, MessageSquare, 
  Bell, Compass, Activity, LayoutDashboard, Menu, X 
} from "lucide-react";

export default function Navigation({ activeView, onViewChange, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when screen size increases
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = [
    { 
      id: "dashboard", icon: LayoutDashboard, label: "Dashboard", 
      inactive: "text-teal-800 hover:bg-white/40 border-transparent", 
      active: "bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow-[0_8px_20px_rgba(20,184,166,0.4)] border-white/40" 
    },
    { 
      id: "therapies", icon: ClipboardCheck, label: "Therapies", 
      inactive: "text-emerald-800 hover:bg-white/40 border-transparent", 
      active: "bg-gradient-to-r from-emerald-500 to-emerald-400 text-white shadow-[0_8px_20px_rgba(16,185,129,0.4)] border-white/40" 
    },
    { 
      id: "find-therapist", icon: Compass, label: "Find Therapist", 
      inactive: "text-cyan-800 hover:bg-white/40 border-transparent", 
      active: "bg-gradient-to-r from-cyan-500 to-cyan-400 text-white shadow-[0_8px_20px_rgba(6,182,212,0.4)] border-white/40" 
    },
    { 
      id: "feedback", icon: MessageSquare, label: "Feedback", 
      inactive: "text-pink-800 hover:bg-white/40 border-transparent", 
      active: "bg-gradient-to-r from-pink-500 to-pink-400 text-white shadow-[0_8px_20px_rgba(236,72,153,0.4)] border-white/40" 
    },
    { 
      id: "reminders", icon: Bell, label: "Reminders", 
      inactive: "text-amber-800 hover:bg-white/40 border-transparent", 
      active: "bg-gradient-to-r from-amber-500 to-amber-400 text-white shadow-[0_8px_20px_rgba(245,158,11,0.4)] border-white/40" 
    },
    { 
      id: "progress", icon: Activity, label: "Progress", 
      inactive: "text-purple-800 hover:bg-white/40 border-transparent", 
      active: "bg-gradient-to-r from-purple-500 to-purple-400 text-white shadow-[0_8px_20px_rgba(168,85,247,0.4)] border-white/40" 
    }
  ];

  return (
    <div className="sticky top-4 lg:top-6 z-50 px-4 w-full mb-6 lg:mb-10">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-7xl h-full bg-gradient-to-r from-teal-400/20 via-emerald-400/20 to-indigo-400/20 blur-xl rounded-full pointer-events-none hidden lg:block"></div>

      <header className="relative max-w-7xl mx-auto bg-white/30 backdrop-blur-[40px] border border-white/50 shadow-[0_15px_40px_-10px_rgba(0,0,0,0.15)] rounded-2xl lg:rounded-[2.5rem] p-3 lg:p-2.5 flex items-center justify-between transition-all duration-500">
        
        {/* Logo/Brand for Mobile */}
        <div className="lg:hidden flex items-center gap-2 px-2">
           <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center shadow-md">
             <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-teal-950 text-lg tracking-tight">AyurSutra</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex flex-1 items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden px-2 py-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeView === t.id;

            return (
              <button
                key={t.id}
                onClick={() => onViewChange(t.id)}
                className={`
                  group relative flex items-center gap-2.5 px-5 py-2.5 rounded-full text-[0.9rem] transition-all duration-500 ease-out whitespace-nowrap overflow-hidden border
                  ${active ? t.active : t.inactive + ' font-bold'}
                  ${active ? 'scale-[1.02]' : 'hover:scale-105 hover:-translate-y-0.5'}
                `}
              >
                {active && (
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out pointer-events-none"></div>
                )}
                
                <Icon 
                  size={18} 
                  className={`relative z-10 transition-transform duration-500 ${active ? "scale-110 drop-shadow-md" : "group-hover:scale-110 group-hover:rotate-6"}`} 
                />
                <span className={`relative z-10 hidden xl:inline tracking-wide ${active ? 'font-extrabold' : ''}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Desktop Logout */}
        <div className="hidden lg:flex ml-2 pl-4 border-l-2 border-white/30 items-center shrink-0">
          <button
            onClick={onLogout}
            className="relative overflow-hidden group flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-rose-500/10 backdrop-blur-md border border-rose-200/50 text-rose-600 shadow-sm hover:bg-gradient-to-r hover:from-rose-500 hover:to-rose-400 hover:text-white hover:border-rose-400 hover:shadow-[0_8px_20px_rgba(225,29,72,0.3)] transition-all duration-500 ease-out font-extrabold hover:-translate-y-0.5"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out pointer-events-none"></div>
            <LogOut size={18} className="relative z-10 group-hover:-translate-x-1 transition-transform duration-300" />
            <span className="relative z-10 tracking-wide">Logout</span>
          </button>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 rounded-xl bg-white/40 border border-white/50 text-teal-900 shadow-sm hover:bg-white/60 transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

      </header>

      {/* Mobile Navigation Menu */}
      <div className={`
        lg:hidden absolute top-full left-4 right-4 mt-2 bg-white/60 backdrop-blur-3xl border border-white/60 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-500 ease-in-out origin-top
        ${isMobileMenuOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}
      `}>
        <div className="p-3 flex flex-col gap-2">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = activeView === t.id;

            return (
              <button
                key={t.id}
                onClick={() => {
                  onViewChange(t.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`
                  flex items-center gap-4 px-5 py-3.5 rounded-xl text-base transition-all duration-300 border
                  ${active ? t.active : t.inactive + ' font-bold bg-white/40'}
                `}
              >
                <Icon size={20} className={active ? "drop-shadow-md" : ""} />
                <span className={`tracking-wide ${active ? 'font-extrabold' : ''}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
          
          <div className="my-2 border-t border-white/40"></div>
          
          <button
            onClick={() => {
              onLogout();
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center justify-center gap-3 px-5 py-4 rounded-xl bg-rose-500/10 border border-rose-200/50 text-rose-600 shadow-sm hover:bg-rose-500 hover:text-white transition-all duration-300 font-extrabold"
          >
            <LogOut size={20} />
            <span className="tracking-wide">Logout</span>
          </button>
        </div>
      </div>

    </div>
  );
}