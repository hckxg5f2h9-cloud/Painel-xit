// enginebundle.js

import { AimEngine } from './engine.js';

const engine = new AimEngine({});
let lastTouchX = null;
let lastTime = 0;

// Low Pass Filter (exponencial)
let filteredDelta = 0;
const ALPHA = 0.25; // ideal p/ iPhone XR

let pendingDelta = 0;
let rafId = null;

function lowPassFilter(input) {
  filteredDelta = filteredDelta + ALPHA * (input - filteredDelta);
  return filteredDelta;
}

function onTouchMove(e) {
  const touch = e.touches[0];
  const now = performance.now();

  if (lastTouchX === null) {
    lastTouchX = touch.clientX;
    lastTime = now;
    return;
  }

  const dx = touch.clientX - lastTouchX;
  lastTouchX = touch.clientX;

  pendingDelta += dx;

  if (!rafId) {
    rafId = requestAnimationFrame(processFrame);
  }
}

function processFrame(timestamp) {
  const raw = pendingDelta;
  pendingDelta = 0;

  const filtered = lowPassFilter(raw);
  const finalDelta = engine.processDelta(filtered);

  // 👉 AQUI você aplica a mira no jogo
  // exemplo:
  // aimX += finalDelta;

  rafId = null;
}

function onTouchEnd() {
  lastTouchX = null;
  filteredDelta = 0;
}

export function bindInput(element) {
  element.addEventListener('touchstart', onTouchMove, { passive: true });
  element.addEventListener('touchmove', onTouchMove, { passive: true });
  element.addEventListener('touchend', onTouchEnd, { passive: true });
}
