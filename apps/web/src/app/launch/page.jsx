"use client";

import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  LAUNCH_SMOKE_NAV_SEC,
  LAUNCH_SMOKE_TOTAL_SEC,
} from "../launchTransitionConstants";
import { WhiteSmokeBackground } from "../WhiteSmokeBackground";
import {
  ArrowLeft,
  ArrowRight,
  Cloud,
  Github,
  CircleDot,
  Grid3x3,
  Droplets,
  Box,
  Scan,
  Waves,
  Banknote,
} from "lucide-react";

const MARKET_RATES = [
  {
    label: "Landing page (single URL, design + build)",
    range: "$1,200 – $6,500",
    note: "Copy, layout, responsive pass, basic analytics hookup.",
  },
  {
    label: "Each additional page (from an existing system)",
    range: "$250 – $950",
    note: "Assumes shared components, typography, and navigation patterns.",
  },
  {
    label: "Custom page (net-new layout, moderate interaction)",
    range: "$600 – $2,400",
    note: "Forms, accordions, light motion, CMS-ready fields.",
  },
  {
    label: "Small marketing site (about 3–6 pages)",
    range: "$3,500 – $18,000",
    note: "Discovery, IA, design system, build, QA, launch checklist.",
  },
  {
    label: "UI kit / component library (Figma + documented tokens)",
    range: "$2,000 – $12,000",
    note: "Scale varies with component count and states (hover, error, empty).",
  },
  {
    label: "Full-screen transition or hero motion (one shipped beat)",
    range: "$800 – $4,500",
    note: "Blended band when scope is TBD; the animation grid below prices each pattern separately.",
  },
  {
    label: "Ongoing site care (updates, monitoring, minor fixes)",
    range: "$150 – $600 / month",
    note: "Retainer-style; hours and SLA tier determine where in the band.",
  },
];

const OPTION_GROUPS = [
  {
    label: "Mask & motion",
    icon: CircleDot,
    options: [
      {
        name: "Iris / spotlight close",
        detail:
          "Circular mask expands or contracts until the viewport is a flat color or the next view.",
        marketRange: "$350 – $1,400",
        pricingFor:
          "Per added animation: mask choreography, motion timing, implementation, two breakpoints QA, one revision.",
      },
      {
        name: "Diagonal or venetian blind wipe",
        detail:
          "Striped or angled panels sweep across the frame in sequence; strong motion-graphic read.",
        marketRange: "$450 – $1,900",
        pricingFor:
          "Per added animation: panel count/stagger spec, clip-path or layer build, QA, one revision.",
      },
      {
        name: "Dual curtain / split door",
        detail:
          "Two panels meet from left and right; implemented with clip-path or paired animated layers.",
        marketRange: "$400 – $1,700",
        pricingFor:
          "Per added animation: paired surfaces, easing, handoff to router, reduced-motion fallback, one revision.",
      },
      {
        name: "Blur + scale tunnel",
        detail:
          "Slight zoom-in combined with increasing blur, then a clean cut—low noise, high polish.",
        marketRange: "$280 – $1,100",
        pricingFor:
          "Per added animation: filter stack tuning, duration curve, implementation, QA, one revision.",
      },
      {
        name: "Chromatic pulse",
        detail:
          "Short burst of channel separation or aberration over the whole frame, then transition out.",
        marketRange: "$220 – $900",
        pricingFor:
          "Per added animation: aberration pass, safe limits for photosensitivity, build, QA, one revision.",
      },
    ],
  },
  {
    label: "Canvas",
    icon: Grid3x3,
    options: [
      {
        name: "Particle burst / confetti",
        detail:
          "Many small shapes emit from a point or edge; color and density are easy to tune to brand.",
        marketRange: "$650 – $3,200",
        pricingFor:
          "Per added animation: emitter logic, palette, density caps, frame budget check, one revision.",
      },
      {
        name: "Pixel dissolve",
        detail:
          "Grid of cells fades, shuffles, or collapses inward—reads as digital decay or deconstruction.",
        marketRange: "$750 – $3,800",
        pricingFor:
          "Per added animation: grid resolution choice, randomness controls, cleanup of DOM post-exit, one revision.",
      },
      {
        name: "Scanline / CRT power-off",
        detail:
          "Horizontal bands compress with a slight barrel curve; nostalgic, high-contrast finish.",
        marketRange: "$550 – $2,400",
        pricingFor:
          "Per added animation: barrel transform, band timing, implementation, QA on GPU tiers, one revision.",
      },
      {
        name: "Noise / static wipe",
        detail:
          "Animated noise replaces the image, then resolves to a solid or the incoming route.",
        marketRange: "$450 – $2,000",
        pricingFor:
          "Per added animation: noise generator, mask path, teardown after transition, one revision.",
      },
    ],
  },
  {
    label: "WebGL (heavier)",
    icon: Box,
    options: [
      {
        name: "Fluid / smoke simulation",
        detail:
          "Volume-like motion fills the screen; highest visual impact, higher GPU and implementation cost.",
        marketRange: "$4,500 – $18,000+",
        pricingFor:
          "Per added animation: sim parameters, mobile fallbacks, profiling pass, integration with route timing, two revisions.",
      },
      {
        name: "3D page curl",
        detail:
          "Geometry folds as if turning a page; often third-party assisted, adds script and asset weight.",
        marketRange: "$1,600 – $8,500",
        pricingFor:
          "Per added animation: mesh/lighting setup, asset prep, library glue, QA across GPUs, one revision.",
      },
    ],
  },
  {
    label: "SVG & filters",
    icon: Droplets,
    options: [
      {
        name: "Gooey / metaball merge",
        detail:
          "Thresholded blur makes blobs fuse into a full bleed; SVG filter stack, no WebGL context.",
        marketRange: "$700 – $3,400",
        pricingFor:
          "Per added animation: filter graph, contrast-safe thresholds, implementation, QA, one revision.",
      },
      {
        name: "Liquid displacement",
        detail:
          "Distortion field warps a bitmap or live layer—organic motion without a full fluid solver.",
        marketRange: "$850 – $3,900",
        pricingFor:
          "Per added animation: displacement map authoring, map animation, fallback still, one revision.",
      },
    ],
  },
  {
    label: "Content-driven",
    icon: Scan,
    options: [
      {
        name: "Zoom into the CTA",
        detail:
          "Camera-style push into a focal region of a still capture, then hard cut to the next screen.",
        marketRange: "$380 – $1,600",
        pricingFor:
          "Per added animation: capture pipeline hook, scale curve, handoff frame, QA, one revision.",
      },
      {
        name: "Alternate shatter",
        detail:
          "Breaking glass metaphor with different tessellation—hexagons, rings, or fewer larger shards.",
        marketRange: "$1,000 – $5,500",
        pricingFor:
          "Per added animation: tessellation design, shard motion, optional texture pass, perf guardrails, one revision.",
      },
      {
        name: "Water ripple (full-screen)",
        detail:
          "Wave equation on a bitmap or masked layer; can run on a frozen frame to control cost.",
        marketRange: "$1,200 – $5,800",
        pricingFor:
          "Per added animation: sim resolution, pointer vs auto disturb modes, CORS-safe capture path, one revision.",
      },
    ],
  },
];

