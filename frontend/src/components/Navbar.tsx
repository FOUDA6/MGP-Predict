"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/collect", label: "Collecter", icon: "📝" },
  { href: "/predict", label: "Prédire", icon: "🔮" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="glass-strong sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-cyber flex items-center justify-center text-white font-bold text-sm shadow-cyber group-hover:shadow-cyber-lg transition-shadow duration-300">
              M
            </div>
            <span className="text-lg font-bold">
              <span className="gradient-text">MGP</span>
              <span className="text-slate-400">-Predict</span>
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                    transition-all duration-300
                    ${
                      isActive
                        ? "bg-gradient-to-r from-cyan-500/10 to-violet-500/10 text-white border border-cyan-500/20"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }
                  `}
                >
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Badge */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            INF 232
          </div>
        </div>
      </div>
    </nav>
  );
}
