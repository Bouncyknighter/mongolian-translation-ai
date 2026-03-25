'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

const FLOATING_ELEMENTS = [
  { text: 'А', position: [-4, 2, -5] as [number, number, number], color: '#6366f1' },
  { text: 'Б', position: [4, -1, -4] as [number, number, number], color: '#8b5cf6' },
  { text: 'В', position: [-2, 3, -6] as [number, number, number], color: '#06b6d4' },
  { text: 'Г', position: [3, 2, -5] as [number, number, number], color: '#6366f1' },
  { text: 'Д', position: [-3, -2, -4] as [number, number, number], color: '#8b5cf6' },
  { text: 'Е', position: [5, 0, -6] as [number, number, number], color: '#06b6d4' },
  { text: 'Ж', position: [-5, 1, -5] as [number, number, number], color: '#6366f1' },
  { text: 'З', position: [2, -3, -7] as [number, number, number], color: '#8b5cf6' },
  { text: 'И', position: [-1, 4, -5] as [number, number, number], color: '#06b6d4' },
  { text: 'К', position: [0, -4, -6] as [number, number, number], color: '#6366f1' },
  { text: 'Л', position: [-4, -3, -5] as [number, number, number], color: '#8b5cf6' },
  { text: 'М', position: [4, 3, -6] as [number, number, number], color: '#06b6d4' },
  { text: 'Н', position: [-2, 1, -8] as [number, number, number], color: '#6366f1' },
  { text: 'О', position: [1, -2, -5] as [number, number, number], color: '#8b5cf6' },
  { text: 'Ө', position: [-3, 0, -7] as [number, number, number], color: '#06b6d4' },
];

function DNAHelix() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.15) * 0.05;
    }
  });

  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 80; i++) {
      const t = i / 80;
      const angle = t * Math.PI * 6;
      const x = Math.cos(angle) * 1.2;
      const y = t * 10 - 5;
      const z = Math.sin(angle) * 1.2;
      pts.push(new THREE.Vector3(x, y, z));
    }
    return pts;
  }, []);

  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  const geometry2 = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(
      points.map(p => new THREE.Vector3(-p.x, p.y, -p.z))
    );
  }, [points]);

  return (
    <group ref={groupRef}>
      <line geometry={geometry}>
        <lineBasicMaterial color="#8b5cf6" transparent opacity={0.5} />
      </line>
      <line geometry={geometry2}>
        <lineBasicMaterial color="#06b6d4" transparent opacity={0.5} />
      </line>
    </group>
  );
}

function ParticleField() {
  const particlesRef = useRef<THREE.Points>(null);
  const count = 800;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    return pos;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.01;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#6366f1" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function FloatingSphere({ position, color }: { position: [number, number, number]; color: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const initialY = position[1];

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
      meshRef.current.position.y = initialY + Math.sin(state.clock.elapsedTime * 0.3 + position[0]) * 0.3;
    }
  });

  return (
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
          wireframe
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#6366f1" />
      <pointLight position={[-10, -10, -10]} intensity={0.4} color="#06b6d4" />
      <pointLight position={[0, 10, 0]} intensity={0.6} color="#8b5cf6" />
      
      <Stars radius={80} depth={50} count={2000} factor={3} saturation={0} fade speed={0.5} />
      
      <ParticleField />
      <DNAHelix />
      
      {FLOATING_ELEMENTS.map((item, i) => (
        <FloatingSphere key={i} position={item.position} color={item.color} />
      ))}
    </>
  );
}

export default function SceneWrapper() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
