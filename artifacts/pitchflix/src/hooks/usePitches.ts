import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Pitch } from "@/types";

const FALLBACK =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=70&auto=format&fit=crop";

export const MOCK_PITCHES: Pitch[] = [
  { id:"1",  title:"Scarlet Dawn",        genre:"Action",    year:2024, likes:1243, rating:5, trending:true,  image:"https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&q=70&auto=format&fit=crop",   logline:"An ex-soldier uncovers a corporate conspiracy that threatens to ignite World War III.", tags:["action","thriller","conspiracy","military"], synopsis:"A decorated special forces veteran discovers that the arms company she worked for has been funding both sides of every major conflict for decades. With the evidence that could expose them, she becomes the most hunted person on the planet.", views:420, trending_score:88 },
  { id:"2",  title:"The Last Monsoon",    genre:"Drama",     year:2023, likes:987,  rating:5, trending:false, image:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=70&auto=format&fit=crop",   logline:"A family torn apart by ambition must reunite before a catastrophic storm destroys everything.", tags:["drama","family","redemption"], synopsis:"Told across three generations, The Last Monsoon follows the Adeyemi family as a once-in-a-century storm forces estranged siblings to confront buried secrets and decide what truly matters.", views:310, trending_score:65 },
  { id:"3",  title:"Lagos Nights",        genre:"Nollywood", year:2024, likes:2105, rating:5, trending:true,  image:"https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=400&q=70&auto=format&fit=crop",   logline:"A rising musician navigates love, betrayal, and destiny in the pulsing heart of Lagos.", tags:["nollywood","music","romance","afrofuturism"], synopsis:"Kofi dreams of filling stadiums. When a chance encounter with a mysterious producer gives him his shot, he must choose between overnight fame and the soul of his music — and the woman who believed in him before anyone else did.", views:892, trending_score:95 },
  { id:"4",  title:"Quantum Break",       genre:"Sci-Fi",    year:2024, likes:1876, rating:4, trending:true,  image:"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=70&auto=format&fit=crop",   logline:"A physicist discovers time is collapsing and must sacrifice everything to reset the universe.", tags:["sci-fi","time-travel","AI","physics"], synopsis:"Dr. Yemi Ade builds the world's first temporal scanner and watches the timeline fracture in real time. With hours before reality unravels permanently, she must reverse her life's greatest achievement.", views:734, trending_score:92 },
  { id:"5",  title:"Paper Hearts",        genre:"Romance",   year:2023, likes:734,  rating:4, trending:false, image:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=70&auto=format&fit=crop",   logline:"Two rivals discover love letters from the 1940s that mirror their own story.", tags:["romance","historical","coming-of-age"], synopsis:"While clearing out an old Lagos bookshop, rival restorers Amara and Dayo uncover a cache of wartime love letters. As they read deeper, the 1940s story starts to eerily predict their own growing feelings.", views:215, trending_score:48 },
  { id:"6",  title:"Dead Signal",         genre:"Horror",    year:2024, likes:1456, rating:4, trending:true,  image:"https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&q=70&auto=format&fit=crop",   logline:"Friends receive voicemails from their future selves — all warning of the same fate.", tags:["horror","supernatural","thriller"], synopsis:"Six university students start receiving voicemails from versions of themselves 48 hours in the future. Each message ends mid-scream. They have two days to break the loop — or become the voices on the next call.", views:567, trending_score:82 },
  { id:"7",  title:"Concrete Kings",      genre:"Drama",     year:2023, likes:892,  rating:4, trending:false, image:"https://images.unsplash.com/photo-1502920917128-1aa500764b12?w=400&q=70&auto=format&fit=crop",   logline:"Five childhood friends from the projects choose between loyalty and survival.", tags:["drama","crime","urban","loyalty"], synopsis:"Growing up in Ajegunle, five boys made a pact: nobody gets left behind. Twenty years later, one is a senator, one is a gangster, and three are somewhere in between.", views:198, trending_score:52 },
  { id:"8",  title:"The Perfect Heist",   genre:"Thriller",  year:2024, likes:1621, rating:5, trending:true,  image:"https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=70&auto=format&fit=crop",   logline:"A master thief plans the impossible — stealing the world's most valuable secret.", tags:["thriller","heist","crime","tech"], synopsis:"The target isn't a vault — it's a 3-line algorithm that could render every financial system on Earth obsolete. The crew has one window: the 40 minutes it takes to present it at Davos.", views:640, trending_score:89 },
  { id:"9",  title:"Dad's Cooking Again", genre:"Comedy",    year:2023, likes:543,  rating:4, trending:false, image:"https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&q=70&auto=format&fit=crop",   logline:"A widowed father attempts to win a reality cooking show with catastrophically disastrous results.", tags:["comedy","family","food","heartwarming"], synopsis:"Chief Emeka hasn't cooked since his wife passed. His daughter enters him in Nigeria's biggest cooking reality show as a joke.", views:127, trending_score:38 },
  { id:"10", title:"Iron Meridian",       genre:"Action",    year:2024, likes:1102, rating:4, trending:false, image:"https://images.unsplash.com/photo-1559038555-d2a10979a0e8?w=400&q=70&auto=format&fit=crop",   logline:"A disgraced general leads a ragtag army to defend the last free city on Earth.", tags:["action","war","dystopian","survival"], synopsis:"After a bioweapon renders 90% of the Northern Hemisphere uninhabitable, General Zara Osei commands a 2,000-person civilian militia to hold the walls of New Accra.", views:380, trending_score:70 },
  { id:"11", title:"Abuja Royals",        genre:"Nollywood", year:2024, likes:1789, rating:5, trending:true,  image:"https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=70&auto=format&fit=crop",   logline:"A royal family's ancient secret threatens the most powerful dynasty in West Africa.", tags:["nollywood","royalty","political","drama"], synopsis:"When the eldest prince of the Adama dynasty dies without an heir, an illegitimate daughter from London arrives to claim what's hers.", views:712, trending_score:91 },
  { id:"12", title:"Echoes in the Dark",  genre:"Thriller",  year:2023, likes:965,  rating:4, trending:false, image:"https://images.unsplash.com/photo-1458501534264-7d326fa0ca04?w=400&q=70&auto=format&fit=crop",   logline:"A blind detective solves crimes using only sound — until a killer hunts her through silence.", tags:["thriller","mystery","disability","crime"], synopsis:"Detective Fatima Bello has solved 47 murders without ever seeing a single crime scene. She processes the world through audio memory and echolocation.", views:302, trending_score:67 },
];

function parseTags(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string" && v) {
    try { const p = JSON.parse(v); if (Array.isArray(p)) return p.map(String); } catch {}
    return v.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function parseRow(r: Record<string, unknown>): Pitch {
  return {
    id:              String(r.id),
    title:           String(r.title ?? ""),
    genre:           (r.genre as string) || "Drama",
    year:            (r.year as number) || new Date((r.created_at as string) || Date.now()).getFullYear(),
    likes:           (r.likes as number) ?? 0,
    rating:          (r.rating as number) ?? 4,
    trending:        Boolean(r.trending),
    image:           (r.image_url as string) || (r.image as string) || FALLBACK,
    logline:         (r.logline as string) || (r.description as string) || "",
    synopsis:        (r.synopsis as string) || undefined,
    video_url:       (r.video_url as string) || undefined,
    tags:            parseTags(r.tags),
    user_id:         r.user_id as string | undefined,
    created_at:      r.created_at as string | undefined,
    views:           (r.views as number) ?? 0,
    comment_count:   (r.comment_count as number) ?? 0,
    trending_score:  (r.trending_score as number) ?? 0,
  };
}

export function usePitches() {
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!supabase) {
      setPitches(MOCK_PITCHES.map((m) => ({ ...m })));
      setIsLive(false);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("pitches")
        .select("*")
        .order("trending_score", { ascending: false, nullsFirst: false });
      if (error) throw error;
      const rows = (data || []).map(parseRow);
      setPitches(rows.length > 0 ? rows : MOCK_PITCHES.map((m) => ({ ...m })));
      setIsLive(rows.length > 0);
    } catch {
      setPitches(MOCK_PITCHES.map((m) => ({ ...m })));
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!supabase) return;
    const ch = `pitches-rt-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(ch)
      .on("postgres_changes", { event: "*", schema: "public", table: "pitches" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          const u = payload.new as Record<string, unknown>;
          setPitches((prev) => prev.map((p) => p.id === String(u.id) ? { ...p, likes: (u.likes as number) ?? p.likes, views: (u.views as number) ?? p.views, trending_score: (u.trending_score as number) ?? p.trending_score } : p));
        } else {
          loadRef.current();
        }
      })
      .subscribe();
    return () => { supabase?.removeChannel(channel); };
  }, []);

  const updateLikes = useCallback(async (id: string, newLikes: number) => {
    setPitches((prev) => prev.map((p) => (p.id === id ? { ...p, likes: newLikes } : p)));
    if (!supabase) return;
    const pitch = pitches.find((p) => p.id === id);
    const newScore = Math.min(100, (pitch?.trending_score ?? 0) + 2);
    try {
      await supabase.from("pitches").update({ likes: newLikes, trending_score: newScore }).eq("id", id);
    } catch (e) { console.warn("Like update failed:", e); }
  }, [pitches]);

  const recordView = useCallback(async (pitchId: string, userId?: string) => {
    if (!supabase) return;
    try {
      await supabase.from("pitch_views").insert({ pitch_id: pitchId, user_id: userId ?? null });
      const pitch = pitches.find((p) => p.id === pitchId);
      const newViews = (pitch?.views ?? 0) + 1;
      const newScore = Math.min(100, (pitch?.trending_score ?? 0) + 1);
      await supabase.from("pitches").update({ views: newViews, trending_score: newScore }).eq("id", pitchId);
      setPitches((prev) => prev.map((p) => p.id === pitchId ? { ...p, views: newViews, trending_score: newScore } : p));
    } catch {}
  }, [pitches]);

  const addPitch = useCallback(async (
    pitch: Omit<Pitch, "id" | "likes" | "rating" | "trending">,
    userId?: string
  ): Promise<{ id: string }> => {
    if (!supabase) {
      const id = String(Date.now());
      setPitches((prev) => [{ ...pitch, id, likes: 0, rating: 4, trending: false, views: 0, trending_score: 0 }, ...prev]);
      return { id };
    }

    const payload: Record<string, unknown> = {
      title:       pitch.title,
      genre:       pitch.genre,
      image_url:   pitch.image,
      likes:       0,
      views:       0,
      year:        pitch.year,
      logline:     pitch.logline,
      description: pitch.logline,
      draft:       false,
      trending_score: 0,
    };
    if (userId) payload.user_id = userId;
    if (pitch.synopsis) payload.synopsis = pitch.synopsis;
    if (pitch.video_url) payload.video_url = pitch.video_url;
    if (pitch.tags?.length) payload.tags = pitch.tags;

    let result = await supabase.from("pitches").insert([payload]).select("id").single();

    if (result.error?.code === "42703") {
      const safe: Record<string, unknown> = {
        title: payload.title, genre: payload.genre, image_url: payload.image_url,
        likes: 0, views: 0, year: payload.year, logline: payload.logline, draft: false,
      };
      if (userId) safe.user_id = userId;
      result = await supabase.from("pitches").insert([safe]).select("id").single();
    }

    if (result.error) throw result.error;
    await load();
    return { id: String(result.data.id) };
  }, [load]);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!supabase) return null;
    try {
      const ext  = file.name.split(".").pop() || "jpg";
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("posters").upload(name, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("posters").getPublicUrl(name);
      return data.publicUrl;
    } catch (e) {
      console.warn("Upload failed:", e);
      return null;
    }
  }, []);

  return { pitches, isLive, loading, updateLikes, addPitch, uploadImage, recordView, reload: load };
}
