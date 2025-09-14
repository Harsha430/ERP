// Simple CSV export utility
export function exportToCSV(filename: string, rows: any[], headers?: string[]) {
  if (!rows || !rows.length) return;
  const keys = headers && headers.length ? headers : Object.keys(rows[0]);
  const esc = (val: any) => {
    if (val === null || val === undefined) return '';
    const s = String(val).replace(/"/g,'""');
    if (/[",\n]/.test(s)) return `"${s}"`;
    return s;
  };
  const csv = [keys.join(',')].concat(rows.map(r => keys.map(k => esc(r[k])).join(','))).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

