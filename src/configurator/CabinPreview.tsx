import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, MeshReflectorMaterial, OrbitControls } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ceilings, doorFinishes, floors, lights, trims, walls, type Finish } from './catalog';
import type { Design } from './rules';
import { finishCanvas } from './textures';
import { ControlPanel, useRide, type PanelKind, type Ride } from './cabin/ControlPanel';
import { CeilingFixture, Handrail, Mirror, useLightLevel } from './cabin/fixtures';

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
      {!doorStyle && side !== 'front' && [-place.width / 6, place.width / 6].map((u) => (
        <mesh key={`seam${u}`} position={[u, H / 2 - 0.01, 0.0035]}>
          <boxGeometry args={[0.006, H - 0.24, 0.004]} />
          <meshStandardMaterial color="#14171a" roughness={0.8} />
        </mesh>
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
      return { position: [0, 1.25, 6.4], target: [0, 1.15, 0], fov: 40, orbit: { minDistance: 4, maxDistance: 9.5, minAzimuth: -0.5, maxAzimuth: 0.5, minPolar: 1.1, maxPolar: 1.75, zoom: true, rotateSpeed: 0.6 } };
    case 'exterior': {
      const mirror = design.entrance === 'side-left' ? -1 : 1;
      return { position: [3.4 * mirror, 2.3, 4.6], target: [0, 1.15, 0], fov: 38, orbit: { minDistance: 4, maxDistance: 8.5, minAzimuth: -Infinity, maxAzimuth: Infinity, minPolar: 0.6, maxPolar: 1.7, zoom: true, rotateSpeed: 0.6 } };
    }
    case 'ceiling':
      return { position: [0, 0.6, 0.3], target: [0, H, 0], fov: 75, orbit: { minDistance: 1.7, maxDistance: 1.9, minAzimuth: -Infinity, maxAzimuth: Infinity, minPolar: 2.4, maxPolar: Math.PI, zoom: false, rotateSpeed: -0.4 } };
    case 'controls':
      // The glass column carries its keypad higher, at eye level.
      if (design.panel === 'column') return { position: [panelX * 0.5, 1.5, 0.2], target: [panelX, 1.5, D / 2], fov: 52, orbit: { minDistance: 0.45, maxDistance: 1.3, minAzimuth: -Infinity, maxAzimuth: Infinity, minPolar: 0.9, maxPolar: 2.1, zoom: true, rotateSpeed: 0.45 } };
      return { position: [panelX * 0.55, 1.28, 0.25], target: [panelX, 1.22, D / 2], fov: 50, orbit: { minDistance: 0.45, maxDistance: 1.2, minAzimuth: -Infinity, maxAzimuth: Infinity, minPolar: 0.9, maxPolar: 2.1, zoom: true, rotateSpeed: 0.45 } };
    default:
      return { position: [0, 1.25, 5.6], target: [0, 1.15, 0], fov: 40, orbit: { minDistance: 2.6, maxDistance: 9.5, minAzimuth: -1.2, maxAzimuth: 1.2, minPolar: 0.8, maxPolar: 1.85, zoom: true, rotateSpeed: 0.6 } };
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

function RideShake({ ride, children }: { ride: Ride; children: React.ReactNode }) {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!group.current) return;
    const moving = ride.phase === 'moving';
    group.current.position.y = moving && !reducedMotion ? Math.sin(clock.elapsedTime * 38) * 0.0012 : 0;
  });
  return <group ref={group}>{children}</group>;
}

