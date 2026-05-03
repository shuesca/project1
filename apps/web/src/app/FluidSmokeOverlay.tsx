import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type Props = {
  active: boolean;
  /** Total seconds: slow fill → dense hover → slow clear. */
  durationSec?: number;
};

const SMOKE_VERTEX = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.x, position.y, 0.0, 1.0);
}
`;

const SMOKE_FRAGMENT = `
precision highp float;
uniform float uElapsed;
uniform float uDuration;
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
  float D = max(uDuration, 0.001);
  float tn = clamp(t / D, 0.0, 1.0);

  vec2 drift = vec2(t * 0.38, -t * 0.31);
  float n0 = fbm(p * 2.4 + drift);
  float n1 = fbm(p * 5.8 - drift * 1.05 + t * 0.12);
  float n2 = fbm(p * 12.5 + drift * 0.6);
  float n3 = noise(p * 38.0 + drift * 2.5) * 0.12;
  float fog = n0 * 0.52 + n1 * 0.34 + n2 * 0.18 + n3;

  float sheet = smoothstep(0.08, 0.97, fog + 0.08 * sin(t * 1.6 + length(p) * 3.5));

  float rise = smoothstep(0.0, 0.4, tn);
  /* Single smooth clear curve — plateau must not cut out early or the page
     flashes through before the fog visually lifts. */
  float clear = 1.0 - smoothstep(0.74, 0.99, tn);
  float envelope = rise * clear;

  float plateau = smoothstep(0.24, 0.5, tn) * (1.0 - smoothstep(0.72, 0.9, tn));
  float floorAlpha = plateau * 0.97;

  float a = max(sheet * envelope, floorAlpha);
  a = min(a, 0.998);

  vec3 deep = vec3(0.42, 0.48, 0.54);
  vec3 rim = vec3(0.78, 0.84, 0.9);
  vec3 col = mix(deep, rim, pow(fog, 0.75));

  gl_FragColor = vec4(col, a);
}
`;

/** Full-screen WebGL fog — no black matte; dense smoke occludes, then clears. */
export function FluidSmokeOverlay({ active, durationSec = 5.1 }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active || !mountRef.current) return;

    const container = mountRef.current;
    const w = window.innerWidth;
    const h = window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const uniforms = {
      uElapsed: { value: 0 },
      uDuration: { value: durationSec },
      uResolution: { value: new THREE.Vector2(w, h) },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: SMOKE_VERTEX,
      fragmentShader: SMOKE_FRAGMENT,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 10);
    camera.position.z = 1;

    const t0 = performance.now();
    let raf = 0;

    const onResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      renderer.setSize(nw, nh);
      uniforms.uResolution.value.set(nw, nh);
    };
    window.addEventListener('resize', onResize);

    const maxT = durationSec + 0.1;
    const tick = (now: number) => {
      const elapsed = (now - t0) * 0.001;
      uniforms.uElapsed.value = elapsed;
      renderer.render(scene, camera);
      if (elapsed < maxT) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(canvas)) container.removeChild(canvas);
    };
  }, [active, durationSec]);

  if (!active) return null;

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 z-[9998] pointer-events-none"
      aria-hidden
    />
  );
}
