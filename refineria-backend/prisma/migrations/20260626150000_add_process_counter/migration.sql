-- CreateTable
CREATE TABLE "process_counters" (
    "supplier_id" TEXT NOT NULL,
    "seq" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "process_counters_pkey" PRIMARY KEY ("supplier_id")
);
