"use client";

import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowLeft, Shield } from "lucide-react";

/** Third clip in the hero reel (`page.jsx` `videos[2]`). */
const SECURITY_BG_VIDEO = "/Fluid.mp4";

export default function SecurityPage() {
  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen font-inter text-white">
      <video
        ref={videoRef}
        src={SECURITY_BG_VIDEO}
        className="fixed inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden
      />
      <div
        className="fixed inset-0 bg-gradient-to-b from-black/78 via-black/72 to-black/82"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur-md">
          <Link
            to="/"
            className="text-xs font-medium text-white/60 hover:text-white inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} aria-hidden />
            Back to experience
          </Link>
          <span className="text-sm font-semibold tracking-tight text-white/90">
            Security
          </span>
        </header>

        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-14 md:py-20">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/10">
            <Shield className="h-6 w-6 text-cyan-300" aria-hidden />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Security is inherited at the edge
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/75">
            We ship on{" "}
            <a
              href="https://www.cloudflare.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline decoration-white/30 underline-offset-2 hover:decoration-white/60"
            >
              Cloudflare
            </a>
            —so your traffic is terminated, inspected, and cached on their global
            network before it ever stresses a single origin. That is not “security as
            an afterthought”; it is architectural: the same control plane that
            serves Netflix-scale customers also wraps your zone on day one.
          </p>

          <section
            className="mt-10 rounded-2xl border border-white/12 bg-black/35 p-6 backdrop-blur-md"
            aria-labelledby="free-tier-heading"
          >
            <h2
              id="free-tier-heading"
              className="text-sm font-semibold uppercase tracking-wider text-white/50"
            >
              What you get even on a free Cloudflare zone
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/70">
              <li>
                <span className="font-medium text-white/85">Universal SSL</span>{" "}
                — edge certificates for HTTPS between visitors and Cloudflare, issued
                and renewed automatically. You are not manually stapling certs or
                paying a registrar add-on just to look legitimate in the browser bar.
              </li>
              <li>
                <span className="font-medium text-white/85">DNS, CDN, and DDoS absorption</span>{" "}
                — anycast routing and caching mean volumetric noise hits their metal,
                not yours; your origin stays a narrow, authenticated pipe instead of a
                public punching bag.
              </li>
              <li>
                <span className="font-medium text-white/85">Managed rules</span>{" "}
                — Cloudflare ships continuously updated WAF rulesets (scope and depth
                scale with plan). On free tiers you still inherit the discipline of a
                vendor that patches the edge for millions of zones; stricter or custom
                rules unlock when you graduate plans—same dashboard, no replatform.
              </li>
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-cyan-500/25 bg-cyan-950/15 p-6 backdrop-blur-md">
            <h2 className="text-sm font-semibold text-cyan-200/95">
              Why that matters for you
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              Hosting “for free” on Cloudflare is not cheap infrastructure—it is a
              wedge: you start with TLS, global reach, and baseline hardening baked
              in. When traffic, compliance, or abuse complexity grows, you tighten
              knobs—Bot Fight Mode, Access, advanced WAF, log drains—without migrating
              off a bespoke stack nobody else remembers how to run. We align with
              that model so security compounds with your roadmap instead of resetting
              it at every funding round.
            </p>
          </section>

          <p className="mt-8 text-xs leading-relaxed text-white/45">
            Final controls depend on your Cloudflare plan, zone settings, and origin
            configuration; we help wire the happy path—your security team still owns
            policy and review.
          </p>

          <Link
            to="/"
            className="mt-10 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 text-sm font-medium text-white ring-1 ring-white/20 transition-colors hover:bg-white/15"
          >
            <ArrowLeft size={16} aria-hidden />
            Home
          </Link>
        </main>
      </div>
    </div>
  );
}
