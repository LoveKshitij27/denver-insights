import * as XLSX from "xlsx";

export interface Insights {
  fileName: string;
  rowCount: number;
  reasonColumn: string | null;
  dateColumn: string | null;
  rows: { reason: string; date: string | null }[];
  minDate: string | null;
  maxDate: string | null;
}

function findReasonColumn(headers: string[]): string | null {
  for (const h of headers) {
    const norm = h.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (/(returnreason|reason)/.test(norm)) return h;
  }
  return null;
}

function findOrderDateColumn(headers: string[]): string | null {
  for (const h of headers) {
    const norm = h.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (/(orderdate|dateoforder|purchasedate|transactiondate)/.test(norm))
      return h;
  }
  for (const h of headers) {
    const norm = h.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (/date/.test(norm) && !/return/.test(norm)) return h;
  }
  return null;
}

function toIsoDate(v: unknown): string | null {
  let d: Date | null = null;
  if (v instanceof Date) d = v;
  else if (typeof v === "string" && v.trim() !== "") d = new Date(v);
  else if (typeof v === "number") d = new Date((v - 25569) * 86400 * 1000);
  if (!d || Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function parseFile(file: File): Promise<Insights> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array", cellDates: true });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  if (!sheet) return empty(file.name);

  const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, {
    defval: null,
  });
  if (rawRows.length === 0) return empty(file.name);

  const headers = Object.keys(rawRows[0]);
  const reasonColumn = findReasonColumn(headers);
  const dateColumn = findOrderDateColumn(headers);

  const rows = rawRows.map((r) => ({
    reason: reasonColumn ? String(r[reasonColumn] ?? "").trim() : "",
    date: dateColumn ? toIsoDate(r[dateColumn]) : null,
  }));

  let minDate: string | null = null;
  let maxDate: string | null = null;
  for (const r of rows) {
    if (!r.date) continue;
    if (!minDate || r.date < minDate) minDate = r.date;
    if (!maxDate || r.date > maxDate) maxDate = r.date;
  }

  return {
    fileName: file.name,
    rowCount: rawRows.length,
    reasonColumn,
    dateColumn,
    rows,
    minDate,
    maxDate,
  };
}

function empty(fileName: string): Insights {
  return {
    fileName,
    rowCount: 0,
    reasonColumn: null,
    dateColumn: null,
    rows: [],
    minDate: null,
    maxDate: null,
  };
}
