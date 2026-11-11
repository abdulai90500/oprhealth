import type { Bill } from '../types/billing';

export const generateMockBills = (): Bill[] => {
  const today = new Date();
  const bills: Bill[] = [];

  const patients = [
    {
      uuid: 'p-1001-uuid',
      display: 'Babatunde Adeleke (HAY-2024-0012)',
      identifier: 'HAY-2024-0012',
      gender: 'M',
      age: 42,
      phone: '+234 803 123 4567',
    },
    {
      uuid: 'p-1002-uuid',
      display: 'Fatima Abubakar (HAY-2024-0089)',
      identifier: 'HAY-2024-0089',
      gender: 'F',
      age: 28,
      phone: '+234 802 987 6543',
    },
    {
      uuid: 'p-1003-uuid',
      display: 'Chinedu Eze (HAY-2023-9941)',
      identifier: 'HAY-2023-9941',
      gender: 'M',
      age: 56,
      phone: '+234 814 555 1212',
    },
    {
      uuid: 'p-1004-uuid',
      display: 'Ngozi Okonjo (HAY-2024-0155)',
      identifier: 'HAY-2024-0155',
      gender: 'F',
      age: 34,
      phone: '+234 701 443 8901',
    },
    {
      uuid: 'p-1005-uuid',
      display: 'Amina Yusuf (HAY-2024-0203)',
      identifier: 'HAY-2024-0203',
      gender: 'F',
      age: 22,
      phone: '+234 818 221 9900',
    },
    {
      uuid: 'p-1006-uuid',
      display: 'Ibrahim Danladi (HAY-2023-8842)',
      identifier: 'HAY-2023-8842',
      gender: 'M',
      age: 63,
      phone: '+234 805 771 2345',
    },
    {
      uuid: 'p-1007-uuid',
      display: 'Olawale Balogun (HAY-2024-0310)',
      identifier: 'HAY-2024-0310',
      gender: 'M',
      age: 38,
      phone: '+234 809 332 1109',
    },
    {
      uuid: 'p-1008-uuid',
      display: 'Grace Adeyemi (HAY-2024-0412)',
      identifier: 'HAY-2024-0412',
      gender: 'F',
      age: 31,
      phone: '+234 812 667 8899',
    },
    {
      uuid: 'p-1009-uuid',
      display: 'Emeka Nwosu (HAY-2024-0550)',
      identifier: 'HAY-2024-0550',
      gender: 'M',
      age: 49,
      phone: '+234 806 889 0012',
    },
    {
      uuid: 'p-1010-uuid',
      display: 'Halima Sadiq (HAY-2024-0618)',
      identifier: 'HAY-2024-0618',
      gender: 'F',
      age: 19,
      phone: '+234 703 112 3344',
    },
  ];

  const cashPoints = ['Main Cashier', 'Pharmacy Counter', 'Emergency Desk', 'Outpatient Desk'];
  const cashiers = ['Cashier A. Bello', 'Cashier M. Okafor', 'Cashier T. Alabi'];

  // Seed structured bills across last 25 days
  let billSeq = 10001;

  for (let dayOffset = 24; dayOffset >= 0; dayOffset--) {
    const billDate = new Date(today);
    billDate.setDate(today.getDate() - dayOffset);
    const dateStr = billDate.toISOString().split('T')[0];

    // 2-5 bills per day
    const billsForDayCount = 2 + ((dayOffset * 7 + 3) % 4);

    for (let i = 0; i < billsForDayCount; i++) {
      const pIdx = (dayOffset * 3 + i) % patients.length;
      const patient = patients[pIdx];
      billSeq++;

      const billTypeRoll = (dayOffset + i * 2) % 6;
      let status: 'PAID' | 'PARTIALLY_PAID' | 'PENDING' | 'EXEMPTED' | 'VOIDED' = 'PAID';
      let total = 0;
      let paid = 0;
      let lineItems: Bill['lineItems'] = [];

      if (billTypeRoll === 0) {
        // High inpatient bill - partial payment or debt
        status = 'PARTIALLY_PAID';
        lineItems = [
          { uuid: `li-${billSeq}-1`, item: 'Admission & Bed Fee (3 nights)', category: 'Ward', quantity: 3, price: 15000, amount: 45000 },
          { uuid: `li-${billSeq}-2`, item: 'IV Ceftriaxone 1g Vial', category: 'Pharmacy', quantity: 6, price: 4500, amount: 27000 },
          { uuid: `li-${billSeq}-3`, item: 'Nursing Care Daily Plan', category: 'General', quantity: 3, price: 5000, amount: 15000 },
          { uuid: `li-${billSeq}-4`, item: 'Full Blood Count (FBC)', category: 'Laboratory', quantity: 2, price: 4000, amount: 8000 },
        ];
        total = 95000;
        paid = 40000; // owes 55,000
      } else if (billTypeRoll === 1) {
        // Pending unpaid bill
        status = 'PENDING';
        lineItems = [
          { uuid: `li-${billSeq}-1`, item: 'Specialist Consultation Fee', category: 'Consultation', quantity: 1, price: 12000, amount: 12000 },
          { uuid: `li-${billSeq}-2`, item: 'Pelvic Ultrasound Scan', category: 'Radiology', quantity: 1, price: 18000, amount: 18000 },
          { uuid: `li-${billSeq}-3`, item: 'Urine Culture & Sensitivity', category: 'Laboratory', quantity: 1, price: 7500, amount: 7500 },
        ];
        total = 37500;
        paid = 0; // owes 37,500
      } else if (billTypeRoll === 2) {
        // Fully paid bill (routine outpatient)
        status = 'PAID';
        lineItems = [
          { uuid: `li-${billSeq}-1`, item: 'General Outpatient Consultation', category: 'Consultation', quantity: 1, price: 5000, amount: 5000 },
          { uuid: `li-${billSeq}-2`, item: 'Malaria Parasite RDT Test', category: 'Laboratory', quantity: 1, price: 2500, amount: 2500 },
          { uuid: `li-${billSeq}-3`, item: 'Artemether/Lumefantrine Tab', category: 'Pharmacy', quantity: 1, price: 3800, amount: 3800 },
          { uuid: `li-${billSeq}-4`, item: 'Paracetamol 500mg (10 tabs)', category: 'Pharmacy', quantity: 2, price: 500, amount: 1000 },
        ];
        total = 12300;
        paid = 12300;
      } else if (billTypeRoll === 3) {
        // Higher bill - partially paid surgery/procedure
        status = 'PARTIALLY_PAID';
        lineItems = [
          { uuid: `li-${billSeq}-1`, item: 'Minor Surgical Procedure / Wound Debridement', category: 'Procedure', quantity: 1, price: 65000, amount: 65000 },
          { uuid: `li-${billSeq}-2`, item: 'Tetanus Toxoid + Anti-tetanus Serum', category: 'Pharmacy', quantity: 1, price: 8500, amount: 8500 },
          { uuid: `li-${billSeq}-3`, item: 'Sterile Dressing Pack & Bandages', category: 'General', quantity: 3, price: 3000, amount: 9000 },
        ];
        total = 82500;
        paid = 30000; // owes 52,500
      } else if (billTypeRoll === 4) {
        // Maternal/child exemption bill
        status = 'EXEMPTED';
        lineItems = [
          { uuid: `li-${billSeq}-1`, item: 'Antenatal Clinical Evaluation', category: 'Consultation', quantity: 1, price: 4000, amount: 4000 },
          { uuid: `li-${billSeq}-2`, item: 'Routine Antenatal Folate & Iron Supplements', category: 'Pharmacy', quantity: 1, price: 2000, amount: 2000 },
        ];
        total = 6000;
        paid = 0;
      } else {
        // Standard fully paid pharmacy / lab
        status = 'PAID';
        lineItems = [
          { uuid: `li-${billSeq}-1`, item: 'Comprehensive Metabolic Panel (CMP)', category: 'Laboratory', quantity: 1, price: 16500, amount: 16500 },
          { uuid: `li-${billSeq}-2`, item: 'Chest X-Ray Digital', category: 'Radiology', quantity: 1, price: 14000, amount: 14000 },
        ];
        total = 30500;
        paid = 30500;
      }

      bills.push({
        uuid: `bill-${billSeq}-uuid`,
        billNumber: `BILL-${dateStr.replace(/-/g, '')}-${billSeq}`,
        dateCreated: `${dateStr}T${10 + (i % 8)}:${15 + (i * 12) % 45}:00Z`,
        dateBilled: `${dateStr}T${10 + (i % 8)}:${15 + (i * 12) % 45}:00Z`,
        cashPoint: cashPoints[(i + dayOffset) % cashPoints.length],
        cashier: cashiers[i % cashiers.length],
        patient: {
          uuid: patient.uuid,
          display: patient.display,
          identifiers: [{ identifier: patient.identifier }],
          person: {
            display: patient.display,
            gender: patient.gender,
            age: patient.age,
          },
          phoneNumber: patient.phone,
        },
        totalAmount: total,
        amountPaid: paid,
        status: status,
        lineItems: lineItems,
        payments:
          paid > 0
            ? [
                {
                  uuid: `pay-${billSeq}-1`,
                  amount: paid,
                  paymentMode: (['CASH', 'POS', 'MOBILE_MONEY', 'BANK_TRANSFER'] as const)[
                    (i + dayOffset) % 4
                  ],
                  cashierName: cashiers[i % cashiers.length],
                  cashPoint: cashPoints[(i + dayOffset) % cashPoints.length],
                  dateCreated: `${dateStr}T${11 + (i % 7)}:30:00Z`,
                  transactionReference: `TXN-${billSeq}-REV`,
                },
              ]
            : [],
        exemptionReason: status === 'EXEMPTED' ? 'National Maternal & Child Health Care Waiver' : undefined,
        visitType: i % 2 === 0 ? 'Outpatient (OPD)' : 'Inpatient (IPD)',
      });
    }
  }

  return bills;
};
