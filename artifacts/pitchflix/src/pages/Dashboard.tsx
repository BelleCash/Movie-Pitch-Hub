import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { usePitches } from "@/hooks/usePitches";
import { useAuth } from "@/context/AuthContext";
import PitchGrid from "@/components/PitchGrid";
import CreatePitchModal from "@/components/CreatePitchModal";

export default function Dashboard() {
  const { user, signOut, authLoading } = useAuth();
  const { pitches, isLive, loading, updateLikes } = usePitches();
  const [, navigate] = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [myIds, setMyIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!authLoading && !user) navigate("/");
  }, [user, authLoading, navigate]);

  const myIdsKey = `pf-my-${user?.id ?? ""}`;
  useEffect(() => {
    if (!user) return;
    try { setMyIds(new Set(JSON.parse(localStorage.getItem(myIdsKey) ?? "[]"))); }
    catch { setMyIds(new Set()); }
  }, [user, myIdsKey]);

  const likedKey = `pf-liked-${user?.id ?? "guest"}`;
  const [liked, setLiked] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem(likedKey) ?? "[]")); }
    catch { return new Set(); }
  });

  const myPitches = useMemo(() => {
    if (!user) return [];
    const byUserId = pitches.filter((p) => p.user_id === user.id);
    const byLocalIds = pitches.filter((p) => myIds.has(p.id));
    const seen = new Set<string>();
    return [...byUserId, ...byLocalIds].filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id); return true;
    });
  }, [pitches, user, myIds]);

  const handleLike = useCallback((id: string, currentLikes: number) => {
    const isLiked = liked.has(id);
    const newLiked = new Set(liked);
    if (isLiked) newLiked.delete(id); else newLiked.add(id);
    setLiked(newLiked);
    try { localStorage.setItem(likedKey, JSON.stringify([...newLiked])); } catch {}
    updateLikes(id, Math.max(0, currentLikes + (isLiked ? -1 : 1)));
  }, [liked, likedKey, updateLikes]);

  const handleCreated = (id: string) => {
    setMyIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try { localStorage.setItem(myIdsKey, JSON.stringify([...next])); } catch {}
      return next;
    });
    toast.success("Pitch live!", { description: "Your pitch is now visible to everyone 🎬" });
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0b0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 40, height: 40, border: "3px solid rgba(229,9,20,0.2)", borderTopColor: "#e50914", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
      </div>
    );
  }

  if (!user) return null;

  const initial = user.email?.[0]?.toUpperCase() ?? "?";

  return (
    <div style={{ background: "#0b0b0f", minHeight: "100vh" }}>
      <nav className="glass-nav" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none", cursor: "pointer" }}>
            <div style={{ width: 33, height: 33, background: "#e50914", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🎬</div>
            <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff" }}>Pitch<span style={{ color: "#e50914" }}>Flix</span></span>
          </a>

          <h1 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>My Dashboard</h1>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className={`db-chip ${isLive ? "live" : "demo"}`}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: isLive ? "#4ade80" : "#fbbf24", display: "inline-block" }} />
              {isLive ? "Live DB" : "Demo Mode"}
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#e50914", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#fff", flexShrink: 0 }}>
              {initial}
            </div>
            <button className="btn-ghost" onClick={signOut} style={{ padding: "8px 16px", borderRadius: 9, fontSize: 13 }}>Sign Out</button>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1380, margin: "0 auto", padding: "48px 28px 120px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 40 }}>
          <div>
            <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 6 }}>Welcome back,</p>
            <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em" }}>
              {user.email?.split("@")[0]}
              <span style={{ color: "#e50914" }}>.</span>
            </h2>
            <p style={{ color: "#4b5563", fontSize: 13, marginTop: 8 }}>
              {myPitches.length === 0 ? "You haven't submitted any pitches yet" : `${myPitches.length} pitch${myPitches.length !== 1 ? "es" : ""} submitted`}
            </p>
          </div>
          <button className="btn-purple" onClick={() => setCreateOpen(true)}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Pitch
          </button>
        </div>

        {myPitches.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎬</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Your story starts here</h3>
            <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 30, maxWidth: 400, margin: "0 auto 30px" }}>
              Submit your first pitch and share it with creators around the world.
            </p>
            <button className="btn-red" onClick={() => setCreateOpen(true)}>
              🎬 Submit Your First Pitch
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 20, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>My Pitches</h3>
            <PitchGrid pitches={myPitches} loading={loading} liked={liked} onLike={handleLike} />
          </>
        )}

        <div style={{ marginTop: 64, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 40 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 20 }}>Account</h3>
          <div style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, maxWidth: 480 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(229,9,20,0.15)", border: "1px solid rgba(229,9,20,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: "#e50914", flexShrink: 0 }}>
                {initial}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{user.email?.split("@")[0]}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>{user.email}</div>
              </div>
            </div>
            <button onClick={signOut}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(229,9,20,0.08)", border: "1px solid rgba(229,9,20,0.2)", borderRadius: 10, padding: "10px 18px", cursor: "pointer", color: "#f87171", fontWeight: 600, fontSize: 13, fontFamily: "inherit", transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(229,9,20,0.18)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(229,9,20,0.08)")}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </div>
      </main>

      <CreatePitchModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleCreated} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
