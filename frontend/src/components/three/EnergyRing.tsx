"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function EnergyRing() {
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.2;
      ringRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
      ringRef.current.rotation.y = Math.cos(time * 0.5) * 0.1;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = -time * 0.1;
      outerRingRef.current.rotation.x = Math.sin(time * 0.3 + Math.PI) * 0.1;
      outerRingRef.current.rotation.y = Math.cos(time * 0.3 + Math.PI) * 0.1;
    }
  });

  return (
    <group position={[0, 0, -6]}>
      {/* Inner fast ring */}
      <mesh ref={ringRef}>
        <torusGeometry args={[6, 0.02, 16, 100]} />
        <meshBasicMaterial 
          color="#10B981" 
          transparent 
          opacity={0.3} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>
      
      {/* Outer slow ring */}
      <mesh ref={outerRingRef}>
        <torusGeometry args={[6.5, 0.01, 16, 100]} />
        <meshBasicMaterial 
          color="#34D399" 
          transparent 
          opacity={0.15} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>

      {/* Subtle background glow */}
      <mesh>
        <circleGeometry args={[5, 32]} />
        <meshBasicMaterial 
          color="#059669" 
          transparent 
          opacity={0.02} 
          blending={THREE.AdditiveBlending} 
        />
      </mesh>
    </group>
  );
}
