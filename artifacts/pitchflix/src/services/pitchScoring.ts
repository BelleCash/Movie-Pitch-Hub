import type { Pitch } from "@/types";

export interface PitchScore {
  overall: number;
  clarity: number;
  originality: number;
  marketPotential: number;
  engagement: number;
  risk: number;
  fundingProbability: "Low" | "Medium" | "High" | "Very High";
  riskLevel: "Low" | "Medium" | "High";
  label: string;
}

const HIGH_POTENTIAL_GENRES = ["Sci-Fi", "Thriller", "Action", "Nollywood"];
const TRENDING_GENRES = ["Nollywood", "Action", "Thriller"];

export function scorePitch(pitch: Pitch): PitchScore {
  const tagCount = pitch.tags?.length ?? 0;
  const hasSynopsis = (pitch.synopsis?.length ?? 0) > 60;
  const hasVideo = !!pitch.video_url;
  const likes = pitch.likes ?? 0;
  const views = (pitch as { views?: number }).views ?? 0;
  const comments = (pitch as { comment_count?: number }).comment_count ?? 0;

  const clarity = Math.min(100,
    (pitch.logline?.length ?? 0) > 40 ? 30 : 10,
    + (hasSynopsis ? 35 : 0),
    + (pitch.title?.length > 3 ? 20 : 0),
    + (tagCount >= 3 ? 15 : tagCount * 5)
    + (hasVideo ? 20 : 0)
    + 10
  );

  const originality = Math.min(100,
    (TRENDING_GENRES.includes(pitch.genre) ? 25 : 15)
    + (tagCount > 4 ? 20 : tagCount * 4)
    + (hasSynopsis ? 20 : 0)
    + (hasVideo ? 15 : 0)
    + Math.min(20, Math.floor(likes / 100) * 5)
  );

  const engagement = Math.min(100,
    Math.min(40, Math.floor(likes / 60) * 5)
    + Math.min(25, Math.floor(views / 30) * 3)
    + Math.min(20, comments * 8)
    + (pitch.trending ? 15 : 0)
  );

  const marketPotential = Math.min(100,
    (HIGH_POTENTIAL_GENRES.includes(pitch.genre) ? 30 : 18)
    + (pitch.trending ? 20 : 0)
    + (tagCount >= 2 ? 15 : 0)
    + Math.min(35, Math.floor(likes / 80) * 5)
  );

  const rawRisk = Math.min(100,
    (hasSynopsis ? 0 : 20)
    + (tagCount === 0 ? 15 : 0)
    + (!hasVideo ? 10 : 0)
    + Math.max(0, 30 - Math.floor(likes / 40) * 5)
  );
  const risk = 100 - rawRisk;

  const overall = Math.round((clarity * 0.2 + originality * 0.2 + engagement * 0.25 + marketPotential * 0.2 + risk * 0.15));

  const fundingProbability: PitchScore["fundingProbability"] =
    overall >= 80 ? "Very High" : overall >= 65 ? "High" : overall >= 45 ? "Medium" : "Low";

  const riskLevel: PitchScore["riskLevel"] =
    rawRisk >= 35 ? "High" : rawRisk >= 15 ? "Medium" : "Low";

  const label =
    overall >= 85 ? "Exceptional" :
    overall >= 75 ? "Strong" :
    overall >= 60 ? "Promising" :
    overall >= 45 ? "Developing" : "Early Stage";

  return {
    overall,
    clarity: Math.round(Math.min(100, clarity)),
    originality: Math.round(Math.min(100, originality)),
    marketPotential: Math.round(Math.min(100, marketPotential)),
    engagement: Math.round(Math.min(100, engagement)),
    risk: Math.round(Math.min(100, risk)),
    fundingProbability,
    riskLevel,
    label,
  };
}
