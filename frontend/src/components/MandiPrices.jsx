/**
 * MandiPrices — Mandi (wholesale market) price panel for the Buyer Portal.
 *
 * Data source: data.gov.in commodity market price API
 * (proxied through /api/market-prices — API key stays on the server)
 *
 * Features:
 *  • Commodity + district filters
 *  • Price comparison badge vs. farmer offer price (when crop prop is supplied)
 *  • Loading skeleton, empty state, error state with retry
 *  • Does NOT call the API on every render — only on explicit search / mount
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  TrendingUp, TrendingDown, Search, RefreshCw,
  AlertCircle, MapPin, Calendar, BarChart3,
  ChevronDown, Minus, Loader2, Info
} from 'lucide-react';
import { api } from '../services/api';

// ─── Constants ────────────────────────────────────────────────────────────────
const MAHARASHTRA_DISTRICTS = [
  'All Districts',
  'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed',
  'Bhandara', 'Buldhana', 'Chandrapur', 'Dhule', 'Gadchiroli',
  'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 'Kolhapur',
  'Latur', 'Mumbai', 'Nagpur', 'Nanded', 'Nandurbar',
  'Nashik', 'Osmanabad', 'Palghar', 'Parbhani', 'Pune',
  'Raigad', 'Ratnagiri', 'Sangli', 'Satara', 'Sindhudurg',
  'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal',
];

const COMMON_COMMODITIES = [
  'Tomato', 'Onion', 'Potato', 'Brinjal', 'Cabbage',
  'Cauliflower', 'Carrot', 'Okra', 'Green Chilli', 'Garlic',
  'Soybean', 'Sugarcane', 'Grapes', 'Banana', 'Mango',
  'Orange', 'Pomegranate', 'Wheat', 'Jowar', 'Bajra',
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkeletonRow({ darkMode }) {
  const base = darkMode ? 'bg-slate-800' : 'bg-slate-200';
  return (
    <tr className="animate-pulse">
      {[1, 2, 3, 4, 5, 6, 7].map((i) => (
        <td key={i} className="px-3 py-3">
          <div className={`h-3 rounded ${base}`} style={{ width: `${55 + (i * 7) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

/**
 * Compare a crop's farmer price with the mandi modal price.
 * Returns a badge indicating above/below/at market.
 */
function PriceBadge({ farmerPrice, mandiModal }) {
  if (!farmerPrice || !mandiModal) return null;
  const diff = ((farmerPrice - mandiModal) / mandiModal) * 100;
  const absDiff = Math.abs(diff).toFixed(1);

  if (diff > 5) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
        <TrendingUp className="w-3 h-3" /> +{absDiff}% above mandi
      </span>
    );
  }
  if (diff < -5) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
        <TrendingDown className="w-3 h-3" /> {absDiff}% below mandi
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      <Minus className="w-3 h-3" /> At market rate
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

/**
 * Props:
 *   darkMode   {boolean}
 *   farmerCrop {object}  – optional; if supplied shows price comparison
 *                          must have: cropName, pricePerKg
 */
