# Chat Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the StackIQ chat from a tile-based chatbot into a professional clinical consultation interface with Supabase persistence, thread-style messages, Tiptap editor, and a conversation history sidebar.

**Architecture:** Modular ChatProvider context at the `/chat/layout.tsx` level owns all state (conversations, messages, loading). Thin page shell composes MessageThread, ChatSidebar, and TiptapEditor. API route stays stateless; all DB operations happen client-side in ChatProvider.

**Tech Stack:** Next.js 16 (App Router), Supabase (auth + DB), OpenAI GPT-4o, Tiptap editor, React Context, lucide-react icons.

**Critical Constraint:** All layout CSS must use inline `style={{}}` — Tailwind v4 utility classes for layout do NOT render. This applies to every file.

**Spec:** `docs/superpowers/specs/2026-03-12-chat-redesign-design.md`

---

## File Structure

| File | Responsibility | Status |
|------|---------------|--------|
| `supabase/migrations/001_chat_tables.sql` | DB tables + RLS policies | Create |
| `src/lib/chat-config.ts` | System prompt (clinical tone, :::supplement::: format) | Rewrite |
| `src/lib/chat-types.ts` | TypeScript interfaces: Conversation, Message, SupplementBlock | Create |
| `src/app/api/chat/route.ts` | OpenAI API proxy (stateless, new request/response shape) | Rewrite |
| `src/components/ChatMarkdown.tsx` | Markdown renderer + :::supplement::: block detection | Rewrite |
| `src/components/chat/SupplementCard.tsx` | Inline recommendation card (clickable → /supplement/[slug]) | Create |
| `src/components/chat/TiptapEditor.tsx` | Tiptap editor pinned at bottom | Create |
| `src/components/chat/MessageBlock.tsx` | Single message: author header + content | Create |
| `src/components/chat/MessageThread.tsx` | Scrollable list of MessageBlocks | Create |
| `src/components/chat/ChatSidebar.tsx` | Right slide-out conversation history panel | Create |
| `src/components/chat/ChatProvider.tsx` | Context provider: all state + Supabase CRUD + AI calls | Create |
| `src/app/chat/layout.tsx` | Wraps children in ChatProvider | Create |
| `src/app/chat/page.tsx` | Thin shell composing thread + sidebar + editor | Rewrite |
| `src/components/Navbar.tsx` | Add sidebar toggle icon + fix responsive | Modify |
| `src/app/supplement/[slug]/page.tsx` | Placeholder supplement detail page | Create |

---

## Chunk 1: Foundation (DB, Types, API, Dependencies)

### Task 1: Install Tiptap dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install packages**

Run:
```bash
cd C:/Users/AbhayGodara/Projects/Supp/stackiq && npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-placeholder tiptap-markdown
```

Expected: packages added to `dependencies` in `package.json`.

- [ ] **Step 2: Verify install**

Run:
```bash
cd C:/Users/AbhayGodara/Projects/Supp/stackiq && node -e "const pkg = require('./package.json'); const deps = ['@tiptap/react','@tiptap/starter-kit','@tiptap/extension-placeholder','tiptap-markdown']; deps.forEach(d => { if (!pkg.dependencies[d]) throw new Error(d + ' missing'); }); console.log('All 4 tiptap packages found in package.json')"
```

Expected: prints confirmation with no errors.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install tiptap editor dependencies"
```

---

### Task 2: Create Supabase migration

**Files:**
- Create: `supabase/migrations/001_chat_tables.sql`

- [ ] **Step 1: Create directory and migration file**

Run first: `mkdir -p C:/Users/AbhayGodara/Projects/Supp/stackiq/supabase/migrations`

Create `supabase/migrations/001_chat_tables.sql`:

```sql
-- conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New Consultation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- user_profiles table (for future use — v1 uses email prefix)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- RLS: conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS: messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in own conversations"
  ON messages FOR SELECT
  USING (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert messages in own conversations"
  ON messages FOR INSERT
  WITH CHECK (conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid()));

-- RLS: user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can create own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);
```

- [ ] **Step 2: Apply migration to Supabase**

Run the SQL in the Supabase dashboard (SQL Editor) or via CLI:
```bash
# If using Supabase CLI:
cd C:/Users/AbhayGodara/Projects/Supp/stackiq && npx supabase db push
# Otherwise: paste the SQL into Supabase Dashboard → SQL Editor → Run
```

Expected: 3 tables created with RLS policies. Verify in Supabase Dashboard → Table Editor.

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/001_chat_tables.sql
git commit -m "feat: add chat database tables with RLS policies"
```

---

### Task 3: Create shared TypeScript types

**Files:**
- Create: `src/lib/chat-types.ts`

- [ ] **Step 1: Write types file**

Create `src/lib/chat-types.ts`:

```typescript
// Database row types (match Supabase schema exactly)

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  status?: 'sending' | 'sent' | 'error'; // local-only, not persisted to DB
}

export interface SupplementBlock {
  name: string;
  slug: string;
  dosage: string;
  timing: string;
  goal: string;   // "Sleep", "Cognition", "Energy", "Stress", "Gut Health", "General"
  confidence: 'strong' | 'good' | 'emerging';
}

// Category color map for SupplementCard accent dots
export const CATEGORY_COLORS: Record<string, string> = {
  'Sleep': '#4F46E5',
  'Cognition': '#2563EB',
  'Focus': '#2563EB',
  'Cognition/Focus': '#2563EB',
  'Energy': '#EA580C',
  'Stress': '#7C3AED',
  'Gut Health': '#0D9488',
  'General': '#6B7280',
};

export function getCategoryColor(goal: string): string {
  return CATEGORY_COLORS[goal] || CATEGORY_COLORS['General'];
}

// Confidence display config
export const CONFIDENCE_CONFIG: Record<string, { label: string; color: string }> = {
  'strong': { label: 'Strong evidence', color: '#16A34A' },
  'good': { label: 'Good evidence', color: '#D97706' },
  'emerging': { label: 'Emerging evidence', color: '#6B7280' },
};
```

- [ ] **Step 2: Verify no TypeScript errors**

Run:
```bash
cd C:/Users/AbhayGodara/Projects/Supp/stackiq && npx tsc --noEmit 2>&1 | head -20
```

