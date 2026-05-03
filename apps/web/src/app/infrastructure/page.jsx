"use client";

import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowLeft, Server } from "lucide-react";
import { mediaUrl } from "@/app/media";

/** Third clip in the hero reel (`page.jsx` `videos[2]`). */
const INFRA_BG_VIDEO = mediaUrl("/Fluid.mp4");

export default function InfrastructurePage() {
  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen font-inter text-white">
      <video
        ref={videoRef}
        src={INFRA_BG_VIDEO}
        className="fixed inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden
      />
      <div
        className="fixed inset-0 bg-gradient-to-b from-black/78 via-black/70 to-black/82"
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
            Infrastructure
          </span>
        </header>

        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-14 md:py-20">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/10">
            <Server className="h-6 w-6 text-violet-300" aria-hidden />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Infrastructure built for serious CRM work
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/75">
            We ship and operate the layer where{" "}
            <span className="text-white/90 font-medium">
              advanced CRM-style sites
            </span>{" "}
            live—multi-role permissions, pipeline and lifecycle views, deep
            relational data, integrations to your stack, and admin UX that does not
            collapse under real accounts and audit trails. That is the product surface
            we optimize for: fast edges, predictable deploys, and code you can extend.
          </p>

          <section
            className="mt-10 rounded-2xl border border-amber-500/30 bg-amber-950/20 p-6 backdrop-blur-md"
            aria-labelledby="payments-boundary-heading"
          >
            <h2
              id="payments-boundary-heading"
              className="text-sm font-semibold uppercase tracking-wider text-amber-200/90"
            >
              What we deliberately do not host here
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              <span className="font-medium text-white/88">Digital payments</span>{" "}
              — card capture, wallet rails, custom checkout that touches PAN/CVC, or
              anything that drags{" "}
              <span className="text-white/90">PCI DSS scope, fraud ops, and PSP keys</span>{" "}
              into our footprint — are{" "}
              <span className="text-white/90 font-medium">
                out of scope on this infrastructure
              </span>
              . Not because payments are unimportant, but because they deserve a
              boundary: either a certified processor’s hosted flow (Checkout, Elements
              in PCI mode you own, invoicing links) or your existing treasury stack—
              where key material, chargebacks, and SAQ evidence already live.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/70">
              Mixing CRM richness with raw payment plumbing on the same WaaS edge
              blurs compliance lines and turns every deploy into a security program
              review. We keep that rail{" "}
              <span className="italic text-white/80">adjacent</span>, not embedded, so
              your CRM can still deep-link to Stripe, Paddle, or your bank—without us
              inheriting half your audit surface by accident.
            </p>
          </section>

          <section className="mt-8 rounded-2xl border border-white/12 bg-black/35 p-6 backdrop-blur-md">
            <h2 className="text-sm font-semibold text-white/90">
              Practical takeaway
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              You get opinionated hosting and implementation for{" "}
              <span className="text-white/88">sophisticated CRM experiences</span>; you
              route money through providers built to sign the paperwork. If you need
              in-product payments, we help you design the handoff—buttons, webhooks,
              reconciliation views—not card data on our servers.
            </p>
          </section>

          <section className="mt-8 rounded-2xl border border-blue-400/25 bg-blue-950/20 p-6 backdrop-blur-md">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-200/90">
              The renter vs. owner reality
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              This is the fundamental trade-off of the modern web.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                <h3 className="text-sm font-semibold text-white">
                  Wix: the renter model
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  You get a beautiful furnished apartment. Wix handles the plumbing
                  (hosting), security (SSL), and renovations (updates). But you cannot
                  take the walls with you when you move; you only own the furniture:
                  your photos and text.
                </p>
              </div>
              <div className="rounded-xl border border-blue-300/20 bg-blue-500/10 p-4">
                <h3 className="text-sm font-semibold text-white">
                  Self-hosted / Cloudflare: the owner model
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">
                  You buy the land and build the house. You own every brick and wire:
                  the code. If you do not like your hosting provider, you can pick up
                  the entire house and move it to a different plot of land.
                </p>
              </div>
            </div>
          </section>

          <p className="mt-8 text-xs leading-relaxed text-white/45">
            Scope and exceptions belong in your statement of work; cardholder data
            environments are always coordinated with your processor and counsel.
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
