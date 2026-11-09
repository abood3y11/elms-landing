import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, MeshReflectorMaterial, OrbitControls } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ceilings, doorFinishes, floors, lights, trims, walls, type Ceiling, type Finish } from './catalog';
import type { Design } from './rules';
import { ceilingMask, finishCanvas } from './textures';

// The cabin is built from plain boxes and planes in code (no model file), so
// every choice redraws instantly. Units are metres: 2 x 2 floor, 2.4 high,
// the main entrance faces +z.

export type ViewId = 'front' | 'interior' | 'landing' | 'exterior' | 'ceiling' | 'controls';

const W = 2;
const D = 2;
const H = 2.4;
const DW = 0.9;
const DH = 2.1;
const WALL_T = 0.04;
const TILE = 1.1;

type Rect = { u: number; v: number; w: number; h: number };

function wallRects(width: number, withDoor: boolean): Rect[] {
  if (!withDoor) return [{ u: 0, v: H / 2, w: width, h: H }];
  const side = (width - DW) / 2;
  return [
    { u: -(DW / 2 + side / 2), v: H / 2, w: side, h: H },
    { u: DW / 2 + side / 2, v: H / 2, w: side, h: H },
    { u: 0, v: DH + (H - DH) / 2, w: DW, h: H - DH },
  ];
}

function useUvPlane(rect: Rect, tile: number) {
  return useMemo(() => {
    const geometry = new THREE.PlaneGeometry(rect.w, rect.h);
    const position = geometry.attributes.position;
    const uv = geometry.attributes.uv;
    for (let i = 0; i < position.count; i += 1) {
      uv.setXY(i, (position.getX(i) + rect.u + 10) / tile, (position.getY(i) + rect.v) / tile);
    }
    uv.needsUpdate = true;
    return geometry;
  }, [rect.u, rect.v, rect.w, rect.h, tile]);
}

function TexturedRect({ rect, material, offset = 0 }: { rect: Rect; material: THREE.Material; offset?: number }) {
  const geometry = useUvPlane(rect, TILE);
  return <mesh geometry={geometry} material={material} position={[rect.u, rect.v, offset]} />;
}

function useCanvasTexture(source: HTMLCanvasElement | null) {
  const texture = useMemo(() => {
    if (!source) return null;
    const next = new THREE.CanvasTexture(source);
    next.wrapS = THREE.RepeatWrapping;
    next.wrapT = THREE.RepeatWrapping;
    next.colorSpace = THREE.SRGBColorSpace;
    next.anisotropy = 4;
    return next;
  }, [source]);
  useEffect(() => () => texture?.dispose(), [texture]);
  return texture;
}

function finishParams(finish: Finish) {
  if (finish.kind === 'steel') return { metalness: 0.7, roughness: 0.38 };
  if (finish.kind === 'marble' || finish.kind === 'granite') return { metalness: 0, roughness: 0.26 };
  if (finish.kind === 'wood') return { metalness: 0, roughness: 0.5 };
  return { metalness: 0, roughness: 0.55 };
}

function useFinishMaterial(finish: Finish) {
  const source = useMemo(() => finishCanvas(finish), [finish]);
  const map = useCanvasTexture(source);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ map, ...finishParams(finish) }), [map, finish]);
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

function useMetal(color: string, mirror = false, metalness = 0.88) {
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color, metalness: mirror ? 1 : metalness, roughness: mirror ? 0.06 : 0.3 }),
    [color, mirror, metalness],
  );
  useEffect(() => () => material.dispose(), [material]);
  return material;
}

type WallSide = 'back' | 'left' | 'right' | 'front';

const wallPlacement: Record<WallSide, { position: [number, number, number]; rotation: number; width: number }> = {
  back: { position: [0, 0, -D / 2], rotation: 0, width: W },
  left: { position: [-W / 2, 0, 0], rotation: Math.PI / 2, width: D },
  right: { position: [W / 2, 0, 0], rotation: -Math.PI / 2, width: D },
  front: { position: [0, 0, D / 2], rotation: Math.PI, width: W },
};

