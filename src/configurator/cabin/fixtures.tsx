import { useFrame } from '@react-three/fiber';
import { MeshReflectorMaterial } from '@react-three/drei';
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { ceilingFixtures, type Ceiling } from '../catalog';
import { ceilingMask } from '../textures';

const W = 2;
const D = 2;
const H = 2.4;

// ---------- lights that switch on ----------

const flicker: [number, number][] = [[0, 0], [0.08, 0.35], [0.13, 0.02], [0.22, 0.8], [0.3, 0.2], [0.42, 0.95], [0.5, 0.6], [0.75, 1]];

/** 0 → 1 with a short fluorescent-style flicker each time `key` changes. */
export function useLightLevel(key: string, reduced: boolean) {
  const level = useRef(reduced ? 1 : 0);
  const started = useRef(0);
  useEffect(() => { started.current = performance.now(); if (!reduced) level.current = 0; }, [key, reduced]);
  useFrame(() => {
    if (reduced) { level.current = 1; return; }
    const t = (performance.now() - started.current) / 1000;
    if (t >= 0.75) { level.current = 1; return; }
    for (let i = 1; i < flicker.length; i += 1) {
      const [t1, v1] = flicker[i];
      const [t0, v0] = flicker[i - 1];
      if (t <= t1) { level.current = v0 + ((t - t0) / (t1 - t0)) * (v1 - v0); break; }
    }
  });
  return level;
}

/** A glowing material whose brightness follows the light level (values above 1 bloom). */
function useGlow(color: string, level: MutableRefObject<number>, peak = 2.2, floor = 0.06) {
  const material = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false }), []);
  const base = useMemo(() => new THREE.Color(color), [color]);
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => { material.color.copy(base).multiplyScalar(floor + level.current * peak); });
  return material;
}

// ---------- ceilings ----------

function useAlphaTexture(source: HTMLCanvasElement) {
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(source);
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    return t;
  }, [source]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

