🎬 PitchFlix — Real-Time Movie Pitch SaaS

A real-time, creator economy SaaS platform where users submit movie ideas (“pitches”), gain engagement through likes, and build creative profiles — with investor tracking and monetization architecture built in.

Think:

Product Hunt × IMDb × TikTok for movie ideas

🚀 Overview

PitchFlix is a full-stack SaaS platform built with React + Supabase, designed for real-time interaction, creator monetization, and investor discovery of trending film concepts.

Users can:

Submit movie pitches
Upload images / posters
Gain real-time engagement
Build creator profiles
Investors can track trending ideas (Investor Mode)
🟣 Product Vision

“Where movie ideas become investable opportunities.”

PitchFlix transforms creative concepts into:

Social assets (likes + engagement)
Creator profiles
Investor-tracked opportunities
⚡ Live Features
⚛️ Frontend
React (Vite) SaaS architecture
Purple-themed modern UI (indigo/violet system)
Fully responsive (mobile + desktop)
Component-based scalable structure

🔐 Authentication (Supabase)
Email/password login
Persistent sessions
Role-based system:
Viewer
User
Creator
Investor (Investor Mode)

⚡ Real-Time System
Supabase Realtime subscriptions
Instant updates:
New pitches appear live
Likes update instantly
Feed syncs automatically

🖼️ Image System
Supabase Storage integration
Poster upload per pitch
Fallback URL support

❤️ Engagement System
Like system with real-time updates
Trending-ready architecture
Foundation for recommendation engine

📊 Investor Mode (NEW)
Investor dashboard
Trending pitch discovery
Watchlist system
KPI-based insights (engagement, traction)

💳 Monetization Layer (Architecture Ready)

Subscription tiers:

Free
Starter
Pro
Studio

Billing system supports:

Paystack (Africa-ready)
Lemon Squeezy (global SaaS)
Stripe (future-ready)
Paddle (enterprise-ready)
🧠 Architecture Philosophy

PitchFlix is built as a real SaaS system, not a demo:

Supabase-first backend
Provider-agnostic billing system
Role-based access control
Real-time data architecture
Scalable React component structure
⚙️ Tech Stack

Frontend

React (Vite)
Tailwind CSS
Lucide Icons

Backend

Supabase (PostgreSQL)
Supabase Auth
Supabase Realtime
Supabase Storage

Architecture

Context API (state management)
Hooks-based API layer
Modular component system
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
    Pricing
    Investor

  /context
    AuthContext

  /hooks
    usePitches
    useAuth

  /lib
    supabase

  App.tsx
  main.tsx
  
🗄️ Database Schema
Core Table
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
SaaS Data Layer (Extended Architecture)

Planned / in progress tables:

profiles → user identity + role + subscription tier
subscriptions → billing + provider tracking
pitch_likes → engagement tracking (one-like-per-user)
investor_watchlists → saved pitches for investors
⚡ Real-Time System

Supabase Realtime enables:

Instant pitch updates
Live likes sync
No page refresh required
Event-driven UI updates

🔐 Security
Row Level Security (RLS) enabled
Users can only modify their own data
Protected frontend routes
Secure Supabase API access

👤 User Roles
Role	Permissions
Viewer	Browse pitches
User	Like content
Creator	Upload + manage pitches
Investor	Track + analyze trending ideas
📊 Dashboard System

Each user gets:

Personal pitch list
Engagement metrics
Creator analytics
Investor insights (if enabled)

🎨 UI System
Purple SaaS design system
Glassmorphism cards
Cinematic feed layout
Smooth animations
Mobile-first responsive design

🧪 Key Technical Highlights
Real-time Supabase channels (stable subscriptions)
Optimized React hooks architecture
Modular SaaS component design
Clean role-based UX system
Scalable backend schema
Provider-agnostic billing layer

🚀 Setup Instructions
git clone https://github.com/yourusername/pitchflix.git
cd pitchflix
npm install
Environment Variables
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
Run Development Server
npm run dev
📈 What Makes PitchFlix Special

PitchFlix is not a CRUD app.

It demonstrates:

Real-time SaaS architecture
Creator economy mechanics
Investor tracking system
Role-based monetization design
Production-grade React patterns
🧭 Current Status
✅ Completed
React SaaS frontend
Supabase integration
Auth system
Real-time feed
Pitch creation system
Like system
Investor UI
Pricing system
Billing abstraction layer
🚧 In Progress
Payment gateway integration (Paystack / Lemon Squeezy)
Advanced analytics engine
Recommendation system
Notifications system
Production hardening
🧠 System Summary

PitchFlix has evolved into:

A real-time, creator economy SaaS platform with investor discovery, engagement-driven ranking, and scalable monetization architecture.

🚀 Future Roadmap
AI pitch scoring system
Viral ranking algorithm v2
Creator revenue sharing
Studio matchmaking system
Global investor marketplace
👨‍💻 Author

Built as part of a SaaS migration sprint using:

React + Supabase + real-time architecture principles
