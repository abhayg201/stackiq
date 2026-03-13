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
