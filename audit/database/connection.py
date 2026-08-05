"""Utilitaires techniques de connexion a la base MySQL."""

from pathlib import Path
from typing import Optional

import mysql.connector
from mysql.connector.connection import MySQLConnection
from mysql.connector.errors import Error as MySQLError

from audit.config.config import DB_CONFIG


def _missing_database_fields() -> list[str]:
    """Retourne la liste des variables de connexion non renseignees.

    Returns:
        list[str]: Les champs de configuration absents.
    """

    missing_fields = []
    for field_name in ("host", "database", "user"):
        if not DB_CONFIG.get(field_name):
            missing_fields.append(field_name)

    return missing_fields


def get_connection() -> MySQLConnection:
    """Ouvre une connexion MySQL a partir de la configuration du projet.

    Returns:
        MySQLConnection: Une connexion MySQL active.

    Raises:
        ConnectionError: Si la connexion ne peut pas etre etablie
            ou si elle n'est pas active apres l'ouverture.
    """

    missing_fields = _missing_database_fields()
    if missing_fields:
        raise ConnectionError(
            "Configuration MySQL incomplete. Variables manquantes : "
            f"{', '.join(missing_fields)}. Verifier le fichier .env a la racine du projet."
        )

    try:
        connection = mysql.connector.connect(**DB_CONFIG)
    except MySQLError as exc:
        if getattr(exc, "errno", None) == 1049:
            raise ConnectionError(
                "La base MySQL configuree n'existe pas. Verifier DB_NAME dans le fichier .env."
            ) from exc

        raise ConnectionError(
            "Echec de la connexion MySQL avec la configuration fournie."
        ) from exc

    if not connection.is_connected():
        raise ConnectionError("La connexion MySQL a ete creee mais n'est pas active.")

    return connection


def close_connection(connection: Optional[MySQLConnection]) -> None:
    """Ferme proprement une connexion MySQL si elle est ouverte.

    Args:
        connection: La connexion MySQL a fermer.
    """

    if connection is not None and connection.is_connected():
        connection.close()


if __name__ == "__main__":
    mysql_connection = get_connection()
    try:
        print("Connexion MySQL réussie")
    finally:
        close_connection(mysql_connection)
