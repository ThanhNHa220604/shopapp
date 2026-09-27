import React from "react";
import { TrendingUp } from "lucide-react";

// Theme màu Dark Mode phù hợp với Dashboard
const themeStyles = {
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    border: "border-amber-500/20",
    hoverBorder: "hover:border-amber-500/40",
    hoverBg: "group-hover:bg-amber-500",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    hoverBorder: "hover:border-emerald-500/40",
    hoverBg: "group-hover:bg-emerald-500",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
    hoverBorder: "hover:border-orange-500/40",
    hoverBg: "group-hover:bg-orange-500",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    hoverBorder: "hover:border-blue-500/40",
    hoverBg: "group-hover:bg-blue-500",
  },
};

const MetricCard = ({
  title,
  value,
  unit = "",
  icon: Icon,
  colorTheme = "amber",
  onClick,
}) => {
  const theme = themeStyles[colorTheme] || themeStyles.amber;

  return (
    <div
      onClick={onClick}
      className={`bg-[#14161f] border border-white/5 rounded-2xl p-5 shadow-lg flex items-center justify-between group ${
        theme.hoverBorder
      } hover:-translate-y-1 transition-all duration-300 ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <div className="flex items-center gap-4 overflow-hidden">
        {Icon && (
          <div
            className={`w-12 h-12 ${theme.bg} rounded-xl flex items-center justify-center ${theme.text} border ${theme.border} group-hover:scale-105 ${theme.hoverBg} group-hover:text-slate-950 transition-all duration-300 shrink-0`}
          >
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="overflow-hidden">
          <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-0.5 truncate">
            {title}
          </p>
          <h3 className="text-2xl font-black text-white tracking-tight truncate">
            {value}
            {unit && (
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider ml-1">
                {unit}
              </span>
            )}
          </h3>
        </div>
      </div>

      <span className="w-7 h-7 bg-white/5 text-slate-400 group-hover:text-amber-400 group-hover:bg-amber-500/10 rounded-lg flex items-center justify-center transition-all shrink-0 ml-2">
        <TrendingUp className="w-3.5 h-3.5" />
      </span>
    </div>
  );
};

export default MetricCard;
