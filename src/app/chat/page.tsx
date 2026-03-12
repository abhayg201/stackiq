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
      className={`group relative flex flex-col items-center gap-1.5 p-3.5 rounded-xl border transition-all duration-200 text-center ${
        selected
          ? "bg-accent/8 border-accent/30 shadow-[0_0_20px_rgba(186,255,41,0.08)]"
          : "bg-white/[0.02] border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.03]"
      }`}
    >
      <span className="text-xl leading-none">{tile.emoji}</span>
      <span
        className={`text-xs font-medium leading-tight ${
          selected ? "text-accent" : "text-fg/90"
        }`}
      >
        {tile.label}
      </span>
      {tile.description && (
        <span className="text-[10px] text-muted/60 leading-tight">
          {tile.description}
        </span>
      )}
      {selected && (
        <div className="absolute -top-1.5 -right-1.5">
          <CheckCircle2 size={15} className="text-accent fill-accent/20" />
        </div>
      )}
    </button>
  );
}

// ── Typing Indicator ─────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex gap-2.5 items-end animate-msg-in">
      <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
        <Sparkles size={13} className="text-accent" />
      </div>
      <div className="bg-white/[0.04] rounded-2xl rounded-bl-md px-4 py-3">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 bg-accent/50 rounded-full"
              style={{ animation: `typeDot 1s ease ${i * 0.2}s infinite` }}
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
    <div className="flex items-center gap-3 px-5 py-2.5 border-b border-white/[0.04]">
      <div className="flex-1 h-1 bg-white/[0.04] rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-muted text-[10px] font-mono shrink-0">
        {phase === "ai" ? (
          <span className="text-accent flex items-center gap-1">
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
      // All tiles done -> AI phase
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

      // Detect when AI provides final recommendations
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
    <div className="min-h-screen bg-base flex flex-col">
      <Navbar />

      <div className="flex-1 flex justify-center px-4 sm:px-6 py-4 sm:py-6">
        <div className="w-full max-w-2xl flex flex-col">
          {/* Chat Container */}
          <div className="bg-card border border-white/[0.06] rounded-2xl flex-1 flex flex-col overflow-hidden max-h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="px-5 py-3.5 border-b border-white/[0.04] flex items-center gap-3">
              <div className="w-8 h-8 bg-accent/15 rounded-xl flex items-center justify-center shrink-0">
                <Sparkles size={15} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-fg text-sm font-semibold">StackIQ</div>
                <div className="text-accent/70 text-[10px] font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full inline-block animate-pulse" />
                  {phase === "done"
                    ? "Stack ready"
                    : phase === "ai"
                    ? "AI analysis"
                    : "Building your profile"}
                </div>
              </div>

              {/* Profile chips */}
              {Object.keys(userProfile).length > 0 && (
                <div className="hidden sm:flex gap-1">
                  {Object.keys(userProfile).slice(0, 3).map((key) => (
                    <div
                      key={key}
                      className="bg-accent/8 border border-accent/20 rounded-md px-2 py-0.5"
                    >
                      <span className="text-accent/80 text-[9px] font-mono uppercase">
                        {key.split("_")[0]}
                      </span>
                    </div>
                  ))}
                  {Object.keys(userProfile).length > 3 && (
                    <div className="bg-white/[0.03] border border-white/[0.06] rounded-md px-2 py-0.5">
                      <span className="text-muted text-[9px] font-mono">
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
            <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 space-y-3">
              {messages.map((msg, i) => {
                if (msg.role === "bot") {
                  return (
                    <div key={i} className="flex gap-2.5 items-start animate-msg-in">
                      <div className="w-6 h-6 rounded-md bg-accent/12 flex items-center justify-center shrink-0 mt-0.5">
                        <Sparkles size={11} className="text-accent" />
                      </div>
                      <div className="bg-white/[0.03] rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                        <ChatMarkdown content={msg.content} />
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={i} className="flex justify-end animate-msg-in">
                    <div className="bg-accent/8 border border-accent/15 rounded-2xl rounded-tr-md px-4 py-3 max-w-[80%]">
                      <p className="text-fg text-[13px] leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                );
              })}

              {typing && <TypingIndicator />}

              {/* Smart Tiles */}
              {phase === "tiles" && currentTileStep && !typing && (
                <div className="animate-msg-in pl-8 space-y-3">
                  {currentTileStep.subtitle && (
                    <p className="text-muted/60 text-[11px] font-mono">{currentTileStep.subtitle}</p>
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

                  {selectedTiles.length > 0 && (
                    <button
                      onClick={confirmTileSelection}
                      className="flex items-center gap-2 bg-accent hover:bg-accent/90 text-[#06060E] font-mono text-[11px] font-bold tracking-wider px-5 py-2.5 rounded-lg transition-all"
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
                <div className="animate-msg-in pl-8">
                  <div className="bg-accent/[0.04] border border-accent/15 rounded-xl p-5 text-center">
                    <Sparkles className="text-accent mx-auto mb-3" size={22} />
                    <p className="text-fg text-sm font-semibold mb-1">
                      Your personalised stack is ready
                    </p>
                    <p className="text-muted text-xs mb-4">
                      {4} supplements matched to your profile with detailed dosing and evidence.
                    </p>
                    <button
                      onClick={() => router.push("/stack")}
                      className="inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-[#06060E] font-mono text-[11px] font-bold tracking-wider px-6 py-3 rounded-lg transition-all shadow-[0_0_24px_rgba(186,255,41,0.12)]"
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
              <div className="px-4 sm:px-5 py-3 border-t border-white/[0.04]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendAIMessage()}
                    placeholder="Type your answer\u2026"
                    className="flex-1 bg-white/[0.02] border border-white/[0.06] focus:border-accent/30 rounded-xl px-4 py-3 text-fg text-sm outline-none transition-colors placeholder:text-muted/40"
                    disabled={aiLoading}
                  />
                  <button
                    onClick={sendAIMessage}
                    disabled={aiLoading || !inputValue.trim()}
                    className="bg-accent hover:bg-accent/90 disabled:opacity-20 text-[#06060E] p-3 rounded-xl transition-all"
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
