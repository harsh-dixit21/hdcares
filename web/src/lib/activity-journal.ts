export const activityTypes = ['Protection', 'Reporting', 'Support', 'Other'] as const;
export type ActivityType = typeof activityTypes[number];
export type ActivityEntry = { id: string; day: string; text: string; type?: ActivityType };
export const MAX_ACTIVITIES = 250;
