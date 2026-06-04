const GENRES = ["All", "Action", "Drama", "Comedy", "Nollywood", "Sci-Fi", "Thriller", "Romance", "Horror"];

interface FilterBarProps {
  selectedGenres: Set<string>;
  search: string;
  totalCount: number;
  sectionTitle: string;
  onToggleGenre: (genre: string) => void;
  onSearchChange: (q: string) => void;
  onClear: () => void;
}

export default function FilterBar({
  selectedGenres, search, totalCount, sectionTitle,
  onToggleGenre, onSearchChange, onClear,
}: FilterBarProps) {
  const hasFilters = selectedGenres.size > 0 || search.trim().length > 0;
  const allActive = selectedGenres.size === 0;

  return (
    <div style={{ padding: "44px 0 20px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.025em" }}>{sectionTitle}</h2>
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 5 }}>{totalCount} pitches available</p>
        </div>
        <div className="search-wrap mobile-only">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input className="search-input" type="search" placeholder="Search…"
            value={search} onChange={(e) => onSearchChange(e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div className="filter-scroll" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, flex: 1 }}>
          {GENRES.map((g) => {
            const isActive = g === "All" ? allActive : selectedGenres.has(g);
            return (
              <button
                key={g}
                className={`filter-btn${isActive ? " active" : ""}`}
                onClick={() => onToggleGenre(g)}>
                {g}
              </button>
            );
          })}
        </div>
        {hasFilters && (
          <button
            onClick={onClear}
            style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 50, padding: "7px 16px", fontSize: 12, fontWeight: 600, color: "#a78bfa", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", fontFamily: "inherit" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.22)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(124,58,237,0.12)")}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
