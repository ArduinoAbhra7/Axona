import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';

interface FluidPostProcessingProps {
  quality: 'high' | 'medium' | 'low';
}

// Simplex-FBM Liquid Smoke Fragment Shader
const FluidVelocityShader = {
  uniforms: {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0.5, 0.5) },
    uVelocity: { value: 0.0 },
    uResolution: { value: new THREE.Vector2(800, 600) }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec2 uPointer;
    uniform float uVelocity;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // Simplex 2D noise helper utilities
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439,
               -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx) ;
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0) )
      + i.x + vec3(0.0, i1.x, 1.0) );
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
        dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0 ;
      vec3 h = abs(x) - 0.5 ;
      vec3 a0 = x - floor(x + 0.5) ;
      vec3 norm = 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      p.x = a0.x * x0.x + h.x * x0.y;
      p.y = a0.y * x12.x + h.y * x12.y;
      p.z = a0.z * x12.z + h.z * x12.w;
      return 130.0 * dot(m * norm, p);
    }

    // Fractional Brownian Motion for fluid complexity
    float fbm(vec2 uv) {
      float value = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 2; i++) {
        value += amplitude * snoise(uv);
        uv *= 2.0;
        amplitude *= 0.5;
      }
      return value;
    }

    void main() {
      // Fix UV aspect ratio based on rendering width/height
      vec2 uv = gl_FragCoord.xy / uResolution.xy;
      
      // Calculate normalized vector distance to cursor
      float dist = distance(uv, uPointer);
      
      // Calculate warp vector centered around mouse coordinate velocity
      float warp = exp(-dist * 4.0) * uVelocity;
      vec2 warpedUv = uv + vec2(warp * 0.08, warp * 0.04);
      
      // Fluid smoke pattern generator
      float n1 = fbm(warpedUv * 2.5 - vec2(0.0, uTime * 0.15));
      float n2 = fbm(warpedUv * 5.0 + vec2(uTime * 0.1, n1 * 1.2));
      
      // Theme colors matching Axona glass interfaces
      vec3 darkBackground = vec3(0.0, 0.07, 0.07); // Dark teal
      vec3 fluidGlowColor = vec3(0.0, 0.15, 0.14) * (n2 * 0.6 + 0.4); // Deep aquamarine glow
      vec3 compositeColor = mix(darkBackground, fluidGlowColor, n2 * 0.5 + 0.5);
      
      // Add a high-intensity glow ripple where velocity splits the background field
      float rippleIntensity = smoothstep(0.35, 0.0, dist) * uVelocity * 0.25;
      compositeColor += vec3(0.1, 0.25, 0.23) * rippleIntensity;
      
      gl_FragColor = vec4(compositeColor, 1.0);
    }
  `
};

export const FluidVelocityShaderQuad: React.FC = () => {
  const { size } = useThree();
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  const prevPointer = useRef(new THREE.Vector2(0, 0));
  const velocityRef = useRef(0.0);

  // Core uniform parameters
  const uniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: 0.0 },
      uResolution: { value: new THREE.Vector2(size.width, size.height) }
    };
  }, []);

  // Update resolution dynamically when resizing viewport
  React.useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size]);

  useFrame((state, delta) => {
    if (!materialRef.current) return;

    // Calculate displacement offset to determine speed
    const dx = state.pointer.x - prevPointer.current.x;
    const dy = state.pointer.y - prevPointer.current.y;
    const displacement = Math.sqrt(dx * dx + dy * dy);

    // Filter time spikes (capped to avoid WebGL jump coordinates)
    const instantVelocity = Math.min(displacement / Math.max(delta, 0.008), 8.0);

    // LERP instant velocity down gently to keep momentum fluid
    velocityRef.current = THREE.MathUtils.lerp(velocityRef.current, instantVelocity, 0.05);

    prevPointer.current.copy(state.pointer);

    // Set dynamic uniforms
    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
    materialRef.current.uniforms.uPointer.value.set(
      (state.pointer.x + 1) / 2,
      (state.pointer.y + 1) / 2
    );
    materialRef.current.uniforms.uVelocity.value = velocityRef.current;
  });

  return (
    <mesh position={[0, 0, -10]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={FluidVelocityShader.vertexShader}
        fragmentShader={FluidVelocityShader.fragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
};

export const FluidPostProcessing: React.FC<FluidPostProcessingProps> = ({ quality }) => {
  const chromaticOffsetRef = useRef<THREE.Vector2>(new THREE.Vector2(0.0015, 0.0015));
  const prevPointer = useRef(new THREE.Vector2(0, 0));

  useFrame((state, delta) => {
    // Warp the chromatic aberration vector based on dynamic mouse gesture speeds
    const dx = state.pointer.x - prevPointer.current.x;
    const dy = state.pointer.y - prevPointer.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy) / Math.max(delta, 0.008);
    
    prevPointer.current.copy(state.pointer);

    const baseOffset = 0.0012;
    const targetWarp = baseOffset + Math.min(speed * 0.0005, 0.003);

    // Damp chromatic aberration for smooth organic edge splits
    chromaticOffsetRef.current.x = THREE.MathUtils.lerp(chromaticOffsetRef.current.x, targetWarp, 0.1);
    chromaticOffsetRef.current.y = THREE.MathUtils.lerp(chromaticOffsetRef.current.y, targetWarp, 0.1);
  });

  // Scale down post-processing effects on low-quality/low-end systems to protect frame rates
  if (quality === 'low') {
    return <FluidVelocityShaderQuad />;
  }

  const renderHeight = quality === 'high' ? 320 : 240;

  return (
    <>
      {/* Background Liquid Field */}
      <FluidVelocityShaderQuad />

      {/* Cinematic Post-Processing Chain */}
      <EffectComposer disableNormalPass multisampling={0}>
        {/* Soft, premium glowing highlights on neon toruses */}
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.8}
          intensity={1.2}
          height={renderHeight}
        />
        {/* Fine, cinematic grain to textures */}
        <Noise
          opacity={0.022}
          premultiply
        />
      </EffectComposer>
    </>
  );
};

export default FluidPostProcessing;
