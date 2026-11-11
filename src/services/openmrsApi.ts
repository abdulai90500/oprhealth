import type { Bill } from '../types/billing';
import { generateMockBills } from '../data/mockData';

export interface SessionInfo {
  authenticated: boolean;
  user?: {
    uuid: string;
    display: string;
    username: string;
    roles?: Array<{ display: string; name: string }>;
  };
  sessionId?: string;
  serverUrl?: string;
}

export interface FetchBillsParams {
  startDate: string;
  endDate: string;
  useMock?: boolean;
  serverUrl?: string;
}

export const checkOpenMrsSession = async (baseUrl = ''): Promise<{ ok: boolean; session?: SessionInfo; error?: string }> => {
  try {
    const url = `${baseUrl}/openmrs/ws/rest/v1/session`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
      credentials: 'include',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}: ${res.statusText}` };
    }

    const data = await res.json();
    return {
      ok: true,
      session: {
        authenticated: Boolean(data.authenticated),
        user: data.user,
        sessionId: data.sessionId,
      },
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
};

export const fetchOpenMrsBills = async ({
  startDate,
  endDate,
  useMock = false,
  serverUrl = '',
}: FetchBillsParams): Promise<{ bills: Bill[]; isMock: boolean; error?: string }> => {
  // If explicitly requested mock mode, return mock data
  if (useMock) {
    const mock = generateMockBills().filter((b) => {
      const billDate = b.dateCreated?.split('T')[0] || '';
      return (!startDate || billDate >= startDate) && (!endDate || billDate <= endDate);
    });
    return { bills: mock, isMock: true };
  }

  // Attempt real OpenMRS REST API call
  try {
    const endpoint = `${serverUrl}/openmrs/ws/rest/v1/billing/bill?v=full&fromDate=${startDate}&toDate=${endDate}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include', // OpenMRS JSESSIONID cookie
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`OpenMRS API Error (${res.status} ${res.statusText})`);
    }

    const data = await res.json();
    const rawBills: unknown[] = data.results || (Array.isArray(data) ? data : []);

    // Transform and normalize OpenMRS raw bills
    const normalizedBills: Bill[] = rawBills.map((item: unknown, idx: number) => {
      const b = item as Record<string, unknown>;
      const patientRaw = (b.patient || {}) as Record<string, unknown>;
      const personRaw = (patientRaw.person || {}) as Record<string, unknown>;

      const patientName =
        typeof patientRaw.display === 'string'
          ? patientRaw.display
          : typeof personRaw.display === 'string'
          ? personRaw.display
          : `Patient #${idx + 1}`;

      const totalAmount = Number(b.totalAmount || b.amount || 0);
      const amountPaid = Number(b.amountPaid || b.paidAmount || 0);

      // Line items normalization
      const rawLineItems = Array.isArray(b.lineItems) ? b.lineItems : [];
      const lineItems = rawLineItems.map((li: unknown, liIdx: number) => {
        const itemObj = li as Record<string, unknown>;
        const itemName =
          typeof itemObj.item === 'string'
            ? itemObj.item
            : typeof (itemObj.item as Record<string, unknown>)?.display === 'string'
            ? ((itemObj.item as Record<string, unknown>).display as string)
            : `Service Item #${liIdx + 1}`;

        return {
          uuid: String(itemObj.uuid || `item-${liIdx}`),
          item: itemName,
          category: (itemObj.category as Bill['lineItems'] extends Array<infer T> ? (T extends { category?: infer C } ? C : never) : never) || 'General',
          quantity: Number(itemObj.quantity || 1),
          price: Number(itemObj.price || itemObj.unitPrice || 0),
          amount: Number(itemObj.amount || (Number(itemObj.quantity || 1) * Number(itemObj.price || 0))),
        };
      });

      return {
        uuid: String(b.uuid || `bill-${idx}`),
        billNumber: String(b.billNumber || b.identifier || `BILL-${b.uuid?.toString().slice(0, 8)}`),
        patient: {
          uuid: String(patientRaw.uuid || `patient-${idx}`),
          display: patientName,
          person: {
            display: patientName,
            gender: typeof personRaw.gender === 'string' ? personRaw.gender : undefined,
            age: typeof personRaw.age === 'number' ? personRaw.age : undefined,
          },
          phoneNumber: typeof patientRaw.phoneNumber === 'string' ? patientRaw.phoneNumber : undefined,
        },
        dateCreated: String(b.dateCreated || b.dateBilled || new Date().toISOString()),
        dateBilled: String(b.dateBilled || b.dateCreated || new Date().toISOString()),
        cashPoint: String(b.cashPoint || 'Main Cashier'),
        cashier: String(b.cashier || 'Cashier'),
        totalAmount,
        amountPaid,
        status: (b.status as Bill['status']) || (amountPaid >= totalAmount ? 'PAID' : amountPaid > 0 ? 'PARTIALLY_PAID' : 'PENDING'),
        lineItems,
        payments: Array.isArray(b.payments) ? (b.payments as Bill['payments']) : [],
      };
    });

    return { bills: normalizedBills, isMock: false };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn(`[OpenMRS API] Failed to connect to live OpenMRS endpoint: ${errorMsg}. Falling back to demo dataset.`);

    // Gracefully fallback to realistic mock data so user is never faced with a broken screen
    const mock = generateMockBills().filter((b) => {
      const billDate = b.dateCreated?.split('T')[0] || '';
      return (!startDate || billDate >= startDate) && (!endDate || billDate <= endDate);
    });

    return {
      bills: mock,
      isMock: true,
      error: `Live OpenMRS unreachable (${errorMsg}). Displaying simulated hospital billing data for demonstration.`,
    };
  }
};
