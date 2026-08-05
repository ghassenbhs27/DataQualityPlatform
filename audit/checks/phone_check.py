"""Controle du format des numeros de telephone sur les donnees patients."""

from typing import Any

from audit.config.rules import (
    ALLOWED_PHONE_PREFIXES,
    MAJOR,
    PHONE_LENGTH,
    RULE_INVALID_PHONE,
)
from audit.models.audit_finding import AuditFinding


class PhoneCheck:
    """Analyse les patients pour verifier le format du telephone."""

    FIELD_NAME = "telephone"
    VALID_PREFIXES = ("2", "4", "5", "7", "9")

    def check(self, patients: list[dict[str, Any]]) -> AuditFinding:
        """Verifie le format des numeros de telephone sur une liste de patients.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            AuditFinding: Le resultat d'audit contenant les statistiques des
            numeros invalides.
        """

        total_patients = len(patients)
        invalid_values = self._get_invalid_phone_values(patients)
        invalid_count = len(invalid_values)
        percentage = self._calculate_percentage(invalid_count, total_patients)

        return AuditFinding(
            rule=RULE_INVALID_PHONE,
            severity=MAJOR,
            results={
                "invalid_count": invalid_count,
                "invalid_values": invalid_values,
                "percentage": round(percentage, 2),
            },
            recommendation=(
                "Corriger les numeros invalides afin de garantir la possibilite "
                "de contacter les patients."
            ),
            description="Validation du format des numeros de telephone.",
        )

    def _get_invalid_phone_values(self, patients: list[dict[str, Any]]) -> list[str]:
        """Retourne les numeros de telephone invalides detectes.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            list[str]: Les numeros invalides uniques, tries par ordre croissant.
        """

        invalid_values = {
            phone_value
            for phone_value in self._extract_phone_values(patients)
            if not self._is_valid_phone(phone_value)
        }

        return sorted(invalid_values)

    def _extract_phone_values(self, patients: list[dict[str, Any]]) -> list[str]:
        """Extrait les numeros de telephone exploitables depuis la liste de patients.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            list[str]: Les valeurs de telephone non ignorees.
        """

        phone_values: list[str] = []

        for patient in patients:
            phone_value = patient.get(self.FIELD_NAME)
            if self._is_ignored(phone_value):
                continue

            phone_values.append(str(phone_value).strip())

        return phone_values

    def _calculate_percentage(self, invalid_count: int, total_patients: int) -> float:
        """Calcule le pourcentage de patients ayant un telephone invalide.

        Args:
            invalid_count: Nombre de patients avec un telephone invalide.
            total_patients: Nombre total de patients analyses.

        Returns:
            float: Le pourcentage calcule.
        """

        if total_patients <= 0:
            return 0.0

        return (invalid_count / total_patients) * 100

    def _is_valid_phone(self, phone_value: str) -> bool:
        """Indique si une valeur respecte le format attendu pour un telephone.

        Args:
            phone_value: La valeur de telephone a verifier.

        Returns:
            bool: `True` si le telephone contient exactement 8 chiffres et
            commence par un prefixe autorise, sinon `False`.
        """

        return (
            len(phone_value) == PHONE_LENGTH
            and phone_value.isdigit()
            and phone_value.startswith(ALLOWED_PHONE_PREFIXES)
        )

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
        {"telephone": "71234567"},
        {"telephone": "7123456"},
        {"telephone": "712345678"},
        {"telephone": "71AB4567"},
        {"telephone": "31234567"},
        {"telephone": None},
        {"telephone": "   "},
    ]

    check = PhoneCheck()
    print(check.check(sample_patients))