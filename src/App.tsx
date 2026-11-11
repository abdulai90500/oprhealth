import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Bill, DailySummary, DebtorSummary, FinanceSummaryMetrics } from './types/billing';
import { fetchOpenMrsBills } from './services/openmrsApi';
import { Header } from './components/Header';
import { DateRangeFilter } from './components/DateRangeFilter';
import { KpiCards } from './components/KpiCards';
import { FinancialCharts } from './components/FinancialCharts';
import { DebtorList } from './components/DebtorList';
import { DailyBreakdownTable } from './components/DailyBreakdownTable';
import { PatientDebtModal } from './components/PatientDebtModal';
import { IntegrationGuideModal } from './components/IntegrationGuideModal';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  // State
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState<boolean>(false);
  const [currencySymbol, setCurrencySymbol] = useState<string>('₦');
  const [selectedDebtor, setSelectedDebtor] = useState<DebtorSummary | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activePreset, setActivePreset] = useState<string>('last30');

  // Date filters
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Handle Preset selection
  const handleSelectPreset = (preset: string) => {
    setActivePreset(preset);
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'yesterday') {
      const y = new Date(today);
      y.setDate(today.getDate() - 1);
      const yStr = y.toISOString().split('T')[0];
      setStartDate(yStr);
      setEndDate(yStr);
    } else if (preset === 'last7') {
      const d7 = new Date(today);
      d7.setDate(today.getDate() - 7);
      setStartDate(d7.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'last30') {
      const d30 = new Date(today);
      d30.setDate(today.getDate() - 30);
      setStartDate(d30.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'thisMonth') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(todayStr);
    } else if (preset === 'all') {
      setStartDate('2020-01-01');
      setEndDate(todayStr);
    }
  };

  // Fetch billing data
  const loadBillingData = useCallback(async (forcedMock?: boolean) => {
    setLoading(true);
    setApiError(null);
    try {
      const targetMock = forcedMock !== undefined ? forcedMock : isMock;
      const res = await fetchOpenMrsBills({
        startDate,
        endDate,
        useMock: targetMock,
      });

      setBills(res.bills);
      setIsMock(res.isMock);
      if (res.error) {
        setApiError(res.error);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, isMock]);

  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  // Aggregate metrics, daily breakdown, and debtor list
  const { metrics, dailyBreakdown, debtorList, filteredBills } = useMemo(() => {
    let paidSum = 0;
    let owedSum = 0;
    let invoicedSum = 0;
    let exemptedSum = 0;
    let validBillsCount = 0;

    const dailyMap: Record<
      string,
      { count: number; invoiced: number; paid: number; owed: number }
    > = {};
    const debtorMap: Record<string, DebtorSummary> = {};

    // Filter bills by status filter
    const visibleBills = bills.filter((b) => {
      if (statusFilter === 'ALL') return true;
      if (statusFilter === 'UNPAID_ONLY') {
        const owed = (b.totalAmount || 0) - (b.amountPaid || 0);
        return owed > 0 && b.status !== 'EXEMPTED' && b.status !== 'VOIDED';
      }
      return b.status === statusFilter;
    });

    bills.forEach((bill) => {
      if (bill.status === 'VOIDED') return;

      const total = bill.totalAmount || 0;
      const paid = bill.amountPaid || 0;
      const owed = Math.max(0, total - paid);
      const isExempted = bill.status === 'EXEMPTED';

      validBillsCount++;
      invoicedSum += total;
      paidSum += paid;

      if (isExempted) {
        exemptedSum += total;
      } else {
        owedSum += owed;
      }

      // Group by Day (YYYY-MM-DD)
      const dateKey = bill.dateCreated?.split('T')[0] || 'Unknown';
      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { count: 0, invoiced: 0, paid: 0, owed: 0 };
      }
      dailyMap[dateKey].count += 1;
      dailyMap[dateKey].invoiced += total;
      dailyMap[dateKey].paid += paid;
      if (!isExempted) {
        dailyMap[dateKey].owed += owed;
      }

      // Group Debtor list (only if they owe money and not exempted)
      if (owed > 0 && !isExempted && bill.patient) {
        const pUuid = bill.patient.uuid || 'unknown-uuid';
        const pName = bill.patient.display || bill.patient.person?.display || 'Unknown Patient';
        const pId = bill.patient.identifiers?.[0]?.identifier;
        const billDate = bill.dateCreated?.split('T')[0] || dateKey;

        if (!debtorMap[pUuid]) {
          debtorMap[pUuid] = {
            patientUuid: pUuid,
            patientName: pName,
            patientIdentifier: pId,
            gender: bill.patient.person?.gender,
            age: bill.patient.person?.age,
            phoneNumber: bill.patient.phoneNumber,
            totalInvoiced: 0,
            totalPaid: 0,
            totalOwed: 0,
            unpaidBillsCount: 0,
            oldestUnpaidBillDate: billDate,
            latestBillDate: billDate,
            unpaidBills: [],
          };
        }

        debtorMap[pUuid].totalInvoiced += total;
        debtorMap[pUuid].totalPaid += paid;
        debtorMap[pUuid].totalOwed += owed;
        debtorMap[pUuid].unpaidBillsCount += 1;
        debtorMap[pUuid].unpaidBills.push(bill);

        if (billDate < debtorMap[pUuid].oldestUnpaidBillDate) {
          debtorMap[pUuid].oldestUnpaidBillDate = billDate;
        }
        if (billDate > debtorMap[pUuid].latestBillDate) {
          debtorMap[pUuid].latestBillDate = billDate;
        }
      }
    });

    // Sort Daily Breakdown chronologically
    const dailyBreakdown: DailySummary[] = Object.keys(dailyMap)
      .sort()
      .map((date) => {
        const item = dailyMap[date];
        const rate = item.invoiced > 0 ? (item.paid / item.invoiced) * 100 : 0;
        return {
          date,
          billsCount: item.count,
          totalInvoiced: item.invoiced,
          totalPaid: item.paid,
          totalOwed: item.owed,
          collectionRate: rate,
        };
      });

    // Sort Debtors by highest owed descending
    const debtorList: DebtorSummary[] = Object.values(debtorMap).sort(
      (a, b) => b.totalOwed - a.totalOwed
    );

    const activeDebtorsCount = debtorList.length;
    const avgDebtPerDebtor = activeDebtorsCount > 0 ? owedSum / activeDebtorsCount : 0;
    const collectionRate = invoicedSum > 0 ? (paidSum / invoicedSum) * 100 : 0;

    const summaryMetrics: FinanceSummaryMetrics = {
      totalPaid: paidSum,
      totalOwed: owedSum,
      totalInvoiced: invoicedSum,
      totalBills: validBillsCount,
      activeDebtorsCount,
      collectionRate,
      avgDebtPerDebtor,
      exemptedAmount: exemptedSum,
    };

    return {
      metrics: summaryMetrics,
      dailyBreakdown,
      debtorList,
      filteredBills: visibleBills,
    };
  }, [bills, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <Header
        isMock={isMock}
        onToggleMock={() => {
          const next = !isMock;
          setIsMock(next);
          loadBillingData(next);
        }}
        onRefresh={() => loadBillingData()}
        loading={loading}
        currencySymbol={currencySymbol}
        onCurrencyChange={setCurrencySymbol}
        onOpenGuide={() => setShowGuide(true)}
        apiError={apiError || undefined}
      />

      {/* Main Dashboard Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Error Notification if any */}
        {apiError && !isMock && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="font-semibold block text-sm">Failed to connect to OpenMRS REST API</strong>
              <p className="mt-1">{apiError}</p>
              <div className="mt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsMock(true);
                    loadBillingData(true);
                  }}
                  className="font-bold underline hover:text-rose-950"
                >
                  Switch to Demo Hospital Data
                </button>
                <span>•</span>
                <button
                  onClick={() => setShowGuide(true)}
                  className="font-bold underline hover:text-rose-950"
                >
                  View Nginx / Proxy Setup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Date Filter Bar */}
        <DateRangeFilter
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={(val) => {
            setStartDate(val);
            setActivePreset('custom');
          }}
          onEndDateChange={(val) => {
            setEndDate(val);
            setActivePreset('custom');
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          activePreset={activePreset}
          onSelectPreset={handleSelectPreset}
        />

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-500 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-sm font-medium">Querying OpenMRS Billing Ledger (/openmrs/ws/rest/v1/billing/bill)...</p>
          </div>
        ) : (
          <>
            {/* 1. Executive Metric KPI Cards */}
            <KpiCards metrics={metrics} currencySymbol={currencySymbol} />

            {/* 2. Visual Analytics & Department Breakdown */}
            <FinancialCharts
              dailyData={dailyBreakdown}
              bills={filteredBills}
              currencySymbol={currencySymbol}
            />

            {/* 3. Debtor List (Patients with Pending/Unpaid Bills) */}
            <DebtorList
              debtors={debtorList}
              onSelectDebtor={(debtor) => setSelectedDebtor(debtor)}
              currencySymbol={currencySymbol}
            />

            {/* 4. Daily Pay & Owed Breakdown Table */}
            <DailyBreakdownTable
              dailySummaries={dailyBreakdown}
              currencySymbol={currencySymbol}
            />
          </>
        )}
      </main>

      {/* Patient Specific Debt Details Modal */}
      <PatientDebtModal
        debtor={selectedDebtor}
        onClose={() => setSelectedDebtor(null)}
        currencySymbol={currencySymbol}
      />

      {/* Implementation & Deployment Run Down Guide Modal */}
      <IntegrationGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>OpenMRS 3.x Billing &amp; Finance Integration • Hayok Medicare Hospital</span>
          <span className="font-mono text-2xs text-slate-400">REST API: /openmrs/ws/rest/v1/billing/bill</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
