import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import type { DailySummary, Bill } from '../types/billing';
import { formatCurrency, formatDate } from '../utils/formatters';
import { BarChart3, PieChart as PieIcon, MapPin } from 'lucide-react';

interface FinancialChartsProps {
  dailyData: DailySummary[];
  bills: Bill[];
  currencySymbol: string;
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({
  dailyData,
  bills,
  currencySymbol,
}) => {
  // Cash Point Breakdown
  const cashPointMap: Record<string, { invoiced: number; paid: number; owed: number }> = {};
  // Status breakdown
  const statusCounts = {
    PAID: 0,
    PARTIALLY_PAID: 0,
    PENDING: 0,
    EXEMPTED: 0,
    VOIDED: 0,
  };

  bills.forEach((b) => {
    const cp = b.cashPoint || 'Unassigned Cashier';
    if (!cashPointMap[cp]) {
      cashPointMap[cp] = { invoiced: 0, paid: 0, owed: 0 };
    }
    const owed = Math.max(0, (b.totalAmount || 0) - (b.amountPaid || 0));
    cashPointMap[cp].invoiced += b.totalAmount || 0;
    cashPointMap[cp].paid += b.amountPaid || 0;
    cashPointMap[cp].owed += b.status !== 'EXEMPTED' && b.status !== 'VOIDED' ? owed : 0;

    if (b.status in statusCounts) {
      statusCounts[b.status as keyof typeof statusCounts]++;
    }
  });

  const chartData = dailyData.map((d) => ({
    date: formatDate(d.date),
    rawDate: d.date,
    Paid: d.totalPaid,
    Owed: d.totalOwed,
  }));

  const cashPointList = Object.entries(cashPointMap).map(([point, stats]) => ({
    point,
    ...stats,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      
      {/* Daily Revenue & Debt Bar Chart (2 columns on large screen) */}
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Collections vs Outstanding Debt</h3>
              <p className="text-xs text-slate-500">Timeline of collections captured vs unpaid debt per day</p>
            </div>
          </div>
        </div>

        {chartData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-400">
            No billing records in selected date range.
          </div>
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  angle={-30} 
                  textAnchor="end"
                  interval="preserveStartEnd"
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${currencySymbol}${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: unknown, name: unknown) => {
                    const numericValue = typeof value === 'number' ? value : 0;
                    const labelName = String(name ?? '');
                    return [
                      formatCurrency(numericValue, undefined, currencySymbol),
                      labelName === 'Paid' ? 'Total Paid' : 'Total Owed',
                    ];
                  }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }}
                />
                <Bar dataKey="Paid" name="Paid" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Owed" name="Owed" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Distribution & Cash Point Breakdown (1 column) */}
      <div className="flex flex-col gap-6">
        
        {/* Invoice Status Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-600">
              <PieIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Invoice Status Breakdown</h3>
              <p className="text-xs text-slate-500">Distribution of bills in current view</p>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Fully Paid', count: statusCounts.PAID, color: 'bg-emerald-500', text: 'text-emerald-700' },
              { label: 'Partially Paid', count: statusCounts.PARTIALLY_PAID, color: 'bg-amber-500', text: 'text-amber-700' },
              { label: 'Pending (Debt)', count: statusCounts.PENDING, color: 'bg-rose-500', text: 'text-rose-700' },
              { label: 'Exempted / Waiver', count: statusCounts.EXEMPTED, color: 'bg-indigo-500', text: 'text-indigo-700' },
            ].map((item) => {
              const totalBills = bills.length || 1;
              const pct = ((item.count / totalBills) * 100).toFixed(0);
              return (
                <div key={item.label} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="font-medium text-slate-700">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-mono">({pct}%)</span>
                    <span className={`font-bold ${item.text}`}>{item.count}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cash Points Ledger Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Revenue by Cash Point</h3>
              <p className="text-xs text-slate-500">Hospital department payment counters</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {cashPointList.slice(0, 4).map((cp) => (
              <div key={cp.point} className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-800">{cp.point}</span>
                  <span className="font-semibold text-emerald-700">
                    {formatCurrency(cp.paid, undefined, currencySymbol)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-1.5"
                    style={{
                      width: `${cp.invoiced > 0 ? (cp.paid / cp.invoiced) * 100 : 0}%`,
                    }}
                  />
                  <div
                    className="bg-rose-400 h-1.5"
                    style={{
                      width: `${cp.invoiced > 0 ? (cp.owed / cp.invoiced) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
