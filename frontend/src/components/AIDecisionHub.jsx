import React, { useState } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Search, 
  Truck, 
  SlidersHorizontal, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronRight,
  Flame,
  Clock,
  MapPin,
  BarChart3,
  Cpu,
  Layers
} from 'lucide-react';
import { useTranslation } from '../services/LanguageContext';

export const AIDecisionHub = ({ api, darkMode }) => {
  const { t } = useTranslation();
  const [activeAgent, setActiveAgent] = useState('match'); // 'match' | 'forecast' | 'wastage' | 'route'

  // Agent 1: Buyer Match
  const [matchCriteria, setMatchCriteria] = useState({
    targetCropName: 'Tomato',
    targetQuantity: 500,
    maxPrice: 35,
    preferredQuality: 'Grade A (Export/Premium)'
  });
  const [matchResults, setMatchResults] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);

  // Agent 2: Demand Forecast
  const [forecastCrop, setForecastCrop] = useState('Tomato');
  const [forecastRegion, setForecastRegion] = useState('Kolhapur');
  const [forecastResult, setForecastResult] = useState(null);
  const [forecastLoading, setForecastLoading] = useState(false);

  // Agent 3: Wastage Alerts
  const [wastageAlerts, setWastageAlerts] = useState(null);
  const [wastageLoading, setWastageLoading] = useState(false);

  // Agent 4: Transport Optimizer
  const [routePlan, setRoutePlan] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);

  const runMatch = async (e) => {
    e.preventDefault();
    setMatchLoading(true);
    try {
      const res = await api.matchCrops(matchCriteria);
      if (res.success) setMatchResults(res.recommendations);
    } catch (err) {
      alert(err.message);
    } finally {
      setMatchLoading(false);
    }
  };

  const runForecast = async (e) => {
    e.preventDefault();
    setForecastLoading(true);
    try {
      const res = await api.getDemandForecast(forecastCrop, forecastRegion);
      if (res.success) setForecastResult(res.forecast);
    } catch (err) {
      alert(err.message);
    } finally {
      setForecastLoading(false);
    }
  };

  const runWastageScan = async () => {
    setWastageLoading(true);
    try {
      const res = await api.getWastageAlerts();
      if (res.success) setWastageAlerts(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setWastageLoading(false);
    }
  };

  const runTransportRoute = async () => {
    setRouteLoading(true);
    try {
      const demoWaypoints = [
        { locationName: 'Shirol Farm Cluster A', weightKg: 3200, lat: 16.75, lng: 74.45 },
        { locationName: 'Hatkanangale Vineyard Hub', weightKg: 2000, lat: 16.74, lng: 74.44 },
        { locationName: 'Gokul Shirgaon Aggregation Center', weightKg: 1800, lat: 16.65, lng: 74.28 }
      ];
      const res = await api.optimizeTransport(demoWaypoints, 10000);
      if (res.success) setRoutePlan(res.plan);
    } catch (err) {
      alert(err.message);
    } finally {
      setRouteLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Multi-Agent Engine
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-500">6 Synchronized Heuristics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('aiHubTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {t('aiHubSubtitle')}
          </p>
        </div>

        {/* Tab switchers */}
        <div className={`p-1 rounded-xl border flex flex-wrap gap-1 text-xs font-semibold ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          {[
            { id: 'match', label: t('buyerMatchTab') },
            { id: 'forecast', label: t('demandForecastTab') },
            { id: 'wastage', label: t('wastageMitigationTab') },
            { id: 'route', label: t('logisticsPlannerTab') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveAgent(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeAgent === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* AGENT 1: Buyer Match */}
      {activeAgent === 'match' && (
        <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="mb-6">
            <h2 className="text-lg font-bold">Agent 1: Intelligent Buyer & Crop Matchmaker</h2>
            <p className="text-xs text-slate-500 mt-0.5">Ranks farm suppliers based on proximity, quality specifications, and spot price competitiveness.</p>
          </div>

          <form onSubmit={runMatch} className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1.5">Target Crop</label>
              <input
                type="text"
                value={matchCriteria.targetCropName}
                onChange={e => setMatchCriteria({ ...matchCriteria, targetCropName: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1.5">Desired Quantity (kg)</label>
              <input
                type="number"
                value={matchCriteria.targetQuantity}
                onChange={e => setMatchCriteria({ ...matchCriteria, targetQuantity: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
            <div>
              <label className="font-semibold block mb-1.5">Ceiling Price (₹/kg)</label>
              <input
                type="number"
                value={matchCriteria.maxPrice}
                onChange={e => setMatchCriteria({ ...matchCriteria, maxPrice: Number(e.target.value) })}
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={matchLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors disabled:opacity-50"
              >
                {matchLoading ? 'Executing Algorithm...' : t('runMatchmakerAgentBtn')}
              </button>
            </div>
          </form>

          {matchResults && (
            <div className="space-y-4 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm">Ranked Agricultural Sources ({matchResults.length} Matched):</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matchResults.map((r, i) => (
                  <div key={i} className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                    darkMode ? 'bg-slate-800/40 border-slate-700/80' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm">{t(r.crop?.cropName || r.cropName, r.crop?.cropName || r.cropName)}</h4>
                        <p className="text-slate-500 text-[11px]">{r.crop?.farmerName || r.farmerName} • {r.crop?.location?.village || r.location?.village || 'Kolhapur'}</p>
                      </div>
                      <span className="bg-emerald-600 text-white px-2.5 py-1 rounded-full font-bold text-xs">
                        {r.matchScore}% Match
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Price</span>
                        <strong className="text-xs">₹{r.crop?.pricePerKg || r.pricePerKg}/kg</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Distance</span>
                        <strong className="text-xs">{r.distanceKm} km</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Stock</span>
                        <strong className="text-xs">{r.crop?.availableQuantityKg || r.availableQuantityKg} kg</strong>
                      </div>
                    </div>
                    <p className="text-[11px] text-emerald-600 font-medium">{r.reasons?.join(' • ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* AGENT 2: Demand Forecast */}
      {activeAgent === 'forecast' && (
        <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="mb-6">
            <h2 className="text-lg font-bold">Agent 2: APMC Mandi Demand & Price Forecast</h2>
            <p className="text-xs text-slate-500 mt-0.5">Projects 14-day arrival and modal price trajectories across major Maharashtra agricultural mandis.</p>
          </div>

          <form onSubmit={runForecast} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1.5">Crop Selection</label>
              <select
                value={forecastCrop}
                onChange={e => setForecastCrop(e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="Tomato">Tomato</option>
                <option value="Onion">Onion</option>
                <option value="Grapes">Grapes</option>
                <option value="Soybean">Soybean</option>
                <option value="Sugarcane">Sugarcane</option>
              </select>
            </div>
            <div>
              <label className="font-semibold block mb-1.5">APMC Region</label>
              <select
                value={forecastRegion}
                onChange={e => setForecastRegion(e.target.value)}
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="Kolhapur">Kolhapur APMC</option>
                <option value="Pune">Pune Market Yard</option>
                <option value="Nashik">Nashik Lasalgaon</option>
                <option value="Sangli">Sangli Mandi</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={forecastLoading}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer transition-colors disabled:opacity-50"
              >
                {forecastLoading ? 'Forecasting...' : t('generateForecastBtn')}
              </button>
            </div>
          </form>

          {forecastResult && (
            <div className="space-y-4 pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block mb-1">Market Trend</span>
                  <strong className="text-emerald-600 uppercase text-sm font-extrabold">{forecastResult.demandTrend}</strong>
                </div>
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block mb-1">Target Modal Price</span>
                  <strong className="text-sm font-extrabold">₹{forecastResult.predictedPricePerKgINR}/kg</strong>
                </div>
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block mb-1">Pressure Index</span>
                  <strong className="text-sm font-extrabold">{forecastResult.marketPressureIndex}</strong>
                </div>
                <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block mb-1">Model Confidence</span>
                  <strong className="text-sm font-extrabold">{forecastResult.confidencePercent}%</strong>
                </div>
              </div>

              <div className={`p-4 rounded-xl border leading-relaxed ${
                darkMode ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <strong className="block font-bold mb-1">Strategic Recommendation:</strong>
                {forecastResult.recommendation}
              </div>

              {forecastResult.fourteenDayTrend && (
                <div>
                  <h4 className="font-bold mb-2">14-Day Modal Price Trajectory:</h4>
                  <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 text-center">
                    {forecastResult.fourteenDayTrend.map((d, idx) => (
                      <div key={idx} className={`p-2 rounded-lg border ${
                        darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className="text-[10px] text-slate-400">D+{idx + 1}</div>
                        <div className="font-bold text-xs mt-0.5">₹{d.price}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* AGENT 3: Wastage Mitigation */}
      {activeAgent === 'wastage' && (
        <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold">Agent 3 & 4: Zero-Wastage & Dynamic Pricing Engine</h2>
              <p className="text-xs text-slate-500 mt-0.5">Continuous inventory surveillance flagging produce batches entering critical 48h expiration windows.</p>
            </div>
            <button
              onClick={runWastageScan}
              disabled={wastageLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {wastageLoading ? 'Scanning Inventories...' : t('scanFarmInventoriesBtn')}
            </button>
          </div>

          {wastageAlerts ? (
            <div className="space-y-4 text-xs">
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/30 p-3 rounded-xl border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 font-semibold">
                <Flame className="w-4 h-4 flex-shrink-0 animate-bounce" />
                <span>Found {wastageAlerts.criticalAlertsCount} critical distress produce batches requiring intervention!</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wastageAlerts.urgentProduce?.map((p, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border space-y-3 ${
                    darkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-amber-50/40 border-amber-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-sm">{t(p.cropName, p.cropName)}</h4>
                        <p className="text-slate-500 text-[11px]">Farmer: {p.farmerName} • Available: {p.availableQuantityKg} kg</p>
                      </div>
                      <span className="bg-red-600 text-white px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase">
                        {p.riskTier}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-2.5 rounded-lg border border-red-200 dark:border-red-900">
                      <span className="text-slate-500">Remaining Shelf-Life:</span>
                      <strong className="text-red-500 font-bold">{p.daysRemaining} days remaining</strong>
                    </div>

                    <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1">
                      <span className="font-bold block">AI Recommended Interventions:</span>
                      <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                        {p.recommendedActions?.map((act, i) => (
                          <li key={i}>{act}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Click "{t('scanFarmInventoriesBtn')}" to trigger the multi-agent wastage auditor across inventory.
            </div>
          )}
        </div>
      )}

      {/* AGENT 4: Logistics Planner */}
      {activeAgent === 'route' && (
        <div className={`p-6 sm:p-8 rounded-2xl border transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold">Agent 5: Intelligent Transport Optimization</h2>
              <p className="text-xs text-slate-500 mt-0.5">Heuristic Vehicle Routing Problem (VRP) solver consolidating farm pickups into single journeys.</p>
            </div>
            <button
              onClick={runTransportRoute}
              disabled={routeLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              {routeLoading ? 'Optimizing Routes...' : t('calcConsolidatedRouteBtn')}
            </button>
          </div>

          {routePlan ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block mb-0.5">Payload Weight</span>
                  <strong className="text-sm">{routePlan.totalWeightKg} kg</strong>
                </div>
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block mb-0.5">Capacity Utilization</span>
                  <strong className="text-sm text-emerald-600">{routePlan.capacityUtilizationPercent}%</strong>
                </div>
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block mb-0.5">Estimated Mileage</span>
                  <strong className="text-sm">{routePlan.estimatedTotalKm} km</strong>
                </div>
                <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                  <span className="text-slate-400 block mb-0.5">Consolidated Savings</span>
                  <strong className="text-sm text-emerald-600">₹{routePlan.fuelCostSavingsINR}</strong>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${darkMode ? 'bg-slate-800/30 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
                <h4 className="font-bold mb-2">Consolidated Waypoint Sequence:</h4>
                <div className="space-y-2">
                  {routePlan.waypoints?.map((w, idx) => (
                    <div key={idx} className={`p-3 rounded-lg border flex justify-between items-center ${
                      darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`}>
                      <div>
                        <strong>Stop #{idx + 1}: {w.locationName}</strong>
                        <span className="text-slate-400 ml-2">({w.loadKg} kg cargo)</span>
                      </div>
                      <span className="text-emerald-600 font-mono text-[11px]">{w.lat.toFixed(2)}, {w.lng.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Click "{t('calcConsolidatedRouteBtn')}" to evaluate multi-farm vehicle pickup optimization.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
