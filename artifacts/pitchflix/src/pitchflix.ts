import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ─── SUPABASE INIT ─────────────────────────────────────────────────────────────
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
const HAS_SUPABASE = !!(SUPABASE_URL && SUPABASE_KEY && SUPABASE_URL.startsWith("http"));

let sb: SupabaseClient | null = null;
if (HAS_SUPABASE) {
  try {
    sb = createClient(SUPABASE_URL, SUPABASE_KEY);
  } catch (e) {
    console.warn("Supabase init failed:", e);
  }
}

// Show DB status chip
const chip = document.getElementById("db-chip") as HTMLElement;
chip.style.display = "inline-flex";
if (HAS_SUPABASE && sb) {
  chip.className = "db-chip live";
  chip.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#4ade80;"></span> Live DB';
} else {
  chip.className = "db-chip demo";
  chip.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#fbbf24;"></span> Demo Mode';
}

// ─── TYPES ─────────────────────────────────────────────────────────────────────
interface Movie {
  id: number | string;
  title: string;
  genre: string;
  year: number;
  likes: number;
  rating: number;
  trending: boolean;
  image: string;
  logline: string;
}

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const MOCK: Movie[] = [
  { id:1,  title:"Scarlet Dawn",        genre:"Action",    year:2024, likes:1243, rating:5, trending:true,  image:"https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&q=70&auto=format&fit=crop",   logline:"An ex-soldier uncovers a corporate conspiracy that threatens to ignite World War III." },
  { id:2,  title:"The Last Monsoon",    genre:"Drama",     year:2023, likes:987,  rating:5, trending:false, image:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=70&auto=format&fit=crop",   logline:"A family torn apart by ambition must reunite before a catastrophic storm destroys everything." },
  { id:3,  title:"Lagos Nights",        genre:"Nollywood", year:2024, likes:2105, rating:5, trending:true,  image:"https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=400&q=70&auto=format&fit=crop",   logline:"A rising musician navigates love, betrayal, and destiny in the pulsing heart of Lagos." },
  { id:4,  title:"Quantum Break",       genre:"Sci-Fi",    year:2024, likes:1876, rating:4, trending:true,  image:"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=70&auto=format&fit=crop",   logline:"A physicist discovers time is collapsing and must sacrifice everything to reset the universe." },
  { id:5,  title:"Paper Hearts",        genre:"Romance",   year:2023, likes:734,  rating:4, trending:false, image:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=70&auto=format&fit=crop",   logline:"Two rivals discover love letters from the 1940s that mirror their own story." },
  { id:6,  title:"Dead Signal",         genre:"Horror",    year:2024, likes:1456, rating:4, trending:true,  image:"https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&q=70&auto=format&fit=crop",   logline:"Friends receive voicemails from their future selves — all warning of the same fate." },
  { id:7,  title:"Concrete Kings",      genre:"Drama",     year:2023, likes:892,  rating:4, trending:false, image:"https://images.unsplash.com/photo-1502920917128-1aa500764b12?w=400&q=70&auto=format&fit=crop",   logline:"Five childhood friends from the projects choose between loyalty and survival." },
  { id:8,  title:"The Perfect Heist",   genre:"Thriller",  year:2024, likes:1621, rating:5, trending:true,  image:"https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=70&auto=format&fit=crop",   logline:"A master thief plans the impossible — stealing the world's most valuable secret." },
  { id:9,  title:"Dad's Cooking Again", genre:"Comedy",    year:2023, likes:543,  rating:4, trending:false, image:"https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&q=70&auto=format&fit=crop",   logline:"A widowed father attempts to win a reality cooking show with catastrophically disastrous results." },
  { id:10, title:"Iron Meridian",       genre:"Action",    year:2024, likes:1102, rating:4, trending:false, image:"https://images.unsplash.com/photo-1559038555-d2a10979a0e8?w=400&q=70&auto=format&fit=crop",   logline:"A disgraced general leads a ragtag army to defend the last free city on Earth." },
  { id:11, title:"Abuja Royals",        genre:"Nollywood", year:2024, likes:1789, rating:5, trending:true,  image:"https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=70&auto=format&fit=crop",   logline:"A royal family's ancient secret threatens the most powerful dynasty in West Africa." },
  { id:12, title:"Echoes in the Dark",  genre:"Thriller",  year:2023, likes:965,  rating:4, trending:false, image:"https://images.unsplash.com/photo-1458501534264-7d326fa0ca04?w=400&q=70&auto=format&fit=crop",   logline:"A blind detective solves crimes using only sound — until a killer hunts her through silence." },
];

// ─── STATE ─────────────────────────────────────────────────────────────────────
let movies: Movie[]        = [];
let liked: Set<number | string> = new Set();
let filter                 = "All";
let view                   = "home";

// ─── DATA LAYER ───────────────────────────────────────────────────────────────
async function loadPitches(): Promise<void> {
  if (!sb) {
    movies = MOCK.map(m => ({ ...m }));
    hideSkeleton();
    renderMovies();
    return;
  }
  try {
    const { data, error } = await sb.from("pitches").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    movies = (data || []).map((r: Record<string, unknown>) => ({
      id:       r.id as string,
      title:    r.title as string,
      genre:    (r.genre as string) || "Drama",
      year:     (r.year as number) || new Date(r.created_at as string).getFullYear(),
      likes:    (r.likes as number) || 0,
      rating:   (r.rating as number) || 4,
      trending: (r.trending as boolean) || false,
      image:    (r.image as string) || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=70&auto=format&fit=crop",
      logline:  (r.logline as string) || "",
    }));
    // Flip chip to live once we confirm table works
    chip.className = "db-chip live";
    chip.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#4ade80;"></span> Live DB';
    hideSkeleton();
    renderMovies();
  } catch (e) {
    console.warn("Supabase fetch failed, using mock data:", e);
    // Table likely doesn't exist yet — fall back silently
    movies = MOCK.map(m => ({ ...m }));
    chip.className = "db-chip demo";
    chip.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#fbbf24;"></span> Demo Mode';
    hideSkeleton();
    renderMovies();
  }
}

async function addPitch(pitch: Omit<Movie, "id" | "likes" | "rating" | "trending">): Promise<void> {
  if (!sb) {
    movies.unshift({ ...pitch, id: Date.now(), likes: 0, rating: 4, trending: false });
    renderMovies();
    return;
  }
  try {
    const { error } = await sb.from("pitches").insert([{
      title:   pitch.title,
      genre:   pitch.genre,
      image:   pitch.image,
      likes:   0,
      year:    pitch.year,
      logline: pitch.logline,
    }]);
    if (error) throw error;
    await loadPitches();
  } catch (e) {
    console.warn("Insert failed:", e);
    movies.unshift({ ...pitch, id: Date.now(), likes: 0, rating: 4, trending: false });
    renderMovies();
  }
}

async function likePitch(id: number | string): Promise<void> {
  const movie = movies.find(m => m.id === id);
  if (!movie) return;

  const wasLiked = liked.has(id);
  if (wasLiked) {
    liked.delete(id);
    movie.likes = Math.max(0, movie.likes - 1);
  } else {
    liked.add(id);
    movie.likes += 1;
  }

  updateLikeBtn(id, movie.likes);

  if (!sb) return;
  try {
    await sb.from("pitches").update({ likes: movie.likes }).eq("id", id);
  } catch (e) {
    console.warn("Like update failed:", e);
  }
}

// ─── RENDER ────────────────────────────────────────────────────────────────────
function hideSkeleton(): void {
  const sk = document.getElementById("skeletons");
  const gr = document.getElementById("movies-grid");
  if (sk) sk.style.display = "none";
  if (gr) gr.style.display = "grid";
}

function getQuery(): string {
  const d = document.getElementById("search-input") as HTMLInputElement;
  const m = document.getElementById("search-input-mobile") as HTMLInputElement;
  return ((d?.value) || (m?.value) || "").toLowerCase().trim();
}

function renderMovies(): void {
  const q    = getQuery();
  const grid = document.getElementById("movies-grid");
  if (!grid) return;
  grid.innerHTML = "";

  let list = [...movies];
  if (view === "trending") list = list.filter(m => m.trending);
  if (filter !== "All")    list = list.filter(m => m.genre === filter);
  if (q) list = list.filter(m =>
    m.title.toLowerCase().includes(q) ||
    m.genre.toLowerCase().includes(q) ||
    m.logline.toLowerCase().includes(q)
  );

  const countEl = document.getElementById("movie-count");
  const titleEl = document.getElementById("section-title");
  const noRes   = document.getElementById("no-results");
  if (countEl) countEl.textContent = String(list.length);
  if (titleEl) titleEl.textContent = view === "trending" ? "Trending Pitches" : "All Pitches";
  if (noRes)   noRes.classList.toggle("hidden", list.length > 0);

  list.forEach((movie, i) => grid.appendChild(buildCard(movie, i)));
}

function buildCard(movie: Movie, i: number): HTMLElement {
  const isLiked = liked.has(movie.id);
  const rating  = Math.round(movie.rating || 4);
  const stars   = "★".repeat(rating) + "☆".repeat(5 - rating);

  const el = document.createElement("div");
  el.className = "movie-card";
  el.style.animationDelay = `${Math.min(i * 45, 400)}ms`;

  const idStr = JSON.stringify(movie.id);
  el.innerHTML = `
    ${movie.trending ? '<div class="trending-badge">🔥 Trending</div>' : ""}
    <img src="${movie.image}" alt="${movie.title}" loading="lazy"
      onerror="this.src='https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=60&auto=format&fit=crop'">
    <div class="card-shine"></div>
    <div class="card-overlay">
      <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:8px;">
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:7px;flex-wrap:wrap;">
            <span class="genre-badge">${movie.genre}</span>
            <span class="year-badge">${movie.year || "—"}</span>
          </div>
          <h3 style="font-size:13px;font-weight:800;line-height:1.3;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-0.01em;">${movie.title}</h3>
          <div class="stars" style="font-size:9px;">${stars}</div>
        </div>
        <button class="like-btn ${isLiked ? "liked" : ""}" id="like-${movie.id}"
          onclick="event.stopPropagation(); window.__toggleLike(${idStr})" aria-label="Like">
          <svg width="11" height="11" fill="${isLiked ? "#e50914" : "none"}" stroke="${isLiked ? "#e50914" : "currentColor"}" stroke-width="2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span id="count-${movie.id}">${fmtCount(movie.likes)}</span>
        </button>
      </div>
    </div>`;
  return el;
}

// ─── LIKE ─────────────────────────────────────────────────────────────────────
function updateLikeBtn(id: number | string, newCount: number): void {
  const btn  = document.getElementById(`like-${id}`);
  const span = document.getElementById(`count-${id}`);
  if (!btn || !span) return;
  const isL = liked.has(id);
  btn.classList.toggle("liked", isL);
  span.textContent = fmtCount(newCount);
  const svg = btn.querySelector("svg");
  if (svg) {
    svg.setAttribute("fill", isL ? "#e50914" : "none");
    svg.setAttribute("stroke", isL ? "#e50914" : "currentColor");
  }
  btn.animate([{ transform:"scale(1)" }, { transform:"scale(1.32)" }, { transform:"scale(1)" }], { duration:240, easing:"ease-out" });
}

function fmtCount(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "k";
  return String(n);
}

// ─── FILTER / VIEW ────────────────────────────────────────────────────────────
function setFilter(btn: HTMLElement, genre: string): void {
  filter = genre;
  document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderMovies();
}

function setView(v: string): void {
  view = v;
  ["home", "trending"].forEach(name => {
    document.getElementById(`nav-${name}`)?.classList.toggle("active", name === v);
    document.getElementById(`bn-${name}`)?.classList.toggle("active", name === v);
  });
  const heroBg = document.getElementById("hero-bg");
  if (heroBg) {
    heroBg.style.backgroundImage = v === "trending"
      ? "url('https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=1800&q=80&auto=format&fit=crop')"
      : "url('https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=1800&q=80&auto=format&fit=crop')";
  }
  renderMovies();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// ─── MODAL ─────────────────────────────────────────────────────────────────────
function openModal(): void  { document.getElementById("modal")?.classList.add("open"); document.body.style.overflow = "hidden"; }
function closeModal(): void { document.getElementById("modal")?.classList.remove("open"); document.body.style.overflow = ""; }
function onBackdropClick(e: MouseEvent): void { if ((e.target as HTMLElement).id === "modal") closeModal(); }

// ─── SUBMIT ───────────────────────────────────────────────────────────────────
async function handleSubmit(e: Event): Promise<void> {
  e.preventDefault();
  const btn = document.getElementById("submit-btn") as HTMLButtonElement;
  btn.disabled = true;
  btn.textContent = "Submitting…";

  const pitch = {
    title:   (document.getElementById("f-title") as HTMLInputElement).value.trim(),
    genre:   (document.getElementById("f-genre") as HTMLSelectElement).value,
    year:    parseInt((document.getElementById("f-year") as HTMLInputElement).value) || 2024,
    logline: (document.getElementById("f-logline") as HTMLTextAreaElement).value.trim(),
    image:   (document.getElementById("f-image") as HTMLInputElement).value.trim() ||
             "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=70&auto=format&fit=crop",
  };

  await addPitch(pitch);
  closeModal();
  (document.getElementById("pitch-form") as HTMLFormElement).reset();
  btn.disabled = false;
  btn.innerHTML = "🎬 Submit Pitch";
  showToast("Pitch submitted successfully!");
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg: string): void {
  const el = document.getElementById("toast");
  const msgEl = document.getElementById("toast-msg");
  if (!el || !msgEl) return;
  msgEl.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3200);
}

// ─── SCROLL ───────────────────────────────────────────────────────────────────
window.addEventListener("scroll", () => {
  document.getElementById("navbar")?.classList.toggle("scrolled", window.scrollY > 30);
}, { passive: true });

// ─── EXPOSE GLOBALS (called from inline HTML onclick) ─────────────────────────
(window as Record<string, unknown>).__toggleLike = (id: number | string) => likePitch(id);
(window as Record<string, unknown>).setFilter     = setFilter;
(window as Record<string, unknown>).setView       = setView;
(window as Record<string, unknown>).openModal     = openModal;
(window as Record<string, unknown>).closeModal    = closeModal;
(window as Record<string, unknown>).onBackdropClick = onBackdropClick;
(window as Record<string, unknown>).handleSubmit  = handleSubmit;
(window as Record<string, unknown>).scrollToTop   = scrollToTop;
(window as Record<string, unknown>).renderMovies  = renderMovies;

// ─── BOOT ─────────────────────────────────────────────────────────────────────
loadPitches();
