import { useEffect, useState } from 'react';
import { downloadText } from '@/lib/download-text';
import { followUpCalendar } from '@/lib/follow-up-calendar';
type Task = { id: string; title: string; done: boolean; due?: string };
export default function PersonalPlan() {
  const [removed, setRemoved] = useState<Task | null>(null);
  const [feedback, setFeedback] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    if (!tasks.length) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [tasks.length]);
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
