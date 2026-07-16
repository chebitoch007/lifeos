# Deploying LifeOS on Coolify

## Prerequisites

- Coolify instance running (self-hosted or Coolify Cloud)
- GitHub repo connected to Coolify
- Domain name configured with DNS pointing to your Coolify server

## Services to create in Coolify

Create each as a separate resource in Coolify, all pointing to the same GitHub repo.

### 1. PostgreSQL

Use Coolify's **managed PostgreSQL** resource.

- Note the connection string Coolify provides
- Use it to set `DATABASE_URL` and `POSTGRES_*` vars on the backend

### 2. Redis

Use Coolify's **managed Redis** resource.

- Note the connection string Coolify provides
- Use it to set `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND`

### 3. Backend API

- **Type:** Docker Compose or Dockerfile
- **Build context:** `./backend`
- **Dockerfile:** `backend/Dockerfile`
- **Port:** `8000`
- **Entrypoint:** `/app/entrypoint.sh` (runs migrations automatically on deploy)

Environment variables:
```
DATABASE_URL=postgresql+asyncpg://<user>:<pass>@<host>:5432/<db>
REDIS_URL=redis://<host>:6379/0
CELERY_BROKER_URL=redis://<host>:6379/0
CELERY_RESULT_BACKEND=redis://<host>:6379/1
SECRET_KEY=<openssl rand -hex 32>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=false
```

### 4. Frontend

- **Type:** Docker Compose or Dockerfile
- **Build context:** `./frontend`
- **Dockerfile:** `frontend/Dockerfile`
- **Port:** `3000`

Environment variables:
```
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<openssl rand -hex 32>
NEXT_PUBLIC_API_URL=https://your-domain.com
NODE_ENV=production
```

### 5. Celery Worker

- **Type:** Dockerfile (same image as backend)
- **Build context:** `./backend`
- **Command override:** `celery -A worker.celery_app worker --loglevel=info`
- **No port exposure needed**

Same environment variables as the backend (minus port-related ones).

### 6. Celery Beat

- **Type:** Dockerfile (same image as backend)
- **Build context:** `./backend`
- **Command override:** `celery -A worker.celery_app beat --loglevel=info --schedule=/tmp/celerybeat-schedule`
- **No port exposure needed**
- **Important:** Run only ONE instance of Celery Beat — multiple instances will
  cause duplicate task execution.

Same environment variables as the backend.

## Deploy order

Deploy in this order to avoid dependency failures:

1. **PostgreSQL** — wait until healthy
2. **Redis** — wait until healthy
3. **Backend** — entrypoint.sh runs `alembic upgrade head` before starting uvicorn
4. **Frontend** — depends on backend being healthy
5. **Celery Worker** — after backend is up
6. **Celery Beat** — after Celery Worker is up

## Health checks

| Service | Check | Expected |
|---------|-------|----------|
| Backend | `GET https://your-domain.com/api/health` | `{"status":"ok","version":"0.1.0"}` |
| Frontend | `GET https://your-domain.com` | HTTP 200 |

## Running migrations manually

If you ever need to run migrations outside of a deploy:

```bash
# Via Coolify terminal on the backend container
alembic upgrade head

# Or via docker-compose locally
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

## Scaling

- **Backend:** increase `--workers` in the uvicorn command (CPU-bound limit: `2 * CPU_cores + 1`)
- **Celery Worker:** scale horizontally by running multiple worker instances (Coolify replicas)
- **Celery Beat:** always exactly 1 instance

## Updating

Coolify redeploys automatically on git push if webhooks are configured.
The `entrypoint.sh` runs migrations on every deploy, so schema changes are applied automatically.
