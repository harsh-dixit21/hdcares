import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, MotionConfig, motion, useInView, useMotionValue, useScroll, useSpring } from 'motion/react';
import { ArrowDown, ArrowUpRight, Check, ChevronDown, Fingerprint, Heart, Home, LifeBuoy, LockKeyhole, Minus, Play, Plus, ScanLine, Shield, ShieldCheck, Sparkles, X } from 'lucide-react';
import LiquidSculptureHero from '@/components/ui/liquid-sculpture-hero';
import CursorLiftHeadline from '@/components/ui/cursor-lift-headline';
import PerspectiveTunnelHero from '@/components/ui/perspective-tunnel-hero';
import CourageHero from '@/components/ui/courage-hero';
import SituationJourney from '@/components/ui/situation-journey';
import FingerprintDemo from '@/components/ui/fingerprint-demo';
import ReportOrganizer from '@/components/ui/report-organizer';
import { TextEffect } from '@/components/motion-primitives/text-effect';
import { AnimatedGroup } from '@/components/motion-primitives/animated-group';

const MotionEnabled = createContext(true);

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const enabled = useContext(MotionEnabled);
  return <motion.div className={className} initial={enabled ? { opacity: 0, y: 32 } : false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}>{children}</motion.div>;
}

function Heading({ children }: { children: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { once: true });
  const enabled = useContext(MotionEnabled);
  return <div ref={ref}>{enabled ? <TextEffect as="h2" per="word" preset="fade-in-blur" trigger={visible}>{children}</TextEffect> : <h2>{children}</h2>}</div>;
}

function Brand() {
  return <a href="#home" className="brand" aria-label="HD Cares home"><span className="brand-symbol"><Shield size={20} strokeWidth={1.5} /></span>hd<span>cares</span><sup>®</sup></a>;
}

function Header() {
  const [menu, setMenu] = useState(false);
  const links = [{ id: 'home', label: 'Home', icon: Home }, { id: 'privacy', label: 'The approach', icon: Fingerprint }, { id: 'journey', label: 'How it works', icon: ScanLine }, { id: 'support', label: 'Support', icon: Heart }];
  return <header className="header"><Brand /><nav className="desktop-nav glass" aria-label="Main navigation">{links.map(({ id, label, icon: Icon }) => <a key={id} href={`#${id}`}><Icon size={14} /><span>{label}</span></a>)}</nav><div className="header-actions"><a className="header-cta" href="#next-step">Find your next step <ArrowUpRight size={15} /></a><button className="menu-button glass" onClick={() => setMenu(!menu)} aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu}>{menu ? <X size={19} /> : <Plus size={19} />}</button></div><AnimatePresence>{menu && <motion.nav className="mobile-nav glass" aria-label="Mobile navigation" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>{links.map(({ id, label, icon: Icon }) => <a key={id} href={`#${id}`} onClick={() => setMenu(false)}><Icon size={17} />{label}<ArrowUpRight size={15} /></a>)}</motion.nav>}</AnimatePresence></header>;
}

function Hero() {
  const enabled = useContext(MotionEnabled);
  return <section id="home" className="hero">
    <div className="hero-grid" aria-hidden="true" />
    <div className="hero-title"><p className="eyebrow"><span className="live-dot" /> YOUR PRIVACY IS WORTH PROTECTING</p><CursorLiftHeadline /><p className="hero-tagline">A little more control. A clearer way forward.</p></div>
    <div className="sculpture-wrap"><LiquidSculptureHero motionEnabled={enabled} /></div>
    <div className="sculpture-note left"><span className="crosshair">+</span><span>PRIVATE BY DESIGN<br /><b>HUMAN AT HEART</b></span></div>
    <div className="sculpture-note right"><span className="tiny-line" /><span>A LIVING, LIQUID FORM<br /><b>MOVE YOUR CURSOR TO SHAPE IT</b></span></div>
    <div className="hero-bottom"><p>When intimate images are at risk,<br />you deserve support. Explore protection,<br />reporting, and a path back to confidence.</p><div className="hero-buttons"><a className="button button-light" href="#next-step">Take the first step <ArrowUpRight size={17} /></a><a className="button button-ghost" href="#journey"><span className="play-circle"><Play size={10} fill="currentColor" /></span>See how it works</a></div></div>
    <div className="hero-caption"><span>01 — A SAFER DIGITAL TOMORROW</span><span>HD CARES / CONCEPT EXPERIENCE</span></div>
  </section>;
}

