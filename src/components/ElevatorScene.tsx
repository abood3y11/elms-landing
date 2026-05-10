import { Float, OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function ElevatorCabin() {
  const cabin = useRef<THREE.Group>(null);
  const doors = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (cabin.current) {
      cabin.current.position.y = Math.sin(t * 0.9) * 0.55;
      cabin.current.rotation.y = Math.sin(t * 0.28) * 0.08;
    }
    if (doors.current) {
      doors.current.scale.x = 1 + Math.sin(t * 1.4) * 0.035;
    }
  });

  return (
    <group ref={cabin}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1.85, 2.35, 1.05]} />
        <meshStandardMaterial color="#dfe8eb" metalness={0.45} roughness={0.24} />
      </mesh>
      <group ref={doors} position={[0, 0, 0.535]}>
        <mesh position={[-0.47, -0.03, 0]}>
          <boxGeometry args={[0.86, 2.08, 0.035]} />
          <meshStandardMaterial color="#9fb1ba" metalness={0.7} roughness={0.22} />
        </mesh>
        <mesh position={[0.47, -0.03, 0]}>
          <boxGeometry args={[0.86, 2.08, 0.035]} />
          <meshStandardMaterial color="#b8c7cd" metalness={0.7} roughness={0.22} />
        </mesh>
      </group>
      <mesh position={[0, 1.35, 0.57]}>
        <boxGeometry args={[1.08, 0.2, 0.05]} />
        <meshStandardMaterial color="#0f766e" emissive="#0f766e" emissiveIntensity={0.35} />
      </mesh>
      <Text position={[0, 1.35, 0.61]} fontSize={0.16} color="#ffffff" anchorX="center" anchorY="middle">
        HENS LINE
      </Text>
    </group>
  );
}

function Shaft() {
  return (
    <group>
      {[-1.35, 1.35].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.08, 5.2, 0.08]} />
          <meshStandardMaterial color="#34505d" metalness={0.5} roughness={0.3} />
        </mesh>
      ))}
      {[-2, -1, 0, 1, 2].map((y) => (
        <mesh key={y} position={[0, y, -0.08]}>
          <boxGeometry args={[3.1, 0.035, 0.08]} />
          <meshStandardMaterial color="#57717d" metalness={0.35} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 0, -0.18]}>
        <boxGeometry args={[3.25, 5.5, 0.035]} />
        <meshStandardMaterial color="#102331" roughness={0.65} />
      </mesh>
    </group>
  );
}

function Particles() {
  const group = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (group.current) {
      group.current.rotation.y = clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <group ref={group}>
      {Array.from({ length: 34 }).map((_, index) => {
        const angle = index * 0.68;
        const radius = 2.1 + (index % 5) * 0.16;
        const y = -2.2 + (index % 11) * 0.43;
        return (
          <mesh key={index} position={[Math.cos(angle) * radius, y, Math.sin(angle) * radius - 0.35]}>
            <sphereGeometry args={[0.018, 12, 12]} />
            <meshStandardMaterial color={index % 3 === 0 ? '#d99a24' : '#7dd3c7'} emissive="#0f766e" emissiveIntensity={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function ElevatorScene() {
  return (
    <Canvas dpr={[1, 1.8]} shadows>
      <PerspectiveCamera makeDefault position={[0, 0.65, 6.4]} fov={38} />
      <color attach="background" args={['#102331']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 4]} intensity={2.5} castShadow />
      <pointLight position={[-2.6, 1.7, 3]} intensity={8} color="#18a69a" />
      <pointLight position={[2.5, -1.5, 2.2]} intensity={5} color="#d99a24" />
      <Float speed={1.3} rotationIntensity={0.16} floatIntensity={0.25}>
        <Shaft />
        <ElevatorCabin />
      </Float>
      <Particles />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.45} maxPolarAngle={Math.PI / 1.65} minPolarAngle={Math.PI / 2.8} />
    </Canvas>
  );
}
