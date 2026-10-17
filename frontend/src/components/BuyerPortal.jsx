import React, { useState } from 'react';
import { 
  FileCheck2, 
  Package, 
  Clock, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Calendar,
  AlertCircle,
  ExternalLink,
  BarChart3
} from 'lucide-react';
import { useTranslation } from '../services/LanguageContext';
import MandiPrices from './MandiPrices';

export const BuyerPortal = ({ orders, bookings, user, darkMode }) => {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState('orders'); // 'orders' | 'bookings' | 'mandi'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
              Enterprise Procurement
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-500">{user?.name || 'Reliance Fresh Procurement'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('buyerTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {t('buyerSubtitle')}
          </p>
        </div>

        {/* Tab switch */}
        <div className={`p-1 rounded-xl border flex text-xs font-semibold ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('directOrdersTab')} ({orders?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab('bookings')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              activeSubTab === 'bookings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t('preHarvestTab')} ({bookings?.length || 0})
          </button>
          <button
            onClick={() => setActiveSubTab('mandi')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'mandi'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Mandi Prices
          </button>
        </div>
      </div>

      {/* Orders Tab */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {orders?.length === 0 ? (
            <div className={`p-16 text-center rounded-2xl border border-dashed text-xs text-slate-400 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <Package className="w-10 h-10 mx-auto mb-2 text-slate-400" />
              <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">{t('noOrdersYet')}</h3>
              <p className="mt-1">Visit the Marketplace to buy fresh crops directly from verified farms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((o) => (
                <div
                  key={o._id}
                  className={`p-5 rounded-2xl border transition-all ${
                    darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">{o.orderNumber}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          o.orderStatus === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' :
                          o.orderStatus === 'in_transit' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                        }`}>
                          {o.orderStatus?.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="font-bold text-base mt-1.5">{t(o.cropName, o.cropName)}</h4>
                      <p className="text-xs text-slate-500">Farmer: {o.farmerName}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-black text-slate-900 dark:text-white">₹{o.totalPrice?.toLocaleString()}</div>
                      <div className="text-xs text-slate-400">{o.quantityKg} kg @ ₹{o.unitPrice}/kg</div>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl border text-xs space-y-1.5 ${
                    darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{o.deliveryLocation?.address || 'Kolhapur Central Depot'}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 flex-shrink-0" />
                        {o.transporterName || 'Pending Reefer Assignment'}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-600">
                        {o.tracking?.telemetrySensorStatus || 'Optimal Cold Chain'}
                      </span>
                    </div>
                  </div>

                  {o.blockchainHash && (
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Ledger Hash:
                      </span>
                      <span className="font-mono truncate max-w-[220px]">{o.blockchainHash}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeSubTab === 'bookings' && (
        <div className="space-y-4">
          {bookings?.length === 0 ? (
            <div className={`p-16 text-center rounded-2xl border border-dashed text-xs text-slate-400 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-400" />
              <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">{t('noBookingsYet')}</h3>
              <p className="mt-1">Lock standing crops in advance to secure bulk volumes before harvest.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className={`p-5 rounded-2xl border transition-all ${
                    darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-base">{t(b.cropName, b.cropName)}</h4>
                      <p className="text-xs text-slate-500">Contract ID: {b._id}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 font-bold text-[10px] uppercase px-2 py-0.5 rounded">
                      {b.status}
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border text-xs space-y-1 my-3 ${
                    darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-blue-50/40 border-blue-100'
                  }`}>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reserved Volume:</span>
                      <strong>{b.bookedQuantityKg} kg</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fixed Unit Price:</span>
                      <strong>₹{b.agreedPricePerKg}/kg</strong>
                    </div>
                    <div className="flex justify-between text-blue-600 font-bold pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span>Total Agreed Value:</span>
                      <span>₹{b.totalAmount?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-semibold text-[11px]">
                      <span>20% Escrow Advance:</span>
                      <span>₹{b.advancePaymentAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target Fulfillment: {new Date(b.expectedFulfillmentDate).toLocaleDateString()}</span>
                  </div>

                  {b.blockchainHash && (
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-mono text-slate-400 truncate">
                      Contract Hash: {b.blockchainHash}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Mandi Market Prices Tab ──────────────────────────────────── */}
      {activeSubTab === 'mandi' && (
        <MandiPrices darkMode={darkMode} />
      )}
    </div>
  );
};
