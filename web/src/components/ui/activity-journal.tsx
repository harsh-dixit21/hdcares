import { useEffect, useState, type FormEvent } from 'react';
import { localToday } from '@/lib/report-date';
import { MAX_ACTIVITIES, type ActivityEntry } from '@/lib/activity-journal';

export default function ActivityJournal() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [status, setStatus] = useState('');
  const hasEntries = entries.length > 0;
  useEffect(() => {
    if (!hasEntries) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [hasEntries]);

  function addEntry(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const text = String(new FormData(form).get('entry') ?? '').trim();
    if (!text) { setStatus('Write an activity before adding it.'); return; }
    const entry = { id: crypto.randomUUID(), day: localToday(), text };
    setEntries(previous => previous.length < MAX_ACTIVITIES ? [...previous, entry] : previous);
    setStatus('Activity recorded.');
    form.reset();
  }

  return <section id="activity-journal" className="section report-organizer" aria-labelledby="journal-title">
    <div className="demo-intro"><h2 id="journal-title">Activity journal</h2>
      <p>Keep a record of what happened and the steps you took. Entries stay in this page’s memory.</p></div>
    <form className="backup-preview glass personal-step" onSubmit={addEntry}>
      <label>What happened?<textarea name="entry" rows={3} required maxLength={1000} autoComplete="off" /></label>
      <button className="report-copy" disabled={entries.length >= MAX_ACTIVITIES}>Add activity</button>
    </form>
    <p role="status">{status}</p>
    <p>{entries.length} of {MAX_ACTIVITIES} entries</p>
    <ol>{entries.map(entry => <li key={entry.id} className="backup-preview glass">
      <time dateTime={entry.day}>{entry.day}</time><p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{entry.text}</p>
    </li>)}</ol>
  </section>;
}
