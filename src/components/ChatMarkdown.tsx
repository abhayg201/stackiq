"use client";

import React from "react";

/**
 * Lightweight markdown renderer for chat messages.
 * Handles: **bold**, *italic*, `code`, - lists, numbered lists, line breaks.
 * No external dependencies.
 */

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Italic: *text* (but not **)
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
    // Code: `text`
    const codeMatch = remaining.match(/`(.+?)`/);

    // Find earliest match
    const matches = [
      boldMatch ? { type: "bold", match: boldMatch } : null,
      italicMatch ? { type: "italic", match: italicMatch } : null,
      codeMatch ? { type: "code", match: codeMatch } : null,
    ]
      .filter(Boolean)
      .sort((a, b) => (a!.match.index ?? 0) - (b!.match.index ?? 0));

    if (matches.length === 0 || matches[0] === null) {
      parts.push(remaining);
      break;
    }

    const earliest = matches[0]!;
    const idx = earliest.match.index ?? 0;

    // Text before the match
    if (idx > 0) {
      parts.push(remaining.slice(0, idx));
    }

    // The styled part
    const inner = earliest.match[1];
    if (earliest.type === "bold") {
      parts.push(
        <strong key={key++} className="font-semibold text-fg">
          {inner}
        </strong>
      );
    } else if (earliest.type === "italic") {
      parts.push(
        <em key={key++} className="italic text-fg/80">
          {inner}
        </em>
      );
    } else if (earliest.type === "code") {
      parts.push(
        <code
          key={key++}
          className="bg-white/[0.06] text-accent text-[12px] font-mono px-1.5 py-0.5 rounded"
        >
          {inner}
        </code>
      );
    }

    remaining = remaining.slice(idx + earliest.match[0].length);
  }

  return parts;
}

export function ChatMarkdown({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: { text: string; ordered: boolean; num?: string }[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    const isOrdered = listItems[0].ordered;
    const Tag = isOrdered ? "ol" : "ul";
    elements.push(
      <Tag
        key={key++}
        className={`${isOrdered ? "list-decimal" : "list-disc"} ml-4 space-y-1 my-2`}
      >
        {listItems.map((item, i) => (
          <li key={i} className="text-fg/90 text-[13px] leading-relaxed pl-1">
            {parseInline(item.text)}
          </li>
        ))}
      </Tag>
    );
    listItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Unordered list: - item or * item
    const ulMatch = trimmed.match(/^[-*]\s+(.+)/);
    // Ordered list: 1. item, 2. item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/);

    if (ulMatch) {
      if (listItems.length > 0 && listItems[0].ordered) flushList();
      listItems.push({ text: ulMatch[1], ordered: false });
      continue;
    }

    if (olMatch) {
      if (listItems.length > 0 && !listItems[0].ordered) flushList();
      listItems.push({ text: olMatch[2], ordered: true, num: olMatch[1] });
      continue;
    }

    // Not a list item — flush any pending list
    flushList();

    // Empty line = spacing
    if (trimmed === "") {
      elements.push(<div key={key++} className="h-2" />);
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={key++} className="text-fg/90 text-[13px] leading-relaxed">
        {parseInline(trimmed)}
      </p>
    );
  }

  // Flush remaining list items
  flushList();

  return <div className="space-y-1">{elements}</div>;
}
