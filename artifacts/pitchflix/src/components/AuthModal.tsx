import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Mode = "signin" | "signup";

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const { signIn, signUp } = useAuth();

  const reset = () => {
    setEmail(""); setPassword(""); setError(""); setCheckEmail(false); setLoading(false);
  };

  const close = () => { reset(); onClose(); };

  const switchMode = () => { setMode((m) => (m === "signin" ? "signup" : "signin")); setError(""); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signin") {
      const { error: err } = await signIn(email, password);
      setLoading(false);
      if (err) { setError(err); return; }
      close();
      onSuccess?.();
    } else {
      const { error: err } = await signUp(email, password);
      setLoading(false);
      if (err) { setError(err); return; }
      setCheckEmail(true);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop open"
      onClick={(e) => { if ((e.target as Element).classList.contains("modal-backdrop")) close(); }}>
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em" }}>
              {checkEmail ? "Check your email" : mode === "signin" ? "Welcome back" : "Join PitchFlix"}
            </h2>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 5 }}>
              {checkEmail ? "A link has been sent to activate your account" : mode === "signin" ? "Sign in to submit and like pitches" : "Create an account to start pitching"}
            </p>
          </div>
          <button className="modal-close-btn" onClick={close}>×</button>
        </div>

        {checkEmail ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
            <p style={{ color: "#9ca3af", fontSize: 14, lineHeight: 1.7 }}>
              Confirmation link sent to{" "}
              <strong style={{ color: "#e2e8f0" }}>{email}</strong>.
              <br />Click it to activate your account.
            </p>
            <button className="btn-red" style={{ width: "100%", justifyContent: "center", marginTop: 20 }} onClick={close}>
              Got it
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input className="form-input" type="password"
                placeholder={mode === "signup" ? "Min. 6 characters" : "Your password"}
                value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>

            {error && (
              <div style={{ background: "rgba(229,9,20,0.1)", border: "1px solid rgba(229,9,20,0.25)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn-red" disabled={loading}
              style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
              {loading ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            </button>

            <div style={{ textAlign: "center", fontSize: 13, color: "#6b7280" }}>
              {mode === "signin" ? "No account? " : "Already have one? "}
              <button type="button" onClick={switchMode}
                style={{ background: "none", border: "none", color: "#e50914", cursor: "pointer", fontWeight: 700, fontSize: 13, fontFamily: "inherit" }}>
                {mode === "signin" ? "Sign up free" : "Sign in"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