const reducedMotion = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function DoorLeaves({ style, material, open }: { style: string; material: THREE.Material; open: boolean }) {
  const amount = useRef(open ? 1 : 0);
  const a = useRef<THREE.Mesh>(null);
  const b = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    const target = open ? 1 : 0;
    amount.current = reducedMotion ? target : THREE.MathUtils.damp(amount.current, target, 6, delta);
    const t = amount.current;
    if (!a.current || !b.current) return;
    if (style === 'side') {
      // Telescopic: both leaves travel to the same side, the front one twice as far.
      a.current.position.x = -DW / 4 - t * (DW / 2);
      b.current.position.x = DW / 4 - t * DW;
    } else {
      a.current.position.x = -DW / 4 - t * (DW / 2);
      b.current.position.x = DW / 4 + t * (DW / 2);
    }
  });
  return (
    <group position={[0, 0, -WALL_T - 0.02]}>
      <mesh ref={a} material={material} position={[-DW / 4, DH / 2, style === 'side' ? -0.03 : 0]}>
        <boxGeometry args={[DW / 2 - 0.004, DH, 0.025]} />
      </mesh>
      <mesh ref={b} material={material} position={[DW / 4, DH / 2, 0]}>
        <boxGeometry args={[DW / 2 - 0.004, DH, 0.025]} />
      </mesh>
    </group>
  );
}

function Wall({ side, doorStyle, interior, shell, trim, doorMaterial, open }: {
  side: WallSide; doorStyle?: string; interior: THREE.Material; shell: THREE.Material; trim: THREE.Material; doorMaterial: THREE.Material; open: boolean;
}) {
  const place = wallPlacement[side];
  const rects = wallRects(place.width, Boolean(doorStyle));
  return (
    <group position={place.position} rotation={[0, place.rotation, 0]}>
      {rects.map((rect) => (
        <group key={`${rect.u}-${rect.v}`}>
          <TexturedRect rect={rect} material={side === 'front' ? shell : interior} offset={0.001} />
          <mesh material={shell} position={[rect.u, rect.v, -WALL_T / 2]}>
            <boxGeometry args={[rect.w, rect.h, WALL_T]} />
          </mesh>
          {rect.v === H / 2 && (
            <mesh material={trim} position={[rect.u, 0.05, 0.008]}>
              <boxGeometry args={[rect.w, 0.1, 0.014]} />
            </mesh>
          )}
        </group>
      ))}
      {doorStyle && (
        <>
          <DoorLeaves style={doorStyle} material={doorMaterial} open={open} />
          <mesh material={doorMaterial} position={[0, DH + 0.03, 0.01]}><boxGeometry args={[DW + 0.08, 0.06, 0.02]} /></mesh>
          {[-1, 1].map((sign) => (
            <mesh key={sign} material={doorMaterial} position={[sign * (DW / 2 + 0.03), DH / 2, 0.01]}><boxGeometry args={[0.06, DH, 0.02]} /></mesh>
          ))}
        </>
      )}
    </group>
  );
}

function Corners({ material }: { material: THREE.Material }) {
  const s = 0.05;
  const spots: [number, number][] = [[-W / 2 + s / 2, -D / 2 + s / 2], [W / 2 - s / 2, -D / 2 + s / 2], [-W / 2 + s / 2, D / 2 - s / 2], [W / 2 - s / 2, D / 2 - s / 2]];
  return (
    <>
      {spots.map(([x, z]) => (
        <mesh key={`${x}-${z}`} material={material} position={[x, H / 2, z]}>
          <boxGeometry args={[s, H, s]} />
        </mesh>
      ))}
    </>
  );
}