Note: Errors referencing `TILE_STEPS`, `TileOption`, or `ChatStep` in `src/app/chat/page.tsx` are expected (that file is rewritten later). No errors should originate from `src/lib/chat-types.ts` itself.

- [ ] **Step 3: Commit**

```bash
git add src/lib/chat-types.ts
git commit -m "feat: add shared TypeScript types for chat system"
```

---

### Task 4: Rewrite chat-config.ts (new system prompt)

**Files:**
- Rewrite: `src/lib/chat-config.ts`

- [ ] **Step 1: Replace chat-config.ts entirely**

Overwrite `src/lib/chat-config.ts` with:

```typescript
// Clinical consultation system prompt — replaces the old tile-based config.
// No more TILE_STEPS, no more phases. Pure conversational AI flow.

export const AI_SYSTEM_PROMPT = `You are a clinical supplement advisor at StackIQ, a premium personalized supplement consultation service. Think of yourself as a nutritionist at a specialized clinic — warm but precise, using proper clinical terminology.

## Your Role
You conduct evidence-based supplement consultations. You gather health information conversationally, then provide a tailored supplement protocol.

## Consultation Flow

### Phase 1: Information Gathering
When a new consultation starts, introduce yourself briefly and begin collecting the following information through natural conversation (not a checklist):

- Primary health goals and concerns
- Current diet patterns
- Age and biological sex
- Exercise habits and frequency
- Stress levels and sleep quality
- Monthly supplement budget (in INR)
- Current medications or supplements (for interaction screening)

Ask 1-2 questions per message. Adapt your follow-up questions based on what the user tells you. You decide when you have enough context — there is no fixed number of questions.

### Phase 2: Recommendations
When you have sufficient information:
1. Summarize the key findings from your assessment
2. Present your supplement protocol using the special format below
3. Explain dosage, timing, and the evidence basis for each recommendation

## Supplement Recommendation Format
When recommending supplements, use this EXACT format for each supplement (the frontend renders these as interactive cards):

\`\`\`
:::supplement
{"name": "Full Supplement Name + Form", "slug": "slug-name", "dosage": "dose with unit", "timing": "When to take", "goal": "Primary Goal Category", "confidence": "strong|good|emerging"}
:::
\`\`\`

Rules for the JSON fields:
- **name**: Full name including specific form (e.g., "Magnesium L-Threonate" not "Magnesium")
- **slug**: URL-safe lowercase with hyphens (e.g., "magnesium-l-threonate")
- **dosage**: Include amount and unit (e.g., "400mg", "2000 IU")
- **timing**: When to take it (e.g., "Evening, with dinner", "Morning, empty stomach")
- **goal**: One of: "Sleep", "Cognition", "Energy", "Stress", "Gut Health", or "General"
- **confidence**: One of: "strong" (multiple RCTs), "good" (some RCTs), "emerging" (preliminary evidence)

Place each :::supplement block on its own line, with regular markdown text before/after for explanations.

## Tone & Style
- Clinical professional: warm but precise
- Use proper terminology (bioavailability, RCT, half-life, etc.)
- Structure responses with **bold** headers and numbered lists where appropriate
- Always end messages with a clear question to keep the consultation moving
- Keep messages focused — 3-5 sentences for questions, longer for recommendations
- Frame everything as "evidence-based educational guidance" not medical advice
- Include the disclaimer "This is educational guidance — consult your healthcare provider" when giving final recommendations
- Reference Indian pricing (INR) for cost estimates where applicable
- Recommend 2-5 supplements in a final protocol, depending on the user's needs and budget

## Opening Message
For the very first message of a new consultation, use something like:
"Good [time of day]. I'm your StackIQ clinical advisor — think of me as a nutritionist at a specialized supplement clinic. I'll conduct a brief health assessment and then build an evidence-based supplement protocol tailored to your specific needs. Let's start: **what are the primary health outcomes you're looking to improve?**"
`;

// Opening message sent automatically when a new conversation is created.
// This is inserted as an assistant message directly (not via API call).
export const OPENING_MESSAGE = `Good day. I'm your StackIQ clinical advisor — think of me as a nutritionist at a specialized supplement clinic. I'll conduct a brief health assessment and then build an evidence-based supplement protocol tailored to your specific needs.

To get started: **What are the primary health outcomes you're looking to improve?** For example — sleep quality, mental clarity, energy levels, stress management, or something else entirely.`;
```

- [ ] **Step 2: Verify the file compiles**

Run:
```bash
cd C:/Users/AbhayGodara/Projects/Supp/stackiq && npx tsc --noEmit 2>&1 | head -20
```

Expected errors will reference `TILE_STEPS`, `TileOption`, or `ChatStep` in files like `src/app/chat/page.tsx`. These are expected since that file is being rewritten in a later task. Any errors originating FROM `src/lib/chat-config.ts` itself indicate a problem.

- [ ] **Step 3: Commit**

```bash
git add src/lib/chat-config.ts
git commit -m "feat: replace tile config with clinical consultation system prompt"
```

---

### Task 5: Rewrite API route

**Files:**
- Rewrite: `src/app/api/chat/route.ts`

- [ ] **Step 1: Replace route.ts entirely**

Overwrite `src/app/api/chat/route.ts` with:

```typescript
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { AI_SYSTEM_PROMPT } from "@/lib/chat-config";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, conversationId } = await req.json();

    // Log for debugging (conversationId is for tracking only)
    if (conversationId) {
      console.log(`[chat] conversation=${conversationId}, messages=${messages?.length || 0}`);
    }

    const systemMessage = {
      role: "system" as const,
      content: AI_SYSTEM_PROMPT,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [systemMessage, ...messages],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const aiMessage = response.choices[0]?.message;

    return NextResponse.json({
      content: aiMessage?.content || "I couldn't generate a response. Please try again.",
    });
  } catch (error: unknown) {
    console.error("Chat API error:", error);

    // NOTE: Error responses use the same { content } shape for simplicity.
    // Clients MUST check response.ok / status code before treating content as a valid assistant message.
    if (error instanceof Error && error.message?.includes("API key")) {
      return NextResponse.json(
        { content: "OpenAI API key not configured. Please add OPENAI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { content: "Something went wrong with the AI service. Please try again." },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Verify build of API route**

Run:
```bash
cd C:/Users/AbhayGodara/Projects/Supp/stackiq && npx tsc --noEmit 2>&1 | head -20
```

Expected errors about `TILE_STEPS`/`TileOption` in `chat/page.tsx` are fine. No errors should originate from `src/app/api/chat/route.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/chat/route.ts
git commit -m "feat: update chat API route with new contract and increased token limit"
```

---

## Chunk 2: UI Components (Bottom-Up)

### Task 6: Create SupplementCard component

**Files:**
- Create: `src/components/chat/SupplementCard.tsx`

- [ ] **Step 1: Write SupplementCard**

Create `src/components/chat/SupplementCard.tsx`:

```typescript
"use client";

import { ArrowUpRight } from "lucide-react";
import { SupplementBlock, getCategoryColor, CONFIDENCE_CONFIG } from "@/lib/chat-types";

export default function SupplementCard({ supplement }: { supplement: SupplementBlock }) {
  const categoryColor = getCategoryColor(supplement.goal);
  const confidenceInfo = CONFIDENCE_CONFIG[supplement.confidence] || CONFIDENCE_CONFIG['emerging'];

  const handleClick = () => {
    window.open(`/supplement/${supplement.slug}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        padding: "14px 16px",
        backgroundColor: "#F9FAFB",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "12px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s ease",
        marginTop: "8px",
        marginBottom: "8px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.14)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
      }}
    >
      {/* Category dot */}
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: categoryColor,
          flexShrink: 0,
        }}
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "15px", fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>
          {supplement.name}
        </div>
        <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>
          {supplement.dosage} · {supplement.timing} · {supplement.goal}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: confidenceInfo.color,
            }}
          />
          <span style={{ fontSize: "11px", color: confidenceInfo.color, fontWeight: 500 }}>
            {confidenceInfo.label}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ArrowUpRight size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/SupplementCard.tsx
