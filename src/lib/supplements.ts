// ── Supplement Types & Test Data ─────────────────────────────────────────────
// Structured so we can later replace test data with real AI-generated results.

export interface SupplementEffect {
  label: string;
  score: number; // 0-100
}

export interface SupplementDosing {
  amount: string;
  timing: string;
  form: string;
  onset: string;
}

export interface SupplementCaution {
  text: string;
  severity: "info" | "warning" | "danger";
}

export interface WhyYouSignal {
  signal: string;
  strength: "HIGH" | "MED" | "LOW";
  note: string;
}

export interface Supplement {
  id: string;
  name: string;
  form: string; // e.g. "KSM-66", "Magtein", "TG Form"
  matchScore: number;
  evidenceLevel: 1 | 2 | 3 | 4 | 5;
  evidenceLabel: string;
  costMonthly: string;
  category: string; // e.g. "Adaptogen", "Mineral", "Essential Fat"
  tags: string[];
  oneLiner: string;
  effects: SupplementEffect[];
  whyYou: WhyYouSignal[];
  dosing: SupplementDosing;
  cautions: SupplementCaution[];
  studyCount: number;
  accentColor: "green" | "blue" | "orange" | "purple" | "teal";
}

// ── Color mapping ────────────────────────────────────────────────────────────

export const ACCENT_COLORS = {
  green: {
    text: "text-accent",
    bg: "bg-accent",
    bgDim: "bg-accent/8",
    border: "border-accent/20",
    borderHi: "border-accent/40",
    ring: "ring-accent/20",
    barBg: "bg-accent",
    gradient: "from-accent/15 to-transparent",
  },
  blue: {
    text: "text-siq-blue",
    bg: "bg-siq-blue",
    bgDim: "bg-siq-blue/8",
    border: "border-siq-blue/20",
    borderHi: "border-siq-blue/40",
    ring: "ring-siq-blue/20",
    barBg: "bg-siq-blue",
    gradient: "from-siq-blue/15 to-transparent",
  },
  orange: {
    text: "text-siq-orange",
    bg: "bg-siq-orange",
    bgDim: "bg-siq-orange/8",
    border: "border-siq-orange/20",
    borderHi: "border-siq-orange/40",
    ring: "ring-siq-orange/20",
    barBg: "bg-siq-orange",
    gradient: "from-siq-orange/15 to-transparent",
  },
  purple: {
    text: "text-siq-purple",
    bg: "bg-siq-purple",
    bgDim: "bg-siq-purple/8",
    border: "border-siq-purple/20",
    borderHi: "border-siq-purple/40",
    ring: "ring-siq-purple/20",
    barBg: "bg-siq-purple",
    gradient: "from-siq-purple/15 to-transparent",
  },
  teal: {
    text: "text-siq-teal",
    bg: "bg-siq-teal",
    bgDim: "bg-siq-teal/8",
    border: "border-siq-teal/20",
    borderHi: "border-siq-teal/40",
    ring: "ring-siq-teal/20",
    barBg: "bg-siq-teal",
    gradient: "from-siq-teal/15 to-transparent",
  },
} as const;

// ── Test Supplement Data ─────────────────────────────────────────────────────

