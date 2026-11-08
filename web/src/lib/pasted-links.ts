import { validateReportUrl, type ReportNote } from './report-notes.ts';
import { MAX_REPORT_NOTES } from './report-backup.ts';

export function parsePastedLinks(text: string): ReportNote[] {
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!lines.length || lines.length > MAX_REPORT_NOTES) throw new Error('Enter between 1 and 500 links, one per line.');
  return lines.map((line, index) => {
    const url = validateReportUrl(line);
    if (!url) throw new Error('Check link ' + (index + 1) + '. Enter a complete HTTP or HTTPS URL without credentials.');
    return { id: crypto.randomUUID(), url, platform: new URL(url).hostname.slice(0, 100),
      date: '', reference: '', status: 'Not reported' };
  });
}
