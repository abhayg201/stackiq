"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/stack");
  }, [router]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090B", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.75rem", color: "#71717A" }}>
        Redirecting to your stack...
      </p>
    </div>
  );
}
