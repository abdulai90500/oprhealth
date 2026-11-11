import React from 'react';
import type { DebtorSummary, Bill } from '../types/billing';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../utils/formatters';
import { 
  X, 
  Printer, 
  User, 
  CreditCard, 
  Receipt, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface PatientDebtModalProps {
  debtor: DebtorSummary | null;
  onClose: () => void;
  currencySymbol: string;
}

export const PatientDebtModal: React.FC<PatientDebtModalProps> = ({
  debtor,
  onClose,
  currencySymbol,
}) => {
  if (!debtor) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-rose-400 border border-white/10">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xs uppercase tracking-wider font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded">
                  Patient Debt Statement
                </span>
                {debtor.patientIdentifier && (
                  <span className="text-xs text-slate-300 font-mono">
                    ID: {debtor.patientIdentifier}
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                {debtor.patientName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-colors text-xs flex items-center gap-1.5"
              title="Print Statement"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print Statement</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Patient Financial Summary Strip */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          
          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-2xs uppercase font-medium">Total Outstanding</span>
            <div className="text-base font-bold text-rose-600 mt-0.5">
              {formatCurrency(debtor.totalOwed, undefined, currencySymbol)}
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-2xs uppercase font-medium">Total Billed</span>
            <div className="text-base font-bold text-slate-800 mt-0.5">
              {formatCurrency(debtor.totalInvoiced, undefined, currencySymbol)}
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-2xs uppercase font-medium">Total Paid to Date</span>
            <div className="text-base font-bold text-emerald-600 mt-0.5">
              {formatCurrency(debtor.totalPaid, undefined, currencySymbol)}
            </div>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-2xs uppercase font-medium">Unpaid Bills Count</span>
            <div className="text-base font-bold text-indigo-600 mt-0.5">
              {debtor.unpaidBillsCount} Invoices
            </div>
          </div>

        </div>

        {/* Scrollable Bills & Line Items Section */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-indigo-600" />
              Itemized Invoice &amp; Debt Breakdown
            </h3>
            <span className="text-xs text-slate-500">
              {debtor.unpaidBills.length} pending bill(s)
            </span>
          </div>

          {debtor.unpaidBills.map((bill: Bill, bIdx: number) => {
            const billOwed = Math.max(0, (bill.totalAmount || 0) - (bill.amountPaid || 0));

            return (
              <div 
                key={bill.uuid || bIdx}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs"
              >
                {/* Bill Header */}
                <div className="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900">
                      Bill #{bill.billNumber}
                    </span>
                    <span className={`text-2xs font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeClass(bill.status)}`}>
                      {bill.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(bill.dateCreated)}
                    </span>
                    {bill.cashPoint && (
                      <span className="hidden sm:inline bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-2xs">
                        {bill.cashPoint}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bill Line Items Table */}
                <div className="p-4">
                  {bill.lineItems && bill.lineItems.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs mb-3">
                        <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                          <tr>
                            <th className="py-2 px-3">Service / Medication / Procedure</th>
                            <th className="py-2 px-3">Department</th>
                            <th className="py-2 px-3 text-center">Qty</th>
                            <th className="py-2 px-3 text-right">Unit Price</th>
                            <th className="py-2 px-3 text-right">Line Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bill.lineItems.map((item, idx) => (
                            <tr key={item.uuid || idx} className="hover:bg-slate-50/50">
                              <td className="py-2 px-3 font-medium text-slate-800">
                                {item.item}
                              </td>
                              <td className="py-2 px-3 text-slate-500">
                                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-2xs">
                                  {item.category || 'General'}
                                </span>
                              </td>
                              <td className="py-2 px-3 text-center text-slate-600">
                                {item.quantity}
                              </td>
                              <td className="py-2 px-3 text-right text-slate-600">
                                {formatCurrency(item.price, undefined, currencySymbol)}
                              </td>
                              <td className="py-2 px-3 text-right font-semibold text-slate-900">
                                {formatCurrency(item.amount, undefined, currencySymbol)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic mb-2">
                      No itemized line items recorded for this bill.
                    </p>
                  )}

                  {/* Bill Subtotal Footer */}
                  <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-slate-500 text-2xs">Total Invoiced:</span>
                        <div className="font-semibold text-slate-900">
                          {formatCurrency(bill.totalAmount, undefined, currencySymbol)}
                        </div>
                      </div>
                      <div className="border-l border-slate-200 pl-3">
                        <span className="text-slate-500 text-2xs">Amount Paid:</span>
                        <div className="font-semibold text-emerald-700">
                          {formatCurrency(bill.amountPaid, undefined, currencySymbol)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-rose-600 font-bold text-2xs uppercase">Balance Still Owed:</span>
                      <div className="text-base font-extrabold text-rose-600">
                        {formatCurrency(billOwed, undefined, currencySymbol)}
                      </div>
                    </div>
                  </div>

                  {/* Previous Payments list if any */}
                  {bill.payments && bill.payments.length > 0 && (
                    <div className="mt-3 text-2xs text-slate-500 border-t border-slate-100 pt-2 flex flex-wrap gap-2 items-center">
                      <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-600">Payment Ledger:</span>
                      {bill.payments.map((p, pIdx) => (
                        <span key={p.uuid || pIdx} className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-mono">
                          {formatCurrency(p.amount, undefined, currencySymbol)} via {p.paymentMode} ({formatDate(p.dateCreated)})
                        </span>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>OpenMRS Patient UUID: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">{debtor.patientUuid}</code></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-2xs"
            >
              Close Ledger
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
