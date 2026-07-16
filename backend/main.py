from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import settings
from worker import celery_app  # noqa: F401 — ensures Celery is wired at import time

app = FastAPI(
    title="LifeOS API",
    version=settings.APP_VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------


class HealthResponse(BaseModel):
    status: str
    version: str


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------


@app.get("/api/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", version=settings.APP_VERSION)


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

from routers import achievements, analytics, auth, quests, stats, users, xp  # noqa: E402

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(stats.router)
app.include_router(quests.router)
app.include_router(xp.router)
app.include_router(analytics.router)
app.include_router(achievements.router)
