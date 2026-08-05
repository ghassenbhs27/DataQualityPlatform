"""Service charge du calcul des scores de qualite a partir des constats d'audit."""

from typing import Any, TypedDict

from audit.config.rules import (
    RULE_DUPLICATE,
    RULE_INVALID_CIN,
    RULE_INVALID_DATE,
    RULE_INVALID_EMAIL,
    RULE_INVALID_INS,
    RULE_INVALID_PHONE,
    RULE_MISSING,
)
from audit.models.audit_finding import AuditFinding


class ScoreComputationResult(TypedDict):
    """Structure du resultat retourne par le service de score."""

    control_scores: dict[str, float]
    dimension_scores: dict[str, float]
    global_score: float


class ScoreService:
    """Calcule les scores de qualite a partir de resultats d'audit."""

    _DEFAULT_SCORE = 100.0
    _SCORE_MIN = 0.0
    _SCORE_MAX = 100.0
    _SCORE_PRECISION = 2

    _DIMENSION_CONFIG: dict[str, dict[str, Any]] = {
        "Complétude": {
            "weight": 25.0,
            "controls": ((RULE_MISSING, 1.0), ("missing_", 1.0)),
        },
        "Unicité": {
            "weight": 15.0,
            "controls": ((RULE_DUPLICATE, 1.0),),
        },
        "Identité": {
            "weight": 40.0,
            "controls": ((RULE_INVALID_INS, 0.65), (RULE_INVALID_CIN, 0.35)),
        },
        "Coordonnées": {
            "weight": 10.0,
            "controls": ((RULE_INVALID_PHONE, 0.5), (RULE_INVALID_EMAIL, 0.5)),
        },
        "Cohérence": {
            "weight": 10.0,
            "controls": ((RULE_INVALID_DATE, 1.0),),
        },
    }

    def calculate(self, findings: list[AuditFinding]) -> ScoreComputationResult:
        """Calcule les scores par controle, par dimension et globalement.

        Args:
            findings: La liste des constats d'audit a convertir en scores.

        Returns:
            ScoreComputationResult: Le detail des scores calcules.
        """

        control_scores: dict[str, float] = {}
        dimension_buckets: dict[str, list[tuple[float, float]]] = {
            dimension_name: [] for dimension_name in self._DIMENSION_CONFIG
        }

        for finding in findings:
            control_score = self._calculate_control_score(finding)
            control_scores[finding.rule] = control_score

            dimension_name, control_weight = self._resolve_dimension(finding.rule)
            if dimension_name is None:
                continue

            dimension_buckets[dimension_name].append((control_score, control_weight))

        dimension_scores = self._calculate_dimension_scores(dimension_buckets)
        global_score = self._calculate_global_score(dimension_scores)

        return {
            "control_scores": control_scores,
            "dimension_scores": dimension_scores,
            "global_score": global_score,
        }

    def _calculate_control_score(self, finding: AuditFinding) -> float:
        """Calcule le score d'un controle a partir de son taux de non-conformite.

        Args:
            finding: Le constat d'audit a convertir en score.

        Returns:
            float: Le score du controle entre 0 et 100.
        """

        non_conformity_rate = self._extract_non_conformity_rate(finding)
        score = self._DEFAULT_SCORE - non_conformity_rate
        return round(self._clamp_score(score), self._SCORE_PRECISION)

    def _calculate_dimension_scores(
        self, dimension_buckets: dict[str, list[tuple[float, float]]]
    ) -> dict[str, float]:
        """Agrege les scores des controles pour obtenir les scores par dimension.

        Args:
            dimension_buckets: Les scores des controles regroupes par dimension.

        Returns:
            dict[str, float]: Les scores calcules pour chaque dimension.
        """

        dimension_scores: dict[str, float] = {}

        for dimension_name, control_scores in dimension_buckets.items():
            if not control_scores:
                dimension_scores[dimension_name] = self._DEFAULT_SCORE
                continue

            weighted_sum = sum(score * weight for score, weight in control_scores)
            weight_sum = sum(weight for _, weight in control_scores)

            if weight_sum <= 0:
                dimension_scores[dimension_name] = self._DEFAULT_SCORE
                continue

            dimension_score = weighted_sum / weight_sum
            dimension_scores[dimension_name] = round(
                self._clamp_score(dimension_score), self._SCORE_PRECISION
            )

        return dimension_scores

    def _calculate_global_score(self, dimension_scores: dict[str, float]) -> float:
        """Calcule le score global a partir des scores de dimension.

        Args:
            dimension_scores: Les scores calcules pour chaque dimension.

        Returns:
            float: Le score global entre 0 et 100.
        """

        weighted_sum = 0.0
        weight_sum = 0.0

        for dimension_name, dimension_data in self._DIMENSION_CONFIG.items():
            dimension_weight = float(dimension_data["weight"])
            weighted_sum += dimension_scores.get(dimension_name, self._DEFAULT_SCORE) * dimension_weight
            weight_sum += dimension_weight

        if weight_sum <= 0:
            return self._DEFAULT_SCORE

        global_score = weighted_sum / weight_sum
        return round(self._clamp_score(global_score), self._SCORE_PRECISION)

    def _resolve_dimension(self, rule: str) -> tuple[str | None, float]:
        """Retrouve la dimension et le poids associe a un controle.

        Args:
            rule: La regle associee au constat.

        Returns:
            tuple[str | None, float]: Le nom de la dimension et son poids local.
        """

        for dimension_name, dimension_data in self._DIMENSION_CONFIG.items():
            for control_rule, control_weight in dimension_data["controls"]:
                if self._matches_rule(rule, control_rule):
                    return dimension_name, float(control_weight)

        return None, 0.0

    @staticmethod
    def _matches_rule(rule: str, control_rule: str) -> bool:
        """Indique si une regle correspond a un controle declare.

        Args:
            rule: La regle a verifier.
            control_rule: La regle de reference configuree.

        Returns:
            bool: `True` si les regles correspondent, sinon `False`.
        """

        return rule == control_rule or rule.startswith(control_rule)

    @staticmethod
    def _extract_non_conformity_rate(finding: AuditFinding) -> float:
        """Extrait le taux de non-conformite depuis un AuditFinding.

        Args:
            finding: Le constat d'audit a analyser.

        Returns:
            float: Le taux de non-conformite exprime en pourcentage.
        """

        raw_rate = finding.results.get("percentage", 0.0)

        try:
            return float(raw_rate)
        except (TypeError, ValueError):
            return 0.0

    def _clamp_score(self, score: float) -> float:
        """Contraint un score dans l'intervalle autorise.

        Args:
            score: Le score a contraindre.

        Returns:
            float: Le score borne entre 0 et 100.
        """

        return max(self._SCORE_MIN, min(self._SCORE_MAX, score))