git commit -m "feat: add SupplementCard component for inline recommendations"
```

---

### Task 7: Rewrite ChatMarkdown with supplement block detection

**Files:**
- Rewrite: `src/components/ChatMarkdown.tsx`

- [ ] **Step 1: Replace ChatMarkdown.tsx entirely**

Overwrite `src/components/ChatMarkdown.tsx` with:

```typescript
"use client";

import React from "react";
import SupplementCard from "@/components/chat/SupplementCard";
import { SupplementBlock } from "@/lib/chat-types";

// ── Inline parser ──────────────────────────────────────────────────────────

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    const matches = [
      boldMatch ? { type: "bold", match: boldMatch } : null,
      italicMatch ? { type: "italic", match: italicMatch } : null,
      codeMatch ? { type: "code", match: codeMatch } : null,
      linkMatch ? { type: "link", match: linkMatch } : null,
    ]
      .filter(Boolean)
      .sort((a, b) => (a!.match.index ?? 0) - (b!.match.index ?? 0));

    if (matches.length === 0 || matches[0] === null) {
      parts.push(remaining);
      break;
    }

    const earliest = matches[0]!;
    const idx = earliest.match.index ?? 0;

    if (idx > 0) {
      parts.push(remaining.slice(0, idx));
    }

    const inner = earliest.match[1];
    if (earliest.type === "bold") {
      parts.push(
        <strong key={key++} style={{ fontWeight: 600, color: "#111827" }}>
          {inner}
        </strong>
      );
    } else if (earliest.type === "italic") {
      parts.push(
        <em key={key++} style={{ fontStyle: "italic", color: "rgba(17,24,39,0.8)" }}>
          {inner}
        </em>
      );
    } else if (earliest.type === "code") {
      parts.push(
        <code
          key={key++}
          style={{
            backgroundColor: "rgba(0,0,0,0.04)",
            color: "#16A34A",
            fontSize: "12px",
            fontFamily: "'IBM Plex Mono', monospace",
            padding: "1px 6px",
            borderRadius: "4px",
          }}
        >
          {inner}
        </code>
      );
    } else if (earliest.type === "link") {
      const linkText = earliest.match[1];
      const linkUrl = earliest.match[2];
      parts.push(
        <a
          key={key++}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#16A34A", textDecoration: "underline" }}
        >
          {linkText}
        </a>
      );
    }

    remaining = remaining.slice(idx + earliest.match[0].length);
  }

  return parts;
}

// ── Supplement block parser ────────────────────────────────────────────────

const SUPPLEMENT_REGEX = /:::supplement\s*(\{[\s\S]*?\})\s*:::/g;

function parseSupplementBlock(jsonStr: string): SupplementBlock | null {
  try {
    const parsed = JSON.parse(jsonStr);
    return {
      name: parsed.name || "Unknown Supplement",
      slug: parsed.slug || "unknown",
      dosage: parsed.dosage || "See details",
      timing: parsed.timing || "As directed",
      goal: parsed.goal || "General",
      confidence: ["strong", "good", "emerging"].includes(parsed.confidence)
        ? parsed.confidence
        : "emerging",
    };
  } catch {
    return null;
  }
}

interface ContentSegment {
  type: "text" | "supplement" | "malformed";
  content: string;
  supplement?: SupplementBlock;
}

