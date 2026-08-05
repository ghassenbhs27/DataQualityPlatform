START TRANSACTION;

-- Sauvegarde SQL de l'etat initial des patients au 2026-08-05.
-- Ce fichier conserve un instantane reversible via des UPDATE cibles.

UPDATE patients
SET
    ins = '1234567890',
    cin = '12345678',
    nom = 'Ahmed',
    prenom = 'Ali',
    date_naissance = '1998-05-10',
    sexe = 'M',
    telephone = '98123456',
    adresse = 'Tunis',
    email = 'ahmed@gmail.com'
WHERE id = 1;

UPDATE patients
SET
    ins = '1234567890',
    cin = '12345678',
    nom = 'Ahmed',
    prenom = 'Ali',
    date_naissance = '1998-05-10',
    sexe = 'M',
    telephone = '98123456',
    adresse = 'Tunis',
    email = 'ahmed@gmail.com'
WHERE id = 2;

UPDATE patients
SET
    ins = '',
    cin = '12AB5678',
    nom = 'Sara',
    prenom = 'Ben',
    date_naissance = '2001-11-20',
    sexe = 'F',
    telephone = '98123',
    adresse = '',
    email = ''
WHERE id = 3;

UPDATE patients
SET
    ins = '9876543210',
    cin = '87654321',
    nom = 'Mohamed',
    prenom = 'Salah',
    date_naissance = '1985-07-12',
    sexe = 'M',
    telephone = '98AB3456',
    adresse = 'Sousse',
    email = 'mohamed@gmail.com'
WHERE id = 4;

UPDATE patients
SET
    ins = '9876543211',
    cin = '87654322',
    nom = 'Ali',
    prenom = 'Khaled',
    date_naissance = '1992-03-01',
    sexe = 'M',
    telephone = '20123456',
    adresse = 'Sfax',
    email = 'ali@gmail'
WHERE id = 5;

UPDATE patients
SET
    ins = '1231231231',
    cin = '11112222',
    nom = 'Fatma',
    prenom = 'Trabelsi',
    date_naissance = '1995-09-18',
    sexe = 'F',
    telephone = '50123456',
    adresse = 'Nabeul',
    email = 'fatma@gmail.com'
WHERE id = 6;

COMMIT;
