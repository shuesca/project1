"use client";

import React, { useRef, useEffect, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useLaunchTransition } from "./LaunchTransitionProvider";
import { mediaUrl } from "@/app/media";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import {
  ArrowRight,
  Layers,
  Globe,
  Cpu,
  Cloud,
} from "lucide-react";

/* ─────────────────────────── small UI atoms ─────────────────────────── */

const SoftPill = ({ children, icon: Icon }) => (
  <div className="bg-white/10 text-white rounded-full px-3 py-1.5 text-sm font-medium inline-flex items-center gap-1.5 border border-white/20 transition-colors hover:bg-white/20 backdrop-blur-sm">
    {Icon && <Icon size={14} />}
    {children}
  </div>
);

const OutlinePill = ({ children, dotColor }) => (
  <div className="bg-white/10 border border-white/20 rounded-full px-3 py-1 text-xs text-white inline-flex items-center gap-1.5 backdrop-blur-sm">
    {dotColor && <div className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
    {children}
  </div>
);

const FeatureCard = ({ title, description, children, icon: Icon }) => (
  <div className="bg-black/30 backdrop-blur-md rounded-xl border border-white/20 p-6 max-w-xs transition-colors hover:border-white/40 group">
    <div className="flex flex-col gap-1 mb-4">
      <div className="flex items-center gap-2 mb-1">
        {Icon && (
          <Icon
            size={18}
            className="text-blue-300 transition-transform group-hover:scale-110"
          />
        )}
        <h3 className="text-base font-semibold text-white tracking-tight">
          {title}
        </h3>
      </div>
      <p className="text-sm text-white/70 leading-relaxed text-left">
        {description}
      </p>
    </div>
    {children}
  </div>
);

const CircularProgress = ({ progress }) => (
  <div className="relative w-12 h-12 flex items-center justify-center">
    <svg className="w-12 h-12 -rotate-90">
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke="#F9FAFB"
        strokeWidth="3"
        fill="transparent"
      />
      <circle
        cx="24"
        cy="24"
        r="20"
        stroke="#EA580C"
        strokeWidth="3"
        fill="transparent"
        strokeDasharray={125.6}
        strokeDashoffset={125.6 * (1 - progress / 100)}
        className="transition-all duration-1000 ease-out"
      />
    </svg>
    <span className="absolute text-[10px] font-semibold text-white">
      {progress}%
    </span>
  </div>
);

const SceneContent = ({
  title,
  subtitle,
  pillText,
  pillIcon: PillIcon,
  children,
}) => (
  <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
    <div className="mb-6">
      <SoftPill icon={PillIcon}>{pillText}</SoftPill>
    </div>
    <h1 className="text-4xl md:text-6xl font-semibold text-white mb-4 tracking-tight drop-shadow-lg">
      {title}
    </h1>
    <p className="text-lg text-white/80 max-w-2xl mb-12 drop-shadow">
      {subtitle}
    </p>
    <div className="flex flex-wrap justify-center gap-6">{children}</div>
  </div>
);

const AutoVideo = ({ src, className, crossOrigin, onReady }) => {
  const ref = useRef(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return undefined;

    const markReady = () => onReady?.();
    video.addEventListener("loadeddata", markReady);
    video.addEventListener("canplay", markReady);
    video.addEventListener("playing", markReady);
    video.addEventListener("timeupdate", markReady, { once: true });

    if (video.readyState >= 3) markReady();
    video.play().catch(() => {});

    return () => {
      video.removeEventListener("loadeddata", markReady);
      video.removeEventListener("canplay", markReady);
      video.removeEventListener("playing", markReady);
      video.removeEventListener("timeupdate", markReady);
    };
  }, [onReady, src]);
  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      crossOrigin={crossOrigin}
      className={className}
    />
  );
};

