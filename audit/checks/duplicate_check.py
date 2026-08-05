"""Controle des doublons sur les donnees patients."""

from collections import Counter
from typing import Any

from audit.models.audit_finding import AuditFinding


class DuplicateCheck:
    """Analyse les champs patients pour detecter les doublons."""

    FIELDS_TO_CHECK = (
        "ins",
        "cin",
        "telephone",
        "email",
    )

    def check(self, patients: list[dict[str, Any]]) -> AuditFinding:
        """Calcule les doublons sur une liste de patients.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            AuditFinding: Le resultat d'audit contenant les statistiques de
            doublons par champ.
        """

        total_patients = len(patients)
        results: dict[str, dict[str, Any]] = {}

        for field_name in self.FIELDS_TO_CHECK:
            values = [
                str(value).strip()
                for patient in patients
                for value in [patient.get(field_name)]
                if not self._is_ignored(value)
            ]

            counts = Counter(values)
            duplicate_values = sorted(
                value for value, count in counts.items() if count > 1
            )
            duplicate_count = sum(
                count for value, count in counts.items() if value in duplicate_values
            )
            percentage = (
                (duplicate_count / total_patients) * 100 if total_patients > 0 else 0.0
            )

            results[field_name] = {
                "duplicate_count": duplicate_count,
                "duplicate_values": duplicate_values,
                "percentage": round(percentage, 2),
            }

        return AuditFinding(
            rule="DUPLICATE_VALUES",
            severity="Critique",
            results=results,
            recommendation="Corriger les doublons avant toute exploitation des donnees.",
            description="Detection des valeurs dupliquees.",
        )

    @staticmethod
    def _is_ignored(value: Any) -> bool:
        """Indique si une valeur doit etre ignoree pour la recherche de doublons.

        Args:
            value: La valeur a verifier.

        Returns:
            bool: `True` si la valeur est vide, nulle ou composee uniquement d'espaces.
        """

        if value is None:
            return True

        if isinstance(value, str):
            return value.strip() == ""

        return False


if __name__ == "__main__":
    sample_patients = [
        {
            "ins": "1234567890",
            "cin": "AA111111",
            "telephone": "11111111",
            "email": "alice@example.com",
        },
        {
            "ins": "1234567890",
            "cin": "BB222222",
            "telephone": "22222222",
            "email": "bob@example.com",
        },
        {
            "ins": None,
            "cin": "AA111111",
            "telephone": "   ",
            "email": "alice@example.com",
        },
        {
            "ins": "   ",
            "cin": "CC333333",
            "telephone": "33333333",
            "email": None,
        },
    ]

    check = DuplicateCheck()
    print(check.check(sample_patients))
