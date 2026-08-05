"""Modele representant le resultat complet d'un audit."""

from dataclasses import dataclass
from datetime import datetime

from audit.models.audit_finding import AuditFinding


@dataclass(frozen=True)
class AuditReport:
    """Represente le resultat final et complet d'un audit.

    Attributes:
        audit_date: Date et heure de l'audit.
        duration_seconds: Duree totale de l'audit en secondes.
        total_patients: Nombre total de patients analyses.
        total_controls: Nombre total de controles executes.
        total_errors: Nombre total d'erreurs detectees.
        findings: Liste des constats generes par les controles.
        score: Score final de l'audit.
        critical_count: Nombre de constats critiques.
        major_count: Nombre de constats majeurs.
        minor_count: Nombre de constats mineurs.
    """

    audit_date: datetime
    duration_seconds: float
    total_patients: int
    total_controls: int
    total_errors: int
    findings: list[AuditFinding]
    score: float
    critical_count: int
    major_count: int
    minor_count: int

    def to_dict(self) -> dict:
        """Retourne une representation dictionnaire du rapport d'audit.

        Returns:
            dict: Les attributs du modele sous forme de dictionnaire.
        """

        return {
            "audit_date": self.audit_date,
            "duration_seconds": self.duration_seconds,
            "total_patients": self.total_patients,
            "total_controls": self.total_controls,
            "total_errors": self.total_errors,
            "findings": [finding.to_dict() for finding in self.findings],
            "score": self.score,
            "critical_count": self.critical_count,
            "major_count": self.major_count,
            "minor_count": self.minor_count,
        }

    def summary(self) -> str:
        """Retourne un resume lisible du rapport d'audit.

        Returns:
            str: Un resume textuel du resultat d'audit.
        """

        return (
            "Audit terminé\n"
            f"Patients analysés : {self.total_patients}\n"
            f"Contrôles exécutés : {self.total_controls}\n"
            f"Erreurs détectées : {self.total_errors}\n"
            f"Score : {self.score} %\n"
            f"Critiques : {self.critical_count}\n"
            f"Majeures : {self.major_count}\n"
            f"Mineures : {self.minor_count}"
        )


if __name__ == "__main__":
    sample_findings = [
        AuditFinding(
            rule="INVALID_INS",
            severity="Critique",
            results={"invalid_count": 3, "invalid_values": ["123"], "percentage": 1.2},
            recommendation="Corriger les INS invalides.",
            description="Validation du format de l'INS.",
        ),
        AuditFinding(
            rule="INVALID_PHONE",
            severity="Majeure",
            results={"invalid_count": 2, "invalid_values": ["11111111"], "percentage": 0.8},
            recommendation="Corriger les numeros invalides.",
            description="Validation du format des numeros de telephone.",
        ),
    ]

    report = AuditReport(
        audit_date=datetime.now(),
        duration_seconds=12.5,
        total_patients=250,
        total_controls=7,
        total_errors=41,
        findings=sample_findings,
        score=93.5,
        critical_count=12,
        major_count=25,
        minor_count=41,
    )

    print(report.summary())