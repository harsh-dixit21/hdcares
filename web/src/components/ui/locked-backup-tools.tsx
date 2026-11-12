import { useRef, useState, type FormEvent } from 'react';
import { downloadText } from '@/lib/download-text';
import { lockBackup } from '@/lib/locked-backup';

type Props = { label: string; filename: string; enabled: boolean; serialize: () => string };

export default function LockedBackupTools({ label, filename, enabled, serialize }: Props) {
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const running = useRef(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!enabled || running.current) return;
    const form = event.currentTarget;
    const password = String(new FormData(form).get('password') ?? '');
    if (password.trim().length < 12) { setMessage('Choose a passphrase of at least 12 characters.'); return; }
    running.current = true;
    setBusy(true);
    setMessage('');
    try {
      downloadText(filename, await lockBackup(serialize(), password), 'application/json');
      form.reset();
      setMessage('Encrypted backup downloaded.');
    } catch { setMessage('Could not encrypt this file. Check that the app runs on HTTPS or localhost.'); }
    finally { running.current = false; setBusy(false); }
  }

  return <details className="backup-preview glass">
    <summary>Password-protected {label} backup</summary>
    <p>Keep the passphrase. You need it to open the backup.</p>
    <form className="personal-step" onSubmit={save}>
      <label>New backup passphrase<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={256} /></label>
      <button className="report-copy" disabled={!enabled || busy}>Download encrypted backup</button>
    </form>
    <p role="status">{message}</p>
  </details>;
}
