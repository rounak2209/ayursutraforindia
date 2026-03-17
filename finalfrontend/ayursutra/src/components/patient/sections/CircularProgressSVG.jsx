import React from "react";

export default function CircularProgressSVG({ 
  size = 160, 
  stroke = 14, 
  sessionsCompleted = 0, 
  totalSessions = 0, 
  label = "" 
}) {
  const total = parseInt(totalSessions) || 1;
  const completed = parseInt(sessionsCompleted) || 0;
  const percentage = Math.min(Math.round((completed / total) * 100), 100);

  const radius = (size - stroke) / 2;
  const circumference = Math.PI * 2 * radius;
  const offset = circumference - (percentage / 100) * circumference;

  
  const getColorScheme = (pct) => {
    if (pct < 30) return { 
      id: "gradRed", 
      start: "#dc2626", end: "#ef4444", 
      shadow: "shadow-red-300",
      fill: "#fee2e2" 
    }; 
    if (pct < 70) return { 
      id: "gradAmber", 
      start: "#d97706", end: "#f59e0b", 
      shadow: "shadow-amber-300",
      fill: "#fef3c7" 
    }; 
    return { 
      id: "gradGreen", 
      start: "#059669", end: "#10b981", 
      shadow: "shadow-emerald-300",
      fill: "#d1fae5" 
    }; 
  };

  const scheme = getColorScheme(percentage);

  return (
    <div className="flex flex-col items-center justify-center group">
      <div className="relative" style={{ width: size, height: size }}>
        
        {/* Outer Glow Effect */}
        <div className={`absolute inset-2 rounded-full opacity-30 blur-xl ${scheme.shadow.replace('shadow-', 'bg-')}`}></div>

        <svg 
          width={size} 
          height={size} 
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90 relative z-10"
        >
          <defs>
            <linearGradient id="gradRed" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#dc2626" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <linearGradient id="gradAmber" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
            <linearGradient id="gradGreen" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Background Track (Deeper Slate) */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill={scheme.fill} 
            stroke="#e2e8f0" 
            strokeWidth={stroke}
            strokeLinecap="round"
            className="transition-colors duration-500"
          />

          {/* Progress Bar */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={`url(#${scheme.id})`}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text Wrapper */}
        <div className="absolute inset-0 flex flex-col items-center justify-center leading-none z-20">
          <span className="text-3xl font-black text-slate-800 tracking-tight">
            {percentage}%
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            Recovery
          </span>
          {/* Badge: White with slightly stronger shadow */}
          <div className="mt-2 px-2 py-1 bg-white/90 rounded-full text-[10px] font-bold text-slate-700 shadow-md backdrop-blur-md border border-slate-200">
            {completed} / {total} Sessions
          </div>
        </div>
      </div>
      
      {label && (
        <p className="mt-4 text-sm font-extrabold text-slate-800 tracking-wide uppercase">
          {label}
        </p>
      )}
    </div>
  );
}