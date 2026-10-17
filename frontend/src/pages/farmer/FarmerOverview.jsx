import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wheat, Plus, ClipboardList, ArrowRight,
  Package, AlertTriangle, TrendingUp, Clock,
  Flame, Sparkles, CheckCircle2, FileText, IndianRupee
} from 'lucide-react';
import { useAppStore } from '../../services/useAppStore';

// ─── KPI Card ───────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, iconColor, darkMode }) {
  return (
    <div className={`rounded-2xl border p-5 flex flex-col gap-2 ${
      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
    }`}>
      <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <div className="text-2xl font-extrabold tracking-tight">{value}</div>
      {sub && <div className={`text-[11px] font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{sub}</div>}
    </div>
  );
}

// ─── Quick Nav Button ────────────────────────────────────────────────────────
function NavBtn({ to, icon: Icon, label, description, colorClass, darkMode }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left w-full ${
        darkMode ? 'bg-slate-900/60 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                 : 'bg-white border-slate-200 hover:shadow-md hover:border-slate-300'
      }`}
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="font-bold text-sm">{label}</span>
          <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </div>
        <p className={`text-xs mt-0.5 leading-snug ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
      </div>
    </button>
  );
}

// ─── Risk badge colour ───────────────────────────────────────────────────────
function riskBadge(score) {
  if (score >= 65) return { label: 'Critical', cls: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' };
  if (score >= 35) return { label: 'Moderate', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' };
  return { label: 'Low Risk', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' };
}

// ════════════════════════════════════════════════════════════════════════════
export default function FarmerOverview() {
  const navigate   = useNavigate();
  const darkMode   = useAppStore((s) => s.darkMode);
  const crops      = useAppStore((s) => s.crops);
  const bookings   = useAppStore((s) => s.bookings);
  const orders     = useAppStore((s) => s.orders);

  // ── KPI calculations (real data only) ──────────────────────────────────
  const totalProduceKg    = crops.reduce((sum, c) => sum + (c.availableQuantityKg || 0), 0);
  const activeOrders      = orders.filter((o) => !['delivered', 'completed', 'cancelled'].includes(o.orderStatus)).length;
  const pendingBookings   = bookings.filter((b) => b.status === 'pending_farmer_approval').length;
  const expectedEarnings  = crops.reduce((sum, c) => sum + ((c.availableQuantityKg || 0) * (c.pricePerKg || 0)), 0);
  const atRiskCrops       = crops.filter((c) => c.isUrgentSale || (c.aiRiskScore || 0) >= 65);

  // ── Actions Required ───────────────────────────────────────────────────
  const actions = [
    ...bookings
      .filter((b) => b.status === 'pending_farmer_approval')
      .map((b) => ({
        id: b._id,
        type: 'booking',
        label: `Confirm booking: ${b.cropName}`,
        sub: `${b.bookedQuantityKg} kg • ₹${b.totalAmount?.toLocaleString()} • Buyer: ${b.buyerName}`,
        severity: 'amber',
        to: '/farmer/orders-bookings',
      })),
    ...atRiskCrops.map((c) => ({
      id: c._id,
      type: 'risk',
      label: `At-risk produce: ${c.cropName}`,
      sub: `${c.availableQuantityKg} kg remaining • ${c.aiShelfLife?.daysRemaining ?? c.estimatedShelfLifeDays} days left`,
      severity: 'rose',
      to: '/farmer/crops',
    })),
    ...orders
      .filter((o) => o.orderStatus === 'harvest_ready')
      .map((o) => ({
        id: o._id,
        type: 'order',
        label: `Harvest ready for dispatch: ${o.cropName}`,
        sub: `Order ${o.orderNumber} • ${o.quantityKg} kg`,
        severity: 'blue',
        to: '/farmer/orders-bookings',
      })),
  ];

  const severityClass = {
    amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    rose:  'bg-rose-500/10  text-rose-600  border-rose-500/20',
    blue:  'bg-blue-500/10  text-blue-600  border-blue-500/20',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Wheat className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Farmer Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Farmer Producer Dashboard</h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Produce · Risk · Orders · Earnings — all in one place.
          </p>
        </div>
        <button
          onClick={() => navigate('/farmer/add-crop')}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> List New Crop
        </button>
      </div>

      {/* ── KPI Strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Available Produce"
          value={`${totalProduceKg.toLocaleString()} kg`}
          sub={`Across ${crops.length} listing${crops.length !== 1 ? 's' : ''}`}
          icon={Package}
          iconColor="text-emerald-500"
          darkMode={darkMode}
        />
        <KpiCard
          label="Active Orders"
          value={activeOrders}
          sub="In pipeline"
          icon={TrendingUp}
          iconColor="text-blue-500"
          darkMode={darkMode}
        />
        <KpiCard
          label="Pending Bookings"
          value={pendingBookings}
          sub="Awaiting confirmation"
          icon={Clock}
          iconColor="text-amber-500"
          darkMode={darkMode}
        />
        <KpiCard
          label="Expected Earnings"
          value={`₹${expectedEarnings.toLocaleString()}`}
          sub="Based on current prices"
          icon={IndianRupee}
          iconColor="text-emerald-600"
          darkMode={darkMode}
        />
        <KpiCard
          label="At-Risk Produce"
          value={atRiskCrops.length}
          sub={atRiskCrops.length > 0 ? 'Needs action' : 'All healthy'}
          icon={AlertTriangle}
          iconColor={atRiskCrops.length > 0 ? 'text-rose-500' : 'text-emerald-500'}
          darkMode={darkMode}
        />
      </div>

      {/* ── Two-col body ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left col (2/3): AI Crop Risk */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" /> AI Crop Risk Monitor
            </h2>
            <button
              onClick={() => navigate('/farmer/crops')}
              className={`text-xs font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {crops.length === 0 ? (
            <div className={`rounded-2xl border border-dashed p-10 text-center text-xs ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
              No crops listed yet. <button onClick={() => navigate('/farmer/add-crop')} className="text-emerald-600 font-semibold underline underline-offset-2">Add your first crop →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {crops.slice(0, 5).map((crop) => {
                const risk    = crop.aiRiskScore ?? 0;
                const badge   = riskBadge(risk);
                const daysLeft = crop.aiShelfLife?.daysRemaining ?? crop.estimatedShelfLifeDays ?? '—';
                const isPreHarvest = crop.status === 'pre_harvest';

                return (
                  <div
                    key={crop._id}
                    className={`p-4 rounded-2xl border transition-all ${
                      darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                               : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Left: info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm">{crop.cropName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isPreHarvest
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}>
                            {isPreHarvest ? 'Pre-Harvest' : 'Harvested'}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.cls}`}>
                            {badge.label}
                          </span>
                          {crop.isUrgentSale && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-1">
                              <Flame className="w-3 h-3" /> -{crop.discountPercentage}% Sale
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {crop.variety} · {crop.qualityGrade}
                        </p>

                        {/* Metrics row */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                          <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                            Available: <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{crop.availableQuantityKg?.toLocaleString()} kg</strong>
                          </span>
                          <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                            Price: <strong className="text-emerald-600">₹{crop.pricePerKg}/kg</strong>
                          </span>
                          {!isPreHarvest && (
                            <span className={`flex items-center gap-1 ${daysLeft <= 2 ? 'text-rose-600 font-bold' : darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              <Clock className="w-3 h-3" /> {daysLeft} days left
                            </span>
                          )}
                          {isPreHarvest && crop.expectedHarvestDate && (
                            <span className={darkMode ? 'text-slate-400' : 'text-slate-500'}>
                              Harvest: <strong className={darkMode ? 'text-white' : 'text-slate-900'}>{new Date(crop.expectedHarvestDate).toLocaleDateString()}</strong>
                            </span>
                          )}
                        </div>

                        {/* Risk bar */}
                        {!isPreHarvest && (
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full transition-all ${
                                  risk >= 65 ? 'bg-rose-500' : risk >= 35 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${Math.min(100, risk)}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-bold w-8 text-right ${
                              risk >= 65 ? 'text-rose-500' : risk >= 35 ? 'text-amber-500' : 'text-emerald-500'
                            }`}>{risk}%</span>
                          </div>
                        )}

                        {/* AI advice */}
                        {crop.aiWastageMitigation?.actionRequired && (
                          <div className={`mt-2 px-3 py-1.5 rounded-xl text-[11px] flex items-start gap-1.5 ${
                            darkMode ? 'bg-rose-950/30 text-rose-300' : 'bg-rose-50 text-rose-700'
                          }`}>
                            <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-px" />
                            {crop.aiWastageMitigation.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              {crops.length > 5 && (
                <button
                  onClick={() => navigate('/farmer/crops')}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    darkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  View all {crops.length} crops →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right col (1/3): Actions Required + Bookings summary */}
        <div className="space-y-6">

          {/* Actions Required */}
          <div>
            <h2 className="text-sm font-bold flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Actions Required
            </h2>
            {actions.length === 0 ? (
              <div className={`rounded-2xl border border-dashed p-6 text-center text-xs ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1.5 text-emerald-500" />
                All clear — no pending actions.
              </div>
            ) : (
              <div className="space-y-2">
                {actions.map((a) => (
                  <button
                    key={a.id + a.type}
                    onClick={() => navigate(a.to)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer group ${
                      darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                               : 'bg-white border-slate-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className={`inline-block mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                        a.severity === 'rose' ? 'bg-rose-500' :
                        a.severity === 'amber' ? 'bg-amber-500' : 'bg-blue-500'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold leading-snug">{a.label}</div>
                        <div className={`text-[11px] mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{a.sub}</div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Recent bookings summary */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> Pre-Harvest Contracts
              </h2>
              <button onClick={() => navigate('/farmer/orders-bookings')} className={`text-xs font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                All <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {bookings.length === 0 ? (
              <div className={`rounded-2xl border border-dashed p-5 text-center text-xs ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                No contracts yet. Buyers will appear here after booking from the marketplace.
              </div>
            ) : (
              <div className="space-y-2">
                {bookings.slice(0, 3).map((b) => (
                  <div
                    key={b._id}
                    className={`p-3.5 rounded-xl border text-xs ${
                      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold">{b.cropName}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : b.status === 'pending_farmer_approval'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {b.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div className={`mt-1 flex justify-between ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      <span>{b.bookedQuantityKg} kg · {b.buyerName}</span>
                      <span className="font-semibold text-emerald-600">₹{b.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick nav */}
          <div>
            <h2 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Quick Navigation</h2>
            <div className="space-y-2">
              <NavBtn to="/farmer/crops"           icon={Package}      label="My Crops"          description="Inventory with AI risk"       colorClass="bg-emerald-500/10 text-emerald-600 border-emerald-500/20" darkMode={darkMode} />
              <NavBtn to="/farmer/add-crop"        icon={Plus}         label="Add New Crop"      description="List a harvest"              colorClass="bg-blue-500/10 text-blue-600 border-blue-500/20"       darkMode={darkMode} />
              <NavBtn to="/farmer/orders-bookings" icon={ClipboardList} label="Orders & Bookings" description="Contracts & order status"   colorClass="bg-amber-500/10 text-amber-600 border-amber-500/20"    darkMode={darkMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