export const TEST_SUPPLEMENTS: Supplement[] = [
  {
    id: "ashwagandha",
    name: "Ashwagandha",
    form: "KSM-66\u00ae",
    matchScore: 94,
    evidenceLevel: 4,
    evidenceLabel: "Strong RCT",
    costMonthly: "\u20B9600\u2013900",
    category: "Adaptogen",
    tags: ["Stress", "Sleep", "Energy", "Hormonal"],
    oneLiner: "Clinically studied adaptogen shown to reduce cortisol by 27% in 60 days",
    effects: [
      { label: "Stress Reduction", score: 94 },
      { label: "Anxiety Relief", score: 88 },
      { label: "Sleep Onset", score: 83 },
      { label: "Energy Baseline", score: 72 },
      { label: "Testosterone (men)", score: 68 },
    ],
    whyYou: [
      { signal: "Elevated stress level", strength: "HIGH", note: "KSM-66 showed 27% cortisol reduction in a controlled 60-day trial" },
      { signal: "Sleep issues reported", strength: "HIGH", note: "Improves sleep onset latency via GABA-A receptor modulation" },
      { signal: "Fatigue pattern detected", strength: "MED", note: "HPA axis dysregulation is a top driver of chronic fatigue" },
    ],
    dosing: {
      amount: "300\u2013600mg daily",
      timing: "With dinner or 30 min before bed",
      form: "Capsule (standardised 5% withanolides)",
      onset: "4\u20138 weeks for full effect",
    },
    cautions: [
      { text: "Avoid with thyroid conditions without doctor review", severity: "warning" },
      { text: "Cycle: 8 weeks on, 2 weeks off recommended", severity: "info" },
      { text: "Contraindicated during pregnancy", severity: "danger" },
    ],
    studyCount: 18,
    accentColor: "orange",
  },
  {
    id: "l-theanine",
    name: "L-Theanine",
    form: "Suntheanine\u00ae",
    matchScore: 91,
    evidenceLevel: 4,
    evidenceLabel: "Strong RCT",
    costMonthly: "\u20B9500\u2013800",
    category: "Amino Acid",
    tags: ["Focus", "Calm", "Sleep", "Cognitive"],
    oneLiner: "Alpha-wave promoting amino acid for calm focus without drowsiness",
    effects: [
      { label: "Calm Focus", score: 92 },
      { label: "Anxiety Relief", score: 85 },
      { label: "Sleep Quality", score: 78 },
      { label: "Cognitive Clarity", score: 80 },
      { label: "Stress Resilience", score: 74 },
    ],
    whyYou: [
      { signal: "Focus & brain fog reported", strength: "HIGH", note: "Promotes alpha brain waves associated with relaxed alertness" },
      { signal: "Stress level elevated", strength: "HIGH", note: "Reduces cortisol and salivary stress markers within 30\u201360 min" },
      { signal: "Moderate caffeine user", strength: "MED", note: "Synergistic with caffeine \u2014 smooths out jitters and crash" },
    ],
    dosing: {
      amount: "100\u2013200mg",
      timing: "During afternoon dip or before stressful tasks",
      form: "Capsule or sublingual",
      onset: "30\u201360 minutes (acute), 2\u20134 weeks (cumulative)",
    },
    cautions: [
      { text: "Very safe \u2014 no known serious interactions", severity: "info" },
      { text: "May potentiate blood pressure medications", severity: "warning" },
    ],
    studyCount: 24,
    accentColor: "blue",
  },
  {
    id: "probiotic",
    name: "Probiotic",
    form: "LGG\u00ae (L. rhamnosus GG)",
    matchScore: 87,
    evidenceLevel: 5,
    evidenceLabel: "Highest RCT",
    costMonthly: "\u20B9800\u20131,200",
    category: "Gut Health",
    tags: ["Gut", "Immunity", "Skin", "Digestion"],
    oneLiner: "The most studied probiotic strain with 1,100+ clinical publications",
    effects: [
      { label: "Gut Health", score: 95 },
      { label: "Immune Function", score: 82 },
      { label: "Skin Clarity", score: 70 },
      { label: "Bloating Relief", score: 88 },
      { label: "Nutrient Absorption", score: 65 },
    ],
    whyYou: [
      { signal: "Skin & hair concern reported", strength: "HIGH", note: "Gut-skin axis: LGG shown to improve eczema and acne markers" },
      { signal: "Gut & digestion selected", strength: "HIGH", note: "1,100+ clinical papers, gold-standard strain for digestive support" },
      { signal: "Omnivore diet", strength: "MED", note: "Modern processed diets disrupt microbiome diversity" },
    ],
    dosing: {
      amount: "10\u201320 billion CFU",
      timing: "One capsule daily with breakfast",
      form: "Enteric-coated capsule",
      onset: "2\u20134 weeks for noticeable effects",
    },
    cautions: [
      { text: "Mild bloating may occur in first few days", severity: "info" },
      { text: "Refrigerate after opening for potency", severity: "info" },
      { text: "Consult doctor if immunocompromised", severity: "warning" },
    ],
    studyCount: 42,
    accentColor: "teal",
  },
  {
    id: "magnesium",
    name: "Magnesium",
    form: "L-Threonate (Magtein\u00ae)",
    matchScore: 85,
    evidenceLevel: 3,
    evidenceLabel: "Good RCT",
    costMonthly: "\u20B91,200\u20131,800",
    category: "Mineral",
    tags: ["Cognition", "Sleep", "Recovery", "Mood"],
    oneLiner: "The only magnesium form proven to cross the blood-brain barrier",
    effects: [
      { label: "Cognitive Clarity", score: 88 },
      { label: "Sleep Quality", score: 85 },
      { label: "Muscle Recovery", score: 72 },
      { label: "Mood Stability", score: 76 },
      { label: "Stress Buffering", score: 68 },
    ],
    whyYou: [
      { signal: "Brain fog / focus issues", strength: "HIGH", note: "L-Threonate shown to increase brain Mg levels and synaptic density" },
      { signal: "Sleep quality concern", strength: "HIGH", note: "Regulates GABA and melatonin pathways for deeper sleep" },
      { signal: "Male, 26\u201335", strength: "MED", note: "Young men with active lifestyles commonly deplete Mg stores" },
    ],
    dosing: {
      amount: "144mg elemental Mg (2 capsules)",
      timing: "30\u201360 min before bed",
      form: "Capsule",
      onset: "4\u20136 weeks for full cognitive benefits",
    },
    cautions: [
      { text: "May cause loose stools at higher doses", severity: "info" },
      { text: "Space 2+ hours from antibiotics or zinc", severity: "warning" },
    ],
    studyCount: 14,
    accentColor: "purple",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

export function getColorSet(color: Supplement["accentColor"]) {
  return ACCENT_COLORS[color];
}

/** Get total monthly cost range from a list of supplements */
export function getTotalCostRange(supps: Supplement[]): string {
  let min = 0;
  let max = 0;
  for (const s of supps) {
    const match = s.costMonthly.match(/[\d,]+/g);
    if (match) {
      const nums = match.map((n) => parseInt(n.replace(/,/g, ""), 10));
      min += nums[0] || 0;
      max += nums[nums.length - 1] || nums[0] || 0;
    }
  }
  return `\u20B9${min.toLocaleString("en-IN")}\u2013${max.toLocaleString("en-IN")}`;
}