/** Perspective responds to the pointer; ambient movement runs only in view. */
function Scene({ children, className = '' }: { children: ReactNode; className?: string }) {
  const enabled = useContext(MotionEnabled);
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInView(ref, { amount: 0.1 });
  const x = useMotionValue(0), y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 100, damping: 20 });
  const rotateY = useSpring(y, { stiffness: 100, damping: 20 });
  return <div ref={ref} className={`scene ${className} ${enabled && visible ? 'scene-running' : ''}`} onPointerMove={event => {
    if (!enabled || event.pointerType === 'touch') return;
    const r = event.currentTarget.getBoundingClientRect();
    x.set(-(event.clientY - r.top - r.height / 2) / r.height * 12);
    y.set((event.clientX - r.left - r.width / 2) / r.width * 16);
  }} onPointerLeave={() => { x.set(0); y.set(0); }}><motion.div className="scene-tilt" style={enabled ? { rotateX, rotateY } : { rotateX: 0, rotateY: 0 }}>{children}</motion.div></div>;
}

function PrivacyScene() {
  return <Scene className="privacy-scene"><div className="scene-light" /><div className="orbital-ring ring-one" /><div className="orbital-ring ring-two" /><div className="shield-visual"><img src="/privacy-shield.svg" alt="Dimensional metallic shield with a lock" draggable={false} /></div><div className="floating-label label-top glass"><span className="live-dot" /> YOUR IMAGE STAYS WITH YOU</div><div className="glass-token fingerprint-token"><Fingerprint size={42} strokeWidth={1} /></div><div className="floating-label label-bottom glass"><LockKeyhole size={12} /> PRIVATE. BY DESIGN.</div><div className="scene-coordinate">01 / CONTROL STARTS HERE</div></Scene>;
}

function Privacy() {
  return <section id="privacy" className="section privacy-section"><div className="section-topline"><span>YOUR IMAGE IS PERSONAL.</span><span>YOUR PROTECTION SHOULD BE TOO. <ArrowDown size={12} /></span></div><div className="editorial-grid"><Reveal className="editorial-copy"><p className="eyebrow"><span className="section-index">01</span> LESS EXPOSURE. MORE CONTROL.</p><Heading>Keep the image. Share only its fingerprint.</Heading><p className="body-copy">Protection shouldn’t mean giving up more privacy. Eligible services create a digital fingerprint on your device, helping participating platforms find matching content.</p><div className="detail-row"><span className="glass-icon"><Fingerprint size={18} /></span><div><h3>A signature, not a photograph.</h3><p>Your original stays on your device during hashing.</p></div></div><div className="detail-row"><span className="glass-icon"><ShieldCheck size={18} /></span><div><h3>Clear about the limits.</h3><p>Coverage depends on participating platforms.</p></div></div><a className="inline-link" href="#journey">Understand the process <ArrowUpRight size={16} /></a></Reveal><Reveal><PrivacyScene /></Reveal></div></section>;
}

const workflows = {
  prevent: [
    ['Choose your route', 'Start with the age you were when the image was taken. Adult images and images taken under 18 have different specialist routes.', 'Understand your options', Shield],
    ['Create a private fingerprint', 'An eligible protection service hashes the image on your device. You choose whether to share that fingerprint with the service.', 'Original stays on device', Fingerprint],
    ['Connect with supported protection', 'Participating platforms can match content and apply their policies. Registration is not a promise of protection everywhere.', 'Participating platforms only', ShieldCheck],
  ],
  report: [
    ['Start with the links', 'Record the locations you already know about, along with dates and relevant details. There is no image upload on this website.', 'Organise known locations', ScanLine],
    ['Review. Then report.', 'Use the platform’s reporting process. If you choose to report to authorities, review your facts before submitting through an official route.', 'You decide what to submit', LockKeyhole],
    ['Keep track of the response', 'Keep report references and follow up on each location. Platforms and authorities decide what action to take.', 'One location at a time', Check],
  ],
} as const;

