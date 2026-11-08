import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Download, Plus, Trash2, Undo2 } from 'lucide-react';
import { exportReportNotes, reportStatuses, validateReportUrl, type ReportNote } from '@/lib/report-notes';
import './report-organizer.css';
import { parsePastedLinks } from '@/lib/pasted-links';
import { downloadText } from '@/lib/download-text';
import { followUpCalendar } from '@/lib/follow-up-calendar';
import { localToday, validObservationDate } from '@/lib/report-date';
import { createReportBackup, parseReportBackup, mergeReportNotes, previewReportBackup, MAX_BACKUP_BYTES, MAX_REPORT_NOTES } from '@/lib/report-backup';
import { filterReportNotes, sortReportNotes, reportStatusCounts, type StatusFilter, type ReportSort } from '@/lib/report-filters';

export default function ReportOrganizer() {
  const [notes, setNotes] = useState<ReportNote[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [concealed, setConcealed] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [pending, setPending] = useState<ReportNote[] | null>(null);
  const [previewSource, setPreviewSource] = useState('backup');
  const backupPreview = pending ? previewReportBackup(notes, pending) : null;
  const [backupError, setBackupError] = useState('');
  const [reading, setReading] = useState(false);
  const importRequest = useRef(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All statuses');
  const [removedNotes, setRemovedNotes] = useState<ReportNote[]>([]);
  const [undoError, setUndoError] = useState('');
  const hasSessionNotes = notes.length > 0 || removedNotes.length > 0;
  useEffect(() => {
    if (!hasSessionNotes) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [hasSessionNotes]);
  const [sortOrder, setSortOrder] = useState<ReportSort>('Added order');
  const [requestedPage, setRequestedPage] = useState(1);
  const pageSize = 10;
  const [platformFilter, setPlatformFilter] = useState('');
  const [missingDetail, setMissingDetail] = useState<'any' | 'date' | 'reference'>('any');
  const platforms = [...new Set(notes.map(note => note.platform))].sort((a, b) => a.localeCompare(b));
  const matchingNotes = filterReportNotes(notes, query, statusFilter).filter(note => {
    if (platformFilter && note.platform !== platformFilter) return false;
    if (missingDetail === 'date') return !note.date;
    if (missingDetail === 'reference') return note.status !== 'Not reported' && !note.reference.trim();
    return true;
  });
  const visibleNotes = sortReportNotes(matchingNotes, sortOrder);
  const pages = Math.max(1, Math.ceil(visibleNotes.length / pageSize));
  const page = Math.min(requestedPage, pages);
  const pageNotes = visibleNotes.slice((page - 1) * pageSize, page * pageSize);
  const counts = reportStatusCounts(notes);
  function resetFilters() { setRequestedPage(1); setQuery(''); setStatusFilter('All statuses'); setPlatformFilter(''); setMissingDetail('any'); }
  async function copyLocation(note: ReportNote) {
    try {
      await navigator.clipboard.writeText(note.url);
      setMessage('Link copied. Your clipboard may be visible to other apps or synced devices.');
    } catch {
      setMessage('Clipboard access was unavailable. Select and copy the displayed link manually.');
    }
  }
  function remove(note: ReportNote) {
    setRemovedNotes([note]); setUndoError('');
    setNotes(previous => previous.filter(item => item.id !== note.id));
    setConfirmClear(false); setMessage('Location removed. You can undo this deletion below.');
  }
  function clearNotes() {
    setRemovedNotes(notes); setNotes([]); setConfirmClear(false); setUndoError('');
    importRequest.current++; setPending(null); setReading(false); setBackupError('');
    resetFilters();
    setMessage('Notes cleared from the list. Undo is available until dismissed or the page reloads. Downloaded files remain on your device.');
  }
  function undoDeletion() {
    try {
      const restored = mergeReportNotes(notes, removedNotes);
      const count = restored.length - notes.length;
      setNotes(restored); setRemovedNotes([]); setUndoError(''); setConfirmClear(false); resetFilters();
      setMessage(`Recovered ${count} locations. Existing notes for duplicate URLs were kept.`);
    } catch {
      setUndoError('Recovery would exceed 500 locations. Download your notes and free space before trying again. Your recovery copy is still available.');
    }
  }
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!validObservationDate(String(data.get('date') ?? ''))) { setError('Choose a real observation date on or before today.'); return; }
    if (notes.length >= MAX_REPORT_NOTES) { setError('You can keep at most 500 locations in one session.'); return; }
    const url = validateReportUrl(String(data.get('url') ?? ''));
    if (!url) { setError('Enter a complete http:// or https:// URL without a username or password.'); return; }
    if (notes.some(note => note.url === url)) { setError('That URL is already in your notes. Update its status below.'); return; }
    setNotes(previous => [...previous, { id: crypto.randomUUID(), url,
      platform: String(data.get('platform')).trim() || new URL(url).hostname,
      date: String(data.get('date') ?? ''), reference: String(data.get('reference') ?? '').trim(), status: 'Not reported' }]);
    setError(''); setMessage('Location added to your private notes.'); setConfirmClear(false); resetFilters(); form.reset();
  }
  function download(backup = false, selection = notes) {
    const url = URL.createObjectURL(new Blob([backup ? createReportBackup(selection) : exportReportNotes(selection)], { type: backup ? 'application/json' : 'text/plain;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = backup ? 'hdcares-report-backup.json' : selection === notes ? 'hdcares-report-notes.txt' : 'hdcares-filtered-notes.txt';
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage('Notes exported. Keep the downloaded file somewhere private.');
  }
  async function readBackup(file?: File) {
    if (!file) return;
    const request = ++importRequest.current;
    setPreviewSource('backup');
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
      setNotes(merged); setPending(null); setConfirmClear(false); setBackupError(''); resetFilters();
      setMessage(`Restored ${added} locations. Skipped ${pending.length - added} duplicate locations; existing notes were kept.`);
    } catch (cause) { setBackupError(cause instanceof Error ? cause.message : 'Could not restore this backup.'); }
  }
  return <section id="report-organizer" className="section report-organizer" aria-labelledby="organizer-title">
    <div className="demo-intro"><p className="eyebrow">ONE LOCATION AT A TIME</p><h2 id="organizer-title">Keep your next steps<br /><em>in one place.</em></h2><p>Organise known links and report references. No images needed.</p></div>
    <p className="organizer-privacy">Notes stay in this page’s memory. Reloading or closing the page clears them. Download a copy if you want to keep them. Adding a link here does not open it or send a report.</p>
    <button className="report-copy" aria-expanded={!concealed} aria-controls="private-notes-panel" onClick={() => setConcealed(value => !value)}>{concealed ? 'Show private notes' : 'Hide private notes'}</button>
    {concealed && <p className="organizer-privacy" role="status">Notes are hidden on screen and still held in this page’s memory. This does not lock or erase them.</p>}
    <div id="private-notes-panel" hidden={concealed}>
    <form className="organizer-form glass" onSubmit={add}>
      <label>Content URL <span>(required)</span><input name="url" type="url" required maxLength={4000} placeholder="https://example.com/post/..." autoComplete="off" spellCheck={false} /></label>
      <label>Platform or website<input name="platform" maxLength={100} placeholder="Optional — defaults to the website name" autoComplete="off" /></label>
      <label>Date observed<input name="date" type="date" max={localToday()} /></label>
      <label>Report reference <span>(if you have one)</span><input name="reference" maxLength={200} autoComplete="off" placeholder="Optional" /></label>
      <button className="button button-light" type="submit"><Plus size={16} /> Add location</button>
      {error && <p className="demo-error" role="alert">{error}</p>}
    </form>
    <details className="backup-preview glass"><summary>Add several links</summary>
      <form onSubmit={event => {
        event.preventDefault();
        const form = event.currentTarget;
        try {
          const incoming = parsePastedLinks(String(new FormData(form).get('links') ?? ''));
          setPending(incoming); setPreviewSource('pasted links'); setBackupError('');
          form.reset();
        } catch (cause) { setPending(null); setBackupError(cause instanceof Error ? cause.message : 'Check the pasted links.'); }
      }}>
        <label>Known links, one per line<textarea name="links" required rows={4} maxLength={2000500} autoComplete="off" spellCheck={false} /></label>
        <button className="report-copy" disabled={reading}>Preview links</button>
      </form>
    </details>
    <div className="organizer-toolbar"><span>{notes.length} {notes.length === 1 ? 'location' : 'locations'} in your notes</span><div className="backup-actions"><button disabled={!notes.length} onClick={() => download()}><Download size={16} /> Download all as text</button><button disabled={!notes.length} onClick={() => download(true)}>Back up all notes</button><button disabled={reading} onClick={() => fileInput.current?.click()}>{reading ? 'Reading backup…' : 'Restore backup'}</button></div></div>
    {notes.length > 0 && <details className="backup-preview glass"><summary>Schedule a follow-up</summary>
      <form onSubmit={event => {
        event.preventDefault();
        const day = String(new FormData(event.currentTarget).get('day') ?? '');
        try {
          downloadText('follow-up.ics', followUpCalendar(day), 'text/calendar;charset=utf-8');
          setMessage('Open the calendar file to add the event. It is titled “Follow up” and contains no note details.');
        } catch { setMessage('Choose a valid follow-up date.'); }
      }}>
        <label>Follow-up date<input type="date" name="day" required min={localToday()} /></label>
        <button className="report-copy">Save calendar event</button>
      </form>
    </details>}
    {notes.length > 0 && <button className="report-copy" onClick={() => {
      const totals = reportStatuses.map(status => status + ': ' + counts[status]);
      downloadText('status-counts.txt', ['Report status totals', ...totals].join('\n'));
      setMessage('Exported counts only. The file contains no links, platforms, dates, or references.');
    }}>Download status totals only</button>}
    <input ref={fileInput} className="sr-only" type="file" accept=".json,application/json" aria-label="Choose an HD Cares backup" onChange={event => { const file = event.target.files?.[0]; event.target.value = ''; void readBackup(file); }} />
    <p className="demo-disclosure">Save backup creates an unencrypted JSON file you can restore later. It contains your links and references. Keep it private. Files are read locally; nothing is uploaded.</p>
    {pending !== null && <div className="backup-preview glass"><h3>Review your {previewSource}</h3><p>{backupPreview?.added} new locations; {backupPreview?.duplicates} duplicates will be skipped. Existing notes will be kept. {backupPreview?.exceedsLimit && 'This would exceed the 500-location limit. Free space before restoring.'}</p><div className="backup-actions"><button onClick={restore} disabled={!backupPreview?.added || backupPreview.exceedsLimit}>Add to notes</button><button onClick={() => { setPending(null); setBackupError(''); }}>Cancel</button></div></div>}
    {backupError && <p className="demo-error" role="alert">{backupError}</p>}
    {removedNotes.length > 0 && <div className="report-undo glass">
      <button className="report-copy" onClick={() => download(true, removedNotes)}>Download recovery backup</button>
      <div><h3>Recover your last deletion</h3><p>{removedNotes.length} {removedNotes.length === 1 ? 'location is' : 'locations are'} available to recover. A new deletion replaces this recovery copy. Reloading or dismissing clears it.</p></div>
      <div className="backup-actions"><button onClick={undoDeletion}><Undo2 size={16} /> Undo deletion</button><button onClick={() => { setRemovedNotes([]); setUndoError(''); setMessage('Recovery copy dismissed.'); }}>Dismiss recovery copy</button></div>
      {undoError && <p className="demo-error" role="alert">{undoError}</p>}
    </div>}
    {notes.length > 0 && <div className="report-filter-panel glass">
      <button className="report-copy" disabled={!visibleNotes.length} onClick={() => download(false, visibleNotes)}>Download all matches ({visibleNotes.length})</button>
      <label>Missing details<select value={missingDetail} onChange={event => {
        setMissingDetail(event.target.value as typeof missingDetail);
        setRequestedPage(1);
      }}>
        <option value="any">Any completeness</option>
        <option value="date">No observation date</option>
        <option value="reference">Reported without a reference</option>
      </select></label>
      <label>Website or platform<select value={platformFilter} onChange={event => { setPlatformFilter(event.target.value); setRequestedPage(1); }}><option value="">All platforms</option>{[...new Set([...platforms, ...(platformFilter ? [platformFilter] : [])])].map(platform => <option key={platform} value={platform}>{platform}</option>)}</select></label>
      <label>Sort locations<select value={sortOrder} onChange={event => { setSortOrder(event.target.value as ReportSort); setRequestedPage(1); }}>{['Added order', 'Newest observed', 'Oldest observed', 'Platform'].map(order => <option key={order}>{order}</option>)}</select></label>
      <div className="report-summary" aria-label="All locations by status">{reportStatuses.map(status => <span key={status}><strong>{counts[status]}</strong> {status}</span>)}</div>
      <div className="report-filters"><label>Search your notes<input type="search" value={query} maxLength={200} autoComplete="off" placeholder="Website, link, reference, or date" onChange={event => { setQuery(event.target.value); setRequestedPage(1); }} aria-controls="report-results" /></label><label>Filter by status<select value={statusFilter} onChange={event => { setStatusFilter(event.target.value as StatusFilter); setRequestedPage(1); }} aria-controls="report-results"><option>All statuses</option>{reportStatuses.map(status => <option key={status}>{status}</option>)}</select></label><button onClick={resetFilters} disabled={!query && statusFilter === 'All statuses' && !platformFilter && missingDetail === 'any'}>Reset filters</button></div>
      <p className="report-result-count" role="status">{visibleNotes.length} of {notes.length} locations match. Downloads include matches across every page.</p>
    </div>}
    {!notes.length && <div className="organizer-empty">
      <p>Add a known link, or explore the organizer with two fictional examples.</p>
      <button className="report-copy" disabled={reading || pending !== null || removedNotes.length > 0} onClick={() => {
        const practiceNotes: ReportNote[] = [
          { id: crypto.randomUUID(), url: 'https://example.invalid/sample-one', platform: 'Example forum', date: localToday(), reference: '', status: 'Not reported' },
          { id: crypto.randomUUID(), url: 'https://example.invalid/sample-two', platform: 'Example gallery', date: localToday(), reference: 'DEMO-02', status: 'Following up' },
        ];
        setNotes(practiceNotes);
        resetFilters();
        setMessage('Two fictional practice notes added. Clear the list when you finish exploring.');
      }}>Load practice notes</button>
    </div>}
    {notes.length > 0 && !visibleNotes.length && <p className="organizer-empty">No locations match these filters. Try a different search or reset filters.</p>}
    {pages > 1 && <nav className="backup-actions" aria-label="Report results pages">
      <button className="report-copy" disabled={page === 1} onClick={() => setRequestedPage(page - 1)}>Previous</button>
      <span role="status">Page {page} of {pages}</span>
      <button className="report-copy" disabled={page === pages} onClick={() => setRequestedPage(page + 1)}>Next</button>
    </nav>}
    <ul id="report-results" className="report-list">{pageNotes.map(note => { const index = notes.findIndex(item => item.id === note.id); return <li className="glass" key={note.id}>
      <div className="report-location"><span className="demo-label">LOCATION {String(index + 1).padStart(2, '0')}</span><h3>{note.platform}</h3><p>{note.url}</p><small>{note.date ? `Observed: ${note.date}` : 'Date not recorded'}</small></div>
      <div className="report-controls"><label>Status recorded by you<select value={note.status} onChange={event => { const status = event.target.value as ReportNote['status']; setNotes(previous => previous.map(item => item.id === note.id ? { ...item, status } : item)); }}>{reportStatuses.map(status => <option key={status}>{status}</option>)}</select></label>
      <button className="report-copy" onClick={() => void copyLocation(note)}>Copy link</button>
      <label>Platform or website<input maxLength={100} value={note.platform} autoComplete="off" onChange={event => { const platform = event.target.value; setNotes(previous => previous.map(item => item.id === note.id ? { ...item, platform } : item)); }} onBlur={() => setNotes(previous => previous.map(item => item.id === note.id ? { ...item, platform: item.platform.trim() || new URL(item.url).hostname } : item))} /></label>
      <label>Date observed<input type="date" max={localToday()} value={note.date} onChange={event => { const date = event.target.value; if (!validObservationDate(date)) { setMessage('Choose an observation date on or before today.'); return; } setNotes(previous => previous.map(item => item.id === note.id ? { ...item, date } : item)); }} /></label>
      <label>Report reference<input maxLength={200} autoComplete="off" value={note.reference} onChange={event => { const reference = event.target.value; setNotes(previous => previous.map(item => item.id === note.id ? { ...item, reference } : item)); }} /></label></div>
      <button className="report-remove" onClick={() => remove(note)} aria-label={`Remove location ${index + 1}: ${note.platform}`}><Trash2 size={17} /></button>
    </li>; })}</ul>
    <p className="organizer-message" role="status">{message}</p>
    {notes.length > 0 && <div className="organizer-clear">{confirmClear ? <><span>Clear all notes? A temporary undo copy will remain until dismissed or reloaded.</span><button onClick={clearNotes}>Yes, clear notes</button><button onClick={() => setConfirmClear(false)}>Keep notes</button></> : <button onClick={() => setConfirmClear(true)}>Clear all notes</button>}</div>}
    </div>
    <p className="demo-disclosure">Statuses are your own records. HD Cares does not verify removal or submit these notes. <a href="#start">Explore specialist services and official reporting options.</a></p>
  </section>;
}
