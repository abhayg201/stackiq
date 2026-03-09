"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import { TILE_STEPS, TileOption } from "@/lib/chat-config";
import {
  Send,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "bot" | "user" | "assistant";
  content: string;
  type?: "text" | "tiles" | "recommendation";
}

interface UserProfile {
  [key: string]: string | string[];
}

// ── Smart Tile Component ──────────────────────────────────────────────────────

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
      className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 text-center min-w-[100px] ${
        selected
          ? "bg-accent/10 border-accent/40 shadow-[0_0_16px_rgba(186,255,41,0.12)]"
          : "bg-faint border-stroke hover:border-stroke-hi hover:bg-surface"
      }`}
    >
      <span className="text-2xl">{tile.emoji}</span>
      <span
        className={`text-xs font-medium leading-tight ${
          selected ? "text-accent" : "text-fg"
        }`}
      >
        {tile.label}
      </span>
      {tile.description && (
        <span className="text-[10px] text-muted leading-tight">
          {tile.description}
        </span>
      )}
      {selected && (
        <div className="absolute -top-1.5 -right-1.5">
          <CheckCircle2 size={16} className="text-accent fill-accent/20" />
        </div>
      )}
    </button>
  );
}

// ── Typing Indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-2 items-end animate-msg-in">
      <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
        <span className="text-[#06060E] text-xs">&#9672;</span>
      </div>
      <div className="bg-white/5 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-muted rounded-full"
              style={{
                animation: `typeDot 1s ease ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────

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
    <div className="flex items-center gap-3 px-5 py-3 border-b border-stroke">
      <div className="flex-1 h-1 bg-faint rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-muted text-[10px] font-mono">
        {phase === "ai" ? (
          <span className="text-accent flex items-center gap-1">
            <Sparkles size={10} /> AI MODE
          </span>
        ) : (
          `${current}/${total}`
        )}
      </span>
    </div>
  );
}

