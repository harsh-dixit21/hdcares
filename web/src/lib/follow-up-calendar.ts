import { validObservationDate } from './report-date.ts';

export function followUpCalendar(day: string, now = new Date()): string {
  if (!day || !validObservationDate(day, '9999-12-31')) throw new Error('Choose a valid date.');
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//HD Cares//Follow up//EN',
    'BEGIN:VEVENT', 'UID:' + crypto.randomUUID() + '@hdcares', 'DTSTAMP:' + stamp,
    'DTSTART;VALUE=DATE:' + day.replace(/-/g, ''), 'SUMMARY:Follow up', 'CLASS:PRIVATE',
    'END:VEVENT', 'END:VCALENDAR', ''].join('\r\n');
}
