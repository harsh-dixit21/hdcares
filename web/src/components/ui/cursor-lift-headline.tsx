"use client";

import { useCallback, useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';
import { extrusionShadow, letterInfluence } from '@/lib/letter-lift';

type Cursor = { x: MotionValue<number>; y: MotionValue<number> };
type GlyphProps = { character: string; order: number; cursor: Cursor; replay: MotionValue<number> };

function Glyph({ character, order, cursor, replay }: GlyphProps) {
  const anchor = useRef<HTMLSpanElement>(null);
  const centerX = useMotionValue(0), centerY = useMotionValue(0), fontSize = useMotionValue(80);
  const wave = useMotionValue(0);
  const measure = useCallback(() => {
    const element = anchor.current;
    const heading = element?.closest('h1');
    if (!element || !heading) return;
    // Measure the unmoving anchor, never the transformed letter face.
    const box = element.getBoundingClientRect(), root = heading.getBoundingClientRect();
    centerX.set(box.left - root.left + box.width / 2);
    centerY.set(box.top - root.top + box.height / 2);
    fontSize.set(parseFloat(getComputedStyle(element).fontSize));
  }, [centerX, centerY, fontSize]);

  useEffect(() => {
    const element = anchor.current;
    if (!element) return;
    let disposed = false;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.closest('h1')) observer.observe(element.closest('h1')!);
    measure();
    document.fonts.ready.then(() => { if (!disposed) measure(); });
    const playWave = () => animate(wave, [0, 0.85, 0], {
      duration: 0.8, delay: order * 0.025, ease: 'easeInOut',
    });
    let playback = playWave();
    const unsubscribe = replay.on('change', () => {
      playback.stop();
      wave.set(0);
      playback = playWave();
    });
    return () => { disposed = true; observer.disconnect(); unsubscribe(); playback.stop(); };
  }, [measure, order, replay, wave]);

  const target = useTransform(() => Math.max(wave.get(), letterInfluence(
    cursor.x.get() - centerX.get(), cursor.y.get() - centerY.get(), fontSize.get() * 1.55,
  )));
  const lift = useSpring(target, { stiffness: 235, damping: 18, mass: 0.65 });
  const y = useTransform(() => -lift.get() * fontSize.get() * 0.27);
  const z = useTransform(() => lift.get() * fontSize.get() * 0.48);
  const rotateX = useTransform(lift, [0, 1], [0, -14]);
  const tiltTarget = useTransform(() => Math.max(-1, Math.min(1, (centerX.get() - cursor.x.get()) / fontSize.get())) * target.get());
  const tilt = useSpring(tiltTarget, { stiffness: 200, damping: 22 });
  const rotateY = useTransform(tilt, [-1, 1], [-13, 13]);
  const shadow = useTransform(() => extrusionShadow(lift.get(), tilt.get()));
  const contactOpacity = useTransform(lift, [0, 1], [0, 0.45]);
  return <span className="ink-anchor" ref={anchor}>
    <motion.span className="ink-contact" style={{ opacity: contactOpacity }}>{character}</motion.span>
    <motion.span className="ink-face" style={{ y, z, rotateX, rotateY, textShadow: shadow }}>{character}</motion.span>
  </span>;
}

/** Original HD Cares effect; no React Bits Pro source or license dependency. */
export default function CursorLiftHeadline() {
  const cursor = { x: useMotionValue(-10000), y: useMotionValue(-10000) };
  const replay = useMotionValue(0);
  const reset = () => { cursor.x.set(-10000); cursor.y.set(-10000); };
  let order = 0;
  const word = (text: string, accent = false) => <span className={`ink-word${accent ? ' ink-accent' : ''}`}>
    {Array.from(text).map((character, index) => <Glyph key={index} character={character} order={order++} cursor={cursor} replay={replay} />)}
  </span>;
  return <h1 className="cursor-lift-headline" aria-label="Your life. Your image. Your choice."
    tabIndex={0} title="Move across the letters. Click or press Enter to replay the wave."
    onPointerMove={event => {
      if (event.pointerType === 'touch') return;
      const rect = event.currentTarget.getBoundingClientRect();
      cursor.x.set(event.clientX - rect.left); cursor.y.set(event.clientY - rect.top);
    }} onPointerLeave={reset} onPointerCancel={reset} onBlur={reset}
    onClick={() => replay.set(replay.get() + 1)}
    onKeyDown={event => {
      if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
        event.preventDefault(); replay.set(replay.get() + 1);
      }
    }}>
    <span aria-hidden="true">{word('Your')} {' '}{word('life.')}<br />{word('Your', true)} {' '}{word('image.', true)} {' '}{word('Your')} {' '}{word('choice.')}</span>
  </h1>;
}
