"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial, Ring } from "@react-three/drei";
import * as THREE from "three";

export function FloatingObjects() {
  const materialProps = {
    thickness: 0.2,
    roughness: 0.1,
    transmission: 1,
    ior: 1.5,
    chromaticAberration: 0.1,
    backside: true,
    transparent: true,
    color: "#10B981",
  };

  return (
    <group position={[0, 0, 0]}>
      {/* Coin / Token */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2} position={[-4, 2, -2]}>
        <mesh rotation={[Math.PI / 3, 0, 0]}>
          <cylinderGeometry args={[0.8, 0.8, 0.1, 32]} />
          <MeshTransmissionMaterial {...materialProps} />
        </mesh>
      </Float>

      {/* Credit Card */}
      <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2} position={[4.5, 1.5, -1]}>
        <mesh rotation={[Math.PI / 4, Math.PI / 6, 0]}>
          <boxGeometry args={[2.5, 1.5, 0.05]} />
          <MeshTransmissionMaterial {...materialProps} />
        </mesh>
      </Float>

      {/* Analytics Graph (Bars) */}
      <Float speed={2.5} rotationIntensity={0.5} floatIntensity={1.5} position={[-5, -2, -3]}>
        <group>
          <mesh position={[-0.5, -0.25, 0]}>
            <boxGeometry args={[0.3, 1, 0.3]} />
            <MeshTransmissionMaterial {...materialProps} />
          </mesh>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.3, 1.5, 0.3]} />
            <MeshTransmissionMaterial {...materialProps} color="#34D399" />
          </mesh>
          <mesh position={[0.5, 0.5, 0]}>
            <boxGeometry args={[0.3, 2.5, 0.3]} />
            <MeshTransmissionMaterial {...materialProps} color="#059669" />
          </mesh>
        </group>
      </Float>

      {/* Shield (Cone) */}
      <Float speed={1.8} rotationIntensity={2} floatIntensity={1.8} position={[4, -2.5, -2]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.8, 1.5, 4]} />
          <MeshTransmissionMaterial {...materialProps} />
        </mesh>
      </Float>

      {/* Abstract Rupee/Currency Symbol */}
      <Float speed={2} rotationIntensity={2} floatIntensity={2} position={[0, 3.5, -4]}>
        <mesh>
          <torusGeometry args={[0.6, 0.15, 16, 32]} />
          <MeshTransmissionMaterial {...materialProps} color="#A7F3D0" />
        </mesh>
      </Float>
    </group>
  );
}
