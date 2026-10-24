import { useRef, useState, type FormEvent } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { exportReportNotes, reportStatuses, validateReportUrl, type ReportNote } from '@/lib/report-notes';
import './report-organizer.css';
import { createReportBackup, parseReportBackup, mergeReportNotes, MAX_BACKUP_BYTES, MAX_REPORT_NOTES } from '@/lib/report-backup';

export default function ReportOrganizer() {
  const [notes, setNotes] = useState<ReportNote[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const [pending, setPending] = useState<ReportNote[] | null>(null);
  const [backupError, setBackupError] = useState('');
  const [reading, setReading] = useState(false);
  const importRequest = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (notes.length >= MAX_REPORT_NOTES) { setError('You can keep at most 500 locations in one session.'); return; }
    const url = validateReportUrl(String(data.get('url') ?? ''));
    if (!url) { setError('Enter a complete http:// or https:// URL without a username or password.'); return; }
    if (notes.some(note => note.url === url)) { setError('That URL is already in your notes. Update its status below.'); return; }
    setNotes(previous => [...previous, { id: crypto.randomUUID(), url,
      platform: String(data.get('platform')).trim() || new URL(url).hostname,
      date: String(data.get('date') ?? ''), reference: String(data.get('reference') ?? '').trim(), status: 'Not reported' }]);
    setError(''); setMessage('Location added to your private notes.'); setConfirmClear(false); form.reset();
  }
  function download(backup = false) {
    const url = URL.createObjectURL(new Blob([backup ? createReportBackup(notes) : exportReportNotes(notes)], { type: backup ? 'application/json' : 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = backup ? 'hdcares-report-backup.json' : 'hdcares-report-notes.txt';
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('Notes exported. Keep the downloaded file somewhere private.');
  }
  async function readBackup(file?: File) {
    if (!file) return;
    const request = ++importRequest.current;
    setPending(null); setBackupError(''); setReading(true);
    try {
      if (file.size > MAX_BACKUP_BYTES) throw new Error('Backup files must be smaller than 4 MB.');
      const imported = parseReportBackup(await file.text());
      if (request === importRequest.current) setPending(imported);
    } catch (cause) {
      if (request === importRequest.current) setBackupError(cause instanceof Error ? cause.message : 'Could not read this backup.');
    } finally { if (request === importRequest.current) setReading(false); }
  }
  function restore() {
    if (!pending) return;
    try {
      const merged = mergeReportNotes(notes, pending);
      const added = merged.length - notes.length;
      setNotes(merged); setPending(null); setConfirmClear(false); setBackupError('');
      setMessage(`Restored ${added} locations. Skipped ${pending.length - added} duplicate locations; existing notes were kept.`);
    } catch (cause) { setBackupError(cause instanceof Error ? cause.message : 'Could not restore this backup.'); }
  }
  return <section id="report-organizer" className="section report-organizer" aria-labelledby="organizer-title">
    <div className="demo-intro"><p className="eyebrow">ONE LOCATION AT A TIME</p><h2 id="organizer-title">Keep your next steps<br /><em>in one place.</em></h2><p>Organise known links and report references. No images needed.</p></div>
    <p className="organizer-privacy">Notes stay in this page’s memory. Reloading or closing the page clears them. Download a copy if you want to keep them. Adding a link here does not open it or send a report.</p>
    <form className="organizer-form glass" onSubmit={add}>
      <label>Content URL <span>(required)</span><input name="url" type="url" required maxLength={4000} placeholder="https://example.com/post/..." autoComplete="off" spellCheck={false} /></label>
      <label>Platform or website<input name="platform" maxLength={100} placeholder="Optional — defaults to the website name" autoComplete="off" /></label>
      <label>Date observed<input name="date" type="date" /></label>
      <label>Report reference <span>(if you have one)</span><input name="reference" maxLength={200} autoComplete="off" placeholder="Optional" /></label>
      <button className="button button-light" type="submit"><Plus size={16} /> Add location</button>
      {error && <p className="demo-error" role="alert">{error}</p>}
    </form>
    <div className="organizer-toolbar"><span>{notes.length} {notes.length === 1 ? 'location' : 'locations'} in your notes</span><div className="backup-actions"><button disabled={!notes.length} onClick={() => download()}><Download size={16} /> Download text</button><button disabled={!notes.length} onClick={() => download(true)}>Save backup</button><button disabled={reading} onClick={() => fileInput.current?.click()}>{reading ? 'Reading backup…' : 'Restore backup'}</button></div></div>
    <input ref={fileInput} className="sr-only" type="file" accept=".json,application/json" aria-label="Choose an HD Cares backup" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void readBackup(file); }} />
    <p className="demo-disclosure">Save backup creates an unencrypted JSON file you can restore later. It contains your links and references. Keep it private. Files are read locally; nothing is uploaded.</p>
    {pending !== null && <div className="backup-preview glass"><h3>Review your backup</h3><p>{pending.length} locations found. New locations will be added; duplicate URLs keep their existing notes.</p><div className="backup-actions"><button onClick={restore} disabled={!pending.length}>Add backup to notes</button><button onClick={() => { setPending(null); setBackupError(''); }}>Cancel</button></div></div>}
    {backupError && <p className="demo-error" role="alert">{backupError}</p>}
    {!notes.length && <p className="organizer-empty">Add a link you already know about to start your checklist.</p>}
    <ul className="report-list">{notes.map((note, index) => <li className="glass" key={note.id}>
      <div className="report-location"><span className="demo-label">LOCATION {String(index + 1).padStart(2, '0')}</span><h3>{note.platform}</h3><p>{note.url}</p><small>{note.date ? `Observed: ${note.date}` : 'Date not recorded'}</small></div>
      <div className="report-controls"><label>Status recorded by you<select value={note.status} onChange={event => { const status = event.target.value as ReportNote['status']; setNotes(previous => previous.map(item => item.id === note.id ? { ...item, status } : item)); }}>{reportStatuses.map(status => <option key={status}>{status}</option>)}</select></label>
      <label>Report reference<input maxLength={200} autoComplete="off" value={note.reference} onChange={event => { const reference = event.target.value; setNotes(previous => previous.map(item => item.id === note.id ? { ...item, reference } : item)); }} /></label></div>
      <button className="report-remove" onClick={() => { setNotes(previous => previous.filter(item => item.id !== note.id)); setConfirmClear(false); setMessage('Location removed.'); }} aria-label={`Remove location ${index + 1}: ${note.platform}`}><Trash2 size={17} /></button>
    </li>)}</ul>
    <p className="organizer-message" role="status">{message}</p>
    {notes.length > 0 && <div className="organizer-clear">{confirmClear ? <><span>Clear all notes from this page?</span><button onClick={() => { setNotes([]); setConfirmClear(false); setMessage('All notes cleared from this page. Previously downloaded files remain on your device.'); }}>Yes, clear notes</button><button onClick={() => setConfirmClear(false)}>Keep notes</button></> : <button onClick={() => setConfirmClear(true)}>Clear all notes</button>}</div>}
    <p className="demo-disclosure">Statuses are your own records. HD Cares does not verify removal or submit these notes. <a href="#start">Explore specialist services and official reporting options.</a></p>
  </section>;
}
