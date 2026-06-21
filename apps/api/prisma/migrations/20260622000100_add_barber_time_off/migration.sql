CREATE TABLE "BarberTimeOff" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "barberId" TEXT NOT NULL,

    CONSTRAINT "BarberTimeOff_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BarberTimeOff_barberId_startsAt_idx" ON "BarberTimeOff"("barberId", "startsAt");

ALTER TABLE "BarberTimeOff" ADD CONSTRAINT "BarberTimeOff_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
