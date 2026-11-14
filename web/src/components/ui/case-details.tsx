import { caseStages, type CaseDetails as Details } from '@/lib/workspace-backup';

import { downloadText } from '@/lib/download-text';

export default function CaseDetails({ value, onChange }: { value: Details; onChange: (value: Details) => void }) {
  return <details className="backup-preview glass">
    <summary>Case details</summary>
    <p>Keep a short label in this session so you know which case you’re working on.</p>
    <label>Case title <input value={value.title ?? ''} maxLength={100} autoComplete="off"
      onChange={event => onChange({ ...value, title: event.target.value })} /></label>
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
        value.stage && 'Stage: ' + value.stage, value.summary].filter(Boolean).join('\n\n'))}>Save case details</button>
  </details>;
}
