/** Smooth, bounded cursor influence. Zero outside the radius. */
export function letterInfluence(dx: number, dy: number, radius: number) {
  if (radius <= 0 || !Number.isFinite(radius)) return 0;
  const t = Math.max(0, 1 - Math.hypot(dx, dy) / radius);
  return t * t * (3 - 2 * t);
}

export function extrusionShadow(amount: number, direction: number) {
  const depth = Math.max(0, Math.min(1, amount)) * 14;
  if (depth < 0.05) return '0px 0px 0px transparent';
  const lean = Math.max(-1, Math.min(1, direction));
  return Array.from({ length: 10 }, (_, i) => {
    const step = (i + 1) / 10;
    const tone = i < 3 ? '#a9b891' : i < 7 ? '#65764f' : '#35422c';
    return `${(depth * step * lean * 0.5).toFixed(2)}px ${(depth * step).toFixed(2)}px 0 ${tone}`;
  }).join(', ');
}
