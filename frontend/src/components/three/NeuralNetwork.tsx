"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function NeuralNetwork({ nodeCount = 80 }) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  const { positions, linePositions, opacities, phases } = useMemo(() => {
    const points = [];
    for (let i = 0; i < nodeCount; i++) {
      points.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 15,
          (Math.random() - 0.5) * 5 - 2
        )
      );
    }

    const linePositions = [];
    const positions = new Float32Array(nodeCount * 3);
    const opacities = new Float32Array(nodeCount);
    const phases = new Float32Array(nodeCount);

    for (let i = 0; i < nodeCount; i++) {
      positions[i * 3] = points[i].x;
      positions[i * 3 + 1] = points[i].y;
      positions[i * 3 + 2] = points[i].z;
      opacities[i] = Math.random();
      phases[i] = Math.random() * Math.PI * 2;

      // Connect close nodes
      for (let j = i + 1; j < nodeCount; j++) {
        const distance = points[i].distanceTo(points[j]);
        if (distance < 3) {
          linePositions.push(
            points[i].x, points[i].y, points[i].z,
            points[j].x, points[j].y, points[j].z
          );
        }
      }
    }

    return { 
      positions, 
      linePositions: new Float32Array(linePositions),
      opacities,
      phases
    };
  }, [nodeCount]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (pointsRef.current) {
      const opacitiesAttr = pointsRef.current.geometry.attributes.opacity;
      const phasesAttr = pointsRef.current.geometry.attributes.phase;
      
      for (let i = 0; i < nodeCount; i++) {
        // Pulse effect
        const phase = phasesAttr.getX(i);
        const pulse = (Math.sin(time * 2 + phase) + 1) * 0.5;
        opacitiesAttr.setX(i, pulse * 0.8 + 0.2);
      }
      opacitiesAttr.needsUpdate = true;
      
      pointsRef.current.rotation.y = time * 0.02;
    }
    
    if (linesRef.current) {
      linesRef.current.rotation.y = time * 0.02;
    }
  });

  return (
    <group position={[0, 0, -5]}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-opacity"
            count={opacities.length}
            array={opacities}
            itemSize={1}
          />
          <bufferAttribute
            attach="attributes-phase"
            count={phases.length}
            array={phases}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#10B981"
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      
      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#047857"
          transparent
          opacity={0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}
