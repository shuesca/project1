"use client";

import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export default function GetStartedPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setStatus("sending");

    const payload = {
      name,
      email,
      phone,
      company,
      message,
      _gotcha: honeypot,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        setStatus("sent");
        return;
      }

      if (res.status === 503 && data.error === "not_configured") {
        setStatus("idle");
        setErrorMessage(
          "This form is not wired to the sheet yet. Add GOOGLE_SHEETS_APPS_SCRIPT_URL to the server .env (see scripts/append-inquiries-to-sheet.gs), then restart the dev server.",
        );
        return;
      }

      setStatus("idle");
      setErrorMessage(
        data.message ||
          data.detail ||
          data.error ||
          "Something went wrong.",
      );
    } catch {
      setStatus("idle");
      setErrorMessage("Network error. Try again in a moment.");
    }
  };

  return (
    <div className="min-h-screen bg-black font-inter text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between bg-black/80 backdrop-blur-md">
        <Link
          to="/"
          className="text-xs font-medium text-white/60 hover:text-white inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={14} aria-hidden />
          Back to experience
        </Link>
        <span className="text-sm font-semibold tracking-tight text-white/90">
          Get started
        </span>
      </header>

      <main className="mx-auto max-w-lg px-6 py-14 md:py-20">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
          Tell us what you are building
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60">
          Submit the form with us. We will get back to you within 32 hours.
        </p>

        {status === "sent" ? (
          <div className="mt-10 rounded-xl border border-emerald-500/30 bg-emerald-950/25 px-5 py-6 text-sm text-emerald-100/90">
            <p className="font-medium text-emerald-50">Thanks — we received it.</p>
            <p className="mt-2 text-emerald-100/70">
              Your answers were added to the intake sheet. You can close this tab or
              head back to the site.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block text-xs font-medium text-white/70 hover:text-white"
            >
              ← Return home
            </Link>
          </div>
        ) : (
          <form
            onSubmit={onSubmit}
            className="relative mt-10 space-y-5 rounded-2xl border border-white/12 bg-white/[0.04] p-6 md:p-8"
          >
            <label className="block">
              <span className="text-xs font-medium text-white/50">Name</span>
              <input
                required
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none ring-0 focus:border-blue-400/60"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-white/50">Email</span>
              <input
                required
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/60"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-white/50">
                Phone <span className="text-white/35">(optional)</span>
              </span>
              <input
                type="tel"
                name="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/60"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-white/50">
                Company / project name <span className="text-white/35">(optional)</span>
              </span>
              <input
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/60"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-white/50">
                What do you need?
              </span>
              <textarea
                required
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                minLength={12}
                placeholder="Timeline, stack, design maturity, and what “done” looks like for you."
                className="mt-1.5 w-full resize-y rounded-lg border border-white/15 bg-black/40 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-blue-400/60"
              />
            </label>

            <div className="hidden" aria-hidden>
              <label>
                Company website
                <input
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </label>
            </div>

            {errorMessage ? (
              <p className="text-xs leading-relaxed text-amber-200/90">{errorMessage}</p>
            ) : null}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-lg bg-blue-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-400 disabled:cursor-wait disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Submit"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
