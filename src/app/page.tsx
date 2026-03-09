import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  FlaskConical,
  Brain,
  ShieldCheck,
  Zap,
  ArrowRight,
  Star,
  Microscope,
  Leaf,
} from "lucide-react";

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Matching",
    desc: "Our hybrid engine collects your profile via smart tiles, then uses GPT-4o to ask the right follow-up questions and match supplements to your biology.",
    color: "text-siq-blue",
    bg: "bg-blue-dim",
    border: "border-siq-blue/20",
  },
  {
    icon: FlaskConical,
    title: "Rigorous Vetting",
    desc: "Every product is scored on purity, bioavailability, evidence depth, and third-party certifications. We only recommend what passes our internal rubric.",
    color: "text-accent",
    bg: "bg-accent-dim",
    border: "border-accent/20",
  },
  {
    icon: ShieldCheck,
    title: "Interaction Screening",
    desc: "We cross-reference your medications and conditions against known interactions. Safety first, always.",
    color: "text-siq-teal",
    bg: "bg-siq-teal/10",
    border: "border-siq-teal/20",
  },
  {
    icon: Microscope,
    title: "Evidence-Based",
    desc: "Each recommendation links to clinical evidence. We rate by RCT strength, not marketing claims. You see why we recommend what we recommend.",
    color: "text-siq-purple",
    bg: "bg-purple-dim",
    border: "border-siq-purple/20",
  },
];

