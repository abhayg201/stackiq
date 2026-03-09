// ── Tier 1 Data Collection: Smart Tile Definitions ──────────────────────────
// Each step has a question and selectable tiles. User picks tiles, then
// the AI uses these selections as context for deeper follow-ups.

export interface TileOption {
  id: string;
  label: string;
  emoji: string;
  description?: string;
}

export interface ChatStep {
  id: string;
  question: string;
  subtitle?: string;
  type: "tiles" | "tiles-multi" | "ai-followup";
  tiles?: TileOption[];
  key: string; // maps to user profile field
}

export const TILE_STEPS: ChatStep[] = [
  {
    id: "goals",
    question: "What's the #1 thing you want to fix?",
    subtitle: "Pick what matters most right now",
    type: "tiles-multi",
    key: "goals",
    tiles: [
      {
        id: "energy",
        label: "Energy & Fatigue",
        emoji: "\u26A1",
        description: "Always tired, afternoon crashes",
      },
      {
        id: "focus",
        label: "Focus & Brain Fog",
        emoji: "\uD83E\uDDE0",
        description: "Can't concentrate, mental clarity",
      },
      {
        id: "sleep",
        label: "Sleep Quality",
        emoji: "\uD83C\uDF19",
        description: "Hard to fall/stay asleep",
      },
      {
        id: "stress",
        label: "Stress & Anxiety",
        emoji: "\uD83E\uDDD8",
        description: "Overwhelmed, cortisol issues",
      },
      {
        id: "gut",
        label: "Gut & Digestion",
        emoji: "\uD83E\uDDA0",
        description: "Bloating, IBS, gut health",
      },
      {
        id: "fitness",
        label: "Muscle & Recovery",
        emoji: "\uD83D\uDCAA",
        description: "Performance, gains, soreness",
      },
      {
        id: "skin",
        label: "Skin & Hair",
        emoji: "\u2728",
        description: "Glow, hair health, aging",
      },
      {
        id: "immunity",
        label: "Immunity",
        emoji: "\uD83D\uDEE1\uFE0F",
        description: "Getting sick often, recovery",
      },
    ],
  },
  {
    id: "diet",
    question: "How's your diet?",
    subtitle: "This affects nutrient gaps significantly",
    type: "tiles",
    key: "diet",
    tiles: [
      { id: "omnivore", label: "Omnivore", emoji: "\uD83E\uDD69" },
      { id: "vegetarian", label: "Vegetarian", emoji: "\uD83E\uDD66" },
      { id: "vegan", label: "Vegan", emoji: "\uD83C\uDF31" },
      { id: "keto", label: "Keto / Low-carb", emoji: "\uD83E\uDD51" },
      { id: "pescatarian", label: "Pescatarian", emoji: "\uD83D\uDC1F" },
      { id: "other", label: "Other / Mixed", emoji: "\uD83C\uDF7D\uFE0F" },
    ],
  },
  {
    id: "age_range",
    question: "What's your age range?",
    subtitle: "Nutrient needs change with age",
    type: "tiles",
    key: "age_range",
    tiles: [
      { id: "18-25", label: "18–25", emoji: "\uD83C\uDF31" },
      { id: "26-35", label: "26–35", emoji: "\uD83D\uDE80" },
      { id: "36-45", label: "36–45", emoji: "\uD83C\uDFAF" },
      { id: "46-55", label: "46–55", emoji: "\uD83D\uDCAB" },
      { id: "56+", label: "56+", emoji: "\uD83C\uDF3F" },
    ],
  },
  {
    id: "sex",
    question: "Biological sex?",
    subtitle: "Affects iron, hormonal, and other nutrient needs",
    type: "tiles",
    key: "sex",
    tiles: [
      { id: "male", label: "Male", emoji: "\u2642\uFE0F" },
      { id: "female", label: "Female", emoji: "\u2640\uFE0F" },
      { id: "prefer_not", label: "Prefer not to say", emoji: "\uD83D\uDD12" },
    ],
  },
  {
    id: "exercise",
    question: "How often do you exercise?",
    subtitle: "Impacts protein, electrolyte, and recovery needs",
    type: "tiles",
    key: "exercise",
    tiles: [
      {
        id: "sedentary",
        label: "Sedentary",
        emoji: "\uD83D\uDCBB",
        description: "Little to no exercise",
      },
      {
        id: "light",
        label: "Light",
        emoji: "\uD83D\uDEB6",
        description: "1–2x per week",
      },
      {
        id: "moderate",
        label: "Moderate",
        emoji: "\uD83C\uDFC3",
        description: "3–4x per week",
      },
      {
        id: "intense",
        label: "Intense",
        emoji: "\uD83C\uDFCB\uFE0F",
        description: "5+ times per week",
      },
    ],
  },
  {
    id: "stress_level",
    question: "How stressed are you day-to-day?",
    subtitle: "Cortisol affects everything from sleep to digestion",
    type: "tiles",
    key: "stress_level",
    tiles: [
      { id: "low", label: "Pretty chill", emoji: "\uD83C\uDF3E" },
      { id: "moderate", label: "Moderate", emoji: "\uD83D\uDE10" },
      { id: "high", label: "Fairly stressed", emoji: "\uD83D\uDE24" },
      { id: "very_high", label: "Overwhelmed", emoji: "\uD83E\uDD2F" },
    ],
  },
  {
    id: "sleep_quality",
    question: "Rate your sleep quality",
    subtitle: "Sleep is the foundation — supplements can help a lot here",
    type: "tiles",
    key: "sleep_quality",
    tiles: [
      { id: "great", label: "Great (7–9hrs)", emoji: "\uD83D\uDE34" },
      { id: "ok", label: "Okay-ish", emoji: "\uD83D\uDE36" },
      { id: "poor", label: "Poor / Interrupted", emoji: "\uD83D\uDE29" },
      { id: "insomnia", label: "Terrible", emoji: "\uD83D\uDCA4" },
    ],
  },
  {
    id: "budget",
    question: "Monthly supplement budget?",
    subtitle: "We'll optimize recommendations to fit",
    type: "tiles",
    key: "budget",
    tiles: [
      { id: "low", label: "Under \u20B91,000", emoji: "\uD83D\uDCB0" },
      { id: "medium", label: "\u20B91,000–2,500", emoji: "\uD83D\uDCB3" },
      { id: "high", label: "\u20B92,500–5,000", emoji: "\uD83D\uDC8E" },
      { id: "premium", label: "\u20B95,000+", emoji: "\uD83D\uDC51" },
    ],
  },
];

