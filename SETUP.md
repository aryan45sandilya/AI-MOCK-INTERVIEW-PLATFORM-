# Setup Guide

## Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) PostgreSQL database (free tier works)
- A [Clerk](https://clerk.com) account (free tier works)
- A [Google AI Studio](https://aistudio.google.com) API key (Gemini)
- An [OpenAI](https://platform.openai.com) API key (Whisper + GPT-4o)

---

## Step 1 — Install dependencies

```bash
npm install --legacy-peer-deps
```

`--legacy-peer-deps` is needed because some Radix UI packages have peer-dep ranges
that are slightly behind the installed React 19 version.

---

## Step 2 — Fill in environment variables

Open `.env.local` and replace every `REPLACE_ME` value:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon dashboard → Connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk dashboard → API Keys |
| `CLERK_SECRET_KEY` | Clerk dashboard → API Keys |
| `CLERK_WEBHOOK_SECRET` | Clerk dashboard → Webhooks (see below) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `RAPIDAPI_KEY` | Optional — RapidAPI → Judge0 CE (enables multi-language code execution) |

---

## Step 3 — Push the database schema

```bash
npm run db:push
```

This creates all six tables in your Neon database using Drizzle ORM.

---

## Step 4 — Configure Clerk Webhook (optional but recommended)

1. Go to Clerk Dashboard → **Webhooks** → **Add Endpoint**
2. URL: `https://your-domain/api/webhooks/clerk`  
   (use [ngrok](https://ngrok.com) for local development)
3. Subscribe to: `user.created`, `user.updated`, `user.deleted`
4. Copy the **Signing Secret** → paste as `CLERK_WEBHOOK_SECRET`

Without the webhook, users are auto-created in the DB on first API call.

---

## Step 5 — Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Step 6 — (Optional) Run the Express / Socket.IO server

The Express server adds real-time WebRTC signalling. Most features work without it.

```bash
cd server
npm install
npm run dev
```

---

## Docker (production)

```bash
# Copy and fill env file first
cp .env.local .env

docker-compose up --build
```

Frontend → http://localhost:3000  
API Server → http://localhost:3001

---

## Feature Checklist

| Feature | Status | Notes |
|---|---|---|
| Sign up / Sign in | ✅ | Clerk |
| Dashboard | ✅ | Stats, recent interviews |
| Create interview | ✅ | 4-step wizard |
| AI question generation | ✅ | Gemini 2.5 Flash |
| Live interview room | ✅ | Text + voice answers |
| Speech-to-text | ✅ | OpenAI Whisper |
| Emotion analysis overlay | ✅ | Simulated; wire in MediaPipe for production |
| Code editor + execution | ✅ | Monaco + JS sandbox / Judge0 |
| Resume upload & parsing | ✅ | PDF → extracted text |
| AI answer evaluation | ✅ | Gemini scores each answer |
| Interview report | ✅ | Radar chart, strengths, improvements |
| Analytics dashboard | ✅ | Recharts — score history, type breakdown |
| Dark mode | ✅ | System / light / dark |
| Responsive UI | ✅ | Mobile-first |
| Docker | ✅ | Multi-stage Dockerfile + Compose |
