CREATE TABLE "opec_functions" (
    "id" TEXT NOT NULL,
    "opecId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "sourceHash" TEXT NOT NULL,
    "sourceFileKey" TEXT NOT NULL,
    "sourceReferenceId" TEXT,
    "pageStart" INTEGER,
    "pageEnd" INTEGER,
    "charStart" INTEGER,
    "charEnd" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "opec_functions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "opec_functions_opecId_fkey" FOREIGN KEY ("opecId") REFERENCES "opecs"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "opec_functions_opecId_order_key" ON "opec_functions"("opecId", "order");
CREATE INDEX "opec_functions_sourceReferenceId_idx" ON "opec_functions"("sourceReferenceId");
