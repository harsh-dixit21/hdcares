import { validObservationDate } from './report-date.ts';
export type PlanTask = { id: string; title: string; done: boolean; due?: string };
export function readPlanBackup(text: string): PlanTask[] {
  if (text.length > 500000) throw new Error('Plan backup is too large.');
  const data = JSON.parse(text);
  if (data?.format !== 'hdcares-plan' || data.version !== 1 || !Array.isArray(data.tasks) || data.tasks.length > 500) throw new Error('Unsupported plan backup.');
  return data.tasks.map((task: Record<string, unknown>) => {
    if (!task || typeof task.title !== 'string' || task.title.length > 300 || typeof task.done !== 'boolean') throw new Error('Invalid action.');
    if (task.due !== undefined && (typeof task.due !== 'string' || !validObservationDate(task.due, '9999-12-31'))) throw new Error('Invalid target date.');
    return { id: crypto.randomUUID(), title: task.title, done: task.done, due: task.due as string | undefined };
  });
}
