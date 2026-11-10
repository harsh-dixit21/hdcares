import { useEffect, useState } from 'react';
import { downloadText } from '@/lib/download-text';
import { followUpCalendar } from '@/lib/follow-up-calendar';
import { readPlanBackup, type PlanTask as Task } from '@/lib/plan-backup';
export default function PersonalPlan() {
  const [removed, setRemoved] = useState<Task | null>(null);
  const [feedback, setFeedback] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    if (!tasks.length && !removed) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [tasks.length, removed]);
  const [view, setView] = useState('all');
  const [dateSort, setDateSort] = useState(false);
  const visible = tasks.filter(task => view === 'all' || task.done === (view === 'done')).sort((a, b) => dateSort ? (a.due || '9999').localeCompare(b.due || '9999') : 0);
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
    <label>Show actions<select value={view} onChange={event => setView(event.target.value)}>
      <option value="all">All actions</option><option value="pending">Pending</option><option value="done">Completed</option>
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
    <label>Restore plan file<input type="file" accept=".json" onChange={async event => {
      const file = event.target.files?.[0]; event.target.value = '';
      if (!file) return;
      try {
        if (file.size > 500000) throw new Error('File is too large.');
        const incoming = readPlanBackup(await file.text());
        setTasks(previous => {
          const merged = [...previous];
          for (const task of incoming) if (!merged.some(item => item.title === task.title && item.due === task.due)) merged.push(task);
          if (merged.length > 500) return previous;
          return merged;
        });
        setFeedback('Plan file validated. Existing actions retained. Imports exceeding 500 total actions are skipped.');
      } catch { setFeedback('Choose a valid HD Cares plan backup under 500 KB.'); }
    }} /></label>
    <p className="demo-disclosure">Plan backups contain your action text and dates as unencrypted JSON.</p>
    <ul className="report-list">{visible.map(task => <li className="glass" key={task.id}>
      <label><input type="checkbox" checked={task.done} onChange={event => {
        const done = event.target.checked;
        setTasks(previous => previous.map(item => item.id === task.id ? { ...item, done } : item));
      }} />{task.title}</label>
      <label>Action text<input maxLength={300} value={task.title} onChange={event => {
        const title = event.target.value;
        setTasks(previous => previous.map(item => item.id === task.id ? { ...item, title } : item));
      }} /></label>
      <button className="report-copy" onClick={() => {
        setRemoved(task); setTasks(previous => previous.filter(item => item.id !== task.id));
      }}>Remove action</button>
      <button className="report-copy" disabled={!task.due} onClick={() => {
        try { downloadText('action-reminder.ics', followUpCalendar(task.due ?? ''), 'text/calendar;charset=utf-8'); }
        catch { setFeedback('Choose a valid target date.'); }
      }}>Save generic calendar reminder</button>
      <label>Target date<input type="date" value={task.due ?? ''} onChange={event => {
        const due = event.target.value;
        setTasks(previous => previous.map(item => item.id === task.id ? { ...item, due } : item));
      }} /></label>
    </li>)}</ul>
  </section>;
}
