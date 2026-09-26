# QuitTogether

A competitive quit-smoking dashboard for two friends. Log daily cigarettes, track smoke-free streaks, and compete head-to-head.

## Stack

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **Deploy:** Heroku

## Local Setup

### Prerequisites

- Node.js 18+
- PostgreSQL

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

## Deploy to Heroku

```bash
heroku login
heroku create your-app-name
heroku addons:create heroku-postgresql:essential-0
heroku config:set JWT_SECRET=your-long-random-secret
heroku config:set NODE_ENV=production
git push heroku main
```

Heroku runs `heroku-postbuild` to build the React client. The Express server serves the built app and API from a single dyno.

### Post-deploy

Open the app, create two accounts (first without invite code, second with invite code), and start logging.

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
