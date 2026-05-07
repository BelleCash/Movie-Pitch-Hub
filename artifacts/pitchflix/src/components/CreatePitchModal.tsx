import { useState, useRef } from "react";
import { toast } from "sonner";
import { usePitches } from "@/hooks/usePitches";
import { useAuth } from "@/context/AuthContext";

const GENRES = ["Action","Drama","Comedy","Nollywood","Sci-Fi","Thriller","Romance","Horror","Documentary","Animation"];
const SUGGESTED_TAGS = ["dystopian","afrofuturism","thriller","coming-of-age","romance","AI","nollywood","sci-fi","superhero","crime","political","military","heist","family","survival","historical","mystery"];

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
  const [synopsis, setSynopsis] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle(""); setGenre(""); setYear("2024"); setLogline(""); setSynopsis("");
    setVideoUrl(""); setImageUrl(""); setFile(null); setPreview("");
    setTags([]); setTagInput(""); setStatusMsg("");
    if (fileRef.current) fileRef.current.value = "";
  };
  const close = () => { reset(); onClose(); };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setImageUrl("");
  };

  const addTag = (t: string) => {
    const tag = t.toLowerCase().replace(/[^a-z0-9-]/g, "").trim();
    if (!tag || tags.includes(tag) || tags.length >= 8) return;
    setTags((p) => [...p, tag]);
    setTagInput("");
  };
  const removeTag = (t: string) => setTags((p) => p.filter((x) => x !== t));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !genre) { toast.error("Title and genre are required"); return; }
    setLoading(true);

    let finalImage = imageUrl.trim();
    if (file) {
      setStatusMsg("Uploading poster…");
      const uploaded = await uploadImage(file);
      if (uploaded) finalImage = uploaded;
    }
    if (!finalImage) finalImage = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=70&auto=format&fit=crop";

    setStatusMsg("Publishing pitch…");
    try {
      const { id } = await addPitch(
        { title: title.trim(), genre, year: parseInt(year) || 2024, logline: logline.trim(), image: finalImage, synopsis: synopsis.trim() || undefined, video_url: videoUrl.trim() || undefined, tags: tags.length ? tags : undefined },
        user?.id
      );
      close();
      toast.success("🎬 Pitch is live!", { description: "Your story is now in the marketplace." });
      onCreated?.(id);
    } catch {
      toast.error("Failed to publish. Please try again.");
    } finally {
      setLoading(false); setStatusMsg("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop open"
      onClick={(e) => { if ((e.target as Element).classList.contains("modal-backdrop")) close(); }}>
      <div className="modal-box" style={{ maxWidth: 560, maxHeight: "92vh" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 800, letterSpacing: "-0.025em" }}>🚀 Launch Your Movie Pitch</h2>
            <p style={{ color: "#6b7280", fontSize: 13, marginTop: 5 }}>Share your story with the world</p>
          </div>
          <button className="modal-close-btn" onClick={close}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <SectionLabel>🎭 Core Story</SectionLabel>

          <div>
            <label className="form-label">Project Title *</label>
            <input className="form-input" type="text" placeholder="Your pitch title…"
              value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="form-label">Genre *</label>
              <select className="form-input" value={genre} onChange={(e) => setGenre(e.target.value)} required style={{ cursor: "pointer" }}>
                <option value="" disabled>Select…</option>
                {GENRES.map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Year</label>
              <input className="form-input" type="number" placeholder="2024" min="1900" max="2030"
                value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="form-label">Hook / Logline * <span style={{ color: "#4b5563", textTransform: "none", fontWeight: 400 }}>({280 - logline.length} left)</span></label>
            <textarea className="form-input" placeholder="One compelling sentence that sells your concept…" rows={2}
              value={logline} onChange={(e) => setLogline(e.target.value.slice(0, 280))} required style={{ resize: "none" }} />
          </div>

          <div>
            <label className="form-label">Full Synopsis <span style={{ color: "#4b5563", textTransform: "none", fontWeight: 400 }}>(optional)</span></label>
            <textarea className="form-input" placeholder="The full story — characters, conflict, stakes…" rows={4}
              value={synopsis} onChange={(e) => setSynopsis(e.target.value)} style={{ resize: "vertical", minHeight: 90 }} />
          </div>

          <SectionLabel>🏷️ Keywords & Tags</SectionLabel>
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: tags.length ? 10 : 0 }}>
              {tags.map((t) => (
                <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(124,58,237,0.14)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 50, padding: "3px 10px", fontSize: 12, color: "#a78bfa" }}>
                  #{t}
                  <button type="button" onClick={() => removeTag(t)} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", lineHeight: 1, padding: 0, fontSize: 14, fontFamily: "inherit" }}>×</button>
                </span>
              ))}
            </div>
            <input className="form-input" type="text" placeholder="Add a tag and press Enter…"
              value={tagInput} onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 8 }}>
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 9).map((t) => (
                <button key={t} type="button" onClick={() => addTag(t)}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 50, padding: "2px 9px", fontSize: 11, color: "#6b7280", cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)"; e.currentTarget.style.color = "#a78bfa"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#6b7280"; }}>
                  +{t}
                </button>
              ))}
            </div>
          </div>

          <SectionLabel>🖼️ Visuals</SectionLabel>
          <div>
            <label style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.03)", border: "1.5px dashed rgba(255,255,255,0.1)", borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.borderColor = "rgba(124,58,237,0.45)"; el.style.background = "rgba(124,58,237,0.05)"; }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.borderColor = "rgba(255,255,255,0.1)"; el.style.background = "rgba(255,255,255,0.03)"; }}>
              <div style={{ width: 36, height: 36, background: "rgba(124,58,237,0.15)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke="#8b5cf6" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Upload poster</div>
                <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>JPG, PNG, WebP — max 5MB</div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileSelect} />
            </label>

            {preview && (
              <div style={{ marginTop: 10, position: "relative" }}>
                <img src={preview} alt="Preview" style={{ width: "100%", maxHeight: 180, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(255,255,255,0.08)" }} />
                <button type="button" onClick={() => { setPreview(""); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                  style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "50%", width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff", fontSize: 14, lineHeight: 1, fontFamily: "inherit" }}>×</button>
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "10px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: 11, color: "#4b5563", fontWeight: 500 }}>or paste URL</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
            </div>
            <input className="form-input" type="url" placeholder="https://example.com/poster.jpg"
              value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setFile(null); setPreview(""); }} />
          </div>

          <SectionLabel>🎥 Teaser / Trailer</SectionLabel>
          <div>
            <label className="form-label">Video URL <span style={{ color: "#4b5563", textTransform: "none", fontWeight: 400 }}>(YouTube, Vimeo)</span></label>
            <input className="form-input" type="url" placeholder="https://youtube.com/watch?v=…"
              value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} />
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 8, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <button type="button" className="btn-ghost" onClick={close} style={{ flex: 1, justifyContent: "center" }}>Cancel</button>
            <button type="submit" className="btn-purple" disabled={loading} style={{ flex: 2, justifyContent: "center" }}>
              {loading ? (statusMsg || "Publishing…") : "🎬 Publish Pitch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 800, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid rgba(124,58,237,0.15)", paddingBottom: 8, marginTop: 4 }}>
      {children}
    </div>
  );
}