const FirstVisitLoader = ({ heroVideoReady, videoAssets, onComplete }) => {
  const [progress, setProgress] = useState(8);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const minDuration = prefersReducedMotion ? 900 : 3200;
    const maxDuration = prefersReducedMotion ? 4000 : 22000;
    const startedAt = performance.now();

    const progressTimer = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 96) return current;
        const next = current + (prefersReducedMotion ? 8 : Math.random() * 5 + 1.5);
        return Math.min(96, Math.round(next));
      });
    }, prefersReducedMotion ? 160 : 260);

    const preloadVideo = (src) =>
      new Promise((resolve) => {
        const video = document.createElement("video");
        const done = () => resolve(src);
        video.preload = "auto";
        video.muted = true;
        video.playsInline = true;
        video.crossOrigin = "anonymous";
        video.onloadeddata = done;
        video.oncanplaythrough = done;
        video.onerror = done;
        video.src = src;
        video.load();
      });

    const maxTimer = window.setTimeout(() => {
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, minDuration - elapsed);
      window.setTimeout(() => {
        if (!isMounted) return;
        setProgress(100);
        setIsLeaving(true);
        window.setTimeout(onComplete, prefersReducedMotion ? 180 : 650);
      }, remaining);
    }, maxDuration);

    // Warm the rest of the reel without blocking the first frame.
    videoAssets.slice(1).forEach((src) => preloadVideo(src));

    return () => {
      isMounted = false;
      window.clearInterval(progressTimer);
      window.clearTimeout(maxTimer);
    };
  }, [onComplete, videoAssets]);

  useEffect(() => {
    if (!heroVideoReady) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const exitTimer = window.setTimeout(() => {
      setProgress(100);
      setIsLeaving(true);
      window.setTimeout(onComplete, prefersReducedMotion ? 180 : 650);
    }, prefersReducedMotion ? 200 : 750);

    return () => window.clearTimeout(exitTimer);
  }, [heroVideoReady, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: isLeaving ? 0 : 1 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className="fixed inset-0 z-[999] flex items-center justify-center overflow-hidden bg-black text-white"
    >
      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-1/2 top-1/2 h-[46rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 border-t-blue-300/70"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 border-b-cyan-300/60"
        />
      </div>

      <div className="relative z-10 w-[min(34rem,calc(100vw-3rem))] rounded-3xl border border-white/15 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-2xl">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.55)]" />
            <div>
              <p className="text-sm font-semibold tracking-tight">Nitrogen UI & WaaS</p>
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                Initializing experience
              </p>
            </div>
          </div>
          <span className="font-mono text-sm text-white/70">
            {Math.round(progress).toString().padStart(2, "0")}%
          </span>
        </div>

        <div className="mb-5 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 via-cyan-200 to-white shadow-[0_0_22px_rgba(125,211,252,0.75)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-white/50">
          <span>Preloading video field</span>
          <span>Stabilizing motion layers</span>
        </div>
      </div>
    </motion.div>
  );
};

/* ──────────────────────── scroll-driven content ─────────────────────── */

const AnimatedContent = ({
  globalProgress,
  enterRange,
  exitRange,
  children,
}) => {
  const enterOpacity = useTransform(
    globalProgress,
    [enterRange[0], enterRange[1]],
    [0, 1],
  );
  const exitOpacity = useTransform(
    globalProgress,
    [exitRange[0], exitRange[1]],
    [1, 0],
  );
  const opacity = useTransform([enterOpacity, exitOpacity], ([e, x]) =>
    Math.min(e, x),
  );
  const y = useTransform(
    globalProgress,
    [exitRange[0], exitRange[1]],
    [0, -40],
  );
  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 w-full h-full pointer-events-none"
    >
      {children}
    </motion.div>
  );
};

const DiagonalScene = ({
  videoUrl,
  globalProgress,
  wipeRange,
  contentEnter,
  contentExit,
  children,
}) => {
  const [start, end] = wipeRange;
  const localProgress = useTransform(globalProgress, [start, end], [0, 1]);
  const offset = 50;
  const xTop = useTransform(localProgress, [0, 1], [100 + offset, -offset]);
  const xBottom = useTransform(localProgress, [0, 1], [100, -(2 * offset)]);
  const clipPath = useTransform(
    [xTop, xBottom],
    ([top, bottom]) =>
      `polygon(${top}% 0%, 100% 0%, 100% 100%, ${bottom}% 100%)`,
  );

  return (
    <motion.div
      style={{ clipPath }}
      className="absolute inset-0 w-full h-full overflow-hidden bg-black"
    >
      <AutoVideo
        src={videoUrl}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <AnimatedContent
        globalProgress={globalProgress}
        enterRange={contentEnter}
        exitRange={contentExit}
      >
        {children}
      </AnimatedContent>
    </motion.div>
  );
};

