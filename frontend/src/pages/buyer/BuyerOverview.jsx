/**
 * /buyer — Buyer Procurement Dashboard
 * KPIs · Recent Orders · Upcoming Supply (pre-harvest contracts) · AI Supplier quick-match
 * All data from Zustand store only. No invented values.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Store, FileText, Cpu, ArrowRight,
  Package, Clock, TrendingUp, Truck, IndianRupee,
  Sparkles, CheckCircle2, Search, ChevronRight
} from 'lucide-react';
import { useAppStore } from '../../services/useAppStore';
import { api } from '../../services/api';

// ─── Shared sub-components ───────────────────────────────────────────────────
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

const ORDER_STATUS_META = {
  placed:               { label: 'Placed',              cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  harvest_ready:        { label: 'Harvest Ready',        cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  transporter_assigned: { label: 'Assigned',             cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' },
  in_transit:           { label: 'In Transit',           cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  delivered:            { label: 'Delivered',            cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  completed:            { label: 'Completed',            cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  cancelled:            { label: 'Cancelled',            cls: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
};

// ════════════════════════════════════════════════════════════════════════════
export default function BuyerOverview() {
  const navigate = useNavigate();
  const darkMode = useAppStore((s) => s.darkMode);
  const orders   = useAppStore((s) => s.orders);
  const bookings = useAppStore((s) => s.bookings);
  const crops    = useAppStore((s) => s.crops);

  // ── KPI calculations ────────────────────────────────────────────────────
  const activeOrders     = orders.filter((o) => !['delivered', 'completed', 'cancelled'].includes(o.orderStatus));
  const inTransit        = orders.filter((o) => o.orderStatus === 'in_transit').length;
  const totalSpend       = orders
    .filter((o) => o.orderStatus !== 'cancelled')
    .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  const totalQtyProcured = orders
    .filter((o) => !['cancelled'].includes(o.orderStatus))
    .reduce((sum, o) => sum + (o.quantityKg || 0), 0);
  const activeContracts  = bookings.filter((b) => !['cancelled'].includes(b.status));

  // ── AI Quick Match state ─────────────────────────────────────────────────
  const [matchCrop,    setMatchCrop]    = useState('Tomato');
  const [matchQty,     setMatchQty]     = useState(500);
  const [matchResults, setMatchResults] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  const runQuickMatch = async () => {
    setMatchLoading(true);
    try {
      const res = await api.matchCrops({ targetCropName: matchCrop, targetQuantity: Number(matchQty) });
      if (res.success) setMatchResults(res.recommendations?.slice(0, 3) || []);
    } catch (_) { /* silent */ }
    finally { setMatchLoading(false); }
  };

  const inputCls = `px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
  }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Buyer Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Buyer Procurement Dashboard</h1>
          <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Procurement · Supply · Orders · Spending — at a glance.
          </p>
        </div>
        <button
          onClick={() => navigate('/buyer/marketplace')}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Store className="w-4 h-4" /> Go to Marketplace
        </button>
      </div>

      {/* ── KPI Strip ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard label="Active Orders"       value={activeOrders.length}               sub="In pipeline"           icon={ShoppingCart}  iconColor="text-blue-500"    darkMode={darkMode} />
        <KpiCard label="Procurement Spend"   value={`₹${totalSpend.toLocaleString()}`} sub="Total committed"       icon={IndianRupee}   iconColor="text-emerald-500" darkMode={darkMode} />
        <KpiCard label="Active Contracts"    value={activeContracts.length}            sub="Pre-harvest"           icon={FileText}      iconColor="text-purple-500"  darkMode={darkMode} />
        <KpiCard label="In-Transit"          value={inTransit}                         sub="Shipments en-route"    icon={Truck}         iconColor="text-amber-500"   darkMode={darkMode} />
        <KpiCard label="Total Qty Procured"  value={`${totalQtyProcured.toLocaleString()} kg`} sub="All orders"   icon={Package}       iconColor="text-slate-500"   darkMode={darkMode} />
      </div>

      {/* ── Two-col body ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-8">

          {/* Recent Orders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" /> Recent Orders
              </h2>
              <button
                onClick={() => navigate('/buyer/orders-contracts')}
                className={`text-xs font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className={`rounded-2xl border border-dashed p-10 text-center text-xs ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                No orders yet. <button onClick={() => navigate('/buyer/marketplace')} className="text-blue-600 font-semibold underline underline-offset-2">Browse marketplace →</button>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 4).map((o) => {
                  const meta = ORDER_STATUS_META[o.orderStatus] || { label: o.orderStatus, cls: 'bg-slate-100 text-slate-600' };
                  return (
                    <div
                      key={o._id}
                      className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${
                        darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                                 : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm">{o.cropName}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.cls}`}>{meta.label}</span>
                        </div>
                        <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          {o.orderNumber} · {o.quantityKg?.toLocaleString()} kg · Farmer: {o.farmerName || '—'}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-extrabold text-sm text-emerald-600">₹{o.totalPrice?.toLocaleString()}</div>
                        <div className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>₹{o.unitPrice}/kg</div>
                      </div>
                    </div>
                  );
                })}
                {orders.length > 4 && (
                  <button
                    onClick={() => navigate('/buyer/orders-contracts')}
                    className={`w-full py-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      darkMode ? 'border-slate-800 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    View all {orders.length} orders →
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Upcoming Supply (Pre-harvest contracts) */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-500" /> Upcoming Supply
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  Pre-Harvest Contracts
                </span>
              </h2>
              <button
                onClick={() => navigate('/buyer/orders-contracts')}
                className={`text-xs font-semibold flex items-center gap-1 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {bookings.length === 0 ? (
              <div className={`rounded-2xl border border-dashed p-8 text-center text-xs ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                No pre-harvest contracts. Lock supply early from the marketplace.
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.slice(0, 3).map((b) => (
                  <div
                    key={b._id}
                    className={`p-4 rounded-2xl border transition-all ${
                      darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="font-bold text-sm">{b.cropName}</span>
                        <div className={`flex flex-wrap gap-x-3 mt-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          <span>{b.bookedQuantityKg?.toLocaleString()} kg</span>
                          <span>@ ₹{b.agreedPricePerKg}/kg</span>
                          {b.expectedFulfillmentDate && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Due {new Date(b.expectedFulfillmentDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold text-sm">₹{b.totalAmount?.toLocaleString()}</div>
                        <div className="text-emerald-600 text-[11px] font-semibold">
                          20% advance: ₹{b.advancePaymentAmount?.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {b.status === 'confirmed' && (
                      <div className={`mt-2 flex items-center gap-1.5 text-[11px] font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed · Escrow Active
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-6">

          {/* AI Quick Supplier Match */}
          <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
            <h2 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-blue-500" /> AI Supplier Match
            </h2>
            <div className="space-y-2.5 text-xs">
              <div>
                <label className={`block font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Crop</label>
                <input
                  value={matchCrop}
                  onChange={(e) => setMatchCrop(e.target.value)}
                  placeholder="e.g. Tomato"
                  className={inputCls + ' w-full'}
                />
              </div>
              <div>
                <label className={`block font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>Quantity (kg)</label>
                <input
                  type="number"
                  value={matchQty}
                  onChange={(e) => setMatchQty(e.target.value)}
                  className={inputCls + ' w-full'}
                />
              </div>
              <button
                onClick={runQuickMatch}
                disabled={matchLoading}
                className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 transition-all"
              >
                <Search className="w-3.5 h-3.5" />
                {matchLoading ? 'Finding…' : 'Find Suppliers'}
              </button>
            </div>

            {matchResults !== null && (
              <div className="mt-4 space-y-2">
                {matchResults.length === 0 ? (
                  <p className={`text-xs text-center py-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>No matches found.</p>
                ) : matchResults.map((r, i) => (
                  <div
                    key={r._id || i}
                    className={`p-3 rounded-xl border text-xs ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold">{r.cropName}</span>
                        <div className={`mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{r.farmerName} · {r.availableQuantityKg?.toLocaleString()} kg</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600">₹{r.pricePerKg}/kg</div>
                        <div className={`text-[10px] font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Score: {r.matchScore}</div>
                      </div>
                    </div>
                    {r.distanceKm !== undefined && (
                      <div className={`mt-1 text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {r.distanceKm} km away · {r.qualityGrade}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => navigate('/buyer/ai')}
                  className={`w-full text-xs font-semibold py-1.5 flex items-center justify-center gap-1 ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  Full AI Hub <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Quick nav */}
          <div>
            <h2 className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Quick Navigation</h2>
            <div className="space-y-2">
              <NavBtn to="/buyer/marketplace"      icon={Store}     label="Marketplace"        description="Browse & purchase crops"          colorClass="bg-blue-500/10 text-blue-600 border-blue-500/20"     darkMode={darkMode} />
              <NavBtn to="/buyer/orders-contracts" icon={FileText}  label="Orders & Contracts" description="Track orders & pre-harvest deals" colorClass="bg-purple-500/10 text-purple-600 border-purple-500/20" darkMode={darkMode} />
              <NavBtn to="/buyer/ai"               icon={Cpu}       label="AI Decision Hub"    description="Match, forecast & wastage alerts" colorClass="bg-emerald-500/10 text-emerald-600 border-emerald-500/20" darkMode={darkMode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
