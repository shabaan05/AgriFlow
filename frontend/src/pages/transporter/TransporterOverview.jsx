/**
 * /transporter — Transporter Dashboard
 * KPI cards · Shipment pipeline · Today's shipments table
 * All data from Zustand orders store only.
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck, Package, Map, ArrowRight,
  CheckCircle2, Clock, Navigation, Thermometer,
  MapPin, AlertTriangle, TrendingUp
} from 'lucide-react';
import { useAppStore } from '../../services/useAppStore';
import { api } from '../../services/api';

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

function NavBtn({ to, icon: Icon, label, description, colorClass, darkMode }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className={`group flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer text-left w-full ${
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

// Pipeline stage config — maps orderStatus to a stage index 0–4
const PIPELINE_STAGES = [
  { key: 'placed',               label: 'Placed',         short: 'Placed' },
  { key: 'harvest_ready',        label: 'Harvest Ready',  short: 'Ready' },
  { key: 'transporter_assigned', label: 'Assigned',       short: 'Assigned' },
  { key: 'in_transit',           label: 'In Transit',     short: 'Transit' },
  { key: 'delivered',            label: 'Delivered',      short: 'Done' },
];

function stageIndex(status) {
  const idx = PIPELINE_STAGES.findIndex((s) => s.key === status);
  return idx === -1 ? (status === 'completed' ? 4 : 0) : idx;
}

const STATUS_CLS = {
  placed:               'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  harvest_ready:        'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  transporter_assigned: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
  in_transit:           'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  delivered:            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  completed:            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  cancelled:            'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
};

// ════════════════════════════════════════════════════════════════════════════
export default function TransporterOverview() {
  const navigate    = useNavigate();
  const darkMode    = useAppStore((s) => s.darkMode);
  const orders      = useAppStore((s) => s.orders);
  const refreshData = useAppStore((s) => s.refreshData);

  // ── KPIs ────────────────────────────────────────────────────────────────
  const active    = orders.filter((o) => !['delivered', 'completed', 'cancelled'].includes(o.orderStatus));
  const pending   = orders.filter((o) => ['placed', 'harvest_ready'].includes(o.orderStatus));
  const inTransit = orders.filter((o) => o.orderStatus === 'in_transit');
  const delivered = orders.filter((o) => ['delivered', 'completed'].includes(o.orderStatus));
  const assigned  = orders.filter((o) => o.orderStatus === 'transporter_assigned');

  // Vehicle utilisation: total in-transit kg vs 10T capacity (one truck)
  const inTransitKg     = inTransit.reduce((s, o) => s + (o.quantityKg || 0), 0);
  const utilPct         = Math.min(100, Math.round((inTransitKg / 10000) * 100));

  // ── Pipeline counts per stage ───────────────────────────────────────────
  const stageCounts = PIPELINE_STAGES.map((s) => ({
    ...s,
    count: orders.filter((o) => o.orderStatus === s.key || (s.key === 'delivered' && o.orderStatus === 'completed')).length,
  }));

  // ── Quick status update (reusing existing api) ──────────────────────────
  const handleQuickUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('agriflow_token');
      await api.updateOrderStatus(orderId, { orderStatus: newStatus }, token);
      refreshData();
    } catch (_) { /* silent — full functionality in /transporter/shipments */ }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center">
              <Truck className="w-4 h-4 text-amber-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">Transporter Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Fleet Logistics Dashboard</h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Shipments · Routes · Capacity · Delivery
          </p>
        </div>
        <button
          onClick={() => navigate('/transporter/shipments')}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Package className="w-4 h-4" /> Manage Shipments
        </button>
      </div>

      {/* ── KPI Strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Active Shipments"  value={active.length}    sub="In pipeline"       icon={TrendingUp}   iconColor="text-amber-500"   darkMode={darkMode} />
        <KpiCard label="Pending Pickups"   value={pending.length}   sub="Awaiting fleet"    icon={Clock}        iconColor="text-blue-500"    darkMode={darkMode} />
        <KpiCard label="In Transit"        value={inTransit.length} sub="En-route"          icon={Navigation}   iconColor="text-indigo-500"  darkMode={darkMode} />
        <KpiCard label="Delivered"         value={delivered.length} sub="Confirmed drops"   icon={CheckCircle2} iconColor="text-emerald-500" darkMode={darkMode} />
        <KpiCard label="Vehicle Util."     value={`${utilPct}%`}    sub={`${inTransitKg.toLocaleString()} kg / 10T`} icon={Truck} iconColor={utilPct > 80 ? 'text-amber-500' : 'text-slate-400'} darkMode={darkMode} />
      </div>

      {/* ── Shipment Pipeline ──────────────────────────────────────────── */}
      <div className={`p-5 sm:p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
        <h2 className="text-sm font-bold mb-5">Shipment Pipeline</h2>
        <div className="flex items-start gap-0">
          {stageCounts.map((stage, idx) => (
            <div key={stage.key} className="flex-1 flex flex-col items-center gap-2 min-w-0">
              {/* Step circle */}
              <div className={`relative flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 transition-all ${
                stage.count > 0
                  ? 'bg-amber-500 border-amber-500 text-white'
                  : darkMode ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-slate-100 border-slate-300 text-slate-400'
              }`}>
                {stage.count > 0 ? stage.count : idx + 1}
              </div>
              {/* Connector line (except last) */}
              {idx < stageCounts.length - 1 && (
                <div className={`absolute hidden`} /* rendered via CSS flex gap */ />
              )}
              <span className={`text-[10px] font-semibold text-center px-1 leading-tight ${
                stage.count > 0
                  ? darkMode ? 'text-amber-400' : 'text-amber-700'
                  : darkMode ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {stage.short}
              </span>
            </div>
          ))}
        </div>
        {/* Connector line drawn with a full-width bar behind */}
        <div className="relative -mt-[52px] mb-[52px] flex items-center px-4 pointer-events-none">
          <div className={`w-full h-0.5 ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
        </div>
      </div>

      {/* ── Two-col body ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left 2/3: Today's / Active Shipments */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" /> Active Shipments
            </h2>
            <button
              onClick={() => navigate('/transporter/shipments')}
              className={`text-xs font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
            >
              Manage all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {active.length === 0 ? (
            <div className={`rounded-2xl border border-dashed p-10 text-center text-xs ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
              <Truck className="w-9 h-9 mx-auto mb-2 opacity-30" />
              No active shipments. New orders will appear here automatically.
            </div>
          ) : (
            <div className="space-y-3">
              {active.slice(0, 5).map((o) => {
                const stIdx   = stageIndex(o.orderStatus);
                const statCls = STATUS_CLS[o.orderStatus] || 'bg-slate-100 text-slate-600';

                return (
                  <div
                    key={o._id}
                    className={`p-4 rounded-2xl border transition-all ${
                      darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                               : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Order header */}
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] text-slate-400">{o.orderNumber}</span>
                          <span className="font-bold text-sm">{o.cropName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statCls}`}>
                            {PIPELINE_STAGES[stIdx]?.label || o.orderStatus}
                          </span>
                        </div>

                        {/* Locations */}
                        <div className={`flex flex-col gap-0.5 text-xs mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span className="flex items-center gap-1.5">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            Pickup: {o.pickupLocation?.address || o.pickupLocation?.city || 'Farm Hub, Kolhapur'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Navigation className="w-3 h-3 flex-shrink-0" />
                            Drop: {o.deliveryLocation?.address || o.deliveryLocation?.city || 'Depot'}
                          </span>
                        </div>
                      </div>

                      {/* Right: quantity + cold chain */}
                      <div className="text-right flex-shrink-0 text-xs">
                        <div className="font-bold">{o.quantityKg?.toLocaleString()} kg</div>
                        <div className={`flex items-center gap-1 justify-end mt-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                          <Thermometer className="w-3 h-3" />
                          <span>4°C</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick action — primary next step */}
                    <div className="mt-3 flex gap-2">
                      {o.orderStatus === 'placed' && (
                        <button
                          onClick={() => handleQuickUpdate(o._id, 'transporter_assigned')}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold cursor-pointer transition-all"
                        >
                          Accept & Assign Fleet
                        </button>
                      )}
                      {o.orderStatus === 'transporter_assigned' && (
                        <button
                          onClick={() => handleQuickUpdate(o._id, 'in_transit')}
                          className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold cursor-pointer transition-all"
                        >
                          Start Transit
                        </button>
                      )}
                      {o.orderStatus === 'in_transit' && (
                        <button
                          onClick={() => handleQuickUpdate(o._id, 'delivered')}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-bold cursor-pointer transition-all"
                        >
                          Confirm Delivery
                        </button>
                      )}
                      {o.orderStatus === 'harvest_ready' && (
                        <div className={`flex-1 py-1.5 rounded-xl text-[11px] font-semibold text-center ${darkMode ? 'bg-blue-950/30 text-blue-300' : 'bg-blue-50 text-blue-600'}`}>
                          Awaiting farm harvest…
                        </div>
                      )}
                      <button
                        onClick={() => navigate('/transporter/shipments')}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border cursor-pointer transition-all ${
                          darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
              {active.length > 5 && (
                <button
                  onClick={() => navigate('/transporter/shipments')}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold border cursor-pointer transition-all ${
                    darkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  View all {active.length} active shipments →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right 1/3 */}
        <div className="space-y-6">
          {/* Delivered summary */}
          {delivered.length > 0 && (
            <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
              <h3 className="text-xs font-bold mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Recent Deliveries
              </h3>
              <div className="space-y-2">
                {delivered.slice(0, 3).map((o) => (
                  <div key={o._id} className={`flex justify-between items-center text-xs p-2.5 rounded-xl ${darkMode ? 'bg-slate-800/40' : 'bg-slate-50'}`}>
                    <div>
                      <div className="font-semibold">{o.cropName}</div>
                      <div className={darkMode ? 'text-slate-500' : 'text-slate-400'}>{o.quantityKg?.toLocaleString()} kg</div>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick nav */}
          <div>
            <h2 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Quick Navigation</h2>
            <div className="space-y-2">
              <NavBtn to="/transporter/shipments"          icon={Package} label="Shipments"          description="Accept & manage dispatches"         colorClass="bg-amber-500/10 text-amber-600 border-amber-500/20"   darkMode={darkMode} />
              <NavBtn to="/transporter/route-optimization" icon={Map}     label="Route Optimization" description="AI VRP consolidation & fuel savings" colorClass="bg-emerald-500/10 text-emerald-600 border-emerald-500/20" darkMode={darkMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
