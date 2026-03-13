import { Stethoscope, ArrowLeft } from "lucide-react";
import Link from "next/link";

function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function SupplementDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = slugToTitle(slug);

  const sections = ["Overview", "Evidence", "Dosage & Timing", "Interactions", "Sources"];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
      <div style={{ maxWidth: "680px", marginLeft: "auto", marginRight: "auto", padding: "48px 24px" }}>
        {/* Back link */}
        <Link
          href="/chat"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            color: "#6B7280",
            fontSize: "13px",
            textDecoration: "none",
            marginBottom: "32px",
          }}
        >
          <ArrowLeft size={14} />
          Back to consultation
        </Link>

        {/* Hero */}
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "rgba(22,163,74,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <Stethoscope size={24} color="#16A34A" />
          </div>
          <h1 style={{ fontSize: "28px", fontWeight: 700, color: "#111827", lineHeight: 1.3, marginBottom: "8px" }}>
            {title}
          </h1>
          <p style={{ color: "#6B7280", fontSize: "15px" }}>
            Supplement profile and clinical evidence
          </p>
        </div>

        {/* Coming soon banner */}
        <div
          style={{
            backgroundColor: "#F0FDF4",
            border: "1px solid rgba(22,163,74,0.15)",
            borderRadius: "12px",
            padding: "20px 24px",
            marginBottom: "40px",
          }}
        >
          <p style={{ color: "#16A34A", fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
            Detailed profiles coming soon
          </p>
          <p style={{ color: "#6B7280", fontSize: "13px" }}>
            We're building comprehensive evidence-based profiles for each supplement. Check back soon.
          </p>
        </div>

        {/* Placeholder sections */}
        {sections.map((section) => (
          <div key={section} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "12px", paddingBottom: "8px", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              {section}
            </h2>
            <div
              style={{
                backgroundColor: "#F9FAFB",
                borderRadius: "8px",
                padding: "24px",
                color: "#9CA3AF",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              Content for {section.toLowerCase()} will appear here
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
