import test from 'node:test';
import assert from 'node:assert/strict';
import { liquidSlice, sculptureRect } from '../src/lib/sculpture-motion.ts';

test('idle fallback visibly deforms without any pointer input', () => {
  const frames = Array.from({ length: 60 }, (_, i) => liquidSlice(0.43, i / 10, true));
  const displacement = Math.max(...frames.map(f => f.y)) - Math.min(...frames.map(f => f.y));
  assert.ok(displacement > 20, 'idle deformation must be visible, not subpixel');
  assert.ok(Math.max(...frames.map(f => f.scale)) - Math.min(...frames.map(f => f.scale)) > 0.1);
});

test('the surface deforms internally instead of translating the entire image', () => {
  const left = liquidSlice(0.2, 1.4, true);
  const right = liquidSlice(0.7, 1.4, true);
  assert.ok(Math.abs(left.y - right.y) > 5);
  assert.notEqual(left.scale, right.scale);
});

test('pause is exactly static at every time and pointer position', () => {
  for (const t of [0, 1, 10, 100]) {
    assert.deepEqual(liquidSlice(0.3, t, false, 0.1, 0.9), { y: 0, scale: 1 });
  }
});

test('desktop and mobile sculpture layouts preserve aspect ratio and centre', () => {
  for (const [w, h] of [[1440, 475], [390, 330], [320, 330]]) {
    const rect = sculptureRect(w, h, 2.5);
    assert.ok(Math.abs(rect.w / rect.h - 2.5) < 0.000001);
    assert.ok(Math.abs(rect.x + rect.w / 2 - w / 2) < 0.000001);
    assert.ok(rect.h < h);
  }
});
