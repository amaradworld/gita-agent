# Gita Gyan — AI Spiritual Guide

AI-powered spiritual mentor combining Bhagavad Gita wisdom with modern AI. Supports 9 Indian languages, 5 scholarly commentaries, and 20+ wellness features.

**Live:** [gita-agent.vercel.app](https://gita-agent.vercel.app) · **Backend:** [gita-agent.onrender.com](https://gita-agent.onrender.com)

---

## Features

| Category | Features |
|----------|----------|
| **AI Chat** | Emotional guidance, verse matching, RAG from ISKCON Bhagavad Gita, dual LLM (OpenAI + Gemini) |
| **Daily Wisdom** | Daily verse rotation, verse search, chapter browser |
| **Wellness** | Mood tracking, journaling, guided meditation (4 types), emergency calm mode |
| **Learning** | 4 structured learning paths, quiz (21 questions), character assessment |
| **Community** | Anonymous reflections, daily prompts, likes, replies |
| **Premium** | Ask Krishna mode, debate mode, story mode, verse cards, bookmarks |
| **Multilingual** | 9 Indian languages (EN, HI, TA, TE, MR, BN, KN, GU, ML) |
| **Voice** | TTS in 9 languages, speech recognition input, Sanskrit pronunciation |
| **Gamification** | 19 achievements, 12 daily challenges, streak tracking |

## Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, i18next
- **Backend:** Express.js (ESM), Node.js
- **Database:** Supabase (PostgreSQL) — optional, falls back to in-memory
- **Auth:** JWT + Email OTP
- **Payments:** Razorpay (₹149/mo, ₹1,499/yr)
- **AI:** OpenAI GPT-4o-mini + Google Gemini 2.0 Flash (dual fallback)
- **TTS:** Google Translate TTS (free, 9 languages)
- **RAG:** 235 chunks from ISKCON Bhagavad Gita As It Is

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Add your API keys
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | No | Supabase project URL (enables database) |
| `SUPABASE_ANON_KEY` | No | Supabase anon key |
| `SUPABASE_SERVICE_KEY` | No | Supabase service role key |
| `JWT_SECRET` | Yes | JWT signing secret (64+ chars) |
| `OPENAI_API_KEY` | One required | OpenAI API key |
| `GEMINI_API_KEY` | One required | Google Gemini API key |
| `RAZORPAY_KEY_ID` | No | Razorpay test/live key |
| `RAZORPAY_KEY_SECRET` | No | Razorpay secret |
| `VAPID_PUBLIC_KEY` | No | Web push public key |
| `VAPID_PRIVATE_KEY` | No | Web push private key |
| `FRONTEND_URL` | No | Frontend URL (default: gita-agent.vercel.app) |

## Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Paste contents of `backend/supabase/schema.sql`
4. Run the query
5. Add `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` to `.env`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/chat` | AI chat |
| POST | `/api/session/new` | Create chat session |
| GET | `/api/chapters` | List 18 chapters |
| GET | `/api/verses` | Search verses |
| GET | `/api/sanskrit/:ch/:v` | Sanskrit pronunciation audio |
| POST | `/api/auth/signup` | Create account |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment |
| GET | `/api/mentor/daily-verse` | Daily verse |
| POST | `/api/mentor/scenario` | Life guidance |
| POST | `/api/mentor/mood` | Mood-based verses |
| POST | `/api/mentor/ask-krishna` | Structured Krishna response |
| POST | `/api/mentor/journal` | Journal entry |
| POST | `/api/mentor/quiz/start` | Start quiz |
| GET | `/api/mentor/learning-paths` | Learning paths |
| GET | `/api/mentor/meditations` | Guided meditations |
| GET | `/api/mentor/emergency-calm` | Crisis support |
| GET | `/api/mentor/stories` | Wisdom stories |
| POST | `/api/mentor/debate` | Multi-perspective analysis |

## License

Private — All rights reserved.
