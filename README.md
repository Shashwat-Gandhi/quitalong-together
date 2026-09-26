# QuitTogether

A competitive quit-smoking dashboard for two friends. Log daily cigarettes, track smoke-free streaks, and compete head-to-head.

## Live app

**https://quitalong-together.onrender.com**

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (Neon — free tier)
- **Hosting:** Render — free web service

## Cost

- **Neon:** $0 (free tier, scales to zero when idle)
- **Render:** $0 (free tier, sleeps after 15 min inactivity)
- **Total:** $0/month for light personal use

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL (or a free Neon database URL)

### 1. Install dependencies

```bash
npm install
npm install --prefix client
```

### 2. Configure environment

Copy `.env.example` to `.env` and set:

```
DATABASE_URL=postgresql://localhost:5432/quitalong
JWT_SECRET=your-long-random-secret
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Create database and migrate

```bash
createdb quitalong
npm run migrate
```

### 4. Run development servers

```bash
npm run dev
```

- Frontend: http://localhost:5173
- API: http://localhost:3001

## Usage

1. **User A** signs up without an invite code → gets a 6-character invite code.
2. **User B** signs up with that invite code → joins the same pair.
3. Both users log cigarettes daily on **Log Today** or from the dashboard.
4. Compete on current streak, longest streak, and monthly totals.

## Deploy (Neon + Render)

### 1. Neon database (free)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a project and copy the **connection string**
3. Run migrations locally:

```bash
DATABASE_URL="your-neon-connection-string" npm run migrate
```

### 2. Render web service (free)

1. Push this repo to GitHub
2. Sign up at [render.com](https://render.com) and connect GitHub
3. Create a **Web Service** from the repo (or use the included `render.yaml` blueprint)
4. Set environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | A long random string |

5. Build command: `npm install && npm run render-build`
6. Start command: `npm start`
7. Plan: **Free**

Render auto-deploys on every push to `main`.

## API Overview

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/signup` | Create account (optional `inviteCode`) |
| `POST /api/auth/login` | Sign in |
| `GET /api/stats/dashboard` | Dashboard stats and week chart |
| `PUT /api/logs/today` | Save today's cigarette count |

## Streak Rules

- A smoke-free day requires logging **0 cigarettes** for that day.
- Current streak counts consecutive smoke-free days; today counts only after logging 0.
- Unlogged days in the past do not extend a streak.
