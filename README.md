# DataQualityPlatform

Application complète d'audit et de pilotage de la qualité des données patients.

Le projet fonctionne selon le flux suivant :

`React` → `FastAPI` → `Backend Python` → `MySQL`

L'objectif est de détecter, mesurer, historiser et visualiser les anomalies de qualité de données à partir d'une table `patients`.

## Objectif du projet

`DataQualityPlatform` permet de :

- analyser automatiquement les données patients ;
- calculer un score global de qualité ;
- historiser chaque audit dans la base ;
- afficher les résultats dans une interface web moderne ;
- comparer plusieurs audits réels dans le temps ;
- prioriser les actions correctives.

## Architecture

```text
ProjetDataQuality/
├── api/                 # API REST FastAPI
├── audit/               # Moteur d'audit Python
├── database/            # Schéma SQL et scénarios de données
├── frontend/            # Interface React / Vite
├── powerbi/             # Espace réservé aux rapports BI
├── requirements.txt
└── README.md
```

## Backend Python

Le dossier `audit/` suit une séparation claire des responsabilités :

- `config/` : configuration technique et règles du projet
- `database/` : connexion MySQL
- `repositories/` : accès aux données
- `services/` : orchestration du workflow d'audit
- `checks/` : règles de contrôle qualité
- `models/` : structures métier

Le moteur d'audit exécute actuellement les contrôles suivants :

- `MISSING_VALUES`
- `DUPLICATE_VALUES`
- `INVALID_INS`
- `INVALID_CIN`
- `INVALID_PHONE`
- `INVALID_EMAIL`
- `INVALID_DATE`

Chaque audit produit :

- un score global ;
- un nombre total d'anomalies ;
- une répartition par sévérité ;
- un détail par règle ;
- une persistance en base dans `audit_history` et `audit_results`.

## API FastAPI

Le dossier `api/` expose les services existants sans dupliquer la logique métier.

Endpoints principaux :

- `GET /dashboard`
- `GET /audit/history`
- `GET /audit/results`
- `POST /audit/run`

## Frontend React

Le frontend a été développé avec :

- `React`
- `Vite`
- `Material UI`
- `React Router`
- `Axios`
- `Recharts`
- `MUI DataGrid`

Pages disponibles :

- `Dashboard`
- `Historique`
- `Résultats`
- `Recommandations`
- `Comparaison des audits`

L'interface permet notamment :

- l'affichage des KPI du dernier audit ;
- la visualisation des anomalies par règle et par sévérité ;
- l'historique des audits ;
- la consultation détaillée des résultats ;
- la priorisation des recommandations ;
- la comparaison de deux audits persistés.

## Comparaison des audits

La page `Comparaison des audits` permet de sélectionner un `Audit A` et un `Audit B` puis d'afficher :

- l'évolution du score global ;
- l'évolution du nombre total d'anomalies ;
- l'évolution des anomalies critiques, majeures et mineures ;
- un tableau comparatif par règle ;
- une synthèse décisionnelle déterministe ;
- une priorisation des actions restantes.

Les comparaisons s'appuient uniquement sur les données persistées dans :

- `audit_history`
- `audit_results`

## Scénarios de données

Le dossier `database/scenarios/` contient des scripts SQL réversibles pour tester plusieurs états de données patients sans modifier le moteur d'audit.

Scripts disponibles :

- `backup_initial_patients.sql`
- `apply_improved_patients.sql`
- `restore_initial_patients.sql`

Ces scripts permettent :

- de conserver un état initial ;
- d'appliquer un scénario amélioré partiel ;
- de restaurer les données d'origine.

## Lancement du projet

### 1. Backend / API

Installer les dépendances Python puis lancer FastAPI :

```bash
pip install -r requirements.txt
python -m uvicorn api.main:app --host 127.0.0.1 --port 8000
```

### 2. Frontend

Depuis le dossier `frontend/` :

```bash
npm install
npm run dev
```

Build de production :

```bash
npm run build
```

## Base de données

La configuration MySQL est chargée depuis le fichier `.env` à la racine du projet.

Variables attendues :

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

## État actuel

Le projet est aujourd'hui capable de :

- lancer un audit réel à partir des données `patients` ;
- persister les audits en base ;
- afficher les résultats dans une interface web complète ;
- comparer plusieurs audits réels ;
- restaurer le scénario initial de données après test.

## Remarque

Le moteur d'audit, le calcul des scores et les contrôles qualité restent centralisés dans le backend Python.  
Le frontend et l'API se contentent d'exposer et de visualiser les résultats produits.
