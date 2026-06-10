ALTER TABLE "suppliers" ADD COLUMN "rif" TEXT;
CREATE UNIQUE INDEX "suppliers_rif_key" ON "suppliers"("rif");