import { useEffect, useState, type FormEvent } from 'react';
import { localToday, validObservationDate } from '@/lib/report-date';
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
    const data = new FormData(form);
    const text = String(data.get('entry') ?? '').trim();
    const day = String(data.get('day') ?? '') || localToday();
    if (!validObservationDate(day)) { setStatus('Choose today or an earlier activity date.'); return; }
    if (!text) { setStatus('Write an activity before adding it.'); return; }
    const entry = { id: crypto.randomUUID(), day, text };
    setEntries(previous => previous.length < MAX_ACTIVITIES ? [...previous, entry] : previous);
    setStatus('Activity recorded.');
    form.reset();
  }

  return <section id="activity-journal" className="section report-organizer" aria-labelledby="journal-title">
    <div className="demo-intro"><h2 id="journal-title">Activity journal</h2>
      <p>Keep a record of what happened and the steps you took. Entries stay in this page’s memory.</p></div>
    <form className="backup-preview glass personal-step" onSubmit={addEntry}>
      <label>Activity date<input type="date" name="day" max={localToday()} defaultValue={localToday()} /></label>
      <label>What happened?<textarea name="entry" rows={3} required maxLength={1000} autoComplete="off" /></label>
      <button className="report-copy" disabled={entries.length >= MAX_ACTIVITIES}>Add activity</button>
    </form>
    <p role="status">{status}</p>
    <p>{entries.length} of {MAX_ACTIVITIES} entries</p>
    <ol>{entries.map(entry => <li key={entry.id} className="backup-preview glass">
      <time dateTime={entry.day}>{entry.day}</time><p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{entry.text}</p>
      <details><summary>Edit activity</summary>
        <form className="personal-step" onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const text = String(data.get('entry') ?? '').trim();
          const day = String(data.get('day') ?? '');
          if (!text || !day || !validObservationDate(day)) { setStatus('Enter activity text and a valid date.'); return; }
          setEntries(previous => previous.map(item => item.id === entry.id ? { ...item, text, day } : item));
          setStatus('Activity updated.');
        }}>
          <label>Corrected date<input name="day" type="date" required defaultValue={entry.day} max={localToday()} /></label>
          <label>Corrected activity<textarea name="entry" defaultValue={entry.text} maxLength={1000} required /></label>
          <button className="report-copy">Save activity changes</button>
        </form>
      </details>
    </li>)}</ol>
  </section>;
}
