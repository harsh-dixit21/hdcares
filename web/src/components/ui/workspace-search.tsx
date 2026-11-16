import { useState } from 'react';
import type { WorkspaceData } from '@/lib/workspace-backup';

export default function WorkspaceSearch({ notes, tasks, entries }: WorkspaceData) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [requestedPage, setPage] = useState(1);
  const [alphabetical, setAlphabetical] = useState(false);
  const [openOnly, setOpenOnly] = useState(false);
  const [dateOrder, setDateOrder] = useState('');
  const [datedOnly, setDatedOnly] = useState(false);
  const [from, setFrom] = useState('');
  const [through, setThrough] = useState('');
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const records = [
    ...notes.map(note => ({ key: 'report-' + note.id, type: 'Reports', day: note.date, closed: note.status === 'Resolved', title: note.platform, description: note.url, search: note.reference + ' ' + note.status, link: '#report-organizer' })),
    ...tasks.map(task => ({ key: 'action-' + task.id, type: 'Actions', day: task.due ?? '', closed: task.done, title: task.title || 'Untitled action', description: task.category ?? '', search: task.context ?? '', link: '#personal-plan' })),
    ...entries.map(entry => ({ key: 'journal-' + entry.id, type: 'Journal', day: entry.day, closed: false, title: entry.text, description: entry.day, search: entry.type ?? '', link: '#activity-journal' })),
  ];
  const matches = records.filter(record => {
    if ((from || through) && (!record.day || (from && record.day < from) || (through && record.day > through))) return false;
    const content = [record.title, record.description, record.search, record.day].join(' ').toLowerCase();
    return (!datedOnly || !!record.day) && (!openOnly || !record.closed) && (!type || type === record.type) && words.every(word => content.includes(word));
  });
  if (alphabetical) matches.sort((a, b) => a.title.localeCompare(b.title));
  if (dateOrder) matches.sort((a, b) => {
    if (!a.day || !b.day) return Number(!a.day) - Number(!b.day);
    return dateOrder === 'old' ? a.day.localeCompare(b.day) : b.day.localeCompare(a.day);
  });
  const pages = Math.max(1, Math.ceil(matches.length / 10));
  const page = Math.min(requestedPage, pages);
  return <details className="backup-preview glass">
    <summary>Search workspace</summary>
    <label>Find records <input type="search" value={query} placeholder="Name, reference, or YYYY-MM-DD" maxLength={200} autoComplete="off" onChange={event => { setQuery(event.target.value); setPage(1); }} /></label>
    <p role="status">{matches.length} matching records</p>
    <label>Record type <select value={type} onChange={event => { setType(event.target.value); setPage(1); }}>
      <option value="">All records</option><option>Reports</option><option>Actions</option><option>Journal</option>
    </select></label>
    <label><input type="checkbox" checked={alphabetical} onChange={event => {
      setAlphabetical(event.target.checked); setPage(1);
    }} />Sort records by title</label>
    <label><input type="checkbox" checked={openOnly} onChange={event => {
      setOpenOnly(event.target.checked); setPage(1);
    }} />Hide completed actions and resolved reports</label>
    <button className="report-copy" disabled={!query && !type && !alphabetical && !openOnly && !dateOrder && !datedOnly && !from && !through} onClick={() => {
      setQuery(''); setType(''); setAlphabetical(false); setOpenOnly(false); setDateOrder(''); setDatedOnly(false); setFrom(''); setThrough(''); setPage(1);
    }}>Reset workspace search</button>
    <label>Order by record date<select value={dateOrder} onChange={event => {
      setDateOrder(event.target.value); setPage(1);
    }}><option value="">Use current order</option><option value="new">Newest first</option><option value="old">Oldest first</option></select></label>
    <label><input type="checkbox" checked={datedOnly} onChange={event => {
      setDatedOnly(event.target.checked); setPage(1);
    }} />Dated records only</label>
    <fieldset className="report-dates"><legend>Record date range</legend>
      <label>From<input type="date" value={from} onChange={event => { setFrom(event.target.value); setPage(1); }} /></label>
      <label>Through<input type="date" value={through} onChange={event => { setThrough(event.target.value); setPage(1); }} /></label>
      {from && through && from > through && <p role="status">Choose an end date on or after the start date.</p>}
    </fieldset>
    <ul>{matches.slice((page - 1) * 10, page * 10).map(record => <li key={record.key}>
      <a href={record.link}>{record.title}</a><p>{record.type} · {record.description}{record.day && record.day !== record.description && <> · <time dateTime={record.day}>{record.day}</time></>}</p>
    </li>)}</ul>
    {pages > 1 && <nav className="backup-actions" aria-label="Workspace results pages">
      <button className="report-copy" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous results</button>
      <span>Page {page} of {pages}</span>
      <button className="report-copy" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next results</button>
    </nav>}
  </details>;
}
