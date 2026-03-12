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
    <nav style={{ position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(6,6,14,0.8)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <div style={{ maxWidth: "52rem", marginLeft: "auto", marginRight: "auto", paddingLeft: "1.5rem", paddingRight: "1.5rem", height: "3.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center group-hover:shadow-[0_0_16px_rgba(186,255,41,0.3)] transition-shadow">
            <span className="text-[#06060E] text-sm font-black">&#9672;</span>
          </div>
          <span className="text-fg text-[15px] font-mono font-bold tracking-wide">
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
              <div className="w-px h-5 bg-stroke mx-1" />
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
                className="px-5 py-2 text-[11px] font-mono tracking-wider font-bold text-[#06060E] bg-accent hover:bg-accent/90 rounded-lg transition-all shadow-[0_0_20px_rgba(186,255,41,0.15)]"
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
        <div className="md:hidden border-t border-stroke bg-surface animate-fade-in">
          <div className="px-4 py-4 flex flex-col gap-3">
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
                <hr className="border-stroke" />
                <span className="px-4 text-muted text-xs font-mono">
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
                  className="px-4 py-2.5 text-sm font-mono font-bold text-[#06060E] bg-accent rounded-lg text-center"
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
