START TRANSACTION;

-- Scenario ameliore partiel :
-- - corrige deux INS dupliques et un INS invalide supplementaire ;
-- - corrige le CIN invalide ;
-- - conserve certaines anomalies (valeurs manquantes, deux telephones invalides,
--   un e-mail invalide, deux INS invalides) pour garder une comparaison realiste.

UPDATE patients
SET ins = '123456789'
WHERE id = 1;

UPDATE patients
SET ins = '223456789'
WHERE id = 2;

UPDATE patients
SET cin = '12045678'
WHERE id = 3;

UPDATE patients
SET ins = '123123123'
WHERE id = 6;

COMMIT;
