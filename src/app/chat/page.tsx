"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { ChatMarkdown } from "@/components/ChatMarkdown";
import { TILE_STEPS, TileOption } from "@/lib/chat-config";
import {
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "bot" | "user";
  content: string;
}

interface UserProfile {
  [key: string]: string | string[];
}

// ── Smart Tile ───────────────────────────────────────────────────────────────

function SmartTile({
  tile,
  selected,
  onClick,
}: {
  tile: TileOption;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.375rem",
        padding: "0.875rem 0.5rem",
        borderRadius: "0.75rem",
        border: selected ? "1px solid rgba(34,211,238,0.3)" : "1px solid rgba(255,255,255,0.06)",
        backgroundColor: selected ? "rgba(34,211,238,0.06)" : "rgba(255,255,255,0.02)",
        cursor: "pointer",
        transition: "all 0.2s",
        textAlign: "center",
        boxShadow: selected ? "0 0 20px rgba(34,211,238,0.06)" : "none",
      }}
    >
      <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>{tile.emoji}</span>
      <span
        style={{
          fontSize: "0.75rem",
          fontWeight: 500,
          lineHeight: 1.3,
          color: selected ? "#22D3EE" : "rgba(240,240,243,0.9)",
        }}
      >
        {tile.label}
      </span>
      {tile.description && (
        <span style={{ fontSize: "0.625rem", color: "rgba(113,113,122,0.6)", lineHeight: 1.3 }}>
          {tile.description}
        </span>
      )}
      {selected && (
        <div style={{ position: "absolute", top: "-6px", right: "-6px" }}>
          <CheckCircle2 size={15} color="#22D3EE" />
        </div>
      )}
    </button>
  );
}

// ── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: "0.625rem", alignItems: "flex-end" }} className="animate-msg-in">
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "0.5rem",
          backgroundColor: "rgba(34,211,238,0.12)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Sparkles size={13} color="#22D3EE" />
      </div>
      <div style={{ backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "1rem 1rem 1rem 0.375rem", padding: "0.75rem 1rem" }}>
        <div style={{ display: "flex", gap: "0.375rem" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "6px",
                height: "6px",
                backgroundColor: "rgba(34,211,238,0.5)",
                borderRadius: "50%",
                animation: `typeDot 1s ease ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({
  current,
  total,
  phase,
}: {
  current: number;
  total: number;
  phase: "tiles" | "ai";
}) {
  const pct = phase === "ai" ? 100 : (current / total) * 100;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ flex: 1, height: "4px", backgroundColor: "rgba(255,255,255,0.06)", borderRadius: "2px", overflow: "hidden" }}>
        <div
          style={{ height: "100%", width: `${pct}%`, backgroundColor: "#22D3EE", borderRadius: "2px", transition: "width 0.5s ease" }}
        />
      </div>
      <span style={{ fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", color: "#71717A", flexShrink: 0 }}>
        {phase === "ai" ? (
          <span style={{ color: "#22D3EE", display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <Sparkles size={10} /> AI MODE
          </span>
        ) : (
          `${current} of ${total}`
        )}
      </span>
    </div>
  );
}

// ── Main Chat Page ───────────────────────────────────────────────────────────

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tileStep, setTileStep] = useState(0);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [phase, setPhase] = useState<"intro" | "tiles" | "ai" | "done">("intro");
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<{ role: string; content: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Start intro
  useEffect(() => {
    setTyping(true);
    const t1 = setTimeout(() => {
      setMessages([
        { role: "bot", content: "Hey! I\u2019m StackIQ \u2014 I\u2019ll build your personalised supplement stack in about 3 minutes." },
      ]);
      setTyping(false);
    }, 600);

    const t2 = setTimeout(() => setTyping(true), 1200);

    const t3 = setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "bot", content: "Let\u2019s start with some quick taps. Pick what resonates \u2014 I\u2019ll use this to personalise everything." },
      ]);
      setTyping(false);
      setPhase("tiles");
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Handle tile selection
  const handleTileSelect = (tileId: string) => {
    const currentStep = TILE_STEPS[tileStep];
    if (!currentStep) return;

    if (currentStep.type === "tiles-multi") {
      setSelectedTiles((prev) =>
        prev.includes(tileId)
          ? prev.filter((id) => id !== tileId)
          : [...prev, tileId]
      );
    } else {
      setSelectedTiles([tileId]);
    }
  };

  // Confirm tiles and advance
  const confirmTileSelection = useCallback(() => {
    if (selectedTiles.length === 0) return;

    const currentStep = TILE_STEPS[tileStep];
    if (!currentStep) return;

    const selectedLabels = selectedTiles
      .map((id) => currentStep.tiles?.find((t) => t.id === id)?.label || id)
      .join(", ");

    const newProfile = {
      ...userProfile,
      [currentStep.key]:
        currentStep.type === "tiles-multi" ? selectedTiles : selectedTiles[0],
    };
    setUserProfile(newProfile);

    setMessages((m) => [...m, { role: "user", content: selectedLabels }]);
    setSelectedTiles([]);

    const nextStep = tileStep + 1;
    if (nextStep < TILE_STEPS.length) {
      setTyping(true);
      setTimeout(() => {
        const next = TILE_STEPS[nextStep];
        setMessages((m) => [...m, { role: "bot", content: next.question }]);
        setTyping(false);
        setTileStep(nextStep);
      }, 500);
    } else {
      setTyping(true);
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          { role: "bot", content: "Got it \u2014 I have your baseline. Let me dig deeper with a few AI-powered questions tailored to your profile\u2026" },
        ]);
        setTyping(false);
        setPhase("ai");
        setTimeout(() => triggerAIIntro(newProfile), 800);
      }, 600);
    }
  }, [selectedTiles, tileStep, userProfile]);

  // Trigger AI intro
  const triggerAIIntro = async (profile: UserProfile) => {
    setTyping(true);
    const introMsg = {
      role: "user",
      content: "I just completed my profile assessment. Please acknowledge my profile and ask me 2-3 targeted follow-up questions to refine my supplement recommendations.",
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [introMsg], userProfile: profile }),
      });

      const data = await res.json();
      setTyping(false);
      setMessages((m) => [...m, { role: "bot", content: data.message }]);
      setAiMessages([introMsg, { role: "assistant", content: data.message }]);
    } catch {
      setTyping(false);
      setMessages((m) => [
        ...m,
        { role: "bot", content: "I\u2019m having trouble connecting to my AI backend. Make sure your OpenAI API key is set in .env.local. Routing you to your stack with sample recommendations\u2026" },
      ]);
      setTimeout(() => setPhase("done"), 1500);
    }
  };

  // Send AI message
  const sendAIMessage = async () => {
    if (!inputValue.trim() || aiLoading) return;

    const userMsg = { role: "user", content: inputValue.trim() };
    setMessages((m) => [...m, { role: "user", content: userMsg.content }]);
    setInputValue("");
    setAiLoading(true);
    setTyping(true);

    const newAiMessages = [...aiMessages, userMsg];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newAiMessages, userProfile }),
      });

      const data = await res.json();
      setTyping(false);
      setAiLoading(false);
      setMessages((m) => [...m, { role: "bot", content: data.message }]);
      setAiMessages([
        ...newAiMessages,
        { role: "assistant", content: data.message },
      ]);

      const lower = data.message.toLowerCase();
      if (
        lower.includes("stack") &&
        (lower.includes("recommendation") ||
          lower.includes("dosage") ||
          lower.includes("mg"))
      ) {
        setTimeout(() => setPhase("done"), 1500);
      }
    } catch {
      setTyping(false);
      setAiLoading(false);
      setMessages((m) => [
        ...m,
        { role: "bot", content: "Something went wrong. Try sending that again." },
      ]);
    }
  };

  const currentTileStep = phase === "tiles" ? TILE_STEPS[tileStep] : null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090B", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* Centered chat container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "center",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "42rem",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Chat card */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              backgroundColor: "rgba(19,19,22,0.6)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: "1rem",
              maxHeight: "calc(100vh - 120px)",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "0.875rem 1.25rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  backgroundColor: "rgba(34,211,238,0.12)",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={15} color="#22D3EE" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "#F0F0F3" }}>StackIQ</div>
                <div style={{ fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(34,211,238,0.6)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                  <span style={{ width: "6px", height: "6px", backgroundColor: "#22D3EE", borderRadius: "50%", display: "inline-block" }} />
                  {phase === "done"
                    ? "Stack ready"
                    : phase === "ai"
                    ? "AI analysis"
                    : "Building your profile"}
                </div>
              </div>

              {/* Profile chips */}
              {Object.keys(userProfile).length > 0 && (
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  {Object.keys(userProfile).slice(0, 3).map((key) => (
                    <div
                      key={key}
                      style={{
                        backgroundColor: "rgba(34,211,238,0.06)",
                        border: "1px solid rgba(34,211,238,0.15)",
                        borderRadius: "0.25rem",
                        padding: "0.125rem 0.5rem",
                      }}
                    >
                      <span style={{ color: "rgba(34,211,238,0.7)", fontSize: "0.5625rem", fontFamily: "'IBM Plex Mono', monospace", textTransform: "uppercase" }}>
                        {key.split("_")[0]}
                      </span>
                    </div>
                  ))}
                  {Object.keys(userProfile).length > 3 && (
                    <div style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "0.25rem", padding: "0.125rem 0.5rem" }}>
                      <span style={{ color: "#71717A", fontSize: "0.5625rem", fontFamily: "'IBM Plex Mono', monospace" }}>
                        +{Object.keys(userProfile).length - 3}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Progress */}
            <ProgressBar
              current={tileStep}
              total={TILE_STEPS.length}
              phase={phase === "ai" || phase === "done" ? "ai" : "tiles"}
            />

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
              }}
            >
              {messages.map((msg, i) => {
                if (msg.role === "bot") {
                  return (
                    <div key={i} style={{ display: "flex", gap: "0.625rem", alignItems: "flex-start" }} className="animate-msg-in">
                      <div
                        style={{
                          width: "26px",
                          height: "26px",
                          borderRadius: "0.375rem",
                          backgroundColor: "rgba(34,211,238,0.1)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        <Sparkles size={11} color="#22D3EE" />
                      </div>
                      <div
                        style={{
                          backgroundColor: "rgba(255,255,255,0.03)",
                          borderRadius: "1rem 1rem 1rem 0.375rem",
                          padding: "0.75rem 1rem",
                          maxWidth: "85%",
                        }}
                      >
                        <ChatMarkdown content={msg.content} />
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "flex-end" }} className="animate-msg-in">
                    <div
                      style={{
                        backgroundColor: "rgba(34,211,238,0.06)",
                        border: "1px solid rgba(34,211,238,0.12)",
                        borderRadius: "1rem 1rem 0.375rem 1rem",
                        padding: "0.75rem 1rem",
                        maxWidth: "80%",
                      }}
                    >
                      <p style={{ fontSize: "0.8125rem", color: "#F0F0F3", lineHeight: 1.6 }}>{msg.content}</p>
                    </div>
                  </div>
                );
              })}

              {typing && <TypingIndicator />}

              {/* Smart Tiles */}
              {phase === "tiles" && currentTileStep && !typing && (
                <div style={{ paddingLeft: "2.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }} className="animate-msg-in">
                  {currentTileStep.subtitle && (
                    <p style={{ fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace", color: "rgba(113,113,122,0.6)" }}>
                      {currentTileStep.subtitle}
                    </p>
                  )}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "0.5rem",
                    }}
                  >
                    {currentTileStep.tiles?.map((tile) => (
                      <SmartTile
                        key={tile.id}
                        tile={tile}
                        selected={selectedTiles.includes(tile.id)}
                        onClick={() => handleTileSelect(tile.id)}
                      />
                    ))}
                  </div>

                  {selectedTiles.length > 0 && (
                    <button
                      onClick={confirmTileSelection}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        alignSelf: "flex-start",
                        gap: "0.5rem",
                        backgroundColor: "#22D3EE",
                        color: "#09090B",
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        padding: "0.625rem 1.25rem",
                        borderRadius: "0.5rem",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {currentTileStep.type === "tiles-multi"
                        ? `CONTINUE (${selectedTiles.length})`
                        : "CONTINUE"}
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              )}

              {/* Done state -> route to /stack */}
              {phase === "done" && (
                <div style={{ paddingLeft: "2.25rem" }} className="animate-msg-in">
                  <div
                    style={{
                      backgroundColor: "rgba(34,211,238,0.03)",
                      border: "1px solid rgba(34,211,238,0.12)",
                      borderRadius: "0.75rem",
                      padding: "1.5rem",
                      textAlign: "center",
                    }}
                  >
                    <Sparkles size={22} color="#22D3EE" style={{ margin: "0 auto 0.75rem" }} />
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#F0F0F3", marginBottom: "0.25rem" }}>
                      Your personalised stack is ready
                    </p>
                    <p style={{ fontSize: "0.75rem", color: "#71717A", marginBottom: "1rem" }}>
                      4 supplements matched with detailed dosing and evidence.
                    </p>
                    <button
                      onClick={() => router.push("/stack")}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        backgroundColor: "#22D3EE",
                        color: "#09090B",
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "0.5rem",
                        border: "none",
                        cursor: "pointer",
                        boxShadow: "0 0 24px rgba(34,211,238,0.1)",
                      }}
                    >
                      VIEW MY STACK
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input (AI phase) */}
            {phase === "ai" && (
              <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendAIMessage()}
                    placeholder="Type your answer\u2026"
                    disabled={aiLoading}
                    style={{
                      flex: 1,
                      backgroundColor: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: "0.75rem",
                      padding: "0.75rem 1rem",
                      color: "#F0F0F3",
                      fontSize: "0.875rem",
                      outline: "none",
                      fontFamily: "'Epilogue', sans-serif",
                    }}
                  />
                  <button
                    onClick={sendAIMessage}
                    disabled={aiLoading || !inputValue.trim()}
                    style={{
                      backgroundColor: "#22D3EE",
                      color: "#09090B",
                      padding: "0.75rem",
                      borderRadius: "0.75rem",
                      border: "none",
                      cursor: "pointer",
                      opacity: aiLoading || !inputValue.trim() ? 0.2 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    {aiLoading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
