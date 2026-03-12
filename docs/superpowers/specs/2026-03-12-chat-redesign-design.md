# Chat Redesign: Clinical Consultation Experience

## Overview

Redesign the StackIQ chat from a tile-based chatbot into a professional clinical consultation interface. The user should feel like they are talking to a nutritionist at a premium supplement clinic — not a bot.

Key changes: thread-style message layout (no bubbles), Supabase persistence, Tiptap rich text editor, right slide-out conversation history sidebar, conversational AI flow (no smart tiles), and inline supplement recommendation cards.

## Decisions

| Decision | Choice |
|----------|--------|
| Layout | Thread-style — author headers + content blocks, no chat bubbles |
| Persistence | Supabase DB (conversations, messages, user_profiles tables) |
| Flow | Pure conversational — AI drives intake naturally, no fixed tile phases |
| Architecture | Modular with ChatProvider context at layout level |
| Sidebar | Right slide-out, collapsible (overlay only in v1 — no pinning) |
| Editor | Tiptap, always visible, pinned at bottom |
| AI Tone | Clinical professional — warm but precise, proper terminology |
| Supplements | Interactive cards in-thread, click opens `/supplement/[slug]` in new tab |
| Detail page | Shell route, independently configurable later |
| Auth | `/chat` requires authentication — unauthenticated users redirect to `/auth/login` |
| Send shortcut | `Ctrl+Enter` / `Cmd+Enter` (intentional — Tiptap is a rich text editor, plain Enter creates newlines) |

## Constraints

- **All layout CSS must use inline `style={{}}`** — Tailwind v4 utility classes for layout do not render in the browser. This is a known issue across the entire project. This applies to ALL files including ChatMarkdown.tsx and Navbar.tsx — any existing Tailwind layout classes in modified files must be converted to inline styles.
- Light mode palette: base `#FFFFFF`, surface `#F9FAFB`, accent `#16A34A`, text `#111827`, muted `#6B7280`, border-subtle `rgba(0,0,0,0.06)`, border-default `rgba(0,0,0,0.08)`.

---

## 1. Database Schema

Three tables in Supabase with Row Level Security.

### `conversations`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | `gen_random_uuid()` |
| `user_id` | uuid (FK to auth.users) | Owner |
| `title` | text | Auto-generated from first user message (~50 chars) |
| `created_at` | timestamptz | `now()` |
| `updated_at` | timestamptz | Updated on each new message |

### `messages`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | `gen_random_uuid()` |
| `conversation_id` | uuid (FK to conversations) | |
| `role` | text | `'user'` or `'assistant'` |
| `content` | text | Plain text / markdown string (may contain `:::supplement:::` blocks) |
| `created_at` | timestamptz | Displayed as timestamp in thread |

### `user_profiles`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK, FK to auth.users) | |
| `display_name` | text | For thread author header |
| `created_at` | timestamptz | `now()` |

### RLS Policies

**`conversations`:**
- `SELECT WHERE auth.uid() = user_id`
- `INSERT WHERE auth.uid() = user_id`
- `UPDATE WHERE auth.uid() = user_id`

**`messages`:**
- `SELECT WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())`
- `INSERT WHERE conversation_id IN (SELECT id FROM conversations WHERE user_id = auth.uid())`

**`user_profiles`:**
- `SELECT WHERE auth.uid() = id`
- `INSERT WHERE auth.uid() = id`
- `UPDATE WHERE auth.uid() = id`

No delete exposed on any table — soft delete in future if needed.

No `user_profiles` row required to chat — fall back to email prefix as display name. v1 does not create `user_profiles` rows automatically; the table exists for future use (e.g. onboarding flow that collects display name). ChatProvider reads the user's email from `supabase.auth.getUser()` and extracts the prefix before `@` as the display name.

---

## 2. TypeScript Interfaces

