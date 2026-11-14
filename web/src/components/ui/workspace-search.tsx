import { useState } from 'react';
import type { WorkspaceData } from '@/lib/workspace-backup';

export default function WorkspaceSearch({ notes, tasks, entries }: WorkspaceData) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
  const [requestedPage, setPage] = useState(1);
  const [alphabetical, setAlphabetical] = useState(false);
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const records = [
    ...notes.map(note => ({ key: 'report-' + note.id, type: 'Reports', title: note.platform, description: note.url, search: note.reference + ' ' + note.status, link: '#report-organizer' })),
    ...tasks.map(task => ({ key: 'action-' + task.id, type: 'Actions', title: task.title || 'Untitled action', description: task.category ?? '', search: task.context ?? '', link: '#personal-plan' })),
    ...entries.map(entry => ({ key: 'journal-' + entry.id, type: 'Journal', title: entry.text, description: entry.day, search: entry.type ?? '', link: '#activity-journal' })),
  ];
  const matches = records.filter(record => {
    const content = [record.title, record.description, record.search].join(' ').toLowerCase();
    return (!type || type === record.type) && words.every(word => content.includes(word));
  });
  if (alphabetical) matches.sort((a, b) => a.title.localeCompare(b.title));
  const pages = Math.max(1, Math.ceil(matches.length / 10));
  const page = Math.min(requestedPage, pages);
  return <details className="backup-preview glass">
    <summary>Search workspace</summary>
    <label>Find records <input type="search" value={query} maxLength={200} autoComplete="off" onChange={event => { setQuery(event.target.value); setPage(1); }} /></label>
    <p role="status">{matches.length} matching records</p>
    <label>Record type <select value={type} onChange={event => { setType(event.target.value); setPage(1); }}>
      <option value="">All records</option><option>Reports</option><option>Actions</option><option>Journal</option>
    </select></label>
    <label><input type="checkbox" checked={alphabetical} onChange={event => {
      setAlphabetical(event.target.checked); setPage(1);
    }} />Sort records by title</label>
    <ul>{matches.slice((page - 1) * 10, page * 10).map(record => <li key={record.key}>
      <a href={record.link}>{record.title}</a><p>{record.type} · {record.description}</p>
    </li>)}</ul>
    {pages > 1 && <nav className="backup-actions" aria-label="Workspace results pages">
      <button className="report-copy" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous results</button>
      <span>Page {page} of {pages}</span>
      <button className="report-copy" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next results</button>
    </nav>}
  </details>;
}
