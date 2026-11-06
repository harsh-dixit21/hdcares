import { reportStatuses, type ReportNote } from './report-notes.ts';

export type StatusFilter = 'All statuses' | ReportNote['status'];
export type ReportSort = 'Added order' | 'Newest observed' | 'Oldest observed' | 'Platform';

export function sortReportNotes(notes: ReportNote[], order: ReportSort): ReportNote[] {
  return [...notes].sort((a, b) => {
    if (order === 'Platform') return a.platform.localeCompare(b.platform);
    if (order === 'Added order') return 0;
    if (!a.date) return b.date ? 1 : 0;
    if (!b.date) return -1;
    return order === 'Newest observed' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
  });
}

export function filterReportNotes(notes: ReportNote[], query: string, status: StatusFilter): ReportNote[] {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return notes.filter(note => {
    if (status !== 'All statuses' && note.status !== status) return false;
    const text = [note.platform, note.url, note.reference, note.date].join(' ').toLowerCase();
    return words.every(word => text.includes(word));
  });
}

export function reportStatusCounts(notes: ReportNote[]): Record<ReportNote['status'], number> {
  const counts = Object.fromEntries(reportStatuses.map(status => [status, 0])) as Record<ReportNote['status'], number>;
  for (const note of notes) counts[note.status]++;
  return counts;
}
