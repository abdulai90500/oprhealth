// Formatting Utilities for OpenMRS Finance Dashboard

export const formatCurrency = (
  amount: number | undefined | null,
  _currencyCode = 'NGN',
  symbol = '₦'
): string => {
  if (amount === undefined || amount === null || isNaN(amount)) return `${symbol}0.00`;
  return `${symbol}${amount.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatDate = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateTime = (dateStr?: string): string => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case 'PAID':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'PARTIALLY_PAID':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'PENDING':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    case 'EXEMPTED':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'VOIDED':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const exportToCSV = (filename: string, rows: object[]) => {
  if (!rows || !rows.length) return;
  const separator = ',';
  const keys = Object.keys(rows[0]);
  const csvContent =
    keys.join(separator) +
    '\n' +
    rows
      .map((row) => {
        return keys
          .map((k) => {
            const rawVal = (row as Record<string, unknown>)[k];
            let cellStr =
              rawVal === null || rawVal === undefined
                ? ''
                : typeof rawVal === 'object'
                ? JSON.stringify(rawVal)
                : String(rawVal);
            cellStr = cellStr.replace(/"/g, '""');
            if (cellStr.search(/("|,|\n)/g) >= 0) {
              cellStr = `"${cellStr}"`;
            }
            return cellStr;
          })
          .join(separator);
      })
      .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
