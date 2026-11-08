import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Fingerprint, LockKeyhole, RotateCcw } from 'lucide-react';
import { demoArt, demoFingerprint } from '@/lib/demo-fingerprint';
import './product-demos.css';
import PracticePlatform from './practice-platform';

export default function FingerprintDemo() {
  const [sample, setSample] = useState(0);
  const [digest, setDigest] = useState('');
  const [busy, setBusy] = useState(false);
  const [comparedDigest, setComparedDigest] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [enteredHash, setEnteredHash] = useState('');
  const generation = useRef(0);
  function reset(index = sample) {
    generation.current++;
    setEnteredHash('');
    setSample(index); setDigest(''); setComparedDigest(''); setBusy(false); setResult(''); setError('');
  }
  async function generate() {
    const request = ++generation.current;
    setBusy(true); setError(''); setResult(''); setComparedDigest('');
    try {
      const value = await demoFingerprint(demoArt[sample].svg);
      if (request === generation.current) setDigest(value);
    } catch {
      if (request === generation.current) setError('This browser cannot run the demo here. Open the app on localhost or HTTPS and try again.');
    } finally { if (request === generation.current) setBusy(false); }
  }
  async function compare(kind: 'identical' | 'different' | 'edited') {
    const request = ++generation.current;
    setBusy(true); setError('');
    try {
      const original = demoArt[sample].svg;
      const source = kind === 'edited' ? original + ' ' : kind === 'identical' ? original : demoArt[1 - sample].svg;
      const candidate = await demoFingerprint(source);
      if (request !== generation.current) return;
      setComparedDigest(candidate);
      setResult(candidate === digest
        ? 'Exact match: identical sample bytes produce the same fingerprint.'
        : kind === 'edited' ? 'One trailing space changed the fingerprint even though the artwork looks identical.' : 'Different fingerprint: this artwork has different bytes.');
    } catch { if (request === generation.current) setError('Comparison failed. Please try again.'); }
    finally { if (request === generation.current) setBusy(false); }
  }
  return <section id="fingerprint-demo" className="section demo-section" aria-labelledby="fingerprint-title">
    <div className="demo-intro"><p className="eyebrow">PRIVACY, MADE VISIBLE / INTERACTIVE DEMO</p><h2 id="fingerprint-title">An image becomes<br /><em>a fingerprint.</em></h2><p>Try it with our sample artwork. Everything in this demo is calculated in your browser.</p></div>
    <div className="fingerprint-lab glass">
      <div className="sample-panel"><span className="demo-label">01 / CHOOSE SAMPLE ARTWORK</span>
        <div className="sample-options">{demoArt.map((art, index) => <button key={art.name} aria-pressed={sample === index} onClick={() => reset(index)}>{art.name}</button>)}</div>
        <motion.img key={sample} initial={{ opacity: 0, rotateY: -12 }} animate={{ opacity: 1, rotateY: 0 }} className="demo-art" src={`data:image/svg+xml,${encodeURIComponent(demoArt[sample].svg)}`} alt={`Abstract landscape: ${demoArt[sample].name}`} />
        <p className="demo-note"><LockKeyhole size={14} /> Built-in samples only. No upload required.</p>
      </div>
      <div className="digest-panel"><span className="demo-label">02 / CREATE A DIGITAL SIGNATURE</span>
        <motion.div className="digest-icon" key={digest || 'empty'} initial={{ scale: .85, rotateY: -35 }} animate={{ scale: 1, rotateY: 0 }} transition={{ type: 'spring', damping: 15 }}><Fingerprint size={80} strokeWidth={1} /></motion.div>
        <div className="digest-output" aria-live="polite">{digest ? <><span>SHA-256 / COMPUTED LOCALLY</span><code>{digest}</code></> : <p>Your sample’s fingerprint will appear here.</p>}</div>
        <div className="demo-actions"><button className="button button-light" disabled={busy} onClick={generate}>{busy ? 'Calculating…' : digest ? 'Generate again' : 'Generate fingerprint'}</button><button className="demo-reset" onClick={() => reset()} aria-label="Reset fingerprint demo"><RotateCcw size={17} /></button></div>
        {digest && <div className="compare-panel"><span className="demo-label">03 / TRY A MATCH</span><div className="demo-actions"><button disabled={busy} onClick={() => compare('identical')}>Compare identical copy</button><button disabled={busy} onClick={() => compare('different')}>Compare other artwork</button><button disabled={busy} onClick={() => compare('edited')}>Change one byte</button></div></div>}
        {digest && <details className="compare-panel">
          <summary>Verify a fingerprint</summary>
          <label>SHA-256 value<input value={enteredHash} maxLength={128} spellCheck={false}
            autoComplete="off" onChange={event => setEnteredHash(event.target.value)} /></label>
          <p role="status">{enteredHash.trim() && (
            !/^[a-f0-9]{64}$/i.test(enteredHash.trim()) ? 'Enter 64 hexadecimal digits.' :
            enteredHash.trim().toLowerCase() === digest ? 'Matches this sample.' : 'Different from this sample.'
          )}</p>
        </details>}
        {comparedDigest && <div className="digest-output">
          <span>COMPARISON FINGERPRINT</span><code>{comparedDigest}</code>
          <p>{Array.from(comparedDigest).filter((digit, i) => digit !== digest[i]).length} of 64 hexadecimal digits differ.</p>
        </div>}
        <p className="demo-result" role="status">{result}</p>{error && <p role="alert" className="demo-error">{error}</p>}
      </div>
    </div>
    <PracticePlatform sample={sample} digest={digest} />
    <p className="demo-disclosure">This demonstrates exact-byte hashing, not perceptual image matching. Even a small file change can produce a different SHA-256 value. Nothing is registered, uploaded, or blocked; real protection requires specialist matching and participating platforms.</p>
  </section>;
}
