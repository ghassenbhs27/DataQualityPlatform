"""Point d'entree FastAPI pour exposer le backend d'audit."""

from fastapi import FastAPI

from api.routers.audit import router as audit_router
from api.routers.dashboard import router as dashboard_router


app = FastAPI(
    title="DataQualityPlatform API",
    version="1.0.0",
    description="API REST exposant les services d'audit existants.",
)

app.include_router(dashboard_router)
app.include_router(audit_router)
