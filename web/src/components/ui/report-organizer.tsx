import { useState, type FormEvent } from 'react';
import { Download, Plus, Trash2 } from 'lucide-react';
import { exportReportNotes, reportStatuses, validateReportUrl, type ReportNote } from '@/lib/report-notes';
import './report-organizer.css';

export default function ReportOrganizer() {
  const [notes, setNotes] = useState<ReportNote[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const url = validateReportUrl(String(data.get('url') ?? ''));
    if (!url) { setError('Enter a complete http:// or https:// URL without a username or password.'); return; }
    if (notes.some(note => note.url === url)) { setError('That URL is already in your notes. Update its status below.'); return; }
    setNotes(previous => [...previous, { id: crypto.randomUUID(), url,
      platform: String(data.get('platform')).trim() || new URL(url).hostname,
      date: String(data.get('date') ?? ''), reference: String(data.get('reference') ?? '').trim(), status: 'Not reported' }]);
    setError(''); setMessage('Location added to your private notes.'); setConfirmClear(false); form.reset();
  }
  function download() {
    const url = URL.createObjectURL(new Blob([exportReportNotes(notes)], { type: 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = 'hdcares-report-notes.txt';
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('Notes exported. Keep the downloaded file somewhere private.');
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
    <div className="organizer-toolbar"><span>{notes.length} {notes.length === 1 ? 'location' : 'locations'} in your notes</span><button disabled={!notes.length} onClick={download}><Download size={16} /> Download notes</button></div>
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
