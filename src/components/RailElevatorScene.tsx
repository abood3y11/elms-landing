import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function MiniElevator() {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.7) * 0.18;
      group.current.position.y = Math.sin(t * 1.1) * 0.08;
    }
    if (glow.current) {
      glow.current.scale.x = 1 + Math.sin(t * 2.2) * 0.08;
    }
  });

  return (
    <group ref={group} position={[0, -0.05, 0]}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.1, 1.45, 0.5]} />
        <meshStandardMaterial color="#d8edf0" metalness={0.58} roughness={0.22} />
      </mesh>
      <mesh position={[-0.29, -0.02, 0.265]}>
        <boxGeometry args={[0.5, 1.22, 0.035]} />
        <meshStandardMaterial color="#9fb1ba" metalness={0.72} roughness={0.2} />
      </mesh>
      <mesh position={[0.29, -0.02, 0.265]}>
        <boxGeometry args={[0.5, 1.22, 0.035]} />
        <meshStandardMaterial color="#c7d3d8" metalness={0.72} roughness={0.2} />
      </mesh>
      <mesh ref={glow} position={[0, 0.82, 0.29]}>
        <boxGeometry args={[0.74, 0.1, 0.04]} />
        <meshStandardMaterial color="#0f766e" emissive="#0f766e" emissiveIntensity={0.75} />
      </mesh>
      <mesh position={[0, -0.86, 0]}>
        <boxGeometry args={[1.24, 0.08, 0.56]} />
        <meshStandardMaterial color="#102331" metalness={0.35} roughness={0.45} />
      </mesh>
    </group>
  );
}

function MiniShaft() {
  return (
    <group position={[0, 0, -0.08]}>
      {[-0.74, 0.74].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.035, 2.5, 0.035]} />
          <meshStandardMaterial color="#7dd3c7" emissive="#0f766e" emissiveIntensity={0.18} />
        </mesh>
      ))}
      {[-0.9, -0.45, 0, 0.45, 0.9].map((y) => (
        <mesh key={y} position={[0, y, -0.02]}>
          <boxGeometry args={[1.6, 0.025, 0.025]} />
          <meshStandardMaterial color="#34505d" metalness={0.35} roughness={0.4} />
        </mesh>
      ))}
    </group>
  );
}

export default function RailElevatorScene() {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0.05, 3.4], fov: 36 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.75} />
      <directionalLight position={[2.5, 3, 3]} intensity={2.5} />
      <pointLight position={[-1.4, 1.2, 2]} intensity={5} color="#18a69a" />
      <pointLight position={[1.2, -1.1, 2]} intensity={3} color="#d99a24" />
      <MiniShaft />
      <MiniElevator />
    </Canvas>
  );
}