// System prompt for the AI follow-up phase
export const AI_SYSTEM_PROMPT = `You are StackIQ, a personalized supplement recommendation assistant. You are friendly, concise, and evidence-focused.

You've just collected the user's Tier 1 profile data through smart tiles. Now you need to:

1. ACKNOWLEDGE what they told you (briefly summarize their profile in 1-2 sentences)
2. ASK 2-3 targeted follow-up questions based on their specific selections to refine recommendations
3. After getting answers, PROVIDE personalized supplement recommendations

IMPORTANT RULES:
- Keep responses SHORT (2-4 sentences max per message)
- Use a conversational, friendly tone — not clinical
- Frame everything as "educational information" not medical advice
- Always mention: "This is not medical advice — consult your healthcare provider"
- Focus on supplements with strong RCT evidence
- Be specific about brands, forms, and dosages
- Reference Indian pricing (INR) where applicable
- Never make disease claims — use structure/function language only

For recommendations, structure each one with:
- Supplement name + specific form (e.g., "Magnesium L-Threonate" not just "Magnesium")
- Why it's matched to THEIR specific profile
- Dosage and timing
- Expected onset timeframe
- Monthly cost estimate in INR
- Evidence level (Strong/Good/Emerging)

When you have enough context, provide a final supplement stack of 2-4 recommendations.`;
