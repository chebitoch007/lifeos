# LifeOS

A Solo Leveling-inspired personal progress dashboard. Level up your life by completing quests, building habits, and tracking growth across six core stats.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript strict, Tailwind CSS, shadcn/ui, Recharts |
| Backend | FastAPI, Python 3.12, SQLAlchemy 2.0, Alembic, Celery |
| Database | PostgreSQL 16 + Redis 7 |
| Auth | Auth.js v5 (frontend) + JWT (backend) |
| Deployment | Docker + Coolify |

## Features

- **Six life stats** — Fitness, Coding, Learning, Finances, Communication, Discipline
- **Quest system** — Create quests with XP rewards, difficulty tiers (Easy → Legendary), and stat progression
- **Habit engine** — Daily and weekly habits with streak tracking and automatic XP
- **Achievement system** — 12 unlockable badges tied to real milestones
- **Analytics dashboard** — XP over time, stat radar chart, quest completion rate, streak summary
- **Dark game-HUD UI** — Cinematic dark theme with electric blue/purple accents and glow effects

## Development

```bash
# 1. Copy and fill in environment variables
cp .env.example .env
# Edit .env — see SECRETS.md for generation commands

# 2. Start all services
docker-compose up --build

# 3. Services available at:
#    Frontend:  http://localhost:3000
#    Backend:   http://localhost:8000
#    API docs:  http://localhost:8000/api/docs
```

## Running migrations manually

```bash
docker-compose exec backend alembic upgrade head
```

## Running the streak maintenance task manually

```bash
docker-compose exec celery-worker \
  celery -A worker.celery_app call tasks.habits.check_broken_streaks
```

## Project structure

```
lifeos/
├── backend/
│   ├── main.py              # FastAPI app, CORS, routers
│   ├── auth.py              # JWT utilities, get_current_user
│   ├── config.py            # Pydantic Settings
│   ├── database.py          # Async SQLAlchemy engine
│   ├── worker.py            # Celery app
│   ├── celeryconfig.py      # Celery Beat schedule
│   ├── entrypoint.sh        # Migration runner (production)
│   ├── models/              # SQLAlchemy ORM models (10 tables)
│   ├── schemas/             # Pydantic request/response schemas
│   ├── services/            # Business logic layer
│   ├── routers/             # FastAPI route handlers
│   ├── tasks/               # Celery background tasks
│   ├── seeds/               # Database seed data
│   └── alembic/             # Database migrations
├── frontend/
│   └── src/
│       ├── app/             # Next.js 14 app router pages
│       ├── components/      # React components
│       └── lib/             # Utilities, types, constants
├── docker-compose.yml       # Development environment
├── docker-compose.prod.yml  # Production environment
└── coolify.md               # Coolify deployment guide
```

## Production deployment

See [coolify.md](./coolify.md) for full Coolify deployment instructions.

## API

Interactive API documentation is available at `/api/docs` (Swagger UI) when the backend is running.

Key endpoints:

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/token` | Login (returns JWT) |
| `GET` | `/api/auth/me` | Current user |
| `GET` | `/api/users/{id}/stats` | Get all 6 stats |
| `POST` | `/api/quests` | Create quest |
| `POST` | `/api/quests/{id}/complete` | Complete quest (awards XP) |
| `POST` | `/api/habits` | Create habit |
| `POST` | `/api/habits/{id}/log` | Log habit (awards XP + updates streak) |
| `GET` | `/api/analytics/xp-over-time` | XP chart data |
| `GET` | `/api/achievements` | All achievement definitions |
| `GET` | `/api/users/me/achievements` | User's earned achievements |
