import { useEffect, createContext, useContext, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type { PlanTask } from '@/lib/plan-backup';
import { createActivityBackup, type ActivityEntry } from '@/lib/activity-journal';
import { createReportBackup } from '@/lib/report-backup';
import type { ReportNote } from '@/lib/report-notes';
import { MAX_WORKSPACE_BYTES, mergeWorkspace, readWorkspaceBackup, type WorkspaceData } from '@/lib/workspace-backup';
import CaseDetailsPanel from './case-details';
import type { CaseDetails } from '@/lib/workspace-backup';
import WorkspaceSearch from './workspace-search';
import LockedBackupTools from './locked-backup-tools';
import { downloadText } from '@/lib/download-text';

type Workspace = {
  details: CaseDetails;
  setDetails: Dispatch<SetStateAction<CaseDetails>>;
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
  const [details, setDetails] = useState<CaseDetails>({});
  const [notes, setNotes] = useState<ReportNote[]>([]);
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const hasDetails = Object.values(details).some(value => !!value?.trim());
  useEffect(() => {
    if (!hasDetails) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasDetails]);
  return <WorkspaceContext.Provider value={{ details, setDetails, notes, setNotes, tasks, setTasks, entries, setEntries }}>{children}</WorkspaceContext.Provider>;
}

function WorkspaceBackup() {
  const { notes, tasks, entries, details, setDetails, setNotes, setTasks, setEntries } = useCaseWorkspace();
  const [pending, setPending] = useState<(WorkspaceData & { createdAt?: string }) | null>(null);
  const [included, setIncluded] = useState({ notes: true, tasks: true, entries: true, details: true });
  const [undo, setUndo] = useState<{ before: WorkspaceData; after: WorkspaceData } | null>(null);
  const [status, setStatus] = useState('');
  const [exportParts, setExportParts] = useState({ notes: true, tasks: true, entries: true, details: true });
  const hasData = !!((exportParts.notes && notes.length) || (exportParts.tasks && tasks.length) ||
    (exportParts.entries && entries.length) || (exportParts.details && Object.values(details).some(Boolean)));
  const serialize = () => JSON.stringify({
    format: 'hdcares-workspace', version: 1, createdAt: new Date().toISOString(),
    details: exportParts.details ? details : undefined,
    reports: JSON.parse(createReportBackup(exportParts.notes ? notes : [])),
    plan: { format: 'hdcares-plan', version: 1, tasks: exportParts.tasks ? tasks : [] },
    journal: JSON.parse(createActivityBackup(exportParts.entries ? entries : [])),
  });
  const incoming = pending ? {
    details: included.details ? pending.details : undefined,
    notes: included.notes ? pending.notes : [],
    tasks: included.tasks ? pending.tasks : [],
    entries: included.entries ? pending.entries : [],
  } : null;
  let merged: WorkspaceData | null = null;
  if (incoming) {
    try { merged = mergeWorkspace({ notes, tasks, entries, details }, incoming); }
    catch { /* A capacity error is displayed below. */ }
  }
  const added = merged ? [merged.notes.length - notes.length, merged.tasks.length - tasks.length,
    merged.entries.length - entries.length] : null;
  const skipped = incoming && added ? incoming.notes.length + incoming.tasks.length + incoming.entries.length -
    added.reduce((sum, count) => sum + count, 0) : 0;
  return <details className="backup-preview glass">
    <summary>Workspace backup</summary>
    <p>Save the report locations, action plan, and journal together. This download is readable JSON.</p>
    <fieldset><legend>Include in download</legend>
      {([['notes', 'Report locations'], ['tasks', 'Personal actions'], ['entries', 'Journal activities'], ['details', 'Case details']] as const).map(([key, label]) =>
        <label key={key}><input type="checkbox" checked={exportParts[key]} onChange={event => {
          const checked = event.target.checked;
          setExportParts(previous => ({ ...previous, [key]: checked }));
        }} />{label}</label>)}
    </fieldset>
    <button className="report-copy" disabled={!hasData} onClick={() =>
      downloadText('workspace-backup.json', serialize(), 'application/json')}>Back up workspace</button>
    <LockedBackupTools label="workspace" filename="workspace-encrypted.json" enabled={hasData} serialize={serialize} restore={text => {
      setPending(readWorkspaceBackup(text)); setIncluded({ notes: true, tasks: true, entries: true, details: true });
      setStatus('');
    }} />
    <label>Choose workspace backup<input type="file" accept=".json" onChange={async event => {
      const file = event.target.files?.[0];
      event.target.value = '';
      if (!file) return;
      setPending(null); setStatus('');
      try {
        if (file.size > MAX_WORKSPACE_BYTES) throw new Error('Workspace backup is too large.');
        setPending(readWorkspaceBackup(await file.text())); setIncluded({ notes: true, tasks: true, entries: true, details: true });
      } catch { setStatus('Choose a valid HD Cares workspace backup under 10 MB.'); }
    }} /></label>
    {pending && <div>
      <p>Review import: {pending.notes.length} locations, {pending.tasks.length} actions, {pending.entries.length} activities. Existing records take precedence.</p>
      {pending.createdAt && <p>Backup created {new Date(pending.createdAt).toLocaleString()}.</p>}
      <fieldset><legend>Restore from this file</legend>
        {([['notes', 'Report locations'], ['tasks', 'Personal actions'], ['entries', 'Journal activities'], ['details', 'Case details']] as const).map(([key, label]) =>
          <label key={key}><input type="checkbox" checked={included[key]} onChange={event => {
            const checked = event.target.checked;
            setIncluded(previous => ({ ...previous, [key]: checked }));
          }} />{label}</label>)}
      </fieldset>
      {included.notes && pending.notes.length > 0 && <details><summary>Review incoming report domains</summary>
        <ul>{[...new Set(pending.notes.map(note => new URL(note.url).hostname))].sort().map(domain =>
          <li key={domain}>{domain}</li>)}</ul>
      </details>}
      {included.tasks && pending.tasks.length > 0 && <p>Actions in file: {pending.tasks.filter(task => !task.done).length} pending,
        {' '}{pending.tasks.filter(task => task.done).length} completed.</p>}
      {included.details && pending.details && <details><summary>Review case fields</summary>
        <dl>{Object.entries(pending.details).filter(([, value]) => value?.trim()).map(([key, value]) => {
          const current = details[key as keyof CaseDetails];
          return <div key={key}><dt>{key}</dt><dd style={{ overflowWrap: 'anywhere' }}>{current?.trim() ?
            'Keeping current value: ' + current : 'Will import: ' + value}</dd></div>;
        })}</dl>
      </details>}
      <p>{added ? 'Ready to add ' + added[0] + ' locations, ' + added[1] + ' actions, and ' + added[2] +
        ' activities. Duplicate records skipped: ' + skipped + '.' : 'The selected import would exceed a workspace limit.'}</p>
      <button className="report-copy" disabled={!merged || !Object.values(included).some(Boolean)} onClick={() => {
        if (merged) {
          setUndo({ before: { notes, tasks, entries, details }, after: merged });
          setNotes(merged.notes); setTasks(merged.tasks); setEntries(merged.entries); setDetails(merged.details ?? {});
          setPending(null);
          setStatus('Added ' + (merged.notes.length - notes.length) + ' locations, ' +
            (merged.tasks.length - tasks.length) + ' actions, and ' + (merged.entries.length - entries.length) + ' activities.');
        }
      }}>Merge workspace backup</button>
      <button className="report-copy" onClick={() => { setPending(null); setStatus(''); }}>Cancel workspace restore</button>
    </div>}
    {undo && notes === undo.after.notes && tasks === undo.after.tasks && entries === undo.after.entries &&
      details === undo.after.details && <button className="report-copy" onClick={() => {
        setNotes(undo.before.notes); setTasks(undo.before.tasks); setEntries(undo.before.entries);
        setDetails(undo.before.details ?? {}); setUndo(null); setStatus('Workspace merge undone.');
      }}>Undo workspace merge</button>}
    <p role="status">{status}</p>
  </details>;
}

export function WorkspaceOverview() {
  const { tasks, entries, notes, details, setDetails } = useCaseWorkspace();
  return <><nav className="tool-shortcuts" aria-label="Workspace overview">
    <a href="#report-organizer">Reports · {notes.filter(note => note.status !== 'Resolved').length} unresolved</a>
    <a href="#personal-plan">Action plan · {tasks.filter(task => !task.done).length} pending</a>
    <a href="#activity-journal">Activity journal · {entries.length} entries</a>
  </nav>
  <CaseDetailsPanel value={details} onChange={setDetails} />
  <WorkspaceSearch notes={notes} tasks={tasks} entries={entries} />
  <WorkspaceBackup />
  </>;
}