```typescript
interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;        // plain text / markdown, stored as-is
  created_at: string;
  status?: 'sending' | 'sent' | 'error';  // local-only, not persisted
}

interface SupplementBlock {
  name: string;
  slug: string;
  dosage: string;
  timing: string;
  goal: string;            // maps to category color (e.g. "Sleep", "Cognition", "Energy", "Stress", "Gut Health")
  confidence: 'strong' | 'good' | 'emerging';  // three-tier scale matching evidence quality
}
```

The `Message.status` field is client-side only for optimistic update tracking. It is not stored in the database.

---

## 3. Component Architecture

```
/chat/layout.tsx
  +-- ChatProvider (context - owns all state)
        +-- /chat/page.tsx
              |-- MessageThread
              |     +-- MessageBlock (one per message)
              |-- ChatSidebar (right slide-out)
              |     |-- SidebarHeader (new chat button + close)
              |     +-- ConversationItem (one per conversation)
              +-- TiptapEditor (pinned at bottom)
```

### ChatProvider (`src/components/chat/ChatProvider.tsx`)

Context provider that lives at the `/chat/layout.tsx` level.

**State:**
- `conversations: Conversation[]` — user's conversation list
- `activeConversationId: string | null` — currently viewed conversation
- `messages: Message[]` — messages for the active conversation
- `isLoading: boolean` — true while AI is responding
- `isSidebarOpen: boolean` — sidebar visibility
- `isInitialized: boolean` — true after first DB fetch

**Actions exposed via context:**
- `createConversation()` — creates new conversation, AI sends opening message
- `switchConversation(id)` — switches active conversation, fetches its messages
- `sendMessage(content)` — inserts user message, calls AI, inserts response
- `toggleSidebar()` — opens/closes sidebar

### MessageThread (`src/components/chat/MessageThread.tsx`)

Reads `messages` from context. Renders each as a `MessageBlock`. Auto-scrolls to bottom on new messages. Shows a brief welcome line when no messages exist.

### MessageBlock (`src/components/chat/MessageBlock.tsx`)

Single message rendered as a document block:
- Author line: avatar icon + name + timestamp
- Content: indented under avatar, rendered as markdown via ChatMarkdown
- No bubbles, no background color on messages — just whitespace separation

### ChatSidebar (`src/components/chat/ChatSidebar.tsx`)

Right slide-out panel for conversation history:
- Triggered by a history icon in the Navbar
- Lists conversations sorted by `updated_at` desc
- Each item: title + relative time
- "New Consultation" button at top
- Active conversation highlighted with green left border
- Mobile: full-screen overlay with backdrop
- Desktop: overlay that slides over content (no pinning in v1 — pinning is a future enhancement)
- v1: fetches all conversations (no pagination). Pagination added later if list grows large.

### TiptapEditor (`src/components/chat/TiptapEditor.tsx`)

Always visible, pinned at the bottom of the chat area:
- Minimal formatting toolbar: bold, italic, bullet list
- Send button (green accent) on the right
- `Ctrl+Enter` / `Cmd+Enter` to send (intentional: rich text editor, plain Enter = newline)
- Clears on send
- Placeholder: "Describe your situation in detail..."
- Disabled state: not implemented in v1. The editor is always enabled. Future pipeline phases may disable it by setting a `disabled` prop.

**Tiptap content serialization:** We use the `tiptap-markdown` extension (`@tiptap/extension-markdown` or the community `tiptap-markdown` package) to serialize editor content as markdown on send. This converts Tiptap's internal format to proper markdown: bold becomes `**bold**`, italic becomes `*italic*`, lists become `- item`. The markdown string is stored in `messages.content` and rendered by ChatMarkdown. If the markdown extension proves problematic to integrate, fall back to `editor.getText()` (plain text only, toolbar becomes cosmetic) — but prefer markdown serialization.

### SupplementCard (`src/components/chat/SupplementCard.tsx`)

Inline recommendation card rendered within the message thread:
- Shows: name, dosage, timing, goal category, confidence indicator
- Left accent dot color-coded by category
- Arrow icon indicates clickable
- On click: opens `/supplement/[slug]` in a new browser tab
- Hover: subtle lift shadow

