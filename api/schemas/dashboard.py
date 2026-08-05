"""Schemas Pydantic lies au dashboard."""

from datetime import date

from pydantic import BaseModel


class DashboardResponse(BaseModel):
    """Payload de reponse pour le dashboard."""

    globalScore: float
    patients: int
    anomalies: int
    controls: int
    lastAudit: date
