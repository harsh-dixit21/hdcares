import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Heart, ScanLine, Shield } from 'lucide-react';
import './product-demos.css';

const paths = [
  { title: 'I’m worried it may be shared', icon: Shield, heading: 'Start with what you can control.', intro: 'You can explore your options without sharing an image here.', steps: ['Explore how a digital fingerprint works using our sample artwork.', 'Review the eligibility and privacy information of specialist services.', 'Choose whether to take the next step with a service.'], link: '#fingerprint-demo', action: 'Try the fingerprint demo' },
  { title: 'It’s already online', icon: ScanLine, heading: 'Take it one location at a time.', intro: 'This preview helps you think through the process. It does not submit reports.', steps: ['Organise the links you already know, dates, and platform names.', 'Review the relevant platform’s reporting options.', 'Keep any report references so you can follow up.'], link: '#report-organizer', action: 'Organise your report notes' },
  { title: 'I’m helping someone', icon: Heart, heading: 'Let their choices lead.', intro: 'You can offer practical support without asking to see their private images.', steps: ['Listen and ask what kind of help they would like.', 'Offer to explore support options together, at their pace.', 'Let them decide what information to share and which steps to take.'], link: '#support', action: 'Explore support' },
] as const;

export default function SituationJourney() {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState<boolean[][]>(() => paths.map(() => [false, false, false]));
  const path = selected === null ? null : paths[selected];
  const count = selected === null ? 0 : checked[selected].filter(Boolean).length;
  return <section id="next-step" className="section situation-section" aria-labelledby="situation-title">
    <div className="demo-intro"><p className="eyebrow">YOUR SITUATION. YOUR PACE.</p><h2 id="situation-title">Where would you<br /><em>like to begin?</em></h2><p>Choose what feels closest. You can change your choice at any time.</p></div>
    <div className="situation-options" role="group" aria-label="Choose your situation">{paths.map(({ title, icon: Icon }, index) => <button key={title} className="glass" aria-pressed={selected === index} aria-controls="situation-details" onClick={() => setSelected(index)}><Icon size={25} strokeWidth={1.3} /><span>{title}</span><ArrowUpRight size={18} /></button>)}</div>
    <div id="situation-details" aria-live="polite">{path && selected !== null ? <motion.div className="situation-detail glass" key={selected} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <div><span className="demo-label">A PERSONAL STARTING POINT</span><h3>{path.heading}</h3><p>{path.intro}</p><a className="inline-link" href={path.link}>{path.action}<ArrowUpRight size={16} /></a></div>
      <div><span className="demo-label">{count} OF 3 REVIEWED</span><div className="checklist-progress" aria-hidden="true"><motion.div animate={{ scaleX: count / 3 }} /></div>{path.steps.map((step, index) => <label className="situation-check" key={step}><input type="checkbox" checked={checked[selected][index]} onChange={event => { const value = event.target.checked; setChecked(previous => previous.map((items, route) => route === selected ? items.map((item, i) => i === index ? value : item) : items)); }} /><span>{step}</span></label>)}<button className="review-reset" onClick={() => setChecked(previous => previous.map((items, route) => route === selected ? [false, false, false] : items))}>Reset this checklist</button></div>
    </motion.div> : <p className="situation-empty">No details or private images needed. Just a place to start.</p>}</div>
    <p className="demo-disclosure">Your choices and checkmarks stay in this page’s memory and reset when you reload. They indicate steps you have reviewed, not a submitted report or active protection. <a href="#start">View specialist services and age-specific options.</a></p>
  </section>;
}
