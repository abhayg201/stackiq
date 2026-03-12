"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/chat");
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#09090B", display: "flex", flexDirection: "column" }}>
      {/* Minimal nav */}
      <div style={{ paddingLeft: "1.5rem", paddingRight: "1.5rem", height: "3.5rem", display: "flex", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#71717A", textDecoration: "none", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace" }}
        >
          <ArrowLeft size={16} />
          BACK
        </Link>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "3rem 1rem" }}>
        <div className="animate-fade-up" style={{ width: "100%", maxWidth: "26rem" }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                width: "3rem",
                height: "3rem",
                backgroundColor: "#22D3EE",
                borderRadius: "0.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem",
                boxShadow: "0 0 30px rgba(34,211,238,0.2)",
              }}
            >
              <span style={{ color: "#042F2E", fontSize: "1.25rem", fontWeight: 900 }}>&#9672;</span>
            </div>
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "1.5rem", fontWeight: 700, color: "#F0F0F3", marginBottom: "0.5rem" }}>
              Welcome back
            </h1>
            <p style={{ color: "#71717A", fontSize: "0.875rem" }}>
              Sign in to access your personalized stack
            </p>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleLogin}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              backgroundColor: "#131316",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "0.75rem",
              color: "#F0F0F3",
              fontSize: "0.875rem",
              fontWeight: 500,
              marginBottom: "1.5rem",
              cursor: "pointer",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />
            <span style={{ color: "#71717A", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace" }}>OR</span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#71717A", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
                EMAIL
              </label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#71717A" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#131316",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0.75rem",
                    paddingLeft: "2.5rem",
                    paddingRight: "1rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    color: "#F0F0F3",
                    fontSize: "0.875rem",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                  placeholder="you@email.com"
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: "1rem" }}>
              <label style={{ display: "block", color: "#71717A", fontSize: "0.625rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.15em", marginBottom: "0.5rem" }}>
                PASSWORD
              </label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#71717A" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#131316",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "0.75rem",
                    paddingLeft: "2.5rem",
                    paddingRight: "3rem",
                    paddingTop: "0.75rem",
                    paddingBottom: "0.75rem",
                    color: "#F0F0F3",
                    fontSize: "0.875rem",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                  placeholder="Your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#71717A", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ backgroundColor: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "0.5rem", padding: "0.625rem 1rem", marginBottom: "1rem" }}>
                <p style={{ color: "#F87171", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace" }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                backgroundColor: "#22D3EE",
                color: "#042F2E",
                fontFamily: "'IBM Plex Mono', monospace",
                fontWeight: 700,
                fontSize: "0.75rem",
                letterSpacing: "0.08em",
                padding: "0.875rem",
                borderRadius: "0.75rem",
                border: "none",
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.5 : 1,
                boxShadow: "0 0 20px rgba(34,211,238,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginTop: "0.5rem",
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  SIGNING IN...
                </>
              ) : (
                "SIGN IN"
              )}
            </button>
          </form>

          {/* Footer */}
          <p style={{ textAlign: "center", color: "#71717A", fontSize: "0.875rem", marginTop: "1.5rem" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/signup" style={{ color: "#22D3EE", textDecoration: "none", fontWeight: 500 }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
