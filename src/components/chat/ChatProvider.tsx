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
