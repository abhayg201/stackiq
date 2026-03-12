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
    hex: "#2563EB",
  },
  {
    icon: FlaskConical,
    title: "Rigorous Vetting",
    desc: "Every product is scored on purity, bioavailability, evidence depth, and third-party certifications. We only recommend what passes our internal rubric.",
    hex: "#16A34A",
  },
  {
    icon: ShieldCheck,
    title: "Interaction Screening",
    desc: "We cross-reference your medications and conditions against known interactions. Safety first, always.",
    hex: "#0D9488",
  },
  {
    icon: Microscope,
    title: "Evidence-Based",
    desc: "Each recommendation links to clinical evidence. We rate by RCT strength, not marketing claims. You see why we recommend what we recommend.",
    hex: "#7C3AED",
  },
];

const SAMPLE_SUPPLEMENTS = [
  { name: "Magnesium L-Threonate", brand: "Magtein\u00ae Form", match: 96, effects: ["Cognitive Clarity", "Sleep Quality"], hex: "#16A34A" },
  { name: "Omega-3 (TG Form)", brand: "IFOS 5-Star", match: 91, effects: ["Inflammation", "Cardiovascular"], hex: "#2563EB" },
  { name: "Ashwagandha KSM-66", brand: "KSM-66\u00ae", match: 87, effects: ["Cortisol", "Anxiety"], hex: "#EA580C" },
];