function Mirror({ kind, frame }: { kind: string; frame: THREE.Material }) {
  if (kind === 'none') return null;
  const bottom = kind === 'full' ? 0.14 : 1.08;
  const top = 2.22;
  const height = top - bottom;
  const width = 1.36;
  return (
    <group position={[0, bottom + height / 2, -D / 2 + 0.012]}>
      <mesh>
        <planeGeometry args={[width, height]} />
        <MeshReflectorMaterial resolution={512} mirror={1} blur={[0, 0]} mixBlur={0} mixStrength={1.15} color="#cfd8dc" metalness={0.2} roughness={0.05} depthScale={0} />
      </mesh>
      {[[0, height / 2 + 0.015, width + 0.06, 0.03], [0, -height / 2 - 0.015, width + 0.06, 0.03]].map(([x, y, w, h]) => (
        <mesh key={`h${y}`} material={frame} position={[x, y, 0.005]}><boxGeometry args={[w, h, 0.012]} /></mesh>
      ))}
      {[-1, 1].map((sign) => (
        <mesh key={`v${sign}`} material={frame} position={[sign * (width / 2 + 0.015), 0, 0.005]}><boxGeometry args={[0.03, height, 0.012]} /></mesh>
      ))}
    </group>
  );
}

function Handrail({ side, material }: { side: string; material: THREE.Material }) {
  if (side === 'none') return null;
  const y = 0.95;
  const inset = 0.07;
  const length = 1.4;
  const placement = side === 'back'
    ? { position: [0, y, -D / 2 + inset] as const, rotation: 0 }
    : side === 'right'
      ? { position: [-W / 2 + inset, y, 0] as const, rotation: Math.PI / 2 }
      : { position: [W / 2 - inset, y, 0] as const, rotation: Math.PI / 2 };
  return (
    <group position={[...placement.position]} rotation={[0, placement.rotation, 0]}>
      <mesh material={material} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.019, 0.019, length, 20]} />
      </mesh>
      {[-1, 1].map((sign) => (
        <mesh key={sign} material={material} position={[sign * (length / 2 - 0.12), 0, -inset / 2 * (side === 'left' ? -1 : 1)]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, inset, 10]} />
        </mesh>
      ))}
    </group>
  );
}

function Ceiling({ ceiling, light }: { ceiling: Ceiling; light: string }) {
  const mask = useMemo(() => ceilingMask(ceiling), [ceiling]);
  const alpha = useCanvasTexture(mask);
  const metal = useMemo(() => {
    const material = new THREE.MeshStandardMaterial({ color: ceiling.color, metalness: 0.8, roughness: 0.32, alphaMap: alpha ?? undefined, alphaTest: 0.5, side: THREE.DoubleSide });
    if (alpha) {
      alpha.wrapS = THREE.ClampToEdgeWrapping;
      alpha.wrapT = THREE.ClampToEdgeWrapping;
    }
    return material;
  }, [ceiling.color, alpha]);
  useEffect(() => () => metal.dispose(), [metal]);
  return (
    <group position={[0, H, 0]}>
      <mesh position={[0, -0.005, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshBasicMaterial color={light} toneMapped={false} />
      </mesh>
      <mesh material={metal} position={[0, -0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
      </mesh>
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[W + 0.04, 0.06, D + 0.04]} />
        <meshStandardMaterial color="#9aa1a6" metalness={0.6} roughness={0.5} />
      </mesh>
    </group>
  );
}

function ControlPanel({ kind, side }: { kind: string; side: string }) {
  // "Right" is the passenger's right when facing the doors from inside (looking +z).
  const x = side === 'right' ? -0.72 : 0.72;
  const plateColor = kind === 'touch' ? '#0d0f12' : '#aeb5b9';
  const buttons = kind === 'classic' ? 8 : kind === 'tft' ? 6 : 0;
  return (
    <group position={[x, 1.2, D / 2 - 0.012]} rotation={[0, Math.PI, 0]}>
      <mesh>
        <boxGeometry args={[0.24, 0.78, 0.012]} />
        <meshStandardMaterial color={plateColor} metalness={kind === 'touch' ? 0.1 : 0.55} roughness={kind === 'touch' ? 0.08 : 0.3} />
      </mesh>
      <mesh position={[0, kind === 'tft' ? 0.22 : 0.29, 0.008]}>
        <planeGeometry args={kind === 'tft' ? [0.18, 0.2] : kind === 'touch' ? [0.18, 0.12] : [0.12, 0.06]} />
        <meshBasicMaterial color={kind === 'touch' ? '#1d6b8f' : '#0b1a24'} toneMapped={false} />
      </mesh>
      {kind === 'touch' && Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[(i % 2 ? 0.045 : -0.045), 0.12 - Math.floor(i / 2) * 0.09, 0.0075]}>
          <circleGeometry args={[0.022, 24]} />
          <meshBasicMaterial color="#3fb0d8" transparent opacity={0.6} toneMapped={false} />
        </mesh>
      ))}
      {Array.from({ length: buttons }).map((_, i) => (
        <mesh key={i} position={[(i % 2 ? 0.05 : -0.05), (kind === 'tft' ? 0.04 : 0.17) - Math.floor(i / 2) * 0.1, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.012, 24]} />
          {kind === 'tft'
            ? <meshStandardMaterial color="#e9eef0" emissive="#5ac8ff" emissiveIntensity={0.6} />
            : <meshStandardMaterial color="#dfe4e6" metalness={0.9} roughness={0.2} />}
        </mesh>
      ))}
    </group>
  );
}

