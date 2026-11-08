import { downloadText } from '@/lib/download-text';
import { useState } from 'react';
import { demoArt, demoFingerprint } from '@/lib/demo-fingerprint';

type Registration = { name: string; digest: string };
type Props = { sample: number; digest: string };

export default function PracticePlatform({ sample, digest }: Props) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [uploadChoice, setUploadChoice] = useState(0);
  const [uploadResult, setUploadResult] = useState('');
  const [checking, setChecking] = useState(false);
  async function checkUpload() {
    setChecking(true);
    const sample = demoArt[uploadChoice];
    try {
      const fingerprint = await demoFingerprint(sample.svg);
      const match = registrations.some(entry => entry.digest === fingerprint);
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
        return registrations.some(entry => entry.digest === hash) ? art.name : null;
      }));
      setScanResult(matches.filter((name): name is NonNullable<typeof name> => name !== null));
    } catch { setScanResult(null); setUploadResult('Could not scan the example posts.'); }
    finally { setScanning(false); }
  }
  const registered = registrations.some(item => item.digest === digest);
  return <section className="backup-preview glass" aria-label="Practice platform">
    <h3>Practice platform</h3>
    <p>This local simulation uses built-in artwork. Register a sample fingerprint to try a platform match.</p>
    <button className="report-copy" disabled={!digest || registered} onClick={() =>
      setRegistrations(items => [...items, { name: demoArt[sample].name, digest }])}>
      {registered ? 'Sample registered' : 'Register current sample'}
    </button>
    <ul>{registrations.map(item => <li key={item.digest}>{item.name}{' '}
      <button className="report-copy" onClick={() => setRegistrations(items =>
        items.filter(entry => entry.digest !== item.digest))}>Remove registration</button>
    </li>)}</ul>
    <label>Simulated upload<select value={uploadChoice} onChange={event => setUploadChoice(Number(event.target.value))}>
      {demoArt.map((art, index) => <option value={index} key={art.name}>{art.name}</option>)}
    </select></label>
    <button className="report-copy" disabled={checking} onClick={checkUpload}>Try uploading sample</button>
    <p role="status">{uploadResult}</p>
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
