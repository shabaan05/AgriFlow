import React, { useState } from 'react';
import { 
  Sprout, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Calendar,
  Layers,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Flame,
  Wheat,
  X
} from 'lucide-react';
import { useTranslation } from '../services/LanguageContext';

export const FarmerPortal = ({ crops, bookings, user, onCropAdded, onBookingConfirmed, api, darkMode }) => {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // New crop form state
  const [formData, setFormData] = useState({
    cropName: 'Tomato (Hybrid Red)',
    variety: 'Abhinav Hybrid F1',
    category: 'vegetable',
    status: 'harvested',
    totalQuantityKg: 2000,
    pricePerKg: 30,
    qualityGrade: 'Grade A (Export/Premium)',
    expectedHarvestDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    estimatedShelfLifeDays: 8,
    storageCondition: 'ambient',
    description: 'Pesticide controlled export grade firm hybrid red tomatoes with 8 days post-harvest shelf life.'
  });

  const myCrops = user
    ? crops.filter(c => c.farmerId === user._id || c.farmerId === user.id || c.farmerName === user.name)
    : crops;
  const myBookings = bookings || [];

  const handleCreateCrop = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('agriflow_token');
      const res = await api.createCrop(formData, token);
      if (res.success) {
        setFeedback({
          type: 'success',
          text: `Listing published! SHA-256 block hash: ${res.blockchainHash?.substring(0, 16)}...`
        });
        if (onCropAdded) onCropAdded();
        setTimeout(() => {
          setShowAddForm(false);
          setFeedback(null);
        }, 1800);
      } else {
        setFeedback({ type: 'error', text: res.message || 'Failed to list crop' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('agriflow_token');
      const res = await api.confirmBooking(bookingId, token);
      if (res.success) {
        alert('Contract confirmed and 20% advance locked into escrow.');
        if (onBookingConfirmed) onBookingConfirmed();
      } else {
        alert(res.message || 'Failed to confirm booking.');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Producer Console
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-500">{user?.location?.address || 'Kolhapur, Maharashtra'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('farmerWelcome')} {user?.name || 'Ramesh Patil'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {t('farmerSubtitle')}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showAddForm ? t('closeFormBtn') : t('listNewCropBtn')}
        </button>
      </div>

      {/* Slide-out / Modal Form */}
      {showAddForm && (
        <div className={`p-6 sm:p-8 rounded-2xl border transition-all animate-in fade-in duration-200 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-bold">{t('listNewCropBtn')}</h2>
              <p className="text-xs text-slate-500 mt-0.5">Automated genesis certification minted directly on ledger.</p>
            </div>
            <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {feedback && (
            <div className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
              feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
              <span>{feedback.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateCrop} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold block mb-1.5">{t('cropNameLabel')}</label>
              <input
                type="text"
                value={formData.cropName}
                onChange={e => setFormData({ ...formData, cropName: e.target.value })}
                required
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="font-semibold block mb-1.5">{t('varietyLabel')}</label>
              <input
                type="text"
                value={formData.variety}
                onChange={e => setFormData({ ...formData, variety: e.target.value })}
                required
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="font-semibold block mb-1.5">{t('categoryLabel')}</label>
              <select
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="vegetable">{t('vegetables')}</option>
                <option value="fruit">{t('fruits')}</option>
                <option value="grain">{t('grains')}</option>
                <option value="cash_crop">{t('cashCrops')}</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1.5">{t('statusLabel')}</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="harvested">{t('harvestedStatus')}</option>
                <option value="pre_harvest">{t('preHarvestStatus')}</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1.5">{t('totalQtyKgLabel')}</label>
              <input
                type="number"
                min="10"
                value={formData.totalQuantityKg}
                onChange={e => setFormData({ ...formData, totalQuantityKg: Number(e.target.value) })}
                required
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="font-semibold block mb-1.5">{t('basePriceLabel')}</label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={formData.pricePerKg}
                onChange={e => setFormData({ ...formData, pricePerKg: Number(e.target.value) })}
                required
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="font-semibold block mb-1.5">{t('qualityGradeLabel')}</label>
              <select
                value={formData.qualityGrade}
                onChange={e => setFormData({ ...formData, qualityGrade: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="Grade A (Export/Premium)">Grade A (Export/Premium)</option>
                <option value="Grade B (Standard Market)">Grade B (Standard Market)</option>
                <option value="Grade C (Processing)">Grade C (Processing)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1.5">{t('estShelfLifeLabel')}</label>
              <input
                type="number"
                min="1"
                value={formData.estimatedShelfLifeDays}
                onChange={e => setFormData({ ...formData, estimatedShelfLifeDays: Number(e.target.value) })}
                required
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div>
              <label className="font-semibold block mb-1.5">{t('storageCondLabel')}</label>
              <select
                value={formData.storageCondition}
                onChange={e => setFormData({ ...formData, storageCondition: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <option value="ambient">Ambient Field</option>
                <option value="cold_storage">Cold Storage (Controlled)</option>
                <option value="ventilated_dry">Ventilated Dry Shed</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="font-semibold block mb-1.5">{t('harvestNotesLabel')}</label>
              <textarea
                rows="2"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-3 py-2 border rounded-xl font-medium ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                }`}
              />
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border rounded-xl font-semibold cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Minting Block...' : t('publishCropBtn')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid: My Crops & Pre-Harvest Contracts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Listed Crops */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              {t('activeCrops')} ({myCrops.length})
            </h2>
            <span className="text-xs text-slate-400 font-medium">Continuous Telemetry Active</span>
          </div>

          <div className="space-y-3">
            {myCrops.map((crop) => {
              const isUrgent = crop.isUrgentSale;
              const daysLeft = crop.aiShelfLife?.daysRemaining ?? crop.estimatedShelfLifeDays;

              return (
                <div
                  key={crop._id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex gap-3.5">
                      <img
                        src={crop.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=200&auto=format&fit=crop&q=80'}
                        alt={crop.cropName}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-800 flex-shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base leading-tight">{t(crop.cropName, crop.cropName)}</h3>
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            crop.status === 'pre_harvest' 
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' 
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          }`}>
                            {crop.status === 'pre_harvest' ? 'Pre-Harvest' : 'Harvested'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{crop.variety} • {crop.qualityGrade}</p>
                        
                        <div className="flex items-center gap-3 mt-2 text-xs">
                          <span className="text-slate-500">
                            Available: <strong className="text-slate-900 dark:text-white">{crop.availableQuantityKg} kg</strong>
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            ₹{crop.pricePerKg}/kg
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="sm:text-right w-full sm:w-auto">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                        daysLeft <= 2 
                          ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-950/30 dark:border-red-900' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        {daysLeft} {t('shelfLifeLeft')}
                      </div>

                      {isUrgent && (
                        <div className="mt-1.5 text-[11px] font-bold text-red-500 flex items-center sm:justify-end gap-1">
                          <Flame className="w-3 h-3" />
                          -{crop.discountPercentage}% Liquidation Discount
                        </div>
                      )}
                    </div>
                  </div>

                  {crop.aiWastageMitigation && (
                    <div className={`mt-3.5 pt-3 border-t text-xs flex items-start gap-2 ${
                      darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
                    }`}>
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800 dark:text-slate-200">AI Advice: </strong>
                        {crop.aiWastageMitigation.message}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Pre-Harvest Contracts */}
        <div className="space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            {t('preHarvestBookings')} ({myBookings.length})
          </h2>

          {myBookings.length === 0 ? (
            <div className={`p-8 text-center rounded-2xl border border-dashed text-xs text-slate-400 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              No pre-harvest contracts signed yet. Forward agreements from buyers will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((b) => (
                <div 
                  key={b._id} 
                  className={`p-4 rounded-2xl border text-xs space-y-2.5 transition-all ${
                    darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm">{b.cropName}</h4>
                      <p className="text-slate-500 text-[11px]">Buyer: {b.buyerName}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {b.status}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-xl space-y-1 ${
                    darkMode ? 'bg-slate-800/60' : 'bg-slate-50'
                  }`}>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Volume:</span>
                      <strong>{b.bookedQuantityKg} kg</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Value:</span>
                      <strong>₹{b.totalAmount?.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between text-emerald-600 font-semibold pt-0.5 border-t border-slate-200/50 dark:border-slate-700/50">
                      <span>20% Escrow Advance:</span>
                      <span>₹{b.advancePaymentAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  {b.blockchainHash && (
                    <div className="text-[10px] font-mono text-slate-400 truncate">
                      Tx: {b.blockchainHash}
                    </div>
                  )}

                  {(b.status === 'pending_farmer_approval' || b.status === 'pending') && (
                    <button
                      onClick={() => handleConfirmBooking(b._id)}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                    >
                      {t('confirmAgreementBtn')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