### `:::supplement:::` Block Parsing

Parsing lives in `ChatMarkdown.tsx`. The flow:

1. **Detection**: Before rendering markdown, ChatMarkdown scans the raw content string for `:::supplement` blocks using a regex: `/:::supplement\s*(\{[\s\S]*?\})\s*:::/g`
2. **Splitting**: The content is split into segments — alternating between plain markdown text and supplement JSON blocks. Each segment is rendered in order.
3. **JSON parsing**: Each matched JSON string is parsed via `JSON.parse()`. If parsing fails (malformed JSON), the raw block is rendered as a plain code block so the user can still see it — no silent failures.
4. **Validation**: Parsed JSON is checked for required fields (`name`, `slug`, `dosage`, `timing`, `goal`, `confidence`). Missing fields fall back to defaults (e.g. `goal: 'General'`, `confidence: 'emerging'`).
5. **Rendering**: Valid supplement data renders a `SupplementCard` component inline. Plain text segments render through the existing markdown pipeline.
6. **Unknown goal categories**: If `goal` doesn't match a known category in the color map, it falls back to "General" (gray `#6B7280`).

---

## 4. Authentication

The `/chat` route requires authentication. This is already handled by the existing Supabase middleware at `src/lib/supabase/middleware.ts` which protects `/chat` and `/dashboard` routes.

Behavior for unauthenticated users: the middleware redirects to `/auth/login`. No additional auth checks needed in the chat components — the middleware handles it before the page renders.

---

## 5. Conversational Flow

### Opening Message

Auto-sent when a new conversation is created. Sets the clinical tone and asks the first question. The AI introduces itself as a clinical advisor and asks about primary health goals.

### Information Gathering

The AI naturally covers the same areas as the old tile system, but conversationally:
- Health goals
- Current diet patterns
- Age and biological sex
- Exercise habits
- Stress and sleep quality
- Budget range
- Current medications/supplements (interaction checks)

No fixed question count — the AI decides when it has enough context based on the user's responses.

### Recommendation Phase

When the AI has sufficient information:
1. Summarizes what it has learned
2. Presents supplement recommendations as `:::supplement:::` blocks (rendered as interactive cards)
3. Provides dosage, timing, and evidence rationale in surrounding text

### System Prompt

Remove all tile/phase references. The existing system prompt says "conversational, friendly tone — not clinical" which directly contradicts the new design. Replace entirely. Instruct the AI to:
- Gather information conversationally
- Use clinical professional tone — warm but precise, proper terminology
- Structure responses with bolding and numbered lists where appropriate
- Always end with a clear question to keep the consultation moving
- Use `:::supplement { JSON } :::` format when recommending supplements
- JSON must include: `name`, `slug`, `dosage`, `timing`, `goal`, `confidence` (one of: `strong`, `good`, `emerging`)

---

## 6. API Route Contract

### `POST /api/chat`

**Request body:**
```typescript
{
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  conversationId: string;  // for logging/tracking, not used for DB writes
}
```

**Response body:**
```typescript
{
  content: string;  // assistant's response (markdown, may contain :::supplement::: blocks)
}
```

**Behavior:**
- Route remains stateless — it does NOT read from or write to Supabase. All DB operations happen client-side in ChatProvider.
- Receives the full message history (all user + assistant messages for the active conversation)
- Prepends the system prompt from `chat-config.ts`
- Calls OpenAI GPT-4o with temperature 0.7
- `max_tokens` increased from 800 to 1500 to accommodate recommendation responses with `:::supplement:::` JSON blocks
- Returns the assistant's response as a string
- No `userProfile` parameter — the user's profile data is embedded in the conversation history itself

**Breaking changes from current API route:**
- Request body: removes `userProfile` field, adds `conversationId` field
- Response body: changes from `{ message: string, role: string }` to `{ content: string }` (role is always `'assistant'`, no need to return it)
- `max_tokens` changes from 800 to 1500

