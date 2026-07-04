"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function DataStreams({ count = 15 }) {
  const linesRef = useRef<THREE.Group>(null);

  const streams = useMemo(() => {
    return Array.from({ length: count }).map(() => ({
      y: (Math.random() - 0.5) * 15,
      z: (Math.random() - 0.5) * 10 - 5,
      speed: Math.random() * 0.05 + 0.02,
      length: Math.random() * 5 + 2,
      offset: Math.random() * 100,
      opacity: Math.random() * 0.5 + 0.1,
    }));
  }, [count]);

  const geometry = useMemo(() => {
    // A single line segment from -0.5 to 0.5 on X axis
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array([-0.5, 0, 0, 0.5, 0, 0]);
    geo.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
    return geo;
  }, []);

  useFrame((state) => {
    if (!linesRef.current) return;
    const time = state.clock.elapsedTime;

    linesRef.current.children.forEach((child, i) => {
      const stream = streams[i];
      // Move left to right
      let x = ((time * stream.speed * 10 + stream.offset) % 40) - 20;
      child.position.set(x, stream.y, stream.z);
      child.scale.setX(stream.length);
    });
  });

  return (
    <group ref={linesRef}>
      {streams.map((stream, i) => (
        <line key={i} geometry={geometry}>
          <lineBasicMaterial 
            color="#14B8A6" 
            transparent 
            opacity={stream.opacity} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false}
          />
        </line>
      ))}
    </group>
  );
}
