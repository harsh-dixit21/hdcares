import { useState } from 'react';
import { demoArt } from '@/lib/demo-fingerprint';

type Registration = { name: string; digest: string };
type Props = { sample: number; digest: string };

export default function PracticePlatform({ sample, digest }: Props) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
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
  </section>;
}
