import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, Float, Grid, PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 2000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cyan = new THREE.Color("#00f5ff");
    const magenta = new THREE.Color("#ff0090");

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
      
      const mixColor = Math.random() > 0.5 ? cyan : magenta;
      col[i * 3] = mixColor.r;
      col[i * 3 + 1] = mixColor.g;
      col[i * 3 + 2] = mixColor.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 30;
    }
  });

  return (
    <Points ref={ref} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.05}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.4}
      />
    </Points>
  );
}

function NeonTorus() {
  const ref = useRef<THREE.Mesh>(null!);
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x += delta * 0.2;
      ref.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={ref}>
        <torusGeometry args={[10, 3, 16, 100]} />
        <meshBasicMaterial 
          color="#00f5ff" 
          wireframe 
          transparent 
          opacity={0.05} 
        />
      </mesh>
    </Float>
  );
}

export default function ThreeBackground() {
  const [dpr, setDpr] = useState(1);
  const [lowPerf, setLowPerf] = useState(false);

  return (
    <div className="fixed inset-0 -z-10 bg-surface-darker">
      <Canvas 
        dpr={dpr}
        camera={{ position: [0, 0, 30], fov: 75 }}
        gl={{ 
          antialias: !lowPerf,
          powerPreference: "high-performance",
          alpha: false,
          stencil: false,
          depth: true
        }}
      >
        <PerformanceMonitor 
          onIncline={() => setDpr(2)} 
          onDecline={() => {
            setDpr(1);
            setLowPerf(true);
          }} 
        />
        
        <ambientLight intensity={0.5} />
        <ParticleField count={lowPerf ? 800 : 2000} />
        {!lowPerf && <NeonTorus />}
        
        <Grid 
          infiniteGrid 
          fadeDistance={50} 
          fadeStrength={5} 
          sectionColor="#00f5ff" 
          sectionSize={10} 
          sectionThickness={1}
          cellColor="#00f5ff"
          cellSize={2}
          cellThickness={0.5}
          position={[0, -20, 0]}
        />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-surface-darker/20 to-surface-darker" />
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      
      {/* Performance HUD (Debug) */}
      <div className="absolute bottom-4 left-4 text-[8px] font-mono text-zinc-700 uppercase tracking-widest pointer-events-none">
        Aetheris Engine: {lowPerf ? 'Eco Mode' : 'Performance Mode'} | DPR: {dpr}
      </div>
    </div>
  );
}
