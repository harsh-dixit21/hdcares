import { reportStatuses, type ReportNote } from './report-notes.ts';

export type StatusFilter = 'All statuses' | ReportNote['status'];

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
