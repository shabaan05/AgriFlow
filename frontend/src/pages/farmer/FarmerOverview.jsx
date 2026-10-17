/**
 * FarmerOverview — Premium Modern AgriTech SaaS Dashboard
 *
 * LOGIC PRESERVED EXACTLY:
 *  - all Zustand selectors (darkMode, crops, bookings, orders)
 *  - all KPI derivations (totalProduceKg, activeOrders, pendingBookings, expectedEarnings, atRiskCrops)
 *  - all `actions` array construction
 *  - all navigate() calls and routes
 *  - all API-driven data (no fake stats)
 *
 * CHANGED: only JSX structure and Tailwind presentation classes.
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wheat, Plus, ClipboardList, ArrowRight, ChevronRight,
  Package, AlertTriangle, TrendingUp, Clock,
  Flame, Sparkles, CheckCircle2, FileText, IndianRupee,
  BarChart3, Zap, ShieldCheck, Leaf, Sun
} from 'lucide-react';
import { useAppStore } from '../../services/useAppStore';

// ─── Design tokens ────────────────────────────────────────────────────────────
// Centralized so every sub-component reads the same values.

const t = {
  card: (dark) => dark
    ? 'bg-slate-900 border border-slate-800'
    : 'bg-white border border-slate-200/80',
  cardHover: (dark) => dark
    ? 'hover:border-slate-700 hover:bg-slate-900'
    : 'hover:border-slate-300 hover:shadow-md',
  muted: (dark) => dark ? 'text-slate-400' : 'text-slate-500',
  faint: (dark) => dark ? 'text-slate-500' : 'text-slate-400',
  surface: (dark) => dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-100',
};

// ─── Risk config ──────────────────────────────────────────────────────────────
function riskConfig(score) {
  if (score >= 65) return {
    label: 'Critical',
    bar:   'bg-rose-500',
    text:  'text-rose-600',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/40',
    dot:   'bg-rose-500',
  };
  if (score >= 35) return {
    label: 'Moderate',
    bar:   'bg-amber-400',
    text:  'text-amber-600',
    badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40',
    dot:   'bg-amber-400',
  };
  return {
    label: 'Low Risk',
    bar:   'bg-emerald-500',
    text:  'text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40',
    dot:   'bg-emerald-500',
  };
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, accentColor, trend, darkMode }) {
  const accent = {
    emerald: { icon: 'text-emerald-600', ring: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-100 dark:border-emerald-900/30' },
    blue:    { icon: 'text-blue-600',    ring: 'bg-blue-50 dark:bg-blue-950/30',       border: 'border-blue-100 dark:border-blue-900/30' },
    amber:   { icon: 'text-amber-600',   ring: 'bg-amber-50 dark:bg-amber-950/30',     border: 'border-amber-100 dark:border-amber-900/30' },
    rose:    { icon: 'text-rose-600',    ring: 'bg-rose-50 dark:bg-rose-950/30',       border: 'border-rose-100 dark:border-rose-900/30' },
    slate:   { icon: 'text-slate-500',   ring: darkMode ? 'bg-slate-800' : 'bg-slate-100', border: darkMode ? 'border-slate-700' : 'border-slate-200' },
  }[accentColor] || {};

  return (
    <div className={`${t.card(darkMode)} rounded-2xl p-5 flex flex-col gap-3 shadow-xs transition-all duration-200 ${t.cardHover(darkMode)} group`}>
      <div className="flex items-start justify-between">
        <span className={`text-[11px] font-semibold uppercase tracking-wide ${t.muted(darkMode)}`}>{label}</span>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${accent.ring} ${accent.border}`}>
          <Icon className={`w-3.5 h-3.5 ${accent.icon}`} />
        </div>
      </div>
      <div>
        <div className="text-2xl font-extrabold tracking-tight leading-none">{value}</div>
        {sub && <div className={`text-[11px] mt-1.5 ${t.faint(darkMode)}`}>{sub}</div>}
      </div>
      {trend && (
        <div className={`text-[10px] font-semibold ${trend.up ? 'text-emerald-600' : t.faint(darkMode)}`}>
          {trend.label}
        </div>
      )}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────
function SectionHead({ icon: Icon, iconColor, title, action, darkMode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className={`text-sm font-bold flex items-center gap-2`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
        {title}
      </h2>
      {action && (
        <button
          onClick={action.onClick}
          className={`text-xs font-semibold flex items-center gap-0.5 transition-colors cursor-pointer ${
            darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          {action.label} <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// ─── Crop risk row ─────────────────────────────────────────────────────────────
function CropRiskRow({ crop, darkMode }) {
  const risk       = crop.aiRiskScore ?? 0;
  const cfg        = riskConfig(risk);
  const isPreHarvest = crop.status === 'pre_harvest';
  const daysLeft   = crop.aiShelfLife?.daysRemaining ?? crop.estimatedShelfLifeDays ?? '—';

  return (
    <div className={`${t.card(darkMode)} rounded-xl p-4 transition-all duration-200 ${t.cardHover(darkMode)} shadow-xs`}>
      <div className="flex items-center gap-3">
        {/* Risk dot */}
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{crop.cropName}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${cfg.badge}`}>
              {cfg.label}
            </span>
            {crop.isUrgentSale && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-300 dark:border-rose-900/40">
                <Flame className="w-2.5 h-2.5" /> -{crop.discountPercentage}%
              </span>
            )}
          </div>
          <p className={`text-[11px] mt-0.5 ${t.muted(darkMode)}`}>
            {crop.variety} · {crop.availableQuantityKg?.toLocaleString()} kg · ₹{crop.pricePerKg}/kg
          </p>
        </div>

        {/* Right: time/risk */}
        <div className="text-right flex-shrink-0 min-w-[72px]">
          {!isPreHarvest ? (
            <>
              <div className={`text-xs font-bold ${daysLeft <= 2 ? 'text-rose-600' : t.muted(darkMode)}`}>
                {daysLeft}d left
              </div>
              <div className="mt-1.5 w-16 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ml-auto">
                <div
                  className={`h-1 rounded-full ${cfg.bar}`}
                  style={{ width: `${Math.min(100, risk)}%` }}
                />
              </div>
            </>
          ) : (
            <div className={`text-[11px] font-semibold text-blue-600 dark:text-blue-400`}>
              Pre-Harvest
            </div>
          )}
        </div>
      </div>

      {/* AI wastage alert strip */}
      {crop.aiWastageMitigation?.actionRequired && (
        <div className={`mt-3 flex items-start gap-1.5 text-[11px] px-3 py-2 rounded-lg border ${
          darkMode ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          <Sparkles className="w-3 h-3 mt-px flex-shrink-0" />
          <span>{crop.aiWastageMitigation.message}</span>
        </div>
      )}
    </div>
  );
}

