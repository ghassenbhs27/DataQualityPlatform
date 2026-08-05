"""Centralise toutes les regles metier du projet d'audit."""

# ==========================
# Identite patient
# ==========================

INS_LENGTH = 9

CIN_LENGTH = 8

# ==========================
# Telephone
# ==========================

PHONE_LENGTH = 8

ALLOWED_PHONE_PREFIXES = (
    "2",
    "4",
    "5",
    "7",
    "9",
)

# ==========================
# Patient
# ==========================

ALLOWED_GENDERS = (
    "M",
    "F",
)

MAX_PATIENT_AGE = 120

# ==========================
# Date
# ==========================

DATE_FORMAT = "%Y-%m-%d"

DATE_TIME_SEPARATOR = " "

# ==========================
# Email
# ==========================

EMAIL_MAX_LENGTH = 254

EMAIL_AT_SYMBOL = "@"

EMAIL_DOT_SYMBOL = "."

EMAIL_SPACE_SYMBOL = " "

# ==========================
# Audit
# ==========================

CRITICAL = "Critique"

MAJOR = "Majeure"

MINOR = "Mineure"

# ==========================
# Audit Rules
# ==========================

RULE_MISSING = "MISSING_VALUES"

RULE_DUPLICATE = "DUPLICATE_VALUES"

RULE_INVALID_INS = "INVALID_INS"

RULE_INVALID_CIN = "INVALID_CIN"

RULE_INVALID_PHONE = "INVALID_PHONE"

RULE_INVALID_EMAIL = "INVALID_EMAIL"

RULE_INVALID_DATE = "INVALID_DATE"

RULE_INVALID_GENDER = "INVALID_GENDER"

DESCRIPTION_INVALID_DATE = "Validation des dates de naissance."

RECOMMENDATION_INVALID_DATE = (
    "Corriger les dates invalides afin de garantir la fiabilite des "
    "informations administratives."
)