if __name__ == "__main__":
    sample_findings = [
        AuditFinding(
            rule=RULE_MISSING,
            severity="Critique",
            results={"percentage": 18.0},
            recommendation="Completer les champs manquants.",
            description="Controle de completude.",
        ),
        AuditFinding(
            rule=RULE_DUPLICATE,
            severity="Critique",
            results={"percentage": 6.0},
            recommendation="Corriger les doublons.",
            description="Controle d'unicite.",
        ),
        AuditFinding(
            rule=RULE_INVALID_INS,
            severity="Critique",
            results={"percentage": 4.0},
            recommendation="Corriger les INS invalides.",
            description="Controle de l'INS.",
        ),
        AuditFinding(
            rule=RULE_INVALID_CIN,
            severity="Critique",
            results={"percentage": 2.0},
            recommendation="Corriger les CIN invalides.",
            description="Controle du CIN.",
        ),
        AuditFinding(
            rule=RULE_INVALID_PHONE,
            severity="Majeure",
            results={"percentage": 5.0},
            recommendation="Corriger les numeros invalides.",
            description="Controle du telephone.",
        ),
        AuditFinding(
            rule=RULE_INVALID_EMAIL,
            severity="Majeure",
            results={"percentage": 3.0},
            recommendation="Corriger les emails invalides.",
            description="Controle de l'email.",
        ),
        AuditFinding(
            rule=RULE_INVALID_DATE,
            severity="Majeure",
            results={"percentage": 8.0},
            recommendation="Corriger les dates invalides.",
            description="Controle de la date de naissance.",
        ),
    ]

    score_service = ScoreService()
    score_result = score_service.calculate(sample_findings)

    print("Scores par controle :")
    for rule, score in score_result["control_scores"].items():
        print(f"- {rule} : {score}")

    print()
    print("Scores par dimension :")
    for dimension_name, score in score_result["dimension_scores"].items():
        print(f"- {dimension_name} : {score}")

    print()
    print(f"Score global : {score_result['global_score']}")