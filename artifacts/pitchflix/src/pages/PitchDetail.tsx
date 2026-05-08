import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { toast } from "sonner";
import { usePitches } from "@/hooks/usePitches";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { scorePitch } from "@/services/pitchScoring";
import type { Comment, Pitch } from "@/types";

const FALLBACK = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80&auto=format&fit=crop";

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=7c3aed&backgroundType=solid`;
}

function getVideoEmbed(url: string): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
}

function trendBadge(pitch: Pitch): { emoji: string; label: string; color: string; bg: string } | null {
  if (pitch.trending && (pitch.likes ?? 0) > 1500) return { emoji: "🔥", label: "Trending",    color: "#fff",    bg: "linear-gradient(135deg,#7c3aed,#8b5cf6)" };
  if (pitch.trending)                               return { emoji: "🚀", label: "Rising Fast", color: "#4ade80", bg: "rgba(74,222,128,0.12)" };
  if ((pitch.likes ?? 0) > 800)                    return { emoji: "💎", label: "Hidden Gem",  color: "#fbbf24", bg: "rgba(251,191,36,0.12)" };
  return null;
}

const SCORE_COLORS: Record<string, string> = {
  clarity: "#8b5cf6", originality: "#a855f7", marketPotential: "#7c3aed", engagement: "#6d28d9", risk: "#4ade80",
};

export default function PitchDetail() {
  const [, params]  = useRoute("/pitch/:id");
  const [, navigate] = useLocation();
  const { pitches, updateLikes, recordView } = usePitches();
  const { user, userProfile }               = useAuth();

  const id    = params?.id ?? "";
  const pitch = useMemo(() => pitches.find((p) => p.id === id) ?? null, [pitches, id]);

  const likedKey = `pf-liked-${user?.id ?? "guest"}`;
  const [liked, setLiked] = useState(() => {
    try { return new Set<string>(JSON.parse(localStorage.getItem(likedKey) ?? "[]")); }
    catch { return new Set<string>(); }
  });
  const [localLikes, setLocalLikes] = useState<number | null>(null);
  const [voted, setVoted]           = useState<"up" | "down" | null>(null);
  const [votes, setVotes]           = useState({ up: 12, down: 2 });
  const [watchlisted, setWatchlisted] = useState(() => {
    try { return new Set<string>(JSON.parse(localStorage.getItem(`pf-watch-${user?.id}`) ?? "[]")); }
    catch { return new Set<string>(); }
  });

  const [comments, setComments]     = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const viewedRef = useRef(false);

  useEffect(() => { if (pitch) setLocalLikes(pitch.likes); }, [pitch?.id]);

  useEffect(() => {
    if (!id || viewedRef.current) return;
    viewedRef.current = true;
    recordView(id, user?.id);
  }, [id, user?.id, recordView]);

  useEffect(() => {
    if (!id) return;
    setCommentsLoading(true);
    (async () => {
      if (supabase) {
        try {
          const { data } = await supabase
            .from("comments")
            .select("*, profiles(username, avatar_url)")
            .eq("pitch_id", id)
            .order("created_at", { ascending: true });

          if (data && data.length > 0) {
            setComments(data.map((c) => ({
              id:            String(c.id),
              pitch_id:      c.pitch_id,
              user_id:       c.user_id,
              content:       c.content,
              created_at:    c.created_at,
              author_name:   (c.profiles as { username?: string })?.username ?? "Investor",
              author_avatar: (c.profiles as { avatar_url?: string })?.avatar_url ?? avatarUrl(c.user_id),
            })));
            setCommentsLoading(false);
            return;
          }
        } catch {}
      }
      const local: Comment[] = JSON.parse(localStorage.getItem(`pf-comments-${id}`) ?? "[]");
      setComments(local);
      setCommentsLoading(false);
    })();
  }, [id]);

  const displayLikes  = localLikes ?? pitch?.likes ?? 0;
  const isLiked       = liked.has(id);
  const isInWatchlist = watchlisted.has(id);
  const isInvestor    = userProfile?.role === "investor";
  const score         = pitch ? scorePitch(pitch) : null;

  const handleLike = useCallback(() => {
    if (!pitch) return;
    if (!user) { toast("Sign in to like pitches"); return; }
    const wasLiked = liked.has(pitch.id);
    const next = new Set(liked);
    wasLiked ? next.delete(pitch.id) : next.add(pitch.id);
    setLiked(next);
    try { localStorage.setItem(likedKey, JSON.stringify([...next])); } catch {}
    const newLikes = Math.max(0, displayLikes + (wasLiked ? -1 : 1));
    setLocalLikes(newLikes);
    updateLikes(pitch.id, newLikes);
    if (!wasLiked) toast.success("Liked!", { duration: 1400 });
  }, [pitch, liked, user, likedKey, displayLikes, updateLikes]);

  const handleVote = (dir: "up" | "down") => {
    if (!user) { toast("Sign in to vote"); return; }
    if (!isInvestor) { toast("Only investors can vote on deals"); return; }
    if (voted === dir) return;
    setVotes((v) => ({
      up:   v.up   + (dir === "up"   ? 1 : 0) - (voted === "up"   ? 1 : 0),
      down: v.down + (dir === "down" ? 1 : 0) - (voted === "down" ? 1 : 0),
    }));
    setVoted(dir);
    toast.success(dir === "up" ? "👍 Interest registered!" : "👎 Vote recorded");
  };

  const handleWatchlist = () => {
    if (!user) { toast("Sign in to save pitches"); return; }
    const next = new Set(watchlisted);
    isInWatchlist ? next.delete(id) : next.add(id);
    setWatchlisted(next);
    try { localStorage.setItem(`pf-watch-${user.id}`, JSON.stringify([...next])); } catch {}
    toast(isInWatchlist ? "Removed from watchlist" : "💾 Added to watchlist!");
  };

  const handleComment = async () => {
    if (!commentText.trim() || !user || !isInvestor) return;
    setCommentLoading(true);
    try {
      const authorName   = userProfile?.username || user.email?.split("@")[0] || "Investor";
      const authorAvatar = userProfile?.avatarUrl ?? avatarUrl(authorName);
      const newComment: Comment = {
        id:           String(Date.now()),
        pitch_id:     id,
        user_id:      user.id,
        content:      commentText.trim(),
        created_at:   new Date().toISOString(),
        author_name:  authorName,
        author_avatar: authorAvatar,
      };

      if (supabase) {
        const { data, error } = await supabase
          .from("comments")
          .insert({ pitch_id: id, user_id: user.id, content: commentText.trim() })
          .select("id, created_at")
          .single();
        if (!error && data) newComment.id = String(data.id);
      } else {
        const local = [...comments, newComment];
        localStorage.setItem(`pf-comments-${id}`, JSON.stringify(local));
      }

      setComments((prev) => [...prev, newComment]);
      setCommentText("");
      toast.success("Comment posted!");
    } finally {
      setCommentLoading(false);
    }
  };

  if (!pitch) {
    return (
      <div style={{ minHeight: "100vh", background: "#0b0b0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        {pitches.length === 0
          ? <div style={{ width: 40, height: 40, border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
          : <><div style={{ fontSize: 48 }}>🎬</div><h2 style={{ fontSize: 20, fontWeight: 700 }}>Pitch not found</h2><button className="btn-ghost" onClick={() => navigate("/")}>← Back to Feed</button></>
        }
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const badge      = trendBadge(pitch);
  const embedUrl   = pitch.video_url ? getVideoEmbed(pitch.video_url) : null;
  const stars      = "★".repeat(Math.round(pitch.rating || 4)) + "☆".repeat(5 - Math.round(pitch.rating || 4));
  const totalVotes = votes.up + votes.down;
  const votePct    = totalVotes > 0 ? Math.round((votes.up / totalVotes) * 100) : 0;

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

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 28px 100px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 52, alignItems: "start" }}>

          <div style={{ position: "sticky", top: 86 }}>
            <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.12)" }}>
              <img src={pitch.image} alt={pitch.title}
                style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }}
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }} />
              {badge && (
                <div style={{ position: "absolute", top: 14, left: 14, background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 6 }}>
                  {badge.emoji} {badge.label}
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
              <button onClick={handleLike} className={`like-btn${isLiked ? " liked" : ""}`}
                style={{ width: "100%", justifyContent: "center", padding: "12px 0", fontSize: 14, borderRadius: 14 }}>
                <svg width="15" height="15" fill={isLiked ? "#7c3aed" : "none"} stroke={isLiked ? "#7c3aed" : "currentColor"} strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                {isLiked ? "Liked" : "Like"} · {displayLikes.toLocaleString()}
              </button>
              <button onClick={handleWatchlist}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", fontSize: 14, borderRadius: 14, background: isInWatchlist ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${isInWatchlist ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.1)"}`, color: isInWatchlist ? "#a78bfa" : "#9ca3af", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, transition: "all 0.2s" }}>
                👁 {isInWatchlist ? "Watchlisted" : "Save to Watchlist"}
              </button>
            </div>

            {isInvestor && (
              <div style={{ marginTop: 12, background: "#12121a", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>💼 Deal Vote</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <button onClick={() => handleVote("up")}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: voted === "up" ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${voted === "up" ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.08)"}`, color: voted === "up" ? "#4ade80" : "#9ca3af", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14, transition: "all 0.2s" }}>
                    👍 {votes.up}
                  </button>
                  <button onClick={() => handleVote("down")}
                    style={{ flex: 1, padding: "10px 0", borderRadius: 10, background: voted === "down" ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${voted === "down" ? "rgba(248,113,113,0.3)" : "rgba(255,255,255,0.08)"}`, color: voted === "down" ? "#f87171" : "#9ca3af", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 14, transition: "all 0.2s" }}>
                    👎 {votes.down}
                  </button>
                </div>
                {totalVotes > 0 && (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#4b5563", marginBottom: 5 }}>
                      <span>Interest: {votePct}%</span><span>{totalVotes} votes</span>
                    </div>
                    <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${votePct}%`, background: "linear-gradient(90deg,#7c3aed,#4ade80)", borderRadius: 2, transition: "width 0.5s" }} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {score && (
              <div style={{ marginTop: 12, background: "#12121a", border: "1px solid rgba(124,58,237,0.15)", borderRadius: 16, padding: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>🤖 AI Score</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: score.overall >= 75 ? "#4ade80" : score.overall >= 55 ? "#fbbf24" : "#f87171" }}>{score.overall}</div>
                </div>
                <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ height: "100%", width: `${score.overall}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)", borderRadius: 3, transition: "width 1s ease-out" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {(["clarity","originality","marketPotential","engagement","risk"] as const).map((k) => (
                    <div key={k}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6b7280", marginBottom: 3, textTransform: "capitalize" }}>
                        <span>{k === "marketPotential" ? "Market" : k}</span><span>{score[k]}</span>
                      </div>
                      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                        <div style={{ height: "100%", width: `${score[k]}%`, background: SCORE_COLORS[k], borderRadius: 2, transition: "width 0.8s ease-out" }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: score.riskLevel === "Low" ? "rgba(74,222,128,0.12)" : score.riskLevel === "Medium" ? "rgba(251,191,36,0.12)" : "rgba(248,113,113,0.1)", color: score.riskLevel === "Low" ? "#4ade80" : score.riskLevel === "Medium" ? "#fbbf24" : "#f87171" }}>
                    Risk: {score.riskLevel}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: "rgba(124,58,237,0.12)", color: "#a78bfa" }}>
                    Funding: {score.fundingProbability}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
              <span className="genre-badge">{pitch.genre}</span>
              <span className="year-badge">{pitch.year}</span>
              <span className="stars">{stars}</span>
            </div>

            <h1 style={{ fontSize: "clamp(2rem,5vw,3rem)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 22 }}>{pitch.title}</h1>

            <div style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 14, padding: "18px 22px", marginBottom: 22 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Logline</p>
              <p style={{ fontSize: 16, lineHeight: 1.7, color: "#c9ced6", fontStyle: "italic" }}>"{pitch.logline || "No logline provided."}"</p>
            </div>

            {pitch.synopsis && (
              <div style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "18px 22px", marginBottom: 22 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Synopsis</p>
                <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.8 }}>{pitch.synopsis}</p>
              </div>
            )}

            {pitch.tags && pitch.tags.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
                  {pitch.tags.map((tag) => (
                    <span key={tag} style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", borderRadius: 50, padding: "4px 12px", fontSize: 12, color: "#a78bfa", fontWeight: 500 }}>#{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 24 }}>
              <MetaCard icon="🎭" label="Genre"  value={pitch.genre} />
              <MetaCard icon="📅" label="Year"   value={String(pitch.year || "—")} />
              <MetaCard icon="❤️" label="Likes"  value={displayLikes.toLocaleString()} />
              <MetaCard icon="👁" label="Views"  value={(pitch.views ?? 0).toLocaleString()} />
            </div>

            {embedUrl && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>🎥 Teaser</p>
                <div style={{ borderRadius: 16, overflow: "hidden", aspectRatio: "16/9", background: "#12121a", border: "1px solid rgba(124,58,237,0.15)" }}>
                  <iframe src={embedUrl} title="Pitch teaser" style={{ width: "100%", height: "100%", border: "none" }} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              </div>
            )}

            <div style={{ background: "#12121a", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 18, padding: 22 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>💬 Investor Discussion</p>

              {commentsLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {[1,2].map((i) => <div key={i} className="skeleton" style={{ height: 60, borderRadius: 12 }} />)}
                </div>
              ) : comments.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0", color: "#4b5563" }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>💬</div>
                  <p style={{ fontSize: 13 }}>{isInvestor ? "Be the first to share your investment perspective." : "Investor commentary will appear here."}</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 20 }}>
                  {comments.map((c) => (
                    <div key={c.id} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.04)" }}>
                      <img src={c.author_avatar ?? avatarUrl(c.author_name ?? c.user_id)} alt="" style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, objectFit: "cover" }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 700 }}>{c.author_name ?? "Investor"}</span>
                          <span style={{ fontSize: 10, background: "rgba(251,191,36,0.1)", color: "#fbbf24", padding: "1px 7px", borderRadius: 4, fontWeight: 700 }}>💼 INVESTOR</span>
                          <span style={{ fontSize: 11, color: "#4b5563", marginLeft: "auto" }}>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <p style={{ fontSize: 13, color: "#c9ced6", lineHeight: 1.6 }}>{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isInvestor ? (
                <div style={{ display: "flex", gap: 10 }}>
                  <img src={userProfile?.avatarUrl ?? avatarUrl(userProfile?.username || "investor")} alt="" style={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", gap: 8 }}>
                    <input className="form-input" type="text" placeholder="Share your investment perspective…"
                      value={commentText} onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleComment(); } }}
                      style={{ flex: 1 }} />
                    <button className="btn-purple" onClick={handleComment} disabled={commentLoading || !commentText.trim()}
                      style={{ padding: "0 18px", borderRadius: 10, flexShrink: 0, fontSize: 13 }}>
                      Post
                    </button>
                  </div>
                </div>
              ) : user ? (
                <div style={{ background: "rgba(124,58,237,0.07)", border: "1px solid rgba(124,58,237,0.18)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <p style={{ fontSize: 13, color: "#9ca3af" }}>Investor accounts can comment on pitches.</p>
                  <a href="/pricing" className="btn-purple" style={{ textDecoration: "none", padding: "8px 16px", fontSize: 12, borderRadius: 8, flexShrink: 0 }}>Upgrade →</a>
                </div>
              ) : (
                <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 10 }}>Sign in as an investor to join the discussion.</p>
                  <a href="/" className="btn-purple" style={{ textDecoration: "none", padding: "8px 20px", fontSize: 13, borderRadius: 9 }}>Sign In</a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
