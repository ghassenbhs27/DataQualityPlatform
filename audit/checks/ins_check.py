"""Controle du format de l'INS sur les donnees patients."""

from typing import Any

from audit.config.rules import CRITICAL, INS_LENGTH, RULE_INVALID_INS
from audit.models.audit_finding import AuditFinding


class INSCheck:
    """Analyse les patients pour verifier le format de l'INS."""

    FIELD_NAME = "ins"

    def check(self, patients: list[dict[str, Any]]) -> AuditFinding:
        """Verifie le format de l'INS sur une liste de patients.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            AuditFinding: Le resultat d'audit contenant les statistiques des
            INS invalides.
        """

        total_patients = len(patients)
        invalid_values = self._get_invalid_ins_values(patients)
        invalid_count = len(invalid_values)
        percentage = self._calculate_percentage(invalid_count, total_patients)

        return AuditFinding(
            rule=RULE_INVALID_INS,
            severity=CRITICAL,
            results={
                "invalid_count": invalid_count,
                "invalid_values": invalid_values,
                "percentage": round(percentage, 2),
            },
            recommendation=(
                "Corriger les INS invalides avant toute utilisation des donnees "
                "d'identification."
            ),
            description="Validation du format de l'Identifiant National de Santé.",
        )

    def _get_invalid_ins_values(self, patients: list[dict[str, Any]]) -> list[str]:
        """Retourne les valeurs d'INS invalides detectees.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            list[str]: Les INS invalides uniques, tries par ordre croissant.
        """

        invalid_values = {
            ins_value
            for ins_value in self._extract_ins_values(patients)
            if not self._is_valid_ins(ins_value)
        }

        return sorted(invalid_values)

    def _extract_ins_values(self, patients: list[dict[str, Any]]) -> list[str]:
        """Extrait les INS exploitables depuis la liste de patients.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            list[str]: Les valeurs d'INS non ignorees.
        """

        ins_values: list[str] = []

        for patient in patients:
            ins_value = patient.get(self.FIELD_NAME)
            if self._is_ignored(ins_value):
                continue

            ins_values.append(str(ins_value).strip())

        return ins_values

    def _calculate_percentage(self, invalid_count: int, total_patients: int) -> float:
        """Calcule le pourcentage de patients ayant un INS invalide.

        Args:
            invalid_count: Nombre de patients avec un INS invalide.
            total_patients: Nombre total de patients analysee.

        Returns:
            float: Le pourcentage calcule.
        """

        if total_patients <= 0:
            return 0.0

        return (invalid_count / total_patients) * 100

    @staticmethod
    def _is_valid_ins(ins_value: str) -> bool:
        """Indique si une valeur respecte le format attendu pour un INS.

        Args:
            ins_value: La valeur d'INS a verifier.

        Returns:
            bool: `True` si l'INS contient exactement 9 chiffres, sinon `False`.
        """

        return len(ins_value) == INS_LENGTH and ins_value.isdigit()

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
        {"ins": "123456789"},
        {"ins": "12345678"},
        {"ins": "1234567890"},
        {"ins": "12345AB89"},
        {"ins": "ABC123456"},
        {"ins": "12 3456789"},
        {"ins": None},
        {"ins": "   "},
    ]

    check = INSCheck()
    print(check.check(sample_patients))