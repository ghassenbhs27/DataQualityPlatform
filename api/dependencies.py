"""Dependances partagees par les routers FastAPI."""

from collections.abc import Generator

from audit.database.connection import close_connection, get_connection
from audit.repositories.audit_repository import AuditRepository
from audit.repositories.patient_repository import PatientRepository
from audit.services.audit_service import AuditService


def get_audit_service() -> AuditService:
    """Retourne une instance du service principal d'audit."""

    return AuditService()


def get_audit_repository() -> AuditRepository:
    """Retourne une instance du repository d'audit existant."""

    return AuditRepository()


def get_patient_repository() -> PatientRepository:
    """Retourne une instance du repository patient existant."""

    return PatientRepository()


def get_db_connection() -> Generator:
    """Fournit une connexion MySQL ouverte pendant la requete HTTP."""

    connection = get_connection()
    try:
        yield connection
    finally:
        close_connection(connection)