/* ──────────────────────── water ripple section ──────────────────────── */

const WaterRippleSection = ({ videoSrc }) => {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef(null); // { buf1, buf2, width, height }
  const corsOkRef = useRef(null); // null=unknown, true=ok, false=blocked
  const offRef = useRef(null); // offscreen canvas + ctx

  /* ── boot simulation ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Run simulation at a lower resolution for performance, CSS scales it up
    const W = 640,
      H = 360;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");

    const buf1 = new Float32Array(W * H);
    const buf2 = new Float32Array(W * H);
    stateRef.current = { buf1, buf2, width: W, height: H };

    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    offRef.current = { canvas: off, ctx: off.getContext("2d") };

    const damping = 0.982;

    const tick = () => {
      const { buf1, buf2, width, height } = stateRef.current;

      /* wave physics — classic 2-buffer ripple */
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const i = y * width + x;
          buf2[i] =
            (buf1[i - 1] + buf1[i + 1] + buf1[i - width] + buf1[i + width]) *
              0.5 -
            buf2[i];
          buf2[i] *= damping;
        }
      }
      // swap buffers
      stateRef.current.buf1 = buf2;
      stateRef.current.buf2 = buf1;

      const vid = videoRef.current;
      if (vid && vid.readyState >= 2) {
        if (corsOkRef.current !== false) {
          /* try pixel-level refraction */
          try {
            const { ctx: offCtx } = offRef.current;
            offCtx.drawImage(vid, 0, 0, W, H);
            const src = offCtx.getImageData(0, 0, W, H);
            const dst = ctx.createImageData(W, H);
            const wave = stateRef.current.buf1;

            for (let y = 1; y < height - 1; y++) {
              for (let x = 1; x < width - 1; x++) {
                const i = y * width + x;
                const dx = Math.round(wave[i - 1] - wave[i + 1]);
                const dy = Math.round(wave[i - width] - wave[i + width]);
                const sx = Math.min(Math.max(x + dx, 0), W - 1);
                const sy = Math.min(Math.max(y + dy, 0), H - 1);
                const si = (sy * W + sx) * 4;
                const di = i * 4;
                dst.data[di] = src.data[si];
                dst.data[di + 1] = src.data[si + 1];
                dst.data[di + 2] = src.data[si + 2];
                dst.data[di + 3] = 255;
              }
            }
            ctx.putImageData(dst, 0, 0);
            corsOkRef.current = true;
          } catch (_) {
            /* CORS blocked — fall back to plain video draw */
            corsOkRef.current = false;
          }
        }

        if (corsOkRef.current === false) {
          /* CORS fallback: draw video normally, paint ripple glow on top */
          ctx.drawImage(vid, 0, 0, W, H);
          const wave = stateRef.current.buf1;
          ctx.save();
          for (let y = 2; y < height - 2; y += 4) {
            for (let x = 2; x < width - 2; x += 4) {
              const v = Math.abs(wave[y * width + x]);
              if (v > 2) {
                const a = Math.min(v / 80, 0.55);
                ctx.fillStyle = `rgba(180,220,255,${a})`;
                ctx.fillRect(x, y, 4, 4);
              }
            }
          }
          ctx.restore();
        }
      }

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  /* ── disturb water at pointer position ── */
  const disturb = useCallback((clientX, clientY, strength = 400) => {
    const canvas = canvasRef.current;
    if (!canvas || !stateRef.current) return;
    const rect = canvas.getBoundingClientRect();
    const { buf1, width, height } = stateRef.current;
    const cx = Math.floor(((clientX - rect.left) / rect.width) * width);
    const cy = Math.floor(((clientY - rect.top) / rect.height) * height);
    const r = 10;
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist <= r) {
          const nx = cx + dx,
            ny = cy + dy;
          if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1) {
            buf1[ny * width + nx] = strength * (1 - dist / r);
          }
        }
      }
    }
  }, []);

  const onMouseMove = useCallback(
    (e) => disturb(e.clientX, e.clientY),
    [disturb],
  );
  const onMouseDown = useCallback(
    (e) => disturb(e.clientX, e.clientY, 600),
    [disturb],
  );
  const onTouchMove = useCallback(
    (e) => {
      e.preventDefault();
      Array.from(e.touches).forEach((t) => disturb(t.clientX, t.clientY));
    },
    [disturb],
  );
  const onTouchStart = useCallback(
    (e) => {
      Array.from(e.touches).forEach((t) => disturb(t.clientX, t.clientY, 600));
    },
    [disturb],
  );

  return (
    <section className="relative w-full h-screen bg-black overflow-hidden">
      {/* hidden video element — crossOrigin for pixel read attempt */}
      <video
        ref={videoRef}
        src={videoSrc}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        style={{ display: "none" }}
      />

      {/* canvas fills the section */}
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: "crosshair",
        }}
        onMouseMove={onMouseMove}
        onMouseDown={onMouseDown}
        onTouchMove={onTouchMove}
        onTouchStart={onTouchStart}
      />

      {/* overlay text — pointer-events-none so canvas gets all events */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <p className="text-white/40 text-xs uppercase tracking-[0.25em] mb-5 font-medium">
          Interactive Surface
        </p>
        <h2 className="text-5xl md:text-7xl font-semibold text-white text-center drop-shadow-2xl tracking-tight">
          Touch the water
        </h2>
        <p className="text-white/50 mt-5 text-lg">
          Move your cursor to create ripples
        </p>
      </div>
    </section>
  );
};

