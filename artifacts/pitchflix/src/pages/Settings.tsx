import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/BillingContext";
import { supabase } from "@/lib/supabase";
import type { PayoutProvider } from "@/types";

const PAYOUT_PROVIDERS: { id: PayoutProvider; label: string; icon: string; desc: string }[] = [
  { id: "stripe",        label: "Stripe",        icon: "💳", desc: "International cards & bank transfers" },
  { id: "paystack",      label: "Paystack",       icon: "🟢", desc: "Africa-first payment infrastructure" },
  { id: "lemon_squeezy", label: "Lemon Squeezy",  icon: "🍋", desc: "Merchant of record, zero setup" },
  { id: "opay",          label: "OPay",           icon: "🅾️", desc: "Mobile money & instant transfers" },
  { id: "moniepoint",    label: "Moniepoint",     icon: "🏦", desc: "Business banking & POS payouts" },
  { id: "bank_account",  label: "Bank Account",   icon: "🏛️", desc: "Direct bank wire transfer" },
  { id: "metamask",      label: "MetaMask",       icon: "🦊", desc: "Web3 wallet (coming soon)" },
];

function avatarUrl(seed: string) {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=7c3aed&backgroundType=solid`;
}

export default function Settings() {
  const { user, userProfile, signOut, refreshProfile } = useAuth();
  const { tier, isSubscribed } = useBilling();
  const [, navigate] = useLocation();

  const [username, setUsername] = useState(userProfile?.username ?? "");
  const [bio, setBio]           = useState(userProfile?.bio ?? "");
  const [saving, setSaving]     = useState(false);

  const [selectedProvider, setSelectedProvider] = useState<PayoutProvider | null>(userProfile?.payoutProvider ?? null);
  const [payoutAccount, setPayoutAccount]       = useState(userProfile?.payoutAccount ?? "");
  const [walletConnected, setWalletConnected]   = useState(userProfile?.walletConnected ?? false);
  const [walletSaving, setWalletSaving]         = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting]           = useState(false);

  useEffect(() => {
    if (userProfile) {
      setUsername(userProfile.username ?? "");
      setBio(userProfile.bio ?? "");
      setSelectedProvider(userProfile.payoutProvider ?? null);
      setPayoutAccount(userProfile.payoutAccount ?? "");
      setWalletConnected(userProfile.walletConnected ?? false);
    }
  }, [userProfile?.id]);

  if (!user) { navigate("/"); return null; }

  const role      = userProfile?.role ?? "viewer";
  const isCreator  = role === "creator";
  const isInvestor = role === "investor";
  const displayName = userProfile?.username || user.email?.split("@")[0] || "User";
  const avatar    = userProfile?.avatarUrl ?? avatarUrl(displayName);

  const handleSaveProfile = async () => {
    if (!username.trim()) { toast.error("Username is required"); return; }
    setSaving(true);
    try {
      if (supabase) {
        const newAvatar = avatarUrl(username.trim());
        await supabase.from("profiles").upsert({
          id:         user.id,
          username:   username.trim(),
          bio:        bio.trim(),
          avatar_url: newAvatar,
        }, { onConflict: "id" });
        await supabase.auth.updateUser({ data: { username: username.trim(), bio: bio.trim() } });
      }
      await refreshProfile();
      toast.success("Profile saved!");
    } catch {
      toast.error("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWallet = async () => {
    if (!selectedProvider) { toast.error("Select a provider first"); return; }
    if (!payoutAccount.trim()) { toast.error("Enter your account details"); return; }
    setWalletSaving(true);
    try {
      if (supabase) {
        await supabase.from("profiles").upsert({
          id:               user.id,
          payout_provider:  selectedProvider,
          payout_account:   payoutAccount.trim(),
          wallet_connected: true,
        }, { onConflict: "id" });
      }
      setWalletConnected(true);
      await refreshProfile();
      toast.success("Payout method connected!");
    } catch {
      toast.error("Failed to save. Try again.");
    } finally {
      setWalletSaving(false);
    }
  };

  const handleConnectInvestorWallet = async () => {
    setWalletSaving(true);
    try {
      if (supabase) {
        await supabase.from("profiles").upsert({
          id:               user.id,
          wallet_connected: true,
        }, { onConflict: "id" });
      }
      setWalletConnected(true);
      await refreshProfile();
      toast.success("Capital wallet activated!");
    } catch {
      toast.error("Failed to connect. Try again.");
    } finally {
      setWalletSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try { await signOut(); navigate("/"); }
    catch { toast.error("Failed to sign out."); setDeleting(false); }
  };

  return (
    <div style={{ background: "#0b0b0f", minHeight: "100vh", paddingBottom: 80 }}>
      <nav className="glass-nav" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 33, height: 33, background: "#7c3aed", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🎬</div>
            <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff" }}>Pitch<span style={{ color: "#8b5cf6" }}>Flix</span></span>
          </a>
          <a href={isInvestor ? "/investor" : "/dashboard"} style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none", fontWeight: 500 }}>← Dashboard</a>
        </div>
      </nav>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "52px 24px 0" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 4 }}>Account Settings</h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 44 }}>Manage your profile, payout methods, and preferences</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          <Card title="Profile" icon="👤">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <img src={avatar} alt={displayName} style={{ width: 64, height: 64, borderRadius: "50%", background: "#7c3aed", border: "2px solid rgba(124,58,237,0.4)", objectFit: "cover", flexShrink: 0 }}
                onError={(e) => { (e.target as HTMLImageElement).src = avatarUrl(displayName); }} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 17 }}>{displayName}</div>
                <div style={{ color: "#6b7280", fontSize: 13, marginTop: 2 }}>{user.email}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <RoleBadge role={role} />
                  {isSubscribed && <TierBadge tier={tier} />}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Username</label>
                <input className="form-input" type="text" placeholder="your_username"
                  value={username} onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())} maxLength={32} />
                <p style={{ fontSize: 11, color: "#4b5563", marginTop: 5 }}>Your avatar is auto-generated from your username</p>
              </div>
              <div>
                <label className="form-label">Bio <span style={{ color: "#4b5563", textTransform: "none", fontWeight: 400 }}>({160 - bio.length} chars left)</span></label>
                <textarea className="form-input" placeholder="Tell the marketplace about yourself…" rows={3}
                  value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} style={{ resize: "none" }} />
              </div>
              <button className="btn-purple" onClick={handleSaveProfile} disabled={saving} style={{ alignSelf: "flex-start" }}>
                {saving ? "Saving…" : "Save Profile"}
              </button>
            </div>
          </Card>

          {(isCreator || isInvestor) && (
            <Card title={isInvestor ? "Capital Wallet" : "Payout Account"} icon={isInvestor ? "💰" : "💳"}>
              {isInvestor ? (
                <div>
                  <p style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                    Connect a funding wallet to track capital allocation and investment activity across your deal portfolio.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                    <InfoCard label="Available Capital" value={walletConnected ? `$${(userProfile?.investorWalletBalance ?? 0).toLocaleString()}` : "—"} icon="💰" />
                    <InfoCard label="Wallet Status" value={walletConnected ? "Connected" : "Not Connected"} icon={walletConnected ? "✅" : "⚠️"} />
                  </div>
                  {!walletConnected ? (
                    <button className="btn-purple" onClick={handleConnectInvestorWallet} disabled={walletSaving}>
                      {walletSaving ? "Connecting…" : "💰 Connect Capital Wallet"}
                    </button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 12, padding: "12px 16px" }}>
                      <span style={{ fontSize: 20 }}>✅</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80" }}>Wallet connected</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>Capital tracking is active on your account</div>
                      </div>
                    </div>
                  )}
                  <p style={{ fontSize: 11, color: "#4b5563", marginTop: 14 }}>Actual fund transfers are handled through your chosen payment provider when activated.</p>
                </div>
              ) : (
                <div>
                  <p style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.7, marginBottom: 20 }}>
                    Connect a payout method to receive creator earnings from funded pitches.
                  </p>

                  {walletConnected && (
                    <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: 12, padding: "12px 16px", marginBottom: 20 }}>
                      <span style={{ fontSize: 20 }}>✅</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80" }}>Payout method connected</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{PAYOUT_PROVIDERS.find((p) => p.id === selectedProvider)?.label ?? "Active"} · {payoutAccount || "Account on file"}</div>
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: 16 }}>
                    <label className="form-label">Select Provider</label>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 8 }}>
                      {PAYOUT_PROVIDERS.map((p) => (
                        <button key={p.id} type="button" onClick={() => p.id !== "metamask" && setSelectedProvider(p.id)}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: selectedProvider === p.id ? "rgba(124,58,237,0.14)" : "rgba(255,255,255,0.03)", border: `1px solid ${selectedProvider === p.id ? "rgba(124,58,237,0.45)" : "rgba(255,255,255,0.07)"}`, cursor: p.id === "metamask" ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: p.id === "metamask" ? 0.45 : 1, transition: "all 0.18s", textAlign: "left" }}>
                          <span style={{ fontSize: 20, flexShrink: 0 }}>{p.icon}</span>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: selectedProvider === p.id ? "#a78bfa" : "#e2e8f0" }}>{p.label}</div>
                            <div style={{ fontSize: 10, color: "#4b5563", marginTop: 1 }}>{p.desc}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {selectedProvider && selectedProvider !== "metamask" && (
                    <div style={{ marginBottom: 16 }}>
                      <label className="form-label">Account / Email / Phone</label>
                      <input className="form-input" type="text" placeholder={`Your ${PAYOUT_PROVIDERS.find((p) => p.id === selectedProvider)?.label} account…`}
                        value={payoutAccount} onChange={(e) => setPayoutAccount(e.target.value)} />
                    </div>
                  )}

                  <button className="btn-purple" onClick={handleSaveWallet} disabled={walletSaving || !selectedProvider || selectedProvider === "metamask"}>
                    {walletSaving ? "Connecting…" : walletConnected ? "Update Payout Method" : "Connect Payout Method"}
                  </button>
                </div>
              )}
            </Card>
          )}

          <Card title="Account" icon="⚙️">
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <InfoRow label="Email"  value={user.email ?? "—"} />
              <InfoRow label="Role"   value={role.charAt(0).toUpperCase() + role.slice(1)} />
              <InfoRow label="Plan"   value={isSubscribed ? `${tier.charAt(0).toUpperCase() + tier.slice(1)} (active)` : "Free"} />
              <InfoRow label="Member since" value={user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"} />
            </div>
            <div style={{ marginTop: 20 }}>
              <a href="/pricing" className="btn-ghost" style={{ textDecoration: "none", fontSize: 13, padding: "10px 20px" }}>
                {isSubscribed ? "Manage Plan" : "⬆️ Upgrade Plan"}
              </a>
            </div>
          </Card>

          <Card title="Danger Zone" icon="⚠️" danger>
            <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.6, marginBottom: 18 }}>These actions cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn-ghost" onClick={() => { signOut(); navigate("/"); }} style={{ fontSize: 13, padding: "10px 18px" }}>Sign Out</button>
              <button onClick={handleDeleteAccount} disabled={deleting}
                style={{ background: confirmDelete ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${confirmDelete ? "rgba(248,113,113,0.35)" : "rgba(255,255,255,0.1)"}`, color: confirmDelete ? "#f87171" : "#9ca3af", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}>
                {deleting ? "Signing out…" : confirmDelete ? "⚠️ Confirm?" : "Delete Account"}
              </button>
              {confirmDelete && <button onClick={() => setConfirmDelete(false)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>Cancel</button>}
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}

function Card({ title, icon, children, danger }: { title: string; icon: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div style={{ background: "#12121a", border: `1px solid ${danger ? "rgba(248,113,113,0.12)" : "rgba(255,255,255,0.05)"}`, borderRadius: 20, padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: danger ? "#f87171" : "#e2e8f0" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function InfoCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ fontSize: 16 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { color: string; bg: string }> = {
    viewer:   { color: "#9ca3af", bg: "rgba(156,163,175,0.1)" },
    creator:  { color: "#a78bfa", bg: "rgba(124,58,237,0.12)" },
    investor: { color: "#fbbf24", bg: "rgba(251,191,36,0.1)" },
  };
  const s = map[role] ?? map.viewer;
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: s.bg, padding: "2px 9px", borderRadius: 4, textTransform: "capitalize" }}>
      {role}
    </span>
  );
}

function TierBadge({ tier }: { tier: string }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", background: "rgba(124,58,237,0.15)", padding: "2px 9px", borderRadius: 4, textTransform: "uppercase" }}>
      {tier}
    </span>
  );
}
