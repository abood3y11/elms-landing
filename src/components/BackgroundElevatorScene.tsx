import { Canvas, useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';

function ShaderWall() {
  const material = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color('#0f766e') },
      uColorB: { value: new THREE.Color('#102331') },
    }),
    []
  );

  useFrame(({ clock }) => {
    if (material.current) {
      material.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, 0, -2.2]} scale={[8.5, 5.2, 1]}>
      <planeGeometry args={[1, 1, 80, 80]} />
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`
          varying vec2 vUv;
          uniform float uTime;
          void main() {
            vUv = uv;
            vec3 p = position;
            p.z += sin((p.x + uTime * 0.18) * 8.0) * 0.018;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `}
        fragmentShader={`
          varying vec2 vUv;
          uniform float uTime;
          uniform vec3 uColorA;
          uniform vec3 uColorB;
          float line(float value, float width) {
            return smoothstep(width, 0.0, abs(fract(value) - 0.5));
          }
          void main() {
            float vertical = line(vUv.x * 9.0, 0.018);
            float floors = line((vUv.y + uTime * 0.025) * 7.0, 0.012);
            float glow = smoothstep(0.75, 0.2, distance(vUv, vec2(0.52, 0.48)));
            vec3 color = mix(uColorB, uColorA, glow * 0.45 + vertical * 0.18 + floors * 0.12);
            float alpha = 0.18 + glow * 0.2 + vertical * 0.06 + floors * 0.05;
            gl_FragColor = vec4(color, alpha);
          }
        `}
      />
    </mesh>
  );
}

function BackgroundCabin() {
  const group = useRef<THREE.Group>(null);
  const scrollProgress = useRef(0);

  useEffect(() => {
    const updateScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress.current = window.scrollY / maxScroll;
    };

    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      const scrollY = THREE.MathUtils.lerp(1.85, -1.85, scrollProgress.current);
      group.current.position.y = scrollY + Math.sin(t * 0.35) * 0.18;
      group.current.rotation.y = Math.sin(t * 0.18) * 0.12;
    }
  });

  return (
    <group ref={group} position={[2.55, -0.2, -0.85]} rotation={[0, -0.28, 0]}>
      <mesh>
        <boxGeometry args={[0.8, 1.25, 0.52]} />
        <meshStandardMaterial color="#d8edf0" metalness={0.55} roughness={0.28} transparent opacity={0.22} />
      </mesh>
      <mesh position={[0, 0, 0.27]}>
        <boxGeometry args={[0.62, 1.02, 0.025]} />
        <meshStandardMaterial color="#0f766e" emissive="#0f766e" emissiveIntensity={0.28} transparent opacity={0.26} />
      </mesh>
    </group>
  );
}

function Rails() {
  const group = useRef<THREE.Group>(null);
  const scrollProgress = useRef(0);

  useEffect(() => {
    const updateScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress.current = window.scrollY / maxScroll;
    };
    updateScroll();
    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateScroll);
    return () => {
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateScroll);
    };
  }, []);

  useFrame(() => {
    if (group.current) {
      group.current.position.y = THREE.MathUtils.lerp(0.35, -0.35, scrollProgress.current);
    }
  });

  return (
    <group ref={group} position={[2.55, -0.2, -1.05]} rotation={[0, -0.28, 0]}>
      {[-0.55, 0.55].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <boxGeometry args={[0.035, 5.8, 0.035]} />
          <meshStandardMaterial color="#139884" transparent opacity={0.2} />
        </mesh>
      ))}
      {[-2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[1.35, 0.025, 0.025]} />
          <meshStandardMaterial color="#102331" transparent opacity={0.18} />
        </mesh>
      ))}
    </group>
  );
}

export default function BackgroundElevatorScene() {
  return (
    <Canvas dpr={[1, 1.4]} camera={{ position: [0, 0, 5.8], fov: 42 }} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <pointLight position={[-2.5, 1.5, 2]} intensity={3} color="#d99a24" />
      <ShaderWall />
      <Rails />
      <BackgroundCabin />
    </Canvas>
  );
}
