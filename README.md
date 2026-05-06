🎬 PitchFlix — Real-Time Movie Pitch SaaS

A full-stack, real-time movie pitch sharing platform built with React + Supabase.
Users can sign up, create movie ideas, upload images, and get instant engagement through live likes and realtime updates.

🚀 Live Features
⚛️ Modern React (Vite) frontend
🔐 Supabase Authentication (email/password)
⚡ Real-time database updates (Supabase Realtime)
🖼️ Image upload system (Supabase Storage)
❤️ Live likes system
👤 User-specific dashboards
🎯 Protected routes (auth-based access)
🎬 Creator-style pitch posting system
📱 Fully responsive UI (mobile + desktop)
🧠 Product Vision

PitchFlix is a creator economy platform for movie ideas.

Users can:

Share movie pitch concepts
Upload posters / visuals
Gain engagement through likes
Build a creative profile over time

Think:

“Product Hunt × IMDb × TikTok for movie ideas”

⚙️ Tech Stack
Frontend: React (Vite)
Styling: Tailwind CSS
Backend: Supabase
Auth: Supabase Auth
Database: PostgreSQL (Supabase)
Realtime: Supabase Realtime Channels
Storage: Supabase Buckets
Routing: Wouter
UI Icons: Lucide React
Notifications: Sonner
📁 Project Structure
/src
  /components
    Navbar
    Hero
    PitchCard
    PitchGrid
    AuthModal
    CreatePitchModal
    FilterBar

  /pages
    Home
    Dashboard

  /context
    AuthContext

  /hooks
    usePitches

  /lib
    supabase

  App.tsx
  main.tsx
🔐 Authentication System
Email/password signup & login
Persistent sessions
Auth-protected routes
User session stored globally via Context API
User Permissions
Role	Permissions
Guest	View pitches
User	Create + like + upload
Creator	Full dashboard access
⚡ Realtime System

PitchFlix uses Supabase Realtime to sync updates instantly:

New pitches appear instantly
Likes update live across all users
Deletes reflect immediately

No refresh required.

🖼️ Image Uploads
Upload pitch posters via Supabase Storage
Fallback support (URL input)
Public bucket configuration required
❤️ Engagement System
Users can like pitches
Trending logic supported
Real-time UI updates
👤 Dashboard

Each user has a personal dashboard:

Their created pitches
Account overview
Authenticated access only
🔒 Security
Row Level Security (RLS) enabled
Users can only modify their own data
Secure Supabase API usage
Protected frontend routes
🧪 Key Features Implemented
Real-time Supabase channel (fixed StrictMode duplication)
Unique channel subscription per mount
Clean React migration from legacy JS
Fully modular component system
Optimized hooks architecture
Live database connection confirmed
🧱 Database Schema
create table pitches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  title text not null,
  genre text,
  description text,
  image_url text,
  likes int default 0,
  created_at timestamp default now()
);
⚡ Setup Instructions
1. Clone repo
git clone https://github.com/yourusername/pitchflix.git
cd pitchflix
2. Install dependencies
npm install
3. Add environment variables
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
4. Run development server
npm run dev
📈 What Makes This Special

PitchFlix is not just a CRUD app.

It demonstrates:

Real-time architecture
Auth-driven UX
Creator economy mechanics
Scalable SaaS structure
Production-ready React patterns
🚀 Future Roadmap
💰 Stripe payments (creator monetization)
🔔 Notifications system
👥 Follow system (social layer)
🏆 Trending algorithm v2
📊 Creator analytics dashboard
🌍 Deployment (Vercel + Supabase production)
🧠 Architecture Summary

This project was migrated from a vanilla JS prototype into a:

Fully structured, real-time SaaS-grade React application powered by Supabase

📷 UI Status
Live DB connected ✅
Realtime sync active ⚡
Auth system working 🔐
3+ pitches loading dynamically 🎬
No runtime errors 🟢
👨‍💻 Author

Built as part of a full SaaS migration sprint using React + Supabase architecture.
