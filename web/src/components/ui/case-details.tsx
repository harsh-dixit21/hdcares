import { caseStages, type CaseDetails as Details } from '@/lib/workspace-backup';

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
  </details>;
}