export default function MandiPrices({ darkMode, farmerCrop }) {
  const [commodity,  setCommodity]  = useState(farmerCrop?.cropName || 'Tomato');
  const [district,   setDistrict]   = useState('All Districts');
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [configErr,  setConfigErr]  = useState(false);
  const [total,      setTotal]      = useState(0);
  const [searched,   setSearched]   = useState(false);

  // Prevent multiple in-flight requests
  const abortRef = useRef(null);

  const fetchPrices = useCallback(async () => {
    if (abortRef.current) abortRef.current = false; // cancel previous flag

    setLoading(true);
    setError(null);

    const params = {
      state: 'Maharashtra',
      commodity: commodity.trim(),
      limit: 25,
    };
    if (district && district !== 'All Districts') {
      params.district = district;
    }

    try {
      const res = await api.getMarketPrices(params);
      if (abortRef.current) return; // stale response — discard

      if (!res.success) {
        if (res.configError) {
          setConfigErr(true);
          setError(res.message);
        } else {
          setError(res.message || 'Failed to load market prices.');
        }
        setRows([]);
        return;
      }
      setConfigErr(false);
      setRows(res.data || []);
      setTotal(res.total || 0);
      setSearched(true);
    } catch (err) {
      if (!abortRef.current) {
        setError('Network error — could not reach the backend. Is the server running?');
      }
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [commodity, district]);

  // Auto-fetch on mount with default commodity
  useEffect(() => {
    fetchPrices();
    return () => { abortRef.current = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync commodity when parent passes a farmerCrop
  useEffect(() => {
    if (farmerCrop?.cropName && farmerCrop.cropName !== commodity) {
      setCommodity(farmerCrop.cropName);
    }
  }, [farmerCrop?.cropName]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPrices();
  };

  const card = darkMode
    ? 'bg-slate-900 border-slate-800'
    : 'bg-white border-slate-200 shadow-xs';

  const inputCls = `px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
  }`;

  const thCls = `px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider ${
    darkMode ? 'text-slate-400' : 'text-slate-500'
  }`;

  const tdCls = `px-3 py-3 text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`;

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Live Mandi Prices
            </span>
          </div>
          <h2 className="text-lg font-extrabold tracking-tight">Maharashtra Market Rates</h2>
          <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Official data.gov.in commodity prices · ₹/kg · Compare with farmer offers
          </p>
        </div>

        {/* Farmer price comparison chip */}
        {farmerCrop?.pricePerKg && rows.length > 0 && (() => {
          const match = rows.find(r =>
            r.commodity.toLowerCase().includes((farmerCrop.cropName || '').toLowerCase())
          );
          return match ? (
            <div className={`p-3 rounded-2xl border text-xs ${card}`}>
              <div className={`text-[10px] font-bold uppercase mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Price Comparison
              </div>
              <div className="flex items-center gap-3">
                <div>
                  <div className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Farmer offer</div>
                  <div className="font-extrabold text-emerald-600">₹{farmerCrop.pricePerKg}/kg</div>
                </div>
                <div className={`w-px h-8 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                <div>
                  <div className={darkMode ? 'text-slate-400' : 'text-slate-500'}>Mandi modal</div>
                  <div className="font-extrabold">₹{match.modalPrice}/kg</div>
                </div>
              </div>
              <div className="mt-2">
                <PriceBadge farmerPrice={farmerCrop.pricePerKg} mandiModal={match.modalPrice} />
              </div>
            </div>
          ) : null;
        })()}
      </div>

      {/* ── Search filters ───────────────────────────────────────────── */}
      <form
        onSubmit={handleSearch}
        className={`flex flex-wrap gap-3 p-4 rounded-2xl border ${card}`}
      >
        {/* Commodity */}
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Commodity
          </label>
          <div className="relative">
            <input
              list="commodity-suggestions"
              value={commodity}
              onChange={(e) => setCommodity(e.target.value)}
              placeholder="e.g. Tomato"
              className={inputCls + ' w-full pr-8'}
            />
            <datalist id="commodity-suggestions">
              {COMMON_COMMODITIES.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>

        {/* District */}
        <div className="flex flex-col gap-1 flex-1 min-w-[160px]">
          <label className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            District
          </label>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className={inputCls + ' w-full cursor-pointer'}
          >
            {MAHARASHTRA_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* State (locked to Maharashtra) */}
        <div className="flex flex-col gap-1">
          <label className={`text-[10px] font-bold uppercase ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            State
          </label>
          <div className={`px-3 py-2 text-xs border rounded-xl font-semibold ${
            darkMode ? 'bg-slate-800/40 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}>
            Maharashtra
          </div>
        </div>

        {/* Search button */}
        <div className="flex flex-col justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 transition-all"
          >
            {loading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Search className="w-3.5 h-3.5" />}
            {loading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </form>

      {/* ── Config error ─────────────────────────────────────────────── */}
      {configErr && (
        <div className={`p-5 rounded-2xl border flex items-start gap-3 ${
          darkMode ? 'bg-amber-950/20 border-amber-800/40' : 'bg-amber-50 border-amber-200'
        }`}>
          <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-bold text-amber-700 dark:text-amber-300 mb-1">API Key Not Configured</div>
            <p className={darkMode ? 'text-amber-400' : 'text-amber-700'}>
              To enable live mandi prices, add your data.gov.in API key to{' '}
              <code className="font-mono bg-amber-100 dark:bg-amber-900/40 px-1 rounded">backend/.env</code>:
            </p>
            <pre className={`mt-2 p-2 rounded-lg text-[11px] font-mono ${
              darkMode ? 'bg-slate-800 text-slate-300' : 'bg-white text-slate-700 border border-amber-200'
            }`}>
              DATA_GOV_API_KEY=your_key_here
            </pre>
            <p className={`mt-1.5 ${darkMode ? 'text-amber-500' : 'text-amber-600'}`}>
              Register free at{' '}
              <a
                href="https://data.gov.in/user/register"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                data.gov.in
              </a>{' '}
              → API Keys section.
            </p>
          </div>
        </div>
      )}

      {/* ── Network/API error ────────────────────────────────────────── */}
      {error && !configErr && (
        <div className={`p-5 rounded-2xl border flex items-start justify-between gap-3 ${
          darkMode ? 'bg-rose-950/20 border-rose-800/40' : 'bg-rose-50 border-rose-200'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold text-rose-700 dark:text-rose-300 mb-0.5">Failed to load prices</div>
              <p className={darkMode ? 'text-rose-400' : 'text-rose-600'}>{error}</p>
            </div>
          </div>
          <button
            onClick={fetchPrices}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border cursor-pointer transition-all flex-shrink-0 border-rose-300 text-rose-700 dark:border-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/30"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* ── Loading skeleton ─────────────────────────────────────────── */}
      {loading && (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          <table className="w-full text-xs">
            <thead className={`border-b ${darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50'}`}>
              <tr>
                {['Commodity', 'Variety', 'Market', 'District', 'Date', 'Min ₹/kg', 'Max ₹/kg', 'Modal ₹/kg'].map((h) => (
                  <th key={h} className={thCls}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} darkMode={darkMode} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {!loading && !error && searched && rows.length === 0 && (
        <div className={`p-14 rounded-2xl border border-dashed text-center ${
          darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'
        }`}>
          <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-semibold">No price records found</p>
          <p className="text-xs mt-1">
            Try a different commodity or district. Market data is updated daily.
          </p>
          <button
            onClick={fetchPrices}
            className="mt-4 flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white cursor-pointer mx-auto transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Again
          </button>
        </div>
      )}

      {/* ── Results table ────────────────────────────────────────────── */}
      {!loading && rows.length > 0 && (
        <div className={`rounded-2xl border overflow-hidden ${card}`}>
          {/* Table header bar */}
          <div className={`flex items-center justify-between px-4 py-3 border-b text-xs ${
            darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-100 bg-slate-50'
          }`}>
            <span className={`font-semibold ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {rows.length} record{rows.length !== 1 ? 's' : ''}
              {total > rows.length ? ` (of ${total})` : ''} · Maharashtra · {commodity}
            </span>
            <button
              onClick={fetchPrices}
              className={`flex items-center gap-1 text-[10px] font-bold cursor-pointer transition-colors ${
                darkMode ? 'text-slate-500 hover:text-white' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
          </div>

          {/* Scrollable table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-xs">
              <thead className={`border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <tr>
                  {['Commodity', 'Variety', 'Market', 'District', 'Arrival Date', 'Min ₹/kg', 'Max ₹/kg', 'Modal ₹/kg'].map((h) => (
                    <th key={h} className={thCls}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${darkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
                {rows.map((row, idx) => {
                  const farmerPricePerKg = farmerCrop?.pricePerKg;
                  const showCompare = farmerPricePerKg && row.modalPrice;

                  return (
                    <tr
                      key={idx}
                      className={`transition-colors ${
                        darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className={tdCls}>
                        <span className="font-semibold">{row.commodity}</span>
                      </td>
                      <td className={`${tdCls} ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {row.variety || '—'}
                      </td>
                      <td className={tdCls}>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0 text-slate-400" />
                          {row.market || '—'}
                        </span>
                      </td>
                      <td className={`${tdCls} ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {row.district || '—'}
                      </td>
                      <td className={`${tdCls} ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 flex-shrink-0 text-slate-400" />
                          {row.arrivalDate || '—'}
                        </span>
                      </td>
                      <td className={tdCls}>
                        {row.minPrice != null ? (
                          <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                            ₹{row.minPrice}
                          </span>
                        ) : '—'}
                      </td>
                      <td className={tdCls}>
                        {row.maxPrice != null ? (
                          <span className={darkMode ? 'text-slate-300' : 'text-slate-600'}>
                            ₹{row.maxPrice}
                          </span>
                        ) : '—'}
                      </td>
                      <td className={tdCls}>
                        {row.modalPrice != null ? (
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-blue-600 dark:text-blue-400">
                              ₹{row.modalPrice}
                            </span>
                            {showCompare && (
                              <PriceBadge
                                farmerPrice={farmerPricePerKg}
                                mandiModal={row.modalPrice}
                              />
                            )}
                          </div>
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Price unit note */}
          <div className={`px-4 py-2.5 border-t text-[10px] flex items-center gap-1.5 ${
            darkMode ? 'border-slate-800 text-slate-600' : 'border-slate-100 text-slate-400'
          }`}>
            <Info className="w-3 h-3 flex-shrink-0" />
            Prices in ₹/kg (converted from ₹/quintal). Source: data.gov.in Ministry of Agriculture.
            Modal price = most common transaction price at the mandi.
          </div>
        </div>
      )}
    </div>
  );
}