// ─── Risk donut summary ────────────────────────────────────────────────────────
function RiskSummary({ crops, darkMode }) {
  const critical = crops.filter(c => (c.aiRiskScore ?? 0) >= 65).length;
  const moderate = crops.filter(c => { const r = c.aiRiskScore ?? 0; return r >= 35 && r < 65; }).length;
  const healthy  = crops.length - critical - moderate;

  const bars = [
    { label: 'Healthy',  count: healthy,  color: 'bg-emerald-500', text: 'text-emerald-600' },
    { label: 'Moderate', count: moderate, color: 'bg-amber-400',   text: 'text-amber-600' },
    { label: 'Critical', count: critical, color: 'bg-rose-500',    text: 'text-rose-600' },
  ];

  if (crops.length === 0) return null;

  return (
    <div className={`${t.card(darkMode)} rounded-2xl p-4 shadow-xs`}>
      <div className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${t.faint(darkMode)}`}>Risk Distribution</div>
      {/* Stacked bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-px mb-3">
        {bars.map(b => b.count > 0 && (
          <div
            key={b.label}
            className={`${b.color} transition-all`}
            style={{ flex: b.count }}
          />
        ))}
      </div>
      <div className="flex justify-between">
        {bars.map(b => (
          <div key={b.label} className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${b.color}`} />
            <span className={`text-[10px] font-semibold ${t.muted(darkMode)}`}>{b.count} {b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Action item ──────────────────────────────────────────────────────────────
function ActionItem({ action, darkMode, onClick }) {
  const severityDot = {
    amber: 'bg-amber-400',
    rose:  'bg-rose-500',
    blue:  'bg-blue-500',
  }[action.severity] || 'bg-slate-400';

  const severityBg = {
    amber: darkMode ? 'hover:bg-amber-950/20' : 'hover:bg-amber-50',
    rose:  darkMode ? 'hover:bg-rose-950/20'  : 'hover:bg-rose-50',
    blue:  darkMode ? 'hover:bg-blue-950/20'  : 'hover:bg-blue-50',
  }[action.severity] || '';

  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-start gap-3 px-3.5 py-3 rounded-xl border transition-all cursor-pointer group ${
        darkMode ? 'border-slate-800 hover:border-slate-700' : 'border-slate-200 hover:border-slate-300'
      } ${severityBg}`}
    >
      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${severityDot}`} />
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-semibold leading-snug`}>{action.label}</div>
        <div className={`text-[11px] mt-0.5 ${t.muted(darkMode)}`}>{action.sub}</div>
      </div>
      <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${t.faint(darkMode)} opacity-0 group-hover:opacity-100 transition-opacity`} />
    </button>
  );
}

