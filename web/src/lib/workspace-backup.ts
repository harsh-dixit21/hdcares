import { parseReportBackup, mergeReportNotes } from './report-backup.ts';
import { readPlanBackup, type PlanTask } from './plan-backup.ts';
import { readActivityBackup, MAX_ACTIVITIES, type ActivityEntry } from './activity-journal.ts';
import type { ReportNote } from './report-notes.ts';

export const MAX_WORKSPACE_BYTES = 10_000_000;
export type CaseDetails = { title?: string; reference?: string; summary?: string; stage?: typeof caseStages[number] };
export const caseStages = ['Planning', 'Reporting', 'Following up', 'Closed'] as const;
export type WorkspaceData = { details?: CaseDetails; notes: ReportNote[]; tasks: PlanTask[]; entries: ActivityEntry[] };

export function readWorkspaceBackup(text: string): WorkspaceData & { createdAt?: string } {
  if (new TextEncoder().encode(text).length > MAX_WORKSPACE_BYTES) throw new Error('Workspace backup is too large.');
  const data = JSON.parse(text);
  if (data?.format !== 'hdcares-workspace' || data.version !== 1) throw new Error('Unsupported workspace backup.');
  return {
    createdAt: typeof data.createdAt === 'string' && Number.isFinite(Date.parse(data.createdAt)) ? data.createdAt : undefined,
    details: readCaseDetails(data.details),
    notes: parseReportBackup(JSON.stringify(data.reports)),
    tasks: readPlanBackup(JSON.stringify(data.plan)),
    entries: readActivityBackup(JSON.stringify(data.journal)),
  };
}

function readCaseDetails(value: unknown): CaseDetails | undefined {
  if (value === undefined) return undefined;
  if (value === null || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid case details.');
  const raw = value as Record<string, unknown>;
  const details: CaseDetails = {};
  for (const [key, limit] of [['title', 100], ['reference', 100], ['summary', 1500]] as const) {
    const field = raw[key];
    if (field === undefined) continue;
    if (typeof field !== 'string' || field.length > limit) throw new Error('Invalid ' + key + '.');
    details[key] = field;
  }
  if (raw.stage !== undefined) {
    details.stage = caseStages.find(stage => stage === raw.stage);
    if (!details.stage) throw new Error('Invalid case stage.');
  }
  return details;
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
