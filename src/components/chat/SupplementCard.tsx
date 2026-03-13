"use client";

import { ArrowUpRight } from "lucide-react";
import { SupplementBlock, getCategoryColor, CONFIDENCE_CONFIG } from "@/lib/chat-types";

export default function SupplementCard({ supplement }: { supplement: SupplementBlock }) {
  const categoryColor = getCategoryColor(supplement.goal);
  const confidenceInfo = CONFIDENCE_CONFIG[supplement.confidence] || CONFIDENCE_CONFIG['emerging'];

  const handleClick = () => {
    window.open(`/supplement/${supplement.slug}`, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        padding: "14px 16px",
        backgroundColor: "#F9FAFB",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: "12px",
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s ease",
        marginTop: "8px",
        marginBottom: "8px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.14)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
      }}
    >
      {/* Category dot */}
      <div
        style={{
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          backgroundColor: categoryColor,
          flexShrink: 0,
        }}
      />

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "15px", fontWeight: 600, color: "#111827", lineHeight: 1.4 }}>
          {supplement.name}
        </div>
        <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>
          {supplement.dosage} · {supplement.timing} · {supplement.goal}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "6px" }}>
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: confidenceInfo.color,
            }}
          />
          <span style={{ fontSize: "11px", color: confidenceInfo.color, fontWeight: 500 }}>
            {confidenceInfo.label}
          </span>
        </div>
      </div>

      {/* Arrow */}
      <ArrowUpRight size={16} color="#9CA3AF" style={{ flexShrink: 0 }} />
    </button>
  );
}
