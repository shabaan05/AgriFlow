import React, { useState, useEffect } from 'react';
import { 
  Layers, 
  ShieldCheck, 
  Lock, 
  Hash, 
  RefreshCw, 
  Clock, 
  CheckCircle2, 
  FileText, 
  ExternalLink 
} from 'lucide-react';
import { useTranslation } from '../services/LanguageContext';

export const BlockchainExplorer = ({ api, darkMode }) => {
  const { t } = useTranslation();
  const [ledgerData, setLedgerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [expandedBlock, setExpandedBlock] = useState(null);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await api.getBlockchainLedger();
      if (res.success) {
        setLedgerData(res);
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
              SHA-256 Chained Provenance
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-500">DYPCET CSE (Data Science) Node</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('blockchainTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            {t('blockchainSubtitle')}
          </p>
        </div>

        <button
          onClick={fetchLedger}
          disabled={loading}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {t('refreshLedgerBtn')}
        </button>
      </div>

      {/* Chain Status Bar */}
      {ledgerData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-5 rounded-2xl border ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <span className="text-slate-500 text-xs block mb-1">{t('totalBlocksMined')}</span>
            <div className="text-3xl font-black text-slate-900 dark:text-white">{ledgerData.totalBlocks}</div>
          </div>

          <div className={`p-5 rounded-2xl border ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <span className="text-slate-500 text-xs block mb-1">{t('chainIntegrityStatus')}</span>
            <div className="text-base font-bold text-emerald-600 flex items-center gap-1.5 mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {ledgerData.chainIntegrity?.valid ? 'Cryptographically Secure' : 'Compromised'}
            </div>
          </div>

          <div className={`p-5 rounded-2xl border ${
            darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}>
            <span className="text-slate-500 text-xs block mb-1">{t('consensusNode')}</span>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1.5">
              DYPCET Kolhapur DS Consensus Node #1
            </div>
          </div>
        </div>
      )}

      {/* Block Stream */}
      <div className="space-y-4">
        <h2 className="text-base font-bold flex items-center gap-2">
          <Hash className="w-4 h-4 text-amber-600" />
          {t('minedBlockStream')}
        </h2>

        {ledgerData?.blocks?.map((block) => {
          const isGenesis = block.index === 0;
          const isExpanded = expandedBlock === block.index;

          return (
            <div
              key={block.index}
              className={`rounded-2xl border transition-all overflow-hidden ${
                darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div
                onClick={() => setExpandedBlock(isExpanded ? null : block.index)}
                className={`p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-colors ${
                  darkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-950 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center border border-slate-800">
                    #{block.index}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wide">
                        {block.eventType?.replace(/_/g, ' ')}
                      </span>
                      {isGenesis && (
                        <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                          GENESIS
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs sm:max-w-md mt-0.5">
                      Hash: {block.hash}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(block.timestamp || block.createdAt || Date.now()).toLocaleTimeString()}
                  </span>
                  <span className="text-emerald-600 font-semibold hover:underline">
                    {isExpanded ? 'Hide Payload' : 'Inspect Block'}
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className={`p-5 border-t space-y-3 text-xs font-mono animate-in fade-in duration-150 ${
                  darkMode ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-700'
                }`}>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Previous Hash:</span>
                    <span className="break-all block text-[11px] bg-slate-100 dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                      {block.previousHash}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Block Hash (SHA-256):</span>
                    <span className="text-emerald-600 font-bold break-all block text-[11px] bg-emerald-50 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-200 dark:border-emerald-900">
                      {block.hash}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">State Payload:</span>
                    <pre className="bg-slate-950 text-emerald-400 p-3.5 rounded-xl overflow-x-auto text-[11px] leading-relaxed border border-slate-800">
                      {JSON.stringify(block.payload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
