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