function Landing({ doorMaterial }: { doorMaterial: THREE.Material }) {
  const width = 7;
  const height = 4.2;
  const side = (width - DW) / 2;
  const plaster = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e9e4da', roughness: 0.9 }), []);
  useEffect(() => () => plaster.dispose(), [plaster]);
  return (
    <group position={[0, 0, D / 2 + 0.14]}>
      {[-1, 1].map((sign) => (
        <mesh key={sign} material={plaster} position={[sign * (DW / 2 + side / 2), height / 2 - 0.3, 0]}>
          <boxGeometry args={[side, height, 0.1]} />
        </mesh>
      ))}
      <mesh material={plaster} position={[0, DH + (height - 0.3 - DH) / 2, 0]}>
        <boxGeometry args={[DW, height - 0.3 - DH, 0.1]} />
      </mesh>
      <mesh material={doorMaterial} position={[0, DH + 0.06, 0.06]}><boxGeometry args={[DW + 0.24, 0.12, 0.03]} /></mesh>
      {[-1, 1].map((sign) => (
        <mesh key={`j${sign}`} material={doorMaterial} position={[sign * (DW / 2 + 0.06), DH / 2, 0.06]}><boxGeometry args={[0.12, DH, 0.03]} /></mesh>
      ))}
      <mesh position={[0, DH + 0.3, 0.06]}><boxGeometry args={[0.36, 0.14, 0.02]} /><meshStandardMaterial color="#121416" /></mesh>
      <mesh position={[0, DH + 0.3, 0.071]}><planeGeometry args={[0.1, 0.08]} /><meshBasicMaterial color="#ff8a1f" toneMapped={false} /></mesh>
      <group position={[DW / 2 + 0.38, 1.15, 0.06]}>
        <mesh><boxGeometry args={[0.1, 0.22, 0.015]} /><meshStandardMaterial color="#b9c2c3" metalness={0.85} roughness={0.3} /></mesh>
        {[0.05, -0.05].map((y) => (
          <mesh key={y} position={[0, y, 0.01]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.022, 0.022, 0.01, 20]} /><meshStandardMaterial color="#f2f4f5" emissive="#ffb35c" emissiveIntensity={0.35} /></mesh>
        ))}
      </group>
      <mesh position={[0, -0.3, 2]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[width, 4]} /><meshStandardMaterial color="#d7d2c8" roughness={0.6} /></mesh>
    </group>
  );
}