// ── Main Chat Page ────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [tileStep, setTileStep] = useState(0);
  const [selectedTiles, setSelectedTiles] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({});
  const [phase, setPhase] = useState<"intro" | "tiles" | "ai" | "done">(
    "intro"
  );
  const [typing, setTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { role: string; content: string }[]
  >([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  // Start intro sequence
  useEffect(() => {
    setTyping(true);
    const t1 = setTimeout(() => {
      setMessages([
        {
          role: "bot",
          content:
            "Hey! I'm StackIQ — I'll build your personalized supplement stack. No forms, no BS.",
        },
      ]);
      setTyping(false);
    }, 600);

    const t2 = setTimeout(() => {
      setTyping(true);
    }, 1200);

    const t3 = setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          content:
            "Let's start with some quick taps. Pick what resonates — I'll use this to personalize everything.",
        },
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

  // Confirm tile selection and advance
  const confirmTileSelection = useCallback(() => {
    if (selectedTiles.length === 0) return;

    const currentStep = TILE_STEPS[tileStep];
    if (!currentStep) return;

    // Store answer
    const selectedLabels = selectedTiles
      .map(
        (id) => currentStep.tiles?.find((t) => t.id === id)?.label || id
      )
      .join(", ");

    const newProfile = {
      ...userProfile,
      [currentStep.key]:
        currentStep.type === "tiles-multi" ? selectedTiles : selectedTiles[0],
    };
    setUserProfile(newProfile);

    // Add user message
    setMessages((m) => [
      ...m,
      { role: "user", content: selectedLabels },
    ]);
    setSelectedTiles([]);

    // Check if more tile steps
    const nextStep = tileStep + 1;
    if (nextStep < TILE_STEPS.length) {
      setTyping(true);
      setTimeout(() => {
        const next = TILE_STEPS[nextStep];
        setMessages((m) => [
          ...m,
          { role: "bot", content: `${next.question}` },
        ]);
        setTyping(false);
        setTileStep(nextStep);
      }, 500);
    } else {
      // All tiles done — transition to AI phase
      setTyping(true);
      setTimeout(() => {
        setMessages((m) => [
          ...m,
          {
            role: "bot",
            content:
              "Great — I've got your baseline. Now let me dig deeper with a few AI-powered questions tailored to YOUR profile...",
          },
        ]);
        setTyping(false);
        setPhase("ai");

        // Trigger first AI message
        setTimeout(() => {
          triggerAIIntro(newProfile);
        }, 800);
      }, 600);
    }
  }, [selectedTiles, tileStep, userProfile]);

  // Trigger AI intro
  const triggerAIIntro = async (profile: UserProfile) => {
    setTyping(true);
    const introMsg = {
      role: "user",
      content: `I just completed my profile assessment. Please acknowledge my profile and ask me 2-3 targeted follow-up questions to refine my supplement recommendations.`,
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [introMsg],
          userProfile: profile,
        }),
      });

      const data = await res.json();
      setTyping(false);
      setMessages((m) => [
        ...m,
        { role: "bot", content: data.message },
      ]);
      setAiMessages([introMsg, { role: "assistant", content: data.message }]);
    } catch {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          content:
            "I'm having trouble connecting to my AI backend. Make sure your OpenAI API key is configured in .env.local. For now, here are some general recommendations based on your profile!",
        },
      ]);
      setPhase("done");
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
        body: JSON.stringify({
          messages: newAiMessages,
          userProfile,
        }),
      });

      const data = await res.json();
      setTyping(false);
      setAiLoading(false);
      setMessages((m) => [
        ...m,
        { role: "bot", content: data.message },
      ]);
      setAiMessages([
        ...newAiMessages,
        { role: "assistant", content: data.message },
      ]);

      // Check if AI has provided final recommendations (heuristic)
      if (
        data.message.toLowerCase().includes("stack") &&
        (data.message.toLowerCase().includes("recommendation") ||
          data.message.toLowerCase().includes("dosage") ||
          data.message.toLowerCase().includes("mg"))
      ) {
        setTimeout(() => {
          setPhase("done");
        }, 1000);
      }
    } catch {
      setTyping(false);
      setAiLoading(false);
      setMessages((m) => [
        ...m,
        {
          role: "bot",
          content: "Sorry, something went wrong. Try sending that again.",
        },
      ]);
    }
  };

  const currentTileStep =
    phase === "tiles" ? TILE_STEPS[tileStep] : null;

  return (
    <div className="min-h-screen bg-base flex flex-col">
      <Navbar />

      <div className="flex-1 flex justify-center px-4 py-6">
        <div className="w-full max-w-2xl flex flex-col">
          {/* Chat Container */}
          <div className="bg-card border border-stroke rounded-2xl flex-1 flex flex-col overflow-hidden max-h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-stroke flex items-center gap-3">
              <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-[#06060E] font-black">&#9672;</span>
              </div>
              <div className="flex-1">
                <div className="text-fg text-sm font-semibold">StackIQ</div>
                <div className="text-accent text-[10px] font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full inline-block" />
                  {phase === "done"
                    ? "Stack complete"
                    : phase === "ai"
                    ? "AI analysis mode"
                    : "Building your formula"}
                </div>
              </div>

              {/* Profile chips */}
              <div className="hidden sm:flex gap-1.5">
                {Object.entries(userProfile)
                  .slice(0, 3)
                  .map(([key, val]) => (
                    <div
                      key={key}
                      className="bg-accent/10 border border-accent/30 rounded px-2 py-0.5"
                    >
                      <span className="text-accent text-[9px] font-mono uppercase">
                        {key.split("_")[0]}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Progress */}
            <ProgressBar
              current={tileStep}
              total={TILE_STEPS.length}
              phase={phase === "ai" || phase === "done" ? "ai" : "tiles"}
            />

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {messages.map((msg, i) => {
                if (msg.role === "bot") {
                  return (
                    <div key={i} className="flex gap-2 items-end animate-msg-in">
                      <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-[#06060E] text-xs">&#9672;</span>
                      </div>
                      <div className="bg-white/5 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]">
                        <p className="text-fg text-[13px] leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                }
                if (msg.role === "user") {
                  return (
                    <div key={i} className="flex justify-end animate-msg-in">
                      <div className="bg-accent/10 border border-accent/20 rounded-2xl rounded-br-sm px-4 py-3 max-w-[80%]">
                        <p className="text-fg text-[13px]">{msg.content}</p>
                      </div>
                    </div>
                  );
                }
                return null;
              })}

              {/* Typing indicator */}
              {typing && <TypingIndicator />}

              {/* Smart Tiles */}
              {phase === "tiles" && currentTileStep && !typing && (
                <div className="animate-msg-in pl-9 space-y-3">
                  {currentTileStep.subtitle && (
                    <p className="text-muted text-xs font-mono">
                      {currentTileStep.subtitle}
                    </p>
                  )}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {currentTileStep.tiles?.map((tile) => (
                      <SmartTile
                        key={tile.id}
                        tile={tile}
                        selected={selectedTiles.includes(tile.id)}
                        onClick={() => handleTileSelect(tile.id)}
                      />
                    ))}
                  </div>

                  {/* Confirm button */}
                  {selectedTiles.length > 0 && (
                    <button
                      onClick={confirmTileSelection}
                      className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-[#06060E] font-mono text-xs font-bold tracking-wider px-5 py-2.5 rounded-lg transition-all"
                    >
                      {currentTileStep.type === "tiles-multi"
                        ? `CONTINUE WITH ${selectedTiles.length} SELECTED`
                        : "CONTINUE"}
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              )}

              {/* Done state */}
              {phase === "done" && (
                <div className="animate-msg-in pl-9">
                  <div className="bg-accent/5 border border-accent/20 border-dashed rounded-xl p-5 text-center">
                    <Sparkles className="text-accent mx-auto mb-3" size={24} />
                    <p className="text-fg text-sm font-semibold mb-1">
                      Your personalized stack is ready!
                    </p>
                    <p className="text-muted text-xs mb-4">
                      View your full recommendations with detailed dosing, evidence,
                      and brand picks.
                    </p>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-[#06060E] font-mono text-xs font-bold tracking-wider px-6 py-3 rounded-lg transition-all"
                    >
                      VIEW MY STACK
                      <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input area (AI phase) */}
            {phase === "ai" && (
              <div className="px-5 py-3 border-t border-stroke">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendAIMessage()}
                    placeholder="Type your answer..."
                    className="flex-1 bg-surface border border-stroke focus:border-accent/40 rounded-xl px-4 py-3 text-fg text-sm outline-none transition-colors placeholder:text-muted/50"
                    disabled={aiLoading}
                  />
                  <button
                    onClick={sendAIMessage}
                    disabled={aiLoading || !inputValue.trim()}
                    className="bg-accent hover:bg-accent/90 disabled:opacity-30 text-[#06060E] p-3 rounded-xl transition-all"
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
