"use client";

import React from "react";
import SupplementCard from "@/components/chat/SupplementCard";
import { SupplementBlock } from "@/lib/chat-types";

// ── Inline parser ──────────────────────────────────────────────────────────

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/);

    const matches = [
      boldMatch ? { type: "bold", match: boldMatch } : null,
      italicMatch ? { type: "italic", match: italicMatch } : null,
      codeMatch ? { type: "code", match: codeMatch } : null,
      linkMatch ? { type: "link", match: linkMatch } : null,
    ]
      .filter(Boolean)
      .sort((a, b) => (a!.match.index ?? 0) - (b!.match.index ?? 0));

    if (matches.length === 0 || matches[0] === null) {
      parts.push(remaining);
      break;
    }

    const earliest = matches[0]!;
    const idx = earliest.match.index ?? 0;

    if (idx > 0) {
      parts.push(remaining.slice(0, idx));
    }

    const inner = earliest.match[1];
    if (earliest.type === "bold") {
      parts.push(
        <strong key={key++} style={{ fontWeight: 600, color: "#111827" }}>
          {inner}
        </strong>
      );
    } else if (earliest.type === "italic") {
      parts.push(
        <em key={key++} style={{ fontStyle: "italic", color: "rgba(17,24,39,0.8)" }}>
          {inner}
        </em>
      );
    } else if (earliest.type === "code") {
      parts.push(
        <code
          key={key++}
          style={{
            backgroundColor: "rgba(0,0,0,0.04)",
            color: "#16A34A",
            fontSize: "12px",
            fontFamily: "'IBM Plex Mono', monospace",
            padding: "1px 6px",
            borderRadius: "4px",
          }}
        >
          {inner}
        </code>
      );
    } else if (earliest.type === "link") {
      const linkText = earliest.match[1];
      const linkUrl = earliest.match[2];
      parts.push(
        <a
          key={key++}
          href={linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#16A34A", textDecoration: "underline" }}
        >
          {linkText}
        </a>
      );
    }

    remaining = remaining.slice(idx + earliest.match[0].length);
  }

  return parts;
}

// ── Supplement block parser ────────────────────────────────────────────────

const SUPPLEMENT_REGEX = /:::supplement\s*(\{[\s\S]*?\})\s*:::/g;

function parseSupplementBlock(jsonStr: string): SupplementBlock | null {
  try {
    const parsed = JSON.parse(jsonStr);
    return {
      name: parsed.name || "Unknown Supplement",
      slug: parsed.slug || "unknown",
      dosage: parsed.dosage || "See details",
      timing: parsed.timing || "As directed",
      goal: parsed.goal || "General",
      confidence: ["strong", "good", "emerging"].includes(parsed.confidence)
        ? parsed.confidence
        : "emerging",
    };
  } catch {
    return null;
  }
}

interface ContentSegment {
  type: "text" | "supplement" | "malformed";
  content: string;
  supplement?: SupplementBlock;
}

function splitContent(raw: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  let lastIndex = 0;

  // Reset regex state
  SUPPLEMENT_REGEX.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = SUPPLEMENT_REGEX.exec(raw)) !== null) {
    // Text before this match
    if (match.index > lastIndex) {
      segments.push({ type: "text", content: raw.slice(lastIndex, match.index) });
    }

    const supplement = parseSupplementBlock(match[1]);
    if (supplement) {
      segments.push({ type: "supplement", content: match[0], supplement });
    } else {
      // Malformed JSON — render as code block
      segments.push({ type: "malformed", content: match[1] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Remaining text after last match
  if (lastIndex < raw.length) {
    segments.push({ type: "text", content: raw.slice(lastIndex) });
  }

  return segments;
}

// ── Markdown block renderer ────────────────────────────────────────────────

function renderMarkdownText(text: string, startKey: number): { nodes: React.ReactNode[]; nextKey: number } {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: { text: string; ordered: boolean }[] = [];
  let key = startKey;

  const flushList = () => {
    if (listItems.length === 0) return;
    const isOrdered = listItems[0].ordered;
    const Tag = isOrdered ? "ol" : "ul";
    elements.push(
      <Tag
        key={key++}
        style={{
          listStyleType: isOrdered ? "decimal" : "disc",
          marginLeft: "16px",
          marginTop: "8px",
          marginBottom: "8px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
        }}
      >
        {listItems.map((item, i) => (
          <li
            key={i}
            style={{
              color: "#374151",
              fontSize: "15px",
              lineHeight: 1.7,
              paddingLeft: "4px",
            }}
          >
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

    // Heading: ### text, ## text, # text
    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const fontSize = level === 1 ? "18px" : level === 2 ? "16px" : "15px";
      elements.push(
        <p key={key++} style={{ fontSize, fontWeight: 600, color: "#111827", lineHeight: 1.5, marginTop: "8px" }}>
          {parseInline(headingMatch[2])}
        </p>
      );
      continue;
    }

    const ulMatch = trimmed.match(/^[-*]\s+(.+)/);
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/);

    if (ulMatch) {
      if (listItems.length > 0 && listItems[0].ordered) flushList();
      listItems.push({ text: ulMatch[1], ordered: false });
      continue;
    }

    if (olMatch) {
      if (listItems.length > 0 && !listItems[0].ordered) flushList();
      listItems.push({ text: olMatch[2], ordered: true });
      continue;
    }

    flushList();

    if (trimmed === "") {
      elements.push(<div key={key++} style={{ height: "8px" }} />);
      continue;
    }

    elements.push(
      <p key={key++} style={{ color: "#374151", fontSize: "15px", lineHeight: 1.7 }}>
        {parseInline(trimmed)}
      </p>
    );
  }

  flushList();
  return { nodes: elements, nextKey: key };
}

// ── Main component ─────────────────────────────────────────────────────────

export function ChatMarkdown({ content }: { content: string }) {
  const segments = splitContent(content);
  const elements: React.ReactNode[] = [];
  let key = 0;

  for (const segment of segments) {
    if (segment.type === "supplement" && segment.supplement) {
      elements.push(
        <SupplementCard key={key++} supplement={segment.supplement} />
      );
    } else if (segment.type === "malformed") {
      elements.push(
        <pre
          key={key++}
          style={{
            backgroundColor: "rgba(0,0,0,0.04)",
            padding: "12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#DC2626",
            overflowX: "auto",
            margin: "8px 0",
          }}
        >
          {segment.content}
        </pre>
      );
    } else {
      const { nodes, nextKey } = renderMarkdownText(segment.content, key);
      elements.push(...nodes);
      key = nextKey;
    }
  }

  return <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>{elements}</div>;
}
