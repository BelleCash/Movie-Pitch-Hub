import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

const ROLES: { value: UserRole; icon: string; title: string; desc: string; color: string }[] = [
  { value: "viewer",   icon: "👁",  title: "Viewer",   desc: "Discover and explore pitches from creators worldwide.",          color: "#9ca3af" },
  { value: "creator",  icon: "🎬",  title: "Creator",  desc: "Pitch your movie ideas and build your creative portfolio.",      color: "#a78bfa" },
  { value: "investor", icon: "💼",  title: "Investor", desc: "Find investable opportunities and track promising film deals.",   color: "#fbbf24" },
];

const STEPS = ["welcome", "profile", "done"] as const;
type Step = typeof STEPS[number];

export default function Onboarding() {
  const { user, userProfile, completeOnboarding, authLoading } = useAuth();
  const [, navigate] = useLocation();

  const [step, setStep] = useState<Step>("welcome");
  const [role, setRole] = useState<UserRole>(userProfile?.role ?? "viewer");
  const [username, setUsername] = useState(userProfile?.username ?? "");
  const [bio, setBio] = useState(userProfile?.bio ?? "");
  const [loading, setLoading] = useState(false);
  const [anim, setAnim] = useState<"in" | "out">("in");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate("/"); return; }
    if (userProfile?.onboardingComplete) {
      if (userProfile.role === "investor") navigate("/investor");
      else if (userProfile.role === "creator") navigate("/dashboard");
      else navigate("/");
    }
  }, [user, authLoading, userProfile?.onboardingComplete, userProfile?.role]);

  const goStep = (next: Step) => {
    setAnim("out");
    setTimeout(() => { setStep(next); setAnim("in"); }, 280);
  };

  const handleFinish = async () => {
    if (!username.trim()) { toast.error("Please enter a username"); return; }
    setLoading(true);
    try {
      await completeOnboarding({ username: username.trim(), bio: bio.trim(), role });
      goStep("done");
      setTimeout(() => {
        if (role === "investor") navigate("/investor");
        else if (role === "creator") navigate("/dashboard");
        else navigate("/");
      }, 2200);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <Spinner />;

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 60% at 50% 0%, rgba(124,58,237,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "absolute", top: 24, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 8 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ height: 3, width: 48, borderRadius: 4, background: STEPS.indexOf(step) >= i ? "#7c3aed" : "rgba(255,255,255,0.1)", transition: "background 0.4s" }} />
        ))}
      </div>

      <div key={step} style={{ maxWidth: 480, width: "100%", animation: anim === "in" ? "fadeSlideIn 0.35s ease-out both" : "fadeSlideOut 0.28s ease-in both" }}>
        {step === "welcome" && (
          <WelcomeStep role={role} setRole={setRole} onNext={() => goStep("profile")} />
        )}
        {step === "profile" && (
          <ProfileStep
            username={username} setUsername={setUsername}
            bio={bio} setBio={setBio}
            role={role}
            loading={loading}
            onBack={() => goStep("welcome")}
            onFinish={handleFinish}
          />
        )}
        {step === "done" && <DoneStep role={role} username={username} />}
      </div>

      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeSlideOut { from { opacity:1; transform:translateY(0); } to { opacity:0; transform:translateY(-16px); } }
      `}</style>
    </div>
  );
}

function WelcomeStep({ role, setRole, onNext }: { role: UserRole; setRole: (r: UserRole) => void; onNext: () => void }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 52, marginBottom: 20 }}>🎬</div>
      <h1 style={{ fontSize: "clamp(1.8rem,5vw,2.6rem)", fontWeight: 900, letterSpacing: "-0.04em", marginBottom: 12 }}>
        Welcome to <span style={{ background: "linear-gradient(90deg,#7c3aed,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PitchFlix</span>
      </h1>
      <p style={{ color: "#9ca3af", fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
        Your first pitch could go viral.<br />Join creators shaping the future of cinema.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32, textAlign: "left" }}>
        {ROLES.map((r) => (
          <button key={r.value} onClick={() => setRole(r.value)}
            style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: role === r.value ? "rgba(124,58,237,0.14)" : "rgba(255,255,255,0.03)", border: `1.5px solid ${role === r.value ? "#7c3aed" : "rgba(255,255,255,0.08)"}`, borderRadius: 16, cursor: "pointer", transition: "all 0.22s", fontFamily: "inherit", width: "100%" }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: role === r.value ? "rgba(124,58,237,0.2)" : "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              {r.icon}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: role === r.value ? "#a78bfa" : "#e2e8f0", marginBottom: 3 }}>{r.title}</div>
              <div style={{ fontSize: 12, color: "#6b7280", lineHeight: 1.4 }}>{r.desc}</div>
            </div>
            {role === r.value && (
              <div style={{ marginLeft: "auto", width: 20, height: 20, borderRadius: "50%", background: "#7c3aed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="11" height="11" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            )}
          </button>
        ))}
      </div>

      <button className="btn-purple" onClick={onNext} style={{ width: "100%", justifyContent: "center", fontSize: 15 }}>
        Continue as {role.charAt(0).toUpperCase() + role.slice(1)} →
      </button>
    </div>
  );
}

function ProfileStep({ username, setUsername, bio, setBio, role, loading, onBack, onFinish }: {
  username: string; setUsername: (v: string) => void;
  bio: string; setBio: (v: string) => void;
  role: UserRole; loading: boolean;
  onBack: () => void; onFinish: () => void;
}) {
  return (
    <div>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, fontFamily: "inherit", display: "flex", alignItems: "center", gap: 6, marginBottom: 28 }}>
        ← Back
      </button>
      <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.2rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 10 }}>
        Set up your profile
      </h2>
      <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>
        {role === "creator" ? "Let the world know who's behind the next big pitch." :
         role === "investor" ? "Help creators understand your investment interests." :
         "Personalise your PitchFlix experience."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 28 }}>
        <div>
          <label className="form-label">Username *</label>
          <input className="form-input" type="text" placeholder="e.g. spielberg_jr" autoFocus
            value={username} onChange={(e) => setUsername(e.target.value.replace(/\s/g, "").toLowerCase())} maxLength={32} />
          <p style={{ fontSize: 11, color: "#4b5563", marginTop: 6 }}>Letters, numbers and underscores only. Max 32 chars.</p>
        </div>
        <div>
          <label className="form-label">Bio <span style={{ color: "#4b5563", fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
          <textarea className="form-input" placeholder={role === "creator" ? "Filmmaker. Storyteller. Based in Lagos." : role === "investor" ? "Angel investor. Passionate about African cinema." : "Movie lover and pitch enthusiast."}
            value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={160} style={{ resize: "vertical", minHeight: 80 }} />
          <p style={{ fontSize: 11, color: "#4b5563", marginTop: 6 }}>{160 - bio.length} characters remaining</p>
        </div>
      </div>

      <button className="btn-purple" onClick={onFinish} disabled={loading || !username.trim()} style={{ width: "100%", justifyContent: "center", fontSize: 15 }}>
        {loading ? "Saving…" : "Complete Setup 🚀"}
      </button>
    </div>
  );
}

function DoneStep({ role, username }: { role: UserRole; username: string }) {
  const msg = role === "investor" ? "Taking you to your deal flow…" :
               role === "creator" ? "Taking you to your dashboard…" :
               "Taking you to the feed…";
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 24, animation: "popIn 0.5s cubic-bezier(.34,1.56,.64,1) both" }}>🎉</div>
      <h2 style={{ fontSize: "clamp(1.6rem,4vw,2.4rem)", fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 12 }}>
        You're in, <span style={{ color: "#a78bfa" }}>@{username}</span>!
      </h2>
      <p style={{ color: "#9ca3af", fontSize: 15, lineHeight: 1.7, marginBottom: 24 }}>
        {role === "creator" ? "Your first pitch could go viral. The world is waiting." :
         role === "investor" ? "Discover the next blockbuster before anyone else." :
         "Explore pitches from creators shaping tomorrow's cinema."}
      </p>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#6b7280", fontSize: 13 }}>
        <div style={{ width: 16, height: 16, border: "2px solid #7c3aed", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
        {msg}
      </div>
      <style>{`@keyframes popIn { from { transform:scale(0.4); opacity:0; } to { transform:scale(1); opacity:1; } }`}</style>
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0f", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 40, height: 40, border: "3px solid rgba(124,58,237,0.2)", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.9s linear infinite" }} />
    </div>
  );
}
