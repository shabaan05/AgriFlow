/**
 * SectionLayout — shared base shell for all 4 role sections.
 * Renders a sticky top bar with brand, section label, nav links,
 * dark mode toggle, and a "← Change Section" button.
 * Each role layout wraps this with its own navItems / color config.
 */
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon, Menu, X, Globe, ChevronDown, User, LogIn, LogOut } from 'lucide-react';
import { useAppStore } from '../services/useAppStore';
import { useTranslation } from '../services/LanguageContext';
import { AuthModal } from '../components/AuthModal';

export default function SectionLayout({ sectionLabel, sectionColor, navItems, icon: SectionIcon }) {
  const navigate = useNavigate();
  const darkMode = useAppStore((state) => state.darkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);
  const currentUser = useAppStore((state) => state.currentUser);
  const authModalOpen = useAppStore((state) => state.authModalOpen);
  const authModalMode = useAppStore((state) => state.authModalMode);
  const openAuthModal = useAppStore((state) => state.openAuthModal);
  const closeAuthModal = useAppStore((state) => state.closeAuthModal);
  const loginSuccess = useAppStore((state) => state.loginSuccess);
  const logout = useAppStore((state) => state.logout);
  const quickAccounts = useAppStore((state) => state.quickAccounts);
  const quickLogin = useAppStore((state) => state.quickLogin);
  const { currentLang, setLanguage } = useTranslation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const langNames = { en: 'EN', mr: 'MR', hi: 'HI' };

  // color map — Tailwind needs full class strings to avoid purging
  const colorMap = {
    emerald: {
      badge: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/20',
      active: 'bg-emerald-600 text-white',
      hover: 'hover:text-emerald-600 hover:bg-emerald-500/10',
      dot: 'bg-emerald-500',
      icon: 'text-emerald-500',
    },
    blue: {
      badge: 'bg-blue-500/15 text-blue-500 border-blue-500/20',
      active: 'bg-blue-600 text-white',
      hover: 'hover:text-blue-600 hover:bg-blue-500/10',
      dot: 'bg-blue-500',
      icon: 'text-blue-500',
    },
    amber: {
      badge: 'bg-amber-500/15 text-amber-500 border-amber-500/20',
      active: 'bg-amber-600 text-white',
      hover: 'hover:text-amber-600 hover:bg-amber-500/10',
      dot: 'bg-amber-500',
      icon: 'text-amber-500',
    },
    purple: {
      badge: 'bg-purple-500/15 text-purple-500 border-purple-500/20',
      active: 'bg-purple-600 text-white',
      hover: 'hover:text-purple-600 hover:bg-purple-500/10',
      dot: 'bg-purple-500',
      icon: 'text-purple-500',
    },
  };

  const c = colorMap[sectionColor] || colorMap.emerald;

  const baseLink =
    `px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer whitespace-nowrap`;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
      {/* ─── Sticky Top Bar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center px-3 pt-3.5 pointer-events-none">
        <div
          className={`pointer-events-auto w-full max-w-5xl flex items-center gap-3 px-4 py-2.5 rounded-full border transition-all backdrop-blur-2xl ${
            darkMode
              ? 'bg-slate-950/80 border-slate-800 shadow-[0_12px_40px_-10px_rgba(0,0,0,0.7)]'
              : 'bg-white/85 border-slate-200 shadow-[0_8px_30px_-8px_rgba(15,23,42,0.12)]'
          }`}
        >
          {/* ← Change Section */}
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer flex-shrink-0 ${
              darkMode
                ? 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
                : 'border-slate-200 bg-slate-100 text-slate-600 hover:text-slate-950 hover:bg-slate-200'
            }`}
            aria-label="Change section"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change Section</span>
          </button>

          {/* Brand + Section Badge */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 group-hover:bg-emerald-500 flex items-center justify-center text-white font-extrabold text-[10px] shadow transition-all">
                AF
              </div>
              <span className="font-extrabold text-sm tracking-tight hidden sm:inline">AgriFlow</span>
            </button>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${c.badge}`}
            >
              {SectionIcon && <SectionIcon className="w-3 h-3" />}
              {sectionLabel}
            </span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `${baseLink} ${isActive ? c.active : `${darkMode ? 'text-slate-400 hover:text-white hover:bg-white/8' : 'text-slate-600'} ${c.hover}`}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5 ml-auto flex-shrink-0">
            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full border transition-all cursor-pointer ${
                darkMode
                  ? 'border-slate-700 bg-slate-900 text-amber-400 hover:bg-slate-800'
                  : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Language */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold border cursor-pointer transition-all ${
                  darkMode
                    ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800'
                    : 'border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span className="uppercase text-[11px]">{currentLang}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>
              {langOpen && (
                <div
                  className={`absolute right-0 mt-2 w-28 rounded-2xl border shadow-2xl py-1 z-50 text-xs backdrop-blur-xl ${
                    darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'
                  }`}
                >
                  {Object.entries(langNames).map(([k, label]) => (
                    <button
                      key={k}
                      onClick={() => { setLanguage(k); setLangOpen(false); }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                        currentLang === k
                          ? 'bg-emerald-600/15 text-emerald-600 font-bold'
                          : darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                      }`}
                    >
                      {label}
                      {currentLang === k && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Profile / Sign In */}
            {currentUser ? (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                    darkMode
                      ? 'border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800'
                      : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="max-w-[80px] truncate">{currentUser.name?.split(' ')[0]}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full uppercase bg-emerald-500/15 text-emerald-600 font-extrabold border border-emerald-500/20">
                    {currentUser.role}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>
                {userMenuOpen && (
                  <div
                    className={`absolute right-0 mt-2 w-52 rounded-2xl border shadow-2xl p-2 z-50 text-xs backdrop-blur-xl ${
                      darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="px-2.5 py-2 border-b border-slate-200 dark:border-slate-800 mb-1">
                      <p className="font-bold truncate text-slate-900 dark:text-white">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => { openAuthModal('login'); setUserMenuOpen(false); }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors ${
                        darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>Switch Account</span>
                    </button>
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg flex items-center gap-2 text-rose-500 hover:bg-rose-500/10 cursor-pointer transition-colors font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-1.5 rounded-full border cursor-pointer ${
                darkMode ? 'border-slate-700 bg-slate-900 text-slate-300' : 'border-slate-200 bg-slate-100 text-slate-600'
              }`}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileOpen && (
          <div
            className={`pointer-events-auto md:hidden absolute top-16 left-4 right-4 rounded-3xl p-4 border backdrop-blur-2xl shadow-2xl ${
              darkMode ? 'bg-slate-950/95 border-slate-800' : 'bg-white/95 border-slate-200'
            }`}
          >
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? c.active
                        : darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}

              <div className="border-t border-slate-200 dark:border-slate-800 my-2 pt-2">
                {currentUser ? (
                  <div className="flex items-center justify-between px-3 py-2">
                    <div>
                      <p className="font-bold text-xs">{currentUser.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{currentUser.role}</p>
                    </div>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="text-xs text-rose-500 font-semibold px-2 py-1 rounded-lg hover:bg-rose-500/10"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { openAuthModal('login'); setMobileOpen(false); }}
                    className="w-full py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── Page Content ─── */}
      <main className="flex-1 pt-20 sm:pt-24">
        <Outlet />
      </main>

      {/* ─── Minimal Footer ─── */}
      <footer
        className={`border-t py-6 text-center text-[11px] transition-colors ${
          darkMode ? 'bg-slate-950 border-slate-900 text-slate-600' : 'bg-white border-slate-200 text-slate-400'
        }`}
      >
        AgriFlow AI · {sectionLabel} Workspace · DYPCET Kolhapur CSE (Data Science) · 2026
      </footer>

      {/* ─── Global Auth Modal ─── */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={closeAuthModal}
        initialMode={authModalMode}
        onAuthSuccess={loginSuccess}
        quickAccounts={quickAccounts}
        onQuickLogin={quickLogin}
      />
    </div>
  );
}
