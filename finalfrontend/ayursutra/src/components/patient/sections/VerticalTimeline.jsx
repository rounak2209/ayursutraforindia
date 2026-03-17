import React from "react";
import { CheckCircle2, Circle, Sparkles } from "lucide-react";

export default function VerticalTimeline({ milestones = [] }) {
  return (
    <div className="relative pl-4">
      {/* Vertical Line */}
      <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-300 via-slate-300 to-transparent"></div>

      <div className="space-y-4">
        {milestones.map((m, idx) => (
          <div key={idx} className={`relative flex items-center gap-6 group`}>
            
            {/* Icon Marker */}
            <div className="relative z-10 flex-shrink-0">
              {m.achieved ? (
                
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200 ring-4 ring-white">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center ring-4 ring-white shadow-sm">
                  <Circle className="w-6 h-6 text-slate-400 group-hover:text-teal-500 transition-colors" />
                </div>
              )}
            </div>

            {/* Content Card */}
            <div className={`flex-1 p-3 rounded-2xl border transition-all duration-300 ${
              m.achieved 
                ? "bg-emerald-50 border-emerald-200 shadow-sm" 
                : "bg-white border-slate-200 group-hover:border-teal-200 group-hover:shadow-md"
            }`}>
              <div className="flex justify-between items-start">
                <div>
                  <h5 className={`font-bold text-base ${m.achieved ? "text-emerald-900" : "text-slate-800"}`}>
                    {m.title}
                  </h5>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed font-medium">
                    {m.description}
                  </p>
                </div>
                {m.achieved && <Sparkles className="w-4 h-4 text-emerald-500" />}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}