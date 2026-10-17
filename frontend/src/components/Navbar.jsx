import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Globe, 
  LogIn, 
  LogOut, 
  ChevronDown,
  Menu,
  X,
  Sparkles,
  LayoutDashboard,
  Store,
  Home,
  Layers,
  Cpu,
  FileCode2,
  Wheat,
  Building,
  Truck,
  ShieldCheck
} from 'lucide-react';
import { useTranslation } from '../services/LanguageContext';
import { useAppStore } from '../services/useAppStore';

export const Navbar = () => {
  const { currentLang, setLanguage, t } = useTranslation();
  
  // Zustand store bindings
  const user = useAppStore((state) => state.currentUser);
  const currentTab = useAppStore((state) => state.currentTab);
  const setCurrentTab = useAppStore((state) => state.setCurrentTab);
  const logout = useAppStore((state) => state.logout);
  const quickAccounts = useAppStore((state) => state.quickAccounts);
  const quickLogin = useAppStore((state) => state.quickLogin);
  const openAuthModal = useAppStore((state) => state.openAuthModal);
  const darkMode = useAppStore((state) => state.darkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const langNames = {
    en: 'English (EN)',
    mr: 'मराठी (MR)',
    hi: 'हिन्दी (HI)'
  };

  // Determine user's primary role portal tab
  const getRoleDashboardTab = (role) => {
    switch(role) {
      case 'farmer': return 'farmer-portal';
      case 'buyer': return 'buyer-portal';
      case 'transporter': return 'transporter-portal';
      case 'admin': return 'admin';
      default: return 'marketplace';
    }
  };

  const getRoleDashboardLabel = (role) => {
    switch(role) {
      case 'farmer': return t('navFarmer');
      case 'buyer': return t('navBuyer');
      case 'transporter': return t('navLogistics');
      case 'admin': return t('navAdmin');
      default: return t('navDashboard');
    }
  };

  // Role-adaptive navigation items
  const navItems = [
    { id: 'home', label: t('navHome'), icon: Home },
    { id: 'marketplace', label: t('navMarketplace'), icon: Store },
    ...(user ? [
      { 
        id: getRoleDashboardTab(user.role), 
        label: getRoleDashboardLabel(user.role),
        isRoleTab: true,
        role: user.role
      }
    ] : []),
    { id: 'ai-hub', label: t('navAIDecision'), icon: Cpu },
    { id: 'blockchain', label: t('navLedger'), icon: Layers },
    ...(!user || user.role !== 'admin' ? [{ id: 'admin', label: t('navAdmin'), icon: FileCode2 }] : [])
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pt-3.5 sm:pt-4 pointer-events-none">
      {/* Floating Centered Pill Capsule */}
      <div 
        className={`pointer-events-auto w-full max-w-fit flex items-center justify-between gap-2 sm:gap-4 md:gap-6 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full border transition-all duration-300 backdrop-blur-2xl ${
          darkMode 
            ? 'bg-slate-950/75 border-slate-800/80 text-white shadow-[0_12px_40px_-10px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.06)]' 
            : 'bg-white/80 border-slate-200/90 text-slate-900 shadow-[0_10px_35px_-8px_rgba(15,23,42,0.12),0_0_0_1px_rgba(0,0,0,0.04)]'
        }`}
      >
        
        {/* Brand Mark (Left) */}
        <button 
          onClick={() => setCurrentTab('home')}
          className="flex items-center space-x-2.5 cursor-pointer group select-none flex-shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition-all duration-200">
            <span className="tracking-tighter">AF</span>
          </div>
          <div className="flex items-center gap-1.5 text-left">
            <span className="font-extrabold text-sm sm:text-base tracking-tight leading-none group-hover:text-emerald-500 transition-colors">
              AgriFlow
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20">
              AI
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links (Center Capsule) */}
        <nav className="hidden md:flex items-center space-x-0.5 sm:space-x-1 px-1">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 cursor-pointer whitespace-nowrap ${
                  active
                    ? darkMode
                      ? 'bg-white/12 text-white shadow-xs font-bold'
                      : 'bg-slate-950 text-white shadow-xs font-bold'
                    : darkMode
                      ? 'text-slate-400 hover:text-white hover:bg-white/6'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Dark/Light + Lang + Role/Auth */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-full transition-all duration-200 cursor-pointer border ${
              darkMode 
                ? 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800' 
                : 'border-slate-200 bg-slate-100/80 text-slate-700 hover:text-slate-950 hover:border-slate-300 hover:bg-slate-200/70'
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
          </button>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer border ${
                darkMode
                  ? 'border-slate-800 bg-slate-900/80 text-slate-300 hover:text-white hover:border-slate-700'
                  : 'border-slate-200 bg-slate-100/80 text-slate-700 hover:text-slate-950 hover:border-slate-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span className="uppercase text-[11px] font-bold">{currentLang}</span>
            </button>

            {langMenuOpen && (
              <div className={`absolute right-0 mt-2 w-36 rounded-2xl shadow-2xl py-1 z-50 text-xs border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
                darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'
              }`}>
                {Object.entries(langNames).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setLanguage(key);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 transition-colors cursor-pointer flex items-center justify-between ${
                      currentLang === key
                        ? 'bg-emerald-600/15 text-emerald-600 font-bold'
                        : darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                    }`}
                  >
                    {label}
                    {currentLang === key && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Dropdown */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                darkMode
                  ? 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                  : 'border-slate-200 bg-slate-100/80 text-slate-700 hover:border-slate-300'
              }`}
            >
              <span className="text-[10px] text-slate-400">{t('switchRole')}</span>
              <span className={`font-bold capitalize ${
                user?.role === 'farmer' ? 'text-emerald-500' :
                user?.role === 'buyer' ? 'text-blue-500' :
                user?.role === 'transporter' ? 'text-amber-500' :
                user?.role === 'admin' ? 'text-purple-500' : 'text-slate-400'
              }`}>
                {user ? user.role : 'Select'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl p-1.5 z-50 text-xs border backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150 ${
                darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'
              }`}>
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('demoRole')}
                </div>
                {quickAccounts?.map((acc) => (
                  <button
                    key={acc.role}
                    onClick={() => {
                      quickLogin(acc);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl transition-colors cursor-pointer flex flex-col ${
                      user?.role === acc.role
                        ? 'bg-emerald-600/15 text-emerald-600 font-bold'
                        : darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                    }`}
                  >
                    <span className="capitalize font-bold text-xs">{acc.role}</span>
                    <span className="text-[10px] text-slate-400 truncate">{acc.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile or Sign In */}
          {user ? (
            <div className="flex items-center space-x-1.5 pl-0.5">
              <button
                onClick={() => setCurrentTab(getRoleDashboardTab(user.role))}
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase cursor-pointer border transition-all ${
                  user.role === 'farmer' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/30' :
                  user.role === 'buyer' ? 'bg-blue-500/20 text-blue-500 border-blue-500/30 hover:bg-blue-500/30' :
                  user.role === 'transporter' ? 'bg-amber-500/20 text-amber-500 border-amber-500/30 hover:bg-amber-500/30' :
                  'bg-purple-500/20 text-purple-500 border-purple-500/30 hover:bg-purple-500/30'
                }`}
                title={`Open ${user.role} dashboard`}
              >
                {user.name?.charAt(0)}
              </button>
              <button
                onClick={logout}
                className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                  darkMode ? 'text-slate-400 hover:text-red-400 hover:bg-slate-900' : 'text-slate-500 hover:text-red-600 hover:bg-slate-100'
                }`}
                title={t('signOut')}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer whitespace-nowrap"
            >
              {t('signIn')}
            </button>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-1.5 rounded-full border cursor-pointer ${
              darkMode ? 'border-slate-800 bg-slate-900 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div 
          className={`pointer-events-auto md:hidden absolute top-16 left-4 right-4 rounded-3xl p-4 border backdrop-blur-2xl shadow-2xl transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            darkMode ? 'bg-slate-950/95 border-slate-800 text-white' : 'bg-white/95 border-slate-200 text-slate-900'
          }`}
        >
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {navItems.map((item) => {
              const active = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold text-left transition-colors cursor-pointer ${
                    active
                      ? darkMode ? 'bg-emerald-600 text-white' : 'bg-slate-950 text-white'
                      : darkMode ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-semibold">{t('demoRole')}</span>
            <div className="flex gap-1">
              {quickAccounts?.map((acc) => (
                <button
                  key={acc.role}
                  onClick={() => {
                    onSwitchUser(acc);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-2 py-1 rounded-lg font-bold capitalize text-[11px] ${
                    user?.role === acc.role
                      ? 'bg-emerald-600 text-white'
                      : darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {acc.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
