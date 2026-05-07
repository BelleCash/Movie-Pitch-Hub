import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/BillingContext";
import { usePitches } from "@/hooks/usePitches";
import InvestorPaywall from "@/components/billing/InvestorPaywall";
import type { Pitch } from "@/types";

const KPI = ({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: string }) => (
  <div style={{ background: "#12121a", border: "1px solid rgba(124,58,237,0.12)", borderRadius: 18, padding: "22px 24px" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
      <span style={{ fontSize: 22 }}>{icon}</span>
    </div>
    <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 4 }}>{value}</div>
    <div style={{ fontSize: 12, color: "#4b5563" }}>{sub}</div>
  </div>
);

export default function InvestorDashboard() {
  const { user, userProfile } = useAuth();
  const { tier, isSubscribed } = useBilling();
  const { pitches, isLive, loading } = usePitches();
  const [, navigate] = useLocation();
  const [watchlist, setWatchlist] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(`pf-watch-${user?.id}`) ?? "[]")); }
    catch { return new Set(); }
  });

  const trending = useMemo(() => pitches.filter((p) => p.trending).slice(0, 6), [pitches]);
  const watchlisted = useMemo(() => pitches.filter((p) => watchlist.has(p.id)), [pitches, watchlist]);

  const needsUpgrade = userProfile?.role === "investor" && !isSubscribed && tier === "free";
  if (needsUpgrade) return <InvestorPaywall />;

  const toggleWatch = (id: string) => {
    setWatchlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); toast("Removed from watchlist"); }
      else { next.add(id); toast.success("Added to watchlist 👀"); }
      try { localStorage.setItem(`pf-watch-${user?.id}`, JSON.stringify([...next])); } catch {}
      return next;
    });
  };

  const initial = user?.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div style={{ background: "#0b0b0f", minHeight: "100vh", paddingBottom: 80 }}>
      <nav className="glass-nav" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 33, height: 33, background: "#7c3aed", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🎬</div>
            <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff" }}>Pitch<span style={{ color: "#8b5cf6" }}>Flix</span></span>
          </a>
          <h1 style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>💼 Investor Dashboard</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className={`db-chip ${isLive ? "live" : "demo"}`}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: isLive ? "#4ade80" : "#fbbf24", display: "inline-block" }} />
              {isLive ? "Live DB" : "Demo"}
            </div>
            <div style={{ background: "linear-gradient(135deg,#7c3aed,#8b5cf6)", padding: "4px 12px", borderRadius: 50, fontSize: 11, fontWeight: 800, color: "#fff" }}>
              {tier.toUpperCase()}
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff" }}>
              {initial}
            </div>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1380, margin: "0 auto", padding: "44px 28px 0" }}>
        <div style={{ marginBottom: 36 }}>
          <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 6 }}>Investor View</p>
          <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em" }}>
            Deal<span style={{ color: "#8b5cf6" }}>Flow</span> Dashboard
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 44 }}>
          <KPI label="Active Pitches" value={String(pitches.length)} sub="In the marketplace" icon="🎬" />
          <KPI label="Trending Now" value={String(trending.length)} sub="Gaining momentum" icon="🔥" />
          <KPI label="Watchlisted" value={String(watchlist.size)} sub="Saved opportunities" icon="👀" />
          <KPI label="Available Capital" value="—" sub="Connect wallet to set" icon="💰" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          <Section title="🔥 Trending Pitches" sub={`${trending.length} hot right now`}>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[1,2,3].map((i) => <div key={i} className="skeleton" style={{ height: 70, borderRadius: 12 }} />)}
              </div>
            ) : trending.map((p) => (
              <DealRow key={p.id} pitch={p} watched={watchlist.has(p.id)} onWatch={() => toggleWatch(p.id)} />
            ))}
          </Section>

          <Section title="👀 My Watchlist" sub={watchlist.size === 0 ? "Nothing saved yet" : `${watchlist.size} opportunities`}>
            {watchlisted.length === 0 ? (
              <EmptyState text="Click the eye icon on any pitch to add it to your watchlist." />
            ) : watchlisted.map((p) => (
              <DealRow key={p.id} pitch={p} watched onWatch={() => toggleWatch(p.id)} />
            ))}
          </Section>
        </div>

        <Section title="📋 Deal Pipeline" sub="All pitches — sorted by traction" style={{ marginTop: 28 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 14 }}>
            {pitches.slice(0, 9).map((p) => (
              <PipelineCard key={p.id} pitch={p} watched={watchlist.has(p.id)} onWatch={() => toggleWatch(p.id)} />
            ))}
          </div>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, sub, children, style }: { title: string; sub: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 20, padding: 24, ...style }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800 }}>{title}</h3>
        <p style={{ fontSize: 12, color: "#4b5563", marginTop: 4 }}>{sub}</p>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>{children}</div>
    </div>
  );
}

function DealRow({ pitch, watched, onWatch }: { pitch: Pitch; watched: boolean; onWatch: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "rgba(255,255,255,0.025)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)", transition: "background 0.2s" }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.06)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.025)")}>
      <img src={pitch.image} alt="" style={{ width: 44, height: 60, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=100&q=60"; }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pitch.title}</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 3 }}>{pitch.genre} · {pitch.year} · ❤️ {pitch.likes}</div>
      </div>
      <button onClick={onWatch} title={watched ? "Remove" : "Watch"}
        style={{ background: watched ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${watched ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: 8, padding: "6px 8px", cursor: "pointer", color: watched ? "#8b5cf6" : "#6b7280", fontSize: 14, transition: "all 0.2s", fontFamily: "inherit" }}>
        👁
      </button>
    </div>
  );
}

function PipelineCard({ pitch, watched, onWatch }: { pitch: Pitch; watched: boolean; onWatch: () => void }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.25)"; e.currentTarget.style.background = "rgba(124,58,237,0.04)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}>
      <img src={pitch.image} alt="" style={{ width: 38, height: 52, objectFit: "cover", borderRadius: 7, flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=80&q=60"; }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pitch.title}</div>
        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>{pitch.genre}</div>
        <div style={{ fontSize: 11, color: "#8b5cf6", marginTop: 2 }}>❤️ {pitch.likes} · {pitch.trending ? "🔥 Trending" : pitch.year}</div>
      </div>
      <button onClick={onWatch}
        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, opacity: watched ? 1 : 0.35, transition: "opacity 0.2s", fontFamily: "inherit" }}>
        👁
      </button>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "28px 0", color: "#4b5563" }}>
      <div style={{ fontSize: 32, marginBottom: 10 }}>👀</div>
      <p style={{ fontSize: 13, lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}