const SAMPLE_SUPPLEMENTS = [
  {
    name: "Magnesium L-Threonate",
    brand: "Magtein\u00ae Form",
    match: 96,
    tags: ["Cognition", "Sleep"],
    effects: ["Cognitive Clarity", "Sleep Quality"],
    colorClass: "text-accent",
    borderClass: "border-accent/20",
    bgClass: "bg-accent/5",
  },
  {
    name: "Omega-3 (TG Form)",
    brand: "IFOS 5-Star",
    match: 91,
    tags: ["Brain", "Anti-inflammatory"],
    effects: ["Inflammation", "Cardiovascular"],
    colorClass: "text-siq-blue",
    borderClass: "border-siq-blue/20",
    bgClass: "bg-siq-blue/5",
  },
  {
    name: "Ashwagandha KSM-66",
    brand: "KSM-66\u00ae",
    match: 87,
    tags: ["Stress", "Sleep"],
    effects: ["Cortisol", "Anxiety"],
    colorClass: "text-siq-orange",
    borderClass: "border-siq-orange/20",
    bgClass: "bg-siq-orange/5",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Smart Tiles",
    desc: "Select your goals, diet, and lifestyle from interactive tiles. Takes 60 seconds.",
    icon: Zap,
  },
  {
    num: "02",
    title: "AI Deep-Dive",
    desc: "Our chatbot asks follow-up questions tailored to your selections. No generic quiz.",
    icon: Brain,
  },
  {
    num: "03",
    title: "Your Stack",
    desc: "Get personalized, vetted supplement recommendations with evidence and dosing.",
    icon: Leaf,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-base">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="animate-fade-up">
              <div className="inline-flex items-center gap-2 bg-accent-dim border border-accent/30 rounded-md px-3 py-1 mb-6">
                <Star size={12} className="text-accent" />
                <span className="text-accent text-[10px] font-mono tracking-[0.15em]">
                  SUPPLEMENT INTELLIGENCE &middot; INDIA&apos;S FIRST
                </span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[52px] font-black leading-[1.1] tracking-tight mb-6">
                The supplement aisle
                <br />
                is lying to you.
                <br />
                <span className="text-accent italic">We decoded it.</span>
              </h1>

              <p className="text-muted text-base sm:text-lg leading-relaxed max-w-lg mb-8">
                Every recommendation is matched to{" "}
                <em className="text-fg/60">your biology</em>, sourced from
                peer-reviewed clinical literature, and scored against rigorous
                vetting criteria. No marketing. No affiliate bias.
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                <Link
                  href="/auth/signup"
                  className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-[#06060E] font-mono text-xs font-bold tracking-wider px-7 py-4 rounded-xl transition-all shadow-[0_0_32px_rgba(186,255,41,0.2)] animate-pulse-glow"
                >
                  BUILD MY STACK
                  <ArrowRight size={14} />
                </Link>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center gap-2 border border-stroke hover:border-stroke-hi text-muted hover:text-fg font-mono text-xs px-6 py-4 rounded-xl transition-all"
                >
                  HOW IT WORKS
                </a>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {[
                  "40,000+ studies indexed",
                  "Zero affiliate commissions",
                  "~3 min to your first rec",
                  "India-specific dosing",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-accent/60" />
                    <span className="text-muted text-[11px] font-mono">
                      {t}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Sample Stack Preview */}
            <div
              className="animate-fade-up"
              style={{ animationDelay: "0.15s" }}
            >
              <div className="bg-card border border-stroke rounded-2xl overflow-hidden">
                <div className="px-5 py-4 border-b border-stroke flex justify-between items-center">
                  <span className="text-muted text-[10px] font-mono tracking-[0.12em]">
                    SAMPLE STACK PREVIEW
                  </span>
                  <span className="text-accent text-[10px] font-mono">
                    3 RECS
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  {SAMPLE_SUPPLEMENTS.map((s, i) => (
                    <div
                      key={s.name}
                      className={`p-4 rounded-xl border transition-all ${
                        i === 0
                          ? `${s.bgClass} ${s.borderClass}`
                          : "bg-faint border-stroke"
                      }`}
                      style={{
                        filter: i > 0 ? `blur(${i * 2.5 + 1}px)` : "none",
                        opacity: 1 - i * 0.1,
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div
                            className={`${s.colorClass} text-[9px] font-mono tracking-wider mb-1`}
                          >
                            {s.brand}
                          </div>
                          <div
                            className={`${
                              i === 0 ? "text-fg" : "text-fg/30"
                            } text-sm font-semibold`}
                          >
                            {s.name}
                          </div>
                          <div className="flex gap-1.5 mt-2">
                            {s.effects.map((e) => (
                              <span
                                key={e}
                                className="bg-white/5 rounded px-1.5 py-0.5 text-muted text-[9px] font-mono"
                              >
                                {e}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-center">
                          <div
                            className={`${
                              i === 0 ? s.colorClass : "text-transparent"
                            } text-xl font-mono font-bold`}
                          >
                            {s.match}
                          </div>
                          <div
                            className={`${
                              i === 0 ? "text-muted" : "text-transparent"
                            } text-[8px] font-mono`}
                          >
                            MATCH
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-stroke">
                  <Link
                    href="/auth/signup"
                    className="block w-full bg-accent hover:bg-accent/90 text-[#06060E] text-center font-mono text-[11px] font-bold tracking-wider py-3 rounded-lg transition-all"
                  >
                    UNLOCK YOUR PERSONAL STACK &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 border-t border-stroke">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-accent text-[10px] font-mono tracking-[0.2em] block mb-3">
              HOW IT WORKS
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-fg">
              3 steps. 3 minutes.
              <br />
              <span className="text-accent italic">
                Your science-backed stack.
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="relative bg-card border border-stroke rounded-2xl p-6 hover:border-accent/20 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-accent/30 text-3xl font-mono font-bold">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 bg-accent-dim border border-accent/20 rounded-lg flex items-center justify-center group-hover:bg-accent/20 transition">
                    <step.icon size={18} className="text-accent" />
                  </div>
                </div>
                <h3 className="text-fg text-lg font-semibold mb-2">
                  {step.title}
                </h3>
                <p className="text-muted text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section className="py-20 border-t border-stroke">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <span className="text-accent text-[10px] font-mono tracking-[0.2em] block mb-3">
              WHY STACKIQ
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-fg">
              Not another supplement quiz.
              <br />
              <span className="text-accent italic">
                A recommendation engine.
              </span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`${f.bg} border ${f.border} rounded-2xl p-6 hover:scale-[1.01] transition-transform`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 ${f.bg} border ${f.border} rounded-lg flex items-center justify-center`}
                  >
                    <f.icon size={18} className={f.color} />
                  </div>
                  <h3 className="text-fg text-lg font-semibold">{f.title}</h3>
                </div>
                <p className="text-muted text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-24 border-t border-stroke">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(186,255,41,0.25)]">
            <span className="text-[#06060E] text-2xl font-black">&#9672;</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-fg mb-4">
            Ready to stop guessing?
          </h2>
          <p className="text-muted text-base leading-relaxed mb-8 max-w-lg mx-auto">
            Start with a 3-minute assessment. Get your first recommendation
            instantly. No credit card. No spam. Just science.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-[#06060E] font-mono text-sm font-bold tracking-wider px-8 py-4 rounded-xl transition-all shadow-[0_0_32px_rgba(186,255,41,0.2)]"
          >
            BUILD MY STACK
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer className="border-t border-stroke py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-accent rounded flex items-center justify-center">
              <span className="text-[#06060E] text-[10px] font-black">&#9672;</span>
            </div>
            <span className="text-muted text-xs font-mono">
              STACKIQ &copy; 2026
            </span>
          </div>
          <div className="flex gap-6 text-muted text-xs font-mono">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
          <p className="text-muted/50 text-[10px] font-mono text-center sm:text-right">
            Not medical advice. Consult your doctor.
          </p>
        </div>
      </footer>
    </div>
  );
}
