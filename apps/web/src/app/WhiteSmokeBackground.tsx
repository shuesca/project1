import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.x, position.y, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
uniform float uElapsed;
uniform vec2 uResolution;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p *= 2.1;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv - 0.5;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  p.x *= aspect;

  float t = uElapsed;
  vec2 drift = vec2(t * 0.2, -t * 0.17);
  float n0 = fbm(p * 2.15 + drift);
  float n1 = fbm(p * 5.4 - drift * 0.95 + t * 0.07);
  float n2 = fbm(p * 10.8 + drift * 0.5);
  float n3 = noise(p * 36.0 + drift * 2.2) * 0.11;
  float fog = n0 * 0.5 + n1 * 0.34 + n2 * 0.16 + n3;

  float wisp =
    smoothstep(0.32, 0.78, fog) * 0.48 + fog * 0.22;

  vec3 paper = vec3(0.99, 0.991, 0.994);
  vec3 mist = vec3(0.68, 0.74, 0.82);
  vec3 col = mix(paper, mist, clamp(wisp, 0.0, 0.5));

  float vig = 1.0 - dot(p, p) * 0.1;
  col *= vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

/** Full-viewport looping smoke on an off-white field (no route transition timing). */
export function WhiteSmokeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0xf7f8fa, 1);
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const uniforms = {
      uElapsed: { value: 0 },
      uResolution: { value: new THREE.Vector2(w, h) },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      depthWrite: false,
      depthTest: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    camera.position.z = 1;

    const t0 = performance.now();
    let raf = 0;

    const resize = () => {
      const nw = container.clientWidth || window.innerWidth;
      const nh = container.clientHeight || window.innerHeight;
      renderer.setSize(nw, nh);
      uniforms.uResolution.value.set(nw, nh);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    window.addEventListener('resize', resize);

    const tick = (now: number) => {
      uniforms.uElapsed.value = (now - t0) * 0.001;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', resize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(canvas)) container.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 min-h-full w-full bg-[#f7f8fa]"
      aria-hidden
    />
  );
}
