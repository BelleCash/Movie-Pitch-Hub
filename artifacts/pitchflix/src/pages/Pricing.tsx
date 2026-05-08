import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import PricingCard from "@/components/billing/PricingCard";
import { useBilling } from "@/context/BillingContext";
import { useAuth } from "@/context/AuthContext";
import type { SubscriptionTier } from "@/types";

const PLANS: {
  tier: SubscriptionTier; name: string; price: number; description: string;
  features: string[]; recommended?: boolean;
}[] = [
  {
    tier: "free", name: "Free", price: 0,
    description: "Start exploring the marketplace.",
    features: ["Browse all pitches", "Like pitches", "Public profiles", "Tag search"],
  },
  {
    tier: "starter", name: "Starter", price: 9,
    description: "For creators ready to pitch.",
    features: ["Creator profile", "Upload pitches", "AI pitch scoring", "Basic analytics", "Genre filtering", "Payout account setup"],
  },
  {
    tier: "pro", name: "Pro Investor", price: 19,
    description: "Find and fund the next big film.",
    features: ["Investor dashboard", "Deal flow feed", "Watchlists", "Investor voting", "AI deal scoring", "Trending alerts", "Capital wallet", "Investor comments"],
    recommended: true,
  },
  {
    tier: "studio", name: "Studio", price: 49,
    description: "Full-platform power for studios and teams.",
    features: ["Everything in Pro", "Unlimited pitch uploads", "Advanced analytics", "Featured placement", "Team access", "Priority support", "Early deal access"],
  },
];

export default function Pricing() {
  const { tier: currentTier, subscribe } = useBilling();
  const { user } = useAuth();
  const [loading, setLoading] = useState<SubscriptionTier | null>(null);
  const [, navigate] = useLocation();

  const handleSelect = async (tier: SubscriptionTier) => {
    if (!user) { navigate("/"); return; }
    if (tier === currentTier) return;
    setLoading(tier);
    try {
      await subscribe(tier);
      toast.success(`Plan activated!`, { description: `You're now on the ${tier} plan 🚀` });
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div style={{ background: "#0b0b0f", minHeight: "100vh", paddingBottom: 100 }}>
      <nav className="glass-nav" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 33, height: 33, background: "#7c3aed", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🎬</div>
            <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff" }}>Pitch<span style={{ color: "#8b5cf6" }}>Flix</span></span>
          </a>
          <a href="/" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none", fontWeight: 500 }}>← Back</a>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "72px 28px 0" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 50, padding: "6px 18px", fontSize: 12, fontWeight: 700, color: "#8b5cf6", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 20 }}>
            💳 Pricing Plans
          </div>
          <h1 style={{ fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 16 }}>
            Invest in your <span style={{ background: "linear-gradient(90deg,#7c3aed,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>story</span>
          </h1>
          <p style={{ color: "#9ca3af", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
            From first-time creators to studio-level investors — pick the plan that matches your ambition.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20, alignItems: "start" }}>
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.tier}
              {...plan}
              current={currentTier === plan.tier}
              loading={loading === plan.tier}
              onSelect={handleSelect}
            />
          ))}
        </div>

        <div style={{ marginTop: 60, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4b5563", fontSize: 13 }}>
            <span>🔒</span> Secure checkout
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4b5563", fontSize: 13 }}>
            <span>↩️</span> Cancel anytime
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#4b5563", fontSize: 13 }}>
            <span>⚡</span> Instant activation
          </div>
        </div>
      </div>
    </div>
  );
}
