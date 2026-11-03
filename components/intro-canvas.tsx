"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Wheel() {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.z += delta * 0.22;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.35) * 0.14;
    group.current.rotation.y = -0.42 + Math.sin(state.clock.elapsedTime * 0.28) * 0.1;
  });

  return (
    <group ref={group} rotation={[0, -0.42, 0]}>
      <mesh>
        <torusGeometry args={[1.62, 0.36, 48, 160]} />
        <meshStandardMaterial color="#171b21" metalness={0.98} roughness={0.24} />
      </mesh>
      <mesh>
        <torusGeometry args={[1.62, 0.37, 24, 160]} />
        <meshStandardMaterial
          color="#ffd500"
          emissive="#ffd500"
          emissiveIntensity={0.35}
          metalness={0.6}
          roughness={0.3}
          wireframe
        />
      </mesh>
      <mesh>
        <torusGeometry args={[1.14, 0.035, 16, 140]} />
        <meshStandardMaterial
          color="#b7f000"
          emissive="#b7f000"
          emissiveIntensity={1.6}
          roughness={0.4}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.3, 48]} />
        <meshStandardMaterial color="#23282f" metalness={0.9} roughness={0.35} />
      </mesh>
      {Array.from({ length: 10 }).map((_, index) => (
        <mesh
          key={index}
          rotation={[0, 0, (index / 10) * Math.PI * 2]}
          position={[0, 0, 0]}
        >
          <boxGeometry args={[1.18, 0.035, 0.06]} />
          <meshStandardMaterial
            color={index % 2 === 0 ? "#ffd500" : "#8b949d"}
            emissive={index % 2 === 0 ? "#ffd500" : "#000000"}
            emissiveIntensity={0.25}
            metalness={0.85}
            roughness={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

function Dust() {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const array = new Float32Array(1400 * 3);
    for (let index = 0; index < 1400; index += 1) {
      const radius = 2.4 + Math.random() * 5.5;
      const angle = Math.random() * Math.PI * 2;
      array[index * 3] = Math.cos(angle) * radius;
      array[index * 3 + 1] = (Math.random() - 0.5) * 7;
      array[index * 3 + 2] = Math.sin(angle) * radius - 2;
    }
    return array;
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        color="#d9ff8a"
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function Rig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    state.camera.position.x = Math.sin(t * 0.22) * 0.55;
    state.camera.position.y = 0.25 + Math.sin(t * 0.3) * 0.16;
    state.camera.position.z = 6.4 - Math.min(t * 0.22, 0.9);
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function IntroCanvas() {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      dpr={[1, 1.6]}
      camera={{ position: [0, 0, 6.6], fov: 42 }}
      className="!absolute inset-0"
      aria-hidden
    >
      <color attach="background" args={["#080a0d"]} />
      <fog attach="fog" args={["#080a0d", 7, 14]} />
      <ambientLight intensity={0.22} />
      <directionalLight position={[0, 3, 4]} intensity={1.1} color="#ffffff" />
      <pointLight position={[3.4, 1.6, 2.4]} intensity={70} color="#ffd500" distance={12} />
      <pointLight position={[-3.6, -1.4, 1.8]} intensity={48} color="#b7f000" distance={12} />
      <Wheel />
      <Dust />
      <Rig />
    </Canvas>
  );
}
