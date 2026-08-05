"""Centralise la configuration technique de l'application.

Ce module charge les variables d'environnement depuis le fichier `.env`
place a la racine du projet, puis expose la configuration de connexion
base de donnees sous forme de dictionnaire.
"""

from pathlib import Path
import os

from dotenv import load_dotenv


# Le fichier `.env` est attendu a la racine du projet.
PROJECT_ROOT = Path(__file__).resolve().parents[2]
ENV_FILE = PROJECT_ROOT / ".env"

# Charge automatiquement les variables d'environnement au moment de l'import.
load_dotenv(dotenv_path=ENV_FILE)


DB_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": int(os.getenv("DB_PORT", "3306")),
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
}


if __name__ == "__main__":
    print(DB_CONFIG)
