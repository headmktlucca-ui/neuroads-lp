"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Continuous-depth 3D parallax background.
 *
 * A fullscreen quad samples the video texture, displacing each pixel by an
 * amount proportional to its depth (from a precomputed depth map). Near pixels
 * (white in the depth map) move more than far pixels (black) as the user
 * scrolls and moves the mouse — producing a layered 2.5D parallax from a single
 * flat video, without manually slicing it into layers.
 *
 * Generate the depth map with: scripts/depth/generate_depth_map.py
 */

interface DepthParallaxBackgroundProps {
  videoSrc: string;
  depthSrc: string;
  /** Pixels the foreground shifts with the mouse (near plane). */
  mouseStrength?: number;
  /** How much the parallax recedes/shifts as the hero scrolls away. */
  scrollStrength?: number;
  /** Static zoom so displaced sampling never reveals texture edges. */
  zoom?: number;
  className?: string;
}

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    // Fullscreen quad: planeGeometry(2,2) positions are already in clip space.
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uVideo;
  uniform sampler2D uDepth;
  uniform vec2 uMouse;        // smoothed, range ~[-1, 1]
  uniform float uScroll;      // smoothed hero scroll progress [0, 1]
  uniform vec2 uMouseShift;   // px-ish shift, normalized to uv
  uniform float uScrollShift; // vertical shift on scroll
  uniform float uZoom;        // >1 insets sampling to hide edges
  uniform vec2 uCoverScale;   // object-cover correction (video vs canvas aspect)
  uniform vec2 uCoverOffset;

  void main() {
    // Center, apply cover-fit, then static zoom.
    vec2 uv = vUv;
    uv = (uv - 0.5) / uZoom + 0.5;
    uv = uv * uCoverScale + uCoverOffset;

    // Depth: white (1.0) = near, black (0.0) = far.
    float depth = texture2D(uDepth, uv).r;

    // Near pixels shift more. Mouse moves opposite the cursor; scroll pushes up.
    vec2 parallax = vec2(0.0);
    parallax += -uMouse * uMouseShift * depth;
    parallax += vec2(0.0, uScroll * uScrollShift) * (0.4 + depth);

    vec2 sampleUv = uv + parallax;
    vec4 color = texture2D(uVideo, sampleUv);
    gl_FragColor = color;
  }
