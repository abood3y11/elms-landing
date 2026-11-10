import { ceilingFixtures, type Ceiling, type Finish } from './catalog';

// Procedural finishes drawn on a canvas, so the designer works before real
// sample photos exist. Everything is seeded by the option code: the same
// finish always looks the same, in the swatch and on the 3D wall.

function seeded(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex: string, amount: number): string {
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift: number) => Math.max(0, Math.min(255, ((value >> shift) & 255) + amount));
  return `rgb(${channel(16)},${channel(8)},${channel(0)})`;
}

function canvas(size: number) {
  const element = document.createElement('canvas');
  element.width = size;
  element.height = size;
  const ctx = element.getContext('2d');
  if (!ctx) throw new Error('2d canvas unavailable');
  return { element, ctx };
}

function noise(ctx: CanvasRenderingContext2D, size: number, rand: () => number, strength: number) {
  const image = ctx.getImageData(0, 0, size, size);
  for (let i = 0; i < image.data.length; i += 4) {
    const n = (rand() - 0.5) * strength;
    image.data[i] += n;
    image.data[i + 1] += n;
    image.data[i + 2] += n;
  }
  ctx.putImageData(image, 0, 0);
}

function drawWood(ctx: CanvasRenderingContext2D, size: number, finish: Finish, rand: () => number) {
  ctx.fillStyle = finish.color;
  ctx.fillRect(0, 0, size, size);
  const planks = 4;
  for (let p = 0; p < planks; p += 1) {
    const x0 = (p / planks) * size;
    const tone = (rand() - 0.5) * 18;
    ctx.fillStyle = shade(finish.color, tone);
    ctx.fillRect(x0, 0, size / planks, size);
    for (let line = 0; line < 26; line += 1) {
      const x = x0 + rand() * (size / planks);
      const amp = 2 + rand() * 6;
      const freq = 1 + rand() * 3;
      ctx.strokeStyle = shade(finish.accent, (rand() - 0.5) * 30);
      ctx.globalAlpha = 0.18 + rand() * 0.25;
      ctx.lineWidth = Math.max(0.6, (size / 512) * (0.5 + rand() * 1.6));
      ctx.beginPath();
      for (let y = 0; y <= size; y += size / 32) {
        const xx = x + Math.sin((y / size) * Math.PI * 2 * freq + p) * amp * (size / 512);
        if (y === 0) ctx.moveTo(xx, y); else ctx.lineTo(xx, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = shade(finish.accent, -30);
    ctx.fillRect(x0, 0, Math.max(1, size / 512), size);
    ctx.globalAlpha = 1;
  }
}

function drawMarble(ctx: CanvasRenderingContext2D, size: number, finish: Finish, rand: () => number) {
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, shade(finish.color, 6));
  gradient.addColorStop(1, shade(finish.color, -8));
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  for (let v = 0; v < 9; v += 1) {
    ctx.strokeStyle = finish.accent;
    ctx.globalAlpha = 0.12 + rand() * 0.38;
    ctx.lineWidth = (size / 512) * (0.6 + rand() * 2.4);
    ctx.beginPath();
    let x = rand() * size;
    let y = -10;
    ctx.moveTo(x, y);
    while (y < size + 10) {
      const nx = x + (rand() - 0.45) * size * 0.18;
      const ny = y + size * (0.06 + rand() * 0.1);
      ctx.quadraticCurveTo(x + (rand() - 0.5) * size * 0.2, (y + ny) / 2, nx, ny);
      x = nx;
      y = ny;
    }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  noise(ctx, size, rand, 8);
}

function drawGranite(ctx: CanvasRenderingContext2D, size: number, finish: Finish, rand: () => number) {
  ctx.fillStyle = finish.color;
  ctx.fillRect(0, 0, size, size);
  const count = Math.round(size * size * 0.012);
  for (let i = 0; i < count; i += 1) {
    const pick = rand();
    ctx.fillStyle = pick < 0.45 ? finish.accent : pick < 0.75 ? shade(finish.color, 40) : shade(finish.color, -25);
    ctx.globalAlpha = 0.5 + rand() * 0.5;
    const r = (size / 512) * (0.6 + rand() * 2.2);
    ctx.fillRect(rand() * size, rand() * size, r, r);
  }
  ctx.globalAlpha = 1;
}

function drawSolid(ctx: CanvasRenderingContext2D, size: number, finish: Finish, rand: () => number) {
  ctx.fillStyle = finish.color;
  ctx.fillRect(0, 0, size, size);
  noise(ctx, size, rand, 6);
}

function drawSteel(ctx: CanvasRenderingContext2D, size: number, finish: Finish, rand: () => number) {
  ctx.fillStyle = finish.color;
  ctx.fillRect(0, 0, size, size);
  for (let y = 0; y < size; y += Math.max(1, size / 256)) {
    ctx.fillStyle = shade(finish.color, (rand() - 0.5) * 22);
    ctx.globalAlpha = 0.5;
    ctx.fillRect(0, y, size, Math.max(1, size / 512));
  }
  ctx.globalAlpha = 1;
  const unit = size / 8;
  ctx.strokeStyle = finish.accent;
  ctx.fillStyle = finish.accent;
  switch (finish.pattern) {
    case 'dots':
      for (let gx = 0; gx < 16; gx += 1) for (let gy = 0; gy < 16; gy += 1) {
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.arc((gx + 0.5) * (size / 16) + (gy % 2 ? size / 32 : 0), (gy + 0.5) * (size / 16), size / 90, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'wave':
      ctx.lineWidth = size / 110;
      for (let row = -1; row < 12; row += 1) {
        ctx.globalAlpha = 0.45;
        ctx.beginPath();
        for (let x = 0; x <= size; x += size / 64) {
          const y = row * (size / 10) + Math.sin((x / size) * Math.PI * 4) * (size / 34);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    case 'geo':
      ctx.lineWidth = size / 220;
      ctx.globalAlpha = 0.6;
      for (let gx = 0; gx <= 8; gx += 1) for (let gy = 0; gy <= 8; gy += 1) {
        const cx = gx * unit;
        const cy = gy * unit;
        ctx.beginPath();
        ctx.moveTo(cx, cy - unit / 2);
        ctx.lineTo(cx + unit / 2, cy);
        ctx.lineTo(cx, cy + unit / 2);
        ctx.lineTo(cx - unit / 2, cy);
        ctx.closePath();
        ctx.stroke();
        ctx.strokeRect(cx - unit / 6, cy - unit / 6, unit / 3, unit / 3);
      }
      break;
    case 'linen':
      ctx.lineWidth = Math.max(1, size / 400);
      for (let i = 0; i < size; i += size / 96) {
        ctx.globalAlpha = 0.18 + rand() * 0.2;
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(size, i);
        ctx.stroke();
      }
      break;
    default:
      break;
  }
  ctx.globalAlpha = 1;
}

const finishCache = new Map<string, HTMLCanvasElement>();

export function finishCanvas(finish: Finish, size = 512): HTMLCanvasElement {
  const key = `${finish.id}:${size}`;
  const cached = finishCache.get(key);
  if (cached) return cached;
  const { element, ctx } = canvas(size);
  const rand = seeded(finish.id);
  if (finish.kind === 'wood') drawWood(ctx, size, finish, rand);
  else if (finish.kind === 'marble') drawMarble(ctx, size, finish, rand);
  else if (finish.kind === 'granite') drawGranite(ctx, size, finish, rand);
  else if (finish.kind === 'steel') drawSteel(ctx, size, finish, rand);
  else drawSolid(ctx, size, finish, rand);
  finishCache.set(key, element);
  return element;
}

const swatchCache = new Map<string, string>();

export function finishSwatch(finish: Finish): string {
  const cached = swatchCache.get(finish.id);
  if (cached) return cached;
  let url = '';
  try {
    url = finishCanvas(finish, 160).toDataURL('image/png');
  } catch {
    url = '';
  }
  swatchCache.set(finish.id, url);
  return url;
}

/** White = metal, black = perforation (light shows through). Used as an alphaMap. */
export function ceilingMask(ceiling: Ceiling, size = 512): HTMLCanvasElement {
  const key = `mask:${ceiling.id}:${size}`;
  const cached = finishCache.get(key);
  if (cached) return cached;
  const { element, ctx } = canvas(size);
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#000';
  ctx.strokeStyle = '#000';
  const c = size / 2;
  const margin = size * 0.1;
  switch (ceiling.pattern) {
    case 'dots':
      for (let gx = 0; gx < 14; gx += 1) for (let gy = 0; gy < 14; gy += 1) {
        const x = margin + ((gx + 0.5) / 14) * (size - margin * 2);
        const y = margin + ((gy + 0.5) / 14) * (size - margin * 2);
        ctx.beginPath();
        ctx.arc(x, y, size / 70, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    case 'rings':
      ctx.lineWidth = size / 60;
      for (let r = size * 0.07; r < size * 0.42; r += size * 0.07) {
        ctx.beginPath();
        ctx.arc(c, c, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    case 'slots':
      for (let i = 0; i < 9; i += 1) {
        const x = margin + (i / 8) * (size - margin * 2);
        ctx.fillRect(x - size / 120, margin, size / 60, size - margin * 2);
      }
      break;
    case 'squares':
      for (let gx = 0; gx < 6; gx += 1) for (let gy = 0; gy < 6; gy += 1) {
        const cell = (size - margin * 2) / 6;
        ctx.fillRect(margin + gx * cell + cell * 0.18, margin + gy * cell + cell * 0.18, cell * 0.64, cell * 0.64);
      }
      break;
    case 'star':
      ctx.lineWidth = size / 70;
      for (let a = 0; a < 16; a += 1) {
        const angle = (a / 16) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(c + Math.cos(angle) * size * 0.06, c + Math.sin(angle) * size * 0.06);
        ctx.lineTo(c + Math.cos(angle) * size * 0.4, c + Math.sin(angle) * size * 0.4);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(c, c, size * 0.04, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'frame':
      ctx.fillRect(margin, margin, size - margin * 2, size - margin * 2);
      ctx.fillStyle = '#fff';
      ctx.fillRect(margin + size * 0.05, margin + size * 0.05, size - margin * 2 - size * 0.1, size - margin * 2 - size * 0.1);
      break;
    case 'hex': {
      const r = size / 16;
      const h = Math.sqrt(3) * r;
      ctx.lineWidth = size / 110;
      for (let row = -1; row < 14; row += 1) {
        for (let col = -1; col < 12; col += 1) {
          const cx = col * r * 3 + (row % 2 ? r * 1.5 : 0);
          const cy = row * (h / 2);
          if (cx < margin || cx > size - margin || cy < margin || cy > size - margin) continue;
          ctx.beginPath();
          for (let k = 0; k < 6; k += 1) {
            const a = (Math.PI / 3) * k;
            const x = cx + Math.cos(a) * r * 0.82;
            const y = cy + Math.sin(a) * r * 0.82;
            if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      break;
    }
    case 'waves':
      ctx.lineWidth = size / 70;
      for (let row = 0; row < 7; row += 1) {
        ctx.beginPath();
        for (let x = margin; x <= size - margin; x += size / 128) {
          const y = margin + size * 0.06 + row * ((size - margin * 2 - size * 0.12) / 6) + Math.sin((x / size) * Math.PI * 5) * size * 0.025;
          if (x === margin) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      break;
    default:
      break;
  }
  finishCache.set(key, element);
  return element;
}

/** Swatches for the ceilings that are built as light fittings rather than perforated metal. */
function fixtureSwatch(ceiling: Ceiling): string {
  const { element, ctx } = canvas(160);
  const c = 80;
  ctx.fillStyle = ceiling.color;
  ctx.fillRect(0, 0, 160, 160);
  const glow = (draw: () => void, blur = 14, color = '#fff6dc') => {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = blur;
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    draw();
    ctx.restore();
  };
  if (ceiling.pattern === 'halo') {
    glow(() => { ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(c, c, 48, 0, Math.PI * 2); ctx.stroke(); });
    glow(() => { ctx.beginPath(); ctx.arc(c, c, 9, 0, Math.PI * 2); ctx.fill(); }, 10);
  } else if (ceiling.pattern === 'linear') {
    for (let i = 0; i < 4; i += 1) glow(() => ctx.fillRect(30 + i * 30, 18, 8, 124), 12);
  } else if (ceiling.pattern === 'stars') {
    const rand = seeded(ceiling.id);
    for (let i = 0; i < 90; i += 1) {
      const size = rand() < 0.15 ? 2.4 : 1.2;
      glow(() => { ctx.beginPath(); ctx.arc(rand() * 160, rand() * 160, size, 0, Math.PI * 2); ctx.fill(); }, 6, rand() < 0.3 ? '#bfe3ff' : '#fff6dc');
    }
  } else {
    const gradient = ctx.createRadialGradient(c, c, 10, c, c, 110);
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#ece8dc');
    ctx.fillStyle = gradient;
    ctx.fillRect(10, 10, 140, 140);
    ctx.strokeStyle = '#b9bfc3';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, 140, 140);
  }
  return element.toDataURL('image/png');
}

export function ceilingSwatch(ceiling: Ceiling): string {
  const key = `cs:${ceiling.id}`;
  const cached = swatchCache.get(key);
  if (cached) return cached;
  let url = '';
  if (ceilingFixtures.includes(ceiling.pattern)) {
    try { url = fixtureSwatch(ceiling); } catch { url = ''; }
    swatchCache.set(key, url);
    return url;
  }
  try {
    const mask = ceilingMask(ceiling, 160);
    const { element, ctx } = canvas(160);
    ctx.fillStyle = '#fff6dc';
    ctx.fillRect(0, 0, 160, 160);
    const metal = canvas(160);
    metal.ctx.fillStyle = ceiling.color;
    metal.ctx.fillRect(0, 0, 160, 160);
    metal.ctx.globalCompositeOperation = 'destination-in';
    // Turn the black/white mask into alpha: white stays, black is cut out.
    const alpha = canvas(160);
    alpha.ctx.drawImage(mask, 0, 0);
    const data = alpha.ctx.getImageData(0, 0, 160, 160);
    for (let i = 0; i < data.data.length; i += 4) data.data[i + 3] = data.data[i];
    alpha.ctx.putImageData(data, 0, 0);
    metal.ctx.drawImage(alpha.element, 0, 0);
    ctx.drawImage(metal.element, 0, 0);
    url = element.toDataURL('image/png');
  } catch {
    url = '';
  }
  swatchCache.set(key, url);
  return url;
}
