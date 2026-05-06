export interface Pitch {
  id: string;
  title: string;
  genre: string;
  year: number;
  likes: number;
  rating: number;
  trending: boolean;
  image: string;
  logline: string;
  user_id?: string;
  created_at?: string;
}
