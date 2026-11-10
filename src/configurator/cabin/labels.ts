import * as THREE from 'three';

// Text for the 3D panel is drawn on canvases (no font download), cached per label.

const cache = new Map<string, THREE.CanvasTexture>();

export function floorLabels(stops: number): string[] {
  return Array.from({ length: stops }, (_, i) => (i === 0 ? 'G' : String(i)));
}

/** A button face: engraved digit, optional braille dots. */
export function buttonTexture(label: string, tone: 'steel' | 'glass' | 'light'): THREE.CanvasTexture {
  const key = `btn:${tone}:${label}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, size, size);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `800 ${label.length > 1 ? 54 : 64}px "Segoe UI", Arial, sans-serif`;
    // Engraved dark digits on steel and white keys; glowing white digits on black glass.
    ctx.fillStyle = tone === 'glass' ? '#ffffff' : tone === 'light' ? '#1f3a4d' : '#2b3034';
    if (tone === 'glass') {
      ctx.shadowColor = 'rgba(120, 220, 255, 0.9)';
      ctx.shadowBlur = 14;
    }
    ctx.fillText(label, size / 2, size / 2 + 4);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  cache.set(key, texture);
  return texture;
}

export type DisplayState = { floor: string; dir: 'up' | 'down' | null; style: 'dot' | 'tft' | 'glass'; note?: string };

/** The floor indicator: redrawn on the same canvas whenever the ride changes. */
export function drawDisplay(canvas: HTMLCanvasElement, state: DisplayState) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const { width: w, height: h } = canvas;
  ctx.clearRect(0, 0, w, h);
  if (state.style === 'tft') {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#0b2a45');
    g.addColorStop(1, '#04101c');
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = state.style === 'glass' ? '#030608' : '#060708';
  }
  ctx.fillRect(0, 0, w, h);

  const accent = state.style === 'dot' ? '#ff8a1f' : '#6fe3ff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 18;
  ctx.font = `900 ${Math.round(h * 0.58)}px "Segoe UI", Arial, sans-serif`;
  ctx.fillText(state.floor, w * 0.58, h * 0.56);

  if (state.dir) {
    const x = w * 0.2;
    const y = h * 0.5;
    const s = h * 0.18;
    ctx.beginPath();
    if (state.dir === 'up') {
      ctx.moveTo(x, y - s); ctx.lineTo(x + s, y + s * 0.6); ctx.lineTo(x - s, y + s * 0.6);
    } else {
      ctx.moveTo(x, y + s); ctx.lineTo(x + s, y - s * 0.6); ctx.lineTo(x - s, y - s * 0.6);
    }
    ctx.closePath();
    ctx.fill();
  }

  if (state.style === 'tft') {
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = `700 ${Math.round(h * 0.1)}px "Segoe UI", Arial, sans-serif`;
    ctx.fillText(state.note ?? 'HENS LINE', w / 2, h * 0.12);
    const now = new Date();
    ctx.fillText(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`, w / 2, h * 0.9);
  } else if (state.note) {
    ctx.shadowBlur = 8;
    ctx.font = `700 ${Math.round(h * 0.12)}px "Segoe UI", Arial, sans-serif`;
    ctx.fillText(state.note, w / 2, h * 0.9);
  }

  if (state.style === 'dot') {
    // Dot-matrix grid over the digits.
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    for (let x = 0; x < w; x += 6) ctx.fillRect(x, 0, 2, h);
    for (let y = 0; y < h; y += 6) ctx.fillRect(0, y, w, 2);
  }
}
