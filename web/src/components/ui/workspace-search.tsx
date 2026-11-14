import { useState } from 'react';
import type { WorkspaceData } from '@/lib/workspace-backup';

export default function WorkspaceSearch({ notes, tasks, entries }: WorkspaceData) {
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');
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
  return <details className="backup-preview glass">
    <summary>Search workspace</summary>
    <label>Find records <input type="search" value={query} maxLength={200} autoComplete="off" onChange={event => setQuery(event.target.value)} /></label>
    <p role="status">{matches.length} matching records</p>
    <label>Record type <select value={type} onChange={event => setType(event.target.value)}>
      <option value="">All records</option><option>Reports</option><option>Actions</option><option>Journal</option>
    </select></label>
    <ul>{matches.slice(0, 30).map(record => <li key={record.key}>
      <a href={record.link}>{record.title}</a><p>{record.type} · {record.description}</p>
    </li>)}</ul>
  </details>;
}
