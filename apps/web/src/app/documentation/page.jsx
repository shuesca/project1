"use client";

import { useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowLeft, FileCode2 } from "lucide-react";
import { mediaUrl } from "@/app/media";

/** Third clip in the hero reel (`page.jsx` `videos[2]`). */
const DOC_BG_VIDEO = mediaUrl("/Fluid.mp4");

export default function DocumentationPage() {
  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen font-inter text-white">
      <video
        ref={videoRef}
        src={DOC_BG_VIDEO}
        className="fixed inset-0 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden
      />
      <div
        className="fixed inset-0 bg-gradient-to-b from-black/75 via-black/70 to-black/80"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur-md">
          <Link
            to="/launch"
            className="text-xs font-medium text-white/60 hover:text-white inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} aria-hidden />
            Back to launch
          </Link>
          <span className="text-sm font-semibold tracking-tight text-white/90">
            Documentation
          </span>
        </header>

        <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-14 md:py-20">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/10">
            <FileCode2 className="h-6 w-6 text-blue-300" aria-hidden />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Source files ship with the work
          </h1>
          <p className="mt-4 text-base leading-relaxed text-white/75">
            When your project is complete, you receive the repository and build
            artifacts you need to run, extend, or hand off the product—not a
            black box locked to our accounts.
          </p>

          <section
            className="mt-10 rounded-2xl border border-white/12 bg-black/35 p-6 backdrop-blur-md"
            aria-labelledby="industry-heading"
          >
            <h2
              id="industry-heading"
              className="text-sm font-semibold uppercase tracking-wider text-white/50"
            >
              How the market usually handles this
            </h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-white/70">
              <li>
                <span className="font-medium text-white/85">Fixed-price gigs</span>{" "}
                (marketplaces, small retainers) sometimes sell a hosted preview or
                export-only build, then list{" "}
                <span className="text-white/90">“source code” as an add-on</span>.
                That is a business model, not a technical requirement—it keeps the
                entry price low and recovers time on handover.
              </li>
              <li>
                <span className="font-medium text-white/85">Studios and product teams</span>{" "}
                more often treat the codebase as the deliverable: access is written
                into scope, tied to milestones, and governed by license and IP
                clauses in the contract.
              </li>
            </ul>
          </section>

          <section className="mt-8 rounded-2xl border border-emerald-500/25 bg-emerald-950/20 p-6 backdrop-blur-md">
            <h2 className="text-sm font-semibold text-emerald-200/95">
              How we do it
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/75">
              We include source in the engagement by default—no Fiverr-style upsell
              to “unlock” the repo. You still get clear boundaries in the statement
              of work (what is in scope, third-party licenses, and how handoff is
              timed), but you are not paying extra just to own the files you already
              paid to have built.
            </p>
          </section>

          <p className="mt-8 text-xs leading-relaxed text-white/45">
            Exact IP assignment and license terms depend on your contract and
            jurisdiction; the above describes our default commercial posture, not
            legal advice.
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
