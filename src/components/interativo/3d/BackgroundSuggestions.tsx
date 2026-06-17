"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type BackgroundSuggestionsProps = {
  activeOption: number; // 1, 2, or 3
  parallaxIntensity: number; // 0 to 2
  particleDensity: number; // 0.2 to 2.0
  glowIntensity: number; // 0.5 to 3.0
  reducedMotion: boolean;
};

// Deterministic noise for stable point layout
function pseudoRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// ---------------------------------------------------------
// Background 1: Constelação Sináptica (Synaptic Constellation)
// ---------------------------------------------------------
function SynapticConstellation({
  particleDensity,
  glowIntensity,
  reducedMotion,
}: {
  particleDensity: number;
  glowIntensity: number;
  reducedMotion: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.LineSegments>(null);

  // Define particle count based on density
  const nodeCount = Math.floor(110 * particleDensity);

  // Generate initial node positions and velocities
  const nodes = useMemo(() => {
    const list = [];
    for (let i = 0; i < nodeCount; i++) {
      const rx = (pseudoRandom(i * 12 + 1) - 0.5) * 18;
      const ry = (pseudoRandom(i * 37 + 5) - 0.5) * 12;
      const rz = (pseudoRandom(i * 59 + 9) - 0.5) * 8;
      list.push({
        pos: new THREE.Vector3(rx, ry, rz),
        basePos: new THREE.Vector3(rx, ry, rz),
        vel: new THREE.Vector3(
          (pseudoRandom(i * 7 + 3) - 0.5) * 0.012,
          (pseudoRandom(i * 13 + 8) - 0.5) * 0.012,
          (pseudoRandom(i * 29 + 1) - 0.5) * 0.012
        ),
        seed: pseudoRandom(i * 3),
      });
    }
    return list;
  }, [nodeCount]);

  // Stable static arrays passed only to geometry props (never mutated in render body)
  const nodePositionsArray = useMemo(() => new Float32Array(nodeCount * 3), [nodeCount]);
  const linePositionsArray = useMemo(() => new Float32Array(300 * 2 * 3), []);
  const lineColorsArray = useMemo(() => new Float32Array(300 * 2 * 3), []);

  useFrame((state) => {
    if (!pointsRef.current || !linesRef.current) return;

    const time = state.clock.getElapsedTime();
    const { pointer } = state;

    // Projected mouse position in 3D scene space
    const targetMouse = new THREE.Vector3(pointer.x * 8, pointer.y * 5, 0);

    // Retrieve active arrays directly from Three.js attributes for mutation inside loop
    const pointsAttr = pointsRef.current.geometry.attributes.position;
    const nodePositionsBuffer = pointsAttr.array as Float32Array;

    // Update node positions
    nodes.forEach((node, idx) => {
      if (!reducedMotion) {
        // Natural drift
        node.pos.add(node.vel);

        // Keep near base position
        const distToBase = node.pos.distanceTo(node.basePos);
        if (distToBase > 2.0) {
          node.pos.lerp(node.basePos, 0.02);
        }

        // Mouse attraction/repulsion force
        const distToMouse = node.pos.distanceTo(targetMouse);
        if (distToMouse < 3.5) {
          // Attract nodes slightly
          const force = (3.5 - distToMouse) * 0.008;
          const dir = new THREE.Vector3().subVectors(targetMouse, node.pos).normalize();
          node.pos.addScaledVector(dir, force);
        }
      }

      const idx3 = idx * 3;
      nodePositionsBuffer[idx3] = node.pos.x;
      nodePositionsBuffer[idx3 + 1] = node.pos.y;
      nodePositionsBuffer[idx3 + 2] = node.pos.z;
    });

    pointsAttr.needsUpdate = true;

    // Build connections dynamically
    const linePosAttr = linesRef.current.geometry.attributes.position;
    const lineColorAttr = linesRef.current.geometry.attributes.color;
    
    const linePositionsBuffer = linePosAttr.array as Float32Array;
    const lineColorsBuffer = lineColorAttr.array as Float32Array;

    let lineIdx = 0;
    const maxLines = 300;
    const connectionDist = 3.2;

    for (let i = 0; i < nodeCount && lineIdx < maxLines; i++) {
      for (let j = i + 1; j < nodeCount && lineIdx < maxLines; j++) {
        const nodeA = nodes[i];
        const nodeB = nodes[j];
        const d = nodeA.pos.distanceTo(nodeB.pos);

        if (d < connectionDist) {
          const lIdx = lineIdx * 6;
          // Segment start (Node A)
          linePositionsBuffer[lIdx] = nodeA.pos.x;
          linePositionsBuffer[lIdx + 1] = nodeA.pos.y;
          linePositionsBuffer[lIdx + 2] = nodeA.pos.z;

          // Segment end (Node B)
          linePositionsBuffer[lIdx + 3] = nodeB.pos.x;
          linePositionsBuffer[lIdx + 4] = nodeB.pos.y;
          linePositionsBuffer[lIdx + 5] = nodeB.pos.z;

          // Calculate connection brightness based on proximity and mouse position
          const midPoint = new THREE.Vector3().addVectors(nodeA.pos, nodeB.pos).multiplyScalar(0.5);
          const distToMouse = midPoint.distanceTo(targetMouse);

          // Glow factor increases near the mouse
          const mouseGlow = distToMouse < 3.0 ? (3.0 - distToMouse) * 0.45 * glowIntensity : 0;
          const baseAlpha = (1.0 - d / connectionDist) * 0.22 * glowIntensity;
          const alpha = Math.min(0.9, baseAlpha + mouseGlow);

          // Neon orange (#ff6a00) and cyan (#00f0ff) mix based on position
          const mixColor = Math.sin(midPoint.x * 0.2 + time * 0.1) * 0.5 + 0.5;
          const r = THREE.MathUtils.lerp(0.0, 1.0, mixColor);
          const g = THREE.MathUtils.lerp(0.8, 0.41, mixColor);
          const b = THREE.MathUtils.lerp(1.0, 0.0, mixColor); // Cyan vs Orange

          // Apply color to line points
          const intensity = alpha;
          lineColorsBuffer[lIdx] = r * intensity;
          lineColorsBuffer[lIdx + 1] = g * intensity;
          lineColorsBuffer[lIdx + 2] = b * intensity;

          lineColorsBuffer[lIdx + 3] = r * intensity;
          lineColorsBuffer[lIdx + 4] = g * intensity;
          lineColorsBuffer[lIdx + 5] = b * intensity;

          lineIdx++;
        }
      }
    }

    // Reset remaining segments in buffers
    for (let i = lineIdx; i < maxLines; i++) {
      const lIdx = i * 6;
      for (let k = 0; k < 6; k++) {
        linePositionsBuffer[lIdx + k] = 0;
        lineColorsBuffer[lIdx + k] = 0;
      }
    }

    linePosAttr.needsUpdate = true;
    lineColorAttr.needsUpdate = true;
  });

  return (
    <>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[nodePositionsArray, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color="#ff7f30"
          size={0.068}
          sizeAttenuation
          transparent
          opacity={0.78 * glowIntensity}
          depthWrite={false}
        />
      </points>

      <lineSegments ref={linesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositionsArray, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColorsArray, 3]} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors linewidth={1.5} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
    </>
  );
}

// ---------------------------------------------------------
// Background 2: Fluxo de Pulsos Neurais (Action Potential Flow)
// ---------------------------------------------------------
function ActionPotentialFlow({
  particleDensity,
  glowIntensity,
  reducedMotion,
}: {
  particleDensity: number;
  glowIntensity: number;
  reducedMotion: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const pathCount = Math.floor(18 * particleDensity);

  // Create random path curves
  const curves = useMemo(() => {
    const list = [];
    for (let i = 0; i < pathCount; i++) {
      const points = [];
      const segmentCount = 5;
      const startX = -12 + pseudoRandom(i * 4) * 4;
      const endX = 12 - pseudoRandom(i * 9) * 4;
      const yOffset = (pseudoRandom(i * 15) - 0.5) * 6;

      for (let j = 0; j < segmentCount; j++) {
        const t = j / (segmentCount - 1);
        const x = THREE.MathUtils.lerp(startX, endX, t);
        const wave = Math.sin(t * Math.PI) * (2.5 + pseudoRandom(i * 22) * 2.5);
        const y = yOffset + (pseudoRandom(i * 8 + j) - 0.5) * 2.5 + wave * (pseudoRandom(i) > 0.5 ? 1 : -1);
        const z = (pseudoRandom(i * 3 + j) - 0.5) * 5;
        points.push(new THREE.Vector3(x, y, z));
      }
      list.push(new THREE.CatmullRomCurve3(points));
    }
    return list;
  }, [pathCount]);

  // Create pulses travelling on each curve
  const pulses = useMemo(() => {
    return curves.map((curve, idx) => ({
      curve,
      progress: pseudoRandom(idx * 44),
      speed: 0.005 + pseudoRandom(idx * 11) * 0.012,
      scale: 0.08 + pseudoRandom(idx * 7) * 0.09,
      color: pseudoRandom(idx * 3) > 0.5 ? "#ff5e00" : "#00d5ff",
    }));
  }, [curves]);

  const pulseRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const { pointer } = state;

    // React to mouse movement
    const targetMouse = new THREE.Vector3(pointer.x * 6, pointer.y * 4, 0);

    pulses.forEach((pulse, idx) => {
      const mesh = pulseRefs.current[idx];
      if (!mesh) return;

      if (!reducedMotion) {
        // Accelerate pulses close to the mouse
        const currentPos = mesh.position;
        const dist = currentPos.distanceTo(targetMouse);
        const boost = dist < 3.0 ? (3.0 - dist) * 1.5 : 0;
        
        pulse.progress += pulse.speed * (1 + boost);
        if (pulse.progress > 1.0) pulse.progress = 0.0;
      }

      // Compute position on curve
      const p = pulse.curve.getPointAt(pulse.progress);

      // Mouse local gravitational deflection
      const distToMouse = p.distanceTo(targetMouse);
      if (distToMouse < 2.5 && !reducedMotion) {
        const pull = (2.5 - distToMouse) * 0.16;
        const dir = new THREE.Vector3().subVectors(targetMouse, p).normalize();
        p.addScaledVector(dir, pull);
      }

      mesh.position.copy(p);

      // Pulsing scale
      const pulseScale = pulse.scale * (1.0 + Math.sin(time * 8 + idx) * 0.25);
      mesh.scale.setScalar(pulseScale);
    });

    if (groupRef.current && !reducedMotion) {
      groupRef.current.rotation.z = time * 0.015;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Draw paths as faint grid lines */}
      {curves.map((curve, idx) => {
        const curvePoints = curve.getPoints(45);
        return (
          <line key={idx}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array(curvePoints.flatMap((p) => [p.x, p.y, p.z])), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial
              color={idx % 2 === 0 ? "#ff5e00" : "#005577"}
              transparent
              opacity={0.08 * glowIntensity}
              linewidth={1}
            />
          </line>
        );
      })}

      {/* Render pulses */}
      {pulses.map((pulse, idx) => (
        <mesh
          key={idx}
          ref={(el) => {
            if (el) pulseRefs.current[idx] = el;
          }}
        >
          <sphereGeometry args={[1, 12, 12]} />
          <meshBasicMaterial
            color={pulse.color}
            transparent
            opacity={0.88 * glowIntensity}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------
// Background 3: Malha Holográfica Cognitiva (Cognitive Mesh)
// ---------------------------------------------------------
function CognitiveMesh({
  particleDensity,
  glowIntensity,
  reducedMotion,
}: {
  particleDensity: number;
  glowIntensity: number;
  reducedMotion: boolean;
}) {
  const pointsRef = useRef<THREE.Points>(null);

  // Mesh dimension
  const gridWidth = 32;
  const gridHeight = 32;
  const totalPoints = gridWidth * gridHeight;

  // Stable static arrays passed only to geometry props (never mutated in render body)
  const positionsArray = useMemo(() => new Float32Array(totalPoints * 3), [totalPoints]);
  const colorsArray = useMemo(() => new Float32Array(totalPoints * 3), [totalPoints]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.getElapsedTime();
    const { pointer } = state;

    // Projected mouse target
    const mx = pointer.x * 12;
    const my = pointer.y * 8;

    const posAttr = pointsRef.current.geometry.attributes.position;
    const colorAttr = pointsRef.current.geometry.attributes.color;

    const positions = posAttr.array as Float32Array;
    const colors = colorAttr.array as Float32Array;

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        const idx = y * gridWidth + x;
        const idx3 = idx * 3;

        // Position on 2D grid plane
        const xp = ((x / (gridWidth - 1)) - 0.5) * 18;
        const yp = ((y / (gridHeight - 1)) - 0.5) * 12;

        // Standard wave motion in loop
        let zp = 0;
        if (!reducedMotion) {
          zp += Math.sin(xp * 0.45 + time * 0.7) * 0.4;
          zp += Math.cos(yp * 0.38 + time * 0.5) * 0.3;
        }

        // Ripple from mouse position
        const dx = xp - mx;
        const dy = yp - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 4.5 && !reducedMotion) {
          const rippleFactor = (4.5 - dist) / 4.5;
          zp += Math.sin(dist * 2.8 - time * 4.0) * 0.68 * rippleFactor;
        }

        positions[idx3] = xp;
        positions[idx3 + 1] = yp;
        positions[idx3 + 2] = zp;

        // Dynamically compute color based on height/proximity
        const rippleIntensity = dist < 4.0 ? (4.0 - dist) / 4.0 : 0.0;
        const glowFactor = Math.min(1.0, (zp + 0.7) / 1.4 + rippleIntensity * 0.4);

        // Gradient: Vibrant Neon Cyan -> Bright Blue -> Electric Orange
        let r = 0.05, g = 0.48, b = 0.78; // Base vibrant cyan-blue
        if (glowFactor > 0.4) {
          const t = (glowFactor - 0.4) / 0.6;
          r = THREE.MathUtils.lerp(0.05, 0.0, t);
          g = THREE.MathUtils.lerp(0.48, 0.92, t);
          b = THREE.MathUtils.lerp(0.78, 1.0, t);
        }
        if (glowFactor > 0.7) {
          const t = (glowFactor - 0.7) / 0.3;
          r = THREE.MathUtils.lerp(0.0, 1.0, t);
          g = THREE.MathUtils.lerp(0.92, 0.52, t);
          b = THREE.MathUtils.lerp(1.0, 0.0, t);
        }

        const tint = glowIntensity;
        colors[idx3] = r * tint;
        colors[idx3 + 1] = g * tint;
        colors[idx3 + 2] = b * tint;
      }
    }

    posAttr.needsUpdate = true;
    colorAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positionsArray, 3]} />
        <bufferAttribute attach="attributes-color" args={[colorsArray, 3]} />
      </bufferGeometry>
      <pointsMaterial
        vertexColors
        size={0.082} // Increased constant size for high visibility
        sizeAttenuation
        transparent
        opacity={0.86}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ---------------------------------------------------------
// Camera Parallax and Scene Orchestrator
// ---------------------------------------------------------
function CameraParallaxOrchestrator({
  activeOption,
  parallaxIntensity,
  particleDensity,
  glowIntensity,
  reducedMotion,
}: BackgroundSuggestionsProps) {
  useFrame((state) => {
    if (reducedMotion) return;
    
    const { pointer } = state;
    // Smoothed transition (lerp) for 3D camera tilt
    const targetX = pointer.x * 2.2 * parallaxIntensity;
    const targetY = pointer.y * 1.6 * parallaxIntensity;

    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.06);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.06);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <>
      <ambientLight intensity={0.65} />
      <pointLight position={[0, 4, 3]} intensity={1.5} color="#ff8e3a" />
      <pointLight position={[5, -3, 2]} intensity={0.8} color="#00ddff" />

      {activeOption === 1 && (
        <SynapticConstellation
          particleDensity={particleDensity}
          glowIntensity={glowIntensity}
          reducedMotion={reducedMotion}
        />
      )}

      {activeOption === 2 && (
        <ActionPotentialFlow
          particleDensity={particleDensity}
          glowIntensity={glowIntensity}
          reducedMotion={reducedMotion}
        />
      )}

      {activeOption === 3 && (
        <CognitiveMesh
          particleDensity={particleDensity}
          glowIntensity={glowIntensity}
          reducedMotion={reducedMotion}
        />
      )}
    </>
  );
}

// ---------------------------------------------------------
// Main Canvas Wrapper Component
// ---------------------------------------------------------
export function BackgroundSuggestionsCanvas(props: BackgroundSuggestionsProps) {
  return (
    <div className="w-full h-full relative overflow-hidden bg-[#06060c]">
      {/* Background dark organic gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(13,10,32,0.65),rgba(6,6,12,1))]" />
      
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 7.8], fov: 45 }}
        performance={{ min: 0.5 }}
        style={{ pointerEvents: "auto" }} // Allow interaction
      >
        <CameraParallaxOrchestrator {...props} />
      </Canvas>
    </div>
  );
}
