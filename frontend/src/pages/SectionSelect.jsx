import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Wheat, ShoppingCart, Truck, LayoutDashboard, Sparkles, ArrowRight } from 'lucide-react';
import { useAppStore } from '../services/useAppStore';

const SECTIONS = [
  {
    key: 'farmer',
    path: '/farmer',
    icon: Wheat,
    label: 'Farmer',
    description: 'Manage crops, bookings, orders and earnings.',
    color: 'emerald',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-500',
    borderHover: 'hover:border-emerald-400/60',
    badgeBg: 'bg-emerald-600',
    gradient: 'from-emerald-500/10 via-transparent to-transparent',
  },
  {
    key: 'buyer',
    path: '/buyer',
    icon: ShoppingCart,
    label: 'Buyer',
    description: 'Discover produce, manage procurement and contracts.',
    color: 'blue',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-500',
    borderHover: 'hover:border-blue-400/60',
    badgeBg: 'bg-blue-600',
    gradient: 'from-blue-500/10 via-transparent to-transparent',
  },
  {
    key: 'transporter',
    path: '/transporter',
    icon: Truck,
    label: 'Transporter',
    description: 'Manage shipments, deliveries and route planning.',
    color: 'amber',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-500',
    borderHover: 'hover:border-amber-400/60',
    badgeBg: 'bg-amber-600',
    gradient: 'from-amber-500/10 via-transparent to-transparent',
  },
  {
    key: 'admin',
    path: '/admin',
    icon: LayoutDashboard,
    label: 'Admin',
    description: 'Monitor the entire AgriFlow ecosystem.',
    color: 'purple',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-500',
    borderHover: 'hover:border-purple-400/60',
    badgeBg: 'bg-purple-600',
    gradient: 'from-purple-500/10 via-transparent to-transparent',
  },
];

export default function SectionSelect() {
  const navigate = useNavigate();
  const darkMode = useAppStore((state) => state.darkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center px-4 py-16 transition-colors duration-200 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* Theme toggle — top right */}
      <button
        onClick={toggleDarkMode}
        className={`fixed top-5 right-5 p-2.5 rounded-full border text-xs font-bold transition-all ${
          darkMode
            ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
        }`}
        aria-label="Toggle theme"
      >
        {darkMode ? '☀' : '🌙'}
      </button>

      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-10">
        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30">
          AF
        </div>
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xl tracking-tight">AgriFlow</span>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            AI
          </span>
        </div>
      </div>

      {/* Heading */}
      <div className="text-center mb-12 space-y-3 max-w-lg">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
            Smart Agricultural Supply Chain
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
          Welcome to AgriFlow AI
        </h1>
        <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          Choose your workspace to get started.
        </p>
      </div>

      {/* Section Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.key}
              onClick={() => navigate(section.path)}
              className={`group relative text-left rounded-2xl border p-6 transition-all duration-200 cursor-pointer overflow-hidden ${
                darkMode
                  ? `bg-slate-900/70 border-slate-800 hover:bg-slate-900 ${section.borderHover}`
                  : `bg-white border-slate-200 hover:shadow-lg ${section.borderHover}`
              }`}
            >
              {/* Subtle gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />

              <div className="relative">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl ${section.iconBg} flex items-center justify-center mb-4`}>
                  <Icon className={`w-5 h-5 ${section.iconColor}`} />
                </div>

                {/* Label + arrow */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-base tracking-tight">{section.label}</span>
                  <ArrowRight
                    className={`w-4 h-4 ${section.iconColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200`}
                  />
                </div>

                {/* Description */}
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {section.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer note */}
      <p className={`mt-12 text-[11px] text-center ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
        DYPCET Kolhapur · CSE (Data Science) · B.Tech Academic Capstone · 2026
      </p>
    </div>
  );
}
