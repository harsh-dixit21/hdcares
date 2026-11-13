import { useEffect, useState, type FormEvent } from 'react';
import LockedBackupTools from './locked-backup-tools';
import { localToday, validObservationDate } from '@/lib/report-date';
import { downloadText } from "@/lib/download-text";
import { createActivityBackup, readActivityBackup, mergeActivityBackup, MAX_JOURNAL_BACKUP_BYTES, activityTimeline, activityTypes, MAX_ACTIVITIES, type ActivityEntry } from '@/lib/activity-journal';

import { useCaseWorkspace } from './case-workspace';
export default function ActivityJournal() {
  const [hidden, setHidden] = useState(false);
  const { entries, setEntries, tasks, setTasks } = useCaseWorkspace();
  const [status, setStatus] = useState('');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [oldestFirst, setOldestFirst] = useState(false);
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const shown = entries.filter(entry => !category || (entry.type ?? 'Uncategorized') === category)
    .filter(entry => !pinnedOnly || entry.pinned)
    .filter(entry => entry.text.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned) ||
      (oldestFirst ? a.day.localeCompare(b.day) : b.day.localeCompare(a.day)));
  const [removed, setRemoved] = useState<ActivityEntry | null>(null);
  const hasEntries = entries.length > 0 || !!removed;
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
    const entry = { id: crypto.randomUUID(), day, text, type: activityTypes.find(type => type === data.get('type')) };
    setEntries(previous => previous.length < MAX_ACTIVITIES ? [...previous, entry] : previous);
    setStatus('Activity recorded.');
    form.reset();
  }

  function restoreJournal(text: string) {
    const incoming = readActivityBackup(text);
    setEntries(previous => mergeActivityBackup(previous, incoming));
    setStatus('Journal file validated. Existing entries are kept. Imports exceeding 250 total entries are skipped.');
  }

  return <section id="activity-journal" className="section report-organizer" aria-labelledby="journal-title">
    <div className="demo-intro"><h2 id="journal-title">Activity journal</h2>
      <p>Keep a record of what happened and the steps you took. Entries stay in this page’s memory.</p></div>
    <button className="report-copy" aria-expanded={!hidden} aria-controls="journal-content" onClick={() => setHidden(value => !value)}>
      {hidden ? 'Show journal' : 'Hide journal'}
    </button>
    <div id="journal-content" hidden={hidden}>
    <form className="backup-preview glass personal-step" onSubmit={addEntry}>
      <label>Activity category<select name="type">
        <option value="">Uncategorized</option>{activityTypes.map(type => <option key={type}>{type}</option>)}
      </select></label>
      <label>Activity date<input type="date" name="day" max={localToday()} defaultValue={localToday()} /></label>
      <label>What happened?<textarea name="entry" rows={3} required maxLength={1000} autoComplete="off" /></label>
      <button className="report-copy" disabled={entries.length >= MAX_ACTIVITIES}>Add activity</button>
    </form>
    <p role="status">{status}</p>
    <p>{entries.length} of {MAX_ACTIVITIES} entries</p>
    <label>Filter activity category<select value={category} onChange={event => setCategory(event.target.value)}>
      <option value="">All categories</option><option>Uncategorized</option>
      {activityTypes.map(type => <option key={type}>{type}</option>)}
    </select></label>
    <label><input type="checkbox" checked={pinnedOnly} onChange={event => setPinnedOnly(event.target.checked)} />Pinned activities only</label>
    <label>Search activity<input type="search" value={query} onChange={event => setQuery(event.target.value)} /></label>
    <p role="status">{shown.length} activities shown.</p>
    <label>Activity order<select value={oldestFirst ? 'oldest' : 'newest'} onChange={event => setOldestFirst(event.target.value === 'oldest')}>
      <option value="newest">Newest first</option><option value="oldest">Oldest first</option>
    </select></label>
    {removed && <button className="report-copy" disabled={entries.length >= MAX_ACTIVITIES} onClick={() => {
      setEntries(previous => previous.some(entry => entry.id === removed.id) ? previous : [...previous, removed]); setRemoved(null); setStatus('Activity restored.');
    }}>Undo activity removal</button>}
    <button className="report-copy" disabled={!shown.length} onClick={() => downloadText('activity-timeline.txt', activityTimeline(shown))}>Save shown activities</button>
    <LockedBackupTools label="journal" filename="journal-encrypted.json" enabled={!!entries.length}
      serialize={() => createActivityBackup(entries)} restore={restoreJournal} />
    <details><summary>Journal backup and restore</summary>
      <p>The JSON backup contains the full journal as readable text.</p>
      <button className="report-copy" disabled={!entries.length} onClick={() =>
        downloadText('journal-backup.json', createActivityBackup(entries), 'application/json')}>Back up journal</button>
      <label>Restore journal file<input type="file" accept=".json" onChange={async event => {
        const file = event.target.files?.[0]; event.target.value = '';
        if (!file) return;
        try {
          if (file.size > MAX_JOURNAL_BACKUP_BYTES) throw new Error('File too large.');
          restoreJournal(await file.text());
        } catch { setStatus('Choose a valid HD Cares journal backup under 2 MB.'); }
      }} /></label>
    </details>
    <button className="report-copy" disabled={!shown.length} onClick={async () => {
      try { await navigator.clipboard.writeText(activityTimeline(shown)); setStatus('Shown activities copied.'); }
      catch { setStatus('Clipboard unavailable. Save the timeline as text instead.'); }
    }}>Copy shown activities</button>
    <ol>{shown.map(entry => <li key={entry.id} className="backup-preview glass">
      <time dateTime={entry.day}>{entry.day}</time>{entry.type && <span> · {entry.type}</span>}<p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{entry.text}</p>
      <button className="report-copy" onClick={() => {
        setRemoved(entry); setEntries(previous => previous.filter(item => item.id !== entry.id));
        setStatus('Activity removed. You can undo the last removal.');
      }}>Remove activity</button>
      <button className="report-copy" disabled={tasks.length >= 500} onClick={() => {
        const task = { id: crypto.randomUUID(), title: entry.text.replace(/\s+/g, ' ').slice(0, 300), done: false, category: entry.type };
        setTasks(previous => previous.length < 500 ? [...previous, task] : previous);
        setStatus('Pending action added to your plan.');
      }}>Add activity to action plan</button>
      <button className="report-copy" aria-pressed={!!entry.pinned} onClick={() => setEntries(previous =>
        previous.map(item => item.id === entry.id ? { ...item, pinned: !item.pinned } : item))}>Pin activity</button>
      <details><summary>Edit activity</summary>
        <form className="personal-step" onSubmit={event => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const text = String(data.get('entry') ?? '').trim();
          const day = String(data.get('day') ?? '');
          if (!text || !day || !validObservationDate(day)) { setStatus('Enter activity text and a valid date.'); return; }
          setEntries(previous => previous.map(item => item.id === entry.id ? { ...item, text, day, type: activityTypes.find(type => type === data.get('type')) } : item));
          setStatus('Activity updated.');
        }}>
          <label>Corrected category<select name="type" defaultValue={entry.type ?? ''}>
            <option value="">Uncategorized</option>{activityTypes.map(type => <option key={type}>{type}</option>)}
          </select></label>
          <label>Corrected date<input name="day" type="date" required defaultValue={entry.day} max={localToday()} /></label>
          <label>Corrected activity<textarea name="entry" defaultValue={entry.text} maxLength={1000} required /></label>
          <button className="report-copy">Save activity changes</button>
        </form>
      </details>
    </li>)}</ol>
    </div>
  </section>;
}
