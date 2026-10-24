export const reportStatuses = ['Not reported', 'Reported', 'Following up', 'Resolved'] as const;
export type ReportNote = {
  id: string; url: string; platform: string; date: string;
  reference: string; status: typeof reportStatuses[number];
};

export function validateReportUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.href.length > 4000) return null;
    return url.href;
  } catch { return null; }
}

export function exportReportNotes(notes: ReportNote[]): string {
  const line = (value: string) => value.replace(/[\r\n\t]/g, ' ');
  return ['HD Cares — private report notes',
    'User-maintained notes. This document is not a submitted complaint or proof of platform action.',
    'Contains potentially sensitive links and references. Store and share with care.', '',
    ...notes.flatMap((note, index) => [
      `${index + 1}. ${line(note.platform)}`, `URL: ${line(note.url)}`,
      `Date observed: ${line(note.date) || 'Not recorded'}`,
      `Status (recorded by you): ${note.status}`,
      `Report reference: ${line(note.reference) || 'Not recorded'}`, '',
    ]),
  ].join('\n');
}
