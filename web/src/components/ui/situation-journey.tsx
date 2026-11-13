import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Heart, ScanLine, Shield } from 'lucide-react';
import './product-demos.css';
import { downloadText } from '@/lib/download-text';

const paths = [
  { title: 'I’m worried it may be shared', icon: Shield, heading: 'Start with what you can control.', intro: 'You can explore your options without sharing an image here.', steps: ['Explore how a digital fingerprint works using our sample artwork.', 'Review the eligibility and privacy information of specialist services.', 'Choose whether to take the next step with a service.'], link: '#fingerprint-demo', action: 'Try the fingerprint demo' },
  { title: 'It’s already online', icon: ScanLine, heading: 'Take it one location at a time.', intro: 'This preview helps you think through the process. It does not submit reports.', steps: ['Organise the links you already know, dates, and platform names.', 'Review the relevant platform’s reporting options.', 'Keep any report references so you can follow up.'], link: '#report-organizer', action: 'Organise your report notes' },
  { title: 'I’m helping someone', icon: Heart, heading: 'Let their choices lead.', intro: 'You can offer practical support without asking to see their private images.', steps: ['Listen and ask what kind of help they would like.', 'Offer to explore support options together, at their pace.', 'Let them decide what information to share and which steps to take.'], link: '#support', action: 'Explore support' },
] as const;

