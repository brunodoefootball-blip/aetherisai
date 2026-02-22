import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, PerspectiveCamera, Float, MeshDistortMaterial, MeshWobbleMaterial, PerformanceMonitor } from "@react-three/drei";
import { Suspense, useState } from "react";

function AbstractModel({ lowPerf }: { lowPerf: boolean }) {
  return (
    <Float speed={lowPerf ? 1 : 2} rotationIntensity={lowPerf ? 0.5 : 1} floatIntensity={lowPerf ? 0.5 : 1}>
      <mesh castShadow receiveShadow>
        <torusKnotGeometry args={[1, 0.3, lowPerf ? 64 : 128, lowPerf ? 16 : 32]} />
        <MeshDistortMaterial
          color="#00f5ff"
          speed={lowPerf ? 1 : 2}
          distort={0.4}
          radius={1}
          emissive="#00f5ff"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {!lowPerf && (
        <>
          <mesh position={[2, 1, -1]} scale={0.5}>
            <sphereGeometry args={[1, 32, 32]} />
            <MeshWobbleMaterial
              color="#ff0090"
              speed={3}
              factor={0.6}
              emissive="#ff0090"
              emissiveIntensity={0.5}
            />
          </mesh>

          <mesh position={[-2, -1, 1]} scale={0.7}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
              color="#ffd700"
              wireframe
              emissive="#ffd700"
              emissiveIntensity={0.5}
            />
          </mesh>
        </>
      )}
    </Float>
  );
}

export default function ModelViewer() {
  const [dpr, setDpr] = useState(1);
  const [lowPerf, setLowPerf] = useState(false);

  return (
    <div className="w-full h-[400px] bg-surface-darker/50 rounded-sm border border-white/5 relative overflow-hidden group">
      <div className="absolute top-4 left-4 z-10">
        <div className="text-[10px] font-mono text-cyan-neon uppercase tracking-widest">3D Design Engine</div>
        <div className="text-white font-display text-lg uppercase tracking-wider">Visualizador de Modelos</div>
      </div>
      
      <Canvas shadows dpr={dpr}>
        <PerformanceMonitor 
          onIncline={() => setDpr(2)} 
          onDecline={() => {
            setDpr(1);
            setLowPerf(true);
          }} 
        />
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5}>
            <AbstractModel lowPerf={lowPerf} />
          </Stage>
        </Suspense>
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
      </Canvas>

      <div className="absolute bottom-4 right-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
        {lowPerf ? 'Modo Eco Ativo' : 'Arraste para rotacionar'}
      </div>
    </div>
  );
}
