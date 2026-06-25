CREATE TABLE "StaffCredential" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffCredential_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StaffCredential_role_key" ON "StaffCredential"("role");
