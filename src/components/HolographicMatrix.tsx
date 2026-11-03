import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { easing } from 'maath';

interface HolographicMatrixProps {
  quality: 'high' | 'medium' | 'low';
}

// Custom holographic scanline and edge glow shader
const HolographicShader = {
  uniforms: {
    time: { value: 0 },
    glowColor: { value: new THREE.Color('#2DD4BF') }, // Aquamarine-Teal
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      vViewPosition = -mvPosition.xyz;
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 glowColor;
    uniform float time;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    varying vec2 vUv;
    
    void main() {
      vec3 normal = normalize(vNormal);
      vec3 viewDir = normalize(vViewPosition);
      
      // Fresnel effect for glowing edge contour lines
      float fresnel = pow(1.0 - max(dot(normal, viewDir), 0.0), 3.0);
      
      // Moving neon scanlines running vertically
      float scanline = sin(vUv.y * 60.0 - time * 5.0) * 0.5 + 0.5;
      
      // Edge and scanline composite intensity
      float intensity = fresnel * 0.7 + scanline * 0.3;
      
      gl_FragColor = vec4(glowColor, intensity * 0.5);
    }
  `
};

// High-performance pointer particle trail system
const MouseTrail: React.FC = () => {
  const { camera } = useThree();
  const pointsRef = useRef<THREE.Points>(null);
  
  const MAX_PARTICLES = 30;
  
  // Local ring buffer to track particle lifetimes and coordinates
  const trail = useMemo(() => {
    const buffer = new Float32Array(MAX_PARTICLES * 3);
    const particles = Array.from({ length: MAX_PARTICLES }, () => ({
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.2 + 0.1, // Drifts upward
        (Math.random() - 0.5) * 0.2
      ),
      age: 0,
      active: false
    }));
    return { buffer, particles, writeIndex: 0 };
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    // Project mouse coordinates into 3D world space at z = 0
    const mouseVector = new THREE.Vector3(state.pointer.x, state.pointer.y, 0.5).unproject(camera);
    const dir = mouseVector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const worldPos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    // Spawn a new particle when mouse moves
    const current = trail.particles[trail.writeIndex];
    current.position.copy(worldPos);
    current.age = 0;
    current.active = true;
    current.velocity.set(
      (Math.random() - 0.5) * 0.1,
      (Math.random() - 0.5) * 0.1 + 0.2,
      (Math.random() - 0.5) * 0.1
    );
    
    trail.writeIndex = (trail.writeIndex + 1) % MAX_PARTICLES;

    // Update lifetimes and write positions into WebGL render buffers
    const array = trail.buffer;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = trail.particles[i];
      if (p.active) {
        p.position.add(p.velocity);
        p.age += 1.0;
        
        if (p.age > 45.0) {
          p.active = false;
        }
        
        const idx = i * 3;
        array[idx] = p.position.x;
        array[idx + 1] = p.position.y;
        array[idx + 2] = p.position.z;
      } else {
        // Place inactive particles far behind the camera
        const idx = i * 3;
        array[idx] = 999;
        array[idx + 1] = 999;
        array[idx + 2] = 999;
      }
    }
    
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[trail.buffer, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#2DD4BF" // Aquamarine-Teal
        size={0.15}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
};

export const HolographicMatrix: React.FC<HolographicMatrixProps> = ({ quality }) => {
  const groupRef = useRef<THREE.Group>(null);
  const outerSphereRef = useRef<THREE.Mesh>(null);
  const torusRef1 = useRef<THREE.Mesh>(null);
  const torusRef2 = useRef<THREE.Mesh>(null);

  // Shader references to animate unified system time
  const materialProps = useMemo(() => {
    return {
      material1: new THREE.ShaderMaterial({
        ...HolographicShader,
        uniforms: {
          time: { value: 0 },
          glowColor: { value: new THREE.Color('#2DD4BF') } // Aquamarine-Teal
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      }),
      material2: new THREE.ShaderMaterial({
        ...HolographicShader,
        uniforms: {
          time: { value: 0 },
          glowColor: { value: new THREE.Color('#38BDF8') } // Sky Blue
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      })
    };
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    
    // Update uniform timelines
    materialProps.material1.uniforms.time.value = time;
    materialProps.material2.uniforms.time.value = time;

    // Smooth lerp group rotation based on pointer coordinates
    if (groupRef.current) {
      easing.dampE(
        groupRef.current.rotation,
        [state.pointer.y * 0.25, state.pointer.x * 0.25, 0],
        0.25,
        delta
      );
    }

    // Outer grid structure slow orbital rotate
    if (outerSphereRef.current) {
      outerSphereRef.current.rotation.y = time * 0.04;
      outerSphereRef.current.rotation.x = time * 0.02;
    }

    // Interactive spin rates for center nuclear rings
    if (torusRef1.current) {
      torusRef1.current.rotation.z = time * 0.3;
      torusRef1.current.rotation.y = time * 0.1;
    }
    if (torusRef2.current) {
      torusRef2.current.rotation.z = -time * 0.4;
      torusRef2.current.rotation.x = time * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      {/* 3D Parallax Mouse Trails */}
      {quality !== 'low' && <MouseTrail />}

      {/* Holographic Wireframe Backdrop Grid (Global Layer) */}
      <mesh ref={outerSphereRef}>
        <sphereGeometry args={[7, 12, 12]} />
        <meshBasicMaterial
          color="#003d3a"
          wireframe
          transparent
          opacity={quality === 'high' ? 0.15 : 0.08}
        />
      </mesh>

      {/* Holographic Reactor Centerpiece */}
      <group position={[0, 0, 0]}>
        {/* Core Spinning Torus 1 (Royal Indigo glow) */}
        <mesh ref={torusRef1} material={materialProps.material1}>
          <torusGeometry args={[1.5, 0.08, 12, 32]} />
        </mesh>

        {/* Core Spinning Torus 2 (Vibrant Rose glow) */}
        <mesh ref={torusRef2} material={materialProps.material2}>
          <torusGeometry args={[1.2, 0.05, 12, 32]} />
        </mesh>

        {/* Center Glowing Nucleus Node */}
        <mesh>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshBasicMaterial
            color="#06B6D4"
            transparent
            opacity={0.3}
          />
        </mesh>
      </group>
    </group>
  );
};

export default HolographicMatrix;
