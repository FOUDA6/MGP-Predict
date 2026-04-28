interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  trend?: "up" | "down" | "neutral";
  color?: "cyan" | "violet" | "emerald" | "amber";
}

const colorMap = {
  cyan: {
    bg: "from-cyan-500/10 to-cyan-500/5",
    border: "border-cyan-500/20",
    icon: "from-cyan-500 to-cyan-400",
    text: "text-cyan-400",
  },
  violet: {
    bg: "from-violet-500/10 to-violet-500/5",
    border: "border-violet-500/20",
    icon: "from-violet-500 to-violet-400",
    text: "text-violet-400",
  },
  emerald: {
    bg: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
    icon: "from-emerald-500 to-emerald-400",
    text: "text-emerald-400",
  },
  amber: {
    bg: "from-amber-500/10 to-amber-500/5",
    border: "border-amber-500/20",
    icon: "from-amber-500 to-amber-400",
    text: "text-amber-400",
  },
};

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = "cyan",
}: StatsCardProps) {
  const c = colorMap[color];

  return (
    <div
      className={`
        glass p-6 rounded-2xl border ${c.border}
        bg-gradient-to-br ${c.bg}
        hover:shadow-cyber transition-all duration-500
        group cursor-default
      `}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`
          w-12 h-12 rounded-xl bg-gradient-to-br ${c.icon}
          flex items-center justify-center text-xl
          shadow-lg group-hover:scale-110 transition-transform duration-300
        `}
        >
          {icon}
        </div>
      </div>

      <p className="text-sm text-slate-400 mb-1">{title}</p>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>

      {subtitle && (
        <p className={`text-xs mt-2 ${c.text}`}>{subtitle}</p>
      )}
    </div>
  );
}
