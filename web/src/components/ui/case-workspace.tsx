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
  const [pending, setPending] = useState<(WorkspaceData & { createdAt?: string }) | null>(null);
  const [included, setIncluded] = useState({ notes: true, tasks: true, entries: true });
  const [status, setStatus] = useState('');
  const [exportParts, setExportParts] = useState({ notes: true, tasks: true, entries: true });
  const hasData = !!((exportParts.notes && notes.length) || (exportParts.tasks && tasks.length) ||
    (exportParts.entries && entries.length));
  const serialize = () => JSON.stringify({
    format: 'hdcares-workspace', version: 1, createdAt: new Date().toISOString(),
    reports: JSON.parse(createReportBackup(exportParts.notes ? notes : [])),
    plan: { format: 'hdcares-plan', version: 1, tasks: exportParts.tasks ? tasks : [] },
    journal: JSON.parse(createActivityBackup(exportParts.entries ? entries : [])),
  });
  return <details className="backup-preview glass">
    <summary>Workspace backup</summary>
    <p>Save the report locations, action plan, and journal together. This download is readable JSON.</p>
    <fieldset><legend>Include in download</legend>
      {([['notes', 'Report locations'], ['tasks', 'Personal actions'], ['entries', 'Journal activities']] as const).map(([key, label]) =>
        <label key={key}><input type="checkbox" checked={exportParts[key]} onChange={event => {
          const checked = event.target.checked;
          setExportParts(previous => ({ ...previous, [key]: checked }));
        }} />{label}</label>)}
    </fieldset>
    <button className="report-copy" disabled={!hasData} onClick={() =>
      downloadText('workspace-backup.json', serialize(), 'application/json')}>Back up workspace</button>
    <LockedBackupTools label="workspace" filename="workspace-encrypted.json" enabled={hasData} serialize={serialize} restore={text => {
      setPending(readWorkspaceBackup(text)); setIncluded({ notes: true, tasks: true, entries: true });
      setStatus('');
    }} />
    <label>Choose workspace backup<input type="file" accept=".json" onChange={async event => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      setPending(null); setStatus('');
      try {
        if (file.size > MAX_WORKSPACE_BYTES) throw new Error('Workspace backup is too large.');
        setPending(readWorkspaceBackup(await file.text())); setIncluded({ notes: true, tasks: true, entries: true });
      } catch { setStatus('Choose a valid HD Cares workspace backup under 10 MB.'); }
    }} /></label>
    {pending && <div>
      <p>Review import: {pending.notes.length} locations, {pending.tasks.length} actions, {pending.entries.length} activities. Existing records take precedence.</p>
      {pending.createdAt && <p>Backup created {new Date(pending.createdAt).toLocaleString()}.</p>}
      <fieldset><legend>Restore from this file</legend>
        {([['notes', 'Report locations'], ['tasks', 'Personal actions'], ['entries', 'Journal activities']] as const).map(([key, label]) =>
          <label key={key}><input type="checkbox" checked={included[key]} onChange={event => {
            const checked = event.target.checked;
            setIncluded(previous => ({ ...previous, [key]: checked }));
          }} />{label}</label>)}
      </fieldset>
      <button className="report-copy" disabled={!Object.values(included).some(Boolean)} onClick={() => {
        try {
          const merged = mergeWorkspace({ notes, tasks, entries }, {
            notes: included.notes ? pending.notes : [],
            tasks: included.tasks ? pending.tasks : [],
            entries: included.entries ? pending.entries : [],
          });
          setNotes(merged.notes); setTasks(merged.tasks); setEntries(merged.entries);
          setPending(null);
          setStatus('Added ' + (merged.notes.length - notes.length) + ' locations, ' +
            (merged.tasks.length - tasks.length) + ' actions, and ' + (merged.entries.length - entries.length) + ' activities.');
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
    <a href="#report-organizer">Reports · {notes.filter(note => note.status !== 'Resolved').length} unresolved</a>
    <a href="#personal-plan">Action plan · {tasks.filter(task => !task.done).length} pending</a>
    <a href="#activity-journal">Activity journal · {entries.length} entries</a>
  </nav>
  <WorkspaceBackup />
  </>;
}
