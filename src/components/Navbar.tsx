"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { LogOut, Menu, X } from "lucide-react";

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(9,9,11,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ maxWidth: "52rem", marginLeft: "auto", marginRight: "auto", paddingLeft: "1.5rem", paddingRight: "1.5rem", height: "3.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
          <div style={{ width: "1.75rem", height: "1.75rem", backgroundColor: "#22D3EE", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#042F2E", fontSize: "0.875rem", fontWeight: 900 }}>&#9672;</span>
          </div>
          <span style={{ color: "#F0F0F3", fontSize: "0.9375rem", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, letterSpacing: "0.04em" }}>
            STACKIQ
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/chat"
                className="px-4 py-1.5 text-[11px] font-mono tracking-wider text-muted hover:text-accent border border-stroke hover:border-accent/40 rounded-md transition-all"
              >
                CHAT
              </Link>
              <Link
                href="/stack"
                className="px-4 py-1.5 text-[11px] font-mono tracking-wider text-muted hover:text-accent border border-stroke hover:border-accent/40 rounded-md transition-all"
              >
                MY STACK
              </Link>
              <div style={{ width: "1px", height: "1.25rem", backgroundColor: "rgba(255,255,255,0.08)", marginLeft: "0.25rem", marginRight: "0.25rem" }} />
              <span className="text-muted text-xs font-mono truncate max-w-[140px]">
                {user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="p-1.5 text-muted hover:text-siq-red border border-stroke hover:border-siq-red/40 rounded-md transition-all"
                title="Sign out"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className="px-4 py-1.5 text-[11px] font-mono tracking-wider text-muted hover:text-fg border border-stroke hover:border-stroke-hi rounded-md transition-all"
              >
                LOG IN
              </Link>
              <Link
                href="/auth/signup"
                style={{
                  padding: "0.5rem 1.25rem",
                  fontSize: "0.6875rem",
                  fontFamily: "'IBM Plex Mono', monospace",
                  letterSpacing: "0.08em",
                  fontWeight: 700,
                  color: "#042F2E",
                  backgroundColor: "#22D3EE",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  boxShadow: "0 0 20px rgba(34,211,238,0.15)",
                }}
              >
                GET STARTED
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-muted"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden animate-fade-in" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", backgroundColor: "#131316" }}>
          <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {user ? (
              <>
                <Link
                  href="/chat"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 text-sm font-mono text-fg hover:bg-faint rounded-lg transition"
                >
                  Chat
                </Link>
                <Link
                  href="/stack"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 text-sm font-mono text-fg hover:bg-faint rounded-lg transition"
                >
                  My Stack
                </Link>
                <hr style={{ border: "none", borderTop: "1px solid rgba(255,255,255,0.08)" }} />
                <span style={{ padding: "0 1rem", color: "#71717A", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace" }}>
                  {user.email}
                </span>
                <button
                  onClick={() => {
                    handleSignOut();
                    setMenuOpen(false);
                  }}
                  className="px-4 py-2.5 text-sm font-mono text-siq-red hover:bg-faint rounded-lg transition text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 text-sm font-mono text-fg hover:bg-faint rounded-lg transition"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    padding: "0.625rem 1rem",
                    fontSize: "0.875rem",
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontWeight: 700,
                    color: "#042F2E",
                    backgroundColor: "#22D3EE",
                    borderRadius: "0.5rem",
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
