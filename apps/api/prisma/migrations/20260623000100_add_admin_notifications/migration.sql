CREATE TABLE "AdminNotification" (
    "id" TEXT NOT NULL,
    "recipientRole" TEXT NOT NULL,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appointmentId" TEXT NOT NULL,
    "barberId" TEXT,

    CONSTRAINT "AdminNotification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AdminNotification_recipientRole_readAt_createdAt_idx" ON "AdminNotification"("recipientRole", "readAt", "createdAt");

CREATE INDEX "AdminNotification_barberId_readAt_createdAt_idx" ON "AdminNotification"("barberId", "readAt", "createdAt");

ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AdminNotification" ADD CONSTRAINT "AdminNotification_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE CASCADE ON UPDATE CASCADE;
