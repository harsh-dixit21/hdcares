import { createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { PlanTask } from '@/lib/plan-backup';
import { createActivityBackup, type ActivityEntry } from '@/lib/activity-journal';
import { createReportBackup } from '@/lib/report-backup';
import type { ReportNote } from '@/lib/report-notes';
import { MAX_WORKSPACE_BYTES, mergeWorkspace, readWorkspaceBackup, type WorkspaceData } from '@/lib/workspace-backup';
import LockedBackupTools from './locked-backup-tools';
import { downloadText } from '@/lib/download-text';

type Workspace = {
  notes: ReportNote[];
  setNotes: Dispatch<SetStateAction<ReportNote[]>>;
  tasks: PlanTask[];
  setTasks: Dispatch<SetStateAction<PlanTask[]>>;
  entries: ActivityEntry[];
  setEntries: Dispatch<SetStateAction<ActivityEntry[]>>;
};

const WorkspaceContext = createContext<Workspace | null>(null);
export function useCaseWorkspace() {
  const workspace = useContext(WorkspaceContext);
  if (!workspace) throw new Error('Case workspace is unavailable.');
  return workspace;
}

export function CaseWorkspace({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<ReportNote[]>([]);
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  return <WorkspaceContext.Provider value={{ notes, setNotes, tasks, setTasks, entries, setEntries }}>{children}</WorkspaceContext.Provider>;
}

function WorkspaceBackup() {
  const { notes, tasks, entries, setNotes, setTasks, setEntries } = useCaseWorkspace();
  const [pending, setPending] = useState<WorkspaceData | null>(null);
  const [status, setStatus] = useState('');
  const hasData = !!(notes.length || tasks.length || entries.length);
  const serialize = () => JSON.stringify({
    format: 'hdcares-workspace', version: 1,
    reports: JSON.parse(createReportBackup(notes)),
    plan: { format: 'hdcares-plan', version: 1, tasks },
    journal: JSON.parse(createActivityBackup(entries)),
  });
  return <details className="backup-preview glass">
    <summary>Workspace backup</summary>
    <p>Save the report locations, action plan, and journal together. This download is readable JSON.</p>
    <button className="report-copy" disabled={!hasData} onClick={() =>
      downloadText('workspace-backup.json', serialize(), 'application/json')}>Back up workspace</button>
    <LockedBackupTools label="workspace" filename="workspace-encrypted.json" enabled={hasData} serialize={serialize} />
    <label>Choose workspace backup<input type="file" accept=".json" onChange={async event => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      setPending(null); setStatus('');
      try {
        if (file.size > MAX_WORKSPACE_BYTES) throw new Error('Workspace backup is too large.');
        setPending(readWorkspaceBackup(await file.text()));
      } catch { setStatus('Choose a valid HD Cares workspace backup under 10 MB.'); }
    }} /></label>
    {pending && <div>
      <p>Review import: {pending.notes.length} locations, {pending.tasks.length} actions, {pending.entries.length} activities. Existing records take precedence.</p>
      <button className="report-copy" onClick={() => {
        try {
          const merged = mergeWorkspace({ notes, tasks, entries }, pending);
          setNotes(merged.notes); setTasks(merged.tasks); setEntries(merged.entries);
          setPending(null); setStatus('Workspace restored.');
        } catch { setStatus('This restore would exceed a workspace limit. No records were changed.'); }
      }}>Merge workspace backup</button>
      <button className="report-copy" onClick={() => { setPending(null); setStatus(''); }}>Cancel workspace restore</button>
    </div>}
    <p role="status">{status}</p>
  </details>;
}

export function WorkspaceOverview() {
  const { tasks, entries, notes } = useCaseWorkspace();
  return <><nav className="tool-shortcuts" aria-label="Workspace overview">
    <a href="#personal-plan">Action plan · {tasks.filter(task => !task.done).length} pending</a>
    <a href="#activity-journal">Activity journal · {entries.length} entries</a>
  </nav>
  <WorkspaceBackup />
  </>;
}
