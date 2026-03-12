"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/stack");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.75rem", color: "#6B7280" }}>
        Redirecting to your stack...
      </p>
    </div>
  );
}
