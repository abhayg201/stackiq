"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Beaker,
  Clock,
  Pill,
  IndianRupee,
  TrendingUp,
  Shield,
  Sparkles,
} from "lucide-react";

// ── Supplement Data ──────────────────────────────────────────────────────────

const SUPPLEMENTS = [
  {
    id: "magnesium",
    name: "Magnesium L-Threonate",
    brand: "Magtein\u00ae Form",
    tagline: "The only Mg form shown to cross the blood-brain barrier",
    matchScore: 96,
    evidenceLevel: 4,
    evidenceLabel: "Strong RCT Evidence",
    costMonthly: "\u20B91,200\u20131,800",
    color: "accent",
    tags: ["Nootropic", "Sleep", "Cognition", "Mineral"],
    effects: [
      { label: "Cognitive Clarity", score: 92, icon: "\u25CE" },
      { label: "Sleep Quality", score: 91, icon: "\u25D1" },
      { label: "Stress Relief", score: 72, icon: "\u25C7" },
      { label: "Energy Baseline", score: 60, icon: "\u26A1" },
      { label: "Mood Stability", score: 79, icon: "\u25C8" },
    ],
    whyYou: [
      { signal: "Chronic fatigue logged", strength: "HIGH", note: "Mg deficiency is one of the top drivers of unexplained fatigue" },
      { signal: "Brain fog / focus issues", strength: "HIGH", note: "L-Threonate form shown to improve synaptic density in RCTs" },
      { signal: "Omnivore diet", strength: "MED", note: "Dietary Mg often sufficient, but L-Threonate form offers distinct nootropic benefit" },
    ],
    dosing: {
      amount: "144mg elemental Mg",
      timing: "30\u201360 min before bed",
      duration: "4\u20136 weeks for full onset",
      form: "Capsule",
    },
    cautions: [
      "May cause loose stools at high doses",
      "Avoid within 2hrs of antibiotics",
    ],
    studies: 12,
    citations: 8,
  },
  {
    id: "omega3",
    name: "Omega-3 (TG Form)",
    brand: "IFOS 5-Star Certified",
    tagline: "EPA:DHA 2:1 ratio \u2014 triglyceride form for 70% better absorption",
    matchScore: 91,
    evidenceLevel: 5,
    evidenceLabel: "Highest RCT Evidence",
    costMonthly: "\u20B9800\u20131,400",
    color: "siq-blue",
    tags: ["Anti-inflammatory", "Brain", "Cardiovascular", "Essential"],
    effects: [
      { label: "Inflammation Reduction", score: 88, icon: "\u25C7" },
      { label: "Cognitive Performance", score: 82, icon: "\u25CE" },
      { label: "Cardiovascular", score: 85, icon: "\u25C8" },
      { label: "Mood Stability", score: 75, icon: "\u25D1" },
      { label: "Joint Comfort", score: 65, icon: "\u26A1" },
    ],
    whyYou: [
      { signal: "Omnivore diet", strength: "MED", note: "Still often below therapeutic EPA/DHA levels" },
      { signal: "Focus issues logged", strength: "HIGH", note: "DHA is a structural component of neuronal membranes" },
      { signal: "Stress level elevated", strength: "HIGH", note: "EPA shown to lower cortisol markers in RCTs" },
    ],
    dosing: {
      amount: "2\u20133g EPA+DHA/day",
      timing: "With largest meal",
      duration: "8\u201312 weeks for full onset",
      form: "Softgel",
    },
    cautions: [
      "Blood thinners: 2hr gap minimum",
      "Store refrigerated after opening",
      "Check TOTOX < 26 on label",
    ],
    studies: 38,
    citations: 22,
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha KSM-66",
    brand: "KSM-66\u00ae Standardised",
    tagline: "5% withanolides \u2014 the most clinically studied adaptogen extract",
    matchScore: 87,
    evidenceLevel: 3,
    evidenceLabel: "Good RCT Evidence",
    costMonthly: "\u20B9600\u20131,000",
    color: "siq-orange",
    tags: ["Adaptogen", "Stress", "Sleep", "Hormonal"],
    effects: [
      { label: "Stress / Cortisol", score: 94, icon: "\u25C7" },
      { label: "Sleep Onset", score: 83, icon: "\u25D1" },
      { label: "Testosterone (men)", score: 68, icon: "\u26A1" },
      { label: "Physical Stamina", score: 65, icon: "\u25C8" },
      { label: "Anxiety Reduction", score: 88, icon: "\u25CE" },
    ],
    whyYou: [
      { signal: "Stress level elevated", strength: "HIGH", note: "KSM-66 showed 27% cortisol reduction in 60-day trial" },
      { signal: "Sleep disruption", strength: "HIGH", note: "Improves sleep onset via GABA-A modulation" },
      { signal: "Fatigue pattern", strength: "MED", note: "HPA axis dysregulation is a common fatigue driver" },
    ],
    dosing: {
      amount: "300\u2013600mg extract",
      timing: "With dinner or before bed",
      duration: "4\u20138 weeks for full onset",
      form: "Capsule",
    },
    cautions: [
      "Avoid with thyroid conditions without RD review",
      "Cycle: 8 weeks on / 2 weeks off",
      "Pregnancy: contraindicated",
    ],
    studies: 18,
    citations: 11,
  },
];

