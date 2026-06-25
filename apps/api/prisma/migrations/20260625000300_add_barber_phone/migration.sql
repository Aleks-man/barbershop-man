ALTER TABLE "Barber" ADD COLUMN "phone" TEXT;

WITH numbered_barbers AS (
  SELECT
    id,
    row_number() OVER (ORDER BY name, id) AS row_number
  FROM "Barber"
)
UPDATE "Barber"
SET "phone" = CASE numbered_barbers.row_number
  WHEN 1 THEN '+7 (978) 111-22-33'
  WHEN 2 THEN '+7 (978) 222-33-44'
  WHEN 3 THEN '+7 (978) 333-44-55'
  WHEN 4 THEN '+7 (978) 444-55-66'
  ELSE '+7 (978) 555-66-77'
END
FROM numbered_barbers
WHERE "Barber".id = numbered_barbers.id;
