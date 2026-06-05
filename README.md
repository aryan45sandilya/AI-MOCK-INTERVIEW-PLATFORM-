# InterviewAI 🧠 — AI-Powered Mock Interview Platform

> Ace your next interview with AI-powered mock interviews, real-time feedback, emotion analysis, and comprehensive performance reports.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![InterviewAI Platform](https://via.placeholder.com/800x400/8b5cf6/ffffff?text=InterviewAI+Platform)

---

## ✨ Features

- 🤖 **AI-Powered Questions** — Gemini 2.5 & GPT-4o generate tailored interview questions
- 🎤 **Voice Answers** — Speech-to-text transcription via OpenAI Whisper
- 📹 **Emotion Analysis** — Real-time confidence, eye contact, and attention tracking
- 💻 **Live Coding Round** — Monaco Editor with multi-language support & Judge0 execution
- 📄 **Resume-Based Questions** — Upload PDF resume for personalized questions
- 📊 **Detailed Reports** — Comprehensive feedback with scores, radar charts, and improvement roadmap
- 🎨 **Modern UI** — Sleek design with dark mode, animations, and responsive layouts
- 🔐 **Secure Auth** — Clerk authentication with user management
- 📈 **Analytics Dashboard** — Track progress, scores, and interview history

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (Neon recommended)
- API Keys: Clerk, Google Gemini, OpenAI

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/aryan45sandilya/AI-MOCK-INTERVIEW-PLATFORM.git
cd AI-MOCK-INTERVIEW-PLATFORM

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Fill in all required API keys and URLs

# 4. Initialize database
npm run db:push

# 5. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔧 Environment Variables

Create a `.env.local` file with the following:

```env
# Database
DATABASE_URL=postgresql://user:password@host/database

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# AI APIs
GOOGLE_GENERATIVE_AI_API_KEY=...           # Google Gemini
OPENAI_API_KEY=sk-...                      # OpenAI GPT-4o & Whisper

# Code Execution (Optional)
RAPIDAPI_KEY=...                           # Judge0 on RapidAPI

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

---

## 📦 Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **UI Library** | ShadCN UI, Radix UI, Lucide Icons |
| **Authentication** | Clerk |
| **Database** | PostgreSQL (Neon), Drizzle ORM |
| **AI/ML** | Google Gemini 2.5, OpenAI GPT-4o, Whisper |
| **Real-time** | Socket.IO, WebRTC |
| **Code Execution** | Judge0 API, Monaco Editor |
| **Deployment** | Docker, Vercel |

---

## 📁 Project Structure

```
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth pages (sign-in, sign-up)
│   ├── (dashboard)/         # Protected dashboard routes
│   │   ├── dashboard/       # Main dashboard
│   │   ├── interviews/      # Interview management
│   │   │   ├── new/         # Create interview
│   │   │   └── [id]/
│   │   │       ├── room/    # Live interview room
│   │   │       └── report/  # Interview report
│   │   ├── analytics/       # Analytics & insights
│   │   ├── resume/          # Resume management
│   │   ├── coding/          # Coding practice
│   │   └── settings/        # User settings
│   ├── api/                 # API routes
│   │   ├── interviews/      # Interview CRUD
│   │   ├── answers/         # Answer submission
│   │   ├── speech/          # Speech-to-text
│   │   ├── emotion/         # Emotion analysis
│   │   ├── code/            # Code execution
│   │   └── webhooks/        # Clerk webhooks
│   └── page.tsx            # Landing page
├── components/              # React components
│   ├── ui/                 # ShadCN UI components
│   ├── interviews/         # Interview components
│   ├── dashboard/          # Dashboard components
│   ├── emotion/            # Emotion analysis
│   └── coding/             # Code editor
├── lib/                    # Utilities & helpers
│   ├── ai/                 # AI integration
│   ├── db/                 # Database schema
│   └── utils.ts            # Helper functions
├── server/                 # Express + Socket.IO server
└── types/                  # TypeScript types
```

---

## 🗄️ Database Schema

**Tables:**
- `users` — User profiles synced from Clerk
- `interviews` — Interview sessions
- `questions` — Generated questions per interview
- `answers` — User answers with AI scores
- `emotion_records` — Emotion analysis data
- `resumes` — Uploaded resume metadata
- `interview_reports` — Final reports with feedback

**Commands:**
```bash
npm run db:push      # Push schema to database
npm run db:generate  # Generate migrations
npm run db:studio    # Open Drizzle Studio
```

---

## 🐳 Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build separately
docker build -t interviewai .
docker run -p 3000:3000 --env-file .env.local interviewai
```

---

## 🔗 Clerk Webhook Setup

1. Go to [Clerk Dashboard](https://dashboard.clerk.com/) → **Webhooks**
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy signing secret → `CLERK_WEBHOOK_SECRET` in `.env.local`

---

## 📝 Important Files to Push

**✅ Include:**
```
├── app/                    # All application code
├── components/             # React components
├── lib/                    # Utilities
├── server/                 # Backend server
├── types/                  # TypeScript types
├── public/                 # Public assets (except uploads/)
├── .env.example            # Template for env vars
├── .gitignore              
├── docker-compose.yml
├── Dockerfile
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

**❌ Exclude (automatically via .gitignore):**
```
node_modules/               # Dependencies (heavy!)
.next/                      # Build output
.env.local                  # Secrets!
.env                        # Secrets!
public/uploads/             # User uploads
lib/db/migrations/          # Generated files
*.log                       # Log files
.DS_Store                   # macOS files
```

---

## 🛠️ Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run db:push      # Push database schema
npm run db:studio    # Open Drizzle Studio
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Aryan Sandilya**

- GitHub: [@aryan45sandilya](https://github.com/aryan45sandilya)
- Project: [AI Mock Interview Platform](https://github.com/aryan45sandilya/AI-MOCK-INTERVIEW-PLATFORM)

---

## 🙏 Acknowledgments

- Next.js Team for the amazing framework
- Clerk for authentication
- Google & OpenAI for AI APIs
- Vercel for deployment platform
- All open-source contributors

---

<div align="center">
  <strong>Built with ❤️ using Next.js 15 & AI</strong>
  <br />
  <sub>Star ⭐ this repo if you found it helpful!</sub>
</div>
