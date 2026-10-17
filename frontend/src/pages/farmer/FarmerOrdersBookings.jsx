/**
 * /farmer/orders-bookings
 * Combined view: farmer's orders + pre-harvest bookings.
 * Uses real schema fields: order.orderStatus, booking.status (pending_farmer_approval/confirmed…)
 */
import React, { useState } from 'react';
import {
  FileText, Package, ShieldCheck, Clock, CheckCircle2,
  AlertCircle, ArrowRight, Layers
} from 'lucide-react';
import { useAppStore } from '../../services/useAppStore';
import { api } from '../../services/api';

const ORDER_STATUS_META = {
  placed:               { label: 'Placed',               cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' },
  harvest_ready:        { label: 'Harvest Ready',         cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  transporter_assigned: { label: 'Transporter Assigned',  cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' },
  in_transit:           { label: 'In Transit',            cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  delivered:            { label: 'Delivered',             cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  completed:            { label: 'Completed',             cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  cancelled:            { label: 'Cancelled',             cls: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
};

const BOOKING_STATUS_META = {
  pending_farmer_approval: { label: 'Pending Approval', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  confirmed:               { label: 'Confirmed',         cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  cancelled:               { label: 'Cancelled',         cls: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
  converted_to_order:      { label: 'Converted',         cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
};

function InfoRow({ label, value, accent }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${accent || ''}`}>{value}</span>
    </div>
  );
}

export default function FarmerOrdersBookings() {
  const darkMode    = useAppStore((s) => s.darkMode);
  const orders      = useAppStore((s) => s.orders);
  const bookings    = useAppStore((s) => s.bookings);
  const refreshData = useAppStore((s) => s.refreshData);

  const [tab,        setTab]        = useState('orders');   // 'orders' | 'bookings'
  const [confirming, setConfirming] = useState(null);

  const handleConfirmBooking = async (bookingId) => {
    setConfirming(bookingId);
    try {
      const token = localStorage.getItem('agriflow_token');
      const res   = await api.confirmBooking(bookingId, token);
      if (res.success) {
        refreshData();
      } else {
        alert(res.message || 'Failed to confirm booking.');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setConfirming(null);
    }
  };

  const cardCls = `rounded-2xl border p-5 transition-all ${
    darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
             : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
  }`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Farmer Workspace</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Orders & Bookings</h1>
          <p className={`text-sm mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Track your sell-side orders and pre-harvest contracts with buyers.
          </p>
        </div>

        {/* Tab switcher */}
        <div className={`flex p-1 rounded-xl border text-xs font-semibold ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
          <button
            onClick={() => setTab('orders')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'orders'
                ? 'bg-emerald-600 text-white shadow-xs'
                : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setTab('bookings')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              tab === 'bookings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Pre-Harvest Contracts ({bookings.length})
          </button>
        </div>
      </div>

      {/* ══ ORDERS TAB ══════════════════════════════════════════════ */}
      {tab === 'orders' && (
        <>
          {orders.length === 0 ? (
            <div className={`rounded-2xl border border-dashed p-14 text-center ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
              <Package className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No orders yet.</p>
              <p className="text-xs mt-1">Orders placed by buyers against your crops will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {orders.map((o) => {
                const statusMeta = ORDER_STATUS_META[o.orderStatus] || { label: o.orderStatus, cls: 'bg-slate-100 text-slate-600' };
                return (
                  <div key={o._id} className={cardCls}>
                    {/* Top */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`font-mono text-[10px] font-bold ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>{o.orderNumber}</span>
                        <h3 className="font-bold text-base mt-0.5">{o.cropName}</h3>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Buyer: {o.buyerName || '—'}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${statusMeta.cls}`}>
                        {statusMeta.label}
                      </span>
                    </div>

                    {/* Metrics */}
                    <div className={`p-3 rounded-xl border space-y-1.5 ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-100'}`}>
                      <InfoRow label="Quantity"       value={`${o.quantityKg?.toLocaleString()} kg`} />
                      <InfoRow label="Unit Price"     value={`₹${o.unitPrice}/kg`} />
                      <InfoRow label="Total Value"    value={`₹${o.totalPrice?.toLocaleString()}`} accent="text-emerald-600 font-bold" />
                      <InfoRow label="Payment"        value={o.paymentStatus?.replace(/_/g, ' ') || '—'} />
                      {o.deliveryLocation?.address && (
                        <InfoRow label="Deliver To"   value={o.deliveryLocation.address} />
                      )}
                    </div>

                    {/* Blockchain */}
                    {o.blockchainTracking?.latestTxHash && (
                      <div className={`mt-3 pt-3 border-t flex items-center gap-1.5 text-[10px] ${
                        darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="font-mono truncate">{o.blockchainTracking.latestTxHash}</span>
                      </div>
                    )}

                    {/* Invoice */}
                    {o.digitalInvoice?.invoiceNumber && (
                      <div className={`mt-2 text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        Invoice: {o.digitalInvoice.invoiceNumber}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ══ BOOKINGS TAB ════════════════════════════════════════════ */}
      {tab === 'bookings' && (
        <>
          {bookings.length === 0 ? (
            <div className={`rounded-2xl border border-dashed p-14 text-center ${darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
              <Layers className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">No pre-harvest contracts yet.</p>
              <p className="text-xs mt-1">When buyers reserve your upcoming crop, contracts appear here for confirmation.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookings.map((b) => {
                const meta = BOOKING_STATUS_META[b.status] || { label: b.status, cls: 'bg-slate-100 text-slate-600' };
                return (
                  <div key={b._id} className={cardCls}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-base">{b.cropName}</h3>
                        <p className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Buyer: {b.buyerName}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>

                    <div className={`p-3 rounded-xl border space-y-1.5 ${darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-100'}`}>
                      <InfoRow label="Reserved Volume"   value={`${b.bookedQuantityKg?.toLocaleString()} kg`} />
                      <InfoRow label="Agreed Price"      value={`₹${b.agreedPricePerKg}/kg`} />
                      <InfoRow label="Total Value"       value={`₹${b.totalAmount?.toLocaleString()}`} accent="font-bold" />
                      <InfoRow label="20% Advance"       value={`₹${b.advancePaymentAmount?.toLocaleString()}`} accent="text-emerald-600 font-bold" />
                      {b.expectedFulfillmentDate && (
                        <InfoRow label="Fulfillment Date" value={new Date(b.expectedFulfillmentDate).toLocaleDateString()} />
                      )}
                    </div>

                    {/* Blockchain hash */}
                    {b.blockchainHash && (
                      <div className={`mt-3 pt-3 border-t flex items-center gap-1.5 text-[10px] font-mono ${
                        darkMode ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                        <span className="truncate">{b.blockchainHash}</span>
                      </div>
                    )}

                    {/* Confirm action */}
                    {b.status === 'pending_farmer_approval' && (
                      <button
                        onClick={() => handleConfirmBooking(b._id)}
                        disabled={confirming === b._id}
                        className="mt-3 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 transition-all"
                      >
                        {confirming === b._id ? 'Confirming…' : 'Confirm Agreement & Lock Contract'}
                      </button>
                    )}
                    {b.status === 'confirmed' && (
                      <div className={`mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-xl ${
                        darkMode ? 'bg-emerald-950/30 text-emerald-400' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        <CheckCircle2 className="w-4 h-4" /> Contract Confirmed · Escrow Active
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