function PerforatedCeiling({ ceiling, glow }: { ceiling: Ceiling; glow: THREE.Material }) {
  const alpha = useAlphaTexture(useMemo(() => ceilingMask(ceiling), [ceiling]));
  const metal = useMemo(
    () => new THREE.MeshStandardMaterial({ color: ceiling.color, metalness: 0.85, roughness: 0.28, alphaMap: alpha, alphaTest: 0.5, side: THREE.DoubleSide }),
    [ceiling.color, alpha],
  );
  useEffect(() => () => metal.dispose(), [metal]);
  return (
    <>
      <mesh material={glow} position={[0, -0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <mesh material={metal} position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
      </mesh>
    </>
  );
}

function Stars({ glow, level }: { glow: string; level: MutableRefObject<number> }) {
  const groups = useMemo(() => [0, 1, 2].map((g) => {
    const positions = new Float32Array(90 * 3);
    let seed = 7 + g * 101;
    const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let i = 0; i < 90; i += 1) {
      positions[i * 3] = (rand() - 0.5) * (W - 0.12);
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = (rand() - 0.5) * (D - 0.12);
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geometry;
  }), []);
  const materials = useMemo(() => [0, 1, 2].map((g) => new THREE.PointsMaterial({ size: g === 0 ? 0.016 : 0.01, color: g === 2 ? '#bfe3ff' : glow, toneMapped: false, transparent: true })), [glow]);
  const base = useMemo(() => materials.map((m) => m.color.clone()), [materials]);
  useEffect(() => () => { groups.forEach((g) => g.dispose()); materials.forEach((m) => m.dispose()); }, [groups, materials]);
  useFrame(({ clock }) => {
    materials.forEach((m, i) => {
      const twinkle = 0.55 + 0.45 * Math.sin(clock.elapsedTime * (1.3 + i * 0.7) + i * 2);
      m.color.copy(base[i]).multiplyScalar(level.current * (1.2 + twinkle * 1.6));
    });
  });
  return (
    <>
      {groups.map((geometry, i) => <points key={i} geometry={geometry} material={materials[i]} position={[0, -0.032, 0]} />)}
    </>
  );
}

function FixtureCeiling({ ceiling, glowColor, level }: { ceiling: Ceiling; glowColor: string; level: MutableRefObject<number> }) {
  const strong = useGlow(glowColor, level, 2.6);
  const soft = useGlow(glowColor, level, 1.25);
  const plate = useMemo(
    () => new THREE.MeshStandardMaterial({ color: ceiling.color, metalness: ceiling.pattern === 'linear' ? 0.6 : 0.2, roughness: ceiling.pattern === 'stars' ? 0.9 : 0.4 }),
    [ceiling.color, ceiling.pattern],
  );
  useEffect(() => () => plate.dispose(), [plate]);
  return (
    <>
      <mesh material={ceiling.pattern === 'panel' ? soft : plate} position={[0, -0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={ceiling.pattern === 'panel' ? [W - 0.18, D - 0.18] : [W, D]} />
      </mesh>
      {ceiling.pattern === 'panel' && [[0, D / 2 - 0.045, W, 0.09], [0, -D / 2 + 0.045, W, 0.09]].map(([x, z, w, d]) => (
        <mesh key={`pz${z}`} position={[x, -0.04, z]}><boxGeometry args={[w, 0.02, d]} /><meshStandardMaterial color="#c3c9cc" metalness={0.85} roughness={0.25} /></mesh>
      ))}
      {ceiling.pattern === 'panel' && [[W / 2 - 0.045, 0], [-W / 2 + 0.045, 0]].map(([x, z]) => (
        <mesh key={`px${x}`} position={[x, -0.04, z]}><boxGeometry args={[0.09, 0.02, D]} /><meshStandardMaterial color="#c3c9cc" metalness={0.85} roughness={0.25} /></mesh>
      ))}
      {ceiling.pattern === 'halo' && (
        <>
          <mesh material={strong} position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.58, 0.022, 16, 96]} />
          </mesh>
          <mesh position={[0, -0.045, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.66, 0.012, 12, 96]} />
            <meshStandardMaterial color="#c9a55a" metalness={0.95} roughness={0.2} />
          </mesh>
          <mesh material={strong} position={[0, -0.046, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.06, 32]} />
          </mesh>
        </>
      )}
      {ceiling.pattern === 'linear' && [-0.66, -0.22, 0.22, 0.66].map((x) => (
        <group key={x}>
          <mesh position={[x, -0.035, 0]}><boxGeometry args={[0.07, 0.012, D - 0.2]} /><meshStandardMaterial color="#20252a" metalness={0.6} roughness={0.4} /></mesh>
          <mesh material={strong} position={[x, -0.043, 0]}><boxGeometry args={[0.04, 0.004, D - 0.24]} /></mesh>
        </group>
      ))}
      {ceiling.pattern === 'stars' && <Stars glow={glowColor} level={level} />}
    </>
  );
}

export function CeilingFixture({ ceiling, glowColor, level, trim }: { ceiling: Ceiling; glowColor: string; level: MutableRefObject<number>; trim: THREE.Material }) {
  const panelGlow = useGlow(glowColor, level, 1.6, 0.04);
  const fixture = ceilingFixtures.includes(ceiling.pattern);
  return (
    <group position={[0, H, 0]}>
      {fixture ? <FixtureCeiling ceiling={ceiling} glowColor={glowColor} level={level} /> : <PerforatedCeiling ceiling={ceiling} glow={panelGlow} />}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[W + 0.04, 0.06, D + 0.04]} />
        <meshStandardMaterial color="#8f969b" metalness={0.6} roughness={0.5} />
      </mesh>
      {/* Cove band where the walls meet the ceiling. */}
      {[[0, -D / 2 + 0.01, W, 0.02], [0, D / 2 - 0.01, W, 0.02]].map(([x, z, w, d]) => (
        <mesh key={`cz${z}`} material={trim} position={[x, -0.075, z]}><boxGeometry args={[w, 0.05, d]} /></mesh>
      ))}
      {[[-W / 2 + 0.01, 0], [W / 2 - 0.01, 0]].map(([x, z]) => (
        <mesh key={`cx${x}`} material={trim} position={[x, -0.075, z]}><boxGeometry args={[0.02, 0.05, D]} /></mesh>
      ))}
    </group>
  );
}

// ---------- handrails ----------

function railPath(length: number, inset: number) {
  const r = 0.035;
  const half = length / 2;
  const path = new THREE.CurvePath<THREE.Vector3>();
  path.add(new THREE.LineCurve3(new THREE.Vector3(-half, 0, -inset), new THREE.Vector3(-half, 0, -r)));
  path.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(-half, 0, -r), new THREE.Vector3(-half, 0, 0), new THREE.Vector3(-half + r, 0, 0)));
  path.add(new THREE.LineCurve3(new THREE.Vector3(-half + r, 0, 0), new THREE.Vector3(half - r, 0, 0)));
  path.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(half - r, 0, 0), new THREE.Vector3(half, 0, 0), new THREE.Vector3(half, 0, -r)));
  path.add(new THREE.LineCurve3(new THREE.Vector3(half, 0, -r), new THREE.Vector3(half, 0, -inset)));
  return path;
}