function Cabin({ design, view, doorsOpen, stops, lowPower }: { design: Design; view: ViewId; doorsOpen: boolean; stops: number; lowPower: boolean }) {
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
  const floorMap = (floorMaterial as THREE.MeshStandardMaterial).map;

  const { ride, actions } = useRide(stops);
  // Lights switch on (with a flicker) whenever the ceiling or the colour changes, or the ceiling view opens.
  const level = useLightLevel(`${design.ceiling}|${design.light}|${view === 'ceiling'}`, reducedMotion);
  const lamp = useRef<THREE.PointLight>(null);
  const washes = useRef<(THREE.SpotLight | null)[]>([]);
  const baseIntensity = design.light === 'warm' ? 5.5 : 7;
  useFrame(() => {
    if (lamp.current) lamp.current.intensity = baseIntensity * (0.08 + level.current * 0.92);
    // Spot targets are not in the scene graph, so their matrices are refreshed by hand.
    washes.current.forEach((spot) => { if (spot) { spot.intensity = 6 * level.current; spot.target.updateMatrixWorld(); } });
  });

  const riding = ride.phase === 'closing' || ride.phase === 'moving';
  const effectiveOpen = riding ? false : ride.phase === 'arriving' || ride.doorHold === 'open' ? true : ride.doorHold === 'close' ? false : doorsOpen;

  const entrance = design.entrance;
  const doorStyle = design.door;
  const showFront = view !== 'front';
  const common = { interior, shell, trim, doorMaterial, open: effectiveOpen };
  const panelX = design.panelSide === 'right' ? -0.72 : 0.72;

  return (
    <RideShake ride={ride}>
      {lowPower ? (
        <mesh geometry={floorGeometry} material={floorMaterial} rotation={[-Math.PI / 2, 0, 0]} />
      ) : (
        <mesh geometry={floorGeometry} rotation={[-Math.PI / 2, 0, 0]}>
          <MeshReflectorMaterial
            map={floorMap ?? undefined}
            resolution={512}
            mirror={0.35}
            blur={[280, 90]}
            mixBlur={1}
            mixStrength={0.55}
            roughness={0.32}
            metalness={0}
            depthScale={0}
          />
        </mesh>
      )}
      {showFront && (
        // Door sill: the aluminium threshold under the main doors.
        <mesh position={[0, 0.003, D / 2 - 0.04]}>
          <boxGeometry args={[DW + 0.06, 0.006, 0.08]} />
          <meshStandardMaterial color="#b7bec2" metalness={0.9} roughness={0.35} />
        </mesh>
      )}
      <mesh position={[0, -0.04, 0]}><boxGeometry args={[W + 0.04, 0.07, D + 0.04]} /><meshStandardMaterial color="#8d959a" metalness={0.5} roughness={0.5} /></mesh>
      {/* side-right / side-left are the passenger's right/left facing the main doors from inside (+z). */}
      <Wall side="back" doorStyle={entrance === 'through' ? doorStyle : undefined} {...common} />
      <Wall side="left" doorStyle={entrance === 'side-right' ? doorStyle : undefined} {...common} />
      <Wall side="right" doorStyle={entrance === 'side-left' ? doorStyle : undefined} {...common} />
      {showFront && <Wall side="front" doorStyle={doorStyle} {...common} />}
      <Corners material={trim} />
      {entrance !== 'through' && <Mirror kind={design.mirror} frame={trim} glowColor={lightColor} level={level} lowPower={lowPower} />}
      <Handrail side={design.handrail} style={design.rail ?? 'round'} material={handrail} glowColor={lightColor} level={level} />
      <CeilingFixture ceiling={ceiling} glowColor={lightColor} level={level} trim={trim} />
      {showFront && (
        <ControlPanel kind={(design.panel as PanelKind) ?? 'classic'} x={panelX} stops={stops} ride={ride} actions={actions} trimColor={trimColor} />
      )}
      {view === 'landing' && <Landing doorMaterial={doorMaterial} />}
      <pointLight ref={lamp} position={[0, H - 0.25, 0]} color={lightColor} intensity={0} distance={6} decay={1.4} />
      {/* Downlight washes: soft pools of light on the side walls. */}
      {[-0.55, 0.55].map((x, i) => (
        <spotLight
          key={x}
          ref={(node) => { washes.current[i] = node; }}
          position={[x, H - 0.06, -0.2]}
          angle={0.75}
          penumbra={0.85}
          distance={3.2}
          decay={1.6}
          color={lightColor}
          intensity={0}
          target-position={[x * 1.9, 0.6, -0.2]}
        />
      ))}
    </RideShake>
  );
}

export default function CabinPreview({ design, view, doorsOpen, resetKey, stops = 3 }: { design: Design; view: ViewId; doorsOpen: boolean; resetKey: number; stops?: number }) {
  const config = useMemo(() => viewConfig(view, design), [view, design]);
  // Phones get a lighter scene: no reflective floor, lower-resolution mirror.
  const lowPower = typeof window !== 'undefined' && (window.innerWidth < 761 || (navigator.hardwareConcurrency ?? 8) <= 4);
  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, preserveDrawingBuffer: false }}
      camera={{ position: config.position, fov: config.fov, near: 0.01, far: 60 }}
      onCreated={({ gl }) => { gl.toneMappingExposure = 0.95; }}
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
      <Cabin design={design} view={view} doorsOpen={doorsOpen} stops={stops} lowPower={lowPower} />
      <CameraRig config={config} resetKey={resetKey} />
      {/* Bloom picks up only the LEDs, displays and glowing ceilings (colours pushed above 1). */}
      <EffectComposer multisampling={lowPower ? 0 : 4}>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={1} luminanceSmoothing={0.25} radius={0.7} />
        <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      </EffectComposer>
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