type ViewConfig = {
  position: [number, number, number];
  target: [number, number, number];
  fov: number;
  orbit: false | { minDistance: number; maxDistance: number; minAzimuth: number; maxAzimuth: number; minPolar: number; maxPolar: number; zoom: boolean; rotateSpeed: number };
};

function viewConfig(view: ViewId, design: Design): ViewConfig {
  const panelX = design.panelSide === 'right' ? -0.72 : 0.72;
  switch (view) {
    case 'interior':
      return { position: [0, 1.35, 0.62], target: [0, 1.35, 0.6], fov: 82, orbit: { minDistance: 0.02, maxDistance: 0.02, minAzimuth: -Infinity, maxAzimuth: Infinity, minPolar: 0.5, maxPolar: 2.4, zoom: false, rotateSpeed: -0.35 } };
    case 'landing':
      return { position: [0, 1.25, 7.4], target: [0, 1.15, 0], fov: 40, orbit: { minDistance: 4, maxDistance: 9.5, minAzimuth: -0.5, maxAzimuth: 0.5, minPolar: 1.1, maxPolar: 1.75, zoom: true, rotateSpeed: 0.6 } };
    case 'exterior': {
      const mirror = design.entrance === 'side-left' ? -1 : 1;
      return { position: [3.4 * mirror, 2.3, 4.6], target: [0, 1.15, 0], fov: 38, orbit: { minDistance: 4, maxDistance: 8.5, minAzimuth: -Infinity, maxAzimuth: Infinity, minPolar: 0.6, maxPolar: 1.7, zoom: true, rotateSpeed: 0.6 } };
    }
    case 'ceiling':
      return { position: [0, 0.45, 0.35], target: [0, H, 0], fov: 75, orbit: false };
    case 'controls':
      return { position: [panelX * 0.2, 1.3, 0.1], target: [panelX, 1.2, D / 2], fov: 55, orbit: { minDistance: 0.7, maxDistance: 1.1, minAzimuth: -Infinity, maxAzimuth: Infinity, minPolar: 1.2, maxPolar: 1.9, zoom: true, rotateSpeed: 0.4 } };
    default:
      return { position: [0, 1.3, 6.8], target: [0, 1.15, 0], fov: 40, orbit: { minDistance: 3.6, maxDistance: 9.5, minAzimuth: -0.5, maxAzimuth: 0.5, minPolar: 1.1, maxPolar: 1.75, zoom: true, rotateSpeed: 0.6 } };
  }
}

function CameraRig({ config, resetKey }: { config: ViewConfig; resetKey: number }) {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;
  const controls = useRef<OrbitControlsImpl>(null);
  useEffect(() => {
    camera.position.set(...config.position);
    camera.fov = config.fov;
    camera.near = 0.01;
    camera.updateProjectionMatrix();
    camera.lookAt(...config.target);
    if (controls.current) {
      controls.current.target.set(...config.target);
      controls.current.update();
    }
  }, [camera, config, resetKey]);
  if (!config.orbit) return null;
  const orbit = config.orbit;
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enablePan={false}
      enableZoom={orbit.zoom}
      minDistance={orbit.minDistance}
      maxDistance={orbit.maxDistance}
      minAzimuthAngle={orbit.minAzimuth}
      maxAzimuthAngle={orbit.maxAzimuth}
      minPolarAngle={orbit.minPolar}
      maxPolarAngle={orbit.maxPolar}
      rotateSpeed={orbit.rotateSpeed}
      enableDamping
      target={config.target}
    />
  );
}

