"use client";

import { Float } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type NeuralCanvasProps = {
  reducedMotion: boolean;
};

function deterministicNoise(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function NeuralField({ reducedMotion }: { reducedMotion: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color("#ff6a00") },
      uColorB: { value: new THREE.Color("#121212") },
    }),
    []
  );

  const positions = useMemo(() => {
    const count = reducedMotion ? 280 : 620;
    const values = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const i3 = i * 3;

      const nx = deterministicNoise(i + 1);
      const ny = deterministicNoise(i + 17);
      const nz = deterministicNoise(i + 53);

      values[i3] = (nx - 0.5) * 16;
      values[i3 + 1] = (ny - 0.5) * 11;
      values[i3 + 2] = (nz - 0.5) * 9;
    }

    return values;
  }, [reducedMotion]);

  useFrame(({ clock }) => {
    const elapsed = clock.getElapsedTime();

    if (!reducedMotion && shaderRef.current) {
      shaderRef.current.uniforms.uTime.value = elapsed;
    }

    if (meshRef.current) {
      meshRef.current.rotation.z = elapsed * 0.045;
    }

    if (pointsRef.current && !reducedMotion) {
      pointsRef.current.rotation.y = elapsed * 0.05;
      pointsRef.current.rotation.x = elapsed * 0.025;
    }
  });

  return (
    <>
      <mesh ref={meshRef} position={[0, 0, -2]}>
        <planeGeometry args={[18, 12, 64, 64]} />
        <shaderMaterial
          ref={shaderRef}
          uniforms={uniforms}
          vertexShader={`
            varying vec2 vUv;
            uniform float uTime;

            void main() {
              vUv = uv;
              vec3 pos = position;
              pos.z += sin((pos.x * 1.9) + uTime * 0.35) * 0.22;
              pos.z += cos((pos.y * 2.3) + uTime * 0.28) * 0.18;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 uColorA;
            uniform vec3 uColorB;

            void main() {
              vec2 uv = vUv;
              float wave = sin(uv.x * 12.0 + uTime * 0.45) * 0.08;
              float glow = smoothstep(0.05, 0.85, 1.0 - distance(uv, vec2(0.5, 0.45 + wave)));
              vec3 base = mix(uColorB, uColorA, uv.y + wave);
              vec3 color = mix(base, uColorA, glow * 0.42);
              gl_FragColor = vec4(color, 0.55);
            }
          `}
          transparent
          depthWrite={false}
        />
      </mesh>

      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#ff8c00"
          size={0.034}
          opacity={0.46}
          transparent
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      <Float speed={1.3} rotationIntensity={1.2} floatIntensity={0.8}>
        <mesh>
          <torusKnotGeometry args={[1.2, 0.2, 160, 24]} />
          <meshStandardMaterial
            color="#ff6a00"
            emissive="#ff8c00"
            emissiveIntensity={2.2}
            roughness={0.18}
            metalness={0.88}
          />
        </mesh>
      </Float>

      <Float speed={1.1} rotationIntensity={0.9} floatIntensity={0.55}>
        <mesh scale={0.58}>
          <octahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffb15e"
            emissiveIntensity={1.4}
            roughness={0.08}
            metalness={0.92}
            wireframe
          />
        </mesh>
      </Float>
    </>
  );
}

export function NeuralCanvas({ reducedMotion }: NeuralCanvasProps) {
  return (
    <Canvas
      dpr={[1, 1.7]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, 5.6], fov: 48 }}
      performance={{ min: 0.5 }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[2.5, 3.2, 1.4]} intensity={1.1} color="#ff8c00" />
      <pointLight position={[-2.3, -1.5, 2]} intensity={0.7} color="#ffffff" />
      <NeuralField reducedMotion={reducedMotion} />
    </Canvas>
  );
}