`;

function ParallaxPlane({
  videoSrc,
  depthSrc,
  mouseStrength,
  scrollStrength,
  zoom,
}: Required<Omit<DepthParallaxBackgroundProps, "className">>) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { size } = useThree();

  // Smoothed interaction state (lerped every frame for 60fps smoothness).
  const state = useRef({
    mouseX: 0,
    mouseY: 0,
    targetX: 0,
    targetY: 0,
    scroll: 0,
    targetScroll: 0,
    reduced: false,
  });

  // Hidden, autoplaying video -> VideoTexture.
  // The element is attached to the DOM (off-screen) because some browsers won't
  // reliably decode frames for a fully detached <video>, leaving a black texture.
  const video = useMemo(() => {
    if (typeof document === "undefined") return null;
    const el = document.createElement("video");
    el.src = videoSrc;
    el.crossOrigin = "anonymous";
    el.loop = true;
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    el.autoplay = true;
    el.setAttribute("muted", "");
    el.setAttribute("playsinline", "");
    el.style.cssText =
      "position:fixed;width:2px;height:2px;opacity:0.01;pointer-events:none;top:0;left:0;z-index:-1;";
    return el;
  }, [videoSrc]);

  useEffect(() => {
    if (!video) return;
    document.body.appendChild(video);
    const tryPlay = () => video.play().catch(() => {});
    tryPlay();
    video.addEventListener("canplay", tryPlay);
    return () => {
      video.removeEventListener("canplay", tryPlay);
      video.pause();
      video.remove();
    };
  }, [video]);

  const videoTexture = useMemo(() => {
    if (!video) return null;
    const tex = new THREE.VideoTexture(video);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    return tex;
  }, [video]);

  const [depthTexture, setDepthTexture] = useState<THREE.Texture | null>(null);
  const [videoAspect, setVideoAspect] = useState(16 / 9);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.load(depthSrc, (tex) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      setDepthTexture(tex);
    });
  }, [depthSrc]);

  useEffect(() => {
    if (!video) return;
    const onMeta = () => {
      if (video.videoWidth && video.videoHeight) {
        setVideoAspect(video.videoWidth / video.videoHeight);
      }
    };
    video.addEventListener("loadedmetadata", onMeta);
    return () => video.removeEventListener("loadedmetadata", onMeta);
  }, [video]);

  // Pointer / scroll / reduced-motion listeners.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    state.current.reduced = mq.matches;
    const onMq = (e: MediaQueryListEvent) => (state.current.reduced = e.matches);
    mq.addEventListener?.("change", onMq);

    const onMove = (e: MouseEvent) => {
      state.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      state.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      // Progress through roughly the first viewport (the hero).
      state.current.targetScroll = Math.min(
        window.scrollY / window.innerHeight,
        1
      );
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    state.current.scroll = state.current.targetScroll;

    return () => {
      mq.removeEventListener?.("change", onMq);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // Cover-fit math (object-cover): scale uv so the video fills the canvas.
  const cover = useMemo(() => {
    const canvasAspect = size.width / size.height;
    let sx = 1;
    let sy = 1;
    if (canvasAspect > videoAspect) {
      sy = videoAspect / canvasAspect; // letterbox vertically -> crop top/bottom
    } else {
      sx = canvasAspect / videoAspect; // pillarbox horizontally -> crop sides
    }
    return {
      scale: new THREE.Vector2(sx, sy),
      offset: new THREE.Vector2((1 - sx) / 2, (1 - sy) / 2),
    };
  }, [size.width, size.height, videoAspect]);

  const uniforms = useMemo(
    () => ({
      uVideo: { value: null as THREE.Texture | null },
      uDepth: { value: null as THREE.Texture | null },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uScroll: { value: 0 },
      uMouseShift: { value: new THREE.Vector2(0, 0) },
      uScrollShift: { value: 0 },
      uZoom: { value: zoom },
      uCoverScale: { value: new THREE.Vector2(1, 1) },
      uCoverOffset: { value: new THREE.Vector2(0, 0) },
    }),
    [zoom]
  );

  useFrame(() => {
    const s = state.current;
    const m = materialRef.current;
    if (!m) return;

    if (s.reduced) {
      s.mouseX = 0;
      s.mouseY = 0;
    } else {
      s.mouseX += (s.targetX - s.mouseX) * 0.07;
      s.mouseY += (s.targetY - s.mouseY) * 0.07;
    }
    s.scroll += (s.targetScroll - s.scroll) * 0.08;

    const u = m.uniforms;
    u.uVideo.value = videoTexture;
    u.uDepth.value = depthTexture;
    (u.uMouse.value as THREE.Vector2).set(s.mouseX, s.mouseY);
    u.uScroll.value = s.scroll;
    // Shift amounts expressed in uv units (fraction of the frame).
    (u.uMouseShift.value as THREE.Vector2).set(
      mouseStrength / 100,
      (mouseStrength * 0.72) / 100
    );
    u.uScrollShift.value = scrollStrength / 100;
    u.uZoom.value = zoom;
    (u.uCoverScale.value as THREE.Vector2).copy(cover.scale);
    (u.uCoverOffset.value as THREE.Vector2).copy(cover.offset);
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function DepthParallaxBackground({
  videoSrc,
  depthSrc,
  mouseStrength = 6,
  scrollStrength = 18,
  zoom = 1.12,
  className = "",
}: DepthParallaxBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#000000] pointer-events-none ${className}`}
    >
      <Canvas
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.75]}
        style={{ width: "100%", height: "100%" }}
      >
        <ParallaxPlane
          videoSrc={videoSrc}
          depthSrc={depthSrc}
          mouseStrength={mouseStrength}
          scrollStrength={scrollStrength}
          zoom={zoom}
        />
      </Canvas>
    </div>
  );
}
