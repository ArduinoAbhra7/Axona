import React, { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';

interface HoverState {
  hovered: boolean;
}

// 1. Central Refractive Glass Geometry (Apple Vision Pro-style)
export const PremiumFocusAnchor: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const targetScale = hovered ? 1.2 : 1.0;
  const currentScale = useRef(1.0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    const time = state.clock.getElapsedTime();

    // Constant slow aesthetic orbital rotation
    meshRef.current.rotation.y = time * 0.15;
    meshRef.current.rotation.x = Math.sin(time * 0.1) * 0.2;
    meshRef.current.rotation.z = Math.cos(time * 0.08) * 0.1;

    // Smooth LERP scaling on hover
    currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale, 0.1);
    meshRef.current.scale.setScalar(currentScale.current);

    // Dynamic floating translation
    meshRef.current.position.y = Math.sin(time * 0.8) * 0.15;
  });

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      position={[-2.5, 0, 0]} // Positions to center-left aligned with reference brain box
    >
      <torusKnotGeometry args={[1.1, 0.35, 64, 12, 2, 3]} />
      {/* Ultra-realistic translucent refractive physical glass material */}
      <meshPhysicalMaterial
        color="#2DD4BF" // Aquamarine-Teal base highlight
        transmission={0.9} // Glass opacity/translucent index
        thickness={1.5} // Refraction depth
        roughness={0.1}
        clearcoat={1.0}
        clearcoatRoughness={0.05}
        ior={1.5} // Index of Refraction (standard crown glass)
        envMapIntensity={1.5}
        attenuationColor="#38BDF8" // Soft sky blue attenuation shift
        attenuationDistance={0.5}
      />
    </mesh>
  );
};

// 2. Interactive 3D Glass Stats Panels with Parallax Tilt & Drei HTML Wrapper
interface GlassPanelProps {
  position: [number, number, number];
  width: number;
  height: number;
  children: React.ReactNode;
}

export const FrostedGlassStatPanel: React.FC<GlassPanelProps> = ({ position, width, height, children }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    // Clamp the tilt to a maximum of 2-3 degrees (0.04 - 0.05 radians)
    const targetRotX = state.pointer.y * 0.04;
    const targetRotY = state.pointer.x * 0.04;
    
    easing.dampE(groupRef.current.rotation, [targetRotX, targetRotY, 0], 0.2, delta);
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 3D Glass Plate Mesh */}
      <mesh>
        <boxGeometry args={[width, height, 0.05]} />
        <meshPhysicalMaterial
          color="#00312f" // Aquamarine dark base
          transmission={0.7}
          roughness={0.15}
          thickness={0.8}
          ior={1.4}
          clearcoat={0.8}
        />
      </mesh>

      {/* Thin glowing neon edge border */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial
          color="#2DD4BF"
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Layer our HTML metrics inside WebGL coordinate space */}
      <Html
        transform
        distanceFactor={6}
        position={[0, 0, 0.04]}
        style={{
          width: `${width * 100}px`,
          height: `${height * 100}px`,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          padding: '20px',
          color: 'white',
          background: 'transparent',
          fontFamily: "'Inter', sans-serif",
          pointerEvents: 'auto',
        }}>
          {children}
        </div>
      </Html>
    </group>
  );
};

// 3. Ambient & Studio Lighting Rig
export const StudioLighting: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      
      {/* High transmission edge reflection lights */}
      <directionalLight
        position={[10, 10, 10]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-10, -10, -10]}
        intensity={0.8}
        color="#2DD4BF" // Soft Teal fill
      />
      
      {/* Colored point lights to project blue/teal hues onto physical glass clearcoat */}
      <pointLight position={[5, 5, 2]} intensity={1.2} color="#38BDF8" />
      <pointLight position={[-5, -5, 2]} intensity={1.0} color="#06B6D4" />
    </>
  );
};
