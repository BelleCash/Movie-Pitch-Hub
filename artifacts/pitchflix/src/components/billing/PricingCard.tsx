import type { SubscriptionTier } from "@/types";

interface PricingCardProps {
  tier: SubscriptionTier;
  name: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
  current?: boolean;
  onSelect: (tier: SubscriptionTier) => void;
  loading?: boolean;
}

const TIER_ICON: Record<SubscriptionTier, string> = {
  free: "🟢", starter: "🟣", pro: "💼", studio: "🏢",
};
const TIER_COLOR: Record<SubscriptionTier, string> = {
  free: "#4ade80", starter: "#8b5cf6", pro: "#7c3aed", studio: "#6d28d9",
};

export default function PricingCard({ tier, name, price, description, features, recommended, current, onSelect, loading }: PricingCardProps) {
  const color = TIER_COLOR[tier];
  const isPurple = tier !== "free";

  return (
    <div
      style={{
        background: recommended ? "linear-gradient(160deg,#1a103a,#12121a)" : "#12121a",
        border: recommended ? `1.5px solid ${color}` : "1px solid rgba(255,255,255,0.07)",
        borderRadius: 22,
        padding: "32px 28px",
        position: "relative",
        transform: recommended ? "scale(1.04)" : "scale(1)",
        transition: "transform 0.3s, box-shadow 0.3s",
        boxShadow: recommended ? `0 0 40px rgba(124,58,237,0.18)` : "none",
      }}
      onMouseEnter={(e) => { const el = e.currentTarget; el.style.transform = "scale(1.045)"; el.style.boxShadow = `0 20px 60px rgba(124,58,237,0.22)`; }}
      onMouseLeave={(e) => { const el = e.currentTarget; el.style.transform = recommended ? "scale(1.04)" : "scale(1)"; el.style.boxShadow = recommended ? "0 0 40px rgba(124,58,237,0.18)" : "none"; }}
    >
      {recommended && (
        <div style={{ position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(90deg,#7c3aed,#8b5cf6)", color: "#fff", fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", padding: "5px 18px", borderRadius: 50 }}>
          Recommended
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <span style={{ fontSize: 22 }}>{TIER_ICON[tier]}</span>
        <span style={{ color, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>{name}</span>
      </div>

      <div style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 38, fontWeight: 900, letterSpacing: "-0.04em" }}>${price}</span>
        <span style={{ color: "#6b7280", fontSize: 14, marginLeft: 4 }}>/month</span>
      </div>
      <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6, marginBottom: 24 }}>{description}</p>

      <div style={{ marginBottom: 28 }}>
        {features.map((f) => (
          <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11, color: "#d1d5db", fontSize: 14 }}>
            <svg width="14" height="14" fill="none" stroke={isPurple ? color : "#4ade80"} strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
            {f}
          </div>
        ))}
      </div>

      {current ? (
        <div style={{ width: "100%", textAlign: "center", padding: "12px 0", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 12, fontSize: 13, fontWeight: 700, color: "#8b5cf6" }}>
          Current Plan
        </div>
      ) : (
        <button
          onClick={() => onSelect(tier)}
          disabled={loading}
          className={isPurple ? "btn-purple" : "btn-ghost"}
          style={{ width: "100%", justifyContent: "center" }}>
          {loading ? "Processing…" : tier === "free" ? "Get Started Free" : `Upgrade to ${name}`}
        </button>
      )}
    </div>
  );
}