// ── Effect Bar Component ─────────────────────────────────────────────────────

function EffectBar({
  label,
  score,
  icon,
  colorClass,
}: {
  label: string;
  score: number;
  icon: string;
  colorClass: string;
}) {
  return (
    <div className="mb-2.5">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-muted text-xs">{icon}</span>
          <span className="text-fg text-xs font-medium">{label}</span>
        </div>
        <span className={`${colorClass} text-[11px] font-mono font-semibold`}>
          {score}
        </span>
      </div>
      <div className="relative h-1.5 bg-white/5 rounded-full">
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${colorClass.replace(
            "text-",
            "bg-"
          )} transition-all duration-1000`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

// ── Evidence Meter ───────────────────────────────────────────────────────────

function EvidenceMeter({
  level,
  label,
  colorClass,
}: {
  level: number;
  label: string;
  colorClass: string;
}) {
  return (
    <div>
      <div className="flex gap-1 mb-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              i <= level
                ? `${colorClass.replace("text-", "bg-")} shadow-sm`
                : "bg-white/5"
            }`}
          />
        ))}
      </div>
      <div className="text-muted text-[10px] font-mono">{label}</div>
    </div>
  );
}

// ── Supplement Card ──────────────────────────────────────────────────────────

function SupplementCard({
  supp,
  expanded,
  onToggle,
}: {
  supp: (typeof SUPPLEMENTS)[0];
  expanded: boolean;
  onToggle: () => void;
}) {
  const [tab, setTab] = useState<"effects" | "why" | "dosing">("effects");
  const colorClass = `text-${supp.color}`;
  const bgDim = `bg-${supp.color}/5`;
  const borderDim = `border-${supp.color}/20`;

  const tabs = [
    { id: "effects" as const, label: "Effects" },
    { id: "why" as const, label: "Why You" },
    { id: "dosing" as const, label: "Dosing" },
  ];

  return (
    <div
      className={`bg-card border rounded-2xl overflow-hidden transition-all ${borderDim}`}
      style={{ boxShadow: `0 0 30px rgba(0,0,0,0.2)` }}
    >
      {/* Header */}
      <div
        className="p-5 cursor-pointer hover:bg-white/[0.01] transition"
        onClick={onToggle}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex gap-2 mb-2 flex-wrap">
              <div className={`${bgDim} border ${borderDim} rounded px-2 py-0.5`}>
                <span className={`${colorClass} text-[9px] font-mono font-bold tracking-wider`}>
                  {supp.brand}
                </span>
              </div>
              {supp.tags.slice(0, 2).map((t) => (
                <div key={t} className="bg-faint rounded px-2 py-0.5">
                  <span className="text-muted text-[9px] font-mono">{t}</span>
                </div>
              ))}
            </div>
            <h3 className="font-serif text-xl font-bold text-fg mb-1">
              {supp.name}
            </h3>
            <p className="text-muted text-xs">{supp.tagline}</p>
          </div>

          {/* Match Score */}
          <div className={`${bgDim} border ${borderDim} rounded-xl p-3 text-center ml-4 flex-shrink-0`}>
            <div className={`${colorClass} font-mono text-2xl font-bold`}>
              {supp.matchScore}
            </div>
            <div className="text-muted text-[8px] font-mono">MATCH</div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex gap-4 mt-4 flex-wrap items-end">
          <div className="flex-1 min-w-[120px]">
            <div className="text-muted text-[9px] font-mono tracking-wider mb-1">
              EVIDENCE
            </div>
            <EvidenceMeter
              level={supp.evidenceLevel}
              label={supp.evidenceLabel}
              colorClass={colorClass}
            />
          </div>
          <div>
            <div className="text-muted text-[9px] font-mono tracking-wider mb-0.5">
              STUDIES
            </div>
            <div className="text-fg text-base font-mono font-bold">
              {supp.studies}
            </div>
          </div>
          <div>
            <div className="text-muted text-[9px] font-mono tracking-wider mb-0.5">
              MONTHLY
            </div>
            <div className="text-fg text-sm font-mono font-semibold">
              {supp.costMonthly}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div>
          {/* Tabs */}
          <div className="flex border-t border-b border-border overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-5 py-2.5 text-[11px] font-mono tracking-wider flex-shrink-0 border-b-2 transition-all ${
                  tab === t.id
                    ? `${colorClass} border-current font-bold`
                    : "text-muted border-transparent"
                }`}
              >
                {t.label.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* Effects Tab */}
            {tab === "effects" && (
              <div>
                <div className="text-muted text-[10px] font-mono tracking-wider mb-4">
                  EFFECT PROFILE
                </div>
                {supp.effects.map((e) => (
                  <EffectBar
                    key={e.label}
                    label={e.label}
                    score={e.score}
                    icon={e.icon}
                    colorClass={colorClass}
                  />
                ))}
              </div>
            )}

            {/* Why You Tab */}
            {tab === "why" && (
              <div>
                <div className="text-muted text-[10px] font-mono tracking-wider mb-4">
                  WHY THIS IS IN YOUR STACK
                </div>
                <div className="space-y-3">
                  {supp.whyYou.map((w, i) => (
                    <div
                      key={i}
                      className={`p-4 bg-faint rounded-xl border-l-[3px] ${
                        w.strength === "HIGH"
                          ? borderDim.replace("/20", "/60")
                          : "border-border"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-fg text-xs font-semibold">
                          &ldquo;{w.signal}&rdquo;
                        </span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded border ${
                            w.strength === "HIGH"
                              ? `${colorClass} ${bgDim} ${borderDim}`
                              : "text-muted bg-card border-border"
                          }`}
                        >
                          {w.strength}
                        </span>
                      </div>
                      <p className="text-muted text-[11px] leading-relaxed">
                        {w.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dosing Tab */}
            {tab === "dosing" && (
              <div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "DOSE", value: supp.dosing.amount, icon: Pill },
                    { label: "TIMING", value: supp.dosing.timing, icon: Clock },
                    { label: "FORM", value: supp.dosing.form, icon: Beaker },
                    {
                      label: "ONSET",
                      value: supp.dosing.duration,
                      icon: TrendingUp,
                    },
                  ].map((d) => (
                    <div
                      key={d.label}
                      className="bg-faint rounded-xl p-3.5"
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <d.icon size={10} className="text-muted" />
                        <span className="text-muted text-[9px] font-mono tracking-wider">
                          {d.label}
                        </span>
                      </div>
                      <div className="text-fg text-sm font-medium">
                        {d.value}
                      </div>
                    </div>
                  ))}
                </div>

                {supp.cautions.length > 0 && (
                  <div className="bg-siq-red/5 border border-siq-red/15 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle size={12} className="text-siq-red" />
                      <span className="text-siq-red text-[9px] font-mono tracking-wider">
                        CAUTIONS
                      </span>
                    </div>
                    {supp.cautions.map((c, i) => (
                      <div
                        key={i}
                        className="flex gap-2 mb-1 last:mb-0"
                      >
                        <span className="text-siq-red/50 text-xs mt-0.5">
                          &bull;
                        </span>
                        <span className="text-muted text-xs">{c}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expand toggle */}
      <div
        onClick={onToggle}
        className="py-2.5 border-t border-border flex justify-center cursor-pointer bg-faint hover:bg-white/[0.02] transition"
      >
        <span className="text-muted text-[10px] font-mono tracking-wider flex items-center gap-1">
          {expanded ? (
            <>
              <ChevronUp size={12} /> COLLAPSE
            </>
          ) : (
            <>
              <ChevronDown size={12} /> EXPAND &middot; EFFECTS &middot; WHY
              YOU &middot; DOSING
            </>
          )}
        </span>
      </div>
    </div>
  );
}

// ── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [expandedCard, setExpandedCard] = useState<string | null>("magnesium");

  const avgMatch = Math.round(
    SUPPLEMENTS.reduce((acc, s) => acc + s.matchScore, 0) / SUPPLEMENTS.length
  );

  return (
    <div className="min-h-screen bg-bg">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6 animate-fade-up">
          <div>
            <div className="text-accent text-[10px] font-mono tracking-[0.15em] mb-1.5">
              YOUR PERSONALISED STACK
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-fg leading-tight">
              {SUPPLEMENTS.length} recommendations.
              <br />
              <span className="text-accent italic">
                {avgMatch}% average match.
              </span>
            </h1>
          </div>

          <div className="bg-accent-dim border border-accent/30 rounded-xl p-4 text-center">
            <div className="text-accent font-mono text-xl font-bold">34%</div>
            <div className="text-muted text-[9px] font-mono tracking-wider">
              PRECISION
            </div>
            <div className="text-accent/50 text-[9px] mt-1">
              add bloodwork → 78%
            </div>
          </div>
        </div>

        {/* Context bar */}
        <div
          className="bg-card border border-border rounded-xl p-3 px-4 mb-6 flex flex-wrap gap-4 items-center animate-fade-up"
          style={{ animationDelay: "0.05s" }}
        >
          <span className="text-muted text-[10px] font-mono tracking-wider">
            BASED ON:
          </span>
          {[
            { k: "Goal", v: "Energy + Focus" },
            { k: "Diet", v: "Omnivore" },
            { k: "Stress", v: "3\u20134/5 (moderate)" },
          ].map(({ k, v }) => (
            <div key={k} className="flex gap-1.5 items-center">
              <span className="text-muted text-[10px] font-mono">{k}:</span>
              <span className="text-fg text-[11px] font-medium">{v}</span>
            </div>
          ))}
          <Link
            href="/chat"
            className="ml-auto text-muted hover:text-accent text-[10px] font-mono border border-border hover:border-accent/30 rounded-md px-3 py-1 transition-all"
          >
            + REFINE
          </Link>
        </div>

        {/* Precision CTA */}
        <div
          className="bg-accent/5 border border-accent/20 border-dashed rounded-xl p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-3 animate-fade-up"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-accent flex-shrink-0" />
            <div>
              <div className="text-accent text-[10px] font-mono tracking-wider mb-0.5">
                PRECISION UNLOCK
              </div>
              <div className="text-fg text-sm">
                Upload Vitamin D, B12, Ferritin bloodwork → unlock 5 more
                personalised recs
              </div>
            </div>
          </div>
          <button className="bg-accent text-bg font-mono text-[10px] font-bold tracking-wider px-4 py-2 rounded-lg flex-shrink-0">
            UPLOAD →
          </button>
        </div>

        {/* Supplement Cards */}
        <div className="space-y-4">
          {SUPPLEMENTS.map((supp, i) => (
            <div
              key={supp.id}
              className="animate-fade-up"
              style={{ animationDelay: `${0.15 + i * 0.08}s` }}
            >
              <SupplementCard
                supp={supp}
                expanded={expandedCard === supp.id}
                onToggle={() =>
                  setExpandedCard(expandedCard === supp.id ? null : supp.id)
                }
              />
            </div>
          ))}
        </div>

        {/* Locked teaser */}
        <div
          className="mt-6 bg-card border border-border rounded-2xl p-6 text-center animate-fade-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="text-muted text-[10px] font-mono tracking-[0.15em] mb-4">
            LOCKED — REQUIRES MORE DATA
          </div>
          <div className="flex gap-3 justify-center mb-5 flex-wrap">
            {["Vitamin D3+K2", "Lion's Mane", "Creatine Monohydrate", "+2 more"].map(
              (s, i) => (
                <div
                  key={s}
                  className="px-4 py-2 bg-faint border border-border rounded-lg"
                  style={{
                    filter: `blur(${i + 1}px)`,
                    opacity: 0.5,
                  }}
                >
                  <span className="text-fg text-xs">{s}</span>
                </div>
              )
            )}
          </div>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-bg font-mono text-[11px] font-bold tracking-wider px-6 py-3 rounded-lg transition-all"
          >
            <Sparkles size={14} />
            ADD YOUR DATA → UNLOCK ALL
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <p className="text-muted/40 text-[10px] font-mono">
            Disclaimer: StackIQ provides educational information only. This is
            not medical advice. Always consult a qualified healthcare provider
            before starting any supplement regimen.
          </p>
        </div>
      </div>
    </div>
  );
}
