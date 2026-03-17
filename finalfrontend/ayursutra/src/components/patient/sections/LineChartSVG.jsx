import React from "react";

export default function LineChartSVG({ data = [], width = 800, height = 400 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-slate-500 font-bold italic bg-slate-100 rounded-xl border border-slate-200">
        Waiting for progress data...
      </div>
    );
  }

  const padding = 40;
  const paddingBottom = 60; 
  const innerW = width - padding * 2;
  const innerH = height - padding - paddingBottom;

  
  const points = data.map((d, i) => {
    const x = padding + (data.length > 1 ? (i / (data.length - 1)) * innerW : innerW / 2);
    const val = Number(d.percentage || 0);
    const y = padding + (1 - val / 100) * innerH;
    return { x, y, val, date: d.dateString };
  });

  const pathD = points.reduce((acc, p, i) => 
    i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`, 
  "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

  return (
    <div className="w-full h-full relative group">
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${width} ${height}`} 
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="lineStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f766e" /> {}
            <stop offset="100%" stopColor="#047857" /> {}
          </linearGradient>
          <linearGradient id="areaFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.5" /> {}
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grid Lines */}
        {[0, 25, 50, 75, 100].map((g) => {
          const y = padding + (1 - g / 100) * innerH;
          return (
            <g key={g}>
              <line x1={padding} x2={width - padding} y1={y} y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x={padding - 15} y={y + 4} textAnchor="end" fontSize="11" fill="#64748b" fontWeight="700">{g}%</text>
            </g>
          );
        })}

        {/* Area Fill */}
        {data.length > 1 && <path d={areaD} fill="url(#areaFill)" />}

        {/* The Line */}
        {data.length > 1 && (
          <path d={pathD} fill="none" stroke="url(#lineStroke)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
        )}

        {/* Data Points */}
        {points.map((p, i) => (
          <g key={i} className="group/point">
            <circle 
              cx={p.x} cy={p.y} r="6" 
              fill="white" stroke="#0f766e" strokeWidth="3" 
              className="transition-all duration-300 group-hover/point:r-8 shadow-md"
            />
            
            {/* Hover Tooltip */}
            <g className="opacity-0 group-hover/point:opacity-100 transition-opacity duration-200 pointer-events-none">
               <rect x={p.x - 24} y={p.y - 44} width="48" height="28" rx="8" fill="#111827" />
               <text x={p.x} y={p.y - 26} textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">{p.val}%</text>
            </g>
          </g>
        ))}

        {/* X-Axis Labels */}
        {data.map((d, i) => (
          <text 
            key={i} 
            x={points[i].x} 
            y={height - 20} 
            textAnchor="end" 
            fontSize="11" 
            fill="#475569" 
            fontWeight="700"
            transform={`rotate(-30, ${points[i].x}, ${height - 20})`}
          >
            {new Date(d.dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </text>
        ))}
      </svg>
    </div>
  );
}