function JourneyScene({ index, mode }: { index: number; mode: 'prevent' | 'report' }) {
  const selected = workflows[mode][index];
  const Icon = selected[3];
  return <Scene className="journey-scene"><div className="scene-light" /><div className="platform-floor" /><div className="device-stack"><div className="device-layer layer-back" /><div className="device-layer layer-middle" /><div className="device-front"><div className="device-toolbar"><span className="device-dot" /><span>HD CARES</span><LockKeyhole size={11} /></div><AnimatePresence mode="wait"><motion.div className="device-content" key={`${mode}-${index}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}><span className="device-orbit"><Icon size={57} strokeWidth={0.9} /></span><span className="device-overline">YOUR NEXT STEP / 0{index + 1}</span><h3>{selected[2]}</h3><div className="device-progress">{[0, 1, 2].map(i => <span key={i} className={i <= index ? 'complete' : ''} />)}</div><span className="device-small">ILLUSTRATIVE CONCEPT</span></motion.div></AnimatePresence></div></div><div className="floating-label journey-label glass"><Check size={13} /> A CLEARER WAY FORWARD</div><span className="scene-coordinate">02 / YOUR PACE. YOUR CHOICE.</span></Scene>;
}

function Journey() {
  const [mode, setMode] = useState<'prevent' | 'report'>('prevent');
  const [step, setStep] = useState(0);
  return <section id="journey" className="section journey-section"><Reveal className="section-heading"><div><p className="eyebrow"><span className="section-index">02</span> FROM “WHAT NOW?” TO WHAT’S NEXT.</p><Heading>There’s a way forward.</Heading></div><p className="section-aside">Before a leak. After a leak.<br />Support starts with your situation.</p></Reveal><div className="journey-layout"><Reveal><JourneyScene index={step} mode={mode} /></Reveal><div className="journey-controls"><div className="journey-tabs glass" aria-label="Select a situation">{(['prevent', 'report'] as const).map(value => <button key={value} aria-pressed={mode === value} onClick={() => { setMode(value); setStep(0); }}>{mode === value && <motion.span className="tab-active" layoutId="journey-tab" transition={{ type: 'spring', stiffness: 320, damping: 30 }} />}<span>{value === 'prevent' ? 'It might be shared' : 'It’s already shared'}</span></button>)}</div><div className="journey-steps">{workflows[mode].map(([title, description], index) => <button className={`journey-step ${step === index ? 'selected' : ''}`} key={title} onClick={() => setStep(index)} aria-expanded={step === index}><span className="step-num">0{index + 1}</span><span className="step-content"><strong>{title}</strong><AnimatePresence initial={false}>{step === index && <motion.span className="step-description" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}>{description}</motion.span>}</AnimatePresence></span>{step === index ? <Minus size={16} /> : <Plus size={16} />}</button>)}</div><p className="quiet-note">An explanation of the planned experience. This preview doesn’t register fingerprints or submit reports.</p></div></div></section>;
}

function SupportScene() {
  return <Scene className="support-scene"><div className="scene-light" /><div className="support-visual"><img src="/support-orb.svg" alt="A metallic heart sphere surrounded by an orbital ring" draggable={false} /></div><div className="message-card message-one glass"><span className="message-avatar"><Heart size={16} /></span><span>You don’t have to<br /><b>face this alone.</b></span></div><div className="message-card message-two glass"><span className="typing"><i /><i /><i /></span><span>One step at a time.</span></div><span className="scene-coordinate">03 / MORE THAN A DIGITAL PROBLEM</span></Scene>;
}

function Support() {
  return <section id="support" className="section support-section"><div className="editorial-grid"><Reveal className="editorial-copy"><p className="eyebrow"><span className="section-index">03</span> A PERSON. NOT JUST PIXELS.</p><Heading>You deserve care, not judgement.</Heading><p className="body-copy">A private image never tells the whole story. Whatever happened, you deserve clear information, space to decide, and help finding the right support.</p><div className="support-principle"><span className="live-dot" /><p>Sharing privately does not mean<br /><strong>agreeing to public sharing.</strong></p></div><a className="inline-link" href="#start">Find a place to begin <ArrowUpRight size={16} /></a></Reveal><Reveal><SupportScene /></Reveal></div></section>;
}

const resources = [
  { icon: ShieldCheck, type: 'ADULT INTIMATE IMAGES', title: 'Explore prevention.', description: 'Check eligibility and protection guidance at StopNCII.', label: 'Visit StopNCII', url: 'https://stopncii.org/' },
  { icon: Heart, type: 'UNDER 18 WHEN IT WAS TAKEN', title: 'Find specialist help.', description: 'Get age-appropriate guidance from NCMEC’s Take It Down.', label: 'Visit Take It Down', url: 'https://takeitdown.ncmec.org/' },
  { icon: LifeBuoy, type: 'REPORTING IN INDIA', title: 'Understand reporting.', description: 'Explore the official National Cybercrime Reporting Portal.', label: 'Visit the official portal', url: 'https://cybercrime.gov.in/' },
];

function Start() {
  return <section id="start" className="section start-section"><Reveal className="start-heading"><p className="eyebrow"><span className="live-dot" /> START WHERE YOU ARE</p><Heading>A first step can change the feeling.</Heading><p>You don’t need all the answers to begin.</p></Reveal><AnimatedGroup preset="blur-slide" className="resource-grid">{resources.map(({ icon: Icon, type, title, description, label, url }) => <a className="resource-card" href={url} key={url} target="_blank" rel="noreferrer"><span className="resource-icon"><Icon size={24} strokeWidth={1.2} /></span><span className="resource-type">{type}</span><h3>{title}</h3><p>{description}</p><span className="resource-link">{label}<ArrowUpRight size={16} /></span></a>)}</AnimatedGroup><p className="resource-note">Independent services have their own eligibility and privacy policies. Do not download or share intimate imagery to use Take It Down.</p></section>;
}

const questions = [
  ['Will this website collect my private image?', 'No. This is a concept preview with no image-upload form. It explains protection and reporting routes and links to independent services. Review each service’s privacy information before proceeding.'],
  ['Can this remove an image from the entire internet?', 'No. Platforms control content on their own services. Fingerprint-based protection only applies to participating platforms. Other sites require their own reporting processes, and removing a search result does not delete the original website’s copy.'],
  ['What if I was under 18 when the image was taken?', 'Use the specialist guidance at NCMEC’s Take It Down, even if you are an adult now. Do not download, share, or send intimate imagery in order to make a submission.'],
  ['Does HD Cares automatically file a complaint?', 'No. This preview does not submit anything. The planned workflow would help organise your facts, with you deciding whether to submit through an official process. Authorities determine what action to take.'],
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return <section className="section faq-section"><Reveal><p className="eyebrow">NO FINE PRINT. JUST CLARITY.</p><Heading>Questions are welcome.</Heading></Reveal><div className="faq-list">{questions.map(([q, a], i) => <div className="faq-item" key={q}><h3><button aria-expanded={open === i} aria-controls={`answer-${i}`} onClick={() => setOpen(open === i ? null : i)}>{q}<ChevronDown size={17} className={open === i ? 'rotated' : ''} /></button></h3><AnimatePresence initial={false}>{open === i && <motion.div id={`answer-${i}`} initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}><p>{a}</p></motion.div>}</AnimatePresence></div>)}</div></section>;
}

export default function App() {
  const { scrollYProgress } = useScroll();
  return <MotionEnabled.Provider value={true}><MotionConfig reducedMotion="never"><div className="app motion-enabled">
    <a className="skip-link" href="#main">Skip to content</a><motion.div className="page-progress" style={{ scaleX: scrollYProgress }} />
    <Header />
    <main id="main"><div className="hero-sequence"><Hero /><PerspectiveTunnelHero /></div><CourageHero /><div className="content-flow"><div className="values-strip"><span><LockKeyhole size={15} /> Private by design</span><span><ShieldCheck size={15} /> Informed choices</span><span><Heart size={15} /> Human at heart</span><span className="values-end">CARE BEYOND THE SCREEN <Sparkles size={13} /></span></div><SituationJourney /><Privacy /><FingerprintDemo /><Journey /><ReportOrganizer /><Support /><Start /><FAQ /></div></main>
    <footer className="footer"><div className="footer-main"><Brand /><p>Your story is <em>still yours.</em></p><a href="#home" className="back-top glass" aria-label="Back to top"><ArrowUpRight size={21} /></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} HD Cares · Product concept</span><span>Designed around dignity.</span><a href="https://guglielmogiannattasio.it" target="_blank" rel="noreferrer">Sculpture engine by Guglielmo Giannattasio <ArrowUpRight size={10} /></a></div></footer>
  </div></MotionConfig></MotionEnabled.Provider>;
}
