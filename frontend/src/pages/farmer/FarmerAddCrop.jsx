/**
 * /farmer/add-crop
 * Embeds only the crop-creation form extracted from FarmerPortal logic.
 * No duplication of backend contract — uses api.createCrop() exactly as FarmerPortal does.
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Wheat, ArrowLeft } from 'lucide-react';
import { useAppStore } from '../../services/useAppStore';
import { api } from '../../services/api';
import { useTranslation } from '../../services/LanguageContext';

export default function FarmerAddCrop() {
  const navigate    = useNavigate();
  const darkMode    = useAppStore((s) => s.darkMode);
  const refreshData = useAppStore((s) => s.refreshData);
  const { t }       = useTranslation();

  const [submitting, setSubmitting] = useState(false);
  const [feedback,   setFeedback]   = useState(null);

  const [form, setForm] = useState({
    cropName:              'Tomato (Hybrid Red)',
    variety:               'Abhinav Hybrid F1',
    category:              'vegetable',
    status:                'harvested',
    totalQuantityKg:       2000,
    pricePerKg:            30,
    qualityGrade:          'Grade A (Export/Premium)',
    expectedHarvestDate:   new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    estimatedShelfLifeDays: 8,
    storageCondition:      'ambient',
    description:           'Pesticide controlled export grade firm hybrid red tomatoes with 8 days post-harvest shelf life.',
  });

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const inputCls = `w-full px-3 py-2 border rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
  }`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('agriflow_token');
      const res   = await api.createCrop(form, token);
      if (res.success) {
        setFeedback({
          type: 'success',
          text: `Listing published! SHA-256 block hash: ${res.blockchainHash?.substring(0, 16) ?? 'recorded'}…`,
        });
        refreshData();
        setTimeout(() => navigate('/farmer/crops'), 2000);
      } else {
        setFeedback({ type: 'error', text: res.message || 'Failed to list crop.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div>
        <button
          onClick={() => navigate('/farmer')}
          className={`flex items-center gap-1.5 text-xs font-semibold mb-4 cursor-pointer ${darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
        <div className="flex items-center gap-2 mb-1">
          <Wheat className="w-4 h-4 text-emerald-600" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Farmer Workspace</span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">List New Crop / Harvest</h1>
        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          A HARVEST_CERTIFICATION blockchain block is minted automatically on publish.
        </p>
      </div>

      {/* ── Form card ───────────────────────────────────────────────── */}
      <div className={`p-6 sm:p-8 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>

        {feedback && (
          <div className={`flex items-center gap-2 p-3 rounded-xl mb-6 text-xs font-semibold border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800'
          }`}>
            {feedback.type === 'success'
              ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              : <AlertCircle  className="w-4 h-4 text-red-600 flex-shrink-0" />}
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">

          {/* Row 1 */}
          <div>
            <label className="block font-semibold mb-1.5">{t('cropNameLabel')}</label>
            <input type="text" value={form.cropName} onChange={(e) => set('cropName', e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className="block font-semibold mb-1.5">{t('varietyLabel')}</label>
            <input type="text" value={form.variety} onChange={(e) => set('variety', e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className="block font-semibold mb-1.5">{t('categoryLabel')}</label>
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls}>
              <option value="vegetable">Vegetables</option>
              <option value="fruit">Fruits</option>
              <option value="grain">Grains & Pulses</option>
              <option value="cash_crop">Cash Crops</option>
            </select>
          </div>

          {/* Row 2 */}
          <div>
            <label className="block font-semibold mb-1.5">{t('statusLabel')}</label>
            <select value={form.status} onChange={(e) => set('status', e.target.value)} className={inputCls}>
              <option value="harvested">Harvested (Ready)</option>
              <option value="pre_harvest">Pre-Harvest (Contract)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1.5">{t('totalQtyKgLabel')}</label>
            <input type="number" min="10" value={form.totalQuantityKg} onChange={(e) => set('totalQuantityKg', Number(e.target.value))} required className={inputCls} />
          </div>
          <div>
            <label className="block font-semibold mb-1.5">{t('basePriceLabel')}</label>
            <input type="number" step="0.5" min="1" value={form.pricePerKg} onChange={(e) => set('pricePerKg', Number(e.target.value))} required className={inputCls} />
          </div>

          {/* Row 3 */}
          <div>
            <label className="block font-semibold mb-1.5">{t('qualityGradeLabel')}</label>
            <select value={form.qualityGrade} onChange={(e) => set('qualityGrade', e.target.value)} className={inputCls}>
              <option value="Grade A (Export/Premium)">Grade A (Export/Premium)</option>
              <option value="Grade B (Standard Market)">Grade B (Standard Market)</option>
              <option value="Grade C (Processing)">Grade C (Processing)</option>
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1.5">Expected Harvest Date</label>
            <input type="date" value={form.expectedHarvestDate} onChange={(e) => set('expectedHarvestDate', e.target.value)} required className={inputCls} />
          </div>
          <div>
            <label className="block font-semibold mb-1.5">{t('estShelfLifeLabel')}</label>
            <input type="number" min="1" value={form.estimatedShelfLifeDays} onChange={(e) => set('estimatedShelfLifeDays', Number(e.target.value))} required className={inputCls} />
          </div>

          {/* Row 4 */}
          <div>
            <label className="block font-semibold mb-1.5">{t('storageCondLabel')}</label>
            <select value={form.storageCondition} onChange={(e) => set('storageCondition', e.target.value)} className={inputCls}>
              <option value="ambient">Ambient Field</option>
              <option value="cold_storage">Cold Storage (Controlled)</option>
              <option value="ventilated_dry">Ventilated Dry Shed</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block font-semibold mb-1.5">{t('harvestNotesLabel')}</label>
            <textarea rows="3" value={form.description} onChange={(e) => set('description', e.target.value)} className={inputCls} />
          </div>

          {/* Blockchain notice */}
          <div className={`sm:col-span-3 p-3 rounded-xl border text-[11px] leading-relaxed ${
            darkMode ? 'bg-slate-800/40 border-slate-700 text-slate-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            On publish, a <strong>HARVEST_CERTIFICATION</strong> SHA-256 block is automatically minted on the AgriFlow blockchain ledger, creating an immutable provenance record for this crop batch.
          </div>

          {/* Actions */}
          <div className="sm:col-span-3 flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/farmer')}
              className={`px-4 py-2 border rounded-xl font-semibold cursor-pointer text-xs ${
                darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 text-xs transition-all"
            >
              {submitting ? 'Minting Block…' : t('publishCropBtn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
