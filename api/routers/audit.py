"""Router exposant les endpoints REST lies aux audits."""

from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends

from api.dependencies import get_audit_service, get_db_connection
from api.schemas.audit import (
    AuditHistoryResponse,
    AuditResultResponse,
    RunAuditResponse,
)
from audit.services.audit_service import AuditService


router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/history", response_model=list[AuditHistoryResponse])
def get_audit_history(connection: Any = Depends(get_db_connection)) -> list[AuditHistoryResponse]:
    """Retourne l'historique des audits persistés."""

    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                id,
                audit_date,
                total_patients,
                total_controls,
                total_errors,
                global_score,
                duration_seconds,
                notes
            FROM audit_history
            ORDER BY audit_date DESC, id DESC
            """
        )
        rows = cursor.fetchall()
    finally:
        cursor.close()

    return [
        AuditHistoryResponse(
            id=int(row["id"]),
            auditDate=row["audit_date"],
            totalPatients=int(row["total_patients"] or 0),
            totalControls=int(row["total_controls"] or 0),
            totalErrors=int(row["total_errors"] or 0),
            globalScore=float(row["global_score"] or Decimal("0")),
            durationSeconds=int(row["duration_seconds"] or 0),
            notes=row["notes"],
        )
        for row in rows
    ]


@router.get("/results", response_model=list[AuditResultResponse])
def get_audit_results(connection: Any = Depends(get_db_connection)) -> list[AuditResultResponse]:
    """Retourne toutes les lignes de `audit_results`."""

    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                id,
                audit_id,
                table_name,
                column_name,
                rule_name,
                severity,
                detected_count,
                percentage,
                recommendation
            FROM audit_results
            ORDER BY audit_id DESC, id ASC
            """
        )
        rows = cursor.fetchall()
    finally:
        cursor.close()

    return [
        AuditResultResponse(
            id=int(row["id"]),
            auditId=int(row["audit_id"]),
            tableName=row["table_name"],
            columnName=row["column_name"],
            ruleName=row["rule_name"],
            severity=row["severity"],
            detectedCount=int(row["detected_count"] or 0),
            percentage=float(row["percentage"] or Decimal("0")),
            recommendation=row["recommendation"],
        )
        for row in rows
    ]


@router.post("/run", response_model=RunAuditResponse)
def run_audit(
    audit_service: AuditService = Depends(get_audit_service),
) -> RunAuditResponse:
    """Declenche l'execution du workflow d'audit existant."""

    audit_service.run()
    return RunAuditResponse(success=True, message="Audit terminé.")
