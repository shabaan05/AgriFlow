/**
 * /admin — Admin Governance Dashboard
 * Embeds the existing AdminDashboard component (unchanged) plus adds
 * platform-level KPIs sourced from Zustand store (crops, orders, bookings).
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Layers, Cpu, FileText, ArrowRight,
  ShieldCheck, Database, Activity, Users, Package,
  TrendingUp, IndianRupee, RefreshCw
} from 'lucide-react';
import { AdminDashboard } from '../../components/AdminDashboard';
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

// ════════════════════════════════════════════════════════════════════════════
export default function AdminOverview() {
  const navigate    = useNavigate();
  const darkMode    = useAppStore((s) => s.darkMode);
  const crops       = useAppStore((s) => s.crops);
  const orders      = useAppStore((s) => s.orders);
  const bookings    = useAppStore((s) => s.bookings);
  const refreshData = useAppStore((s) => s.refreshData);

  // ── Derived KPIs from Zustand (real data only) ──────────────────────────
  const activeCrops    = crops.filter((c) => !['sold', 'expired'].includes(c.status)).length;
  const activeOrders   = orders.filter((o) => !['completed', 'cancelled'].includes(o.orderStatus)).length;
  const totalRevenue   = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const inTransit      = orders.filter((o) => o.orderStatus === 'in_transit').length;
  const urgentCrops    = crops.filter((c) => c.isUrgentSale).length;

  // Unique farmer/buyer counts derived from orders (available without a dedicated API)
  const farmerIds  = [...new Set(orders.map((o) => String(o.farmerId)).filter(Boolean))];
  const buyerIds   = [...new Set(orders.map((o) => String(o.buyerId)).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 flex items-center justify-center">
              <LayoutDashboard className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-purple-600">Admin Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Platform Governance Dashboard</h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Platform · Transactions · AI · Blockchain
          </p>
        </div>
        <button
          onClick={() => refreshData()}
          className={`self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
            darkMode ? 'border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* ── Platform KPI Strip (from Zustand) ──────────────────────────── */}
      <div>
        <h2 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Live Platform KPIs
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard label="Active Crop Listings" value={activeCrops}                         sub={`${crops.length} total on exchange`}    icon={Package}    iconColor="text-emerald-500" darkMode={darkMode} />
          <KpiCard label="Active Orders"         value={activeOrders}                        sub="In pipeline"                            icon={Activity}   iconColor="text-blue-500"    darkMode={darkMode} />
          <KpiCard label="Transaction Value"     value={`₹${totalRevenue.toLocaleString()}`} sub="All non-cancelled orders"              icon={IndianRupee}iconColor="text-purple-500"  darkMode={darkMode} />
          <KpiCard label="In-Transit Shipments"  value={inTransit}                           sub="Currently en-route"                     icon={TrendingUp} iconColor="text-amber-500"   darkMode={darkMode} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <KpiCard label="Farmers (via orders)"  value={farmerIds.length > 0 ? farmerIds.length : '—'}  sub="Distinct in order records"   icon={Users}      iconColor="text-emerald-500" darkMode={darkMode} />
          <KpiCard label="Buyers (via orders)"   value={buyerIds.length  > 0 ? buyerIds.length  : '—'}  sub="Distinct in order records"   icon={Users}      iconColor="text-blue-500"    darkMode={darkMode} />
          <KpiCard label="Pre-Harvest Contracts" value={bookings.length}                     sub="All time"                               icon={FileText}   iconColor="text-purple-500"  darkMode={darkMode} />
          <KpiCard label="Urgent/At-Risk Crops"  value={urgentCrops}                         sub="Need wastage action"                    icon={ShieldCheck}iconColor={urgentCrops > 0 ? 'text-rose-500' : 'text-emerald-500'} darkMode={darkMode} />
        </div>
      </div>

      {/* ── Quick Navigation ───────────────────────────────────────────── */}
      <div>
        <h2 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
          Admin Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <NavBtn to="/admin/blockchain" icon={Layers}        label="Blockchain Explorer" description="Browse SHA-256 immutable ledger · verify chain integrity"   colorClass="bg-amber-500/10 text-amber-600 border-amber-500/20"   darkMode={darkMode} />
          <NavBtn to="/admin/ai"         icon={Cpu}           label="AI Decision Hub"     description="Buyer match · demand forecast · wastage · route planner"    colorClass="bg-blue-500/10 text-blue-600 border-blue-500/20"      darkMode={darkMode} />
          <NavBtn to="/admin/docs"       icon={FileText}      label="Project Docs"        description="System KPIs · architecture · DYPCET capstone documentation" colorClass="bg-purple-500/10 text-purple-600 border-purple-500/20" darkMode={darkMode} />
        </div>
      </div>

      {/* ── Existing AdminDashboard (System Governance + blockchain KPIs) ── */}
      {/* Renders unchanged — provides blockchain blocks, integrity status,
          architecture pillars, and the Refresh Metrics button */}
      <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className={`px-5 py-3 border-b text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}>
          <Database className="w-3.5 h-3.5" /> System Governance & Blockchain Metrics
        </div>
        <AdminDashboard api={api} darkMode={darkMode} />
      </div>
    </div>
  );
}
