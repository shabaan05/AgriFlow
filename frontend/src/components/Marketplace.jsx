import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Flame, 
  ShoppingCart, 
  TrendingDown, 
  Calendar,
  AlertCircle,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { useTranslation } from '../services/LanguageContext';
import { useAppStore } from '../services/useAppStore';

export const Marketplace = ({ crops, user, onOrderSuccess, onBookingSuccess, api, darkMode }) => {
  const { t } = useTranslation();
  const openAuthModal = useAppStore((state) => state.openAuthModal);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [urgentOnly, setUrgentOnly] = useState(false);

  // Modal states
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [modalType, setModalType] = useState(null); // 'buy' | 'book' | 'details'
  const [quantity, setQuantity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.location?.address || 'Kolhapur, Maharashtra');
  const [submitting, setSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Filter crops
  const filteredCrops = crops.filter((crop) => {
    const matchesSearch = crop.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          crop.variety?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          crop.location?.district?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || crop.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || crop.status === statusFilter;
    const matchesUrgent = !urgentOnly || crop.isUrgentSale;
    return matchesSearch && matchesCategory && matchesStatus && matchesUrgent;
  });

  const handleOpenModal = (crop, type) => {
    setSelectedCrop(crop);
    setModalType(type);
    setQuantity(Math.min(100, crop.availableQuantityKg || 50));
    setActionMessage(null);
  };

  const handleCloseModal = () => {
    setSelectedCrop(null);
    setModalType(null);
    setActionMessage(null);
  };

  const executeOrder = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      setActionMessage({ type: 'error', text: 'Please log in to a buyer account to place an order.' });
      return;
    }
    setSubmitting(true);
    setActionMessage(null);
    try {
      const token = localStorage.getItem('agriflow_token');
      const res = await api.instantBuy({
        cropId: selectedCrop._id,
        quantityKg: Number(quantity),
        deliveryLocation: { address: deliveryAddress, city: 'Kolhapur', state: 'Maharashtra' }
      }, token);

      if (res.success) {
        const txHash = res.blockchainTxHash || res.order?.blockchainHash || res.order?.blockchainTracking?.latestTxHash || '';
        const shortHash = txHash ? `${txHash.substring(0, 16)}...` : 'Verified';
        setActionMessage({
          type: 'success',
          text: `${t('orderSuccessMsg')} Order #${res.order?.orderNumber}. Blockchain hash: ${shortHash}`
        });
        if (onOrderSuccess) onOrderSuccess();
        setTimeout(() => {
          handleCloseModal();
        }, 2200);
      } else {
        setActionMessage({ type: 'error', text: res.message || 'Failed to place order.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const executeBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      setActionMessage({ type: 'error', text: 'Please log in as a buyer to contract pre-harvest produce.' });
      return;
    }
    setSubmitting(true);
    setActionMessage(null);
    try {
      const token = localStorage.getItem('agriflow_token');
      const res = await api.createBooking({
        cropId: selectedCrop._id,
        bookedQuantityKg: Number(quantity),
        notes: 'Pre-harvest agreement contracted via AgriFlow AI Marketplace.'
      }, token);

      if (res.success) {
        setActionMessage({
          type: 'success',
          text: `${t('bookingSuccessMsg')} ${res.booking?.cropName}. 20% advance locked.`
        });
        if (onBookingSuccess) onBookingSuccess();
        setTimeout(() => {
          handleCloseModal();
        }, 2200);
      } else {
        setActionMessage({ type: 'error', text: res.message || 'Failed to book crop.' });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Header Card */}
      <div className={`p-6 sm:p-8 rounded-2xl mb-8 border transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 shadow-xs text-slate-900'
      }`}>
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {t('navMarketplace')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 mb-2">
            {t('marketplaceHeroTitle')}
          </h1>
          <p className={`text-xs sm:text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('marketplaceHeroDesc')}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className={`rounded-2xl border p-4 mb-6 transition-all ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`w-full py-2 px-3 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="all">{t('allCategories')}</option>
              <option value="vegetable">{t('vegetables')}</option>
              <option value="fruit">{t('fruits')}</option>
              <option value="grain">{t('grains')}</option>
              <option value="cash_crop">{t('cashCrops')}</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`w-full py-2 px-3 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
              }`}
            >
              <option value="all">{t('allStatuses')}</option>
              <option value="harvested">{t('harvestedStatus')}</option>
              <option value="pre_harvest">{t('preHarvestStatus')}</option>
            </select>
          </div>

          {/* Urgent Distress Toggle */}
          <div className="flex items-center justify-between md:justify-end">
            <label className={`flex items-center gap-2 cursor-pointer select-none px-3 py-2 rounded-xl border text-xs font-semibold ${
              darkMode ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <input
                type="checkbox"
                checked={urgentOnly}
                onChange={(e) => setUrgentOnly(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
              />
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              {t('urgentDistressSales')}
            </label>
          </div>
        </div>
      </div>

      {/* Crop Cards Grid */}
      {filteredCrops.length === 0 ? (
        <div className={`text-center py-16 rounded-2xl border border-dashed ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-300 text-slate-500'
        }`}>
          <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-400" />
          <h3 className="text-sm font-semibold">No crop listings match your criteria</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCrops.map((cropItem) => {
            const isPreHarvest = cropItem.status === 'pre_harvest';
            const aiRisk = cropItem.aiRiskScore || 0;
            const hasUrgentDiscount = cropItem.isUrgentSale && cropItem.discountPercentage > 0;
            const effectivePrice = hasUrgentDiscount
              ? Math.round(cropItem.pricePerKg * (1 - cropItem.discountPercentage / 100))
              : cropItem.pricePerKg;

            const translatedName = t(cropItem.cropName, cropItem.cropName);

            return (
              <div
                key={cropItem._id}
                className={`rounded-2xl border transition-all duration-200 flex flex-col overflow-hidden group ${
                  darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Image & Header */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={cropItem.images?.[0] || 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'}
                    alt={cropItem.cropName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase shadow ${
                      isPreHarvest ? 'bg-blue-600/90 text-white' : 'bg-emerald-600/90 text-white'
                    }`}>
                      {isPreHarvest ? t('preHarvestStatus').split(' ')[0] : t('harvestedStatus').split(' ')[0]}
                    </span>
                    {hasUrgentDiscount && (
                      <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow">
                        <Flame className="w-3 h-3" /> -{cropItem.discountPercentage}% {t('wastageSave')}
                      </span>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 text-white text-xs font-semibold flex items-center gap-1 drop-shadow">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> {cropItem.qualityGrade}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <div>
                        <h3 className="text-base font-bold leading-snug">{translatedName}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{cropItem.variety}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                          ₹{effectivePrice}
                          <span className="text-xs font-normal text-slate-400">/kg</span>
                        </div>
                        {hasUrgentDiscount && (
                          <div className="text-xs text-slate-400 line-through">
                            ₹{cropItem.pricePerKg}/kg
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{cropItem.location?.village}, {cropItem.location?.district} • {cropItem.farmerName}</span>
                    </div>

                    <div className={`mt-3 rounded-xl p-2.5 border text-xs flex justify-between items-center ${
                      darkMode ? 'bg-slate-800/60 border-slate-700/80' : 'bg-slate-50 border-slate-100'
                    }`}>
                      <span className="text-slate-500">{t('availableVolume')}</span>
                      <strong className="font-bold">{cropItem.availableQuantityKg?.toLocaleString()} kg</strong>
                    </div>

                    {/* Shelf Life Pill */}
                    <div className={`mt-3 rounded-xl p-2.5 border text-xs ${
                      darkMode ? 'bg-slate-800/40 border-slate-700/60' : 'bg-emerald-50/50 border-emerald-100'
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          {isPreHarvest ? t('harvestInDays') : t('shelfLifeRemaining')}
                        </span>
                        <span className={`font-bold ${cropItem.aiShelfLife?.daysRemaining <= 2 ? 'text-red-500' : 'text-emerald-600'}`}>
                          {isPreHarvest
                            ? `${Math.max(1, Math.round((new Date(cropItem.expectedHarvestDate) - new Date()) / 86400000))} ${t('harvestInDays')}`
                            : `${cropItem.aiShelfLife?.daysRemaining ?? cropItem.estimatedShelfLifeDays} ${t('shelfLifeLeft')}`}
                        </span>
                      </div>

                      {!isPreHarvest && (
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-1 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${
                              aiRisk > 60 ? 'bg-red-500' : aiRisk > 30 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, aiRisk)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2">
                    {isPreHarvest ? (
                      <button
                        onClick={() => handleOpenModal(cropItem, 'book')}
                        className="col-span-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4" /> {t('bookPreHarvest')}
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenModal(cropItem, 'buy')}
                          className="py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> {t('instantBuy')}
                        </button>
                        <button
                          onClick={() => handleOpenModal(cropItem, 'details')}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                            darkMode ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {t('detailsAndAudit')}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Dialog */}
      {selectedCrop && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-lg w-full p-6 shadow-2xl border animate-in fade-in zoom-in-95 duration-200 ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-start pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold">
                  {modalType === 'buy' && `${t('instantBuy')}: ${t(selectedCrop.cropName, selectedCrop.cropName)}`}
                  {modalType === 'book' && `${t('bookPreHarvest')}: ${t(selectedCrop.cropName, selectedCrop.cropName)}`}
                  {modalType === 'details' && `${t('detailsAndAudit')}: ${t(selectedCrop.cropName, selectedCrop.cropName)}`}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Farmer: {selectedCrop.farmerName} • {selectedCrop.location?.village}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            {actionMessage && (
              <div className={`mt-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {actionMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                )}
                <span>{actionMessage.text}</span>
              </div>
            )}

            {modalType === 'buy' && (
              <form onSubmit={executeOrder} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">{t('procureQtyKg')}</label>
                  <input
                    type="number"
                    min="10"
                    max={selectedCrop.availableQuantityKg}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">{t('deliveryAddress')}</label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 flex justify-between items-center font-bold">
                  <span>{t('totalAmountPayable')}</span>
                  <span className="text-base text-emerald-600">
                    ₹{(
                      Number(quantity) *
                      (selectedCrop.isUrgentSale && selectedCrop.discountPercentage
                        ? Math.round(selectedCrop.pricePerKg * (1 - selectedCrop.discountPercentage / 100))
                        : selectedCrop.pricePerKg)
                    ).toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border rounded-xl cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? t('confirming') : t('instantBuy')}
                  </button>
                </div>
              </form>
            )}

            {modalType === 'book' && (
              <form onSubmit={executeBooking} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">{t('procureQtyKg')}</label>
                  <input
                    type="number"
                    min="10"
                    max={selectedCrop.availableQuantityKg}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 space-y-1">
                  <div className="flex justify-between">
                    <span>Full Harvest Value:</span>
                    <strong>₹{(Number(quantity) * selectedCrop.pricePerKg).toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between text-blue-600 font-bold">
                    <span>20% Advance Escrow:</span>
                    <span>₹{Math.round(Number(quantity) * selectedCrop.pricePerKg * 0.2).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 border rounded-xl cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? t('signingContract') : t('signPreHarvest')}
                  </button>
                </div>
              </form>
            )}

            {modalType === 'details' && (
              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800">
                  <h4 className="font-bold mb-1">Crop Description</h4>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{selectedCrop.description}</p>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-slate-800 text-white rounded-xl font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
};