function splitContent(raw: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  // Reset regex state
  SUPPLEMENT_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = SUPPLEMENT_REGEX.exec(raw)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: raw.slice(lastIndex, match.index) });
    }

    const supplement = parseSupplementBlock(match[1]);
    if (supplement) {
      segments.push({ type: "supplement", content: match[0], supplement });
    } else {
      // Malformed JSON — render as code block
      segments.push({ type: "malformed", content: match[1] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last match
  if (lastIndex < raw.length) {
    segments.push({ type: "text", content: raw.slice(lastIndex) });
  }

  return segments;
}

// ── Markdown block renderer ────────────────────────────────────────────────

function renderMarkdownText(text: string, startKey: number): { nodes: React.ReactNode[]; nextKey: number } {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: { text: string; ordered: boolean }[] = [];
  let key = startKey;

  const flushList = () => {
    if (listItems.length === 0) return;
    const isOrdered = listItems[0].ordered;
    const Tag = isOrdered ? "ol" : "ul";
    elements.push(
      <Tag
        key={key++}
        style={{
          listStyleType: isOrdered ? "decimal" : "disc",
          marginLeft: "16px",
          marginTop: "8px",
          marginBottom: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {listItems.map((item, i) => (
          <li
            key={i}
            style={{
              color: "#374151",
              fontSize: "15px",
              lineHeight: 1.7,
              paddingLeft: "4px",
            }}
          >
            {parseInline(item.text)}
          </li>
        ))}
      </Tag>
    );
    listItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Heading: ### text, ## text, # text
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const fontSize = level === 1 ? "18px" : level === 2 ? "16px" : "15px";
      elements.push(
        <p key={key++} style={{ fontSize, fontWeight: 600, color: "#111827", lineHeight: 1.5, marginTop: "8px" }}>
          {parseInline(headingMatch[2])}
        </p>
      );
      continue;
    }

    const ulMatch = trimmed.match(/^[-*]\s+(.+)/);
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/);

    if (ulMatch) {
      if (listItems.length > 0 && listItems[0].ordered) flushList();
      listItems.push({ text: ulMatch[1], ordered: false });
      continue;
    }

    if (olMatch) {
      if (listItems.length > 0 && !listItems[0].ordered) flushList();
      listItems.push({ text: olMatch[2], ordered: true });
      continue;
    }

    flushList();

    if (trimmed === "") {
      elements.push(<div key={key++} style={{ height: "8px" }} />);
      continue;
    }

    elements.push(
      <p key={key++} style={{ color: "#374151", fontSize: "15px", lineHeight: 1.7 }}>
        {parseInline(trimmed)}
      </p>
    );
  }

  flushList();
  return { nodes: elements, nextKey: key };
}

// ── Main component ─────────────────────────────────────────────────────────

export function ChatMarkdown({ content }: { content: string }) {
  const segments = splitContent(content);
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const segment of segments) {
    if (segment.type === "supplement" && segment.supplement) {
      elements.push(
        <SupplementCard key={key++} supplement={segment.supplement} />
      );
    } else if (segment.type === "malformed") {
      elements.push(
        <pre
          key={key++}
          style={{
            backgroundColor: "rgba(0,0,0,0.04)",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#DC2626",
            overflowX: "auto",
            margin: "8px 0",
          }}
        >
          {segment.content}
        </pre>
      );
    } else {
      const { nodes, nextKey } = renderMarkdownText(segment.content, key);
      elements.push(...nodes);
      key = nextKey;
    }
  }

  return <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>{elements}</div>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ChatMarkdown.tsx
git commit -m "feat: rewrite ChatMarkdown with inline styles and supplement block parsing"
```

---

### Task 8: Create MessageBlock component

**Files:**
- Create: `src/components/chat/MessageBlock.tsx`

- [ ] **Step 1: Write MessageBlock**

Create `src/components/chat/MessageBlock.tsx`:

```typescript
"use client";

import { Stethoscope } from "lucide-react";
import { Message } from "@/lib/chat-types";
import { ChatMarkdown } from "@/components/ChatMarkdown";

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

interface MessageBlockProps {
  message: Message;
  userDisplayName: string;
  onRetry?: () => void;
}

export default function MessageBlock({ message, userDisplayName, onRetry }: MessageBlockProps) {
  const isAssistant = message.role === "assistant";
  const name = isAssistant ? "StackIQ Advisor" : userDisplayName;
  const initial = isAssistant ? "S" : (userDisplayName?.[0] || "U").toUpperCase();

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
        opacity: message.status === "sending" ? 0.6 : 1,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "2px",
          ...(isAssistant
            ? { backgroundColor: "#16A34A" }
            : { backgroundColor: "#EFF6FF", border: "1px solid #BFDBFE" }),
        }}
      >
        {isAssistant ? (
          <Stethoscope size={14} color="#FFFFFF" />
        ) : (
          <span style={{ fontSize: "12px", fontWeight: 600, color: "#3B82F6" }}>
            {initial}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Author line */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "4px" }}>
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
            {name}
          </span>
          <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
            {formatTime(message.created_at)}
          </span>
          {message.status === "error" && (
            <span style={{ fontSize: "11px", color: "#DC2626", fontWeight: 500 }}>
              {message.role === "assistant" ? "Failed to generate" : "Failed to send"}
            </span>
          )}
        </div>

        {/* Message content */}
        <div style={{ paddingLeft: "0px" }}>
          <ChatMarkdown content={message.content} />
        </div>

        {/* Retry button for error assistant messages */}
        {message.status === "error" && message.role === "assistant" && onRetry && (
          <button
            onClick={onRetry}
            style={{
              marginTop: "8px",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: 500,
              color: "#DC2626",
              backgroundColor: "rgba(220,38,38,0.06)",
              border: "1px solid rgba(220,38,38,0.15)",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/MessageBlock.tsx
git commit -m "feat: add MessageBlock component for thread-style messages"
```

---

### Task 9: Create MessageThread component

**Files:**
- Create: `src/components/chat/MessageThread.tsx`

- [ ] **Step 1: Write MessageThread**

Create `src/components/chat/MessageThread.tsx`:

```typescript
"use client";

import { useRef, useEffect } from "react";
import { Message } from "@/lib/chat-types";
import MessageBlock from "./MessageBlock";
import { Stethoscope, Loader2 } from "lucide-react";

interface MessageThreadProps {
  messages: Message[];
  isLoading: boolean;
  userDisplayName: string;
  onRetry?: () => void;
}

export default function MessageThread({ messages, isLoading, userDisplayName, onRetry }: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          maxWidth: "680px",
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          padding: "24px 24px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {messages.length === 0 && !isLoading && (
          <div style={{ textAlign: "center", paddingTop: "80px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: "rgba(22,163,74,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginLeft: "auto",
                marginRight: "auto",
                marginBottom: "16px",
              }}
            >
              <Stethoscope size={24} color="#16A34A" />
            </div>
            <p style={{ color: "#6B7280", fontSize: "15px" }}>
              Your consultation will begin shortly...
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBlock
            key={msg.id}
            message={msg}
            userDisplayName={userDisplayName}
            onRetry={msg.status === "error" && msg.role === "assistant" ? onRetry : undefined}
          />
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                backgroundColor: "#16A34A",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Stethoscope size={14} color="#FFFFFF" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingTop: "6px" }}>
              <Loader2 size={16} color="#16A34A" style={{ animation: "spin 1s linear infinite" }} />
              <span style={{ fontSize: "13px", color: "#9CA3AF" }}>Advisor is typing...</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/MessageThread.tsx
git commit -m "feat: add MessageThread component with auto-scroll"
```

---

### Task 10: Create TiptapEditor component

**Files:**
- Create: `src/components/chat/TiptapEditor.tsx`

- [ ] **Step 1: Write TiptapEditor**

Create `src/components/chat/TiptapEditor.tsx`:

```typescript
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { Bold, Italic, List, Send } from "lucide-react";

interface TiptapEditorProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function TiptapEditor({ onSend, disabled = false }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: "Describe your situation in detail...",
      }),
      Markdown,
    ],
    editorProps: {
      attributes: {
        style: [
          "min-height: 60px",
          "max-height: 160px",
          "overflow-y: auto",
          "outline: none",
          "font-size: 15px",
          "line-height: 1.6",
          "color: #111827",
          "padding: 12px 14px",
          "font-family: 'Epilogue', sans-serif",
        ].join("; "),
      },
      handleKeyDown: (_view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          event.preventDefault();
          handleSend();
          return true;
        }
        return false;
      },
    },
  });

  const handleSend = () => {
    if (!editor || disabled) return;

    // Try to get markdown content, fall back to plain text
    let content = "";
    try {
      // tiptap-markdown adds getMarkdown() method
      const editorAny = editor as any;
      if (typeof editorAny.storage?.markdown?.getMarkdown === "function") {
        content = editorAny.storage.markdown.getMarkdown();
      } else {
        content = editor.getText();
      }
    } catch {
      content = editor.getText();
    }

    const trimmed = content.trim();
    if (!trimmed) return;

    onSend(trimmed);
    editor.commands.clearContent();
  };

  const isActive = (type: string) => editor?.isActive(type) ?? false;

  const toolbarButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: "4px 6px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: active ? "rgba(22,163,74,0.1)" : "transparent",
    color: active ? "#16A34A" : "#D1D5DB",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  });

  return (
    <div
      style={{
        borderTop: "1px solid rgba(0,0,0,0.08)",
        padding: "12px 24px 16px",
        backgroundColor: "#FFFFFF",
      }}
    >
      <div
        style={{
          maxWidth: "680px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div
          style={{
            border: "1.5px solid #D1D5DB",
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? "none" : "auto",
          }}
        >
          {/* Editor area */}
          <EditorContent editor={editor} />

          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              gap: "2px",
            }}
          >
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              style={toolbarButtonStyle(isActive("bold"))}
              title="Bold (Ctrl+B)"
              type="button"
            >
              <Bold size={15} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              style={toolbarButtonStyle(isActive("italic"))}
              title="Italic (Ctrl+I)"
              type="button"
            >
              <Italic size={15} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              style={toolbarButtonStyle(isActive("bulletList"))}
              title="Bullet list"
              type="button"
            >
              <List size={15} />
            </button>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Send hint */}
            <span style={{ fontSize: "11px", color: "#9CA3AF", marginRight: "8px" }}>
              Ctrl+Enter to send
            </span>

            {/* Send button */}
            <button
              onClick={handleSend}
              style={{
                backgroundColor: "#16A34A",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                padding: "6px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600,
                transition: "opacity 0.15s",
              }}
              type="button"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add Tiptap placeholder CSS and spin animation to globals.css**