// ─── Quick action button ──────────────────────────────────────────────────────
function QuickAction({ to, icon: Icon, label, colorClass, darkMode }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className={`flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer group ${
        darkMode
          ? 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 text-slate-300'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
      }`}
    >
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-all ${t.faint(darkMode)}`} />
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
export default function FarmerOverview() {
  const navigate   = useNavigate();
  const darkMode   = useAppStore((s) => s.darkMode);
  const crops      = useAppStore((s) => s.crops);
  const bookings   = useAppStore((s) => s.bookings);
  const orders     = useAppStore((s) => s.orders);
  const currentUser = useAppStore((s) => s.currentUser);
  const refreshData = useAppStore((s) => s.refreshData);

  // Refresh on mount
  useEffect(() => { refreshData(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── KPI calculations (real data only — unchanged from original) ──────────
  const totalProduceKg   = crops.reduce((sum, c) => sum + (c.availableQuantityKg || 0), 0);
  const activeOrders     = orders.filter((o) => !['delivered', 'completed', 'cancelled'].includes(o.orderStatus)).length;
  const pendingBookings  = bookings.filter((b) => b.status === 'pending_farmer_approval').length;
  const expectedEarnings = crops.reduce((sum, c) => sum + ((c.availableQuantityKg || 0) * (c.pricePerKg || 0)), 0);
  const atRiskCrops      = crops.filter((c) => c.isUrgentSale || (c.aiRiskScore || 0) >= 65);

  // ── Actions Required (unchanged from original) ───────────────────────────
  const actions = [
    ...bookings
      .filter((b) => b.status === 'pending_farmer_approval')
      .map((b) => ({
        id: b._id, type: 'booking',
        label: `Confirm booking: ${b.cropName}`,
        sub:   `${b.bookedQuantityKg} kg · ₹${b.totalAmount?.toLocaleString()} · Buyer: ${b.buyerName}`,
        severity: 'amber', to: '/farmer/orders-bookings',
      })),
    ...atRiskCrops.map((c) => ({
      id: c._id, type: 'risk',
      label: `At-risk produce: ${c.cropName}`,
      sub:   `${c.availableQuantityKg} kg · ${c.aiShelfLife?.daysRemaining ?? c.estimatedShelfLifeDays} days left`,
      severity: 'rose', to: '/farmer/crops',
    })),
    ...orders
      .filter((o) => o.orderStatus === 'harvest_ready')
      .map((o) => ({
        id: o._id, type: 'order',
        label: `Harvest ready for dispatch: ${o.cropName}`,
        sub:   `Order ${o.orderNumber} · ${o.quantityKg} kg`,
        severity: 'blue', to: '/farmer/orders-bookings',
      })),
  ];

  // ── Greeting ─────────────────────────────────────────────────────────────
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = currentUser?.name?.split(' ')[0] || 'Farmer';

  // ── Page background ───────────────────────────────────────────────────────
  const bg = darkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8faf8] text-slate-900';

  return (
    <div className={`min-h-screen ${bg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 space-y-8">

        {/* ════════════════════════════════════════════════════════
            1. WELCOME HERO
        ════════════════════════════════════════════════════════ */}
        <div className={`${t.card(darkMode)} rounded-2xl shadow-xs overflow-hidden`}>
          <div className="px-6 py-6 sm:px-8 sm:py-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {/* Greeting */}
              <div className="flex items-center gap-2 mb-2">
                <Sun className="w-4 h-4 text-amber-500" />
                <span className={`text-xs font-semibold ${t.muted(darkMode)}`}>
                  {greeting}, {firstName}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight leading-tight">
                Welcome to your Farm Dashboard
              </h1>
              <p className={`text-sm mt-1.5 max-w-md leading-relaxed ${t.muted(darkMode)}`}>
                Manage your harvest, track orders and maximise your farm earnings.
                {currentUser?.location?.city && (
                  <span className={`ml-2 ${t.faint(darkMode)}`}>· {currentUser.location.city}</span>
                )}
              </p>
            </div>

            {/* Primary CTA */}
            <button
              onClick={() => navigate('/farmer/add-crop')}
              className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              List New Crop
            </button>
          </div>

          {/* Thin green accent bar at top */}
          <div className="h-0.5 bg-gradient-to-r from-emerald-500 via-emerald-400 to-transparent" />
        </div>

        {/* ════════════════════════════════════════════════════════
            2. KPI STRIP — 5 cards
        ════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            label="Available Produce"
            value={`${totalProduceKg.toLocaleString()} kg`}
            sub={`${crops.length} listing${crops.length !== 1 ? 's' : ''}`}
            icon={Package}
            accentColor="emerald"
            darkMode={darkMode}
          />
          <KpiCard
            label="Active Orders"
            value={activeOrders}
            sub="In pipeline"
            icon={TrendingUp}
            accentColor="blue"
            darkMode={darkMode}
          />
          <KpiCard
            label="Pending Bookings"
            value={pendingBookings}
            sub={pendingBookings > 0 ? 'Awaiting confirmation' : 'All confirmed'}
            icon={Clock}
            accentColor={pendingBookings > 0 ? 'amber' : 'emerald'}
            darkMode={darkMode}
          />
          <KpiCard
            label="Expected Earnings"
            value={`₹${expectedEarnings.toLocaleString()}`}
            sub="Based on current prices"
            icon={IndianRupee}
            accentColor="emerald"
            darkMode={darkMode}
          />
          <KpiCard
            label="At-Risk Produce"
            value={atRiskCrops.length}
            sub={atRiskCrops.length > 0 ? 'Need immediate action' : 'All crops healthy'}
            icon={AlertTriangle}
            accentColor={atRiskCrops.length > 0 ? 'rose' : 'emerald'}
            darkMode={darkMode}
          />
        </div>

        {/* ════════════════════════════════════════════════════════
            3. MAIN CONTENT GRID (2/3 + 1/3)
        ════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT 2/3 ───────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* ── AI Crop Risk Monitor ────────────────────────── */}
            <div>
              <SectionHead
                icon={Sparkles}
                iconColor="text-emerald-500"
                title="AI Crop Risk Monitor"
                action={{ label: 'View all crops', onClick: () => navigate('/farmer/crops') }}
                darkMode={darkMode}
              />

              {crops.length === 0 ? (
                /* Empty state */
                <div className={`${t.card(darkMode)} rounded-2xl shadow-xs`}>
                  <div className="flex flex-col items-center justify-center py-14 text-center px-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                      darkMode ? 'bg-slate-800' : 'bg-emerald-50'
                    }`}>
                      <Leaf className="w-7 h-7 text-emerald-500" />
                    </div>
                    <h3 className="font-bold text-base mb-1">No crops listed yet</h3>
                    <p className={`text-sm max-w-xs mx-auto leading-relaxed mb-5 ${t.muted(darkMode)}`}>
                      List your first crop to start connecting with buyers and tracking your farm performance.
                    </p>
                    <button
                      onClick={() => navigate('/farmer/add-crop')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      List Your First Crop
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Risk distribution summary */}
                  <RiskSummary crops={crops} darkMode={darkMode} />

                  {/* Crop rows */}
                  {crops.slice(0, 5).map((crop) => (
                    <CropRiskRow key={crop._id} crop={crop} darkMode={darkMode} />
                  ))}
                  {crops.length > 5 && (
                    <button
                      onClick={() => navigate('/farmer/crops')}
                      className={`w-full py-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        darkMode
                          ? 'border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700'
                          : 'border-slate-200 text-slate-500 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      View all {crops.length} crops →
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── My Crop Inventory (premium table) ──────────── */}
            <div>
              <SectionHead
                icon={Package}
                iconColor="text-slate-500"
                title="Crop Inventory"
                action={{ label: 'Full inventory', onClick: () => navigate('/farmer/crops') }}
                darkMode={darkMode}
              />

              {crops.length === 0 ? (
                <div className={`${t.card(darkMode)} rounded-2xl shadow-xs`}>
                  <div className={`text-center py-10 text-xs ${t.muted(darkMode)}`}>
                    Your farm inventory is empty. Start by listing your first crop.
                  </div>
                </div>
              ) : (
                <div className={`${t.card(darkMode)} rounded-2xl shadow-xs overflow-hidden`}>
                  {/* Table header */}
                  <div className={`grid grid-cols-5 gap-4 px-4 py-2.5 border-b text-[10px] font-bold uppercase tracking-widest ${
                    darkMode ? 'border-slate-800 text-slate-500 bg-slate-900/60' : 'border-slate-100 text-slate-400 bg-slate-50'
                  }`}>
                    <span className="col-span-2">Crop</span>
                    <span className="text-right">Available</span>
                    <span className="text-right">Price</span>
                    <span className="text-right">Status</span>
                  </div>

                  {/* Rows */}
                  <div className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    {crops.slice(0, 6).map((crop) => {
                      const cfg = riskConfig(crop.aiRiskScore ?? 0);
                      const isPreHarvest = crop.status === 'pre_harvest';
                      return (
                        <div
                          key={crop._id}
                          className={`grid grid-cols-5 gap-4 px-4 py-3 text-xs items-center transition-colors ${
                            darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                          }`}
                        >
                          {/* Crop + variety */}
                          <div className="col-span-2 flex items-center gap-2.5 min-w-0">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                            <div className="min-w-0">
                              <div className="font-semibold truncate">{crop.cropName}</div>
                              <div className={`text-[10px] truncate ${t.faint(darkMode)}`}>{crop.variety}</div>
                            </div>
                          </div>
                          {/* Available qty */}
                          <div className="text-right font-semibold">
                            {crop.availableQuantityKg?.toLocaleString()} kg
                          </div>
                          {/* Price */}
                          <div className="text-right font-bold text-emerald-600">
                            ₹{crop.pricePerKg}/kg
                          </div>
                          {/* Status badge */}
                          <div className="text-right">
                            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                              isPreHarvest
                                ? darkMode
                                  ? 'bg-blue-950/30 text-blue-300 border-blue-900/40'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                                : cfg.badge
                            }`}>
                              {isPreHarvest ? 'Pre-Harvest' : cfg.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  {crops.length > 6 && (
                    <div className={`px-4 py-3 border-t text-center ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <button
                        onClick={() => navigate('/farmer/crops')}
                        className={`text-xs font-semibold cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        +{crops.length - 6} more crops → View all
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Recent Orders ───────────────────────────────── */}
            {orders.length > 0 && (
              <div>
                <SectionHead
                  icon={TrendingUp}
                  iconColor="text-blue-500"
                  title="Recent Orders"
                  action={{ label: 'View all', onClick: () => navigate('/farmer/orders-bookings') }}
                  darkMode={darkMode}
                />
                <div className={`${t.card(darkMode)} rounded-2xl shadow-xs overflow-hidden`}>
                  <div className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    {orders.slice(0, 4).map((o) => {
                      const statusColors = {
                        placed:               darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600',
                        harvest_ready:        darkMode ? 'bg-blue-950/30 text-blue-300' : 'bg-blue-50 text-blue-700',
                        transporter_assigned: darkMode ? 'bg-indigo-950/30 text-indigo-300' : 'bg-indigo-50 text-indigo-700',
                        in_transit:           darkMode ? 'bg-amber-950/30 text-amber-300' : 'bg-amber-50 text-amber-700',
                        delivered:            darkMode ? 'bg-emerald-950/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700',
                        completed:            darkMode ? 'bg-emerald-950/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700',
                        cancelled:            darkMode ? 'bg-rose-950/30 text-rose-300' : 'bg-rose-50 text-rose-700',
                      };
                      return (
                        <div key={o._id} className={`flex items-center gap-4 px-4 py-3.5 transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{o.cropName}</span>
                              <span className={`text-[10px] font-mono font-bold ${t.faint(darkMode)}`}>{o.orderNumber}</span>
                            </div>
                            <div className={`text-[11px] mt-0.5 ${t.muted(darkMode)}`}>
                              {o.quantityKg?.toLocaleString()} kg · Buyer: {o.buyerName || '—'}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-extrabold text-sm text-emerald-600">₹{o.totalPrice?.toLocaleString()}</div>
                            <span className={`mt-1 inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md ${statusColors[o.orderStatus] || statusColors.placed}`}>
                              {o.orderStatus?.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT 1/3 ──────────────────────────────────────── */}
          <div className="space-y-5">

            {/* ── Actions Required ────────────────────────────── */}
            <div>
              <SectionHead
                icon={AlertTriangle}
                iconColor="text-amber-500"
                title="Actions Required"
                darkMode={darkMode}
              />
              {actions.length === 0 ? (
                <div className={`${t.card(darkMode)} rounded-2xl shadow-xs`}>
                  <div className="flex flex-col items-center py-8 px-4 text-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                      darkMode ? 'bg-emerald-950/30' : 'bg-emerald-50'
                    }`}>
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <p className="text-sm font-semibold">All clear</p>
                    <p className={`text-xs mt-1 ${t.muted(darkMode)}`}>No pending actions.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {actions.map((action) => (
                    <ActionItem
                      key={action.id + action.type}
                      action={action}
                      darkMode={darkMode}
                      onClick={() => navigate(action.to)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ── Quick Actions ────────────────────────────────── */}
            <div>
              <SectionHead
                icon={Zap}
                iconColor="text-amber-500"
                title="Quick Actions"
                darkMode={darkMode}
              />
              <div className={`${t.card(darkMode)} rounded-2xl shadow-xs p-3 space-y-1.5`}>
                <QuickAction
                  to="/farmer/add-crop"
                  icon={Plus}
                  label="List New Crop"
                  colorClass={darkMode ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}
                  darkMode={darkMode}
                />
                <QuickAction
                  to="/farmer/crops"
                  icon={Package}
                  label="View Inventory"
                  colorClass={darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}
                  darkMode={darkMode}
                />
                <QuickAction
                  to="/farmer/orders-bookings"
                  icon={TrendingUp}
                  label="View Orders"
                  colorClass={darkMode ? 'bg-blue-950/40 text-blue-400' : 'bg-blue-100 text-blue-700'}
                  darkMode={darkMode}
                />
                <QuickAction
                  to="/farmer/orders-bookings"
                  icon={FileText}
                  label="View Bookings"
                  colorClass={darkMode ? 'bg-amber-950/40 text-amber-400' : 'bg-amber-100 text-amber-700'}
                  darkMode={darkMode}
                />
              </div>
            </div>

            {/* ── Pre-Harvest Contracts ────────────────────────── */}
            <div>
              <SectionHead
                icon={FileText}
                iconColor="text-blue-500"
                title="Pre-Harvest Contracts"
                action={bookings.length > 0
                  ? { label: 'View all', onClick: () => navigate('/farmer/orders-bookings') }
                  : undefined
                }
                darkMode={darkMode}
              />
              {bookings.length === 0 ? (
                <div className={`${t.card(darkMode)} rounded-2xl shadow-xs`}>
                  <div className="py-8 px-5 text-center">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                      darkMode ? 'bg-slate-800' : 'bg-slate-100'
                    }`}>
                      <FileText className={`w-4 h-4 ${t.muted(darkMode)}`} />
                    </div>
                    <p className={`text-xs font-semibold mb-1`}>No contracts yet</p>
                    <p className={`text-[11px] leading-relaxed ${t.muted(darkMode)}`}>
                      Buyers will appear here after booking from the marketplace.
                    </p>
                  </div>
                </div>
              ) : (
                <div className={`${t.card(darkMode)} rounded-2xl shadow-xs overflow-hidden`}>
                  <div className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    {bookings.slice(0, 3).map((b) => {
                      const statusCls = {
                        confirmed:               darkMode ? 'bg-emerald-950/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700',
                        pending_farmer_approval: darkMode ? 'bg-amber-950/30 text-amber-300'   : 'bg-amber-50 text-amber-700',
                        cancelled:               darkMode ? 'bg-rose-950/30 text-rose-300'     : 'bg-rose-50 text-rose-700',
                        converted_to_order:      darkMode ? 'bg-blue-950/30 text-blue-300'     : 'bg-blue-50 text-blue-700',
                      }[b.status] || '';

                      return (
                        <div key={b._id} className={`px-4 py-3.5 transition-colors ${darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'}`}>
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-xs">{b.cropName}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${statusCls}`}>
                              {b.status?.replace(/_/g, ' ')}
                            </span>
                          </div>
                          <div className={`text-[11px] ${t.muted(darkMode)}`}>
                            {b.bookedQuantityKg?.toLocaleString()} kg · {b.buyerName}
                          </div>
                          <div className="flex justify-between items-center mt-1.5">
                            <span className={`text-[11px] ${t.faint(darkMode)}`}>
                              ₹{b.agreedPricePerKg}/kg
                            </span>
                            <span className="text-xs font-extrabold text-emerald-600">
                              ₹{b.totalAmount?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {bookings.length > 3 && (
                    <div className={`px-4 py-2.5 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <button
                        onClick={() => navigate('/farmer/orders-bookings')}
                        className={`text-xs font-semibold cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                      >
                        +{bookings.length - 3} more contracts →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Farm Performance stub ────────────────────────── */}
            <div>
              <SectionHead
                icon={BarChart3}
                iconColor="text-purple-500"
                title="Farm Performance"
                darkMode={darkMode}
              />
              <div className={`${t.card(darkMode)} rounded-2xl shadow-xs p-5`}>
                {orders.filter(o => ['delivered', 'completed'].includes(o.orderStatus)).length === 0 ? (
                  <div className="text-center py-4">
                    <BarChart3 className={`w-8 h-8 mx-auto mb-2 opacity-30 ${t.muted(darkMode)}`} />
                    <p className={`text-xs font-semibold mb-1`}>No completed orders yet</p>
                    <p className={`text-[11px] leading-relaxed ${t.muted(darkMode)}`}>
                      Revenue and sales charts will appear here once you complete your first delivery.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    {[
                      {
                        label: 'Gross Revenue',
                        value: `₹${orders.filter(o => !['cancelled'].includes(o.orderStatus)).reduce((s, o) => s + (o.totalPrice || 0), 0).toLocaleString()}`,
                      },
                      {
                        label: 'Produce Sold',
                        value: `${orders.filter(o => ['delivered', 'completed'].includes(o.orderStatus)).reduce((s, o) => s + (o.quantityKg || 0), 0).toLocaleString()} kg`,
                      },
                      {
                        label: 'Completed Orders',
                        value: orders.filter(o => ['delivered', 'completed'].includes(o.orderStatus)).length,
                      },
                    ].map(({ label, value }) => (
                      <div key={label} className={`flex justify-between items-center py-2.5 border-b last:border-0 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                        <span className={t.muted(darkMode)}>{label}</span>
                        <span className="font-extrabold">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════
            Footer note
        ════════════════════════════════════════════════════════ */}
        <div className={`flex items-center gap-2 pt-2 border-t ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className={`text-[10px] ${t.faint(darkMode)}`}>
            All data secured with SHA-256 blockchain provenance · AgriFlow AI · DYPCET Kolhapur 2026
          </span>
        </div>

      </div>
    </div>
  );
}
