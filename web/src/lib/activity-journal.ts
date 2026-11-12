export const activityTypes = ['Protection', 'Reporting', 'Support', 'Other'] as const;
export type ActivityType = typeof activityTypes[number];
export type ActivityEntry = { id: string; day: string; text: string; type?: ActivityType };
export const MAX_ACTIVITIES = 250;

export function activityTimeline(entries: ActivityEntry[]): string {
  return entries.map(entry => [entry.day, entry.type, entry.text].filter(Boolean).join(' — ')).join('\n\n');
}
