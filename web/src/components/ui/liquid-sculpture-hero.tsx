"use client";
import { useEffect, useRef, useState } from 'react';
import { LiquidEngine, type EngineOptions } from '@/lib/liquid-engine';
import { liquidSlice, sculptureRect } from '@/lib/sculpture-motion';

/** New host for the supplied Guglielmo Giannattasio engine. GPU failures use
 * an animated Canvas2D surface, never silently substituting a still image.
 * The parent's explicit Play/Pause choice is authoritative. */
export default function LiquidSculptureHero({ motionEnabled = true }: { motionEnabled?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const root = host.current;
    if (!root) return;
    setReady(false);
    let disposed = false, visible = true, imageReady = false, fallback = false;
    let engine: LiquidEngine | null = null;
    let frame = 0, time = 0, last = 0, width = 1, height = 1, dpr = 1, timeout = 0;
    let pointerX = 0.5, pointerY = 0.5;
    const image = new Image();
    const gpu = document.createElement('canvas');
    const cpu = document.createElement('canvas');
    gpu.className = cpu.className = 'sculpture-canvas';
    gpu.setAttribute('aria-hidden', 'true'); cpu.setAttribute('aria-hidden', 'true');
    gpu.style.opacity = cpu.style.opacity = '0';
    root.append(gpu, cpu);
    let ctx: CanvasRenderingContext2D | null = null;
    const drawFallback = () => {
      if (!ctx || !imageReady) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const rect = sculptureRect(width, height, image.naturalWidth / image.naturalHeight);
      const count = width < 600 ? 120 : 220;
      const sw = image.naturalWidth / count, dw = rect.w / count;
      for (let i = 0; i < count; i++) {
        const wave = liquidSlice(i / count, time, motionEnabled, pointerX, pointerY);
        const dh = rect.h * wave.scale;
        ctx.drawImage(image, i * sw, 0, sw, image.naturalHeight,
          rect.x + i * dw, rect.y + wave.y - (dh - rect.h) / 2, dw + 1, dh);
      }
    };
    const tick = (now: number) => {
      frame = 0;
      if (disposed || !visible || document.hidden || !fallback) return;
      if (last) time += Math.min((now - last) / 1000, 0.05);
      last = now;
      drawFallback();
      if (motionEnabled) frame = requestAnimationFrame(tick);
    };
    const startFallback = (reason: string) => {
      if (disposed || fallback) return;
      fallback = true;
      clearTimeout(timeout);
      console.info('[HD Cares sculpture] Canvas2D renderer:', reason);
      gpu.style.opacity = '0';
      engine?.setVisible(false);
      ctx = cpu.getContext('2d', { alpha: true });
      root.dataset.renderer = ctx ? 'canvas2d' : 'image';
      if (!ctx) { setReady(false); return; }
      cpu.style.opacity = '1';
      if (imageReady) { drawFallback(); setReady(true); }
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const resize = () => {
      width = Math.max(1, root.clientWidth); height = Math.max(1, root.clientHeight);
      dpr = Math.min(devicePixelRatio || 1, 1.75);
      cpu.width = Math.round(width * dpr); cpu.height = Math.round(height * dpr);
      const aspect = imageReady ? image.naturalWidth / image.naturalHeight : 2.5;
      engine?.resize(width, height, sculptureRect(width, height, aspect));
      if (fallback) drawFallback();
    };
    const options: EngineOptions = {
      interactive: motionEnabled, strength: 1.1, radius: 220, density: 0.8,
      dotSize: 1.1, spread: 0.9, turbulence: 1.1, returnSpeed: 0.8,
      streaks: true, restStyle: motionEnabled ? 'particles' : 'image',
      ambient: motionEnabled, ambientIntensity: 1.5, speed: 1,
      intro: false, reducedMotion: !motionEnabled,
      bg: [17 / 255, 17 / 255, 16 / 255], imgBg: null, liquid: 1.3,
    };
    if (motionEnabled) {
      try { engine = new LiquidEngine(gpu, options, () => startFallback('WebGL unavailable or context lost')); }
      catch (error) { startFallback(error instanceof Error ? error.message : 'GPU initialisation failed'); }
    } else startFallback('motion paused');
    image.onload = () => {
      if (disposed) return;
      imageReady = true; resize();
      if (engine && !fallback) {
        engine.onFirstFrame = () => {
          if (disposed || fallback) return;
          clearTimeout(timeout); root.dataset.renderer = 'webgl2';
          gpu.style.opacity = '1'; setReady(true);
        };
        try {
          engine.setImage(image);
          engine.setVisible(visible && !document.hidden);
          timeout = window.setTimeout(() => startFallback('no GPU frame after initialisation'), 1800);
        } catch (error) { startFallback(error instanceof Error ? error.message : 'GPU image processing failed'); }
      }
      if (fallback) { drawFallback(); setReady(true); if (!frame) frame = requestAnimationFrame(tick); }
    };
    image.onerror = () => { if (!disposed) console.warn('[HD Cares sculpture] Could not load sculpture-dark.webp'); };
    image.src = '/sculpture-dark.webp';
    const syncVisibility = () => {
      engine?.setVisible(!fallback && visible && !document.hidden);
      if (!visible || document.hidden) { cancelAnimationFrame(frame); frame = 0; last = 0; }
      else if (fallback && !frame) frame = requestAnimationFrame(tick);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncVisibility(); });
    observer.observe(root);
    const ro = new ResizeObserver(resize); ro.observe(root);
    document.addEventListener('visibilitychange', syncVisibility);
    const move = (event: PointerEvent) => {
      const bounds = root.getBoundingClientRect(), x = event.clientX - bounds.left, y = event.clientY - bounds.top;
      pointerX = x / width; pointerY = y / height;
      engine?.pointer(event.type === 'pointerdown' ? 'down' : 'move', x, y, event.pointerType === 'touch');
    };
    const leave = () => engine?.pointer('leave', 0, 0, false);
    root.addEventListener('pointermove', move, { passive: true });
    root.addEventListener('pointerdown', move, { passive: true });
    root.addEventListener('pointerleave', leave);
    resize();
    return () => {
      disposed = true; clearTimeout(timeout); cancelAnimationFrame(frame);
      observer.disconnect(); ro.disconnect();
      document.removeEventListener('visibilitychange', syncVisibility);
      root.removeEventListener('pointermove', move); root.removeEventListener('pointerdown', move); root.removeEventListener('pointerleave', leave);
      image.onload = image.onerror = null; engine?.destroy(); gpu.remove(); cpu.remove();
      delete root.dataset.renderer;
    };
  }, [motionEnabled]);
  return <div ref={host} className={`liquid-sculpture ${motionEnabled ? 'is-playing' : ''}`} role="img" aria-label="An animated metallic sculpture flowing into liquid particles. Move the pointer to interact.">
    <img src="/sculpture-dark.webp" className={`sculpture-loading ${ready ? 'is-hidden' : ''}`} alt="" draggable={false} />
  </div>;
}
