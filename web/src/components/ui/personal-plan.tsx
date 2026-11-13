import { useEffect, useState } from 'react';
import LockedBackupTools from './locked-backup-tools';
import { downloadText } from '@/lib/download-text';
import { followUpCalendar } from '@/lib/follow-up-calendar';
import { localToday, validObservationDate } from '@/lib/report-date';
import { actionCategories, MAX_PLAN_BACKUP_BYTES, readPlanBackup, type PlanTask as Task } from '@/lib/plan-backup';
import { MAX_ACTIVITIES } from '@/lib/activity-journal';
import { useCaseWorkspace } from './case-workspace';
export default function PersonalPlan() {
  const [removed, setRemoved] = useState<Task | null>(null);
  const [feedback, setFeedback] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const { tasks, setTasks, entries, setEntries } = useCaseWorkspace();
  useEffect(() => {
    if (!tasks.length && !removed) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [tasks.length, removed]);
  const [view, setView] = useState('all');
  const [dateSort, setDateSort] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [focusOnly, setFocusOnly] = useState(false);
  const [highOnly, setHighOnly] = useState(false);
  const today = localToday();
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const weekEnd = localToday(nextWeek);
  const matching = tasks.filter(task => !highOnly || task.priority === "High").filter(task => !categoryFilter || (task.category ?? "Uncategorized") === categoryFilter).filter(task => {
    if (view === 'overdue') return !task.done && !!task.due && task.due < today;
    if (view === 'week') return !task.done && !!task.due && task.due >= today && task.due <= weekEnd;
    if (view === 'today') return !task.done && task.due === today;
    return view === 'all' || task.done === (view === 'done');
  }).filter(task => task.title.toLowerCase().includes(search.trim().toLowerCase())).sort((a, b) => dateSort ? (a.due || '9999').localeCompare(b.due || '9999') : 0);
  const visible = focusOnly ? matching.filter(task => !task.done).sort((a, b) => {
    if (a.priority !== b.priority) {
      if (a.priority === 'High') return -1;
      if (b.priority === 'High') return 1;
    }
    return (a.due || '9999').localeCompare(b.due || '9999');
  }).slice(0, 1) : matching;
  const dueAgenda = new Map<string, Task[]>();
  for (const task of tasks) {
    if (task.done || !task.due) continue;
    const group = dueAgenda.get(task.due) ?? [];
    group.push(task);
    dueAgenda.set(task.due, group);
  }

  function moveAction(id: string, offset: number) {
    setTasks(previous => {
      const index = previous.findIndex(task => task.id === id);
      const destination = index + offset;
      if (index < 0 || destination < 0 || destination >= previous.length) return previous;
      const next = [...previous];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next;
    });
  }
  function restorePlan(text: string) {
    const incoming = readPlanBackup(text);
    setTasks(previous => {
      const merged = new Map(previous.map(task => [task.id, task]));
      for (const task of incoming) if (!merged.has(task.id)) merged.set(task.id, task);
      return merged.size > 500 ? previous : [...merged.values()];
    });
    setFeedback('Plan file validated. Existing actions are kept. Imports exceeding 500 total actions are skipped.');
  }
  return <section id="personal-plan" className="section report-organizer">
    <h2>My action plan</h2><p className="organizer-privacy">Plan your next actions here. Tasks stay in this page’s memory until you close or reload it.</p>
    <form className="personal-step" onSubmit={event => {
      event.preventDefault();
      const form = event.currentTarget;
      const title = String(new FormData(form).get('task') ?? '').trim();
      if (!title) return;
      if (tasks.length >= 500) { setFeedback('Save or clear actions before adding more. Maximum 500.'); return; }
      setTasks(previous => [...previous, { id: crypto.randomUUID(), title, done: false }]);
      form.reset();
    }}><label>Next action<input name="task" required maxLength={300} autoComplete="off" /></label><button className="report-copy">Add action</button></form>
    <details><summary>Action templates</summary>
      {([
        ['Protection', 'Review the protection options that fit my situation'],
        ['Reporting', 'Write down the locations I already know about'],
        ['Support', 'Decide who I would feel comfortable asking for support']
      ] as const).map(([category, title]) => <button className="report-copy" key={category} disabled={tasks.length >= 500}
        onClick={() => {
          setTasks(previous => previous.length < 500 ? [...previous, { id: crypto.randomUUID(), title, done: false, category }] : previous);
          setFeedback('Template added. You can edit the action text.');
        }}>{category} template</button>)}
    </details>
    <label>Filter action category<select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}>
      <option value="">All categories</option><option>Uncategorized</option>
      {actionCategories.map(category => <option key={category}>{category}</option>)}
    </select></label>
    <label><input type="checkbox" checked={focusOnly} onChange={event => setFocusOnly(event.target.checked)} />Focus on one pending action</label>
    <label><input type="checkbox" checked={highOnly} onChange={event => setHighOnly(event.target.checked)} />High-priority actions only</label>
    <label>Search actions<input type="search" value={search} onChange={event => setSearch(event.target.value)} /></label>
    <label>Show actions<select value={view} onChange={event => setView(event.target.value)}>
      <option value="all">All actions</option><option value="pending">Pending</option><option value="done">Completed</option><option value="overdue">Overdue</option><option value="today">Due today</option><option value="week">Due in the next seven days</option>
    </select></label>
    <label><input type="checkbox" checked={dateSort} onChange={event => setDateSort(event.target.checked)} />Sort by target date</label>
    {removed && <button className="report-copy" onClick={() => {
      setTasks(previous => previous.some(item => item.id === removed.id) ? previous : [...previous, removed]);
      setRemoved(null);
    }}>Undo last action removal</button>}
    <button className="report-copy" disabled={!tasks.length} onClick={() =>
      downloadText('my-actions.txt', tasks.map(task => (task.done ? '[x] ' : '[ ] ') + task.title + (task.due ? ' — ' + task.due : '')).join('\n'))}>Save action plan</button>
    <p role="status">{tasks.filter(task => task.done).length} of {tasks.length} actions complete.</p>
    <progress aria-label="Action plan completion" max={Math.max(1, tasks.length)} value={tasks.filter(task => task.done).length} />
    <p role="status">{feedback}</p>
    <button className="report-copy" disabled={!tasks.length} onClick={async () => {
      try { await navigator.clipboard.writeText(tasks.map(task => (task.done ? '[x] ' : '[ ] ') + task.title).join('\n')); setFeedback('Action plan copied.'); }
      catch { setFeedback('Clipboard unavailable. Save the plan as text.'); }
    }}>Copy action plan</button>
    {tasks.length > 0 && <div>{confirmClear ? <>
      <p>Clear every action and the removal recovery copy?</p>
      <button className="report-copy" onClick={() => { setTasks([]); setRemoved(null); setConfirmClear(false); }}>Confirm clear plan</button>
      <button className="report-copy" onClick={() => setConfirmClear(false)}>Keep my plan</button>
    </> : <button className="report-copy" onClick={() => setConfirmClear(true)}>Clear plan</button>}</div>}
    <button className="report-copy" disabled={!tasks.length} onClick={() => downloadText('plan-backup.json',
      JSON.stringify({ format: 'hdcares-plan', version: 1, tasks }), 'application/json')}>Back up plan</button>
    <LockedBackupTools label="action plan" filename="plan-encrypted.json" enabled={!!tasks.length}
      serialize={() => JSON.stringify({ format: 'hdcares-plan', version: 1, tasks })} restore={restorePlan} />
    <label>Restore plan file<input type="file" accept=".json" onChange={async event => {
      const file = event.target.files?.[0]; event.target.value = '';
      if (!file) return;
      try {
        if (file.size > MAX_PLAN_BACKUP_BYTES) throw new Error('File is too large.');
        restorePlan(await file.text());
      } catch { setFeedback('Choose a valid HD Cares plan backup under 3 MB.'); }
    }} /></label>
    <p className="demo-disclosure">Plan backups contain your action text, notes, and dates as unencrypted JSON.</p>
    <button className="report-copy" disabled={!visible.some(task => !task.done)} onClick={() => {
      const ids = new Set(visible.map(task => task.id));
      setTasks(previous => previous.map(task => ids.has(task.id) ? { ...task, done: true } : task));
      setFeedback('Visible actions marked complete.');
    }}>Complete visible actions</button>
    <button className="report-copy" disabled={!visible.length} onClick={() => downloadText('visible-actions.txt',
      visible.map(task => [task.done ? '[x]' : '[ ]', task.title, task.category, task.priority === 'High' ? 'High priority' : '', task.due]
        .filter(Boolean).join('  ')).join('\n'))}>Save visible actions</button>
    <details className="backup-preview glass"><summary>Pending action agenda</summary>
      {dueAgenda.size === 0 && <p>No pending actions have a target date.</p>}
      {[...dueAgenda].sort(([a], [b]) => a.localeCompare(b)).map(([day, actions]) => <div key={day}>
        <h3><time dateTime={day}>{day}</time></h3>
        <ul>{actions.map(task => <li key={task.id}>{task.title}</li>)}</ul>
      </div>)}
    </details>
    <details className="backup-preview glass"><summary>Reschedule visible actions</summary>
      <form className="personal-step" onSubmit={event => {
        event.preventDefault();
        const due = String(new FormData(event.currentTarget).get('reschedule') ?? '');
        if (!due || !validObservationDate(due, '9999-12-31')) return;
        const ids = new Set(visible.filter(task => !task.done).map(task => task.id));
        setTasks(previous => previous.map(task => ids.has(task.id) && !task.done ? { ...task, due } : task));
        setFeedback('Updated the target date for ' + ids.size + ' pending actions.');
      }}>
        <label>New target date<input name="reschedule" type="date" required max="9999-12-31" /></label>
        <button className="report-copy" disabled={!visible.some(task => !task.done)}>Reschedule pending actions shown</button>
      </form>
    </details>
    <ul className="report-list">{visible.map(task => <li className="glass" key={task.id}>
      <label><input type="checkbox" checked={task.done} onChange={event => {
        const done = event.target.checked;
        setTasks(previous => previous.map(item => item.id === task.id ? { ...item, done } : item));
      }} />{task.title}</label>
      {task.done && <button className="report-copy" disabled={entries.length >= MAX_ACTIVITIES || !task.title.trim()} onClick={() => {
        const entry = { id: crypto.randomUUID(), day: localToday(), text: 'Completed: ' + task.title.trim(), type: task.category };
        setEntries(previous => previous.length < MAX_ACTIVITIES ? [...previous, entry] : previous);
        setFeedback('Completed action recorded in the journal.');
      }}>Record completion in journal</button>}
      <label>Action text<input maxLength={300} value={task.title} onChange={event => {
        const title = event.target.value;
        setTasks(previous => previous.map(item => item.id === task.id ? { ...item, title } : item));
      }} /></label>
      <button className="report-copy" disabled={tasks.length >= 500} onClick={() => {
        setTasks(previous => previous.length < 500 ? [...previous, { ...task, id: crypto.randomUUID(), done: false }] : previous);
        setFeedback('Copied action added as pending.');
      }}>Duplicate action</button>
      <button className="report-copy" onClick={() => {
        setRemoved(task); setTasks(previous => previous.filter(item => item.id !== task.id));
      }}>Remove action</button>
      <button className="report-copy" disabled={!task.due} onClick={() => {
        try { downloadText('action-reminder.ics', followUpCalendar(task.due ?? ''), 'text/calendar;charset=utf-8'); }
        catch { setFeedback('Choose a valid target date.'); }
      }}>Save generic calendar reminder</button>
      <details><summary>Action notes</summary><label>Private context<textarea rows={3} maxLength={500} value={task.context ?? ''} onChange={event => {
        const context = event.target.value;
        setTasks(previous => previous.map(item => item.id === task.id ? { ...item, context } : item));
      }} /></label></details>
      {!dateSort && !focusOnly && view === 'all' && !search && !categoryFilter && !highOnly && <div className="backup-actions">
        <button className="report-copy" disabled={tasks[0]?.id === task.id} onClick={() => moveAction(task.id, -1)}>Move up</button>
        <button className="report-copy" disabled={tasks.at(-1)?.id === task.id} onClick={() => moveAction(task.id, 1)}>Move down</button>
      </div>}
      <label>Category<select value={task.category ?? ''} onChange={event => {
        const category = actionCategories.find(value => value === event.target.value);
        setTasks(previous => previous.map(item => item.id === task.id ? { ...item, category } : item));
      }}><option value="">Uncategorized</option>{actionCategories.map(category => <option key={category}>{category}</option>)}</select></label>
      <label>Priority<select value={task.priority ?? 'Normal'} onChange={event => {
        const priority = event.target.value === 'High' ? 'High' : 'Normal';
        setTasks(previous => previous.map(item => item.id === task.id ? { ...item, priority } : item));
      }}><option>Normal</option><option>High</option></select></label>
      <label>Target date<input type="date" value={task.due ?? ''} onChange={event => {
        const due = event.target.value;
        setTasks(previous => previous.map(item => item.id === task.id ? { ...item, due } : item));
      }} /></label>
    </li>)}</ul>
  </section>;
}
