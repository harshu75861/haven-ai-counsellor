# Haven AI Counsellor

Luxury full-stack AI career counselling platform for consultancy businesses.

## What It Includes

- Conversational AI counsellor with dynamic discovery questions
- Career recommendations with salary, demand, growth, and fit rationale
- Skill gap reports with free and paid course suggestions
- Study abroad guidance for UK, Canada, Australia, Germany, and USA pathways
- Job matching with application-ready lead capture
- ATS resume builder and role-specific tailoring
- Mock interview practice with structured feedback
- Admin dashboard for users, leads, and conversion tracking
- OpenAI-ready service with local fallback intelligence for development

## Stack

- Frontend: React, Vite, Tailwind CSS, lucide-react
- Backend: Node.js, Express
- Database-ready storage: local JSON for development, swappable repository layer for PostgreSQL or MongoDB
- AI: OpenAI Chat Completions-compatible integration via `OPENAI_API_KEY`

## Quick Start

```bash
npm install
npm run dev
```

Client: http://localhost:5173

API: http://localhost:10000

## Environment

Create `server/.env`:

```bash
PORT=10000
CLIENT_ORIGIN=http://localhost:5173
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4.1-mini
DATA_DIR=./data
```

If `OPENAI_API_KEY` is not set, Haven uses deterministic local counselling logic so the product remains fully usable.

## Deployment

- Deploy `client` to Vercel.
- Deploy `server` to Render or any Node host. A `render.yaml` blueprint is included.
- Set `VITE_API_URL` in the client deployment to your API URL.
- Replace the JSON storage adapter in `server/src/storage/repository.js` with PostgreSQL or MongoDB while keeping the route contracts unchanged.

## Production Routes

- Backend health: `/health`
- Chat: `/api/chat` and `/chat`
- Career recommendations/profile intake: `/api/users` and `/career-recommendations`
- Resume: `/api/resume` and `/resume`
- Interview: `/api/interview` and `/interview`
- Admin metrics: `/api/admin` and `/admin`
