"use client";

import { Canvas } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { ParticleField } from "./ParticleField";
import { NeuralNetwork } from "./NeuralNetwork";
import { FloatingObjects } from "./FloatingObjects";
import { EnergyRing } from "./EnergyRing";
import { DataStreams } from "./DataStreams";
import { Suspense, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function HeroScene() {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (prefersReducedMotion) {
    return null; // Minimal fallback
  }

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <Environment preset="city" />
          
          <ParticleField count={isMobile ? 200 : 800} />
          <NeuralNetwork nodeCount={isMobile ? 20 : 40} />
          
          {!isMobile && (
            <>
              <FloatingObjects />
              <EnergyRing />
              <DataStreams count={10} />
            </>
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}
