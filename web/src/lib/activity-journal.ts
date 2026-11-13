import { validObservationDate } from './report-date.ts';

export const activityTypes = ['Protection', 'Reporting', 'Support', 'Other'] as const;
export type ActivityType = typeof activityTypes[number];
export type ActivityEntry = { id: string; day: string; text: string; type?: ActivityType; pinned?: boolean };
export const MAX_ACTIVITIES = 250;

export const MAX_JOURNAL_BACKUP_BYTES = 2_000_000;

export function createActivityBackup(entries: ActivityEntry[]): string {
  return JSON.stringify({ format: 'hdcares-journal', version: 1, entries });
}

export function readActivityBackup(text: string): ActivityEntry[] {
  if (new TextEncoder().encode(text).length > MAX_JOURNAL_BACKUP_BYTES) throw new Error('Journal file is too large.');
  const data = JSON.parse(text);
  if (data?.format !== 'hdcares-journal' || data.version !== 1 || !Array.isArray(data.entries) ||
      data.entries.length > MAX_ACTIVITIES) throw new Error('Unsupported journal backup.');
  return data.entries.map((entry: Record<string, unknown>) => {
    if (!entry || typeof entry.id !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(entry.id) ||
        typeof entry.text !== 'string' || !entry.text.trim() || entry.text.length > 1000 ||
        typeof entry.day !== 'string' || !entry.day || !validObservationDate(entry.day, '9999-12-31')) throw new Error('Invalid activity.');
    const type = activityTypes.find(item => item === entry.type);
    if (entry.type !== undefined && !type) throw new Error('Invalid activity category.');
    if (entry.pinned !== undefined && typeof entry.pinned !== "boolean") throw new Error("Invalid pin.");
    return { pinned: entry.pinned, id: entry.id.toLowerCase(), text: entry.text, day: entry.day, type };
  });
}

export function mergeActivityBackup(current: ActivityEntry[], incoming: ActivityEntry[]): ActivityEntry[] {
  const merged = new Map(current.map(entry => [entry.id, entry]));
  for (const entry of incoming) if (!merged.has(entry.id)) merged.set(entry.id, entry);
  return merged.size > MAX_ACTIVITIES ? current : [...merged.values()];
}

export function activityTimeline(entries: ActivityEntry[]): string {
  return entries.map(entry => [entry.day, entry.type, entry.text].filter(Boolean).join(' — ')).join('\n\n');
}
