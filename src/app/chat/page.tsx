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
