"""Controle du format du CIN sur les donnees patients."""

from typing import Any

from audit.config.rules import CIN_LENGTH, CRITICAL, RULE_INVALID_CIN
from audit.models.audit_finding import AuditFinding


class CINCheck:
    """Analyse les patients pour verifier le format du CIN."""

    FIELD_NAME = "cin"

    def check(self, patients: list[dict[str, Any]]) -> AuditFinding:
        """Verifie le format du CIN sur une liste de patients.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            AuditFinding: Le resultat d'audit contenant les statistiques des
            CIN invalides.
        """

        total_patients = len(patients)
        invalid_values = self._get_invalid_cin_values(patients)
        invalid_count = len(invalid_values)
        percentage = self._calculate_percentage(invalid_count, total_patients)

        return AuditFinding(
            rule=RULE_INVALID_CIN,
            severity=CRITICAL,
            results={
                "invalid_count": invalid_count,
                "invalid_values": invalid_values,
                "percentage": round(percentage, 2),
            },
            recommendation=(
                "Corriger les CIN invalides avant toute exploitation des donnees "
                "d'identification."
            ),
            description=(
                "Validation du format du numero de Carte d'Identite Nationale."
            ),
        )

    def _get_invalid_cin_values(self, patients: list[dict[str, Any]]) -> list[str]:
        """Retourne les valeurs de CIN invalides detectees.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            list[str]: Les CIN invalides uniques, tries par ordre croissant.
        """

        invalid_values = {
            cin_value
            for cin_value in self._extract_cin_values(patients)
            if not self._is_valid_cin(cin_value)
        }

        return sorted(invalid_values)

    def _extract_cin_values(self, patients: list[dict[str, Any]]) -> list[str]:
        """Extrait les CIN exploitables depuis la liste de patients.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            list[str]: Les valeurs de CIN non ignorees.
        """

        cin_values: list[str] = []

        for patient in patients:
            cin_value = patient.get(self.FIELD_NAME)
            if self._is_ignored(cin_value):
                continue

            cin_values.append(str(cin_value).strip())

        return cin_values

    def _calculate_percentage(self, invalid_count: int, total_patients: int) -> float:
        """Calcule le pourcentage de patients ayant un CIN invalide.

        Args:
            invalid_count: Nombre de patients avec un CIN invalide.
            total_patients: Nombre total de patients analyses.

        Returns:
            float: Le pourcentage calcule.
        """

        if total_patients <= 0:
            return 0.0

        return (invalid_count / total_patients) * 100

    @staticmethod
    def _is_valid_cin(cin_value: str) -> bool:
        """Indique si une valeur respecte le format attendu pour un CIN.

        Args:
            cin_value: La valeur de CIN a verifier.

        Returns:
            bool: `True` si le CIN contient exactement 8 chiffres, sinon `False`.
        """

        return len(cin_value) == CIN_LENGTH and cin_value.isdigit()

    @staticmethod
    def _is_ignored(value: Any) -> bool:
        """Indique si une valeur doit etre ignoree par le controle.

        Args:
            value: La valeur a verifier.

        Returns:
            bool: `True` si la valeur est vide, nulle ou constituee d'espaces.
        """

        if value is None:
            return True

        if isinstance(value, str):
            return value.strip() == ""

        return False


if __name__ == "__main__":
    sample_patients = [
        {"cin": "12345678"},
        {"cin": "1234567"},
        {"cin": "123456789"},
        {"cin": "12AB5678"},
        {"cin": "1234 5678"},
        {"cin": None},
        {"cin": "   "},
    ]

    check = CINCheck()
    print(check.check(sample_patients))