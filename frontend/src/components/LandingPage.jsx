import React, { useState, useEffect } from 'react';
import { Lottie } from 'lottie-react';
import { 
  ArrowRight, 
  Check, 
  Sliders, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  TrendingUp,
  FileText,
  Clock,
  Layers,
  Sparkles,
  BarChart2,
  Wheat,
  Sprout,
  Activity,
  Droplets,
  Truck,
  Building,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTranslation } from '../services/LanguageContext';

export const LandingPage = ({ 
  onNavigate, 
  onOpenAuth, 
  quickAccounts, 
  onSelectRole, 
  darkMode 
}) => {
  const { t } = useTranslation();

  // Simulator State
  const [selectedCrop, setSelectedCrop] = useState('tomato');
  const [storageEnv, setStorageEnv] = useState('ambient');
  const [daysElapsed, setDaysElapsed] = useState(3);

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  const cropPresets = {
    tomato: { name: 'Tomato (Hybrid Red)', totalDays: 8, ambientDecay: 12.5, coldDecay: 4.0, basePrice: 28 },
    onion: { name: 'Nashik Red Onion', totalDays: 60, ambientDecay: 1.6, coldDecay: 0.5, basePrice: 34 },
    grapes: { name: 'Tas-A-Ganesh Grapes', totalDays: 7, ambientDecay: 14.2, coldDecay: 5.0, basePrice: 70 },
    sugarcane: { name: 'Sugarcane (Co 86032)', totalDays: 14, ambientDecay: 7.1, coldDecay: 2.1, basePrice: 3.5 }
  };

  const crop = cropPresets[selectedCrop];
  const decayRate = storageEnv === 'cold_storage' ? crop.coldDecay : crop.ambientDecay;
  const spoilageProb = Math.min(100, Math.round(daysElapsed * decayRate));
  const daysLeft = Math.max(0, crop.totalDays - daysElapsed);
  const isUrgent = daysLeft <= 2 || spoilageProb > 60;
  const discount = isUrgent ? Math.min(45, Math.round(spoilageProb * 0.45)) : 0;
  const effectivePrice = Math.round(crop.basePrice * (1 - discount / 100));

  const triggerCelebration = () => {
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const faqs = [
    {
      q: "How does AgriFlow AI actively curb post-harvest produce loss?",
      a: "By applying predictive spoilage algorithms on live inventories. Instead of produce quietly rotting in warehouses, the platform estimates remaining biological shelf-life in real time based on storage climate. When produce hits 48 hours to expiry, automated dynamic discounting triggers to alert food processing hubs for rapid batch liquidation."
    },
    {
      q: "How do Pre-Harvest contracts safeguard both farmer and enterprise buyer?",
      a: "Farmers register standing crops before harvest, locking in fixed forward agreements with enterprise buyers. A 20% advance payment is locked into smart escrow and timestamped onto our decentralized ledger. Farmers gain guaranteed buyers at fixed prices, while buyers secure reliable delivery batches free from spot-market price spikes."
    },
    {
      q: "What role does the SHA-256 blockchain ledger serve?",
      a: "Every transaction—from harvest certification, contract escrow locks, to reefer telemetry readings and delivery sign-offs—is chained into an immutable SHA-256 block ledger. Any tampering or price alteration invalidates cryptographic block verification immediately, guaranteeing verifiable provenance."
    },
    {
      q: "Can AgriFlow AI operate effectively in low-connectivity rural regions?",
      a: "Yes. The platform implements a hybrid dual-store architecture with zero-friction in-memory caching and responsive Progressive Web App design. Farmers in rural districts can browse and trade seamlessly even under intermittent mobile network coverage."
    }
  ];

  return (
    <div className={`transition-colors duration-200 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-28 overflow-hidden">
        <div className={`absolute inset-0 pointer-events-none ${
          darkMode 
            ? 'bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.14),transparent)]'
            : 'bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.09),transparent)]'
        }`} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 text-center lg:text-left">
              
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-6 border ${
                darkMode 
                  ? 'bg-slate-900 border-slate-800 text-emerald-400' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <Wheat className="w-3.5 h-3.5 text-emerald-500 animate-bounce" />
                <span>{t('heroBadge')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
                {t('heroTitlePrefix')}{' '}
                <span className="text-emerald-600 dark:text-emerald-400">{t('heroTitleHighlight')}</span>
              </h1>

              <p className={`mt-6 text-base sm:text-lg leading-relaxed max-w-2xl ${
                darkMode ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {t('heroSubtitle')}
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4">
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sprout className="w-4 h-4" />
                  {t('exploreMarketplaceBtn')}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                <button
                  onClick={() => {
                    triggerCelebration();
                    onNavigate('ai-hub');
                  }}
                  className={`px-6 py-3.5 rounded-xl font-semibold text-sm transition-all border cursor-pointer flex items-center gap-2 ${
                    darkMode
                      ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-emerald-500" />
                  {t('viewAIDecisionBtn')}
                </button>
              </div>

              <div className={`mt-10 pt-6 border-t flex flex-wrap justify-center lg:justify-start gap-5 sm:gap-8 text-xs font-medium ${
                darkMode ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'
              }`}>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>{t('zeroMiddlemen')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{t('escrowProtection')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>{t('provenanceAudit')}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Display */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              
              {/* Vibrant Multi-layered Ambient Backdrop Glow */}
              <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/20 via-teal-400/15 to-amber-400/20 rounded-3xl blur-2xl pointer-events-none" />

              {/* Ultra-sharp Glassmorphic Showcase Container */}
              <div className={`relative w-full max-w-md lg:max-w-none rounded-3xl border p-3 sm:p-5 backdrop-blur-xl shadow-2xl transition-all ${
                darkMode 
                  ? 'bg-slate-900/75 border-slate-700/60 shadow-emerald-950/20' 
                  : 'bg-white/80 border-slate-200/80 shadow-slate-200/60'
              }`}>

                {/* Top Status Capsule */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-inherit text-xs">
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wide text-[11px] uppercase">
                      AgriFlow IoT Active
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Real-time Field Stream</span>
                  </div>
                </div>
                
                {/* Vector Animation Canvas with SVG Renderer & Subpixel Crispness */}
                <div className="w-full min-h-[300px] sm:min-h-[360px] flex items-center justify-center bg-transparent select-none overflow-hidden rounded-2xl">
                  <Lottie 
                    src="/hero-animation.json"
                    loop={true} 
                    autoplay={true}
                    renderer="svg"
                    rendererSettings={{
                      preserveAspectRatio: 'xMidYMid meet',
                      progressiveLoad: false,
                      hideOnTransparent: false,
                      className: 'crisp-lottie-svg'
                    }}
                    className="w-full h-auto max-w-[390px] bg-transparent"
                    style={{ 
                      background: 'transparent',
                      shapeRendering: 'geometricPrecision',
                      textRendering: 'geometricPrecision',
                      imageRendering: '-webkit-optimize-contrast'
                    }}
                  />
                </div>

                {/* Interactive Telemetry Sub-Bar */}
                <div className={`mt-3 pt-3 border-t border-inherit grid grid-cols-2 gap-2 text-left`}>
                  <div className={`p-2.5 rounded-xl border ${
                    darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50/90 border-slate-200/80'
                  }`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                      <Wheat className="w-3 h-3 text-emerald-500" />
                      Standing Crop
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      Wheat (PBW 343)
                    </div>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${
                    darkMode ? 'bg-slate-800/60 border-slate-700/60' : 'bg-slate-50/90 border-slate-200/80'
                  }`}>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-400">
                      <Activity className="w-3 h-3 text-amber-500" />
                      Loss Risk
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-amber-500 mt-0.5">
                      Low (Under 4%)
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Core Metrics with Visual Icons */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { val: t('statSpoilageVal'), label: t('statSpoilageLabel'), icon: <TrendingUp className="w-4 h-4 text-emerald-500" /> },
              { val: t('statAgentsVal'), label: t('statAgentsLabel'), icon: <Sparkles className="w-4 h-4 text-emerald-500" /> },
              { val: t('statLedgerVal'), label: t('statLedgerLabel'), icon: <Layers className="w-4 h-4 text-emerald-500" /> },
              { val: t('statEscrowVal'), label: t('statEscrowLabel'), icon: <ShieldCheck className="w-4 h-4 text-emerald-500" /> }
            ].map((stat, i) => (
              <div key={i} className={`p-5 rounded-2xl border text-center transition-all ${
                darkMode ? 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700' : 'bg-slate-50 border-slate-200/80 shadow-xs hover:border-slate-300'
              }`}>
                <div className="flex items-center justify-center gap-1.5 mb-1.5">
                  {stat.icon}
                  <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                    {stat.val}
                  </span>
                </div>
                <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE SIMULATOR */}
      <section className={`py-16 sm:py-24 border-y ${
        darkMode ? 'bg-slate-900/40 border-slate-800/80' : 'bg-slate-50/70 border-slate-200/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t('simulatorTag')}
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
              {t('simulatorTitle')}
            </h2>
            <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('simulatorDesc')}
            </p>
          </div>

          <div className={`rounded-2xl border p-6 sm:p-8 ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {t('cropVarietyLabel')}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    {Object.entries(cropPresets).map(([key, data]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedCrop(key)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          selectedCrop === key
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : darkMode
                              ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {t(data.name.split(' ')[0], data.name.split(' ')[0])}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {t('storageEnvLabel')}
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                    <button
                      onClick={() => setStorageEnv('ambient')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        storageEnv === 'ambient'
                          ? 'bg-slate-800 text-white border-slate-800'
                          : darkMode
                            ? 'bg-slate-800/40 border-slate-700 text-slate-400'
                            : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {t('ambientEnv')}
                    </button>
                    <button
                      onClick={() => setStorageEnv('cold_storage')}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        storageEnv === 'cold_storage'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : darkMode
                            ? 'bg-slate-800/40 border-slate-700 text-slate-400'
                            : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      {t('coldEnv')}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-semibold mb-2">
                    <span className="text-slate-500 uppercase tracking-wider">{t('daysSinceHarvestLabel')}</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {daysElapsed} of {crop.totalDays} Days
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={crop.totalDays}
                    value={daysElapsed}
                    onChange={(e) => setDaysElapsed(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="lg:col-span-2 flex flex-col justify-between space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  <div className={`p-4 rounded-xl border ${
                    darkMode ? 'bg-slate-800/50 border-slate-700/80' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      {t('daysRemainingLabel')}
                    </span>
                    <div className={`text-2xl font-black ${daysLeft <= 2 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {daysLeft} Days
                    </div>
                    <span className="text-[11px] text-slate-400">{t('bioShelfLimit')}</span>
                  </div>

                  <div className={`p-4 rounded-xl border ${
                    darkMode ? 'bg-slate-800/50 border-slate-700/80' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      {t('spoilageProbLabel')}
                    </span>
                    <div className={`text-2xl font-black ${
                      spoilageProb > 60 ? 'text-red-500' : spoilageProb > 30 ? 'text-amber-500' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {spoilageProb}%
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {spoilageProb > 60 ? t('criticalRiskTier') : t('optimalFreshness')}
                    </span>
                  </div>

                  <div className={`p-4 rounded-xl border ${
                    darkMode ? 'bg-slate-800/50 border-slate-700/80' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      {t('algorithmicPriceLabel')}
                    </span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      ₹{effectivePrice}
                      <span className="text-xs font-normal text-slate-400">/kg</span>
                    </div>
                    {discount > 0 ? (
                      <span className="text-[11px] font-bold text-red-500">
                        -{discount}% {t('autoDiscountActive')}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">{t('fullBaseValue')}</span>
                    )}
                  </div>

                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-semibold mb-1.5">
                    <span className="text-slate-500">{t('batchIntegrityRating')}</span>
                    <span className={spoilageProb > 60 ? 'text-red-500 font-bold' : 'text-emerald-600 font-bold'}>
                      {100 - spoilageProb}% Quality Preserved
                    </span>
                  </div>
                  <div className={`w-full h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}>
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        spoilageProb > 60 ? 'bg-red-500' : spoilageProb > 30 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.min(100, spoilageProb)}%` }}
                    />
                  </div>
                </div>

                <div className={`p-4 rounded-xl border text-xs leading-relaxed ${
                  isUrgent
                    ? darkMode
                      ? 'bg-red-950/20 border-red-900/60 text-red-300'
                      : 'bg-red-50 border-red-200 text-red-900'
                    : darkMode
                      ? 'bg-emerald-950/20 border-emerald-900/60 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}>
                  <strong className="block font-bold mb-0.5">
                    {isUrgent ? 'AI Zero-Wastage Directive Activated:' : 'Autonomous Valuation Status:'}
                  </strong>
                  {isUrgent
                    ? `Perishability threshold triggered. ${t(crop.name, crop.name)} price adjusted to ₹${effectivePrice}/kg with high-priority liquidation broadcasts dispatched to regional wholesale processors.`
                    : `Optimal preservation condition. Produce is recommended for export grades and pre-harvest contracts.`
                  }
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM PILLARS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {t('platformPillarsTag')}
          </span>
          <h2 className="text-3xl font-bold tracking-tight mt-1">
            {t('platformPillarsTitle')}
          </h2>
          <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {t('platformPillarsDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: t('pillar1Title'), desc: t('pillar1Desc'), icon: <Zap className="w-5 h-5 text-emerald-500" /> },
            { title: t('pillar2Title'), desc: t('pillar2Desc'), icon: <Clock className="w-5 h-5 text-emerald-500" /> },
            { title: t('pillar3Title'), desc: t('pillar3Desc'), icon: <BarChart2 className="w-5 h-5 text-emerald-500" /> },
            { title: t('pillar4Title'), desc: t('pillar4Desc'), icon: <ShieldCheck className="w-5 h-5 text-emerald-500" /> }
          ].map((card, i) => (
            <div key={i} className={`p-6 rounded-2xl border transition-all ${
              darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
            }`}>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                {card.icon}
              </div>
              <h3 className="font-bold text-base mb-2">{card.title}</h3>
              <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. ROLES */}
      <section className={`py-20 border-t ${
        darkMode ? 'bg-slate-900/30 border-slate-800/80' : 'bg-slate-50 border-slate-200/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              {t('rolesTag')}
            </span>
            <h2 className="text-3xl font-bold tracking-tight mt-1">
              {t('rolesTitle')}
            </h2>
            <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              {t('rolesDesc')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickAccounts?.map((acc) => {
              const roleIcons = {
                farmer: <Wheat className="w-5 h-5 text-emerald-500" />,
                buyer: <Building className="w-5 h-5 text-blue-500" />,
                transporter: <Truck className="w-5 h-5 text-amber-500" />,
                admin: <ShieldCheck className="w-5 h-5 text-purple-500" />
              };
              const roleColors = {
                farmer: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
                buyer: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
                transporter: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
                admin: 'text-purple-600 bg-purple-500/10 border-purple-500/20'
              };

              return (
                <div
                  key={acc.role}
                  className={`p-6 rounded-2xl border flex flex-col justify-between transition-all hover:shadow-md ${
                    darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${roleColors[acc.role] || 'text-emerald-600 bg-emerald-500/10'}`}>
                        {roleIcons[acc.role] || <UserCheck className="w-5 h-5" />}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${roleColors[acc.role] || 'text-emerald-600 bg-emerald-500/10'}`}>
                        {acc.role}
                      </span>
                    </div>
                    <h3 className="font-bold text-base mt-2 mb-1">{acc.name}</h3>
                    <p className={`text-xs leading-relaxed mb-6 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {acc.role === 'farmer' && 'List standing crops, track decay risk scores, and manage forward booking advances.'}
                      {acc.role === 'buyer' && 'Procure directly from farm clusters, lock pre-harvest agreements, and monitor deliveries.'}
                      {acc.role === 'transporter' && 'Accept refrigerated freight jobs, inspect sensor telemetry, and optimize routes.'}
                      {acc.role === 'admin' && 'Monitor platform KPI statistics, verify chain integrity, and review synopsis documentation.'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      triggerCelebration();
                      onSelectRole(acc);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    {t('enterAs')} {acc.role.toUpperCase()}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {t('faqTag')}
          </span>
          <h2 className="text-3xl font-bold tracking-tight mt-1">
            {t('faqTitle')}
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`rounded-xl border overflow-hidden transition-all ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              <button
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                className="w-full text-left p-4 sm:p-5 font-semibold text-sm flex justify-between items-center cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${
                  openFaq === idx ? 'rotate-90 text-emerald-600' : 'text-slate-400'
                }`} />
              </button>
              {openFaq === idx && (
                <div className={`p-4 sm:p-5 pt-0 text-xs leading-relaxed border-t ${
                  darkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'
                }`}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 6. INSTITUTIONAL ACCREDITATION & CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className={`rounded-3xl p-8 sm:p-12 border flex flex-col lg:flex-row items-center justify-between gap-8 ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-950 text-white border-slate-900'
        }`}>
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-semibold text-emerald-400">
              {t('dypcetDept')}
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {t('dypcetTitle')}
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              {t('dypcetDesc')}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('admin')}
              className="px-5 py-3 rounded-xl text-xs font-semibold bg-white text-slate-950 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t('technicalDocsBtn')}
            </button>
            <button
              onClick={() => onNavigate('marketplace')}
              className="px-5 py-3 rounded-xl text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              {t('openMarketplaceBtn')}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
