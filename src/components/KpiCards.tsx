import React from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Users, 
  TrendingUp, 
  Percent 
} from 'lucide-react';
import type { FinanceSummaryMetrics } from '../types/billing';
import { formatCurrency } from '../utils/formatters';

interface KpiCardsProps {
  metrics: FinanceSummaryMetrics;
  currencySymbol: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics, currencySymbol }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Total Amount Paid */}
      <div className="bg-white rounded-xl border border-emerald-200 p-5 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 -z-0" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Total Amount Paid
            </span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-emerald-700 tracking-tight">
            {formatCurrency(metrics.totalPaid, undefined, currencySymbol)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{metrics.collectionRate.toFixed(1)}% of total invoiced captured</span>
          </div>
        </div>
      </div>

      {/* 2. Total Amount Owed (Outstanding Debt) */}
      <div className="bg-white rounded-xl border border-rose-200 p-5 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-bl-full -mr-4 -mt-4 -z-0" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-800">
              Total Amount Owed
            </span>
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-rose-600 tracking-tight">
            {formatCurrency(metrics.totalOwed, undefined, currencySymbol)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-rose-700 font-medium">
            <span>Outstanding receivables across unfinalized bills</span>
          </div>
        </div>
      </div>

      {/* 3. Total Invoiced (Gross Billing) */}
      <div className="bg-white rounded-xl border border-blue-200 p-5 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 -z-0" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-800">
              Total Invoiced (Gross)
            </span>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-blue-700 tracking-tight">
            {formatCurrency(metrics.totalInvoiced, undefined, currencySymbol)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-blue-700 font-medium">
            <span>{metrics.totalBills} total bills generated</span>
          </div>
        </div>
      </div>

      {/* 4. Active Debtors & Avg Debt */}
      <div className="bg-white rounded-xl border border-purple-200 p-5 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-4 -mt-4 -z-0" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-800">
              Patients with Debt
            </span>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-purple-700 tracking-tight">
            {metrics.activeDebtorsCount} <span className="text-base font-normal text-purple-500">Patients</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-purple-700 font-medium">
            <Percent className="w-3.5 h-3.5" />
            <span>Avg Debt: {formatCurrency(metrics.avgDebtPerDebtor, undefined, currencySymbol)}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
