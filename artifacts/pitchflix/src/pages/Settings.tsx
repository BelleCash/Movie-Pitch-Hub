import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useBilling } from "@/context/BillingContext";
import { supabase } from "@/lib/supabase";

export default function Settings() {
  const { user, userProfile, signOut, updateRole } = useAuth();
  const { tier, isSubscribed } = useBilling();
  const [, navigate] = useLocation();

  const [username, setUsername] = useState(userProfile?.username ?? "");
  const [bio, setBio] = useState(userProfile?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!user) { navigate("/"); return null; }

  const handleSaveProfile = async () => {
    if (!username.trim()) { toast.error("Username is required"); return; }
    setSaving(true);
    try {
      if (supabase) {
        await supabase.auth.updateUser({
          data: { username: username.trim(), bio: bio.trim() },
        });
      }
      toast.success("Profile updated!");
    } catch {
      toast.error("Failed to save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setDeleting(true);
    try {
      await signOut();
      toast.success("Account deleted. Goodbye!");
      navigate("/");
    } catch {
      toast.error("Failed to delete account.");
      setDeleting(false);
    }
  };

  const initial = user.email?.[0]?.toUpperCase() ?? "?";
  const roleIcon = { viewer: "👁", creator: "🎬", investor: "💼" }[userProfile?.role ?? "viewer"];

  return (
    <div style={{ background: "#0b0b0f", minHeight: "100vh", paddingBottom: 80 }}>
      <nav className="glass-nav" style={{ position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>
          <a href="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <div style={{ width: 33, height: 33, background: "#7c3aed", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🎬</div>
            <span style={{ fontSize: 21, fontWeight: 900, letterSpacing: "-0.04em", color: "#fff" }}>Pitch<span style={{ color: "#8b5cf6" }}>Flix</span></span>
          </a>
          <a href="/dashboard" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none", fontWeight: 500 }}>← Dashboard</a>
        </div>
      </nav>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 24px 0" }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 6 }}>Settings</h1>
        <p style={{ color: "#6b7280", fontSize: 14, marginBottom: 44 }}>Manage your account and preferences</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

          <Section title="Profile" icon="👤">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, flexShrink: 0 }}>
                {initial}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{userProfile?.username || user.email?.split("@")[0]}</div>
                <div style={{ color: "#6b7280", fontSize: 13 }}>{user.email}</div>
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", background: "rgba(124,58,237,0.12)", padding: "2px 8px", borderRadius: 4, textTransform: "capitalize" }}>
                    {roleIcon} {userProfile?.role}
                  </span>
                  {isSubscribed && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", background: "rgba(124,58,237,0.12)", padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>
                      {tier}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="form-label">Username</label>
                <input className="form-input" type="text" placeholder="your_username"
                  value={username} onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())} maxLength={32} />
              </div>
              <div>
                <label className="form-label">Bio</label>
                <textarea className="form-input" placeholder="Tell the world about yourself…" rows={3}
                  value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} style={{ resize: "vertical", minHeight: 80 }} />
                <p style={{ fontSize: 11, color: "#4b5563", marginTop: 5 }}>{160 - bio.length} chars left</p>
              </div>
              <button className="btn-purple" onClick={handleSaveProfile} disabled={saving}
                style={{ alignSelf: "flex-start" }}>
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </Section>

          <Section title="Account" icon="⚙️">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Row label="Email" value={user.email ?? "—"} />
              <Row label="Role" value={`${roleIcon} ${userProfile?.role?.charAt(0).toUpperCase()}${userProfile?.role?.slice(1)}`} />
              <Row label="Subscription" value={isSubscribed ? `${tier.toUpperCase()} (active)` : "Free"} />
              <Row label="Member since" value={user.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
              <a href="/pricing" className="btn-ghost" style={{ textDecoration: "none", padding: "10px 20px", fontSize: 13 }}>
                💳 {isSubscribed ? "Manage Plan" : "Upgrade Plan"}
              </a>
            </div>
          </Section>

          <Section title="Danger Zone" icon="⚠️" danger>
            <p style={{ color: "#9ca3af", fontSize: 13, marginBottom: 18, lineHeight: 1.6 }}>
              These actions are permanent and cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button className="btn-ghost"
                onClick={() => { signOut(); navigate("/"); }}
                style={{ fontSize: 13, padding: "10px 18px" }}>
                Sign Out
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{ background: confirmDelete ? "rgba(229,9,20,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${confirmDelete ? "rgba(229,9,20,0.4)" : "rgba(255,255,255,0.1)"}`, color: confirmDelete ? "#f87171" : "#9ca3af", borderRadius: 10, padding: "10px 18px", cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600, transition: "all 0.2s" }}>
                {deleting ? "Deleting…" : confirmDelete ? "⚠️ Confirm Delete" : "Delete Account"}
              </button>
              {confirmDelete && (
                <button onClick={() => setConfirmDelete(false)}
                  style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>
                  Cancel
                </button>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children, danger }: { title: string; icon: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <div style={{ background: "#12121a", border: `1px solid ${danger ? "rgba(229,9,20,0.15)" : "rgba(255,255,255,0.05)"}`, borderRadius: 20, padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <h2 style={{ fontSize: 15, fontWeight: 800, color: danger ? "#f87171" : "#e2e8f0" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
      <span style={{ fontSize: 13, color: "#6b7280" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{value}</span>
    </div>
  );
}
