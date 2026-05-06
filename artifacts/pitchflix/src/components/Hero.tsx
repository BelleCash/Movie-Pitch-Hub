interface HeroProps {
  view: string;
  onOpenCreate: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
}

const BG = {
  home: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1800&q=80&auto=format&fit=crop",
  trending: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=1800&q=80&auto=format&fit=crop",
};

export default function Hero({ view, onOpenCreate, onOpenAuth, isLoggedIn }: HeroProps) {
  const bg = view === "trending" ? BG.trending : BG.home;

  return (
    <section className="hero-section" id="hero">
      <div className="hero-bg" style={{ backgroundImage: `url('${bg}')` }} />
      <div className="hero-gradient" />
      <div className="hero-content" style={{ paddingTop: 66 }}>
        <div style={{ maxWidth: 540, animation: "fadeIn 0.8s ease-out both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(229,9,20,0.18)", color: "#f87171", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 5, border: "1px solid rgba(229,9,20,0.28)" }}>
              {view === "trending" ? "🔥 Trending Now" : "Featured Pitch"}
            </span>
            <span className="stars">★★★★★</span>
            <span style={{ color: "#6b7280", fontSize: 13 }}>2024</span>
          </div>
          <h1 style={{ fontSize: "clamp(2.1rem,5vw,3.8rem)", fontWeight: 900, lineHeight: 1.04, letterSpacing: "-0.04em", marginBottom: 18 }}>
            {view === "trending" ? <>What's <span style={{ color: "#e50914" }}>Hot</span></> : <>Beyond the <span style={{ color: "#e50914" }}>Horizon</span></>}
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "#c9ced6", marginBottom: 30, maxWidth: 430 }}>
            {view === "trending"
              ? "The pitches the world can't stop talking about. Fast-rising stories, bold visions, and the next big thing in cinema."
              : "A gripping sci-fi epic about the last generation of Earth's survivors who must terraform a dying planet — a story of sacrifice, humanity, and hope among the stars."}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 28 }}>
            <button className="btn-red" onClick={isLoggedIn ? onOpenCreate : onOpenAuth}>
              <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              {isLoggedIn ? "Submit a Pitch" : "Start Pitching"}
            </button>
            <button className="btn-ghost">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              More Info
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 22, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, color: "#9ca3af", fontSize: 13 }}>
              <svg width="14" height="14" fill="#e50914" stroke="#e50914" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              2,847 likes
            </div>
            <div style={{ color: "#6b7280", fontSize: 13 }}>Sci-Fi · Action · Drama</div>
          </div>
        </div>
      </div>
    </section>
  );
}