The Tiptap placeholder extension needs a CSS rule, and the spinner/loader needs a `spin` keyframe. Append both to `src/app/globals.css` (after the existing styles):

```css
/* Tiptap placeholder */
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  float: left;
  color: #9CA3AF;
  pointer-events: none;
  height: 0;
  font-size: 15px;
}

/* Spin animation for loaders */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/chat/TiptapEditor.tsx src/app/globals.css
git commit -m "feat: add TiptapEditor component with markdown serialization"
```

---

### Task 11: Create ChatSidebar component

**Files:**
- Create: `src/components/chat/ChatSidebar.tsx`

- [ ] **Step 1: Write ChatSidebar**

Create `src/components/chat/ChatSidebar.tsx`:

```typescript
"use client";

import { X, Plus, MessageSquare } from "lucide-react";
import { Conversation } from "@/lib/chat-types";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface ChatSidebarProps {
  isOpen: boolean;
  conversations: Conversation[];
  activeConversationId: string | null;
  onClose: () => void;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
}

export default function ChatSidebar({
  isOpen,
  conversations,
  activeConversationId,
  onClose,
  onNewChat,
  onSelectConversation,
}: ChatSidebarProps) {
  return (
    <>
      {/* Backdrop (visible when open) */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.2)",
            zIndex: 40,
            transition: "opacity 0.3s ease",
          }}
        />
      )}

      {/* Sidebar panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "320px",
          maxWidth: "100vw",
          backgroundColor: "#F9FAFB",
          borderLeft: "1px solid rgba(0,0,0,0.08)",
          zIndex: 50,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
            Consultations
          </span>
          <button
            onClick={onClose}
            style={{
              padding: "4px",
              border: "none",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#6B7280",
              borderRadius: "4px",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* New chat button */}
        <div style={{ padding: "12px 16px" }}>
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              width: "100%",
              padding: "10px 14px",
              backgroundColor: "#16A34A",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            <Plus size={16} />
            New Consultation
          </button>
        </div>

        {/* Conversation list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "0 8px 16px",
          }}
        >
          {conversations.length === 0 && (
            <p style={{ textAlign: "center", color: "#9CA3AF", fontSize: "13px", paddingTop: "24px" }}>
              No consultations yet
            </p>
          )}
          {conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            return (
              <button
                key={conv.id}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onClose();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  width: "100%",
                  padding: "10px 12px",
                  backgroundColor: isActive ? "#F0FDF4" : "transparent",
                  border: "none",
                  borderLeft: isActive ? "3px solid #16A34A" : "3px solid transparent",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background-color 0.15s",
                  marginBottom: "2px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "#F0FDF4";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <MessageSquare size={14} color={isActive ? "#16A34A" : "#9CA3AF"} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 400,
                      color: "#111827",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {conv.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
                    {timeAgo(conv.updated_at)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/ChatSidebar.tsx
git commit -m "feat: add ChatSidebar component with conversation history"
```

---

### Task 12: Create ChatProvider context

**Files:**
- Create: `src/components/chat/ChatProvider.tsx`

- [ ] **Step 1: Write ChatProvider**

Create `src/components/chat/ChatProvider.tsx`:

