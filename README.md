# 🏥 DataQualityPlatform

> **Plateforme d'audit et d'aide à la décision pour la qualité des données patients**

Application web complète permettant de contrôler, mesurer, historiser et visualiser la qualité des données patients grâce à un moteur d'audit Python, une API FastAPI et une interface React moderne.

---

## 📌 Aperçu

Le projet suit l'architecture suivante :

```text
React
   │
Axios
   │
FastAPI
   │
Backend Python
   │
MySQL
```

L'objectif est de :

- détecter automatiquement les anomalies de qualité des données ;
- calculer un score global de qualité ;
- historiser les audits réalisés ;
- comparer plusieurs audits dans le temps ;
- aider les décideurs à prioriser les actions correctives.

---

# 📑 Table des matières

- [Objectif](#-objectif)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Fonctionnalités](#-fonctionnalités)
- [Backend Python](#-backend-python)
- [API FastAPI](#-api-fastapi)
- [Frontend React](#-frontend-react)
- [Comparaison des audits](#-comparaison-des-audits)
- [Scénarios de données](#-scénarios-de-données)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [État actuel](#-état-actuel)

---

# 🎯 Objectif

La plateforme permet de :

- ✅ Auditer automatiquement les données patients
- ✅ Détecter les anomalies de qualité
- ✅ Calculer un score global de qualité
- ✅ Historiser chaque audit
- ✅ Comparer plusieurs audits
- ✅ Prioriser les actions correctives
- ✅ Fournir une aide à la décision

---

# 🏗️ Architecture

```text
ProjetDataQuality/
│
├── api/                  # API REST FastAPI
├── audit/                # Moteur d'audit Python
├── database/             # Schéma SQL et scénarios
├── frontend/             # Application React
├── powerbi/              # Rapports BI (expérimentation)
│
├── requirements.txt
└── README.md
```

---

# 🛠️ Technologies

| Couche | Technologies |
|---------|--------------|
| Frontend | React, Vite, Material UI, Recharts, Axios |
| Backend | Python |
| API | FastAPI |
| Base de données | MySQL |
| Visualisation | MUI DataGrid |
| Gestion de versions | Git / GitHub |

---

# 🚀 Fonctionnalités

## ✔ Audit des données

Le moteur d'audit contrôle automatiquement :

- valeurs manquantes
- doublons
- INS invalides
- CIN invalides
- téléphones invalides
- e-mails invalides
- dates invalides

Chaque audit génère :

- score global
- nombre d'anomalies
- niveau de sévérité
- recommandations
- historique complet

---

## 📊 Tableau de bord

Le Dashboard permet de visualiser :

- Score global
- KPI
- Répartition des anomalies
- Historique
- Graphiques interactifs
- Priorités d'action

---

## 📈 Historique

- consultation des audits
- évolution du score
- évolution des anomalies
- statistiques

---

## 📋 Résultats

- DataGrid interactif
- recherche
- filtres
- tri
- export CSV

---

## 💡 Recommandations

Pour chaque règle :

- niveau de priorité
- gravité
- nombre de patients concernés
- action recommandée

---

## 📉 Comparaison des audits

La plateforme permet de comparer deux audits réels.

Les indicateurs suivants sont calculés :

- évolution du score global
- évolution du nombre d'anomalies
- évolution par gravité
- comparaison par règle
- synthèse décisionnelle
- priorités d'action

Toutes les comparaisons reposent exclusivement sur les données persistées dans :

- `audit_history`
- `audit_results`

---

# ⚙️ Backend Python

Le backend est organisé selon une architecture en couches.

```text
audit/
│
├── config/
├── database/
├── repositories/
├── services/
├── checks/
└── models/
```

Le moteur d'audit centralise toute la logique métier.

Aucun calcul n'est réalisé dans FastAPI ou React.

---

# 🌐 API FastAPI

L'API expose uniquement les services existants.

## Endpoints

| Méthode | Endpoint |
|---------|----------|
| GET | `/dashboard` |
| GET | `/audit/history` |
| GET | `/audit/results` |
| POST | `/audit/run` |

---

# 💻 Frontend React

Le frontend est développé avec :

- React
- Vite
- Material UI
- React Router
- Axios
- Recharts
- MUI DataGrid

Pages disponibles :

- Dashboard
- Historique
- Résultats
- Recommandations
- Comparaison des audits

---

# 🗄️ Scénarios de données

Le dossier :

```text
database/scenarios/
```

contient des scripts SQL permettant :

- sauvegarder les données initiales ;
- appliquer un scénario amélioré ;
- restaurer l'état d'origine.

Scripts :

- `backup_initial_patients.sql`
- `apply_improved_patients.sql`
- `restore_initial_patients.sql`

---

# ⚡ Installation

## Backend

```bash
pip install -r requirements.txt

python -m uvicorn api.main:app --host 127.0.0.1 --port 8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

## Build

```bash
npm run build
```

---

# ⚙️ Configuration

Créer un fichier `.env` à la racine du projet contenant :

```env
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

---

# ✅ État actuel

La plateforme permet aujourd'hui de :

- lancer un audit réel
- calculer un score global
- historiser les audits
- comparer plusieurs audits
- visualiser les résultats
- prioriser les actions correctives
- restaurer plusieurs scénarios de données

---

# 📌 Principe d'architecture

La logique métier est entièrement centralisée dans le backend Python.

```text
React
     │
Axios
     │
FastAPI
     │
AuditService
     │
AuditEngine
     │
ScoreService
     │
Repositories
     │
MySQL
```

FastAPI expose uniquement les données.

React se limite à leur visualisation.

Cette séparation garantit une architecture modulaire, maintenable et évolutive.
