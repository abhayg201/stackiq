"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { Bold, Italic, List, Send } from "lucide-react";

interface TiptapEditorProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export default function TiptapEditor({ onSend, disabled = false }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder: "Describe your situation in detail...",
      }),
      Markdown,
    ],
    editorProps: {
      attributes: {
        style: [
          "min-height: 60px",
          "max-height: 160px",
          "overflow-y: auto",
          "outline: none",
          "font-size: 15px",
          "line-height: 1.6",
          "color: #111827",
          "padding: 12px 14px",
          "font-family: 'Epilogue', sans-serif",
        ].join("; "),
      },
      handleKeyDown: (_view, event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
          event.preventDefault();
          handleSend();
          return true;
        }
        return false;
      },
    },
  });

  const handleSend = () => {
    if (!editor || disabled) return;

    // Try to get markdown content, fall back to plain text
    let content = "";
    try {
      // tiptap-markdown adds getMarkdown() method
      const editorAny = editor as any;
      if (typeof editorAny.storage?.markdown?.getMarkdown === "function") {
        content = editorAny.storage.markdown.getMarkdown();
      } else {
        content = editor.getText();
      }
    } catch {
      content = editor.getText();
    }

    const trimmed = content.trim();
    if (!trimmed) return;

    onSend(trimmed);
    editor.commands.clearContent();
  };

  const isActive = (type: string) => editor?.isActive(type) ?? false;

  const toolbarButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: "4px 6px",
    borderRadius: "4px",
    border: "none",
    backgroundColor: active ? "rgba(22,163,74,0.1)" : "transparent",
    color: active ? "#16A34A" : "#D1D5DB",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.15s",
  });

  return (
    <div
      style={{
        borderTop: "1px solid rgba(0,0,0,0.08)",
        padding: "12px 24px 16px",
        backgroundColor: "#FFFFFF",
      }}
    >
      <div
        style={{
          maxWidth: "680px",
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <div
          style={{
            border: "1.5px solid #D1D5DB",
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            overflow: "hidden",
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? "none" : "auto",
          }}
        >
          {/* Editor area */}
          <EditorContent editor={editor} />

          {/* Toolbar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "8px 12px",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              gap: "2px",
            }}
          >
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              style={toolbarButtonStyle(isActive("bold"))}
              title="Bold (Ctrl+B)"
              type="button"
            >
              <Bold size={15} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              style={toolbarButtonStyle(isActive("italic"))}
              title="Italic (Ctrl+I)"
              type="button"
            >
              <Italic size={15} />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              style={toolbarButtonStyle(isActive("bulletList"))}
              title="Bullet list"
              type="button"
            >
              <List size={15} />
            </button>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Send hint */}
            <span style={{ fontSize: "11px", color: "#9CA3AF", marginRight: "8px" }}>
              Ctrl+Enter to send
            </span>

            {/* Send button */}
            <button
              onClick={handleSend}
              style={{
                backgroundColor: "#16A34A",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "8px",
                padding: "6px 14px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "13px",
                fontWeight: 600,
                transition: "opacity 0.15s",
              }}
              type="button"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
