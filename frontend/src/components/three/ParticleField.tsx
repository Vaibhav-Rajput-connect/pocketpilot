"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function ParticleField({ count = 1500 }) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 10; // z

      phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, phases };
  }, [count]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime;
    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const phasesAttr = pointsRef.current.geometry.attributes.phase;

    for (let i = 0; i < count; i++) {
      let currentZ = positionsAttr.getZ(i);
      currentZ += 0.003; // Slowly move forward
      
      if (currentZ > 5) {
        currentZ = -15; // Reset behind
      }
      positionsAttr.setZ(i, currentZ);
      
      const phase = phasesAttr.getX(i);
      const wave = Math.sin(time * 0.3 + phase) * 0.002;
      positionsAttr.setX(i, positionsAttr.getX(i) + wave);
      positionsAttr.setY(i, positionsAttr.getY(i) + wave);
    }
    positionsAttr.needsUpdate = true;
    
    // Smooth pointer influence
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(
      pointsRef.current.rotation.x,
      state.pointer.y * 0.1,
      0.05
    );
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y,
      state.pointer.x * 0.1,
      0.05
    );
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-phase"
          args={[phases, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#10B981"
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
