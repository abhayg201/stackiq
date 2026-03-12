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
    hex: "#60C8FF",
  },
  {
    icon: FlaskConical,
    title: "Rigorous Vetting",
    desc: "Every product is scored on purity, bioavailability, evidence depth, and third-party certifications. We only recommend what passes our internal rubric.",
    hex: "#BAFF29",
  },
  {
    icon: ShieldCheck,
    title: "Interaction Screening",
    desc: "We cross-reference your medications and conditions against known interactions. Safety first, always.",
    hex: "#2DD4BF",
  },
  {
    icon: Microscope,
    title: "Evidence-Based",
    desc: "Each recommendation links to clinical evidence. We rate by RCT strength, not marketing claims. You see why we recommend what we recommend.",
    hex: "#C084FC",
  },
];

const SAMPLE_SUPPLEMENTS = [
  { name: "Magnesium L-Threonate", brand: "Magtein\u00ae Form", match: 96, effects: ["Cognitive Clarity", "Sleep Quality"], hex: "#BAFF29" },
  { name: "Omega-3 (TG Form)", brand: "IFOS 5-Star", match: 91, effects: ["Inflammation", "Cardiovascular"], hex: "#60C8FF" },
  { name: "Ashwagandha KSM-66", brand: "KSM-66\u00ae", match: 87, effects: ["Cortisol", "Anxiety"], hex: "#FF9B50" },
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
    <div style={{ minHeight: "100vh", backgroundColor: "#06060E" }}>
      {/* Responsive grid overrides — inline styles can't do media queries */}
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
                    backgroundColor: "rgba(186,255,41,0.08)",
                    border: "1px solid rgba(186,255,41,0.25)",
                    borderRadius: "0.375rem",
                    padding: "0.25rem 0.75rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <Star size={12} color="#BAFF29" />
                  <span style={{ color: "#BAFF29", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.15em" }}>
                    SUPPLEMENT INTELLIGENCE &middot; INDIA&apos;S FIRST
                  </span>
                </div>

                <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "2.75rem", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.01em", color: "#F0EEF8", marginBottom: "1.5rem" }}>
                  The supplement aisle
                  <br />
                  is lying to you.
                  <br />
                  <span style={{ color: "#BAFF29", fontStyle: "italic" }}>We decoded it.</span>
                </h1>

                <p style={{ color: "rgba(82,81,106,1)", fontSize: "1rem", lineHeight: 1.7, maxWidth: "28rem", marginBottom: "2rem" }}>
                  Every recommendation is matched to{" "}
                  <em style={{ color: "rgba(240,238,248,0.6)" }}>your biology</em>, sourced from
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
                      backgroundColor: "#BAFF29",
                      color: "#06060E",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      letterSpacing: "0.08em",
                      padding: "1rem 1.75rem",
                      borderRadius: "0.75rem",
                      textDecoration: "none",
                      boxShadow: "0 0 32px rgba(186,255,41,0.15)",
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
                      border: "1px solid rgba(255,255,255,0.07)",
                      color: "rgba(82,81,106,1)",
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
                      <div style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "rgba(186,255,41,0.5)" }} />
                      <span style={{ color: "rgba(82,81,106,1)", fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace" }}>{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Sample Stack Preview */}
              <div className="animate-fade-up" style={{ animationDelay: "0.15s" }}>
                <div style={{ backgroundColor: "rgba(17,17,34,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "1rem", overflow: "hidden" }}>
                  {/* Card header */}
                  <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "rgba(82,81,106,1)", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.12em" }}>SAMPLE STACK PREVIEW</span>
                    <span style={{ color: "#BAFF29", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace" }}>3 RECS</span>
                  </div>

                  {/* Supplements */}
                  <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {SAMPLE_SUPPLEMENTS.map((s, i) => (
                      <div
                        key={s.name}
                        style={{
                          padding: "1rem",
                          borderRadius: "0.75rem",
                          border: i === 0 ? `1px solid ${s.hex}20` : "1px solid rgba(255,255,255,0.04)",
                          backgroundColor: i === 0 ? `${s.hex}08` : "rgba(28,28,48,1)",
                          filter: i > 0 ? `blur(${i * 2.5 + 1}px)` : "none",
                          opacity: 1 - i * 0.1,
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ color: s.hex, fontSize: "0.5625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", marginBottom: "0.25rem" }}>{s.brand}</div>
                            <div style={{ color: i === 0 ? "#F0EEF8" : "rgba(240,238,248,0.3)", fontSize: "0.875rem", fontWeight: 600 }}>{s.name}</div>
                            <div style={{ display: "flex", gap: "0.375rem", marginTop: "0.5rem" }}>
                              {s.effects.map((e) => (
                                <span key={e} style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "0.25rem", padding: "0.125rem 0.375rem", color: "rgba(82,81,106,1)", fontSize: "0.5625rem", fontFamily: "'IBM Plex Mono', monospace" }}>{e}</span>
                              ))}
                            </div>
                          </div>
                          <div style={{ textAlign: "center" }}>
                            <div style={{ color: i === 0 ? s.hex : "transparent", fontSize: "1.25rem", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>{s.match}</div>
                            <div style={{ color: i === 0 ? "rgba(82,81,106,1)" : "transparent", fontSize: "0.5rem", fontFamily: "'IBM Plex Mono', monospace" }}>MATCH</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                    <Link
                      href="/auth/signup"
                      style={{
                        display: "block",
                        width: "100%",
                        backgroundColor: "#BAFF29",
                        color: "#06060E",
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
      <section id="how-it-works" style={{ paddingTop: "5rem", paddingBottom: "5rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <Container>
          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ display: "block", color: "#BAFF29", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.2em", marginBottom: "0.75rem" }}>HOW IT WORKS</span>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "2rem", fontWeight: 700, color: "#F0EEF8" }}>
              3 steps. 3 minutes.
              <br />
              <span style={{ color: "#BAFF29", fontStyle: "italic" }}>Your science-backed stack.</span>
            </h2>
          </div>

          {/* Step cards */}
          <div className="steps-grid">
            {STEPS.map((step) => (
              <div
                key={step.num}
                style={{
                  backgroundColor: "rgba(17,17,34,0.6)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  transition: "border-color 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                  <span style={{ color: "rgba(186,255,41,0.25)", fontSize: "1.5rem", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700 }}>{step.num}</span>
                  <div style={{ width: "36px", height: "36px", backgroundColor: "rgba(186,255,41,0.08)", border: "1px solid rgba(186,255,41,0.15)", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <step.icon size={16} color="#BAFF29" />
                  </div>
                </div>
                <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#F0EEF8", marginBottom: "0.5rem" }}>{step.title}</h3>
                <p style={{ fontSize: "0.8125rem", color: "rgba(82,81,106,1)", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────── */}
      <section style={{ paddingTop: "5rem", paddingBottom: "5rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <Container>
          {/* Heading */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <span style={{ display: "block", color: "#BAFF29", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.2em", marginBottom: "0.75rem" }}>WHY STACKIQ</span>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "2rem", fontWeight: 700, color: "#F0EEF8" }}>
              Not another supplement quiz.
              <br />
              <span style={{ color: "#BAFF29", fontStyle: "italic" }}>A recommendation engine.</span>
            </h2>
          </div>

          {/* Feature cards */}
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                style={{
                  backgroundColor: `${f.hex}08`,
                  border: `1px solid ${f.hex}18`,
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  transition: "transform 0.2s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div style={{ width: "36px", height: "36px", backgroundColor: `${f.hex}10`, border: `1px solid ${f.hex}18`, borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <f.icon size={16} color={f.hex} />
                  </div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 600, color: "#F0EEF8" }}>{f.title}</h3>
                </div>
                <p style={{ fontSize: "0.8125rem", color: "rgba(82,81,106,1)", lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section style={{ paddingTop: "5rem", paddingBottom: "5rem", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <Container>
          <div style={{ maxWidth: "32rem", marginLeft: "auto", marginRight: "auto", textAlign: "center" }}>
            <div
              style={{
                width: "3.5rem",
                height: "3.5rem",
                backgroundColor: "#BAFF29",
                borderRadius: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.5rem",
                boxShadow: "0 0 40px rgba(186,255,41,0.2)",
              }}
            >
              <span style={{ color: "#06060E", fontSize: "1.5rem", fontWeight: 900 }}>&#9672;</span>
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: "2rem", fontWeight: 700, color: "#F0EEF8", marginBottom: "1rem" }}>
              Ready to stop guessing?
            </h2>
            <p style={{ color: "rgba(82,81,106,1)", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
              Start with a 3-minute assessment. Get your first recommendation
              instantly. No credit card. No spam. Just science.
            </p>
            <Link
              href="/auth/signup"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                backgroundColor: "#BAFF29",
                color: "#06060E",
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: "0.875rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                padding: "1rem 2rem",
                borderRadius: "0.75rem",
                textDecoration: "none",
                boxShadow: "0 0 32px rgba(186,255,41,0.15)",
              }}
            >
              BUILD MY STACK
              <ArrowRight size={16} />
            </Link>
          </div>
        </Container>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.04)", padding: "2rem 0" }}>
        <Container>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "20px", height: "20px", backgroundColor: "#BAFF29", borderRadius: "0.25rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#06060E", fontSize: "0.625rem", fontWeight: 900 }}>&#9672;</span>
              </div>
              <span style={{ color: "rgba(82,81,106,1)", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace" }}>STACKIQ &copy; 2026</span>
            </div>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <span style={{ color: "rgba(82,81,106,1)", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace" }}>Privacy</span>
              <span style={{ color: "rgba(82,81,106,1)", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace" }}>Terms</span>
              <span style={{ color: "rgba(82,81,106,1)", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace" }}>Contact</span>
            </div>
            <p style={{ color: "rgba(82,81,106,0.4)", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace" }}>
              Not medical advice. Consult your doctor.
            </p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
