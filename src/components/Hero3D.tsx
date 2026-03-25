'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Line } from '@react-three/drei';
import * as THREE from 'three';

function NeuralNetwork() {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.002;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1;
  });

  const nodes = useMemo(() => {
    const nodesData = [];
    const nodeCount = 30;
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      nodesData.push({
        x: Math.cos(theta) * Math.sin(phi) * 2,
        y: Math.sin(theta) * Math.sin(phi) * 2,
        z: Math.cos(phi) * 2,
        scale: Math.random() * 0.4 + 0.6,
      });
    }
    return nodesData;
  }, []);

  const connections = useMemo(() => {
    const conns: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = Math.sqrt(
          Math.pow(nodes[i].x - nodes[j].x, 2) +
          Math.pow(nodes[i].y - nodes[j].y, 2) +
          Math.pow(nodes[i].z - nodes[j].z, 2)
        );
        if (dist < 1.3) {
          conns.push([i, j]);
        }
      }
    }
    return conns;
  }, [nodes]);

  return (
    <group ref={groupRef}>
      {nodes.map((node, i) => (
        <Float key={i} speed={2} rotationIntensity={0.3} floatIntensity={0.3}>
          <mesh position={[node.x, node.y, node.z]} scale={node.scale}>
            <sphereGeometry args={[0.06, 16, 16]} />
            <meshStandardMaterial
              color="#64ffda"
              emissive="#64ffda"
              emissiveIntensity={0.8}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </Float>
      ))}
      
      {connections.map(([i, j], idx) => (
        <Line
          key={idx}
          points={[
            [nodes[i].x, nodes[i].y, nodes[i].z],
            [nodes[j].x, nodes[j].y, nodes[j].z]
          ]}
          color="#64ffda"
          opacity={0.2}
          transparent
          lineWidth={1}
        />
      ))}
    </group>
  );
}

function FloatingBook() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.003;
    meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15;
  });

  return (
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.3}>
      <group position={[2.5, 0, -1]}>
        <mesh ref={meshRef} scale={0.7}>
          <boxGeometry args={[2, 2.8, 0.15]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0, 0, 0.08]} scale={0.68}>
          <boxGeometry args={[2, 2.8, 0.05]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        {[...Array(6)].map((_, i) => (
          <mesh key={i} position={[0, 0.8 - i * 0.35, 0.12]} scale={0.6}>
            <boxGeometry args={[1.4, 0.06, 0.01]} />
            <meshStandardMaterial color="#64ffda" emissive="#64ffda" emissiveIntensity={0.5} />
          </mesh>
        ))}
      </group>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
        <color attach="background" args={['#0a0a0f']} />
        <fog attach="fog" args={['#0a0a0f', 5, 15]} />
        
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#64ffda" />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#ff6b6b" />
        
        <NeuralNetwork />
        <FloatingBook />
      </Canvas>
      
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent pointer-events-none" />
    </div>
  );
}
