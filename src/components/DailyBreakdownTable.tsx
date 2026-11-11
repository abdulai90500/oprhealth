import React, { useState } from 'react';
import type { DailySummary } from '../types/billing';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';
import { Calendar, Download, ChevronUp, ChevronDown } from 'lucide-react';

interface DailyBreakdownTableProps {
  dailySummaries: DailySummary[];
  currencySymbol: string;
}

export const DailyBreakdownTable: React.FC<DailyBreakdownTableProps> = ({
  dailySummaries,
  currencySymbol,
}) => {
  const [sortAsc, setSortAsc] = useState(false);

  const sortedSummaries = [...dailySummaries].sort((a, b) => {
    return sortAsc ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date);
  });

  const handleExportCSV = () => {
    const rows = sortedSummaries.map((s) => ({
      Date: s.date,
      'Bills Count': s.billsCount,
      'Total Invoiced': s.totalInvoiced,
      'Total Amount Paid': s.totalPaid,
      'Total Amount Owed': s.totalOwed,
      'Collection Rate (%)': s.collectionRate.toFixed(2),
    }));
    exportToCSV(`OpenMRS_Daily_Billing_Report_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs mb-8 overflow-hidden">
      
      {/* Header */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Daily Payment &amp; Debt Breakdown (Pay Per Day vs Owed Per Day)
            </h2>
            <p className="text-xs text-slate-500">
              Aggregated daily cash collection ledger and outstanding accounts receivable
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors"
          >
            {sortAsc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{sortAsc ? 'Oldest First' : 'Newest First'}</span>
          </button>
          <button
            onClick={handleExportCSV}
            disabled={sortedSummaries.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/75 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4 text-center">Invoices</th>
              <th className="py-3 px-4">Total Invoiced</th>
              <th className="py-3 px-4 text-emerald-700">Total Paid (Collected)</th>
              <th className="py-3 px-4 text-rose-700">Total Owed (Debt)</th>
              <th className="py-3 px-4">Daily Collection Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedSummaries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">
                  No daily records for the selected date range.
                </td>
              </tr>
            ) : (
              sortedSummaries.map((row) => (
                <tr key={row.date} className="hover:bg-slate-50/70 transition-colors">
                  
                  {/* Date */}
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    {formatDate(row.date)}
                    <span className="block text-2xs text-slate-400 font-normal font-mono">{row.date}</span>
                  </td>

                  {/* Bill Count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-mono text-xs">
                      {row.billsCount}
                    </span>
                  </td>

                  {/* Total Invoiced */}
                  <td className="py-3.5 px-4 text-slate-700 font-medium">
                    {formatCurrency(row.totalInvoiced, undefined, currencySymbol)}
                  </td>

                  {/* Total Paid */}
                  <td className="py-3.5 px-4 font-bold text-emerald-700">
                    {formatCurrency(row.totalPaid, undefined, currencySymbol)}
                  </td>

                  {/* Total Owed */}
                  <td className="py-3.5 px-4 font-bold text-rose-600">
                    {formatCurrency(row.totalOwed, undefined, currencySymbol)}
                  </td>

                  {/* Rate bar */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(0, row.collectionRate))}%` }}
                        />
                      </div>
                      <span className="font-semibold text-slate-700 text-2xs">
                        {row.collectionRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div>
          <span className="text-slate-500 text-2xs uppercase">Days Tracked:</span>
          <div className="font-bold text-slate-900">{sortedSummaries.length} Days</div>
        </div>
        <div>
          <span className="text-slate-500 text-2xs uppercase">Cumulative Invoiced:</span>
          <div className="font-bold text-slate-900">
            {formatCurrency(sortedSummaries.reduce((a, b) => a + b.totalInvoiced, 0), undefined, currencySymbol)}
          </div>
        </div>
        <div>
          <span className="text-slate-500 text-2xs uppercase">Cumulative Paid:</span>
          <div className="font-bold text-emerald-700">
            {formatCurrency(sortedSummaries.reduce((a, b) => a + b.totalPaid, 0), undefined, currencySymbol)}
          </div>
        </div>
        <div>
          <span className="text-slate-500 text-2xs uppercase">Cumulative Owed:</span>
          <div className="font-bold text-rose-600">
            {formatCurrency(sortedSummaries.reduce((a, b) => a + b.totalOwed, 0), undefined, currencySymbol)}
          </div>
        </div>
      </div>

    </div>
  );
};