---

## 7. Visual Design

### Message Block

- AI avatar: green circle (`#16A34A`) with white "S"
- User avatar: soft blue circle (`#EFF6FF`, border `#BFDBFE`, text `#3B82F6`) with user initial
- Author name: `#111827`, font-weight 600, 14px
- Timestamp: `#9CA3AF`, 12px
- Message content: `#374151`, 15px, line-height 1.7, indented 36px under avatar
- Between messages: 24px gap, no visible dividers

### Page Layout

- Thread area: max-width 680px, centered
- Background: `#FFFFFF`
- Top area scrollable, editor fixed at bottom
- Subtle top border on editor: `1px solid rgba(0,0,0,0.08)`

### Loading State

While `isInitialized` is false (initial data fetch), show a centered spinner with text "Loading your consultations..." in muted color (`#6B7280`). Same pattern as the existing dashboard redirect page.

### Sidebar

- Width: 320px
- Background: `#F9FAFB`
- Border-left: `1px solid rgba(0,0,0,0.08)`
- Slides in from right via CSS transform transition (300ms ease)
- Conversation item hover: `#F0FDF4`
- Active conversation: left border `#16A34A`, bg `#F0FDF4`

### Tiptap Editor

- Border: `1.5px solid #D1D5DB`, border-radius 12px
- Background: `#FFFFFF`
- Toolbar: B, I, list icons in `#D1D5DB`, green Send button (`#16A34A`)
- Placeholder: `#9CA3AF` — "Describe your situation in detail..."

### Supplement Card

- Background: `#F9FAFB`, border `1px solid rgba(0,0,0,0.08)`, border-radius 12px
- Left accent dot color-coded by goal category
- Name: `#111827`, 15px, font-weight 600
- Stats: `#6B7280`, 13px — dosage, timing, goal
- Confidence indicator: text label with colored dot — green for "strong", amber for "good", gray for "emerging"
- Hover: lift shadow + border darkens
- Click: opens `/supplement/[slug]` in new tab

### Category Colors

| Category | Color |
|----------|-------|
| Sleep | `#4F46E5` (indigo — distinct from brand green) |
| Cognition/Focus | `#2563EB` (blue) |
| Energy | `#EA580C` (orange) |
| Stress | `#7C3AED` (purple) |
| Gut Health | `#0D9488` (teal) |
| General | `#6B7280` (gray) |

### Responsive

- Below 768px: thread full-width with 16px padding, sidebar becomes full-screen overlay with backdrop
- Editor stays pinned at bottom on all sizes
- Navbar responsive behavior: convert existing Tailwind `md:` breakpoint classes to a JS-based approach using `window.innerWidth` check on mount + resize listener, matching the pattern already used in the landing page

---

## 8. State Management & Data Flow

### App Load

1. ChatProvider mounts, fetches `conversations` ordered by `updated_at desc`
2. If conversations exist: load most recent, fetch its messages
3. If no conversations: auto-create one, AI sends opening message
4. Set `isInitialized = true`, UI renders

### Send Message

1. User types in Tiptap, hits Send or Ctrl+Enter
2. Serialize editor content as markdown via the `tiptap-markdown` extension (see TiptapEditor section for fallback behavior)
3. Optimistically add user message to local state with `status: 'sending'`
4. Insert user message into `messages` table in Supabase
5. On DB success: update `status` to `'sent'`. On DB failure: update `status` to `'error'`, show retry option.
6. Call `/api/chat` with full message history
7. On AI response: insert assistant message into DB, add to local state
8. On AI failure: the user message remains persisted (it was already saved). Show a system-style error message in the thread with a "Retry" button that re-sends the same message history to `/api/chat`.
9. Update `conversations.updated_at` for sort order
10. If first user message: generate title by truncating the first user message to ~50 characters (client-side, in ChatProvider). No additional LLM call.

### Switch Conversation

1. User clicks conversation in sidebar
2. Set `activeConversationId`, fetch messages for that conversation
3. Thread re-renders