```typescript
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { OPENING_MESSAGE } from "@/lib/chat-config";
import { Conversation, Message } from "@/lib/chat-types";

// ── Context type ───────────────────────────────────────────────────────────

interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: Message[];
  isLoading: boolean;
  isSidebarOpen: boolean;
  isInitialized: boolean;
  userDisplayName: string;
  createConversation: () => Promise<void>;
  switchConversation: (id: string) => Promise<void>;
  sendMessage: (content: string) => Promise<void>;
  toggleSidebar: () => void;
  retryLastAICall: () => Promise<void>;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function useChatContext() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatContext must be used inside ChatProvider");
  return ctx;
}

// ── Provider ───────────────────────────────────────────────────────────────

export default function ChatProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [userDisplayName, setUserDisplayName] = useState("You");
  const [userId, setUserId] = useState<string | null>(null);

  // ── Init: get user + load conversations ──────────────────────────────

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setUserId(user.id);
      // Display name: email prefix
      const emailPrefix = user.email?.split("@")[0] || "User";
      setUserDisplayName(emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1));

      // Fetch conversations
      const { data: convos } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (convos && convos.length > 0) {
        setConversations(convos);
        // Load most recent
        const latest = convos[0];
        setActiveConversationId(latest.id);
        await loadMessages(latest.id);
      } else {
        // No conversations — create one
        await createFirstConversation(user.id);
      }

      setIsInitialized(true);
    };

    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load messages for a conversation ─────────────────────────────────

  const loadMessages = async (conversationId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    setMessages((data || []).map((m: any) => ({ ...m, status: "sent" as const })));
  };

  // ── Create first conversation (on first visit) ──────────────────────

  const createFirstConversation = async (uid: string) => {
    const { data: conv, error } = await supabase
      .from("conversations")
      .insert({ user_id: uid, title: "New Consultation" })
      .select()
      .single();

    if (error || !conv) {
      console.error("Failed to create conversation:", error);
      return;
    }

    // Insert opening message
    const { data: msg } = await supabase
      .from("messages")
      .insert({
        conversation_id: conv.id,
        role: "assistant",
        content: OPENING_MESSAGE,
      })
      .select()
      .single();

    setConversations([conv]);
    setActiveConversationId(conv.id);
    setMessages(msg ? [{ ...msg, status: "sent" as const }] : []);
  };

  // ── Create new conversation ──────────────────────────────────────────

  const createConversation = useCallback(async () => {
    if (!userId) return;

    const { data: conv, error } = await supabase
      .from("conversations")
      .insert({ user_id: userId, title: "New Consultation" })
      .select()
      .single();

    if (error || !conv) {
      console.error("Failed to create conversation:", error);
      return;
    }

    // Insert opening message
    const { data: msg } = await supabase
      .from("messages")
      .insert({
        conversation_id: conv.id,
        role: "assistant",
        content: OPENING_MESSAGE,
      })
      .select()
      .single();

    setConversations((prev) => [conv, ...prev]);
    setActiveConversationId(conv.id);
    setMessages(msg ? [{ ...msg, status: "sent" as const }] : []);
  }, [userId, supabase]);

  // ── Switch conversation ──────────────────────────────────────────────

  const switchConversation = useCallback(async (id: string) => {
    if (id === activeConversationId) return;
    setActiveConversationId(id);
    setMessages([]);
    await loadMessages(id);
  }, [activeConversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send message ─────────────────────────────────────────────────────

  const sendMessage = useCallback(async (content: string) => {
    if (!activeConversationId || isLoading) return;

    const tempId = `temp-${Date.now()}`;
    const userMessage: Message = {
      id: tempId,
      conversation_id: activeConversationId,
      role: "user",
      content,
      created_at: new Date().toISOString(),
      status: "sending",
    };

    // Optimistic add
    setMessages((prev) => [...prev, userMessage]);

    // Insert to DB
    const { data: savedMsg, error: dbError } = await supabase
      .from("messages")
      .insert({
        conversation_id: activeConversationId,
        role: "user",
        content,
      })
      .select()
      .single();

    if (dbError || !savedMsg) {
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "error" as const } : m))
      );
      return;
    }

    // Replace temp message with saved one
    setMessages((prev) =>
      prev.map((m) => (m.id === tempId ? { ...savedMsg, status: "sent" as const } : m))
    );

    // Generate title from first user message
    const isFirstUserMsg = messages.filter((m) => m.role === "user").length === 0;
    if (isFirstUserMsg) {
      const title = content.slice(0, 50) + (content.length > 50 ? "..." : "");
      await supabase
        .from("conversations")
        .update({ title, updated_at: new Date().toISOString() })
        .eq("id", activeConversationId);

      setConversations((prev) =>
        prev.map((c) => (c.id === activeConversationId ? { ...c, title, updated_at: new Date().toISOString() } : c))
      );
    } else {
      // Just update timestamp
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeConversationId);

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversationId ? { ...c, updated_at: new Date().toISOString() } : c
        )
      );
    }

    // Call AI
    setIsLoading(true);
    try {
      // Build messages array for API (only role + content)
      const apiMessages = [...messages, { ...savedMsg, status: "sent" as const }]
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          conversationId: activeConversationId,
        }),
      });

      const data = await res.json();

      // Save assistant message to DB
      const { data: aiMsg } = await supabase
        .from("messages")
        .insert({
          conversation_id: activeConversationId,
          role: "assistant",
          content: data.content,
        })
        .select()
        .single();

      if (aiMsg) {
        setMessages((prev) => [...prev, { ...aiMsg, status: "sent" as const }]);
      }
    } catch (err) {
      console.error("AI call failed:", err);
      // Add error system message
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        conversation_id: activeConversationId,
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try sending your message again.",
        created_at: new Date().toISOString(),
        status: "error",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, isLoading, messages, supabase]);

  // ── Retry last AI call ───────────────────────────────────────────────

  const retryLastAICall = useCallback(async () => {
    // Remove the error message, then resend
    setMessages((prev) => {
      const withoutError = prev.filter((m) => m.status !== "error" || m.role !== "assistant");
      return withoutError;
    });
    // Find the last user message and resend
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMsg) {
      // Re-trigger AI call without re-inserting user message
      setIsLoading(true);
      try {
        const apiMessages = messages
          .filter((m) => m.status !== "error")
          .filter((m) => m.role === "user" || m.role === "assistant")
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            conversationId: activeConversationId,
          }),
        });

        const data = await res.json();

        const { data: aiMsg } = await supabase
          .from("messages")
          .insert({
            conversation_id: activeConversationId!,
            role: "assistant",
            content: data.content,
          })
          .select()
          .single();

        if (aiMsg) {
          setMessages((prev) => [
            ...prev.filter((m) => !(m.status === "error" && m.role === "assistant")),
            { ...aiMsg, status: "sent" as const },
          ]);
        }
      } catch {
        const errorMsg: Message = {
          id: `error-${Date.now()}`,
          conversation_id: activeConversationId!,
          role: "assistant",
          content: "Still having connection issues. Please check your internet and try again.",
          created_at: new Date().toISOString(),
          status: "error",
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    }
  }, [messages, activeConversationId, supabase]);

  // ── Toggle sidebar ───────────────────────────────────────────────────

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  // ── Context value ────────────────────────────────────────────────────

  const value: ChatContextType = {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    isSidebarOpen,
    isInitialized,
    userDisplayName,
    createConversation,
    switchConversation,
    sendMessage,
    toggleSidebar,
    retryLastAICall,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/chat/ChatProvider.tsx
git commit -m "feat: add ChatProvider context with Supabase persistence and AI integration"
```

