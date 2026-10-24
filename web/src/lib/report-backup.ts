import { reportStatuses, validateReportUrl, type ReportNote } from './report-notes.ts';

export const MAX_BACKUP_BYTES = 4_000_000;
export const MAX_REPORT_NOTES = 500;

export function createReportBackup(notes: ReportNote[]): string {
  return JSON.stringify({ format: 'hdcares-report-notes', version: 1,
    notes: notes.map(({ id: _id, ...note }) => note) }, null, 2);
}

export function parseReportBackup(text: string): ReportNote[] {
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES) throw new Error('Backup files must be smaller than 4 MB.');
  let value: unknown;
  try { value = JSON.parse(text); } catch { throw new Error('This file is not valid JSON. Choose an HD Cares JSON backup.'); }
  if (!value || typeof value !== 'object') throw new Error('Choose an HD Cares JSON backup.');
  const data = value as Record<string, unknown>;
  if (data.format !== 'hdcares-report-notes' || data.version !== 1 || !Array.isArray(data.notes)) throw new Error('This backup format or version is not supported.');
  if (data.notes.length > MAX_REPORT_NOTES) throw new Error('A backup can contain at most 500 locations.');
  return data.notes.map((item: unknown, index: number) => {
    const invalid = () => new Error(`Location ${index + 1} has invalid fields. No notes were restored.`);
    if (!item || typeof item !== 'object') throw invalid();
    const row = item as Record<string, unknown>;
    for (const [key, limit] of [['url', 4000], ['platform', 100], ['date', 10], ['reference', 200]] as const) {
      if (typeof row[key] !== 'string' || (row[key] as string).length > limit) throw invalid();
    }
    const url = validateReportUrl(row.url as string);
    const date = row.date as string;
    if (!url || !(reportStatuses as readonly unknown[]).includes(row.status)) throw invalid();
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date)) throw invalid();
    return { id: crypto.randomUUID(), url, platform: (row.platform as string).trim() || new URL(url).hostname,
      date, reference: row.reference as string, status: row.status as ReportNote['status'] };
  });
}

/** Preserve current notes and skip duplicate normalized URLs from any backup. */
export function mergeReportNotes(current: ReportNote[], incoming: ReportNote[]): ReportNote[] {
  const urls = new Set(current.map(note => note.url));
  const merged = [...current];
  for (const note of incoming) if (!urls.has(note.url)) { urls.add(note.url); merged.push(note); }
  if (merged.length > MAX_REPORT_NOTES) throw new Error('This would exceed 500 locations. Clear some notes before restoring.');
  return merged;
}
