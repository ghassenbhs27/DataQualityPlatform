"""Service d'orchestration pour l'audit des patients."""

from datetime import datetime
from time import perf_counter
from typing import Any

from audit.models.audit_finding import AuditFinding
from audit.models.audit_report import AuditReport
from audit.repositories.audit_repository import AuditRepository
from audit.repositories.patient_repository import PatientRepository
from audit.services.audit_engine import AuditEngine
from audit.services.score_service import ScoreService


class AuditServiceError(RuntimeError):
    """Exception de base pour les erreurs du service d'audit."""


class AuditLoadingError(AuditServiceError):
    """Erreur levée lors du chargement des patients."""


class AuditExecutionError(AuditServiceError):
    """Erreur levée lors de l'execution du moteur d'audit."""


class AuditScoringError(AuditServiceError):
    """Erreur levée lors du calcul des scores."""


class AuditPersistenceError(AuditServiceError):
    """Erreur levée lors de la persistance du rapport d'audit."""


class AuditService:
    """Service principal preparant le flux general de l'audit."""

    def __init__(self) -> None:
        """Initialise le service avec son repository patient."""

        self.patient_repository = PatientRepository()
        self.audit_engine = AuditEngine()
        self.score_service = ScoreService()
        self.audit_repository = AuditRepository()

    def load_patients(self) -> list[dict[str, Any]]:
        """Charge tous les patients via le repository.

        Returns:
            list[dict[str, Any]]: La liste des patients.
        """

        return self.patient_repository.get_all_patients()

    def count_patients(self) -> int:
        """Retourne le nombre total de patients.

        Returns:
            int: Le nombre total de patients.
        """

        return self.patient_repository.count_patients()

    def run(self) -> AuditReport:
        """Execute le workflow complet de l'audit et retourne le rapport final.

        Returns:
            AuditReport: Le rapport complet de l'audit.

        Raises:
            AuditLoadingError: Si le chargement des patients echoue.
            AuditExecutionError: Si l'execution du moteur echoue.
            AuditScoringError: Si le calcul des scores echoue.
            AuditPersistenceError: Si la sauvegarde du rapport echoue.
        """

        try:
            patients = self.load_patients()
        except Exception as exc:
            raise AuditLoadingError("Impossible de charger les patients.") from exc

        total_patients = len(patients)
        start_time = perf_counter()

        try:
            findings = self.audit_engine.run(patients)
        except Exception as exc:
            raise AuditExecutionError("Impossible d'executer les controles.") from exc

        try:
            score_result = self.score_service.calculate(findings)
        except Exception as exc:
            raise AuditScoringError("Impossible de calculer les scores.") from exc

        duration_seconds = perf_counter() - start_time
        total_controls = len(findings)
        total_errors = self._count_total_errors(findings)

        critical_count, major_count, minor_count = self._count_severity_levels(
            findings
        )

        report = AuditReport(
            audit_date=datetime.now(),
            duration_seconds=duration_seconds,
            total_patients=total_patients,
            total_controls=total_controls,
            total_errors=total_errors,
            findings=findings,
            score=score_result["global_score"],
            critical_count=critical_count,
            major_count=major_count,
            minor_count=minor_count,
        )

        try:
            audit_id = self.audit_repository.save_audit(report)
            self.audit_repository.save_findings(audit_id, findings)
        except Exception as exc:
            raise AuditPersistenceError(
                "Impossible de sauvegarder le rapport d'audit."
            ) from exc

        return report

    @staticmethod
    def _count_severity_levels(findings: list[AuditFinding]) -> tuple[int, int, int]:
        """Compte les niveaux de severite presents dans les resultats.

        Args:
            findings: La liste des resultats d'audit.

        Returns:
            tuple[int, int, int]: Le nombre de constats critiques, majeurs et
            mineurs.
        """

        critical_count = 0
        major_count = 0
        minor_count = 0

        for finding in findings:
            severity = finding.severity.strip().lower()

            if severity == "critique":
                critical_count += 1
            elif severity == "majeure":
                major_count += 1
            else:
                minor_count += 1

        return critical_count, major_count, minor_count

    @staticmethod
    def _count_total_errors(findings: list[AuditFinding]) -> int:
        """Compte le nombre total d'erreurs detectees dans tous les constats.

        Args:
            findings: La liste des resultats d'audit.

        Returns:
            int: Le nombre total d'erreurs detectees.
        """

        total_errors = 0

        for finding in findings:
            raw_value = finding.results.get("error_count")

            if raw_value is None:
                raw_value = finding.results.get("invalid_count")
            if raw_value is None:
                raw_value = finding.results.get("missing")
            if raw_value is None:
                raw_value = finding.results.get("duplicate_count")

            try:
                total_errors += int(raw_value or 0)
            except (TypeError, ValueError):
                continue

        return total_errors


if __name__ == "__main__":
    service = AuditService()
    report = service.run()

    print("====================================")
    print()
    print("Audit termine")
    print()
    print(f"Patients analyses : {report.total_patients}")
    print()
    print(f"Score global : {report.score}")
    print()
    print(f"Temps d'execution : {report.duration_seconds:.4f} s")
    print()
    print("====================================")