---

## Chunk 3: Page Assembly & Polish

### Task 13: Create chat layout.tsx

**Files:**
- Create: `src/app/chat/layout.tsx`

- [ ] **Step 1: Write layout.tsx**

Create `src/app/chat/layout.tsx`:

```typescript
import ChatProvider from "@/components/chat/ChatProvider";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <ChatProvider>{children}</ChatProvider>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/chat/layout.tsx
git commit -m "feat: add chat layout wrapper with ChatProvider"
```

---

### Task 14: Rewrite chat page.tsx

**Files:**
- Rewrite: `src/app/chat/page.tsx`

- [ ] **Step 1: Replace page.tsx entirely**

Overwrite `src/app/chat/page.tsx` with:

```typescript
"use client";

import Navbar from "@/components/Navbar";
import MessageThread from "@/components/chat/MessageThread";
import ChatSidebar from "@/components/chat/ChatSidebar";
import TiptapEditor from "@/components/chat/TiptapEditor";
import { useChatContext } from "@/components/chat/ChatProvider";
import { Loader2 } from "lucide-react";

export default function ChatPage() {
  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    isSidebarOpen,
    isInitialized,
    userDisplayName,
    createConversation,
    switchConversation,
    sendMessage,
    toggleSidebar,
    retryLastAICall,
  } = useChatContext();

  // Loading state
  if (!isInitialized) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF", display: "flex", flexDirection: "column" }}>
        <Navbar onToggleSidebar={toggleSidebar} />
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          <Loader2 size={24} color="#16A34A" style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#6B7280", fontSize: "14px" }}>Loading your consultations...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", height: "100vh", backgroundColor: "#FFFFFF", display: "flex", flexDirection: "column" }}>
      <Navbar onToggleSidebar={toggleSidebar} />

      <div style={{ flex: 1, position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        {/* Message thread */}
        <MessageThread
          messages={messages}
          isLoading={isLoading}
          userDisplayName={userDisplayName}
          onRetry={retryLastAICall}
        />

        {/* Sidebar */}
        <ChatSidebar
          isOpen={isSidebarOpen}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onClose={toggleSidebar}
          onNewChat={createConversation}
          onSelectConversation={switchConversation}
        />

        {/* Editor */}
        <TiptapEditor
          onSend={sendMessage}
          disabled={isLoading}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify build**

Run:
```bash
cd C:/Users/AbhayGodara/Projects/Supp/stackiq && npm run build
```

Expected: Build succeeds with no errors. If there are Tiptap SSR issues, check the error and wrap editor in dynamic import.

- [ ] **Step 3: Commit**

```bash
git add src/app/chat/page.tsx
git commit -m "feat: rewrite chat page as thin shell with thread, sidebar, and editor"
```

---

### Task 15: Update Navbar with sidebar toggle and fix responsive

**Files:**
- Modify: `src/components/Navbar.tsx`

- [ ] **Step 1: Replace Navbar.tsx entirely**

Overwrite `src/components/Navbar.tsx` with:

```typescript
"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { LogOut, Menu, X, Clock } from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps = {}) {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const isChat = pathname === "/chat";

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Responsive check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <div style={{ maxWidth: "52rem", marginLeft: "auto", marginRight: "auto", paddingLeft: "1.5rem", paddingRight: "1.5rem", height: "3.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
          <div style={{ width: "1.75rem", height: "1.75rem", backgroundColor: "#16A34A", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#FFFFFF", fontSize: "0.875rem", fontWeight: 900 }}>&#9672;</span>
          </div>
          <span style={{ color: "#111827", fontSize: "0.9375rem", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, letterSpacing: "0.04em" }}>
            STACKIQ
          </span>
        </Link>

        {/* Desktop Nav */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {user ? (
              <>
                <Link
                  href="/chat"
                  style={{ padding: "0.375rem 1rem", fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", color: "#6B7280", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "0.375rem", textDecoration: "none" }}
                >
                  CHAT
                </Link>
                <Link
                  href="/stack"
                  style={{ padding: "0.375rem 1rem", fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", color: "#6B7280", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "0.375rem", textDecoration: "none" }}
                >
                  MY STACK
                </Link>

                {/* Sidebar toggle (only on chat page) */}
                {isChat && onToggleSidebar && (
                  <button
                    onClick={onToggleSidebar}
                    style={{ padding: "0.375rem", color: "#6B7280", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "0.375rem", background: "none", cursor: "pointer" }}
                    title="Consultation history"
                  >
                    <Clock size={14} />
                  </button>
                )}

                <div style={{ width: "1px", height: "1.25rem", backgroundColor: "rgba(0,0,0,0.08)", marginLeft: "0.25rem", marginRight: "0.25rem" }} />
                <span style={{ color: "#6B7280", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  style={{ padding: "0.375rem", color: "#6B7280", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "0.375rem", background: "none", cursor: "pointer" }}
                  title="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  style={{ padding: "0.375rem 1rem", fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", color: "#6B7280", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "0.375rem", textDecoration: "none" }}
                >
                  LOG IN
                </Link>
                <Link
                  href="/auth/signup"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", fontWeight: 700, color: "#FFFFFF", backgroundColor: "#16A34A", borderRadius: "0.5rem", textDecoration: "none" }}
                >
                  GET STARTED
                </Link>
              </>
            )}
          </div>
        )}

        {/* Mobile toggle */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {/* Sidebar toggle on mobile (chat page only) */}
            {isChat && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                style={{ padding: "0.5rem", color: "#6B7280", background: "none", border: "none", cursor: "pointer" }}
                title="Consultation history"
              >
                <Clock size={20} />
              </button>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ padding: "0.5rem", color: "#6B7280", background: "none", border: "none", cursor: "pointer" }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && isMobile && (
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#FFFFFF" }}>
          <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {user ? (
              <>
                <Link href="/chat" onClick={() => setMenuOpen(false)} style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", fontFamily: "'IBM Plex Mono', monospace", color: "#111827", textDecoration: "none", borderRadius: "0.5rem" }}>
                  Chat
                </Link>
                <Link href="/stack" onClick={() => setMenuOpen(false)} style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", fontFamily: "'IBM Plex Mono', monospace", color: "#111827", textDecoration: "none", borderRadius: "0.5rem" }}>
                  My Stack
                </Link>
                <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.06)" }} />
                <span style={{ padding: "0 1rem", color: "#6B7280", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace" }}>
                  {user.email}
                </span>
                <button
                  onClick={() => { handleSignOut(); setMenuOpen(false); }}
                  style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", fontFamily: "'IBM Plex Mono', monospace", color: "#DC2626", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderRadius: "0.5rem" }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", fontFamily: "'IBM Plex Mono', monospace", color: "#111827", textDecoration: "none", borderRadius: "0.5rem" }}>
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMenuOpen(false)}
                  style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: "#FFFFFF", backgroundColor: "#16A34A", borderRadius: "0.5rem", textDecoration: "none", textAlign: "center" }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Verify chat page.tsx already has onToggleSidebar**

The `Navbar onToggleSidebar={toggleSidebar}` prop was already added in Task 14 when we rewrote `page.tsx`. Verify it's there by checking the file.

- [ ] **Step 3: Commit**

```bash
git add src/components/Navbar.tsx src/app/chat/page.tsx
git commit -m "feat: update Navbar with sidebar toggle and JS-based responsive"
```

---

### Task 16: Create supplement detail page

**Files:**
- Create: `src/app/supplement/[slug]/page.tsx`

- [ ] **Step 1: Write placeholder page**

Create `src/app/supplement/[slug]/page.tsx`:

```typescript
import { Stethoscope, ArrowLeft } from "lucide-react";
import Link from "next/link";

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function SupplementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = slugToTitle(slug);

  const sections = ["Overview", "Evidence", "Dosage & Timing", "Interactions", "Sources"];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <div style={{ maxWidth: "680px", marginLeft: "auto", marginRight: "auto", padding: "48px 24px" }}>
        {/* Back link */}
        <Link
          href="/chat"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#6B7280",
            fontSize: "13px",
            textDecoration: "none",
            marginBottom: "32px",
          }}
        >
          <ArrowLeft size={14} />
          Back to consultation
        </Link>

        {/* Hero */}
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "rgba(22,163,74,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <Stethoscope size={24} color="#16A34A" />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1.3, marginBottom: "8px" }}>
            {title}
          </h1>
          <p style={{ color: "#6B7280", fontSize: "15px" }}>
            Supplement profile and clinical evidence
          </p>
        </div>

        {/* Coming soon banner */}
        <div
          style={{
            backgroundColor: "#F0FDF4",
            border: "1px solid rgba(22,163,74,0.15)",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "40px",
          }}
        >
          <p style={{ color: "#16A34A", fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
            Detailed profiles coming soon
          </p>
          <p style={{ color: "#6B7280", fontSize: "13px" }}>
            We're building comprehensive evidence-based profiles for each supplement. Check back soon.
          </p>
        </div>

        {/* Placeholder sections */}
        {sections.map((section) => (
          <div key={section} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              {section}
            </h2>
            <div
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: "8px",
                padding: "24px",
                color: "#9CA3AF",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              Content for {section.toLowerCase()} will appear here
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/supplement/[slug]/page.tsx
git commit -m "feat: add placeholder supplement detail page"
```

---

### Task 17: Full build verification

- [ ] **Step 1: Run build**

```bash
cd C:/Users/AbhayGodara/Projects/Supp/stackiq && npm run build
```

Expected: Build succeeds with no errors. If there are issues:
- Tiptap SSR error → wrap TiptapEditor import in `dynamic(() => import(...), { ssr: false })`
- Missing module → verify npm install completed
- Type errors → fix in the relevant file

- [ ] **Step 2: Run dev server and verify manually**

```bash
cd C:/Users/AbhayGodara/Projects/Supp/stackiq && npm run dev
```

Open `http://localhost:3000/chat` in browser. Verify:
1. Loading spinner appears briefly
2. Opening message from "StackIQ Advisor" is visible in thread style (author header + timestamp, no bubbles)
3. Tiptap editor is visible at bottom with B/I/list toolbar and Send button
4. Can type and send a message (Ctrl+Enter or click Send)
5. AI responds (requires valid OPENAI_API_KEY in .env.local)
6. Sidebar opens when clicking Clock icon in navbar
7. "New Consultation" button works — creates a new conversation with opening message
8. Navigate to /stack and back — conversation persists (loads from Supabase)
9. `/supplement/magnesium-l-threonate` shows the placeholder detail page
10. Resize browser to <768px — verify navbar shows mobile menu toggle + sidebar becomes full-screen overlay
11. If AI call fails, error message appears with Retry button that works

**Tiptap SSR troubleshooting:** If the build fails with `ReferenceError: document is not defined` or similar SSR error from Tiptap, wrap the TiptapEditor import in `src/app/chat/page.tsx` with dynamic import:
```typescript
import dynamic from "next/dynamic";
const TiptapEditor = dynamic(() => import("@/components/chat/TiptapEditor"), { ssr: false });
```

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete chat redesign — clinical consultation interface

Thread-style message layout, Supabase persistence, Tiptap editor,
conversation history sidebar, inline supplement recommendation cards.
Replaces tile-based chatbot with professional clinical consultation flow."
```

- [ ] **Step 4: Push to remote**

```bash
git push origin master
```
