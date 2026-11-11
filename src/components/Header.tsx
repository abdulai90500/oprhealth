import React from 'react';
import { 
  Building2, 
  Activity, 
  RefreshCw, 
  BookOpen, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface HeaderProps {
  isMock: boolean;
  onToggleMock: () => void;
  onRefresh: () => void;
  loading: boolean;
  currencySymbol: string;
  onCurrencyChange: (symbol: string) => void;
  onOpenGuide: () => void;
  serverUrl?: string;
  apiError?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isMock,
  onToggleMock,
  onRefresh,
  loading,
  currencySymbol,
  onCurrencyChange,
  onOpenGuide,
  apiError,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
          
          {/* Hospital & Brand Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-100">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  OpenMRS 3.x Billing
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  rs.hayokmedicare.ng
                </span>
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Head of Finance Dashboard
              </h1>
            </div>
          </div>

          {/* Controls & Connection Status */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Live vs Demo Toggle */}
            <button
              onClick={onToggleMock}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                isMock
                  ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              }`}
              title="Click to toggle between Live OpenMRS API and Simulated Hospital Dataset"
            >
              {isMock ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Demo Dataset</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Live OpenMRS REST</span>
                </>
              )}
            </button>

            {/* Currency selector */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
              <span className="px-2 text-slate-500 font-medium">Currency:</span>
              <button
                onClick={() => onCurrencyChange('₦')}
                className={`px-2 py-1 rounded font-semibold ${
                  currencySymbol === '₦' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ₦ (NGN)
              </button>
              <button
                onClick={() => onCurrencyChange('$')}
                className={`px-2 py-1 rounded font-semibold ${
                  currencySymbol === '$' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                $ (USD)
              </button>
            </div>

            {/* Refresh Data */}
            <button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors disabled:opacity-50"
              title="Refresh Billing Ledger"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            {/* Architecture / Deployment Guide */}
            <button
              onClick={onOpenGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Deployment & Run Down</span>
            </button>
          </div>
        </div>

        {/* Warning notification banner if live API fell back to mock */}
        {apiError && isMock && (
          <div className="mb-2 py-1.5 px-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Note:</strong> Live OpenMRS at <code className="bg-amber-100 px-1 py-0.5 rounded">rs.hayokmedicare.ng</code> is protected by intranet/session. Active in simulation mode with realistic hospital patient records.
              </span>
            </div>
            <button
              onClick={onOpenGuide}
              className="underline font-semibold ml-2 hover:text-amber-950"
            >
              How to connect live
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
