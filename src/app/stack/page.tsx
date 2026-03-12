"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  TEST_SUPPLEMENTS,
  getColorSet,
  getTotalCostRange,
  type Supplement,
} from "@/lib/supplements";
import {
  ArrowRight,
  AlertTriangle,
  Info,
  Clock,
  Pill,
  Beaker,
  TrendingUp,
  ChevronDown,
  Shield,
  Sparkles,
  FlaskConical,
  RotateCcw,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════
   REUSABLE CONTAINER — guarantees centering via inline styles
   ═══════════════════════════════════════════════════════════════════════════ */

function Container({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      style={{ maxWidth: "52rem", marginLeft: "auto", marginRight: "auto", paddingLeft: "1.5rem", paddingRight: "1.5rem" }}
      className={className}
    >
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   EFFECT BAR
   ═══════════════════════════════════════════════════════════════════════════ */

function EffectBar({
  label,
  score,
  color,
  delay,
}: {
  label: string;
  score: number;
  color: string;
  delay: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0" }}>
      <span style={{ width: "140px", flexShrink: 0, fontSize: "0.8125rem", color: "rgba(17,24,39,0.7)" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "6px", backgroundColor: "rgba(0,0,0,0.06)", borderRadius: "3px", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${score}%`,
            backgroundColor: color,
            borderRadius: "3px",
            transition: "width 0.8s ease",
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
      <span style={{ width: "28px", textAlign: "right", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: "rgba(17,24,39,0.5)" }}>
        {score}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COLOR MAP — hex values for inline styles (avoids Tailwind v4 issues)
   ═══════════════════════════════════════════════════════════════════════════ */

const COLOR_HEX: Record<Supplement["accentColor"], string> = {
  green: "#16A34A",
  blue: "#2563EB",
  orange: "#EA580C",
  purple: "#7C3AED",
  teal: "#0D9488",
};

/* ═══════════════════════════════════════════════════════════════════════════
   SUPPLEMENT CARD
   ═══════════════════════════════════════════════════════════════════════════ */

function SupplementCard({ supp, rank }: { supp: Supplement; rank: number }) {
  const [open, setOpen] = useState(rank === 1);
  const [tab, setTab] = useState<"effects" | "why" | "dosing">("effects");
  const hex = COLOR_HEX[supp.accentColor];

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: "1rem",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.1)")}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(0,0,0,0.06)")}
    >
      {/* ── Card Header ───────────────────────────────────── */}
      <div style={{ padding: "1.5rem" }}>
        {/* Top row: rank + category + form */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.875rem" }}>
          <span style={{ fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(17,24,39,0.2)" }}>
            #{rank}
          </span>
          <span
            style={{
              fontSize: "0.625rem",
              fontFamily: "'IBM Plex Mono', monospace",
              fontWeight: 600,
              letterSpacing: "0.08em",
              color: hex,
              backgroundColor: `${hex}12`,
              padding: "0.125rem 0.5rem",
              borderRadius: "0.25rem",
            }}
          >
            {supp.category.toUpperCase()}
          </span>
          <span style={{ fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(17,24,39,0.3)" }}>
            {supp.form}
          </span>
        </div>

        {/* Name + Score */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.375rem", fontWeight: 700, color: "#111827", marginBottom: "0.375rem", lineHeight: 1.2 }}>
              {supp.name}
            </h3>
            <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.6 }}>
              {supp.oneLiner}
            </p>

            {/* Tags */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginTop: "0.75rem" }}>
              {supp.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: "0.625rem",
                    fontFamily: "'IBM Plex Mono', monospace",
                    color: "rgba(17,24,39,0.35)",
                    backgroundColor: "rgba(0,0,0,0.04)",
                    border: "1px solid rgba(0,0,0,0.06)",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "0.25rem",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Match Score */}
          <div
            style={{
              flexShrink: 0,
              width: "4.5rem",
              height: "4.5rem",
              borderRadius: "1rem",
              backgroundColor: `${hex}0A`,
              border: `1px solid ${hex}20`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "1.625rem", fontWeight: 700, color: hex, lineHeight: 1 }}>
              {supp.matchScore}
            </span>
            <span style={{ fontSize: "0.5rem", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(17,24,39,0.3)", letterSpacing: "0.12em", marginTop: "0.125rem" }}>
              MATCH
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "0.75rem",
            marginTop: "1.25rem",
            paddingTop: "1.25rem",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div>
            <div style={{ fontSize: "0.5625rem", fontFamily: "'IBM Plex Mono', monospace", color: "#6B7280", letterSpacing: "0.12em", marginBottom: "0.375rem" }}>
              EVIDENCE
            </div>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: i <= supp.evidenceLevel ? hex : "rgba(0,0,0,0.04)",
                    transition: "background-color 0.3s",
                  }}
                />
              ))}
            </div>
            <div style={{ fontSize: "0.625rem", color: "#6B7280", marginTop: "0.25rem" }}>
              {supp.evidenceLabel}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.5625rem", fontFamily: "'IBM Plex Mono', monospace", color: "#6B7280", letterSpacing: "0.12em", marginBottom: "0.375rem" }}>
              STUDIES
            </div>
            <div style={{ fontSize: "1.125rem", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: "#111827" }}>
              {supp.studyCount}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.5625rem", fontFamily: "'IBM Plex Mono', monospace", color: "#6B7280", letterSpacing: "0.12em", marginBottom: "0.375rem" }}>
              MONTHLY
            </div>
            <div style={{ fontSize: "0.875rem", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, color: "#111827" }}>
              {supp.costMonthly}
            </div>
          </div>
        </div>
      </div>

      {/* ── Expanded Section ──────────────────────────────── */}
      {open && (
        <>
          {/* Tabs */}
          <div style={{ display: "flex", borderTop: "1px solid rgba(0,0,0,0.06)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
            {(["effects", "why", "dosing"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1,
                  padding: "0.75rem 0",
                  fontSize: "0.6875rem",
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: "0.1em",
                  fontWeight: tab === t ? 700 : 400,
                  color: tab === t ? hex : "#6B7280",
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: tab === t ? `2px solid ${hex}` : "2px solid transparent",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                {t === "effects" ? "EFFECTS" : t === "why" ? "WHY YOU" : "DOSING"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ padding: "1.5rem" }}>
            {/* Effects Tab */}
            {tab === "effects" && (
              <div>
                {supp.effects.map((eff, i) => (
                  <EffectBar key={eff.label} label={eff.label} score={eff.score} color={hex} delay={i * 60} />
                ))}
              </div>
            )}

            {/* Why You Tab */}
            {tab === "why" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {supp.whyYou.map((w, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                    <div
                      style={{
                        flexShrink: 0,
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        marginTop: "0.5rem",
                        backgroundColor: w.strength === "HIGH" ? hex : "rgba(0,0,0,0.1)",
                      }}
                    />
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "#111827" }}>
                          {w.signal}
                        </span>
                        <span
                          style={{
                            fontSize: "0.5625rem",
                            fontFamily: "'IBM Plex Mono', monospace",
                            padding: "0.0625rem 0.375rem",
                            borderRadius: "0.1875rem",
                            color: w.strength === "HIGH" ? hex : "#6B7280",
                            backgroundColor: w.strength === "HIGH" ? `${hex}12` : "rgba(0,0,0,0.04)",
                          }}
                        >
                          {w.strength}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "#6B7280", lineHeight: 1.6 }}>
                        {w.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Dosing Tab */}
            {tab === "dosing" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.625rem", marginBottom: "1rem" }}>
                  {[
                    { label: "DOSE", value: supp.dosing.amount, Icon: Pill },
                    { label: "TIMING", value: supp.dosing.timing, Icon: Clock },
                    { label: "FORM", value: supp.dosing.form, Icon: Beaker },
                    { label: "ONSET", value: supp.dosing.onset, Icon: TrendingUp },
                  ].map((d) => (
                    <div
                      key={d.label}
                      style={{
                        backgroundColor: "rgba(0,0,0,0.02)",
                        borderRadius: "0.75rem",
                        padding: "0.875rem",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.375rem" }}>
                        <d.Icon size={11} color="#6B7280" />
                        <span style={{ fontSize: "0.5625rem", fontFamily: "'IBM Plex Mono', monospace", color: "#6B7280", letterSpacing: "0.1em" }}>
                          {d.label}
                        </span>
                      </div>
                      <div style={{ fontSize: "0.8125rem", color: "#111827", lineHeight: 1.4 }}>
                        {d.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cautions */}
                {supp.cautions.length > 0 && (
                  <div
                    style={{
                      backgroundColor: "rgba(0,0,0,0.02)",
                      border: "1px solid rgba(0,0,0,0.06)",
                      borderRadius: "0.75rem",
                      padding: "1rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.625rem" }}>
                      <AlertTriangle size={12} color="#EA580C" />
                      <span style={{ fontSize: "0.5625rem", fontFamily: "'IBM Plex Mono', monospace", color: "#EA580C", letterSpacing: "0.1em" }}>
                        CAUTIONS
                      </span>
                    </div>
                    {supp.cautions.map((c, i) => (
                      <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: i < supp.cautions.length - 1 ? "0.375rem" : 0 }}>
                        {c.severity === "danger" ? (
                          <AlertTriangle size={11} color="#DC2626" style={{ flexShrink: 0, marginTop: "0.1875rem" }} />
                        ) : c.severity === "warning" ? (
                          <AlertTriangle size={11} color="#EA580C" style={{ flexShrink: 0, marginTop: "0.1875rem" }} />
                        ) : (
                          <Info size={11} color="#6B7280" style={{ flexShrink: 0, marginTop: "0.1875rem" }} />
                        )}
                        <span style={{ fontSize: "0.75rem", color: "rgba(17,24,39,0.5)", lineHeight: 1.5 }}>
                          {c.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Expand/Collapse ───────────────────────────────── */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          padding: "0.75rem",
          borderTop: "1px solid rgba(0,0,0,0.06)",
          backgroundColor: "rgba(0,0,0,0.01)",
          border: "none",
          borderTopStyle: "solid",
          borderTopWidth: "1px",
          borderTopColor: "rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.375rem",
          fontSize: "0.6875rem",
          fontFamily: "'IBM Plex Mono', monospace",
          letterSpacing: "0.1em",
          color: "#6B7280",
          cursor: "pointer",
          transition: "color 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#111827")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#6B7280")}
      >
        <ChevronDown
          size={14}
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }}
        />
        {open ? "COLLAPSE" : "VIEW DETAILS"}
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STACK PAGE
   ═══════════════════════════════════════════════════════════════════════════ */

export default function StackPage() {
  const supplements = TEST_SUPPLEMENTS;
  const avgMatch = Math.round(supplements.reduce((a, s) => a + s.matchScore, 0) / supplements.length);
  const totalCost = getTotalCostRange(supplements);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <Navbar />

      {/* ── Hero Summary ──────────────────────────────────── */}
      <Container>
        <div style={{ paddingTop: "2.5rem", paddingBottom: "2rem" }}>
          {/* Top Row */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }} className="animate-fade-up">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={14} color="#16A34A" />
              <span style={{ fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.15em", color: "#16A34A" }}>
                YOUR PERSONALISED STACK
              </span>
            </div>
            <Link
              href="/chat"
              style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace", color: "#6B7280", textDecoration: "none", transition: "color 0.2s" }}
            >
              <RotateCcw size={12} />
              RETAKE
            </Link>
          </div>

          {/* Summary Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }} className="animate-fade-up">
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "0.75rem", padding: "1.25rem", textAlign: "center" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "2rem", fontWeight: 700, color: "#16A34A", lineHeight: 1 }}>
                {supplements.length}
              </div>
              <div style={{ fontSize: "0.5625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.12em", color: "#6B7280", marginTop: "0.375rem" }}>
                SUPPLEMENTS
              </div>
            </div>
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "0.75rem", padding: "1.25rem", textAlign: "center" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "2rem", fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                {avgMatch}%
              </div>
              <div style={{ fontSize: "0.5625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.12em", color: "#6B7280", marginTop: "0.375rem" }}>
                AVG MATCH
              </div>
            </div>
            <div style={{ backgroundColor: "#FFFFFF", border: "1px solid rgba(0,0,0,0.06)", borderRadius: "0.75rem", padding: "1.25rem", textAlign: "center" }}>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "1rem", fontWeight: 700, color: "#111827", lineHeight: 1, paddingTop: "0.375rem" }}>
                {totalCost}
              </div>
              <div style={{ fontSize: "0.5625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.12em", color: "#6B7280", marginTop: "0.375rem" }}>
                MONTHLY
              </div>
            </div>
          </div>

          {/* Based On Bar */}
          <div
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid rgba(0,0,0,0.06)",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "0 1rem",
            }}
            className="animate-fade-up"
          >
            <span style={{ fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.1em", color: "#6B7280" }}>
              BASED ON:
            </span>
            {["Energy & Focus", "Gut & Skin", "Male 26\u201335", "Omnivore", "Moderate Stress"].map((tag) => (
              <span key={tag} style={{ fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(17,24,39,0.5)" }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </Container>

      {/* ── Supplement Cards ──────────────────────────────── */}
      <Container>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingBottom: "2rem" }}>
          {supplements.map((supp, i) => (
            <div key={supp.id} className="animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.05}s` }}>
              <SupplementCard supp={supp} rank={i + 1} />
            </div>
          ))}
        </div>
      </Container>

      {/* ── Precision CTA ─────────────────────────────────── */}
      <Container>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px dashed rgba(22,163,74,0.15)",
            borderRadius: "1rem",
            padding: "2rem",
            textAlign: "center",
            marginBottom: "1rem",
          }}
          className="animate-fade-up"
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
            <Shield size={16} color="#16A34A" />
            <span style={{ fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.15em", color: "#16A34A" }}>
              PRECISION UNLOCK
            </span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#111827", marginBottom: "0.25rem" }}>
            Upload bloodwork to unlock 5 more recommendations
          </p>
          <p style={{ fontSize: "0.75rem", color: "#6B7280", marginBottom: "1.25rem" }}>
            Vitamin D, B12, Ferritin &mdash; takes 2 minutes
          </p>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              backgroundColor: "#16A34A",
              color: "#FFFFFF",
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: "0.6875rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            UPLOAD BLOODWORK
            <ArrowRight size={14} />
          </button>
        </div>
      </Container>

      {/* ── Locked Supplements ────────────────────────────── */}
      <Container>
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid rgba(0,0,0,0.06)",
            borderRadius: "1rem",
            padding: "1.5rem",
            textAlign: "center",
            marginBottom: "2rem",
          }}
          className="animate-fade-up"
        >
          <div style={{ fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.15em", color: "#6B7280", marginBottom: "1rem" }}>
            LOCKED &mdash; NEEDS MORE DATA
          </div>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "1.25rem" }}>
            {["Omega-3 TG Form", "Vitamin D3+K2", "Creatine Mono", "+3 more"].map((s, i) => (
              <div
                key={s}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "rgba(0,0,0,0.02)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "0.5rem",
                  filter: `blur(${1 + i * 1.5}px)`,
                  opacity: 0.5,
                }}
              >
                <span style={{ fontSize: "0.75rem", color: "#111827" }}>{s}</span>
              </div>
            ))}
          </div>
          <Link
            href="/chat"
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace", color: "#16A34A", textDecoration: "none" }}
          >
            <FlaskConical size={12} />
            REFINE YOUR PROFILE TO UNLOCK
          </Link>
        </div>
      </Container>

      {/* ── Disclaimer ────────────────────────────────────── */}
      <Container>
        <p style={{ textAlign: "center", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(107,114,128,0.5)", lineHeight: 1.6, paddingBottom: "3rem" }}>
          Disclaimer: StackIQ provides educational information only. This is not medical advice.
          Always consult a qualified healthcare provider before starting any supplement regimen.
        </p>
      </Container>
    </div>
  );
}
