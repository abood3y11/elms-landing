import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { buttonTexture, drawDisplay, floorLabels, type DisplayState } from './labels';
import { sounds } from './sound';

// The car operating panel (COP): real, pressable buttons. Pressing a floor lights its ring,
// closes the doors, counts the floors on the display, chimes, and opens the doors again.

export type Ride = {
  floor: number;
  target: number | null;
  phase: 'idle' | 'closing' | 'moving' | 'arriving';
  dir: 'up' | 'down' | null;
  doorHold: 'open' | 'close' | null;
  alarmUntil: number;
};

export const idleRide: Ride = { floor: 0, target: null, phase: 'idle', dir: null, doorHold: null, alarmUntil: 0 };

/** Ride state machine shared by the panel and the doors. */
export function useRide(stops: number) {
  const [ride, setRideState] = useState<Ride>(idleRide);
  // A synchronous mirror, so actions decide from the current state without side effects in updaters.
  const current = useRef<Ride>(idleRide);
  const setRide = (update: (r: Ride) => Ride) => {
    current.current = update(current.current);
    setRideState(current.current);
  };
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)); };
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  useEffect(() => {
    if (current.current.floor >= stops) {
      current.current = { ...idleRide };
      setRideState(current.current);
    }
  }, [stops]);

  const travel = (from: number, to: number) => {
    const dir = to > from ? 'up' : 'down';
    const step = (floor: number) => {
      if (floor === to) {
        sounds.chime();
        setRide((r) => ({ ...r, floor, target: null, phase: 'arriving', dir: null, doorHold: 'open' }));
        later(() => setRide((r) => (r.phase === 'arriving' ? { ...r, phase: 'idle', doorHold: null } : r)), 3200);
        return;
      }
      const next = floor + (dir === 'up' ? 1 : -1);
      setRide((r) => ({ ...r, floor: next, phase: 'moving', dir }));
      later(() => step(next), 900);
    };
    setRide((r) => ({ ...r, target: to, phase: 'closing', dir, doorHold: 'close' }));
    later(() => { setRide((r) => ({ ...r, phase: 'moving' })); later(() => step(from), 450); }, 1100);
  };

  const actions = {
    press(floor: number) {
      sounds.click();
      const r = current.current;
      if (r.phase !== 'idle' && r.phase !== 'arriving') return;
      if (floor === r.floor) {
        setRide((x) => ({ ...x, doorHold: 'open' }));
        later(() => setRide((x) => ({ ...x, doorHold: null })), 2500);
        return;
      }
      travel(r.floor, floor);
    },
    open() {
      sounds.click();
      setRide((r) => (r.phase === 'moving' ? r : { ...r, doorHold: 'open' }));
      later(() => setRide((r) => (r.doorHold === 'open' && r.phase === 'idle' ? { ...r, doorHold: null } : r)), 3000);
    },
    close() {
      sounds.click();
      setRide((r) => (r.phase === 'moving' ? r : { ...r, doorHold: 'close' }));
    },
    alarm() {
      sounds.alarm();
      setRide((r) => ({ ...r, alarmUntil: performance.now() + 2500 }));
    },
  };
  return { ride, actions };
}

export type PanelKind = 'classic' | 'touch' | 'tft' | 'column';

type Look = {
  plate: THREE.MeshStandardMaterial;
  face: THREE.MeshStandardMaterial;
  bezel: THREE.MeshStandardMaterial;
  ring: string;
  tone: 'steel' | 'glass' | 'light';
  display: DisplayState['style'];
};

function useLook(kind: PanelKind, trimColor: string): Look {
  const look = useMemo<Look>(() => {
    const steel = (color: string, roughness = 0.28) => new THREE.MeshStandardMaterial({ color, metalness: 0.92, roughness });
    const glass = () => new THREE.MeshPhysicalMaterial({ color: '#06090c', metalness: 0.2, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.03 });
    if (kind === 'touch') return { plate: glass(), face: glass(), bezel: steel(trimColor, 0.2), ring: '#59d6ff', tone: 'glass', display: 'glass' };
    if (kind === 'column') return { plate: glass(), face: glass(), bezel: steel('#9aa3a8', 0.15), ring: '#59d6ff', tone: 'glass', display: 'glass' };
    if (kind === 'tft') {
      return {
        plate: steel('#b9c0c4', 0.32),
        face: new THREE.MeshPhysicalMaterial({ color: '#f4f7f8', metalness: 0, roughness: 0.18, clearcoat: 1 }),
        bezel: steel('#d6dbde', 0.18),
        ring: '#47b6ff',
        tone: 'light',
        display: 'tft',
      };
    }
    return { plate: steel('#b8bfc3', 0.34), face: steel('#dfe4e6', 0.2), bezel: steel('#c9cfd2', 0.16), ring: '#ffb347', tone: 'steel', display: 'dot' };
  }, [kind, trimColor]);
  useEffect(() => () => { look.plate.dispose(); look.face.dispose(); look.bezel.dispose(); }, [look]);
  return look;
}

