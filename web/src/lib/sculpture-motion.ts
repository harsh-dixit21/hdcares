/** Deterministic deformation for the non-WebGL surface renderer. */
export function liquidSlice(x: number, seconds: number, enabled: boolean, pointerX = 0.5, pointerY = 0.5) {
  if (!enabled) return { y: 0, scale: 1 };
  const local = Math.exp(-Math.pow((x - pointerX) * 4, 2));
  return {
    y: Math.sin(x * 10 + seconds * 1.35) * 13 + Math.cos(x * 18 - seconds * 0.9) * 5 + local * (pointerY - 0.5) * 17,
    scale: 1 + Math.sin(x * 9 - seconds * 1.1) * 0.075 + Math.cos(seconds * 0.7) * 0.025,
  };
}
export function sculptureRect(width: number, height: number, aspect: number) {
  const w = Math.min(width * (width < 640 ? 1.55 : 1.02), height * aspect * 0.92);
  const h = w / aspect;
  return { x: (width - w) / 2, y: (height - h) / 2, w, h };
}
