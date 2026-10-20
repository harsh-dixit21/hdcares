import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'motion/react';
import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import artwork from '@/lib/tunnel-artwork.json';

// The stage pins for the full scroll timeline before releasing the next section.
const labels = ['Your privacy', 'Your boundaries', 'Your voice', 'Your choices', 'Your confidence', 'Your support', 'Your space', 'Your future', 'Your life'];
type Stage = { width: number; height: number };

function TunnelCard({ index, progress, stage, pointerX, pointerY }: {
  index: number; progress: MotionValue<number>; stage: Stage;
  pointerX: MotionValue<number>; pointerY: MotionValue<number>;
}) {
  const [failed, setFailed] = useState(false);
  const mobile = stage.width < 768;
  const start = index * 0.055 - 0.12;
  const local = useTransform(progress, [start, start + 0.6], [0, 1]);
  const depth = useTransform(local, [0, 1], [mobile ? -1100 : -1650, mobile ? 650 : 950]);
  const opacity = useTransform(local, [0, 0.12, 0.78, 1], [0, 0.88, 0.88, 0]);
  const angle = index * 137.5 * Math.PI / 180;
  const baseX = Math.cos(angle) * stage.width * (0.3 + index % 3 * 0.055);
  const baseY = Math.sin(angle) * stage.height * (0.29 + index % 2 * 0.065);
  const rotation = (index % 2 ? -1 : 1) * (4 + index % 5 * 2);
  const transform = useTransform(() =>
    `translate3d(calc(-50% + ${baseX - pointerX.get() * 32}px), calc(-50% + ${baseY - pointerY.get() * 24}px), ${depth.get()}px) rotateZ(${rotation}deg)`,
  );
  return <motion.div className={`tunnel-card tunnel-card-${index % 3}`} style={{
    width: mobile ? Math.min(158, stage.width * 0.34) : Math.min(260, stage.width * 0.18),
    transform, opacity,
  }}>
    {!failed && <img src={artwork[index]} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} />}
    <div className="tunnel-card-shade" />
    <span className="tunnel-card-number">HD / 0{index + 1}</span>
    <span className="tunnel-card-label">{labels[index]}<ArrowUpRight size={15} /></span>
  </motion.div>;
}

export default function PerspectiveTunnelHero() {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<Stage>({ width: 1440, height: 900 });
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  // Finish before the sticky stage releases. Direct mapping avoids spring lag
  // leaving the animation unfinished after a fast scroll.
  const progress = useTransform(scrollYProgress, [0, 0.88], [0, 1]);
  const rawX = useMotionValue(0), rawY = useMotionValue(0);
  const pointerX = useSpring(rawX, { stiffness: 60, damping: 25 });
  const pointerY = useSpring(rawY, { stiffness: 60, damping: 25 });
  const titleScale = useTransform(progress, [0, 0.75, 1], [0.86, 1.06, 1.1]);
  const titleY = useTransform(progress, [0, 1], [30, -20]);
  const ringScale = useTransform(progress, [0, 1], [0.7, 2.4]);
  const endOpacity = useTransform(progress, [0.8, 1], [0, 1]);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setStage({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return <section ref={section} id="reclaim" className="tunnel-section" aria-labelledby="tunnel-title">
    <div ref={viewport} className="tunnel-viewport" onPointerMove={event => {
      if (event.pointerType === 'touch') return;
      const bounds = event.currentTarget.getBoundingClientRect();
      rawX.set((event.clientX - bounds.left) / bounds.width * 2 - 1);
      rawY.set((event.clientY - bounds.top) / bounds.height * 2 - 1);
    }} onPointerLeave={() => { rawX.set(0); rawY.set(0); }}>
      <div className="tunnel-atmosphere" aria-hidden="true" />
      <div className="tunnel-topline"><span>02 / RECLAIM YOUR SPACE</span><span><ShieldCheck size={13} /> CARE BEYOND THE SCREEN</span></div>
      <motion.div className="tunnel-orbits" style={{ scale: ringScale }} aria-hidden="true"><i /><i /><i /></motion.div>
      <div className="tunnel-camera" style={{ perspective: stage.width < 768 ? 800 : 1150 }} aria-hidden="true">
        <div className="tunnel-world">{labels.map((_, index) => <TunnelCard key={index} index={index} progress={progress} stage={stage} pointerX={pointerX} pointerY={pointerY} />)}</div>
      </div>
      <div className="tunnel-center">
        <motion.div style={{ scale: titleScale, y: titleY }}>
          <p className="eyebrow">YOU ARE MORE THAN AN IMAGE</p>
          <h2 id="tunnel-title">Your world.<br /><em>Still yours.</em></h2>
          <p className="tunnel-description">Move beyond the fear.<br />Towards choice, support, and a clearer next step.</p>
        </motion.div>
        <motion.p className="tunnel-arrival" style={{ opacity: endOpacity }}>A way forward starts with you.</motion.p>
      </div>
      <div className="tunnel-progress" aria-hidden="true"><motion.div style={{ scaleX: progress }} /></div>
    </div>
  </section>;
}

