import type { Pitch } from "@/types";

interface PitchCardProps {
  pitch: Pitch;
  isLiked: boolean;
  onLike: (id: string, currentLikes: number) => void;
  index: number;
}

function fmtCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

const FALLBACK =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=60&auto=format&fit=crop";

export default function PitchCard({ pitch, isLiked, onLike, index }: PitchCardProps) {
  const stars = "★".repeat(Math.round(pitch.rating || 4)) + "☆".repeat(5 - Math.round(pitch.rating || 4));

  return (
    <div className="movie-card" style={{ animationDelay: `${Math.min(index * 45, 400)}ms` }}>
      {pitch.trending && <div className="trending-badge">🔥 Trending</div>}
      <img
        src={pitch.image}
        alt={pitch.title}
        loading="lazy"
        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
      />
      <div className="card-shine" />
      <div className="card-overlay">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7, flexWrap: "wrap" }}>
              <span className="genre-badge">{pitch.genre}</span>
              <span className="year-badge">{pitch.year || "—"}</span>
            </div>
            <h3 style={{ fontSize: 13, fontWeight: 800, lineHeight: 1.3, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-0.01em" }}>
              {pitch.title}
            </h3>
            <div className="stars" style={{ fontSize: 9 }}>{stars}</div>
          </div>
          <button
            className={`like-btn${isLiked ? " liked" : ""}`}
            onClick={(e) => { e.stopPropagation(); onLike(pitch.id, pitch.likes); }}
            aria-label="Like">
            <svg
              width="11" height="11"
              fill={isLiked ? "#e50914" : "none"}
              stroke={isLiked ? "#e50914" : "currentColor"}
              strokeWidth="2"
              viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            <span>{fmtCount(pitch.likes)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
