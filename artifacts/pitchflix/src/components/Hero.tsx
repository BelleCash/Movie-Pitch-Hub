interface HeroProps {
  view: string;
  onOpenCreate: () => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
  onExploreDeals?: () => void;
}

const BG = {
  home: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1800&q=80&auto=format&fit=crop",
  trending: "https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=1800&q=80&auto=format&fit=crop",
};

export default function Hero({ view, onOpenCreate, onOpenAuth, isLoggedIn, onExploreDeals }: HeroProps) {
  const bg = view === "trending" ? BG.trending : BG.home;

  return (
    <section className="hero-section" id="hero">
      <div className="hero-bg" style={{ backgroundImage: `url('${bg}')` }} />
      <div className="hero-gradient" />
      <div className="hero-content" style={{ paddingTop: 66 }}>
        <div style={{ maxWidth: 580, animation: "fadeIn 0.8s ease-out both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
            <span style={{ background: "rgba(124,58,237,0.18)", color: "#a78bfa", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "4px 12px", borderRadius: 5, border: "1px solid rgba(124,58,237,0.28)" }}>
              {view === "trending" ? "🔥 Trending Now" : "🎬 Creator Marketplace"}
            </span>
            <span className="stars">★★★★★</span>
          </div>

          <h1 style={{ fontSize: "clamp(2rem,5vw,3.6rem)", fontWeight: 900, lineHeight: 1.06, letterSpacing: "-0.04em", marginBottom: 18 }}>
            {view === "trending"
              ? <>What's <span style={{ background: "linear-gradient(90deg,#7c3aed,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Hot</span></>
              : <>Where movie ideas become{" "}<span style={{ background: "linear-gradient(90deg,#7c3aed,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>investable opportunities.</span></>
            }
          </h1>

          <p style={{ fontSize: 15, lineHeight: 1.8, color: "#c9ced6", marginBottom: 32, maxWidth: 460 }}>
            {view === "trending"
              ? "The pitches the world can't stop talking about. Fast-rising stories, bold visions, and the next big thing in cinema."
              : "PitchFlix connects creators and investors in a real-time marketplace for film concepts, traction, and deal discovery."}
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 36 }}>
            <button className="btn-purple" onClick={isLoggedIn ? onOpenCreate : onOpenAuth}>
              🎬 Start Pitching
            </button>
            <button className="btn-ghost" onClick={onExploreDeals}>
              💼 Explore Deals
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
            <Stat icon="🎬" value="2,400+" label="Pitches" />
            <Stat icon="💼" value="340+" label="Investors" />
            <Stat icon="⚡" value="Real-time" label="Updates" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>{value}</div>
        <div style={{ fontSize: 11, color: "#6b7280" }}>{label}</div>
      </div>
    </div>
  );
}
