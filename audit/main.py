"""Point d'entree principal du projet d'audit."""

from audit.services.audit_service import AuditService


def main() -> None:
    """Lance l'audit principal et affiche les resultats."""

    try:
        service = AuditService()
        report = service.run()

        print("====================================")
        print()
        print("Audit termine")
        print()
        print(f"Patients analyses : {report.total_patients}")
        print()
        print(f"Score global : {report.score}")
        print()
        print(f"Temps d'execution : {report.duration_seconds:.4f} s")
        print()
        print("====================================")
    except Exception as exc:
        print(f"Erreur lors de l'execution de l'audit : {exc}")
        if exc.__cause__ is not None:
            print(f"Cause : {type(exc.__cause__).__name__} - {exc.__cause__}")
        raise SystemExit(1) from exc


if __name__ == "__main__":
    main()