import { WorkspaceOverview, useCaseWorkspace } from './case-workspace';
export default function SituationJourney() {
  const { tasks, setTasks } = useCaseWorkspace();
  const [planMessage, setPlanMessage] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState<boolean[][]>(() => paths.map(() => [false, false, false]));
  const [steps, setSteps] = useState<string[][]>(() => paths.map(path => [...path.steps]));
  const [supportDraft, setSupportDraft] = useState('I’m here for you. Would it help if I listened, sat with you, or helped you look through your options?');
  const [remainingOnly, setRemainingOnly] = useState(false);
  const [clipboardMessage, setClipboardMessage] = useState('');
  const [glossaryQuery, setGlossaryQuery] = useState('');
  const path = selected === null ? null : paths[selected];
  const count = selected === null ? 0 : checked[selected].filter(Boolean).length;
  return <section id="next-step" className="section situation-section" aria-labelledby="situation-title">
    <div className="demo-intro"><p className="eyebrow">YOUR SITUATION. YOUR PACE.</p><h2 id="situation-title">Where would you<br /><em>like to begin?</em></h2><p>Choose what feels closest. You can change your choice at any time.</p></div>
    <button className="report-copy" onClick={() => downloadText('all-checklists.txt',
      paths.map((path, route) => [path.title, ...steps[route].map((step, i) =>
        (checked[route][i] ? '[x] ' : '[ ] ') + step)].join('\n')).join('\n\n'))}>Save all checklists</button>
    <details><summary>Keyboard shortcuts</summary><p>Alt+1 opens Tools, Alt+2 opens Report organizer, and Alt+3 opens My action plan. Browser shortcuts may take precedence.</p></details>
    <WorkspaceOverview />
    <nav aria-label="Tool shortcuts" className="tool-shortcuts">
      <a href="#fingerprint-demo">Fingerprint demo</a>
      <a href="#report-organizer">Report organizer</a>
      <a href="#start">Specialist services</a>
    </nav>
    <details className="backup-preview glass">
      <summary>Terms used in the tools</summary>
      <label>Find a term<input type="search" value={glossaryQuery} onChange={event => setGlossaryQuery(event.target.value)} /></label>
      <dl>{[
        ['Fingerprint', 'A value calculated from a file. The demo compares exact file contents.'],
        ['Participating platform', 'A service that checks uploads against registered fingerprints under its own policies.'],
        ['Report reference', 'An identifier a platform gives you after you submit a report.'],
        ['Backup', 'A file you download so you can restore your notes later.']
      ].filter(([term, meaning]) => (term + ' ' + meaning).toLowerCase().includes(glossaryQuery.trim().toLowerCase())).map(([term, meaning]) => <div key={term}><dt><strong>{term}</strong></dt><dd>{meaning}</dd></div>)}</dl>
    </details>
    <div className="situation-options" role="group" aria-label="Choose your situation">{paths.map(({ title, icon: Icon }, index) => <button key={title} className="glass" aria-pressed={selected === index} aria-controls="situation-details" onClick={() => setSelected(index)}><Icon size={25} strokeWidth={1.3} /><span>{title}<small className="route-progress">{checked[index].filter(Boolean).length} of {steps[index].length} reviewed</small></span><ArrowUpRight size={18} /></button>)}</div>
    <div id="situation-details" aria-live="polite">{path && selected !== null ? <motion.div className="situation-detail glass" key={selected} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div><span className="demo-label">A PERSONAL STARTING POINT</span><h3>{path.heading}</h3><p>{path.intro}</p><a className="inline-link" href={path.link}>{path.action}<ArrowUpRight size={16} /></a></div>
      <div><span className="demo-label">{count} OF {steps[selected].length} REVIEWED</span><div className="checklist-progress" aria-hidden="true"><motion.div animate={{ scaleX: count / steps[selected].length }} /></div><label className="situation-check"><input type="checkbox" checked={remainingOnly} onChange={event => setRemainingOnly(event.target.checked)} />Show only remaining steps</label>
      {remainingOnly && count === steps[selected].length && <p>All steps reviewed.</p>}
      {steps[selected].map((step, index) => (!remainingOnly || !checked[selected][index]) && <label className="situation-check" key={index}><input type="checkbox" checked={checked[selected][index]} onChange={event => { const value = event.target.checked; setChecked(previous => previous.map((items, route) => route === selected ? items.map((item, i) => i === index ? value : item) : items)); }} /><span>{step}</span></label>)}<button className="review-reset" onClick={() => setChecked(previous => previous.map((items, route) => route === selected ? items.map(() => false) : items))}>Reset this checklist</button></div>
      {selected === 2 && <div className="support-draft">
        <label>Draft a message of support<textarea rows={4} value={supportDraft} maxLength={2000}
          onChange={event => setSupportDraft(event.target.value)} /></label>
        <details><summary>Add a conversation starter</summary>
          {['Would you like me to stay with you?', 'Would you like help writing down your options?', 'When would you like me to check in?'].map(prompt =>
            <button key={prompt} className="report-copy" disabled={supportDraft.length + prompt.length + 1 > 2000}
              onClick={() => setSupportDraft(text => [text.trimEnd(), prompt].filter(Boolean).join('\n'))}>{prompt}</button>)}
        </details>
        <button className="report-copy" disabled={!supportDraft.trim()} onClick={() =>
          downloadText('support-message.txt', supportDraft)}>Save message draft</button>
      </div>}
      <button className="report-copy" disabled={count === steps[selected].length} onClick={() =>
        setChecked(previous => previous.map((items, route) => route === selected ? items.map(() => true) : items))}>Mark all steps reviewed</button>
      <div>
        <button className="report-copy" disabled={count === steps[selected].length || tasks.length >= 500} onClick={() => {
          const category = (['Protection', 'Reporting', 'Support'] as const)[selected];
          const pending = steps[selected].filter((step, i) => step.trim() && !checked[selected][i])
            .map(title => ({ id: crypto.randomUUID(), title: title.trim().slice(0, 300), done: false, category }));
          const known = new Set(tasks.filter(task => !task.done).map(task => task.title));
          const additions = pending.filter(task => {
            if (known.has(task.title)) return false;
            known.add(task.title);
            return true;
          }).slice(0, 500 - tasks.length);
          setTasks(previous => [...previous, ...additions].slice(0, 500));
          setPlanMessage(additions.length + ' pending actions added.');
        }}>Add remaining steps to plan</button>
        <p role="status">{planMessage}</p>
      </div>
      <form className="personal-step" onSubmit={event => {
        event.preventDefault();
        const form = event.currentTarget;
        const step = String(new FormData(form).get('step') ?? '').trim();
        if (!step) return;
        setSteps(previous => previous.map((items, route) => route === selected ? [...items, step] : items));
        setChecked(previous => previous.map((items, route) => route === selected ? [...items, false] : items));
        form.reset();
      }}>
        <label>Your own next step<input name="step" maxLength={180} required autoComplete="off" /></label>
        <button className="report-copy">Add step</button>
      </form>
      {steps[selected].length > path.steps.length && <details>
        <summary>Manage personal steps</summary>
        <ul>{steps[selected].slice(path.steps.length).map((step, i) => {
          const index = path.steps.length + i;
          return <li key={index}><label>Personal step<input value={step} maxLength={180}
            onChange={event => {
              const value = event.target.value;
              setSteps(previous => previous.map((items, route) => route === selected ? items.map((item, n) => n === index ? value : item) : items));
            }} /></label>{' '}<button className="report-copy" onClick={() => {
            setSteps(previous => previous.map((items, route) => route === selected ? items.filter((_, n) => n !== index) : items));
            setChecked(previous => previous.map((items, route) => route === selected ? items.filter((_, n) => n !== index) : items));
          }} aria-label={'Remove step: ' + step}>Remove</button></li>;
        })}</ul>
      </details>}
      <button className="report-copy" onClick={async () => {
        try {
          await navigator.clipboard.writeText(steps[selected].map((step, i) => (checked[selected][i] ? '[x] ' : '[ ] ') + step).join('\n'));
          setClipboardMessage('Checklist copied.');
        } catch { setClipboardMessage('Clipboard unavailable. Save the checklist as text instead.'); }
      }}>Copy checklist</button><p role="status">{clipboardMessage}</p>
      <button className="report-copy" onClick={() => {
        const checklist = steps[selected].map((step, i) => (checked[selected][i] ? '[x] ' : '[ ] ') + step);
        downloadText('my-checklist.txt', [path.title, '', ...checklist].join('\n'));
      }}>Save checklist as text</button>
    </motion.div> : <p className="situation-empty">No details or private images needed. Just a place to start.</p>}</div>
    <p className="demo-disclosure">Your choices and checkmarks stay in this page’s memory and reset when you reload. They indicate steps you have reviewed, not a submitted report or active protection. <a href="#start">View specialist services and age-specific options.</a></p>
  </section>;
}
