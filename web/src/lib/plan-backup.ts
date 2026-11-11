import { validObservationDate } from './report-date.ts';
export const MAX_PLAN_BACKUP_BYTES = 3_000_000;
export const actionCategories = ['Protection', 'Reporting', 'Support', 'Other'] as const;
export type ActionCategory = typeof actionCategories[number];
export type PlanTask = { id: string; title: string; done: boolean; due?: string; priority?: 'Normal' | 'High'; category?: ActionCategory; context?: string };
export function readPlanBackup(text: string): PlanTask[] {
  if (new TextEncoder().encode(text).length > MAX_PLAN_BACKUP_BYTES) throw new Error('Plan backup is too large.');
  const data = JSON.parse(text);
  if (data?.format !== 'hdcares-plan' || data.version !== 1 || !Array.isArray(data.tasks) || data.tasks.length > 500) throw new Error('Unsupported plan backup.');
  return data.tasks.map((task: Record<string, unknown>) => {
    if (!task || typeof task.title !== 'string' || task.title.length > 300 || typeof task.done !== 'boolean') throw new Error('Invalid action.');
    if (task.due !== undefined && (typeof task.due !== 'string' || !validObservationDate(task.due, '9999-12-31'))) throw new Error('Invalid target date.');
    if (task.priority !== undefined && task.priority !== 'Normal' && task.priority !== 'High') throw new Error('Invalid priority.');
    const category = actionCategories.find(value => value === task.category);
    if (task.category !== undefined && !category) throw new Error('Invalid category.');
    if (task.context !== undefined && (typeof task.context !== "string" || task.context.length > 500)) throw new Error("Invalid action notes.");
    const id = typeof task.id === 'string' && /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(task.id) ? task.id.toLowerCase() : crypto.randomUUID();
    return { context: task.context as string | undefined, category, priority: task.priority, id, title: task.title, done: task.done, due: task.due as string | undefined };
  });
}
