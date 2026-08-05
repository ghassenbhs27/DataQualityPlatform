"""Acces en ecriture aux resultats d'audit en base MySQL."""

from typing import Any

from audit.database.connection import get_connection
from audit.models.audit_finding import AuditFinding
from audit.models.audit_report import AuditReport


class AuditRepository:
    """Repository responsable de la persistance des audits."""

    _DEFAULT_TABLE_NAME = "patients"

    def save_audit(self, report: AuditReport) -> int:
        """Insere une ligne dans `audit_history`.

        Args:
            report: Le rapport complet a persister.

        Returns:
            int: L'identifiant du nouvel audit.
        """

        connection = get_connection()
        cursor = connection.cursor()

        try:
            cursor.execute(
                """
                INSERT INTO audit_history (
                    audit_date,
                    total_patients,
                    total_controls,
                    total_errors,
                    global_score,
                    duration_seconds,
                    notes
                ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    report.audit_date,
                    report.total_patients,
                    report.total_controls,
                    report.total_errors,
                    report.score,
                    int(report.duration_seconds),
                    report.summary(),
                ),
            )
            audit_id = int(cursor.lastrowid or 0)
            connection.commit()
            return audit_id
        except Exception:
            connection.rollback()
            raise
        finally:
            cursor.close()
            connection.close()

    def save_findings(self, audit_id: int, findings: list[AuditFinding]) -> None:
        """Insere les resultats detailles dans `audit_results`.

        Args:
            audit_id: Identifiant de l'audit parent.
            findings: Liste des constats a enregistrer.
        """

        connection = get_connection()
        cursor = connection.cursor()

        try:
            for finding in findings:
                cursor.execute(
                    """
                    INSERT INTO audit_results (
                        audit_id,
                        table_name,
                        column_name,
                        rule_name,
                        severity,
                        detected_count,
                        percentage,
                        recommendation
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        audit_id,
                        self._extract_table_name(finding),
                        self._extract_column_name(finding),
                        finding.rule,
                        finding.severity,
                        self._extract_error_count(finding),
                        self._extract_percentage(finding),
                        finding.recommendation,
                    ),
                )

            connection.commit()
        except Exception:
            connection.rollback()
            raise
        finally:
            cursor.close()
            connection.close()

    def _extract_table_name(self, finding: AuditFinding) -> str:
        """Retourne le nom de la table associee a un constat.

        Args:
            finding: Le constat a analyser.

        Returns:
            str: Le nom de la table deduit ou la table par defaut.
        """

        table_name = finding.results.get("table_name")
        if isinstance(table_name, str) and table_name.strip():
            return table_name.strip()

        return self._DEFAULT_TABLE_NAME

    def _extract_column_name(self, finding: AuditFinding) -> str | None:
        """Retourne le nom de colonne associe a un constat.

        Args:
            finding: Le constat a analyser.

        Returns:
            str | None: Le nom de colonne deduit ou `None`.
        """

        column_name = finding.results.get("column_name")
        if isinstance(column_name, str) and column_name.strip():
            return column_name.strip()

        field_name = finding.results.get("field")
        if isinstance(field_name, str) and field_name.strip():
            return field_name.strip()

        return None

    @staticmethod
    def _extract_error_count(finding: AuditFinding) -> int:
        """Extrait le nombre d'erreurs d'un constat.

        Args:
            finding: Le constat a analyser.

        Returns:
            int: Le nombre d'erreurs associe au constat.
        """

        for key in (
            "detected_count",
            "error_count",
            "invalid_count",
            "missing",
            "duplicate_count",
        ):
            value = finding.results.get(key)
            if value is None:
                continue

            try:
                return int(value)
            except (TypeError, ValueError):
                continue

        return 0

    @staticmethod
    def _extract_percentage(finding: AuditFinding) -> float:
        """Extrait le pourcentage associe a un constat.

        Args:
            finding: Le constat a analyser.

        Returns:
            float: Le pourcentage du constat, ou 0.0 par defaut.
        """

        raw_percentage = finding.results.get("percentage", 0.0)

        try:
            return float(raw_percentage)
        except (TypeError, ValueError):
            return 0.0


if __name__ == "__main__":
    from datetime import datetime

    sample_report = AuditReport(
        audit_date=datetime.now(),
        duration_seconds=3.14,
        total_patients=100,
        total_controls=7,
        total_errors=6,
        findings=[],
        score=92.5,
        critical_count=1,
        major_count=2,
        minor_count=3,
    )

    sample_findings = [
        AuditFinding(
            rule="INVALID_INS",
            severity="Critique",
            results={"invalid_count": 2, "percentage": 2.0, "score": 98.0},
            recommendation="Corriger les INS invalides.",
            description="Validation de l'INS.",
        ),
        AuditFinding(
            rule="INVALID_PHONE",
            severity="Majeure",
            results={"invalid_count": 4, "percentage": 4.0, "score": 96.0},
            recommendation="Corriger les numeros invalides.",
            description="Validation du telephone.",
        ),
    ]

    repository = AuditRepository()
    audit_id = repository.save_audit(sample_report)
    repository.save_findings(audit_id, sample_findings)
    print("Audit enregistré avec succès.")