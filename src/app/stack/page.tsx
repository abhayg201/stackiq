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

// ── Effect Bar ───────────────────────────────────────────────────────────────

function EffectBar({
  label,
  score,
  barClass,
  textClass,
  delay,
}: {
  label: string;
  score: number;
  barClass: string;
  textClass: string;
  delay: number;
}) {
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-fg/80 text-[13px]">{label}</span>
        <span className={`${textClass} text-xs font-mono font-semibold`}>
          {score}
        </span>
      </div>
      <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className={`h-full ${barClass} rounded-full transition-all duration-1000 ease-out`}
          style={{
            width: `${score}%`,
            transitionDelay: `${delay}ms`,
          }}
        />
      </div>
    </div>
  );
}

// ── Evidence Dots ────────────────────────────────────────────────────────────

function EvidenceDots({
  level,
  barClass,
}: {
  level: number;
  barClass: string;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all ${
            i <= level ? `${barClass} shadow-sm` : "bg-white/[0.06]"
          }`}
        />
      ))}
    </div>
  );
}

// ── Caution Icon ─────────────────────────────────────────────────────────────

function CautionIcon({ severity }: { severity: string }) {
  if (severity === "danger")
    return <AlertTriangle size={12} className="text-siq-red shrink-0 mt-0.5" />;
  if (severity === "warning")
    return <AlertTriangle size={12} className="text-siq-orange shrink-0 mt-0.5" />;
  return <Info size={12} className="text-muted shrink-0 mt-0.5" />;
}

// ── Supplement Card ──────────────────────────────────────────────────────────

function SupplementCard({
  supp,
  rank,
}: {
  supp: Supplement;
  rank: number;
}) {
  const [expanded, setExpanded] = useState(rank === 1);
  const c = getColorSet(supp.accentColor);

  return (
    <div
      className={`relative rounded-2xl border ${c.border} bg-card overflow-hidden transition-all duration-300 hover:border-white/[0.12]`}
    >
      {/* Subtle top gradient accent */}
      <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r ${c.gradient}`} />

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Rank + Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-muted/40 text-xs font-mono">#{rank}</span>
              <span className={`${c.text} text-[10px] font-mono font-semibold tracking-wider px-2 py-0.5 rounded-md ${c.bgDim}`}>
                {supp.category.toUpperCase()}
              </span>
              <span className="text-muted/40 text-[10px] font-mono">{supp.form}</span>
            </div>

            <h3 className="font-serif text-xl sm:text-2xl font-bold text-fg mb-1.5 leading-tight">
              {supp.name}
            </h3>
            <p className="text-muted text-sm leading-relaxed">
              {supp.oneLiner}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {supp.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-mono text-muted/70 bg-white/[0.03] border border-white/[0.05] rounded-md px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Match Score */}
          <div className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl ${c.bgDim} border ${c.border} flex flex-col items-center justify-center`}>
            <span className={`${c.text} font-mono text-2xl sm:text-3xl font-bold leading-none`}>
              {supp.matchScore}
            </span>
            <span className="text-muted text-[8px] font-mono tracking-widest mt-0.5">
              MATCH
            </span>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/[0.04]">
          <div>
            <div className="text-muted text-[9px] font-mono tracking-wider mb-1.5">EVIDENCE</div>
            <EvidenceDots level={supp.evidenceLevel} barClass={c.barBg} />
            <div className="text-muted text-[10px] mt-1">{supp.evidenceLabel}</div>
          </div>
          <div>
            <div className="text-muted text-[9px] font-mono tracking-wider mb-1.5">STUDIES</div>
            <div className="text-fg text-lg font-mono font-bold">{supp.studyCount}</div>
          </div>
          <div>
            <div className="text-muted text-[9px] font-mono tracking-wider mb-1.5">MONTHLY</div>
            <div className="text-fg text-sm font-mono font-semibold">{supp.costMonthly}</div>
          </div>
        </div>
      </div>

      {/* ── Expanded Details ────────────────────────────────── */}
      {expanded && (
        <div className="border-t border-white/[0.04]">
          {/* Effects */}
          <div className="p-5 sm:p-6">
            <h4 className="text-[10px] font-mono text-muted tracking-[0.15em] mb-4">EFFECT PROFILE</h4>
            <div className="space-y-3">
              {supp.effects.map((eff, i) => (
                <EffectBar
                  key={eff.label}
                  label={eff.label}
                  score={eff.score}
                  barClass={c.barBg}
                  textClass={c.text}
                  delay={i * 80}
                />
              ))}
            </div>
          </div>

          {/* Why You */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <h4 className="text-[10px] font-mono text-muted tracking-[0.15em] mb-4">WHY THIS IS IN YOUR STACK</h4>
            <div className="space-y-2.5">
              {supp.whyYou.map((w, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div
                    className={`shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full ${
                      w.strength === "HIGH" ? c.barBg : "bg-muted/30"
                    }`}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-fg text-[13px] font-medium">{w.signal}</span>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-px rounded ${
                          w.strength === "HIGH"
                            ? `${c.text} ${c.bgDim}`
                            : "text-muted bg-white/[0.03]"
                        }`}
                      >
                        {w.strength}
                      </span>
                    </div>
                    <p className="text-muted text-xs leading-relaxed">{w.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dosing */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <h4 className="text-[10px] font-mono text-muted tracking-[0.15em] mb-4">DOSING PROTOCOL</h4>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { label: "DOSE", value: supp.dosing.amount, icon: Pill },
                { label: "TIMING", value: supp.dosing.timing, icon: Clock },
                { label: "FORM", value: supp.dosing.form, icon: Beaker },
                { label: "ONSET", value: supp.dosing.onset, icon: TrendingUp },
              ].map((d) => (
                <div key={d.label} className="bg-white/[0.02] rounded-xl p-3.5">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <d.icon size={11} className="text-muted/50" />
                    <span className="text-muted text-[9px] font-mono tracking-wider">{d.label}</span>
                  </div>
                  <div className="text-fg text-[13px] leading-snug">{d.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cautions */}
          {supp.cautions.length > 0 && (
            <div className="px-5 sm:px-6 pb-5 sm:pb-6">
              <h4 className="text-[10px] font-mono text-muted tracking-[0.15em] mb-3">CAUTIONS</h4>
              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-4 space-y-2">
                {supp.cautions.map((caut, i) => (
                  <div key={i} className="flex gap-2.5">
                    <CautionIcon severity={caut.severity} />
                    <span className="text-muted text-xs leading-relaxed">{caut.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Expand Toggle ──────────────────────────────────── */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full py-3 border-t border-white/[0.04] flex items-center justify-center gap-1.5 text-muted hover:text-fg text-[11px] font-mono tracking-wider transition-colors bg-white/[0.01] hover:bg-white/[0.02]"
      >
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
        />
        {expanded ? "COLLAPSE" : "VIEW DETAILS"}
      </button>
    </div>
  );
}

// ── Stack Page ───────────────────────────────────────────────────────────────

export default function StackPage() {
  const supplements = TEST_SUPPLEMENTS;
  const avgMatch = Math.round(
    supplements.reduce((a, s) => a + s.matchScore, 0) / supplements.length
  );
  const totalCost = getTotalCostRange(supplements);

  return (
    <div className="min-h-screen bg-base">
      <Navbar />

      {/* ── Hero / Summary ────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-accent/[0.04] rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-6 sm:px-10 pt-10 pb-8">
          {/* Top label */}
          <div className="flex items-center justify-between mb-8 animate-fade-up">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-accent" />
              <span className="text-accent text-[10px] font-mono tracking-[0.15em]">
                YOUR PERSONALISED STACK
              </span>
            </div>
            <Link
              href="/chat"
              className="flex items-center gap-1.5 text-muted hover:text-accent text-[11px] font-mono transition-colors"
            >
              <RotateCcw size={12} />
              RETAKE
            </Link>
          </div>

          {/* Summary Stats */}
          <div
            className="grid grid-cols-3 gap-4 animate-fade-up"
            style={{ animationDelay: "0.05s" }}
          >
            <div className="bg-card border border-stroke rounded-xl p-4 text-center">
              <div className="text-accent font-mono text-3xl font-bold">{supplements.length}</div>
              <div className="text-muted text-[10px] font-mono tracking-wider mt-1">SUPPLEMENTS</div>
            </div>
            <div className="bg-card border border-stroke rounded-xl p-4 text-center">
              <div className="text-fg font-mono text-3xl font-bold">{avgMatch}%</div>
              <div className="text-muted text-[10px] font-mono tracking-wider mt-1">AVG MATCH</div>
            </div>
            <div className="bg-card border border-stroke rounded-xl p-4 text-center">
              <div className="text-fg font-mono text-lg font-bold leading-tight pt-1">{totalCost}</div>
              <div className="text-muted text-[10px] font-mono tracking-wider mt-1">MONTHLY</div>
            </div>
          </div>

          {/* Context Bar */}
          <div
            className="mt-4 bg-card border border-stroke rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 animate-fade-up"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="text-muted text-[10px] font-mono tracking-wider">BASED ON:</span>
            {[
              "Energy & Focus",
              "Gut & Skin",
              "Male 26\u201335",
              "Omnivore",
              "Moderate Stress",
            ].map((tag) => (
              <span key={tag} className="text-fg/70 text-[11px] font-mono">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Supplement Cards ──────────────────────────────────── */}
      <div className="w-full max-w-3xl mx-auto px-6 sm:px-10 pb-12">
        <div className="space-y-4">
          {supplements.map((supp, i) => (
            <div
              key={supp.id}
              className="animate-fade-up"
              style={{ animationDelay: `${0.15 + i * 0.06}s` }}
            >
              <SupplementCard supp={supp} rank={i + 1} />
            </div>
          ))}
        </div>

        {/* ── Precision Unlock CTA ──────────────────────────── */}
        <div
          className="mt-8 bg-card border border-accent/15 border-dashed rounded-2xl p-6 text-center animate-fade-up"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield size={16} className="text-accent" />
            <span className="text-accent text-[10px] font-mono tracking-[0.15em]">PRECISION UNLOCK</span>
          </div>
          <p className="text-fg text-sm mb-1">
            Upload bloodwork to unlock 5 more personalised recommendations
          </p>
          <p className="text-muted text-xs mb-5">
            Vitamin D, B12, Ferritin, and more — takes 2 minutes
          </p>
          <button className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-[#06060E] font-mono text-xs font-bold tracking-wider px-6 py-3 rounded-xl transition-all">
            UPLOAD BLOODWORK
            <ArrowRight size={14} />
          </button>
        </div>

        {/* ── Locked Supplements Teaser ──────────────────────── */}
        <div
          className="mt-6 bg-card border border-stroke rounded-2xl p-6 text-center animate-fade-up"
          style={{ animationDelay: "0.55s" }}
        >
          <div className="text-muted text-[10px] font-mono tracking-[0.15em] mb-4">LOCKED — NEEDS MORE DATA</div>
          <div className="flex gap-2.5 justify-center mb-5 flex-wrap">
            {["Omega-3 TG Form", "Vitamin D3+K2", "Creatine Mono", "+3 more"].map((s, i) => (
              <div
                key={s}
                className="px-4 py-2 bg-white/[0.02] border border-white/[0.04] rounded-lg"
                style={{ filter: `blur(${1.5 + i * 1.5}px)`, opacity: 0.5 }}
              >
                <span className="text-fg text-xs">{s}</span>
              </div>
            ))}
          </div>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 text-accent text-xs font-mono hover:underline transition"
          >
            <FlaskConical size={12} />
            REFINE YOUR PROFILE TO UNLOCK
          </Link>
        </div>

        {/* ── Disclaimer ──────────────────────────────────────── */}
        <p className="mt-10 text-center text-muted/30 text-[10px] font-mono leading-relaxed max-w-md mx-auto">
          Disclaimer: StackIQ provides educational information only. This is not
          medical advice. Always consult a qualified healthcare provider before
          starting any supplement regimen.
        </p>
      </div>
    </div>
  );
}