/* ──────────────────────── spotlight / cursor-light section ──────────── */

const SpotlightSection = ({ videoSrc }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    damping: 30,
    stiffness: 200,
  });

  // Bottom-up steep "/" diagonal wipe
  // polygon(0% yLeft%, 100% yRight%, 100% 100%, 0% 100%)
  const offset = 50;
  const yLeft = useTransform(smoothProgress, [0, 1], [100 + offset, -offset]);
  const yRight = useTransform(smoothProgress, [0, 1], [100, -(2 * offset)]);
  const clipPath = useTransform(
    [yLeft, yRight],
    ([l, r]) => `polygon(0% ${l}%, 100% ${r}%, 100% 100%, 0% 100%)`,
  );

  // Spotlight cursor
  const [mouse, setMouse] = useState({ x: -999, y: -999 });
  const [isInside, setIsInside] = useState(false);
  const sectionRef = useRef(null);

  const onMouseMove = useCallback((e) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setMouse({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  return (
    <div ref={containerRef} className="relative h-[200vh]">
      <div
        ref={sectionRef}
        className="sticky top-0 h-screen w-full overflow-hidden bg-black"
        style={{ cursor: "none" }}
        onMouseMove={onMouseMove}
        onMouseEnter={() => setIsInside(true)}
        onMouseLeave={() => setIsInside(false)}
      >
        {/* Text lives here — on the black bg, visible immediately before the wipe */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
          <p className="text-white/40 text-xs uppercase tracking-[0.25em] mb-5 font-medium">
            Illuminate
          </p>
          <h2 className="text-5xl md:text-7xl font-semibold text-white text-center drop-shadow-2xl tracking-tight">
            Find what's hidden
          </h2>
          <p className="text-white/40 mt-5 text-base">
            Move your cursor to reveal the scene
          </p>
        </div>

        {/* Cursor glow — also outside the clip so it works everywhere */}
        {isInside && (
          <div
            className="absolute pointer-events-none z-30"
            style={{
              left: mouse.x,
              top: mouse.y,
              transform: "translate(-50%, -50%)",
              width: 18,
              height: 18,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,240,180,0.95) 0%, rgba(255,200,80,0.5) 50%, transparent 100%)",
              boxShadow:
                "0 0 18px 8px rgba(255,220,100,0.35), 0 0 40px 16px rgba(255,180,50,0.15)",
            }}
          />
        )}

        {/* Video — wipes in from bottom, clipped */}
        <motion.div
          style={{ clipPath }}
          className="absolute inset-0 w-full h-full"
        >
          <AutoVideo
            src={videoSrc}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Dark overlay with spotlight hole */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              background: isInside
                ? `radial-gradient(circle at ${mouse.x}px ${mouse.y}px, transparent 0px, transparent 120px, rgba(0,0,0,0.92) 260px)`
                : "rgba(0,0,0,0.92)",
              pointerEvents: "none",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

/* ─────────────────────── nitroge.mp4 — final scroll parallax ───────── */

const NitrogeScrollSection = ({ videoSrc, onFirstPlaybackEnd }) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const introStartedRef = useRef(false);
  const playbackStartedRef = useRef(false);
  const endedNotifiedRef = useRef(false);
  const introScale = useMotionValue(0.5);
  const isInView = useInView(containerRef, { once: true, amount: "some" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });
  const p = useSpring(scrollYProgress, { damping: 28, stiffness: 180 });
  const scrollScale = useTransform(p, [0, 0.45, 1], [1.22, 1.06, 1]);
  const scale = useTransform([introScale, scrollScale], ([i, s]) => i * s);
  const y = useTransform(p, [0, 1], [72, -48]);
  const fogOpacity = useTransform(p, [0, 0.28, 0.65, 1], [0.94, 0.5, 0.18, 0]);
  const vignetteOpacity = useTransform(p, [0, 0.5, 1], [0.75, 0.35, 0.12]);
  const titleOpacity = useTransform(p, [0, 0.15, 0.38], [1, 0.75, 0]);
  const titleY = useTransform(p, [0, 0.3], [0, -36]);

  useEffect(() => {
    if (!isInView || introStartedRef.current) return;
    introStartedRef.current = true;
    const t = window.setTimeout(() => {
      animate(introScale, 1, {
        duration: 0.85,
        ease: [0.22, 1, 0.36, 1],
      });
    }, 1500);
    return () => window.clearTimeout(t);
  }, [isInView, introScale]);

  useEffect(() => {
    if (!isInView || playbackStartedRef.current) return;
    playbackStartedRef.current = true;
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    v.play().catch(() => {});
  }, [isInView]);

  const onVideoEnded = useCallback(() => {
    if (endedNotifiedRef.current) return;
    endedNotifiedRef.current = true;
    onFirstPlaybackEnd?.();
  }, [onFirstPlaybackEnd]);

  return (
    <div ref={containerRef} className="relative h-[240vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        <motion.div
          style={{ scale, y }}
          className="absolute inset-0 w-full h-full will-change-transform"
        >
          <video
            ref={videoRef}
            src={videoSrc}
            loop={false}
            muted
            playsInline
            preload="auto"
            onEnded={onVideoEnded}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>

        {/* Cool mist + vignette — burns off as you scroll */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ opacity: fogOpacity }}
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 90% 55% at 50% 40%, rgba(200, 245, 255, 0.35) 0%, rgba(30, 58, 95, 0.55) 45%, rgba(0, 0, 0, 0.92) 100%)",
            }}
          />
        </motion.div>
        <motion.div
          className="absolute inset-0 pointer-events-none z-[11]"
          style={{
            opacity: vignetteOpacity,
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 0%, rgba(0,0,0,0.2) 55%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20 px-6 text-center"
          style={{ opacity: titleOpacity, y: titleY }}
        >
          <p className="text-cyan-200/50 text-xs uppercase tracking-[0.28em] mb-5 font-medium inline-flex items-center gap-2">
            <Cloud size={14} className="opacity-70" aria-hidden />
            Cryogenic layer
          </p>
          <h2 className="text-4xl md:text-6xl font-semibold text-white tracking-tight drop-shadow-2xl max-w-3xl">
            Nitrogen drift
          </h2>
          <p className="text-white/45 mt-4 text-base md:text-lg max-w-md">
            Scroll to clear the vapor. The clip runs once—then this layer steps
            aside for the site footer.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

const WaasSiteFooter = () => (
  <footer className="border-t border-white/10 bg-black font-inter text-white/55">
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-8 py-14 text-center text-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
        Nitrogen
      </p>
      <p className="text-base font-medium text-white/80">
        Website-as-a-Service · UI systems · edge delivery
      </p>
      <p className="max-w-lg text-xs leading-relaxed text-white/45">
        © {new Date().getFullYear()} Nitrogen UI / WaaS. Built for teams who want
        the interface layer shipped, versioned, and hosted without running the
        platform story twice.
      </p>
      <p className="text-[11px] text-white/35">
        Not legal advice; availability and scope live in your statement of work.
      </p>
    </div>
  </footer>
);

/* ──────────────────────────── main page ────────────────────────────── */

export default function HeroScrollPage() {
  const navigate = useNavigate();
  const launchTransition = useLaunchTransition();
  const [showIntroLoader, setShowIntroLoader] = useState(true);
  const [heroVideoReady, setHeroVideoReady] = useState(false);
  const [nitrogeDismissed, setNitrogeDismissed] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    staleTime: 0,
    damping: 30,
    stiffness: 200,
  });

  const videos = [
    mediaUrl("/Fluid.mp4"),
    mediaUrl("/JellyFish.mp4"),
    mediaUrl("/Sphere.mp4"),
    mediaUrl("/drone.mp4"),
  ];

  const waterVideo = mediaUrl("/Ocean.mp4");

  const scene1Opacity = useTransform(smoothProgress, [0, 0.18], [1, 0]);
  const scene1Y = useTransform(smoothProgress, [0, 0.18], [0, -40]);

  const spotlightVideo =
    "https://raw.createusercontent.com/e418c8c1-6d7d-4a71-9d4b-ad757a870435/";

  return (
    <main className="bg-black font-inter">
      {showIntroLoader && (
        <FirstVisitLoader
          heroVideoReady={heroVideoReady}
          videoAssets={[...videos, waterVideo]}
          onComplete={() => setShowIntroLoader(false)}
        />
      )}

      {/* ── 4-scene sticky scroll ── */}
      <div ref={containerRef} className="relative h-[400vh]">
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
          {/* Scene 1 */}
          <div className="absolute inset-0 w-full h-full bg-black">
            <AutoVideo
              src={videos[0]}
              className="absolute inset-0 w-full h-full object-cover"
              onReady={() => setHeroVideoReady(true)}
            />
            <motion.div
              style={{ opacity: scene1Opacity, y: scene1Y }}
              className="absolute inset-0 w-full h-full"
            >
              <SceneContent
                title="Structural Clarity"
                subtitle="Premium B2B deserves an interface that feels inevitable—where client experience is the product, and every redundant flourish we retire is another moment of trust earned at the glass."
                pillText="Signal over noise"
                pillIcon={Layers}
              >
                <FeatureCard
                  title="Quiet authority"
                  description="We compose surfaces like a brief to the boardroom: restrained chrome, deliberate rhythm, and hierarchy that whispers instead of shouts—visual noise removed so decisions read faster."
                >
                  <div className="mt-4 flex gap-2">
                    <OutlinePill dotColor="bg-green-500">Client-facing</OutlinePill>
                    <OutlinePill>B2B polish</OutlinePill>
                  </div>
                </FeatureCard>
                <FeatureCard
                  title="Clarity under load"
                  description="Dense workflows still need air—information stays legible when stakes are high, so operators and executives move through the same UI without friction or fatigue."
                >
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">
                        Health
                      </div>
                      <div className="text-xs font-medium text-white">
                        Optimized
                      </div>
                    </div>
                    <CircularProgress progress={84} />
                  </div>
                </FeatureCard>
              </SceneContent>
            </motion.div>
          </div>

          {/* Scene 2 */}
          <DiagonalScene
            videoUrl={videos[1]}
            globalProgress={smoothProgress}
            wipeRange={[0, 0.33]}
            contentEnter={[0.08, 0.22]}
            contentExit={[0.27, 0.4]}
          >
            <SceneContent
              title="Technical Excellence"
              subtitle="Architected for the most demanding technical workflows. Every pixel serves a purpose in the unified design ecosystem."
              pillText="Precision Core"
              pillIcon={Cpu}
            >
              <FeatureCard
                title="Systemic Logic"
                description="Standardized components ensure consistency across every module."
              >
                <div className="mt-4 space-y-2">
                  {[
                    "Component scaling",
                    "State management",
                    "Logic branching",
                  ].map((t) => (
                    <div
                      key={t}
                      className="text-xs text-white/70 flex items-center"
                    >
                      <span className="text-white/40 mr-2">-</span> {t}
                    </div>
                  ))}
                </div>
              </FeatureCard>
            </SceneContent>
          </DiagonalScene>

          {/* Scene 3 */}
          <DiagonalScene
            videoUrl={videos[2]}
            globalProgress={smoothProgress}
            wipeRange={[0.33, 0.66]}
            contentEnter={[0.4, 0.54]}
            contentExit={[0.59, 0.72]}
          >
            <SceneContent
              title="Global Infrastructure"
              subtitle="We ship to the edge on Cloudflare—HTTPS, caching, and a global network that keeps your UI crisp whether the client is downtown or twelve time zones away."
              pillText="Cloudflare edge"
              pillIcon={Globe}
            >
              <FeatureCard
                title="Network Health"
                description="Deployments ride Cloudflare’s mesh so latency stays predictable; your interface stays fast while the platform handles scale you never have to dramatize on a slide."
              >
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-[10px] font-semibold text-white"
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-white/60">+ PoPs worldwide</span>
                </div>
              </FeatureCard>
            </SceneContent>
          </DiagonalScene>

          {/* Scene 4 */}
          <DiagonalScene
            videoUrl={videos[3]}
            globalProgress={smoothProgress}
            wipeRange={[0.66, 1.0]}
            contentEnter={[0.74, 0.88]}
            contentExit={[0.99, 1.0]}
          >
            <SceneContent
              title="Productive Future"
              subtitle="The final destination in high-fidelity design. A workspace that breathes and scales with your ambition."
              pillText="Final Resolution"
              pillIcon={ArrowRight}
            >
              <div className="pointer-events-auto bg-black/30 backdrop-blur-md rounded-xl border border-white/20 p-8 shadow-sm flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-12 h-12 rounded-full border-t-2 border-blue-400"
                  />
                </div>
                <p className="text-sm font-semibold text-white">System Ready</p>
                <button
                  type="button"
                  disabled={launchTransition?.isLaunchTransitioning}
                  onClick={() =>
                    launchTransition
                      ? launchTransition.launchWithFluidTransition("/launch")
                      : navigate("/launch")
                  }
                  className="mt-6 bg-blue-500 text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-blue-400 transition-colors inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                >
                  Launch Platform <ArrowRight size={16} />
                </button>
              </div>
            </SceneContent>
          </DiagonalScene>

          {/* Scroll indicator */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30">
            <p className="text-[10px] uppercase tracking-widest text-white/50 font-semibold">
              Scroll to explore
            </p>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-[1px] h-8 bg-white/30"
            />
          </div>

          {/* Nav */}
          <nav className="absolute top-0 left-0 right-0 h-16 border-b border-white/10 flex items-center justify-between px-8 bg-black/40 backdrop-blur-md z-40">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-sm" />
              <span className="text-sm font-semibold text-white tracking-tight">
                Nitrogen UI & WaaS
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8 h-full">
              {["Solution", "Infrastructure", "Security", "Documentation"].map(
                (item, i) => {
                  const tabClass = `flex items-center h-full text-xs font-medium transition-colors border-b-2 -mb-[1px] ${
                    i === 0
                      ? "text-white font-semibold border-blue-400"
                      : "text-white/50 hover:text-white border-transparent hover:border-white/20"
                  }`;
                  if (item === "Documentation") {
                    return (
                      <Link
                        key={item}
                        to="/documentation"
                        className={tabClass}
                      >
                        {item}
                      </Link>
                    );
                  }
                  if (item === "Security") {
                    return (
                      <Link key={item} to="/security" className={tabClass}>
                        {item}
                      </Link>
                    );
                  }
                  if (item === "Infrastructure") {
                    return (
                      <Link key={item} to="/infrastructure" className={tabClass}>
                        {item}
                      </Link>
                    );
                  }
                  return (
                    <a key={item} href="#" className={tabClass}>
                      {item}
                    </a>
                  );
                },
              )}
            </div>
            <div className="flex items-center">
              <Link
                to="/get-started"
                className="bg-blue-500 text-white px-4 py-1.5 rounded-sm text-xs font-semibold hover:bg-blue-400 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </div>

      {/* ── water ripple section ── */}
      <WaterRippleSection videoSrc={waterVideo} />

      {/* ── spotlight / cursor-light section ── */}
      <SpotlightSection videoSrc={spotlightVideo} />

      {/* ── final scroll: nitroge.mp4 — removed from home after first full play ── */}
      {nitrogeDismissed ? (
        <WaasSiteFooter />
      ) : (
        <NitrogeScrollSection
          videoSrc="/nitroge.mp4"
          onFirstPlaybackEnd={() => setNitrogeDismissed(true)}
        />
      )}

      <style jsx global>{`
        body { background-color: #000; margin: 0; }
      `}</style>
    </main>
  );
}
