import { Canvas, useFrame } from '@react-three/fiber';
import { animate, createTimeline, stagger } from 'animejs';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const metrics = [
  ['30+', 'سنة خبرة'],
  ['24/7', 'دعم فني'],
  ['AMC', 'عقود صيانة'],
  ['قطع', 'غيار متوفرة'],
];

function AnimeCabin() {
  const group = useRef<THREE.Group>(null);
  const glow = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    if (group.current) {
      const scrollOffset = typeof window !== 'undefined' ? window.scrollY * 0.0012 : 0;
      group.current.position.y = Math.sin(t * 0.72) * 0.28 + Math.sin(scrollOffset) * 0.45;
      group.current.rotation.y = Math.sin(t * 0.24) * 0.12 + pointer.x * 0.18;
      group.current.rotation.x = pointer.y * -0.08;
    }
    if (glow.current) {
      const material = glow.current.material as THREE.MeshStandardMaterial;
      material.emissiveIntensity = 0.28 + Math.sin(t * 2.2) * 0.12;
    }
  });

  return (
    <group ref={group}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.45, 2.05, 0.8]} />
        <meshStandardMaterial color="#d8edf0" metalness={0.58} roughness={0.24} />
      </mesh>
      <mesh position={[0, 0, 0.42]}>
        <boxGeometry args={[1.12, 1.72, 0.035]} />
        <meshStandardMaterial color="#9fb1ba" metalness={0.7} roughness={0.24} />
      </mesh>
      <mesh ref={glow} position={[0, 1.24, 0.46]}>
        <boxGeometry args={[0.8, 0.12, 0.04]} />
        <meshStandardMaterial color="#139884" emissive="#139884" emissiveIntensity={0.35} />
      </mesh>
      {[-1.05, 1.05].map((x) => (
        <mesh key={x} position={[x, 0, -0.08]}>
          <boxGeometry args={[0.05, 3.4, 0.05]} />
          <meshStandardMaterial color="#139884" metalness={0.4} roughness={0.35} />
        </mesh>
      ))}
    </group>
  );
}

function AnimeModelScene() {
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0.55, 5.2], fov: 38 }} shadows>
      <color attach="background" args={['#102331']} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 4]} intensity={2.2} castShadow />
      <pointLight position={[-2, 1.5, 2]} intensity={5} color="#d99a24" />
      <AnimeCabin />
    </Canvas>
  );
}

export default function AnimeElevatorShowcase() {
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    const root = rootRef.current;
    const orbit = root.querySelector('.anime-orbit');
    const signals = root.querySelectorAll('.anime-signal');
    const timeline = createTimeline({
      defaults: { duration: 850, ease: 'outCubic' },
      loop: true,
      loopDelay: 900,
    });

    timeline
      .add(root.querySelectorAll('.anime-kicker, .anime-copy h2, .anime-copy p'), {
        opacity: [0, 1],
        translateX: [48, 0],
        delay: stagger(120),
      })
      .add(root.querySelectorAll('.anime-metric'), {
        opacity: [0, 1],
        translateY: [24, 0],
        scale: [0.92, 1],
        delay: stagger(90),
      }, '-=420')
    if (orbit) {
      timeline.add(orbit, {
        rotate: '360deg',
        duration: 2800,
        ease: 'inOutSine',
      }, '-=500');
    }

    if (signals.length) {
      timeline.add(signals, {
        opacity: [0.25, 1, 0.25],
        scaleX: [0.55, 1, 0.55],
        delay: stagger(120),
      }, '-=2100');
    }

    const pulse = animate(root.querySelectorAll('.anime-dot'), {
      scale: [0.7, 1.25, 0.7],
      opacity: [0.35, 1, 0.35],
      delay: stagger(160),
      duration: 1400,
      loop: true,
      ease: 'inOutSine',
    });

    return () => {
      timeline.revert();
      pulse.revert();
    };
  }, []);

  return (
    <section ref={rootRef} className="anime-showcase">
      <div className="anime-copy">
        <span className="anime-kicker">خدمة متكاملة للمصاعد</span>
        <h2>من المعاينة إلى الصيانة، كل خطوة واضحة ومنظمة.</h2>
        <p>
          نتابع احتياج العميل من أول زيارة فنية، ثم نحدد الحل المناسب للتركيب أو الصيانة أو التحديث أو قطع الغيار،
          مع تقارير واضحة وخدمة ما بعد البيع.
        </p>
        <div className="anime-metrics">
          {metrics.map(([value, label]) => (
            <article className="anime-metric" key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
        </div>
      </div>
      <div className="anime-stage">
        <div className="anime-model">
          <AnimeModelScene />
        </div>
        <div className="parallax-layer layer-one">تركيب</div>
        <div className="parallax-layer layer-two">صيانة</div>
        <div className="parallax-layer layer-three">قطع غيار</div>
        <div className="anime-orbit" />
        <span className="anime-dot dot-one" />
        <span className="anime-dot dot-two" />
        <span className="anime-dot dot-three" />
        <span className="anime-signal signal-one" />
        <span className="anime-signal signal-two" />
        <span className="anime-signal signal-three" />
      </div>
    </section>
  );
}
