import { useState } from "react";
import { caseStages, type CaseDetails as Details } from '@/lib/workspace-backup';

import { useCaseWorkspace } from './case-workspace';
import { followUpCalendar } from '@/lib/follow-up-calendar';
import { downloadText } from '@/lib/download-text';

export default function CaseDetails({ value, onChange }: { value: Details; onChange: (value: Details) => void }) {
  const { tasks, setTasks } = useCaseWorkspace();
  const [feedback, setFeedback] = useState('');
  const [confirm, setConfirm] = useState(false);
  return <details className="backup-preview glass">
    <summary>Case details</summary>
    <p>Keep a short label in this session so you know which case you’re working on.</p>
    <label>Case title <input value={value.title ?? ''} maxLength={100} autoComplete="off"
      onChange={event => onChange({ ...value, title: event.target.value })} /></label>
    <label>Case opened on <input type="date" max="9999-12-31" value={value.opened ?? ''}
      onChange={event => onChange({ ...value, opened: event.target.value })} /></label>
    <label>Next case review <input type="date" max="9999-12-31" value={value.review ?? ''}
      onChange={event => onChange({ ...value, review: event.target.value })} /></label>
    <button className="report-copy" disabled={!value.review} onClick={() => {
      try { downloadText('case-review.ics', followUpCalendar(value.review ?? ''), 'text/calendar;charset=utf-8'); }
      catch { setFeedback('Choose a valid review date.'); }
    }}>Save case review calendar event</button>
    <button className="report-copy" disabled={!value.review || tasks.length >= 500 ||
      tasks.some(task => !task.done && task.title === 'Review case status' && task.due === value.review)} onClick={() => {
      if (!value.review) return;
      const action = { id: crypto.randomUUID(), title: 'Review case status', due: value.review, done: false };
      setTasks(previous => previous.length < 500 ? [...previous, action] : previous);
      setFeedback('Case review added to your action plan.');
    }}>Add review to action plan</button>
    <label>Case stage <select value={value.stage ?? ''} onChange={event =>
      onChange({ ...value, stage: caseStages.find(stage => stage === event.target.value) })}>
      <option value="">Choose a stage</option>{caseStages.map(stage => <option key={stage}>{stage}</option>)}
    </select></label>
    <label>Case reference <input maxLength={100} value={value.reference ?? ''} autoComplete="off"
      onChange={event => onChange({ ...value, reference: event.target.value })} /></label>
    <label>Case summary <textarea rows={4} maxLength={1500} value={value.summary ?? ''} autoComplete="off"
      onChange={event => onChange({ ...value, summary: event.target.value })} /></label>
    <button className="report-copy" disabled={!Object.values(value).some(item => item?.trim())} onClick={() =>
      downloadText('case-details.txt', [value.title, value.reference && 'Reference: ' + value.reference,
        value.stage && 'Stage: ' + value.stage, value.opened && 'Opened: ' + value.opened, value.review && 'Review: ' + value.review, value.summary].filter(Boolean).join('\n\n'))}>Save case details</button>
    <button className="report-copy" disabled={!value.reference?.trim()} onClick={async () => {
      try { await navigator.clipboard.writeText(value.reference ?? ''); setFeedback('Case reference copied.'); }
      catch { setFeedback('Clipboard unavailable. Select the case reference and copy it manually.'); }
    }}>Copy case reference</button>
    <p role="status">{feedback}</p>
    {confirm ? <div>
      <p>Clear the title, reference, stage, and summary?</p>
      <button className="report-copy" onClick={() => { onChange({}); setConfirm(false); }}>Clear case details</button>
      <button className="report-copy" onClick={() => setConfirm(false)}>Keep case details</button>
    </div> : <button className="report-copy" disabled={!Object.values(value).some(Boolean)} onClick={() => setConfirm(true)}>Reset case details</button>}
  </details>;
}
