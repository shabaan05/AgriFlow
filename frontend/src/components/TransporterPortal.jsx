import React, { useState } from 'react';
import { 
  Truck, 
  MapPin, 
  Navigation, 
  Thermometer, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  TrendingDown,
  Layers
} from 'lucide-react';
import { useTranslation } from '../services/LanguageContext';

export const TransporterPortal = ({ orders, user, onOrderUpdated, api, darkMode }) => {
  const { t } = useTranslation();
  const [updatingId, setUpdatingId] = useState(null);
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const token = localStorage.getItem('agriflow_token');
      const res = await api.updateOrderStatus(orderId, { orderStatus: newStatus }, token);
      if (res.success) {
        if (onOrderUpdated) onOrderUpdated();
      } else {
        alert(res.message || 'Failed to update order status');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const runRouteOptimization = async () => {
    setOptimizing(true);
    try {
      const pickups = (orders || []).slice(0, 4).map(o => ({
        locationName: o.pickupLocation?.address || `${o.cropName} Farm Hub`,
        weightKg: o.quantityKg,
        lat: 16.74,
        lng: 74.44
      }));

      const res = await api.optimizeTransport(pickups, 10000);
      if (res.success) {
        setOptimizationResult(res.plan);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full">
              Cold Fleet Telemetry
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-500">Reefer Truck MH-09-CV-9988 (10T)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('logisticsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {t('logisticsSubtitle')}
          </p>
        </div>

        <button
          onClick={runRouteOptimization}
          disabled={optimizing}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {optimizing ? 'Calculating Routes...' : t('runRouteOptimizationBtn')}
        </button>
      </div>

      {/* AI Route Plan Output Card */}
      {optimizationResult && (
        <div className={`p-6 sm:p-8 rounded-2xl border transition-all animate-in fade-in duration-200 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
            <div>
              <h3 className="font-bold text-sm sm:text-base">AI Route & Multi-Stop Consolidation</h3>
              <p className="text-xs text-slate-500 mt-0.5">Capacitated Vehicle Routing Problem (VRP) optimization plan.</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Capacity: {optimizationResult.capacityUtilizationPercent}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-6">
            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-slate-400 block mb-0.5">Total Payload</span>
              <strong className="text-sm">{optimizationResult.totalWeightKg} kg</strong>
            </div>
            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-slate-400 block mb-0.5">Estimated Mileage</span>
              <strong className="text-sm">{optimizationResult.estimatedTotalKm} km</strong>
            </div>
            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-slate-400 block mb-0.5">Consolidated Savings</span>
              <strong className="text-sm text-emerald-600">₹{optimizationResult.fuelCostSavingsINR}</strong>
            </div>
            <div className={`p-3.5 rounded-xl border ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200'}`}>
              <span className="text-slate-400 block mb-0.5">Carbon Offset</span>
              <strong className="text-sm text-emerald-600">{optimizationResult.carbonOffsetKg} kg CO₂</strong>
            </div>
          </div>

          <div className="text-xs font-semibold text-slate-500 mb-2">Optimal Waypoint Sequence:</div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {optimizationResult.waypoints?.map((w, idx) => (
              <React.Fragment key={idx}>
                <div className={`px-3 py-1.5 rounded-lg border font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}>
                  {idx + 1}. {w.locationName} ({w.loadKg} kg)
                </div>
                {idx < optimizationResult.waypoints.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Dispatches List */}
      <div className="space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Truck className="w-4 h-4 text-teal-600" />
          {t('shipmentDispatches')} ({orders?.length || 0})
        </h2>

        {orders?.length === 0 ? (
          <div className={`p-16 text-center rounded-2xl border border-dashed text-xs text-slate-400 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            No active shipment requests. New orders will appear here automatically for fleet assignment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((o) => (
              <div
                key={o._id}
                className={`p-5 rounded-2xl border space-y-3 transition-all ${
                  darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-500">{o.orderNumber}</span>
                    <h4 className="font-bold text-base mt-1">{t(o.cropName, o.cropName)}</h4>
                    <p className="text-xs text-slate-500">{o.quantityKg} kg • Farmer: {o.farmerName}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    o.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                    o.orderStatus === 'in_transit' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300' :
                    'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  }`}>
                    {o.orderStatus?.replace('_', ' ')}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                  darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center gap-2 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Pickup: {o.pickupLocation?.address || 'Farmer Hub, Kolhapur'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500">
                    <Navigation className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Destination: {o.deliveryLocation?.address || 'Reliance Hub, Pune'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-600 font-semibold pt-0.5">
                    <Thermometer className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Cold Chain: {o.tracking?.telemetrySensorStatus || '4°C Controlled (Fresh)'}</span>
                  </div>
                </div>

                {/* State transition triggers */}
                <div className="pt-2 flex gap-2">
                  {o.orderStatus === 'placed' && (
                    <button
                      onClick={() => handleUpdateStatus(o._id, 'transporter_assigned')}
                      disabled={updatingId === o._id}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t('acceptAndAssignFleet')}
                    </button>
                  )}
                  {o.orderStatus === 'transporter_assigned' && (
                    <button
                      onClick={() => handleUpdateStatus(o._id, 'in_transit')}
                      disabled={updatingId === o._id}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t('startTransit')}
                    </button>
                  )}
                  {o.orderStatus === 'in_transit' && (
                    <button
                      onClick={() => handleUpdateStatus(o._id, 'delivered')}
                      disabled={updatingId === o._id}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      {t('confirmDelivery')}
                    </button>
                  )}
                  {o.orderStatus === 'delivered' && (
                    <div className="flex-1 py-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {t('verifiedDelivered')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