export function Handrail({ side, style, material, glowColor, level }: {
  side: string; style: string; material: THREE.Material; glowColor: string; level: MutableRefObject<number>;
}) {
  const inset = 0.075;
  const length = side === 'back' ? 1.45 : 1.35;
  const tube = useMemo(() => new THREE.TubeGeometry(railPath(length, inset), 160, 0.019, 20, false), [length]);
  useEffect(() => () => tube.dispose(), [tube]);
  const glow = useGlow(glowColor, level, 3);
  const wood = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6e4426', roughness: 0.45, metalness: 0 }), []);
  useEffect(() => () => wood.dispose(), [wood]);
  if (side === 'none') return null;
  const y = 0.92;
  // Local −z always points at the wall the rail is fixed to.
  const placement = side === 'back'
    ? { position: [0, y, -D / 2 + inset] as [number, number, number], rotation: 0 }
    : side === 'right'
      ? { position: [-W / 2 + inset, y, 0] as [number, number, number], rotation: Math.PI / 2 }
      : { position: [W / 2 - inset, y, 0] as [number, number, number], rotation: -Math.PI / 2 };
  const brackets = [-length / 2 + 0.18, length / 2 - 0.18];
  return (
    <group position={placement.position} rotation={[0, placement.rotation, 0]}>
      {(style === 'round' || style === 'led') && (
        <>
          <mesh geometry={tube} material={material} />
          {[-length / 2, length / 2].map((x) => (
            <mesh key={x} material={material} position={[x, 0, -inset + 0.004]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.032, 0.032, 0.008, 24]} />
            </mesh>
          ))}
          {style === 'led' && (
            <mesh material={glow} position={[0, -0.024, -0.004]}>
              <boxGeometry args={[length - 0.12, 0.005, 0.012]} />
            </mesh>
          )}
        </>
      )}
      {style === 'flat' && (
        <>
          <mesh material={material} position={[0, 0, -0.01]}>
            <boxGeometry args={[length, 0.06, 0.014]} />
          </mesh>
          {brackets.map((x) => (
            <mesh key={x} material={material} position={[x, 0, -inset / 2 - 0.01]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.009, 0.009, inset - 0.02, 12]} />
            </mesh>
          ))}
        </>
      )}
      {style === 'wood' && (
        <>
          <mesh material={wood} position={[0, 0.006, -0.005]}>
            <boxGeometry args={[length, 0.042, 0.05]} />
          </mesh>
          {brackets.map((x) => (
            <group key={x}>
              <mesh material={material} position={[x, -0.035, -inset / 2]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.008, 0.008, inset, 12]} />
              </mesh>
              <mesh material={material} position={[x, -0.022, -0.005]}>
                <boxGeometry args={[0.03, 0.006, 0.05]} />
              </mesh>
            </group>
          ))}
        </>
      )}
    </group>
  );
}

// ---------- mirrors ----------

export function Mirror({ kind, frame, glowColor, level, lowPower }: {
  kind: string; frame: THREE.Material; glowColor: string; level: MutableRefObject<number>; lowPower: boolean;
}) {
  const glow = useGlow(glowColor, level, 1.8);
  if (kind === 'none') return null;
  const tall = kind === 'full' || kind === 'smoked';
  const bottom = tall ? 0.14 : 1.06;
  const top = kind === 'led' ? 2.12 : 2.2;
  const height = top - bottom;
  const width = kind === 'led' ? 1.2 : 1.36;
  const tint = kind === 'smoked' ? '#8a6f58' : '#cfd8dc';
  return (
    <group position={[0, bottom + height / 2, -D / 2 + 0.014]}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <MeshReflectorMaterial
          resolution={lowPower ? 256 : 768}
          mirror={1}
          blur={[0, 0]}
          mixBlur={0}
          mixStrength={kind === 'smoked' ? 0.85 : 1.15}
          color={tint}
          metalness={0.2}
          roughness={0.05}
          depthScale={0}
        />
      </mesh>
      {kind === 'led' && (
        <mesh material={glow} position={[0, 0, -0.006]}>
          <planeGeometry args={[width + 0.05, height + 0.05]} />
        </mesh>
      )}
      {(kind === 'half' || kind === 'full') && (
        <>
          {[height / 2 + 0.015, -height / 2 - 0.015].map((y) => (
            <mesh key={`h${y}`} material={frame} position={[0, y, 0.004]}><boxGeometry args={[width + 0.06, 0.03, 0.012]} /></mesh>
          ))}
          {[-1, 1].map((sign) => (
            <mesh key={`v${sign}`} material={frame} position={[sign * (width / 2 + 0.015), 0, 0.004]}><boxGeometry args={[0.03, height, 0.012]} /></mesh>
          ))}
        </>
      )}
      {kind === 'smoked' && (
        <mesh position={[0, 0, -0.004]}>
          <planeGeometry args={[width + 0.02, height + 0.02]} />
          <meshStandardMaterial color="#111" roughness={0.6} />
        </mesh>
      )}
    </group>
  );
}
