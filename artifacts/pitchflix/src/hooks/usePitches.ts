import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { Pitch } from "@/types";

const FALLBACK =
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=70&auto=format&fit=crop";

export const MOCK_PITCHES: Pitch[] = [
  { id:"1",  title:"Scarlet Dawn",        genre:"Action",    year:2024, likes:1243, rating:5, trending:true,  image:"https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&q=70&auto=format&fit=crop", logline:"An ex-soldier uncovers a corporate conspiracy that threatens to ignite World War III." },
  { id:"2",  title:"The Last Monsoon",    genre:"Drama",     year:2023, likes:987,  rating:5, trending:false, image:"https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=70&auto=format&fit=crop", logline:"A family torn apart by ambition must reunite before a catastrophic storm destroys everything." },
  { id:"3",  title:"Lagos Nights",        genre:"Nollywood", year:2024, likes:2105, rating:5, trending:true,  image:"https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=400&q=70&auto=format&fit=crop", logline:"A rising musician navigates love, betrayal, and destiny in the pulsing heart of Lagos." },
  { id:"4",  title:"Quantum Break",       genre:"Sci-Fi",    year:2024, likes:1876, rating:4, trending:true,  image:"https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=400&q=70&auto=format&fit=crop", logline:"A physicist discovers time is collapsing and must sacrifice everything to reset the universe." },
  { id:"5",  title:"Paper Hearts",        genre:"Romance",   year:2023, likes:734,  rating:4, trending:false, image:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=70&auto=format&fit=crop", logline:"Two rivals discover love letters from the 1940s that mirror their own story." },
  { id:"6",  title:"Dead Signal",         genre:"Horror",    year:2024, likes:1456, rating:4, trending:true,  image:"https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=400&q=70&auto=format&fit=crop", logline:"Friends receive voicemails from their future selves — all warning of the same fate." },
  { id:"7",  title:"Concrete Kings",      genre:"Drama",     year:2023, likes:892,  rating:4, trending:false, image:"https://images.unsplash.com/photo-1502920917128-1aa500764b12?w=400&q=70&auto=format&fit=crop", logline:"Five childhood friends from the projects choose between loyalty and survival." },
  { id:"8",  title:"The Perfect Heist",   genre:"Thriller",  year:2024, likes:1621, rating:5, trending:true,  image:"https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=70&auto=format&fit=crop", logline:"A master thief plans the impossible — stealing the world's most valuable secret." },
  { id:"9",  title:"Dad's Cooking Again", genre:"Comedy",    year:2023, likes:543,  rating:4, trending:false, image:"https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&q=70&auto=format&fit=crop", logline:"A widowed father attempts to win a reality cooking show with catastrophically disastrous results." },
  { id:"10", title:"Iron Meridian",       genre:"Action",    year:2024, likes:1102, rating:4, trending:false, image:"https://images.unsplash.com/photo-1559038555-d2a10979a0e8?w=400&q=70&auto=format&fit=crop", logline:"A disgraced general leads a ragtag army to defend the last free city on Earth." },
  { id:"11", title:"Abuja Royals",        genre:"Nollywood", year:2024, likes:1789, rating:5, trending:true,  image:"https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=400&q=70&auto=format&fit=crop", logline:"A royal family's ancient secret threatens the most powerful dynasty in West Africa." },
  { id:"12", title:"Echoes in the Dark",  genre:"Thriller",  year:2023, likes:965,  rating:4, trending:false, image:"https://images.unsplash.com/photo-1458501534264-7d326fa0ca04?w=400&q=70&auto=format&fit=crop", logline:"A blind detective solves crimes using only sound — until a killer hunts her through silence." },
];

function parseRow(r: Record<string, unknown>): Pitch {
  return {
    id:        String(r.id),
    title:     String(r.title),
    genre:     (r.genre as string) || "Drama",
    year:      (r.year as number) || new Date((r.created_at as string) || Date.now()).getFullYear(),
    likes:     (r.likes as number) || 0,
    rating:    (r.rating as number) || 4,
    trending:  Boolean(r.trending),
    image:     (r.image as string) || FALLBACK,
    logline:   (r.logline as string) || "",
    user_id:   r.user_id as string | undefined,
    created_at: r.created_at as string | undefined,
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
        .order("created_at", { ascending: false });
      if (error) throw error;
      setPitches((data || []).map(parseRow));
      setIsLive(true);
    } catch {
      setPitches(MOCK_PITCHES.map((m) => ({ ...m })));
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!supabase) return;
    const channelName = `pitches-rt-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pitches" },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            const u = payload.new as Record<string, unknown>;
            setPitches((prev) =>
              prev.map((p) =>
                p.id === String(u.id) ? { ...p, likes: (u.likes as number) || 0 } : p
              )
            );
          } else {
            loadRef.current();
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, []);

  const updateLikes = useCallback(async (id: string, newLikes: number) => {
    setPitches((prev) =>
      prev.map((p) => (p.id === id ? { ...p, likes: newLikes } : p))
    );
    if (!supabase) return;
    try {
      await supabase.from("pitches").update({ likes: newLikes }).eq("id", id);
    } catch (e) {
      console.warn("Like update failed:", e);
    }
  }, []);

  const addPitch = useCallback(
    async (
      pitch: Omit<Pitch, "id" | "likes" | "rating" | "trending">,
      userId?: string
    ): Promise<{ id: string }> => {
      if (!supabase) {
        const id = String(Date.now());
        setPitches((prev) => [
          { ...pitch, id, likes: 0, rating: 4, trending: false },
          ...prev,
        ]);
        return { id };
      }

      const payload: Record<string, unknown> = {
        title:   pitch.title,
        genre:   pitch.genre,
        image:   pitch.image,
        likes:   0,
        year:    pitch.year,
        logline: pitch.logline,
      };
      if (userId) payload.user_id = userId;

      let result = await supabase
        .from("pitches")
        .insert([payload])
        .select("id")
        .single();

      if (result.error?.code === "42703" && userId) {
        delete payload.user_id;
        result = await supabase
          .from("pitches")
          .insert([payload])
          .select("id")
          .single();
      }

      if (result.error) throw result.error;
      await load();
      return { id: String(result.data.id) };
    },
    [load]
  );

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    if (!supabase) return null;
    try {
      const ext  = file.name.split(".").pop() || "jpg";
      const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from("posters")
        .upload(name, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("posters").getPublicUrl(name);
      return data.publicUrl;
    } catch (e) {
      console.warn("Upload failed:", e);
      return null;
    }
  }, []);

  return { pitches, isLive, loading, updateLikes, addPitch, uploadImage, reload: load };
}
