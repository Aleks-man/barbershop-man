ALTER TABLE "Barber" ADD COLUMN "isProtected" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "StaffCredential" ADD COLUMN "isProtected" BOOLEAN NOT NULL DEFAULT false;

UPDATE "Barber"
SET "isProtected" = true
WHERE "name" IN ('Антон', 'Макс', 'Денис', 'Алекс');

UPDATE "StaffCredential"
SET "isProtected" = true
WHERE "role" = 'admin';
