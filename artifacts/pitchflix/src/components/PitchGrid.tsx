import type { Pitch } from "@/types";
import PitchCard from "./PitchCard";

interface PitchGridProps {
  pitches: Pitch[];
  loading: boolean;
  liked: Set<string>;
  onLike: (id: string, currentLikes: number) => void;
}

export default function PitchGrid({ pitches, loading, liked, onLike }: PitchGridProps) {
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
    gap: 20,
  };

  if (loading) {
    return (
      <div style={gridStyle}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ aspectRatio: "2/3" }} />
        ))}
      </div>
    );
  }

  if (pitches.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "#4b5563" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "#6b7280", marginBottom: 8 }}>No pitches found</h3>
        <p style={{ fontSize: 14 }}>Try adjusting your filters or search terms</p>
      </div>
    );
  }

  return (
    <div style={gridStyle} id="movies-grid">
      {pitches.map((pitch, i) => (
        <PitchCard
          key={pitch.id}
          pitch={pitch}
          isLiked={liked.has(pitch.id)}
          onLike={onLike}
          index={i}
        />
      ))}
    </div>
  );
}
