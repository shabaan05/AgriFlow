/**
 * /farmer/crops — My Crops Inventory
 * Full table/card layout using real Crop schema fields from Zustand store.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Plus, Clock, Flame, Sparkles, AlertTriangle,
  Search, SlidersHorizontal, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAppStore } from '../../services/useAppStore';

function riskBadge(score) {
  if (score >= 65) return { label: 'Critical', bar: 'bg-rose-500',  text: 'text-rose-600',  bg: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' };
  if (score >= 35) return { label: 'Moderate', bar: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' };
  return              { label: 'Low Risk',  bar: 'bg-emerald-500', text: 'text-emerald-600',bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' };
}

const STATUS_LABELS = {
  pre_harvest: { label: 'Pre-Harvest', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  harvested:   { label: 'Harvested',   cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  sold:        { label: 'Sold',        cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
  expired:     { label: 'Expired',     cls: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
};

export default function FarmerCrops() {
  const navigate    = useNavigate();
  const darkMode    = useAppStore((s) => s.darkMode);
  const crops       = useAppStore((s) => s.crops);
  const refreshData = useAppStore((s) => s.refreshData);

  // Refresh from backend every time this page is mounted so we always show live data,
  // whether the user navigated here from AddCrop, the sidebar, or a direct URL.
  useEffect(() => {
    refreshData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('all');
  const [statFilter, setStatFilter] = useState('all');
  const [expanded,   setExpanded]   = useState(null); // _id of expanded row

  const filtered = crops.filter((c) => {
    const matchSearch = !search ||
      c.cropName.toLowerCase().includes(search.toLowerCase()) ||
      (c.variety || '').toLowerCase().includes(search.toLowerCase());
    const matchCat  = catFilter  === 'all' || c.category === catFilter;
    const matchStat = statFilter === 'all' || c.status   === statFilter;
    return matchSearch && matchCat && matchStat;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Farmer Workspace</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">My Crops & Inventory</h1>
          <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            {crops.length} listing{crops.length !== 1 ? 's' : ''} · AI shelf-life monitoring active
          </p>
        </div>
        <button
          onClick={() => navigate('/farmer/add-crop')}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Crop
        </button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────── */}
      <div className={`flex flex-wrap gap-3 p-4 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search crop or variety…"
            className={`w-full pl-8 pr-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
            }`}
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className={`px-3 py-2 text-xs border rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <option value="all">All Categories</option>
          <option value="vegetable">Vegetables</option>
          <option value="fruit">Fruits</option>
          <option value="grain">Grains & Pulses</option>
          <option value="cash_crop">Cash Crops</option>
        </select>
        <select
          value={statFilter}
          onChange={(e) => setStatFilter(e.target.value)}
          className={`px-3 py-2 text-xs border rounded-xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <option value="all">All Statuses</option>
          <option value="pre_harvest">Pre-Harvest</option>
          <option value="harvested">Harvested</option>
          <option value="sold">Sold</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className={`rounded-2xl border border-dashed p-14 text-center ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
          <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold">No crops match your filters.</p>
          <button onClick={() => navigate('/farmer/add-crop')} className="mt-3 text-xs text-emerald-600 font-bold underline underline-offset-2 cursor-pointer">
            + Add your first crop
          </button>
        </div>
      )}

      {/* ── Crop cards ──────────────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((crop) => {
            const risk       = crop.aiRiskScore ?? 0;
            const badge      = riskBadge(risk);
            const statusInfo = STATUS_LABELS[crop.status] || { label: crop.status, cls: 'bg-slate-100 text-slate-600' };
            const daysLeft   = crop.aiShelfLife?.daysRemaining ?? crop.estimatedShelfLifeDays ?? '—';
            const isPreHarvest = crop.status === 'pre_harvest';
            const isExpanded = expanded === crop._id;

            return (
              <div
                key={crop._id}
                className={`rounded-2xl border transition-all ${
                  darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                {/* ── Main row ─────────────────────────────────────── */}
                <div className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                    {/* Name + badges */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-sm">{crop.cropName}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusInfo.cls}`}>
                          {statusInfo.label}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badge.bg}`}>
                          {badge.label}
                        </span>
                        {crop.isUrgentSale && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-1">
                            <Flame className="w-3 h-3" /> -{crop.discountPercentage}%
                          </span>
                        )}
                      </div>
                      <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {crop.variety} · {crop.qualityGrade} · {crop.location?.district || 'Kolhapur'}
                      </p>
                    </div>

                    {/* Key metrics row */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 text-xs">
                      <div className="text-center min-w-[72px]">
                        <div className={`text-[10px] mb-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Total</div>
                        <div className="font-bold">{crop.totalQuantityKg?.toLocaleString()} kg</div>
                      </div>
                      <div className="text-center min-w-[72px]">
                        <div className={`text-[10px] mb-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Available</div>
                        <div className="font-bold text-emerald-600">{crop.availableQuantityKg?.toLocaleString()} kg</div>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <div className={`text-[10px] mb-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Price</div>
                        <div className="font-bold">₹{crop.pricePerKg}/kg</div>
                      </div>
                      <div className="text-center min-w-[60px]">
                        <div className={`text-[10px] mb-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                          {isPreHarvest ? 'Harvest' : 'Shelf Life'}
                        </div>
                        <div className={`font-bold flex items-center gap-1 justify-center ${daysLeft <= 2 && !isPreHarvest ? 'text-rose-500' : ''}`}>
                          <Clock className="w-3 h-3" />
                          {isPreHarvest
                            ? new Date(crop.expectedHarvestDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
                            : `${daysLeft}d`}
                        </div>
                      </div>

                      {/* Risk bar */}
                      {!isPreHarvest && (
                        <div className="min-w-[80px]">
                          <div className={`text-[10px] mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>AI Risk</div>
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div className={`h-1.5 rounded-full ${badge.bar}`} style={{ width: `${Math.min(100, risk)}%` }} />
                            </div>
                            <span className={`text-[10px] font-bold ${badge.text}`}>{risk}%</span>
                          </div>
                        </div>
                      )}

                      {/* Expand toggle */}
                      <button
                        onClick={() => setExpanded(isExpanded ? null : crop._id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                        aria-label="Toggle details"
                      >
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4 text-slate-400" />
                          : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── Expanded detail panel ────────────────────────── */}
                {isExpanded && (
                  <div className={`px-4 sm:px-5 pb-5 pt-0 border-t grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs ${
                    darkMode ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    {[
                      { label: 'Category',      value: crop.category?.replace('_', ' ') },
                      { label: 'Storage',       value: crop.storageCondition?.replace('_', ' ') },
                      { label: 'Shelf Life',    value: `${crop.estimatedShelfLifeDays} days (estimated)` },
                      { label: 'Demand Score',  value: `${crop.demandIndexScore ?? '—'}/100` },
                      ...(crop.actualHarvestDate
                        ? [{ label: 'Actual Harvest', value: new Date(crop.actualHarvestDate).toLocaleDateString() }]
                        : [{ label: 'Exp. Harvest',   value: new Date(crop.expectedHarvestDate).toLocaleDateString() }]),
                      { label: 'Location',      value: `${crop.location?.village || ''} ${crop.location?.district || ''}`.trim() || 'Kolhapur' },
                    ].map(({ label, value }) => (
                      <div key={label} className={`p-3 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`text-[10px] mb-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{label}</div>
                        <div className="font-semibold capitalize">{value}</div>
                      </div>
                    ))}

                    {/* AI advice */}
                    {crop.aiWastageMitigation?.actionRequired && (
                      <div className={`col-span-2 sm:col-span-4 flex items-start gap-2 p-3 rounded-xl border ${
                        darkMode ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-700'
                      }`}>
                        <Sparkles className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold">AI Recommendation: </span>
                          {crop.aiWastageMitigation.message}
                          {crop.aiWastageMitigation.recommendedActions?.length > 0 && (
                            <ul className="mt-1 space-y-0.5 list-disc list-inside opacity-80">
                              {crop.aiWastageMitigation.recommendedActions.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                          )}
                        </div>
                      </div>
                    )}
                    {crop.description && (
                      <div className={`col-span-2 sm:col-span-4 p-3 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`text-[10px] mb-0.5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Notes</div>
                        <div className={darkMode ? 'text-slate-300' : 'text-slate-600'}>{crop.description}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
