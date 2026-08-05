"""Router exposant les donnees de synthese du dashboard."""

from decimal import Decimal
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from api.dependencies import get_audit_service, get_db_connection
from api.schemas.dashboard import DashboardResponse
from audit.services.audit_service import AuditService


router = APIRouter(tags=["dashboard"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(
    audit_service: AuditService = Depends(get_audit_service),
    connection: Any = Depends(get_db_connection),
) -> DashboardResponse:
    """Retourne la synthese du dernier audit persiste."""

    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            """
            SELECT
                audit_date,
                total_patients,
                total_controls,
                total_errors,
                global_score
            FROM audit_history
            ORDER BY audit_date DESC, id DESC
            LIMIT 1
            """
        )
        latest_audit = cursor.fetchone()
    finally:
        cursor.close()

    if latest_audit is None:
        raise HTTPException(
            status_code=404,
            detail="Aucun audit n'est disponible pour alimenter le dashboard.",
        )

    patients_count = int(latest_audit["total_patients"] or 0)
    if patients_count <= 0:
        patients_count = audit_service.count_patients()

    return DashboardResponse(
        globalScore=float(latest_audit["global_score"] or Decimal("0")),
        patients=patients_count,
        anomalies=int(latest_audit["total_errors"] or 0),
        controls=int(latest_audit["total_controls"] or 0),
        lastAudit=latest_audit["audit_date"].date(),
    )
