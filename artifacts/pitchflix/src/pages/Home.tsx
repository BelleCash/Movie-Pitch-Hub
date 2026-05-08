import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { usePitches } from "@/hooks/usePitches";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import FilterBar from "@/components/FilterBar";
import PitchGrid from "@/components/PitchGrid";
import AuthModal from "@/components/AuthModal";
import CreatePitchModal from "@/components/CreatePitchModal";

export default function Home() {
  const { pitches, loading, updateLikes } = usePitches();
  const { user } = useAuth();

  const [view, setView] = useState<"home" | "trending">("home");
  const [selectedGenres, setSelectedGenres] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    const key = `pf-liked-${user?.id ?? "guest"}`;
    try { setLiked(new Set(JSON.parse(localStorage.getItem(key) ?? "[]"))); }
    catch { setLiked(new Set()); }
  }, [user?.id]);

  const toggleGenre = (genre: string) => {
    if (genre === "All") { setSelectedGenres(new Set()); return; }
    setSelectedGenres((prev) => {
      const next = new Set(prev);
      next.has(genre) ? next.delete(genre) : next.add(genre);
      return next;
    });
  };

  const filtered = useMemo(() => {
    let list = view === "trending" ? pitches.filter((p) => p.trending) : [...pitches];
    if (selectedGenres.size > 0) list = list.filter((p) => selectedGenres.has(p.genre));
    const q = search.toLowerCase().trim();
    if (q) list = list.filter((p) =>
      p.title.toLowerCase().includes(q) ||
      p.genre.toLowerCase().includes(q) ||
      p.logline.toLowerCase().includes(q) ||
      (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
    return list;
  }, [pitches, view, selectedGenres, search]);

  const handleLike = useCallback((id: string, currentLikes: number) => {
    if (!user) { setAuthOpen(true); return; }
    const isLiked = liked.has(id);
    const next = new Set(liked);
    isLiked ? next.delete(id) : next.add(id);
    setLiked(next);
    const key = `pf-liked-${user.id}`;
    try { localStorage.setItem(key, JSON.stringify([...next])); } catch {}
    updateLikes(id, Math.max(0, currentLikes + (isLiked ? -1 : 1)));
    if (!isLiked) toast.success("Liked!", { duration: 1500 });
  }, [user, liked, updateLikes]);

  const handleOpenCreate = () => {
    if (!user) { setAuthOpen(true); return; }
    setCreateOpen(true);
  };

  const setViewAndScroll = (v: string) => {
    setView(v as "home" | "trending");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div style={{ background: "#0b0b0f", minHeight: "100vh" }}>
      <Navbar
        view={view}
        onSetView={setViewAndScroll}
        search={search}
        onSearchChange={setSearch}
        onOpenCreate={handleOpenCreate}
        onOpenAuth={() => setAuthOpen(true)}
      />

      <Hero
        view={view}
        onOpenCreate={handleOpenCreate}
        onOpenAuth={() => setAuthOpen(true)}
        isLoggedIn={!!user}
      />

      <main style={{ maxWidth: 1380, margin: "0 auto", padding: "0 28px 130px" }}>
        <FilterBar
          selectedGenres={selectedGenres}
          search={search}
          totalCount={filtered.length}
          sectionTitle={view === "trending" ? "Trending Pitches" : "All Pitches"}
          onToggleGenre={toggleGenre}
          onSearchChange={setSearch}
          onClear={() => { setSelectedGenres(new Set()); setSearch(""); }}
        />
        <PitchGrid pitches={filtered} loading={loading} liked={liked} onLike={handleLike} />
      </main>

      <nav className="bottom-nav mobile-only" id="bottom-nav"
        style={{ position: "fixed", bottom: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "10px 0 18px", zIndex: 50 }}>
        <button className={`bn-btn${view === "home" ? " active" : ""}`} onClick={() => setViewAndScroll("home")}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Home
        </button>
        <button className={`bn-btn${view === "trending" ? " active" : ""}`} onClick={() => setViewAndScroll("trending")}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          Trending
        </button>
        <button onClick={handleOpenCreate}
          style={{ background: "linear-gradient(135deg,#7c3aed,#8b5cf6)", border: "none", width: 52, height: 52, borderRadius: "50%", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 20px rgba(124,58,237,0.45)", marginBottom: 4, flexShrink: 0, transition: "transform 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
        <button className="bn-btn" onClick={() => !user && setAuthOpen(true)}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          Search
        </button>
        <button className="bn-btn" onClick={() => !user && setAuthOpen(true)}>
          <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          {user ? user.email?.[0]?.toUpperCase() : "Sign In"}
        </button>
      </nav>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onSuccess={() => {}} />
      <CreatePitchModal isOpen={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
