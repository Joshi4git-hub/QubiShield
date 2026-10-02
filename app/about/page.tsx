"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

// ─── Scroll-Reveal Hook ──────────────────────────────────────────────
function useReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      requestAnimationFrame(() => setVisible(true));
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ─── Reusable Section Wrapper ────────────────────────────────────────
function Section({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, visible } = useReveal(0.12);
  return (
    <section
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        visible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </section>
  );
}

// ─── Section Heading ─────────────────────────────────────────────────
function SectionHeading({
  tag,
  title,
  subtitle,
}: {
  tag?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-10 sm:mb-14">
      {tag && (
        <span className="inline-block px-3 py-1 mb-4 rounded-full text-[10px] tracking-[0.25em] uppercase font-mono font-medium border border-violet-500/25 bg-violet-950/30 text-violet-400">
          {tag}
        </span>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 max-w-2xl text-sm sm:text-base text-zinc-400 leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ─── Application Card ────────────────────────────────────────────────
function AppCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}) {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`group relative flex flex-col p-6 sm:p-7 rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0c0a1a]/80 to-[#060511]/90 backdrop-blur-sm transition-all duration-700 ease-out hover:border-violet-500/30 hover:-translate-y-1 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-violet-950/50 border border-violet-500/15 text-violet-400 mb-5 group-hover:bg-violet-900/40 transition-colors">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-white mb-2 tracking-wide">
        {title}
      </h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

// ─── Timeline Step ───────────────────────────────────────────────────
function TimelineStep({
  step,
  title,
  description,
  isLast,
  delay,
}: {
  step: string;
  title: string;
  description: string;
  isLast: boolean;
  delay: number;
}) {
  const { ref, visible } = useReveal(0.1);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`relative flex gap-5 sm:gap-6 transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
    >
      {/* Vertical Line + Dot */}
      <div className="flex flex-col items-center">
        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-violet-500/30 bg-violet-950/50 text-violet-400 font-mono text-xs font-bold shrink-0">
          {step}
        </div>
        {!isLast && (
          <div className="flex-1 w-px bg-gradient-to-b from-violet-500/30 to-transparent mt-2" />
        )}
      </div>
      {/* Content */}
      <div className={`pb-8 ${isLast ? "" : ""}`}>
        <h4 className="text-sm sm:text-base font-semibold text-white mb-1.5 tracking-wide">
          {title}
        </h4>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-lg">
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── SVG Icons (inline, minimal) ────────────────────────────────────
const BankIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4" />
  </svg>
);
const ShieldIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l8 4v6c0 5.5-3.5 10-8 12-4.5-2-8-6.5-8-12V6l8-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
  </svg>
);
const FiberIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M4 12c0-3 2-6 8-6s8 3 8 6M4 12c0 3 2 6 8 6s8-3 8-6" />
    <circle cx="4" cy="12" r="1.5" fill="currentColor" />
    <circle cx="20" cy="12" r="1.5" fill="currentColor" />
  </svg>
);
const SatelliteIcon = (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l-2 2M15 5l-6 6M7.5 16.5l-3 3M3 12a9 9 0 0115.5-6.2M21 12a9 9 0 01-15.5 6.2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

// ═════════════════════════════════════════════════════════════════════
// MAIN ABOUT PAGE
// ═════════════════════════════════════════════════════════════════════
export default function AboutPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#040308] text-white selection:bg-violet-500 selection:text-white">
      <Navbar />

      {/* ── HERO SECTION ────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Subtle radial glow behind hero */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-[0.12]"
          style={{
            background:
              "radial-gradient(ellipse at center, #7c3aed 0%, transparent 70%)",
          }}
          aria-hidden="true"
        />

        <div className="relative max-w-5xl mx-auto px-6 sm:px-10 pt-32 sm:pt-40 pb-16 sm:pb-24">
          <Section>
            <span className="inline-block px-3 py-1 mb-5 rounded-full text-[10px] tracking-[0.25em] uppercase font-mono font-medium border border-violet-500/25 bg-violet-950/30 text-violet-400">
              About
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              About QubiShield
            </h1>
            <p className="mt-3 text-lg sm:text-xl text-violet-300/80 font-medium tracking-wide">
              Understanding BB84 Quantum Key Distribution
            </p>
            <p className="mt-6 max-w-2xl text-sm sm:text-base text-zinc-400 leading-relaxed">
              QubiShield is an interactive educational simulation that
              demonstrates how quantum key distribution works and how
              disturbances in a quantum communication channel can be
              detected.
            </p>
          </Section>

          {/* Decorative mini flow: Alice → Channel → Bob */}
          <Section delay={200}>
            <div className="mt-12 flex items-center justify-center gap-3 sm:gap-5 text-[11px] sm:text-xs font-mono tracking-wider uppercase text-zinc-500">
              <span className="px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-950/20 text-cyan-400">
                Alice
              </span>
              <svg className="w-5 h-5 text-violet-500/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="px-3 py-1.5 rounded-lg border border-violet-500/20 bg-violet-950/20 text-violet-400">
                Quantum Channel
              </span>
              <svg className="w-5 h-5 text-violet-500/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
              <span className="px-3 py-1.5 rounded-lg border border-violet-500/20 bg-violet-950/20 text-violet-400">
                Bob
              </span>
            </div>
          </Section>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      {/* ── WHAT IS BB84? ───────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 sm:py-28">
        <Section>
          <SectionHeading
            tag="Protocol"
            title="What is BB84?"
          />
        </Section>

        <div className="grid md:grid-cols-2 gap-10 md:gap-14">
          <Section delay={100}>
            <div className="space-y-5">
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                <strong className="text-white">BB84</strong>, introduced
                by Charles Bennett and Gilles Brassard in 1984, is a
                Quantum Key Distribution (QKD) protocol. It allows two
                parties, Alice and Bob, to establish a shared
                cryptographic key using quantum states.
              </p>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Alice encodes random bits using two possible bases: the
                rectilinear basis (<span className="text-violet-400 font-mono">+</span>) and the diagonal basis (<span className="text-violet-400 font-mono">×</span>).
                Bob measures the received qubits using randomly selected
                bases. They publicly compare their basis choices and
                discard positions where the bases do not match.
              </p>
              <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
                Because quantum measurement can disturb a quantum state,
                an eavesdropper&apos;s attempt to intercept and measure qubits
                may introduce detectable errors.
              </p>
            </div>
          </Section>

          {/* BB84 Flow Diagram */}
          <Section delay={250}>
            <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-[#0c0a1a]/80 to-[#060511]/90 p-6 sm:p-8">
              <h3 className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-500 mb-6">
                Protocol Flow
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Alice Prepares",
                    color: "border-cyan-500/30 text-cyan-400",
                    desc: "Encodes random bits in random bases",
                  },
                  {
                    label: "Quantum Transmission",
                    color: "border-violet-500/30 text-violet-400",
                    desc: "Qubits travel through the channel",
                  },
                  {
                    label: "Bob Measures",
                    color: "border-violet-500/30 text-violet-400",
                    desc: "Measures using randomly chosen bases",
                  },
                  {
                    label: "Basis Reconciliation",
                    color: "border-amber-500/30 text-amber-400",
                    desc: "Compare bases, keep matching positions",
                  },
                  {
                    label: "Error Detection",
                    color: "border-rose-500/30 text-rose-400",
                    desc: "Sample sifted bits, compute QBER",
                  },
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3.5">
                    <div
                      className={`shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center font-mono text-xs font-bold ${step.color} bg-black/30`}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-white">
                        {step.label}
                      </span>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      {/* ── FORMULA — QBER ──────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 sm:py-28">
        <Section>
          <SectionHeading
            tag="Formula"
            title="Quantum Bit Error Rate (QBER)"
            subtitle="QubiShield uses the Quantum Bit Error Rate to estimate the proportion of errors in a sample of Alice and Bob's sifted bits."
          />
        </Section>

        {/* Formula Card */}
        <Section delay={150}>
          <div className="rounded-2xl border border-violet-500/15 bg-gradient-to-b from-[#0f0b22]/90 to-[#060511]/95 p-8 sm:p-10 md:p-12">
            {/* Main Formula */}
            <div className="text-center mb-10">
              <p className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-500 mb-5">
                Definition
              </p>
              <div className="inline-block px-6 sm:px-10 py-5 sm:py-6 rounded-xl border border-violet-500/20 bg-black/40">
                <p className="text-lg sm:text-xl md:text-2xl font-mono text-white tracking-wide">
                  QBER ={" "}
                  <span className="text-violet-400">
                    <span className="inline-block border-b border-violet-400/60 pb-0.5">
                      Number of mismatched test bits
                    </span>
                  </span>
                </p>
                <p className="text-lg sm:text-xl md:text-2xl font-mono text-white tracking-wide mt-1">
                  <span className="invisible">QBER = </span>
                  <span className="text-violet-300/70 inline-block border-t border-violet-400/60 pt-0.5">
                    Total number of tested bits
                  </span>
                  <span className="text-zinc-400 ml-3">× 100%</span>
                </p>
              </div>
            </div>

            {/* Worked Example */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-6">
                <h4 className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-500 mb-4">
                  Worked Example
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                  If Alice and Bob compare{" "}
                  <strong className="text-white">20 test bits</strong> and
                  find <strong className="text-rose-400">3 mismatches</strong>:
                </p>
                <div className="font-mono text-base sm:text-lg text-white bg-black/40 rounded-lg px-5 py-4 border border-violet-500/10">
                  <span className="text-zinc-400">QBER</span> ={" "}
                  <span className="text-violet-400">(3 / 20)</span> × 100
                  ={" "}
                  <span className="text-amber-400 font-bold">15%</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-black/30 p-6">
                <h4 className="text-xs font-mono tracking-[0.2em] uppercase text-zinc-500 mb-4">
                  Interpretation
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed mb-3">
                  A high QBER may indicate eavesdropping or disturbances
                  in the communication channel. In QubiShield, the
                  measured value is compared with an educational threshold
                  to demonstrate when a simulated key exchange should be
                  aborted.
                </p>
                <div className="space-y-2.5 mt-4">
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      QBER alone does not prove whether eavesdropping
                      occurred — channel noise can also contribute.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Low QBER does not guarantee security in all
                      circumstances.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5" />
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      If no test bits are available, QBER is undefined
                      rather than zero.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-violet-500 mt-1.5" />
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      The threshold used in QubiShield is an illustrative
                      educational setting, not a universal security
                      guarantee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      {/* ── APPLICATIONS ────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 sm:py-28">
        <Section>
          <SectionHeading
            tag="Real-World Use"
            title="Applications of Quantum Key Distribution"
            subtitle="QKD is a specialized technology being explored and deployed in particular communication systems around the world."
          />
        </Section>

        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          <AppCard
            icon={BankIcon}
            title="Banking & Finance"
            description="Explored for protecting key exchange in sensitive financial communication networks."
            delay={0}
          />
          <AppCard
            icon={ShieldIcon}
            title="Government & Critical Infrastructure"
            description="Investigated for secure communication links involving sensitive information and important infrastructure."
            delay={120}
          />
          <AppCard
            icon={FiberIcon}
            title="Optical Fiber Networks"
            description="Used in specialized fiber-optic systems to distribute cryptographic keys between connected locations."
            delay={240}
          />
          <AppCard
            icon={SatelliteIcon}
            title="Satellite & Free-Space Communication"
            description="Researched for distributing keys over optical links between distant locations, including satellite-based communication."
            delay={360}
          />
        </div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      {/* ── HOW QUBISHIELD WORKS — TIMELINE ──────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 sm:py-28">
        <Section>
          <SectionHeading
            tag="Simulation"
            title="Explore the BB84 Protocol"
            subtitle="QubiShield walks through each stage of the BB84 protocol in an interactive 3D simulation."
          />
        </Section>

        <Section delay={100}>
          <div className="max-w-2xl">
            {[
              {
                step: "01",
                title: "Alice Prepares",
                description:
                  "Alice generates random bits and randomly selects encoding bases to prepare quantum states.",
              },
              {
                step: "02",
                title: "Quantum Transmission",
                description:
                  "The prepared qubits travel through the simulated communication channel.",
              },
              {
                step: "03",
                title: "Eve Intercepts",
                description:
                  "When enabled, Eve attempts to measure and resend selected qubits. Incorrect-basis measurements can disturb the state.",
              },
              {
                step: "04",
                title: "Bob Measures",
                description:
                  "Bob measures received qubits using randomly selected bases.",
              },
              {
                step: "05",
                title: "Basis Reconciliation",
                description:
                  "Alice and Bob compare basis choices and retain only positions where their bases match.",
              },
              {
                step: "06",
                title: "Error Detection",
                description:
                  "They compare a sample of sifted bits and calculate QBER to estimate the error rate.",
              },
            ].map((s, i, arr) => (
              <TimelineStep
                key={s.step}
                step={s.step}
                title={s.title}
                description={s.description}
                isLast={i === arr.length - 1}
                delay={i * 100}
              />
            ))}
          </div>
        </Section>

        <Section delay={300}>
          <div className="mt-8">
            <Link
              href="/simulation"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-medium tracking-wider uppercase bg-violet-600 hover:bg-violet-500 text-white transition-colors duration-300 shadow-lg shadow-violet-600/20"
            >
              Explore Simulation
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </Section>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />

      {/* ── PROJECT PURPOSE ──────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 sm:px-10 py-20 sm:py-28">
        <Section>
          <SectionHeading tag="Purpose" title="Project Purpose" />
        </Section>

        <Section delay={100}>
          <div className="max-w-3xl space-y-5">
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              QubiShield was developed as a mini-project to make the
              principles of BB84 easier to understand through interactive
              visualization.
            </p>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
              The simulation demonstrates quantum state preparation,
              measurement, eavesdropping, basis reconciliation, and error
              detection.
            </p>
          </div>
        </Section>

        <Section delay={200}>
          <div className="mt-10 rounded-xl border border-amber-500/15 bg-amber-950/10 p-5 sm:p-6 max-w-3xl">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-amber-400 shrink-0 mt-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <p className="text-xs sm:text-sm text-amber-200/70 leading-relaxed">
                QubiShield is an educational simulation. It does not
                implement a production cryptographic system or provide
                guaranteed secure key generation.
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* ── FOOTER ──────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.04] py-10">
        <div className="max-w-5xl mx-auto px-6 sm:px-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-600 font-mono tracking-wider">
            QubiShield — BB84 Quantum Cryptography Simulation
          </p>
          <div className="flex items-center gap-6 text-xs text-zinc-600">
            <Link href="/" className="hover:text-zinc-400 transition-colors">
              Home
            </Link>
            <Link
              href="/simulation"
              className="hover:text-zinc-400 transition-colors"
            >
              Simulation
            </Link>
            <Link
              href="/characters"
              className="hover:text-zinc-400 transition-colors"
            >
              Characters
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
