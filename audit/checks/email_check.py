"""Controle du format des adresses email sur les donnees patients."""

from typing import Any

from audit.config.rules import (
    EMAIL_AT_SYMBOL,
    EMAIL_DOT_SYMBOL,
    EMAIL_MAX_LENGTH,
    EMAIL_SPACE_SYMBOL,
    MAJOR,
    RULE_INVALID_EMAIL,
)
from audit.models.audit_finding import AuditFinding


class EmailCheck:
    """Analyse les patients pour verifier le format des adresses email."""

    FIELD_NAME = "email"

    def check(self, patients: list[dict[str, Any]]) -> AuditFinding:
        """Verifie le format des adresses email sur une liste de patients.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            AuditFinding: Le resultat d'audit contenant les statistiques des
            adresses email invalides.
        """

        total_patients = len(patients)
        invalid_values = self._get_invalid_email_values(patients)
        invalid_count = len(invalid_values)
        percentage = self._calculate_percentage(invalid_count, total_patients)

        return AuditFinding(
            rule=RULE_INVALID_EMAIL,
            severity=MAJOR,
            results={
                "invalid_count": invalid_count,
                "invalid_values": invalid_values,
                "percentage": round(percentage, 2),
            },
            recommendation=(
                "Corriger les adresses email invalides afin de garantir les "
                "echanges electroniques avec les patients."
            ),
            description="Validation du format des adresses email.",
        )

    def _get_invalid_email_values(self, patients: list[dict[str, Any]]) -> list[str]:
        """Retourne les adresses email invalides detectees.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            list[str]: Les emails invalides uniques, tries par ordre croissant.
        """

        invalid_values = {
            email_value
            for email_value in self._extract_email_values(patients)
            if not self._is_valid_email(email_value)
        }

        return sorted(invalid_values)

    def _extract_email_values(self, patients: list[dict[str, Any]]) -> list[str]:
        """Extrait les adresses email exploitables depuis la liste de patients.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            list[str]: Les valeurs email non ignorees.
        """

        email_values: list[str] = []

        for patient in patients:
            email_value = patient.get(self.FIELD_NAME)
            if self._is_ignored(email_value):
                continue

            email_values.append(str(email_value).strip())

        return email_values

    def _calculate_percentage(self, invalid_count: int, total_patients: int) -> float:
        """Calcule le pourcentage de patients ayant un email invalide.

        Args:
            invalid_count: Nombre de patients avec un email invalide.
            total_patients: Nombre total de patients analyses.

        Returns:
            float: Le pourcentage calcule.
        """

        if total_patients <= 0:
            return 0.0

        return (invalid_count / total_patients) * 100

    @staticmethod
    def _is_valid_email(email_value: str) -> bool:
        """Indique si une valeur respecte le format attendu pour un email.

        Args:
            email_value: La valeur email a verifier.

        Returns:
            bool: `True` si l'email est valide, sinon `False`.
        """

        if len(email_value) > EMAIL_MAX_LENGTH:
            return False

        if EMAIL_SPACE_SYMBOL in email_value:
            return False

        if email_value.count(EMAIL_AT_SYMBOL) != 1:
            return False

        local_part, domain_part = email_value.split(EMAIL_AT_SYMBOL, 1)
        if not local_part or not domain_part:
            return False

        return EMAIL_DOT_SYMBOL in domain_part

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
        {"email": "alice@example.com"},
        {"email": "aliceexample.com"},
        {"email": "alice@@example.com"},
        {"email": "alice@examplecom"},
        {"email": "alice example.com"},
        {"email": "alice@"},
        {"email": None},
        {"email": "   "},
    ]

    check = EmailCheck()
    print(check.check(sample_patients))