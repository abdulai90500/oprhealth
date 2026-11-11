import React, { useState } from 'react';
import type { DebtorSummary } from '../types/billing';
import { formatCurrency, formatDate, exportToCSV } from '../utils/formatters';
import { 
  Users, 
  Search, 
  Download, 
  ChevronRight, 
  AlertCircle,
  Clock,
  Receipt
} from 'lucide-react';

interface DebtorListProps {
  debtors: DebtorSummary[];
  onSelectDebtor: (debtor: DebtorSummary) => void;
  currencySymbol: string;
}

export const DebtorList: React.FC<DebtorListProps> = ({
  debtors,
  onSelectDebtor,
  currencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [minDebt, setMinDebt] = useState<number>(0);

  // Filter debtors by search keyword and minimum debt
  const filteredDebtors = debtors.filter((d) => {
    const matchesSearch =
      d.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.patientIdentifier && d.patientIdentifier.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMin = d.totalOwed >= minDebt;
    return matchesSearch && matchesMin;
  });

  const handleExportCSV = () => {
    const exportRows = filteredDebtors.map((d) => ({
      'Patient Name': d.patientName,
      'Patient Identifier': d.patientIdentifier || 'N/A',
      'Total Amount Owed': d.totalOwed,
      'Total Invoiced': d.totalInvoiced,
      'Total Paid': d.totalPaid,
      'Pending Invoices Count': d.unpaidBillsCount,
      'Oldest Bill Date': d.oldestUnpaidBillDate,
      'Latest Bill Date': d.latestBillDate,
      'Phone Number': d.phoneNumber || 'N/A',
    }));
    exportToCSV(`OpenMRS_Debtors_List_${new Date().toISOString().split('T')[0]}`, exportRows);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs mb-8 overflow-hidden">
      
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-100 text-rose-700">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Outstanding Debtor Ledger (Patients with Unpaid Balances)
              </h2>
              <p className="text-xs text-slate-500">
                Sorted by highest outstanding balance to prioritize hospital debt recovery
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              disabled={filteredDebtors.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
          </div>

        </div>

        {/* Search & Min Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-200/60">
          
          {/* Search by Name or ID */}
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search debtor by patient name, file number, or OpenMRS ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-white pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Min Debt Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600 font-medium shrink-0">Min Debt:</label>
            <select
              value={minDebt}
              onChange={(e) => setMinDebt(Number(e.target.value))}
              className="w-full text-xs bg-white px-2.5 py-2 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            >
              <option value="0">All Balances (&gt; {currencySymbol}0)</option>
              <option value="10000">&gt;= {currencySymbol}10,000</option>
              <option value="25000">&gt;= {currencySymbol}25,000</option>
              <option value="50000">&gt;= {currencySymbol}50,000</option>
              <option value="100000">&gt;= {currencySymbol}100,000</option>
            </select>
          </div>

        </div>
      </div>

      {/* Debtors Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/75 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Patient Information</th>
              <th className="py-3 px-4">Pending Bills</th>
              <th className="py-3 px-4">Total Invoiced</th>
              <th className="py-3 px-4">Amount Paid</th>
              <th className="py-3 px-4 text-rose-700">Total Owed</th>
              <th className="py-3 px-4">Oldest Debt</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDebtors.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-slate-500">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-medium">No debtors match your current search or date range.</p>
                  <p className="text-2xs text-slate-400 mt-1">All patient accounts in this period are fully settled or exempted.</p>
                </td>
              </tr>
            ) : (
              filteredDebtors.map((debtor, index) => (
                <tr 
                  key={debtor.patientUuid} 
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => onSelectDebtor(debtor)}
                >
                  {/* Patient Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {debtor.patientName}
                        </div>
                        <div className="text-2xs text-slate-500 flex items-center gap-2 mt-0.5">
                          {debtor.patientIdentifier && (
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                              {debtor.patientIdentifier}
                            </span>
                          )}
                          {debtor.phoneNumber && (
                            <span>{debtor.phoneNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Pending Bills Count */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                      <Receipt className="w-3 h-3" />
                      {debtor.unpaidBillsCount} {debtor.unpaidBillsCount === 1 ? 'Bill' : 'Bills'}
                    </span>
                  </td>

                  {/* Total Invoiced */}
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {formatCurrency(debtor.totalInvoiced, undefined, currencySymbol)}
                  </td>

                  {/* Total Paid */}
                  <td className="py-3.5 px-4 font-semibold text-emerald-700">
                    {formatCurrency(debtor.totalPaid, undefined, currencySymbol)}
                  </td>

                  {/* Total Amount Owed */}
                  <td className="py-3.5 px-4">
                    <span className="text-sm font-bold text-rose-600">
                      {formatCurrency(debtor.totalOwed, undefined, currencySymbol)}
                    </span>
                  </td>

                  {/* Oldest Debt Date */}
                  <td className="py-3.5 px-4 text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatDate(debtor.oldestUnpaidBillDate)}</span>
                    </div>
                  </td>

                  {/* Action Button */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDebtor(debtor);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-xs border border-indigo-200 transition-colors shadow-2xs"
                    >
                      <span>View What Patient Owes</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
        <span>
          Showing <strong>{filteredDebtors.length}</strong> debtor accounts
        </span>
        <span className="font-semibold text-rose-700">
          Total Filtered Debt: {formatCurrency(
            filteredDebtors.reduce((acc, curr) => acc + curr.totalOwed, 0),
            undefined,
            currencySymbol
          )}
        </span>
      </div>

    </div>
  );
};
