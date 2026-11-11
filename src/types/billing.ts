// OpenMRS 3.x Billing Types & Interfaces

export interface PatientPerson {
  uuid?: string;
  display: string;
  gender?: string;
  age?: number;
  birthdate?: string;
}

export interface PatientIdentifier {
  identifier: string;
  identifierType?: {
    display: string;
  };
}

export interface Patient {
  uuid: string;
  display: string;
  identifiers?: PatientIdentifier[];
  person?: PatientPerson;
  phoneNumber?: string;
}

export interface BillLineItem {
  uuid: string;
  item: string;
  category?: 'Laboratory' | 'Pharmacy' | 'Consultation' | 'Radiology' | 'Procedure' | 'Ward' | 'General';
  quantity: number;
  price: number;
  amount: number;
  status?: string;
}

export interface PaymentLedgerEntry {
  uuid: string;
  amount: number;
  paymentMode: 'CASH' | 'MOBILE_MONEY' | 'BANK_TRANSFER' | 'INSURANCE' | 'VOUCHER' | 'POS';
  transactionReference?: string;
  cashierName?: string;
  cashPoint?: string;
  dateCreated: string;
}

export type BillStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'EXEMPTED' | 'VOIDED';

export interface Bill {
  uuid: string;
  billNumber: string;
  patient: Patient;
  dateCreated: string;
  dateBilled?: string;
  cashPoint?: string;
  cashier?: string;
  totalAmount: number;
  amountPaid: number;
  status: BillStatus;
  lineItems?: BillLineItem[];
  payments?: PaymentLedgerEntry[];
  exemptionReason?: string;
  visitType?: string;
}

export interface DailySummary {
  date: string;
  billsCount: number;
  totalInvoiced: number;
  totalPaid: number;
  totalOwed: number;
  collectionRate: number;
}

export interface DebtorSummary {
  patientUuid: string;
  patientName: string;
  patientIdentifier?: string;
  gender?: string;
  age?: number;
  phoneNumber?: string;
  totalInvoiced: number;
  totalPaid: number;
  totalOwed: number;
  unpaidBillsCount: number;
  oldestUnpaidBillDate: string;
  latestBillDate: string;
  unpaidBills: Bill[];
}

export interface FinanceSummaryMetrics {
  totalPaid: number;
  totalOwed: number;
  totalInvoiced: number;
  totalBills: number;
  activeDebtorsCount: number;
  collectionRate: number;
  avgDebtPerDebtor: number;
  exemptedAmount: number;
}

