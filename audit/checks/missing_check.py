"""Controle des valeurs manquantes sur les donnees patients."""

from typing import Any

from audit.config.rules import MINOR, RULE_MISSING
from audit.models.audit_finding import AuditFinding


class MissingCheck:
    """Analyse les champs patients pour detecter les valeurs manquantes."""

    FIELDS_TO_CHECK = (
        "ins",
        "cin",
        "nom",
        "prenom",
        "date_naissance",
        "sexe",
        "telephone",
        "adresse",
        "email",
    )

    def check(self, patients: list[dict[str, Any]]) -> AuditFinding:
        """Calcule les valeurs manquantes sur une liste de patients.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            AuditFinding: Le resultat d'audit consolide pour la completude.
        """

        total_patients = len(patients)
        field_statistics: dict[str, dict[str, float | int]] = {}
        total_missing = 0

        for field_name in self.FIELDS_TO_CHECK:
            missing_count = sum(
                1 for patient in patients if self._is_missing(patient.get(field_name))
            )
            total_missing += missing_count
            percentage = (
                (missing_count / total_patients) * 100 if total_patients > 0 else 0.0
            )

            field_statistics[field_name] = {
                "missing": missing_count,
                "percentage": round(percentage, 2),
            }

        total_fields = len(self.FIELDS_TO_CHECK)
        overall_percentage = (
            (total_missing / (total_patients * total_fields)) * 100
            if total_patients > 0 and total_fields > 0
            else 0.0
        )

        return AuditFinding(
            rule=RULE_MISSING,
            severity=MINOR,
            results={
                "error_count": total_missing,
                "percentage": round(overall_percentage, 2),
                "total_patients": total_patients,
                "fields_checked": total_fields,
                "field_statistics": field_statistics,
            },
            recommendation="Completer les champs manquants.",
            description="Analyse des valeurs manquantes sur les donnees patients.",
        )

    @staticmethod
    def _is_missing(value: Any) -> bool:
        """Indique si une valeur doit etre consideree comme manquante.

        Args:
            value: La valeur a verifier.

        Returns:
            bool: `True` si la valeur est manquante, sinon `False`.
        """

        if value is None:
            return True

        if isinstance(value, str):
            return value.strip() == ""

        return False


if __name__ == "__main__":
    sample_patients = [
        {
            "ins": "123456",
            "cin": "AA111111",
            "nom": "Dupont",
            "prenom": "Alice",
            "date_naissance": "1990-01-01",
            "sexe": "F",
            "telephone": "12345678",
            "adresse": "10 rue de Paris",
            "email": "alice@example.com",
        },
        {
            "ins": None,
            "cin": "",
            "nom": "   ",
            "prenom": "Karim",
            "date_naissance": None,
            "sexe": "M",
            "telephone": "",
            "adresse": "Tunis",
            "email": None,
        },
    ]

    check = MissingCheck()
    print(check.check(sample_patients))
