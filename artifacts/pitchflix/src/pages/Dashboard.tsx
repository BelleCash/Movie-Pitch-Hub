import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { usePitches } from "@/hooks/usePitches";
import { useAuth } from "@/context/AuthContext";
import PitchGrid from "@/components/PitchGrid";
import CreatePitchModal from "@/components/CreatePitchModal";

function avatarUrl(username?: string, email?: string) {
  const seed = encodeURIComponent(username || email?.split("@")[0] || "user");
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=7c3aed&backgroundType=solid`;
}

export default function Dashboard() {
  const { user, userProfile, signOut, authLoading } = useAuth();
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

  const totalLikes = useMemo(() => myPitches.reduce((s, p) => s + p.likes, 0), [myPitches]);

  const activationScore = useMemo(() => {
    let score = 0;
    if (userProfile?.username) score += 30;
    if (myPitches.length > 0) score += 50;
    if (totalLikes > 0) score += 20;
    return Math.min(100, score);
  }, [userProfile, myPitches, totalLikes]);

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
        <div style={{ width: 40, height: 40, border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user) return null;

  const displayName = userProfile?.username || user.email?.split("@")[0] || "Creator";
  const initial = displayName[0]?.toUpperCase() ?? "?";
  const avatar = avatarUrl(userProfile?.username, user.email);

  return (
    <div style={{ background: "#0b0b0f", minHeight: "100vh" }}>
      <nav className="glass-nav" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 33, height: 33, background: "#7c3aed", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🎬</div>
            <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff" }}>Pitch<span style={{ color: "#8b5cf6" }}>Flix</span></span>
          </a>
          <h1 style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0" }}>Creator Dashboard</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className={`db-chip ${isLive ? "live" : "demo"}`}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: isLive ? "#4ade80" : "#fbbf24", display: "inline-block" }} />
              {isLive ? "Live DB" : "Demo"}
            </div>
            <img src={avatar} alt={initial} style={{ width: 36, height: 36, borderRadius: "50%", background: "#7c3aed", objectFit: "cover", border: "2px solid rgba(124,58,237,0.4)" }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <a href="/settings" style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 9, padding: "8px 14px", color: "#e2e8f0", textDecoration: "none", fontSize: 13, fontWeight: 500, transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.06)")}>
              ⚙️ Settings
            </a>
          </div>
        </div>
      </nav>

      <main style={{ maxWidth: 1380, margin: "0 auto", padding: "48px 28px 120px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 44 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <img src={avatar} alt={initial} style={{ width: 72, height: 72, borderRadius: "50%", background: "#7c3aed", objectFit: "cover", border: "3px solid rgba(124,58,237,0.4)", flexShrink: 0 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
            <div>
              <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 4 }}>Welcome back,</p>
              <h2 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em" }}>
                {displayName}<span style={{ color: "#8b5cf6" }}>.</span>
              </h2>
              {userProfile?.bio && <p style={{ color: "#6b7280", fontSize: 13, marginTop: 5, maxWidth: 320 }}>{userProfile.bio}</p>}
            </div>
          </div>
          <button className="btn-purple" onClick={() => setCreateOpen(true)}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Pitch
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 44 }}>
          <StatCard icon="🎬" label="Pitches" value={String(myPitches.length)} sub="submitted" />
          <StatCard icon="❤️" label="Total Likes" value={String(totalLikes)} sub="across all pitches" />
          <StatCard icon="🔥" label="Trending" value={String(myPitches.filter((p) => p.trending).length)} sub="currently hot" />
          <div style={{ background: "#12121a", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 18, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>Activation Score</span>
              <span style={{ fontSize: 22 }}>⚡</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 10 }}>{activationScore}<span style={{ fontSize: 14, color: "#6b7280", fontWeight: 500 }}>/100</span></div>
            <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${activationScore}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: 3, transition: "width 1s ease-out" }} />
            </div>
            <div style={{ fontSize: 10, color: "#4b5563", marginTop: 6 }}>
              {activationScore < 30 ? "Add a username to get started" : activationScore < 80 ? "Submit your first pitch to boost" : "You're fully activated! 🚀"}
            </div>
          </div>
        </div>

        {activationScore < 100 && (
          <div style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 16, padding: "16px 20px", marginBottom: 32, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 20 }}>💡</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3 }}>Complete your profile for maximum visibility</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {!userProfile?.username ? "→ Set a username (+30 pts)" : myPitches.length === 0 ? "→ Submit your first pitch (+50 pts)" : "→ Get your first likes (+20 pts)"}
                </div>
              </div>
            </div>
            {!userProfile?.username && (
              <a href="/settings" className="btn-purple" style={{ textDecoration: "none", padding: "8px 18px", fontSize: 12, borderRadius: 9 }}>Complete Profile</a>
            )}
          </div>
        )}

        {myPitches.length === 0 && !loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🎬</div>
            <h3 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Your story starts here</h3>
            <p style={{ color: "#6b7280", fontSize: 15, marginBottom: 30, maxWidth: 400, margin: "0 auto 30px" }}>
              Submit your first pitch and share it with investors around the world.
            </p>
            <button className="btn-purple" onClick={() => setCreateOpen(true)}>
              🎬 Submit Your First Pitch
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: 11, fontWeight: 700, marginBottom: 20, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em" }}>My Pitches</h3>
            <PitchGrid pitches={myPitches} loading={loading} liked={liked} onLike={handleLike} />
          </>
        )}

        <div style={{ marginTop: 64, borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 40 }}>
          <h3 style={{ fontSize: 11, fontWeight: 700, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 20 }}>Account</h3>
          <div style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 16, padding: 24, maxWidth: 480 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <img src={avatar} alt={initial} style={{ width: 48, height: 48, borderRadius: "50%", background: "#7c3aed", border: "2px solid rgba(124,58,237,0.3)", objectFit: "cover" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{displayName}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>{user.email}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a href="/settings" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 10, padding: "10px 18px", cursor: "pointer", color: "#a78bfa", fontWeight: 600, fontSize: 13, textDecoration: "none", transition: "all 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.18)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.08)")}>
                ⚙️ Settings
              </a>
              <button onClick={signOut}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 18px", cursor: "pointer", color: "#9ca3af", fontWeight: 600, fontSize: 13, fontFamily: "inherit", transition: "all 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.09)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>

      <CreatePitchModal isOpen={createOpen} onClose={() => setCreateOpen(false)} onCreated={handleCreated} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: string; label: string; value: string; sub: string }) {
  return (
    <div style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18, padding: "20px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ fontSize: 22 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#4b5563" }}>{sub}</div>
    </div>
  );
}
