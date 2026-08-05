"""Schemas Pydantic lies aux endpoints d'audit."""

from datetime import datetime

from pydantic import BaseModel


class AuditHistoryResponse(BaseModel):
    """Representation d'une ligne d'historique d'audit."""

    id: int
    auditDate: datetime
    totalPatients: int
    totalControls: int
    totalErrors: int
    globalScore: float
    durationSeconds: int
    notes: str | None


class AuditResultResponse(BaseModel):
    """Representation d'une ligne detaillee de `audit_results`."""

    id: int
    auditId: int
    tableName: str | None
    columnName: str | None
    ruleName: str | None
    severity: str | None
    detectedCount: int
    percentage: float
    recommendation: str | None


class RunAuditResponse(BaseModel):
    """Payload de retour apres lancement d'un audit."""

    success: bool
    message: str
