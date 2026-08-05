"""Acces aux donnees de la table `patients`."""

from typing import Any

from audit.database.connection import close_connection, get_connection


class PatientRepository:
    """Repository responsable des lectures sur la table `patients`."""

    def get_all_patients(self) -> list[dict[str, Any]]:
        """Recupere tous les patients tries par identifiant croissant.

        Returns:
            list[dict[str, Any]]: La liste complete des patients.
        """

        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        try:
            cursor.execute(
                """
                SELECT *
                FROM patients
                ORDER BY id
                """
            )
            patients = cursor.fetchall()
        finally:
            cursor.close()
            close_connection(connection)

        return patients

    def count_patients(self) -> int:
        """Compte le nombre total de patients en base.

        Returns:
            int: Le nombre de lignes presentes dans la table `patients`.
        """

        connection = get_connection()
        cursor = connection.cursor()

        try:
            cursor.execute(
                """
                SELECT COUNT(*)
                FROM patients
                """
            )
            result = cursor.fetchone()
        finally:
            cursor.close()
            close_connection(connection)

        return int(result[0]) if result is not None else 0


if __name__ == "__main__":
    repository = PatientRepository()
    print(f"Nombre de patients : {repository.count_patients()}")

    for patient in repository.get_all_patients()[:3]:
        print(patient)