function Cabin({ design, view, doorsOpen }: { design: Design; view: ViewId; doorsOpen: boolean }) {
  const wall = (walls.find((item) => item.id === design.wall) ?? walls[0]);
  const floor = (floors.find((item) => item.id === design.floor) ?? floors[0]);
  const ceiling = (ceilings.find((item) => item.id === design.ceiling) ?? ceilings[0]);
  const trimColor = (trims.find((item) => item.id === design.trim) ?? trims[0]).color;
  const doorOption = doorFinishes.find((item) => item.id === design.doorfinish) ?? doorFinishes[0];
  const lightColor = (lights.find((item) => item.id === design.light) ?? lights[0]).color;

  const interior = useFinishMaterial(wall);
  const floorMaterial = useFinishMaterial(floor);
  const trim = useMetal(trimColor);
  const shell = useMetal('#c9cfd2', false, 0.35);
  const doorMaterial = useMetal(doorOption.color, doorOption.id.endsWith('mirror'));
  const handrail = useMetal(trimColor === '#272b2d' ? '#3a3f42' : trimColor);
  const floorGeometry = useUvPlane({ u: 0, v: 0, w: W, h: D }, TILE);

  const entrance = design.entrance;
  const doorStyle = design.door;
  const showFront = view !== 'front';
  const common = { interior, shell, trim, doorMaterial, open: doorsOpen };

  return (
    <group>
      <mesh geometry={floorGeometry} material={floorMaterial} rotation={[-Math.PI / 2, 0, 0]} />
      <mesh position={[0, -0.04, 0]}><boxGeometry args={[W + 0.04, 0.07, D + 0.04]} /><meshStandardMaterial color="#8d959a" metalness={0.5} roughness={0.5} /></mesh>
      {/* side-right / side-left are the passenger's right/left facing the main doors from inside (+z). */}
      <Wall side="back" doorStyle={entrance === 'through' ? doorStyle : undefined} {...common} />
      <Wall side="left" doorStyle={entrance === 'side-right' ? doorStyle : undefined} {...common} />
      <Wall side="right" doorStyle={entrance === 'side-left' ? doorStyle : undefined} {...common} />
      {showFront && <Wall side="front" doorStyle={doorStyle} {...common} />}
      <Corners material={trim} />
      {entrance !== 'through' && <Mirror kind={design.mirror} frame={trim} />}
      <Handrail side={design.handrail} material={handrail} />
      <Ceiling ceiling={ceiling} light={lightColor} />
      {showFront && <ControlPanel kind={design.panel} side={design.panelSide} />}
      {view === 'landing' && <Landing doorMaterial={doorMaterial} />}
      <pointLight position={[0, H - 0.25, 0]} color={lightColor} intensity={design.light === 'warm' ? 5.5 : 7} distance={6} decay={1.4} />
    </group>
  );
}

export default function CabinPreview({ design, view, doorsOpen, resetKey }: { design: Design; view: ViewId; doorsOpen: boolean; resetKey: number }) {
  const config = useMemo(() => viewConfig(view, design), [view, design]);
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, preserveDrawingBuffer: false }}
      camera={{ position: config.position, fov: config.fov, near: 0.01, far: 60 }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 0.92; }}
    >
      <color attach="background" args={['#eceeeb']} />
      <hemisphereLight args={['#ffffff', '#d9d4c8', 0.9]} />
      <directionalLight position={[3, 5, 6]} intensity={1.1} />
      <directionalLight position={[-4, 3, -2]} intensity={0.45} />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[0, 1.5, 6]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[-6, 1.5, 0]} rotation={[0, Math.PI / 2, 0]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={0.8} position={[6, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[8, 3, 1]} />
      </Environment>
      <Cabin design={design} view={view} doorsOpen={doorsOpen} />
      <CameraRig config={config} resetKey={resetKey} />
    </Canvas>
  );
}

export function webglAvailable(): boolean {
  try {
    const element = document.createElement('canvas');
    return Boolean(element.getContext('webgl2') || element.getContext('webgl'));
  } catch {
    return false;
  }
}

