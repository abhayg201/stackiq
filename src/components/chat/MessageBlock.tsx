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