### New Conversation

1. User clicks "New Consultation" in sidebar
2. Insert into `conversations` table, switch to it, AI sends opening message
3. Sidebar updates with new entry at top

### Navigation Persistence

- ChatProvider in `/chat/layout.tsx` preserves state within `/chat` routes
- Navigating to `/stack` and back: layout unmounts, ChatProvider re-fetches from Supabase on remount
- Data always persists in DB regardless of navigation

### Error Handling

- Failed DB write on user message: set message `status` to `'error'`, show red indicator on the message with a retry button
- Failed AI response (after user message saved): show error as a system message in thread with "Retry" button. User message stays persisted — on reload the user sees their message and can re-trigger the AI call.
- Network offline (v1): show error message, user retries manually

---

## 9. File Structure

### New Files

| File | Purpose |
|------|---------|
| `src/app/chat/layout.tsx` | Wraps children in ChatProvider |
| `src/components/chat/ChatProvider.tsx` | Context provider with all state and actions |
| `src/components/chat/MessageThread.tsx` | Scrollable thread of MessageBlocks |
| `src/components/chat/MessageBlock.tsx` | Single message (author header + content) |
| `src/components/chat/ChatSidebar.tsx` | Right slide-out conversation list |
| `src/components/chat/TiptapEditor.tsx` | Tiptap editor pinned at bottom |
| `src/components/chat/SupplementCard.tsx` | Inline recommendation card |
| `src/app/supplement/[slug]/page.tsx` | Placeholder supplement detail page |
| `supabase/migrations/001_chat_tables.sql` | DB migration: conversations, messages, user_profiles + RLS |

### Modified Files

| File | Changes |
|------|---------|
| `src/app/chat/page.tsx` | Full rewrite — thin shell composing components |
| `src/app/api/chat/route.ts` | Updated system prompt, remove userProfile param, increase max_tokens to 1500 |
| `src/lib/chat-config.ts` | Remove tile steps, new conversational system prompt with clinical tone |
| `src/components/ChatMarkdown.tsx` | Add `:::supplement:::` block detection + convert existing Tailwind layout classes to inline styles |
| `src/components/Navbar.tsx` | Add sidebar toggle icon + convert `md:` responsive classes to JS-based approach |

### Deleted Code

- All tile-related code in current `chat/page.tsx` (TILE_STEPS, phase state machine, smart tile rendering)
- `userProfile` passing logic in API route

### New Dependencies

- `@tiptap/react`
- `@tiptap/starter-kit`
- `@tiptap/extension-placeholder`
- `tiptap-markdown` (for markdown serialization of editor content)

---

## 10. Supplement Detail Page

Route: `/supplement/[slug]`

For now, a minimal shell page:
- Reads slug from URL params
- Hero heading with supplement name (derived from slug by replacing hyphens with spaces and title-casing)
- Placeholder sections: Overview, Evidence, Dosage & Timing, Interactions, Sources
- Banner: "Detailed supplement profiles coming soon"
- Independently configurable in the future — we just wire up the route and basic shell now
- Auth not required to view (public page)

---

## 11. Out of Scope (Future Enhancements)

These items are explicitly deferred to future iterations:
- **Sidebar pinning on desktop** — v1 is overlay-only, pinning (where sidebar pushes content) comes later
- **Conversation deletion/archiving** — no delete UI in v1, sidebar grows indefinitely
- **Pagination for conversation list** — v1 fetches all conversations, pagination added if needed
- **Offline message queuing** — v1 shows an error, no local queue
- **Tiptap disabled state** — editor is always enabled in v1, future pipeline phases may disable it
- **Long message truncation** — no "read more" toggle in v1, messages render in full
- **Accessibility** — keyboard nav, ARIA roles, screen reader support deferred to a dedicated pass
- **Animation durations** — sidebar slide (300ms ease) and auto-scroll (smooth behavior) are reasonable defaults, fine-tuned later