function iconTexture(icon: 'open' | 'close' | 'alarm', light: boolean) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = icon === 'alarm' ? '#3b2a00' : light ? '#ffffff' : '#2b3034';
    if (light && icon !== 'alarm') { ctx.shadowColor = 'rgba(120,220,255,0.9)'; ctx.shadowBlur = 12; }
    const tri = (x: number, dir: 1 | -1) => {
      ctx.beginPath();
      ctx.moveTo(x, 64);
      ctx.lineTo(x + dir * 22, 40);
      ctx.lineTo(x + dir * 22, 88);
      ctx.closePath();
      ctx.fill();
    };
    if (icon === 'open') { tri(40, -1); tri(88, 1); ctx.fillRect(62, 38, 4, 52); }
    else if (icon === 'close') { tri(58, 1); tri(70, -1); ctx.fillRect(20, 38, 4, 52); ctx.fillRect(104, 38, 4, 52); }
    else {
      ctx.beginPath();
      ctx.arc(64, 60, 24, Math.PI, 0);
      ctx.lineTo(92, 84);
      ctx.lineTo(36, 84);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(64, 92, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function Button({ x, y, r, look, label, icon, lit, alarm, onPress, braille }: {
  x: number; y: number; r: number; look: Look; label?: string; icon?: 'open' | 'close' | 'alarm'; lit: boolean; alarm?: boolean; onPress: () => void; braille?: boolean;
}) {
  const face = useRef<THREE.Group>(null);
  const ring = useRef<THREE.MeshBasicMaterial>(null);
  const pressedAt = useRef(0);
  const texture = useMemo(() => (icon ? iconTexture(icon, look.tone === 'glass') : buttonTexture(label ?? '', look.tone)), [icon, label, look.tone]);
  const ringColor = useMemo(() => new THREE.Color(alarm ? '#ffcc33' : look.ring), [alarm, look.ring]);
  const glass = look.tone === 'glass';
  const yellowFace = useMemo(() => (alarm ? new THREE.MeshStandardMaterial({ color: '#f5c518', metalness: 0.2, roughness: 0.35, emissive: '#5a4300', emissiveIntensity: 0.4 }) : null), [alarm]);
  useEffect(() => () => yellowFace?.dispose(), [yellowFace]);

  useFrame(() => {
    if (face.current) {
      const since = performance.now() - pressedAt.current;
      face.current.position.z = since < 160 ? -0.004 : 0;
    }
    if (ring.current) {
      const level = lit ? 2.6 : glass ? 0.35 : 0.05;
      ring.current.color.copy(ringColor).multiplyScalar(level);
      ring.current.opacity = lit || glass ? 1 : 0.25;
    }
  });

  const press = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    pressedAt.current = performance.now();
    onPress();
  };

  return (
    <group position={[x, y, 0]}>
      {!glass && (
        <mesh material={look.bezel} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.003]}>
          <cylinderGeometry args={[r * 1.22, r * 1.28, 0.006, 40]} />
        </mesh>
      )}
      <mesh rotation={[0, 0, 0]} position={[0, 0, 0.0065]}>
        <torusGeometry args={[r * 1.08, glass ? r * 0.06 : r * 0.1, 12, 48]} />
        <meshBasicMaterial ref={ring} toneMapped={false} transparent />
      </mesh>
      <group ref={face}>
        <mesh
          material={yellowFace ?? look.face}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, glass ? 0.004 : 0.009]}
          onPointerDown={press}
          onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
          onPointerOut={() => { document.body.style.cursor = ''; }}
        >
          <cylinderGeometry args={[r, r, glass ? 0.002 : 0.008, 40]} />
        </mesh>
        <mesh position={[0, 0, glass ? 0.0055 : 0.0136]}>
          <planeGeometry args={[r * 1.5, r * 1.5]} />
          <meshBasicMaterial map={texture} transparent toneMapped={!glass && !lit} color={glass || lit ? '#ffffff' : '#ffffff'} />
        </mesh>
      </group>
      {braille && (
        <group position={[-r * 1.9, 0, 0.004]}>
          {[[0, 0.008], [0.007, 0.008], [0, 0], [0.007, -0.008]].map(([bx, by]) => (
            <mesh key={`${bx}-${by}`} material={look.bezel} position={[bx, by, 0]}>
              <sphereGeometry args={[0.0022, 8, 8]} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

function Display({ w, h, ride, labels, style, y }: { w: number; h: number; ride: Ride; labels: string[]; style: DisplayState['style']; y: number }) {
  const canvas = useMemo(() => { const c = document.createElement('canvas'); c.width = 512; c.height = Math.round(512 * (h / w)); return c; }, [w, h]);
  const texture = useMemo(() => { const t = new THREE.CanvasTexture(canvas); t.colorSpace = THREE.SRGBColorSpace; return t; }, [canvas]);
  useEffect(() => () => texture.dispose(), [texture]);
  useEffect(() => {
    const note = ride.phase === 'moving' || ride.phase === 'closing' ? `→ ${labels[ride.target ?? ride.floor] ?? ''}` : style === 'tft' ? 'HENS LINE' : undefined;
    drawDisplay(canvas, { floor: labels[ride.floor] ?? 'G', dir: ride.dir, style, note });
    texture.needsUpdate = true;
  }, [canvas, texture, ride, labels, style]);
  return (
    <mesh position={[0, y, 0.0045]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} toneMapped={false} color={[1.35, 1.35, 1.35]} />
    </mesh>
  );
}

function Brand({ y, light }: { y: number; light: boolean }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 96;
    const ctx = c.getContext('2d');
    if (ctx) {
      ctx.fillStyle = light ? 'rgba(255,255,255,0.75)' : 'rgba(40,46,50,0.75)';
      ctx.font = '800 54px "Segoe UI", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('HENS LINE', 256, 50);
    }
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [light]);
  return (
    <mesh position={[0, y, 0.0045]}>
      <planeGeometry args={[0.12, 0.0225]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

export function ControlPanel({ kind, x, stops, ride, actions, trimColor }: {
  kind: PanelKind; x: number; stops: number; ride: Ride; actions: ReturnType<typeof useRide>['actions']; trimColor: string;
}) {
  const look = useLook(kind, trimColor);
  const labels = useMemo(() => floorLabels(stops), [stops]);
  const alarmLit = useRef(false);
  const [, force] = useState(0);
  useFrame(() => {
    const on = performance.now() < ride.alarmUntil && Math.floor(performance.now() / 250) % 2 === 0;
    if (on !== alarmLit.current) { alarmLit.current = on; force((n) => n + 1); }
  });

  const n = labels.length;
  const column = kind === 'column';
  const cols = column || n > 12 ? 3 : 2;
  const rows = Math.ceil(n / cols);
  const pitch = column ? 0.074 : n > 12 ? 0.058 : 0.07;
  const r = column ? 0.025 : n > 12 ? 0.019 : 0.023;
  const displayH = kind === 'tft' ? 0.2 : column ? 0.2 : 0.08;
  const displayW = kind === 'tft' ? 0.16 : column ? 0.18 : 0.14;
  const plateW = column ? 0.27 : Math.max(0.2, cols * pitch + 0.08);
  const keysH = rows * pitch;
  const plateH = column ? 2.05 : 0.05 + displayH + 0.04 + keysH + 0.11 + 0.06;
  const centerY = column ? 0.15 + plateH / 2 : Math.min(1.3, Math.max(0.95, 1.2 - (plateH - 0.6) / 2));

  // Local layout, measured from the top of the plate (or from chest height on the column).
  const top = column ? 1.82 - centerY : plateH / 2 - 0.04;
  const displayY = top - displayH / 2;
  const keysTop = displayY - displayH / 2 - 0.05 - pitch / 2;
  const footerY = keysTop - (rows - 1) * pitch - pitch * 0.5 - 0.06;
  const colX = (c: number) => (c - (cols - 1) / 2) * pitch;

  return (
    // The panel faces into the cabin (it sits on the front wall's inner face).
    <group position={[x, centerY, 1 - 0.012]} rotation={[0, Math.PI, 0]}>
      <mesh material={look.plate}>
        <boxGeometry args={[plateW, plateH, column ? 0.022 : 0.012]} />
      </mesh>
      {column && [-1, 1].map((side) => (
        <mesh key={side} position={[side * (plateW / 2 - 0.004), 0, 0.012]}>
          <boxGeometry args={[0.006, plateH - 0.04, 0.004]} />
          <meshBasicMaterial color={[0.3, 2.2, 3]} toneMapped={false} />
        </mesh>
      ))}
      {!column && (
        <mesh position={[0, 0, -0.002]}>
          <boxGeometry args={[plateW + 0.012, plateH + 0.012, 0.008]} />
          <meshStandardMaterial color={trimColor} metalness={0.9} roughness={0.25} />
        </mesh>
      )}
      <group position={[0, 0, column ? 0.011 : 0.006]}>
        <Display w={displayW} h={displayH} ride={ride} labels={labels} style={look.display} y={displayY} />
        {labels.map((label, i) => {
          // Floors read bottom-up: G sits at the bottom of the keypad.
          const fromBottom = i;
          const row = Math.floor(fromBottom / cols);
          const col = fromBottom % cols;
          const y = keysTop - (rows - 1 - row) * pitch;
          return (
            <Button
              key={label}
              x={colX(col)}
              y={y}
              r={r}
              look={look}
              label={label}
              lit={ride.target === i || (ride.phase === 'arriving' && ride.floor === i)}
              onPress={() => actions.press(i)}
              braille={kind === 'classic'}
            />
          );
        })}
        <Button x={-pitch} y={footerY} r={r * 0.9} look={look} icon="open" lit={ride.doorHold === 'open'} onPress={actions.open} />
        <Button x={0} y={footerY} r={r * 0.9} look={look} icon="close" lit={ride.doorHold === 'close' && ride.phase === 'idle'} onPress={actions.close} />
        <Button x={pitch} y={footerY} r={r * 0.9} look={look} icon="alarm" alarm lit={alarmLit.current} onPress={actions.alarm} />
        <Brand y={column ? footerY - 0.09 : -plateH / 2 + 0.03} light={look.tone !== 'steel'} />
      </group>
    </group>
  );
}
