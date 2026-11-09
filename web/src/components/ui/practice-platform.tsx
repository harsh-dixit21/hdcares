import { downloadText } from '@/lib/download-text';
import { useState } from 'react';
import { demoArt, demoFingerprint } from '@/lib/demo-fingerprint';

type Registration = { name: string; digest: string };
type Props = { sample: number; digest: string };

export default function PracticePlatform({ sample, digest }: Props) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [participates, setParticipates] = useState(true);
  const [editedUpload, setEditedUpload] = useState(false);
  const [events, setEvents] = useState<string[]>([]);
  const [uploadChoice, setUploadChoice] = useState(0);
  const [uploadResult, setUploadResult] = useState('');
  const [checking, setChecking] = useState(false);
  async function checkUpload() {
    setChecking(true);
    const sample = demoArt[uploadChoice];
    try {
      const fingerprint = await demoFingerprint(sample.svg + (editedUpload ? ' ' : ''));
      const match = participates && registrations.some(entry => entry.digest === fingerprint);
      setEvents(previous => [...previous, new Date().toLocaleTimeString() + ' — ' + sample.name + (match ? ' blocked' : ' allowed')]);
      setUploadResult(sample.name + (match ? ' matched. The practice platform blocked this upload.' :
        ' had no registered match. The practice platform allowed this upload.'));
    } catch { setUploadResult('Could not hash the sample. Try localhost or HTTPS.'); }
    finally { setChecking(false); }
  }
  const [scanResult, setScanResult] = useState<string[] | null>(null);
  const [scanning, setScanning] = useState(false);
  async function scanPosts() {
    setScanning(true);
    try {
      const matches = await Promise.all(demoArt.map(async art => {
        const hash = await demoFingerprint(art.svg);
        return participates && registrations.some(entry => entry.digest === hash) ? art.name : null;
      }));
      setScanResult(matches.filter((name): name is NonNullable<typeof name> => name !== null));
    } catch { setScanResult(null); setUploadResult('Could not scan the example posts.'); }
    finally { setScanning(false); }
  }
  const registered = registrations.some(item => item.digest === digest);
  return <section className="backup-preview glass" aria-label="Practice platform">
    <h3>Practice platform</h3>
    <label><input type="checkbox" checked={participates} onChange={event => setParticipates(event.target.checked)} />Platform checks registered fingerprints</label>
    {!participates && <p>This simulated platform skips matching while participation is off.</p>}
    <p>This local simulation uses built-in artwork. Register a sample fingerprint to try a platform match.</p>
    <button className="report-copy" disabled={!digest || registered} onClick={() =>
      setRegistrations(items => [...items, { name: demoArt[sample].name, digest }])}>
      {registered ? 'Sample registered' : 'Register current sample'}
    </button>
    <ul>{registrations.map(item => <li key={item.digest}>{item.name}{' '}
      <button className="report-copy" onClick={() => setRegistrations(items =>
        items.filter(entry => entry.digest !== item.digest))}>Remove registration</button>
    </li>)}</ul>
    <label><input type="checkbox" checked={editedUpload} onChange={event => setEditedUpload(event.target.checked)} />Add one trailing byte to the simulated upload</label>
    <label>Simulated upload<select value={uploadChoice} onChange={event => setUploadChoice(Number(event.target.value))}>
      {demoArt.map((art, index) => <option value={index} key={art.name}>{art.name}</option>)}
    </select></label>
    <button className="report-copy" disabled={checking} onClick={checkUpload}>Try uploading sample</button>
    <button className="report-copy" disabled={!events.length} onClick={() => setEvents([])}>Clear upload history</button>
    <p role="status">{uploadResult}</p>
    <details><summary>Upload history ({events.length})</summary><ol>{events.map((event, i) => <li key={i}>{event}</li>)}</ol></details>
    <button className="report-copy" disabled={scanning} onClick={scanPosts}>Scan two practice posts</button>
    {scanResult && <p role="status">Last scan: {scanResult.length ? scanResult.join(', ') + ' matched.' : 'No matches.'}</p>}
    <button className="report-copy" disabled={!uploadResult && !scanResult} onClick={() => {
      const lines = ['HD Cares practice session', 'Built-in artwork only. All outcomes are simulated.',
        'Current registrations: ' + (registrations.map(item => item.name).join(', ') || 'None'),
        'Last upload check: ' + (uploadResult || 'Not run'),
        'Last scan: ' + (scanResult ? scanResult.join(', ') || 'No matches' : 'Not run')];
      downloadText('practice-session.txt', lines.join('\n'));
    }}>Save demo record</button>
  </section>;
}
