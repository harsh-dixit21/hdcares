import { parseReportBackup, mergeReportNotes } from './report-backup.ts';
import { readPlanBackup, type PlanTask } from './plan-backup.ts';
import { readActivityBackup, MAX_ACTIVITIES, type ActivityEntry } from './activity-journal.ts';
import type { ReportNote } from './report-notes.ts';

export const MAX_WORKSPACE_BYTES = 10_000_000;
export type WorkspaceData = { notes: ReportNote[]; tasks: PlanTask[]; entries: ActivityEntry[] };

export function readWorkspaceBackup(text: string): WorkspaceData & { createdAt?: string } {
  if (new TextEncoder().encode(text).length > MAX_WORKSPACE_BYTES) throw new Error('Workspace backup is too large.');
  const data = JSON.parse(text);
  if (data?.format !== 'hdcares-workspace' || data.version !== 1) throw new Error('Unsupported workspace backup.');
  return {
    createdAt: typeof data.createdAt === 'string' && Number.isFinite(Date.parse(data.createdAt)) ? data.createdAt : undefined,
    notes: parseReportBackup(JSON.stringify(data.reports)),
    tasks: readPlanBackup(JSON.stringify(data.plan)),
    entries: readActivityBackup(JSON.stringify(data.journal)),
  };
}

function mergeById<T extends { id: string }>(current: T[], incoming: T[], capacity: number): T[] {
  const merged = new Map(current.map(item => [item.id, item]));
  for (const item of incoming) if (!merged.has(item.id)) merged.set(item.id, item);
  if (merged.size > capacity) throw new Error('There is insufficient room to restore this workspace.');
  return [...merged.values()];
}

export function mergeWorkspace(current: WorkspaceData, incoming: WorkspaceData): WorkspaceData {
  return {
    notes: mergeReportNotes(current.notes, incoming.notes),
    tasks: mergeById(current.tasks, incoming.tasks, 500),
    entries: mergeById(current.entries, incoming.entries, MAX_ACTIVITIES),
  };
}
