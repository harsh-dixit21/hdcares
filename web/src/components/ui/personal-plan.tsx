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
    <ul className="report-list">{tasks.map(task => <li className="glass" key={task.id}>
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
