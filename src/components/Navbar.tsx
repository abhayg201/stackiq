"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { LogOut, Menu, X, Clock } from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export default function Navbar({ onToggleSidebar }: NavbarProps = {}) {
  const [user, setUser] = useState<User | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const isChat = pathname === "/chat";

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Responsive check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
      <div style={{ maxWidth: "52rem", marginLeft: "auto", marginRight: "auto", paddingLeft: "1.5rem", paddingRight: "1.5rem", height: "3.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
          <div style={{ width: "1.75rem", height: "1.75rem", backgroundColor: "#16A34A", borderRadius: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#FFFFFF", fontSize: "0.875rem", fontWeight: 900 }}>&#9672;</span>
          </div>
          <span style={{ color: "#111827", fontSize: "0.9375rem", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, letterSpacing: "0.04em" }}>
            STACKIQ
          </span>
        </Link>

        {/* Desktop Nav */}
        {!isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {user ? (
              <>
                <Link
                  href="/chat"
                  style={{ padding: "0.375rem 1rem", fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", color: "#6B7280", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "0.375rem", textDecoration: "none" }}
                >
                  CHAT
                </Link>
                <Link
                  href="/stack"
                  style={{ padding: "0.375rem 1rem", fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", color: "#6B7280", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "0.375rem", textDecoration: "none" }}
                >
                  MY STACK
                </Link>

                {/* Sidebar toggle (only on chat page) */}
                {isChat && onToggleSidebar && (
                  <button
                    onClick={onToggleSidebar}
                    style={{ padding: "0.375rem", color: "#6B7280", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "0.375rem", background: "none", cursor: "pointer" }}
                    title="Consultation history"
                  >
                    <Clock size={14} />
                  </button>
                )}

                <div style={{ width: "1px", height: "1.25rem", backgroundColor: "rgba(0,0,0,0.08)", marginLeft: "0.25rem", marginRight: "0.25rem" }} />
                <span style={{ color: "#6B7280", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace", maxWidth: "140px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  style={{ padding: "0.375rem", color: "#6B7280", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "0.375rem", background: "none", cursor: "pointer" }}
                  title="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  style={{ padding: "0.375rem 1rem", fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", color: "#6B7280", border: "1px solid rgba(0,0,0,0.08)", borderRadius: "0.375rem", textDecoration: "none" }}
                >
                  LOG IN
                </Link>
                <Link
                  href="/auth/signup"
                  style={{ padding: "0.5rem 1.25rem", fontSize: "0.6875rem", fontFamily: "'IBM Plex Mono', monospace", letterSpacing: "0.08em", fontWeight: 700, color: "#FFFFFF", backgroundColor: "#16A34A", borderRadius: "0.5rem", textDecoration: "none" }}
                >
                  GET STARTED
                </Link>
              </>
            )}
          </div>
        )}

        {/* Mobile toggle */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {/* Sidebar toggle on mobile (chat page only) */}
            {isChat && onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                style={{ padding: "0.5rem", color: "#6B7280", background: "none", border: "none", cursor: "pointer" }}
                title="Consultation history"
              >
                <Clock size={20} />
              </button>
            )}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ padding: "0.5rem", color: "#6B7280", background: "none", border: "none", cursor: "pointer" }}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && isMobile && (
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.06)", backgroundColor: "#FFFFFF" }}>
          <div style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {user ? (
              <>
                <Link href="/chat" onClick={() => setMenuOpen(false)} style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", fontFamily: "'IBM Plex Mono', monospace", color: "#111827", textDecoration: "none", borderRadius: "0.5rem" }}>
                  Chat
                </Link>
                <Link href="/stack" onClick={() => setMenuOpen(false)} style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", fontFamily: "'IBM Plex Mono', monospace", color: "#111827", textDecoration: "none", borderRadius: "0.5rem" }}>
                  My Stack
                </Link>
                <hr style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.06)" }} />
                <span style={{ padding: "0 1rem", color: "#6B7280", fontSize: "0.75rem", fontFamily: "'IBM Plex Mono', monospace" }}>
                  {user.email}
                </span>
                <button
                  onClick={() => { handleSignOut(); setMenuOpen(false); }}
                  style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", fontFamily: "'IBM Plex Mono', monospace", color: "#DC2626", background: "none", border: "none", cursor: "pointer", textAlign: "left", borderRadius: "0.5rem" }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setMenuOpen(false)} style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", fontFamily: "'IBM Plex Mono', monospace", color: "#111827", textDecoration: "none", borderRadius: "0.5rem" }}>
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMenuOpen(false)}
                  style={{ padding: "0.625rem 1rem", fontSize: "0.875rem", fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, color: "#FFFFFF", backgroundColor: "#16A34A", borderRadius: "0.5rem", textDecoration: "none", textAlign: "center" }}
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
