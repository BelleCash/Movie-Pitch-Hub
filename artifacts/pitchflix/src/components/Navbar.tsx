import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/BillingContext";

interface NavbarProps {
  isLive: boolean;
  view: string;
  onSetView: (v: string) => void;
  search: string;
  onSearchChange: (q: string) => void;
  onOpenCreate: () => void;
  onOpenAuth: () => void;
}

export default function Navbar({ isLive, view, onSetView, search, onSearchChange, onOpenCreate, onOpenAuth }: NavbarProps) {
  const { user, userProfile, signOut } = useAuth();
  const { tier } = useBilling();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const initial = user?.email?.[0]?.toUpperCase() ?? "?";
  const role = userProfile?.role ?? "viewer";
  const isInvestor = role === "investor";
  const isCreator = role === "creator";

  return (
    <nav className={`glass-nav fixed top-0 left-0 right-0 z-50${scrolled ? " scrolled" : ""}`}>
      <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>

        <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer" }}
          onClick={() => { onSetView("home"); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
          <div style={{ width: 33, height: 33, background: "#7c3aed", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🎬</div>
          <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.04em" }}>Pitch<span style={{ color: "#8b5cf6" }}>Flix</span></span>
        </div>

        <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <span className={`nav-link${view === "home" ? " active" : ""}`} onClick={() => onSetView("home")}>Home</span>
          <span className={`nav-link${view === "trending" ? " active" : ""}`} onClick={() => onSetView("trending")}>Trending</span>
          {user && <Link href="/pricing" className="nav-link">Pricing</Link>}
          {user && isInvestor && <Link href="/investor" className="nav-link" style={{ color: "#a78bfa" }}>💼 Deals</Link>}
          {user && (isCreator || isInvestor) && <Link href="/dashboard" className="nav-link">Dashboard</Link>}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className={`db-chip ${isLive ? "live" : "demo"}`}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: isLive ? "#4ade80" : "#fbbf24", flexShrink: 0, display: "inline-block" }} />
            {isLive ? "Live DB" : "Demo"}
          </div>

          <div className="search-wrap desktop-only">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input className="search-input" type="search" placeholder="Search pitches…"
              value={search} onChange={(e) => onSearchChange(e.target.value)} />
          </div>

          {user ? (
            <div style={{ position: "relative" }} ref={menuRef}>
              <button onClick={() => setMenuOpen((o) => !o)}
                style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#8b5cf6)", border: "none", cursor: "pointer", color: "#fff", fontWeight: 800, fontSize: 14, fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {initial}
              </button>
              {menuOpen && (
                <div style={{ position: "absolute", right: 0, top: 44, background: "#14141e", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 8, minWidth: 220, zIndex: 100, boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
                  <div style={{ padding: "8px 12px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", marginBottom: 6 }}>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>Signed in as</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6 }}>
                      <RoleBadge role={role} />
                      {tier !== "free" && <TierBadge tier={tier} />}
                    </div>
                  </div>
                  {(isCreator || isInvestor) && <MenuRow icon="+" label="Submit Pitch" onClick={() => { setMenuOpen(false); onOpenCreate(); }} />}
                  {user && <MenuLinkRow icon="💳" label="Pricing" href="/pricing" onClose={() => setMenuOpen(false)} />}
                  {isInvestor && <MenuLinkRow icon="💼" label="Investor Dashboard" href="/investor" onClose={() => setMenuOpen(false)} />}
                  {(isCreator || isInvestor) && <MenuLinkRow icon="⊞" label="Dashboard" href="/dashboard" onClose={() => setMenuOpen(false)} />}
                  <MenuRow icon="→" label="Sign Out" onClick={() => { setMenuOpen(false); signOut(); }} danger />
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="btn-ghost desktop-only" onClick={onOpenAuth}
                style={{ padding: "9px 18px", borderRadius: 9, fontSize: 13 }}>Sign In</button>
              <button className="btn-purple desktop-only" onClick={onOpenCreate}
                style={{ padding: "9px 18px", borderRadius: 9, fontSize: 13 }}>+ Submit Pitch</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { icon: string; color: string; bg: string }> = {
    viewer:   { icon: "👁",  color: "#9ca3af", bg: "rgba(156,163,175,0.1)" },
    creator:  { icon: "🎬", color: "#a78bfa", bg: "rgba(124,58,237,0.12)" },
    investor: { icon: "💼", color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  };
  const s = map[role] ?? map.viewer;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.bg, padding: "2px 8px", borderRadius: 4, textTransform: "capitalize" }}>
      {s.icon} {role}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", background: "rgba(124,58,237,0.15)", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>
      {tier}
    </span>
  );
}

function MenuRow({ icon, label, onClick, danger }: { icon: string; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "none", border: "none", color: danger ? "#f87171" : "#e2e8f0", padding: "9px 12px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit", transition: "background 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = danger ? "rgba(229,9,20,0.1)" : "rgba(255,255,255,0.05)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
      <span style={{ fontSize: 13 }}>{icon}</span> {label}
    </button>
  );
}

function MenuLinkRow({ icon, label, href, onClose }: { icon: string; label: string; href: string; onClose: () => void }) {
  return (
    <a href={href} onClick={onClose}
      style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "#e2e8f0", padding: "9px 12px", borderRadius: 8, fontSize: 13, transition: "background 0.2s" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "")}>
      <span>{icon}</span> {label}
    </a>
  );
}