const ENTRY_FADE_SEC = 0.52;
const entryFadeDelaySec =
  LAUNCH_SMOKE_TOTAL_SEC - LAUNCH_SMOKE_NAV_SEC - ENTRY_FADE_SEC - 0.12;

export default function LaunchPlatformPage() {
  const [fromSmoke] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      if (sessionStorage.getItem("nitrogen:launchEntry") === "1") {
        sessionStorage.removeItem("nitrogen:launchEntry");
        return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  });

  return (
    <motion.div
      className="relative min-h-screen font-inter text-neutral-900"
      initial={fromSmoke ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={
        fromSmoke
          ? {
              duration: ENTRY_FADE_SEC,
              delay: entryFadeDelaySec,
              ease: [0.22, 1, 0.36, 1],
            }
          : { duration: 0 }
      }
    >
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden>
        <WhiteSmokeBackground />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-neutral-200/90 px-6 py-4 flex items-center justify-between bg-white/70 backdrop-blur-md">
          <Link
            to="/"
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} aria-hidden />
            Back to experience
          </Link>
          <span className="text-sm font-semibold tracking-tight text-neutral-800">
            Nitrogen UI/WaaS
          </span>
        </header>

        <main className="flex-1 flex flex-col items-center px-6 py-16 md:py-20 w-full max-w-4xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.28em] text-neutral-500 mb-4">
            Launch platform
          </p>
          <h1 className="text-3xl md:text-5xl font-semibold text-center tracking-tight max-w-2xl mb-4 text-neutral-950">
            Request services
          </h1>
          <p className="text-neutral-600 text-center text-base md:text-lg max-w-xl leading-relaxed mb-10">
            Outline scope, timeline, and stack preferences. The list below catalogs
            full-screen transition patterns—each can ship as a standalone beat before
            route change or handoff.
          </p>

          <section
            className="w-full rounded-2xl border border-emerald-200/80 bg-emerald-50/75 backdrop-blur-sm p-6 md:p-8 mb-10 shadow-sm shadow-emerald-900/5"
            aria-labelledby="market-rates-heading"
          >
            <div className="flex items-start gap-3 mb-5">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-emerald-700" aria-hidden />
              </div>
              <div>
                <h2
                  id="market-rates-heading"
                  className="text-base font-semibold text-neutral-900 tracking-tight"
                >
                  Indicative market rates (USD)
                </h2>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Blended freelance and boutique studio bands for North America,
                  early 2026. Ranges widen with brand, content, integrations, and
                  compliance depth—not a quote.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-neutral-200/90 bg-white/60">
              <table className="w-full text-left text-sm min-w-[520px]">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-100/90">
                    <th className="px-4 py-3 font-medium text-neutral-600">
                      Service
                    </th>
                    <th className="px-4 py-3 font-medium text-neutral-600 whitespace-nowrap">
                      Typical market range
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MARKET_RATES.map((row) => (
                    <tr
                      key={row.label}
                      className="border-b border-neutral-100 last:border-0 bg-white/50"
                    >
                      <td className="px-4 py-3 align-top">
                        <span className="font-medium text-neutral-900">{row.label}</span>
                        <p className="text-xs text-neutral-500 mt-1 max-w-md">{row.note}</p>
                      </td>
                      <td className="px-4 py-3 align-top whitespace-nowrap font-semibold text-emerald-800 tabular-nums">
                        {row.range}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section
            className="w-full rounded-2xl border border-neutral-200/90 bg-white/55 backdrop-blur-sm p-6 md:p-8 mb-10 shadow-sm shadow-neutral-900/5"
            aria-labelledby="transition-options-heading"
          >
            <div className="flex items-start gap-3 mb-6">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                <Waves className="w-5 h-5 text-blue-600" aria-hidden />
              </div>
              <div>
                <h2
                  id="transition-options-heading"
                  className="text-base font-semibold text-neutral-900 tracking-tight"
                >
                  Full-screen animation options
                </h2>
                <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                  Compare patterns by motion language, implementation weight, and how
                  much of the frame reads as bitmap versus vector or shader work.
                  Each row is priced as one deliverable you add to a project.
                </p>
                <p className="text-[11px] text-neutral-500 mt-3 leading-relaxed border border-neutral-200 rounded-lg px-3 py-2 bg-neutral-50/90">
                  <span className="font-semibold text-neutral-700">What counts as one animation: </span>
                  scoped motion or effect for a single route or state change, built to
                  spec, wired in the app, checked on at least two breakpoints, with one
                  structured revision round unless the row says otherwise. Not cumulative
                  with other rows unless contracted separately.
                </p>
              </div>
            </div>

            <div className="space-y-8">
              {OPTION_GROUPS.map((group) => {
                const Icon = group.icon;
                return (
                  <div key={group.label}>
                    <h3 className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-neutral-500" aria-hidden />
                      {group.label}
                    </h3>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {group.options.map((opt) => (
                        <li
                          key={opt.name}
                          className="rounded-xl border border-neutral-200/90 bg-white/75 backdrop-blur-sm px-4 py-3 text-left flex flex-col gap-2 shadow-sm shadow-neutral-900/5"
                        >
                          <div>
                            <p className="text-sm font-medium text-neutral-900">
                              {opt.name}
                            </p>
                            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                              {opt.detail}
                            </p>
                          </div>
                          <div className="pt-2 mt-auto border-t border-neutral-200">
                            <p className="text-xs font-semibold text-emerald-800 tabular-nums">
                              Market (USD): {opt.marketRange}
                            </p>
                            <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                              <span className="text-neutral-600 font-medium">
                                Priced for:{" "}
                              </span>
                              {opt.pricingFor}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid gap-4 w-full max-w-md">
            <div className="rounded-xl border border-neutral-200/90 bg-white/70 backdrop-blur-sm p-5 flex gap-4 shadow-sm">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center">
                <Github size={18} className="text-blue-600" aria-hidden />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-1">
                  Source of truth
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  Work is versioned in source control first—review, tag, and promote
                  when checks pass.
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200/90 bg-white/70 backdrop-blur-sm p-5 flex gap-4 shadow-sm">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-200 flex items-center justify-center">
                <Cloud size={18} className="text-cyan-700" aria-hidden />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-neutral-900 mb-1">
                  Cloudflare handoff
                </h2>
                <p className="text-xs text-neutral-600 leading-relaxed">
                  TLS, edge caching, and broad geographic coverage without a heavy
                  operational footprint on the content layer.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="mt-12 bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blue-500 transition-colors inline-flex items-center gap-2 shadow-md shadow-blue-900/15"
          >
            Return home <ArrowRight size={16} aria-hidden />
          </Link>
        </main>
      </div>
    </motion.div>
  );
}
