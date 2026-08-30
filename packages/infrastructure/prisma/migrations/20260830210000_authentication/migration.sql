ALTER TABLE "students" ADD COLUMN "passwordHash" TEXT;
UPDATE "students" SET "passwordHash" = 'disabled-account-requires-seed' WHERE "passwordHash" IS NULL;
ALTER TABLE "students" ALTER COLUMN "passwordHash" SET NOT NULL;

CREATE TABLE "auth_sessions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "auth_sessions_tokenHash_key" ON "auth_sessions"("tokenHash");
CREATE INDEX "auth_sessions_studentId_idx" ON "auth_sessions"("studentId");
CREATE INDEX "auth_sessions_expiresAt_idx" ON "auth_sessions"("expiresAt");
ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
