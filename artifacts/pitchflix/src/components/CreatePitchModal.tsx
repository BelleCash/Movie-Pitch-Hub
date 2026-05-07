import { useState, useRef } from "react";
import { toast } from "sonner";
import { usePitches } from "@/hooks/usePitches";
import { useAuth } from "@/context/AuthContext";

interface CreatePitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
}

export default function CreatePitchModal({ isOpen, onClose, onCreated }: CreatePitchModalProps) {
  const { user } = useAuth();
  const { addPitch, uploadImage } = usePitches();

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("2024");
  const [logline, setLogline] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle(""); setGenre(""); setYear("2024"); setLogline("");
    setImageUrl(""); setFile(null); setPreview(""); setStatusMsg("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const close = () => { reset(); onClose(); };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setImageUrl("");
  };

  const handleUrlChange = (v: string) => {
    setImageUrl(v);
    setFile(null);
    setPreview("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalImage = imageUrl.trim();

    if (file) {
      setStatusMsg("Uploading poster…");
      const uploaded = await uploadImage(file);
      if (uploaded) finalImage = uploaded;
    }

    if (!finalImage) {
      finalImage = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=70&auto=format&fit=crop";
    }

    setStatusMsg("Saving pitch…");
    try {
      const { id } = await addPitch(
        { title: title.trim(), genre, year: parseInt(year) || 2024, logline: logline.trim(), image: finalImage },
        user?.id
      );
      close();
      toast.success("Pitch submitted!", { description: "Your pitch is now live 🎬" });
      onCreated?.(id);
    } catch {
      toast.error("Failed to submit pitch. Please try again.");
    } finally {
      setLoading(false);
      setStatusMsg("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop open"
      onClick={(e) => { if ((e.target as Element).classList.contains("modal-backdrop")) close(); }}>
      <div className="modal-box">
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 28 }}>
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em" }}>Submit Your Pitch</h2>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 5 }}>Share your story with the world</p>
          </div>
          <button className="modal-close-btn" onClick={close}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label className="form-label">Movie Title *</label>
            <input className="form-input" type="text" placeholder="Enter your pitch title…"
              value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Genre *</label>
              <select className="form-input" value={genre} onChange={(e) => setGenre(e.target.value)} required
                style={{ cursor: "pointer" }}>
                <option value="" disabled>Select…</option>
                {["Action","Drama","Comedy","Nollywood","Sci-Fi","Thriller","Romance","Horror"].map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Year</label>
              <input className="form-input" type="number" placeholder="2024" min="1900" max="2030"
                value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">Logline *</label>
            <textarea className="form-input" placeholder="A compelling one-sentence summary…" rows={3}
              value={logline} onChange={(e) => setLogline(e.target.value)} required
              style={{ resize: "vertical", minHeight: 78 }} />
          </div>

          <div>
            <label className="form-label">Poster Image</label>
            <label style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", border: "1.5px dashed rgba(255,255,255,0.12)", borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "border-color 0.2s,background 0.2s" }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = "rgba(229,9,20,0.45)"; el.style.background = "rgba(229,9,20,0.05)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = "rgba(255,255,255,0.12)"; el.style.background = "rgba(255,255,255,0.03)"; }}>
              <div style={{ width: 36, height: 36, background: "rgba(229,9,20,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke="#e50914" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>Upload poster</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>JPG, PNG, WebP — max 5MB</div>
              </div>
              <input ref={fileRef} id="poster-file" type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleFileSelect} />
            </label>

            {preview && (
              <div style={{ marginTop: 10, position: "relative" }}>
                <img src={preview} alt="Preview"
                  style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }} />
                <button type="button"
                  onClick={() => { setPreview(""); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                  style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 14, lineHeight: 1, fontFamily: "inherit" }}>
                  ×
                </button>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "12px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: 11, color: "#4b5563", fontWeight: 500 }}>or paste URL</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            </div>

            <input className="form-input" type="url" placeholder="https://example.com/poster.jpg"
              value={imageUrl} onChange={(e) => handleUrlChange(e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button type="button" className="btn-ghost" onClick={close} style={{ flex: 1 }}>Cancel</button>
            <button type="submit" className="btn-purple" disabled={loading} style={{ flex: 2, justifyContent: "center" }}>
              {loading ? (statusMsg || "Submitting…") : "🎬 Submit Pitch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
