import React from 'react';
import { Calendar, Filter, Sparkles } from 'lucide-react';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  activePreset: string;
  onSelectPreset: (preset: string) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  statusFilter,
  onStatusFilterChange,
  activePreset,
  onSelectPreset,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Preset quick buttons */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Quick Ranges:
          </span>
          {[
            { label: 'Today', key: 'today' },
            { label: 'Yesterday', key: 'yesterday' },
            { label: 'Last 7 Days', key: 'last7' },
            { label: 'Last 30 Days', key: 'last30' },
            { label: 'This Month', key: 'thisMonth' },
            { label: 'All Records', key: 'all' },
          ].map((preset) => (
            <button
              key={preset.key}
              onClick={() => onSelectPreset(preset.key)}
              className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                activePreset === preset.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Date Inputs & Status Filter */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Start Date */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <label className="text-xs font-semibold text-slate-600">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="text-xs bg-transparent text-slate-800 font-medium focus:outline-hidden"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <label className="text-xs font-semibold text-slate-600">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="text-xs bg-transparent text-slate-800 font-medium focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <label className="text-xs font-semibold text-slate-600">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="text-xs bg-transparent text-slate-800 font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Invoices</option>
              <option value="UNPAID_ONLY">Outstanding Debts Only</option>
              <option value="PAID">Fully Paid Only</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PENDING">Pending (Zero Paid)</option>
              <option value="EXEMPTED">Exemptions / Waivers</option>
            </select>
          </div>

        </div>

      </div>
    </div>
  );
};

