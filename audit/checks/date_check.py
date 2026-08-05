"""Controle de validite des dates de naissance sur les donnees patients."""

from datetime import date, datetime, timedelta
from typing import Any

from audit.config.rules import (
    DATE_FORMAT,
    DESCRIPTION_INVALID_DATE,
    MAJOR,
    MAX_PATIENT_AGE,
    RECOMMENDATION_INVALID_DATE,
    RULE_INVALID_DATE,
)
from audit.models.audit_finding import AuditFinding


class DateCheck:
    """Analyse les patients pour verifier la validite des dates de naissance."""

    FIELD_NAME = "date_naissance"

    def check(self, patients: list[dict[str, Any]]) -> AuditFinding:
        """Verifie la validite des dates de naissance sur une liste de patients.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            AuditFinding: Le resultat d'audit contenant les statistiques des
            dates de naissance invalides.
        """

        total_patients = len(patients)
        invalid_count = self._count_invalid_dates(patients)
        invalid_values = self._get_invalid_date_values(patients)
        percentage = self._calculate_percentage(invalid_count, total_patients)

        return AuditFinding(
            rule=RULE_INVALID_DATE,
            severity=MAJOR,
            results={
                "invalid_count": invalid_count,
                "invalid_values": invalid_values,
                "percentage": round(percentage, 2),
            },
            recommendation=RECOMMENDATION_INVALID_DATE,
            description=DESCRIPTION_INVALID_DATE,
        )

    def _get_invalid_date_values(self, patients: list[dict[str, Any]]) -> list[str]:
        """Retourne les dates de naissance invalides detectees.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            list[str]: Les dates invalides uniques, triees par ordre croissant.
        """

        invalid_values = {
            date_value
            for date_value in self._extract_date_values(patients)
            if not self._is_valid_date(date_value)
        }

        return sorted(invalid_values)

    def _count_invalid_dates(self, patients: list[dict[str, Any]]) -> int:
        """Compte le nombre de patients avec une date de naissance invalide.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            int: Le nombre de patients concernes.
        """

        return sum(
            1
            for date_value in self._extract_date_values(patients)
            if not self._is_valid_date(date_value)
        )

    def _extract_date_values(self, patients: list[dict[str, Any]]) -> list[str]:
        """Extrait les dates de naissance exploitables depuis la liste de patients.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            list[str]: Les valeurs de date non ignorees.
        """

        date_values: list[str] = []

        for patient in patients:
            date_value = patient.get(self.FIELD_NAME)
            if self._is_ignored(date_value):
                continue

            date_values.append(str(date_value).strip())

        return date_values

    def _calculate_percentage(self, invalid_count: int, total_patients: int) -> float:
        """Calcule le pourcentage de patients ayant une date de naissance invalide.

        Args:
            invalid_count: Nombre de patients avec une date de naissance invalide.
            total_patients: Nombre total de patients analyses.

        Returns:
            float: Le pourcentage calcule.
        """

        if total_patients <= 0:
            return 0.0

        return (invalid_count / total_patients) * 100

    def _is_valid_date(self, date_value: str) -> bool:
        """Indique si une valeur respecte le format et les contraintes attendues.

        Args:
            date_value: La valeur de date a verifier.

        Returns:
            bool: `True` si la date est valide, sinon `False`.
        """

        if not self._is_valid_format(date_value):
            return False

        if not self._is_real_date(date_value):
            return False

        if self._is_future_date(date_value):
            return False

        age = self._calculate_age(date_value)
        return self._is_valid_age(age)

    @staticmethod
    def _is_valid_format(date_value: str) -> bool:
        """Indique si une date respecte le format attendu.

        Args:
            date_value: La valeur de date a verifier.

        Returns:
            bool: `True` si le format est valide, sinon `False`.
        """

        try:
            datetime.strptime(date_value, DATE_FORMAT)
        except ValueError:
            return False

        return True

    @staticmethod
    def _is_real_date(date_value: str) -> bool:
        """Indique si une valeur correspond a une date realiste du calendrier.

        Args:
            date_value: La valeur de date a verifier.

        Returns:
            bool: `True` si la date existe, sinon `False`.
        """

        try:
            datetime.strptime(date_value, DATE_FORMAT)
        except ValueError:
            return False

        return True

    @staticmethod
    def _is_future_date(date_value: str) -> bool:
        """Indique si une date est situee dans le futur.

        Args:
            date_value: La valeur de date a verifier.

        Returns:
            bool: `True` si la date est future, sinon `False`.
        """

        parsed_date = datetime.strptime(date_value, DATE_FORMAT).date()
        return parsed_date > date.today()

    def _calculate_age(self, date_value: str) -> int:
        """Calcule l'age a partir d'une date de naissance valide.

        Args:
            date_value: La date de naissance au format attendu.

        Returns:
            int: L'age calcule.
        """

        birth_date = datetime.strptime(date_value, DATE_FORMAT).date()
        today = date.today()

        age = today.year - birth_date.year
        if (today.month, today.day) < (birth_date.month, birth_date.day):
            age -= 1

        return age

    @staticmethod
    def _is_valid_age(age: int) -> bool:
        """Indique si un age respecte la plage autorisee.

        Args:
            age: L'age a verifier.

        Returns:
            bool: `True` si l'age est compris entre 0 et MAX_PATIENT_AGE.
        """

        return 0 <= age <= MAX_PATIENT_AGE

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
    today = date.today()

    sample_patients = [
        {"date_naissance": "1990-01-01"},
        {"date_naissance": (today + timedelta(days=1)).strftime(DATE_FORMAT)},
        {"date_naissance": "2024-02-30"},
        {"date_naissance": "1900-01-01"},
        {"date_naissance": "1990/01/01"},
        {"date_naissance": None},
        {"date_naissance": "   "},
    ]

    check = DateCheck()
    print(check.check(sample_patients))