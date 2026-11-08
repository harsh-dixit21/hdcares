import type { ReportNote } from '@/lib/report-notes';
import { downloadText } from '@/lib/download-text';

type Props = { note: ReportNote; edited?: string; onEdit: (value?: string) => void };
export default function FollowUpDraft({ note, edited, onEdit }: Props) {
  const template = ['Hello,', 'I am following up about my report to ' + note.platform + '.',
    note.reference && 'My report reference is ' + note.reference + '.',
    'Could you let me know the status and whether you need anything else from me?'].filter(Boolean).join('\n');
  const draft = edited ?? template;
  return <details><summary>Draft a follow-up request</summary>
    <label>Message to review<textarea rows={5} value={draft} maxLength={4000}
      onChange={event => onEdit(event.target.value)} /></label>
    <button className="report-copy" disabled={!draft.trim()} onClick={() => downloadText('follow-up-draft.txt', draft)}>Save draft</button>
    <button className="report-copy" disabled={edited === undefined} onClick={() => onEdit(undefined)}>Use current report details</button>
  </details>;
}
