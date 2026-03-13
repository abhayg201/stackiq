// Shared TypeScript types for the chat system.
// Used by ChatProvider, MessageBlock, ChatSidebar, and API route.

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
