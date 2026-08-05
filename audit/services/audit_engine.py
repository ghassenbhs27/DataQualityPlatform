"""Moteur d'audit charge d'executer l'ensemble des controles du projet."""

from typing import Any, Protocol

from audit.checks.cin_check import CINCheck
from audit.checks.date_check import DateCheck
from audit.checks.duplicate_check import DuplicateCheck
from audit.checks.email_check import EmailCheck
from audit.checks.ins_check import INSCheck
from audit.checks.missing_check import MissingCheck
from audit.checks.phone_check import PhoneCheck
from audit.models.audit_finding import AuditFinding


class AuditCheck(Protocol):
    """Definit le contrat minimal attendu pour un controle d'audit."""

    def check(self, patients: list[dict[str, Any]]) -> AuditFinding:
        """Execute le controle sur une liste de patients."""


class AuditEngine:
    """Orchestre l'execution de tous les controles d'audit."""

    def __init__(self) -> None:
        """Initialise le moteur et enregistre les controles dans l'ordre requis."""

        self._checks: list[AuditCheck] = []
        self._register_checks()

    def run(self, patients: list[dict[str, Any]]) -> list[AuditFinding]:
        """Execute tous les controles sur la liste de patients.

        Args:
            patients: La liste des patients a analyser.

        Returns:
            list[AuditFinding]: La liste des resultats produits par les controles.
        """

        findings: list[AuditFinding] = []

        for check in self._checks:
            findings.append(check.check(patients))

        return findings

    def _register_checks(self) -> None:
        """Instancie et enregistre tous les controles dans l'ordre defini."""

        self._checks = [
            MissingCheck(),
            DuplicateCheck(),
            INSCheck(),
            CINCheck(),
            PhoneCheck(),
            EmailCheck(),
            DateCheck(),
        ]


if __name__ == "__main__":
    sample_patients = [
        {
            "ins": "123456789",
            "cin": "12345678",
            "telephone": "71234567",
            "email": "alice@example.com",
            "date_naissance": "1990-01-01",
            "nom": "Dupont",
            "prenom": "Alice",
            "sexe": "F",
            "adresse": "10 rue de Paris",
        },
        {
            "ins": "12345678",
            "cin": "1234567",
            "telephone": "31234567",
            "email": "aliceexample.com",
            "date_naissance": "2026-01-01",
            "nom": None,
            "prenom": "",
            "sexe": "M",
            "adresse": "",
        },
        {
            "ins": "123456789",
            "cin": "12345678",
            "telephone": "7123456",
            "email": "bob@example.com",
            "date_naissance": "1900-01-01",
            "nom": "Martin",
            "prenom": "Bob",
            "sexe": "M",
            "adresse": "Tunis",
        },
    ]

    engine = AuditEngine()
    results = engine.run(sample_patients)

    for finding in results:
        print(finding)