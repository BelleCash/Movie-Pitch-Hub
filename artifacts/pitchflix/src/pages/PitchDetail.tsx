import { useCallback, useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { toast } from "sonner";
import { usePitches } from "@/hooks/usePitches";
import { useAuth } from "@/context/AuthContext";
import type { Pitch } from "@/types";

const FALLBACK = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80&auto=format&fit=crop";

export default function PitchDetail() {
  const [, params] = useRoute("/pitch/:id");
  const [, navigate] = useLocation();
  const { pitches, updateLikes } = usePitches();
  const { user } = useAuth();
  const [pitch, setPitch] = useState<Pitch | null>(null);

  const id = params?.id;

  useEffect(() => {
    if (!id) return;
    const found = pitches.find((p) => p.id === id);
    if (found) setPitch(found);
  }, [id, pitches]);

  const likedKey = `pf-liked-${user?.id ?? "guest"}`;
  const [liked, setLiked] = useState(() => {
    try { return new Set<string>(JSON.parse(localStorage.getItem(likedKey) ?? "[]")); }
    catch { return new Set<string>(); }
  });

  const handleLike = useCallback(() => {
    if (!pitch) return;
    if (!user) { toast("Sign in to like pitches", { action: { label: "Sign In", onClick: () => navigate("/") } }); return; }
    const isLiked = liked.has(pitch.id);
    const next = new Set(liked);
    if (isLiked) next.delete(pitch.id); else next.add(pitch.id);
    setLiked(next);
    try { localStorage.setItem(likedKey, JSON.stringify([...next])); } catch {}
    updateLikes(pitch.id, Math.max(0, pitch.likes + (isLiked ? -1 : 1)));
    setPitch((p) => p ? { ...p, likes: Math.max(0, p.likes + (isLiked ? -1 : 1)) } : p);
    if (!isLiked) toast.success("Liked!", { duration: 1400 });
  }, [pitch, liked, user, likedKey, updateLikes, navigate]);

  if (!pitch) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0b0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        {pitches.length === 0
          ? <div style={{ width: 40, height: 40, border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
          : <>
              <div style={{ fontSize: 48 }}>🎬</div>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Pitch not found</h2>
              <button className="btn-ghost" onClick={() => navigate("/")}>← Back to Feed</button>
            </>
        }
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isLiked = liked.has(pitch.id);
  const stars = "★".repeat(Math.round(pitch.rating || 4)) + "☆".repeat(5 - Math.round(pitch.rating || 4));

  return (
    <div style={{ background: "#0b0b0f", minHeight: "100vh" }}>
      <nav className="glass-nav" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 33, height: 33, background: "#7c3aed", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🎬</div>
            <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff" }}>Pitch<span style={{ color: "#8b5cf6" }}>Flix</span></span>
          </a>
          <button className="btn-ghost" onClick={() => navigate("/")} style={{ padding: "8px 18px", fontSize: 13 }}>← Back to Feed</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 28px 100px", display: "grid", gridTemplateColumns: "320px 1fr", gap: 48, alignItems: "start" }}>
        <div style={{ position: "sticky", top: 86 }}>
          <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.12)" }}>
            <img src={pitch.image} alt={pitch.title} style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }}
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }} />
            {pitch.trending && (
              <div style={{ position: "absolute", top: 14, left: 14, background: "linear-gradient(135deg,#7c3aed,#8b5cf6)", color: "#fff", fontSize: 9, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 6, boxShadow: "0 2px 10px rgba(124,58,237,0.45)" }}>
                🔥 Trending
              </div>
            )}
          </div>

          <button onClick={handleLike}
            className={`like-btn${isLiked ? " liked" : ""}`}
            style={{ width: "100%", justifyContent: "center", marginTop: 16, padding: "12px 0", fontSize: 14, borderRadius: 14 }}>
            <svg width="16" height="16" fill={isLiked ? "#7c3aed" : "none"} stroke={isLiked ? "#7c3aed" : "currentColor"} strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {isLiked ? "Liked" : "Like this pitch"} · {pitch.likes.toLocaleString()}
          </button>
        </div>

        <div style={{ animation: "fadeIn 0.5s ease-out both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <span className="genre-badge">{pitch.genre}</span>
            <span className="year-badge">{pitch.year}</span>
            <span className="stars">{stars}</span>
          </div>

          <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 20 }}>
            {pitch.title}
          </h1>

          <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 14, padding: "18px 22px", marginBottom: 28 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Logline</p>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: "#c9ced6", fontStyle: "italic" }}>
              "{pitch.logline || "No logline provided."}"
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 36 }}>
            <MetaCard icon="🎭" label="Genre" value={pitch.genre} />
            <MetaCard icon="📅" label="Year" value={String(pitch.year || "—")} />
            <MetaCard icon="❤️" label="Likes" value={pitch.likes.toLocaleString()} />
          </div>

          <div style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18, padding: 22 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>About this pitch</p>
            <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.75 }}>
              {pitch.logline
                ? `${pitch.title} is a ${pitch.genre.toLowerCase()} pitch set in ${pitch.year}. ${pitch.logline} This is an original concept submitted to the PitchFlix marketplace.`
                : "No additional description has been provided for this pitch."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "14px 16px" }}>
      <div style={{ fontSize: 18, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 10, color: "#4b5563", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
