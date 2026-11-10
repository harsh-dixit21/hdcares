import { useEffect, useState } from 'react';
type Task = { id: string; title: string; done: boolean; due?: string };
export default function PersonalPlan() {
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
    <ul className="report-list">{visible.map(task => <li className="glass" key={task.id}>
      <label><input type="checkbox" checked={task.done} onChange={event => {
        const done = event.target.checked;
        setTasks(previous => previous.map(item => item.id === task.id ? { ...item, done } : item));
      }} />{task.title}</label>
      <label>Target date<input type="date" value={task.due ?? ''} onChange={event => {
        const due = event.target.value;
        setTasks(previous => previous.map(item => item.id === task.id ? { ...item, due } : item));
      }} /></label>
    </li>)}</ul>
  </section>;
}
