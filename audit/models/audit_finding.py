"""Modele de resultat d'audit partage par les controles."""

from dataclasses import dataclass


@dataclass(frozen=True)
class AuditFinding:
    """Represente un resultat d'audit standardise.

    Attributes:
        rule: Nom ou identifiant de la regle controlee.
        severity: Niveau de severite associe au resultat.
        results: Donnees detaillees produites par le controle.
        recommendation: Recommandation a appliquer.
        description: Description lisible du constat.
    """

    rule: str
    severity: str
    results: dict
    recommendation: str
    description: str

    def to_dict(self) -> dict:
        """Retourne une representation dictionnaire du resultat.

        Returns:
            dict: Les attributs du modele sous forme de dictionnaire.
        """

        return {
            "rule": self.rule,
            "severity": self.severity,
            "results": self.results,
            "recommendation": self.recommendation,
            "description": self.description,
        }

    def __str__(self) -> str:
        """Retourne une representation lisible du resultat d'audit.

        Returns:
            str: Une chaine concise et exploitable pour les logs.
        """

        return (
            f"AuditFinding(rule={self.rule!r}, severity={self.severity!r}, "
            f"description={self.description!r}, recommendation={self.recommendation!r}, "
            f"results={self.results!r})"
        )