const STEPS = [
  { num: "01", title: "Smart Tiles", desc: "Select your goals, diet, and lifestyle from interactive tiles. Takes 60 seconds.", icon: Zap },
  { num: "02", title: "AI Deep-Dive", desc: "Our chatbot asks follow-up questions tailored to your selections. No generic quiz.", icon: Brain },
  { num: "03", title: "Your Stack", desc: "Get personalized, vetted supplement recommendations with evidence and dosing.", icon: Leaf },
];

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div style={{ maxWidth: "52rem", marginLeft: "auto", marginRight: "auto", paddingLeft: "1.5rem", paddingRight: "1.5rem" }} className={className}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <style>{`
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
        .steps-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
        .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <Container>
          <div style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
            <div className="hero-grid">
              {/* Left: Copy */}
              <div className="animate-fade-up">
                {/* Badge */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "rgba(22,163,74,0.06)",
                    border: "1px solid rgba(22,163,74,0.2)",
                    borderRadius: "9999px",
                    padding: "0.3rem 0.85rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <Star size={12} color="#16A34A" />
                  <span style={{ color: "#16A34A", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.15em" }}>
                    SUPPLEMENT INTELLIGENCE &middot; INDIA&apos;S FIRST
                  </span>
                </div>

                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "2.75rem", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.01em", color: "#111827", marginBottom: "1.5rem" }}>
                  The supplement aisle
                  <br />
                  is lying to you.
                  <br />
                  <span style={{ color: "#16A34A", fontStyle: "italic" }}>We decoded it.</span>
                </h1>

                <p style={{ color: "#6B7280", fontSize: "1rem", lineHeight: 1.7, maxWidth: "28rem", marginBottom: "2rem" }}>
                  Every recommendation is matched to{" "}
                  <em style={{ color: "#374151", fontStyle: "normal", fontWeight: 500 }}>your biology</em>, sourced from
                  peer-reviewed clinical literature, and scored against rigorous
                  vetting criteria. No marketing. No affiliate bias.
                </p>

                {/* CTAs */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "2rem" }}>
                  <Link
                    href="/auth/signup"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      backgroundColor: "#16A34A",
                      color: "#FFFFFF",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      padding: "1rem 1.75rem",
                      borderRadius: "0.75rem",
                      textDecoration: "none",
                    }}
                  >
                    BUILD MY STACK
                    <ArrowRight size={14} />
                  </Link>
                  <a
                    href="#how-it-works"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      border: "1px solid rgba(0,0,0,0.1)",
                      color: "#6B7280",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.75rem",
                      padding: "1rem 1.5rem",
                      borderRadius: "0.75rem",
                      textDecoration: "none",
                    }}
                  >
                    HOW IT WORKS
                  </a>
                </div>

                {/* Trust signals */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem 1.25rem" }}>
                  {["40,000+ studies indexed", "Zero affiliate commissions", "~3 min to your first rec", "India-specific dosing"].map((t) => (
                    <div key={t} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <div style={{ width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#16A34A" }} />
                      <span style={{ color: "#9CA3AF", fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace" }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Sample Stack Preview */}
              <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
                <div style={{ backgroundColor: "#FAFAFA", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "1rem", overflow: "hidden" }}>
                  {/* Card header */}
                  <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "#9CA3AF", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.12em" }}>SAMPLE STACK PREVIEW</span>
                    <span style={{ color: "#16A34A", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace" }}>3 RECS</span>
                  </div>

                  {/* Supplements */}
                  <div style={{ padding: "0.75rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {SAMPLE_SUPPLEMENTS.map((s, i) => (
                      <div
                        key={s.name}
                        style={{
                          padding: "1rem",
                          borderRadius: "0.75rem",
                          border: i === 0 ? `1px solid ${s.hex}30` : "1px solid rgba(0,0,0,0.04)",
                          backgroundColor: i === 0 ? `${s.hex}08` : "#FFFFFF",
                          filter: i > 0 ? `blur(${i * 2 + 1}px)` : "none",
                          opacity: 1 - i * 0.08,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ color: s.hex, fontSize: "0.5625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>{s.brand}</div>
                            <div style={{ color: i === 0 ? "#111827" : "#9CA3AF", fontSize: "0.875rem", fontWeight: 600 }}>{s.name}</div>
                            <div style={{ display: "flex", gap: "0.375rem", marginTop: "0.5rem" }}>
                              {s.effects.map((e) => (
                                <span key={e} style={{ backgroundColor: "rgba(0,0,0,0.04)", borderRadius: "0.25rem", padding: "0.125rem 0.375rem", color: "#9CA3AF", fontSize: "0.5625rem", fontFamily: "'IBM Plex Mono', monospace" }}>{e}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ color: i === 0 ? s.hex : "transparent", fontSize: "1.25rem", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>{s.match}</div>
                            <div style={{ color: i === 0 ? "#9CA3AF" : "transparent", fontSize: "0.5rem", fontFamily: "'IBM Plex Mono', monospace" }}>MATCH</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div style={{ padding: "0.75rem", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                    <Link
                      href="/auth/signup"
                      style={{
                        display: "block",
                        width: "100%",
                        backgroundColor: "#16A34A",
                        color: "#FFFFFF",
                        textAlign: "center",
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        padding: "0.75rem",
                        borderRadius: "0.5rem",
                        textDecoration: "none",
                      }}
                    >
                      UNLOCK YOUR PERSONAL STACK &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────── */}
      <section id="how-it-works" style={{ paddingTop: "5rem", paddingBottom: "5rem", backgroundColor: "#F9FAFB" }}>
        <Container>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ display: "block", color: "#16A34A", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.2em", marginBottom: "0.75rem" }}>HOW IT WORKS</span>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "2rem", fontWeight: 700, color: "#111827" }}>
              3 steps. 3 minutes.
              <br />
              <span style={{ color: "#16A34A", fontStyle: "italic" }}>Your science-backed stack.</span>
            </h2>
          </div>

          <div className="steps-grid">
            {STEPS.map((step) => (
              <div
                key={step.num}
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <span style={{ color: "rgba(22,163,74,0.3)", fontSize: "1.5rem", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>{step.num}</span>
                  <div style={{ width: "36px", height: "36px", backgroundColor: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.12)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <step.icon size={16} color="#16A34A" />
                  </div>
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827", marginBottom: "0.5rem" }}>{step.title}</h3>
                <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section style={{ paddingTop: "5rem", paddingBottom: "5rem" }}>
        <Container>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ display: "block", color: "#16A34A", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.2em", marginBottom: "0.75rem" }}>WHY STACKIQ</span>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "2rem", fontWeight: 700, color: "#111827" }}>
              Not another supplement quiz.
              <br />
              <span style={{ color: "#16A34A", fontStyle: "italic" }}>A recommendation engine.</span>
            </h2>
          </div>

          <div className="features-grid">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  backgroundColor: `${f.hex}06`,
                  border: `1px solid ${f.hex}15`,
                  borderRadius: "1rem",
                  padding: "1.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div style={{ width: "36px", height: "36px", backgroundColor: `${f.hex}0D`, border: `1px solid ${f.hex}18`, borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <f.icon size={16} color={f.hex} />
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#111827" }}>{f.title}</h3>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section style={{ paddingTop: "5rem", paddingBottom: "5rem", backgroundColor: "#F0FDF4" }}>
        <Container>
          <div style={{ maxWidth: "32rem", marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
            <div
              style={{
                width: "3.5rem",
                height: "3.5rem",
                backgroundColor: "#16A34A",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
              }}
            >
              <span style={{ color: "#FFFFFF", fontSize: "1.5rem", fontWeight: 900 }}>&#9672;</span>
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "2rem", fontWeight: 700, color: "#111827", marginBottom: "1rem" }}>
              Ready to stop guessing?
            </h2>
            <p style={{ color: "#6B7280", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
              Start with a 3-minute assessment. Get your first recommendation
              instantly. No credit card. No spam. Just science.
            </p>
            <Link
              href="/auth/signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#16A34A",
                color: "#FFFFFF",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.875rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "1rem 2rem",
                borderRadius: "0.75rem",
                textDecoration: "none",
              }}
            >
              BUILD MY STACK
              <ArrowRight size={16} />
            </Link>
          </div>
        </Container>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(0,0,0,0.06)", padding: "2rem 0" }}>
        <Container>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "20px", height: "20px", backgroundColor: "#16A34A", borderRadius: "0.25rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#FFFFFF", fontSize: "0.625rem", fontWeight: 900 }}>&#9672;</span>
              </div>
              <span style={{ color: "#9CA3AF", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace" }}>STACKIQ &copy; 2026</span>
            </div>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <span style={{ color: "#9CA3AF", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace" }}>Privacy</span>
              <span style={{ color: "#9CA3AF", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace" }}>Terms</span>
              <span style={{ color: "#9CA3AF", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace" }}>Contact</span>
            </div>
            <p style={{ color: "#D1D5DB", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace" }}>
              Not medical advice. Consult your doctor.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
