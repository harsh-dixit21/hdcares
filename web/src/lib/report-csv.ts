import type { ReportNote } from './report-notes.ts';
export function reportCsv(notes: ReportNote[]): string {
  const cell = (value: string) => {
    const safe = /^[\s]*[=+@-]/.test(value) ? "'" + value : value;
    return '"' + safe.replace(/"/g, '""') + '"';
  };
  return [['Platform', 'URL', 'Observed', 'Reference', 'Status'],
    ...notes.map(note => [note.platform, note.url, note.date, note.reference, note.status])]
    .map(row => row.map(cell).join(',')).join('\r\n');
}
