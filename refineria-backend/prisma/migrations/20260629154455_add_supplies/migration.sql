-- CreateEnum
CREATE TYPE "SupplyCategory" AS ENUM ('OPERATIONS', 'GENERAL_SERVICES');

-- CreateEnum
CREATE TYPE "SupplyTransactionType" AS ENUM ('IN', 'OUT');

-- CreateTable
CREATE TABLE "supply_items" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "SupplyCategory" NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'UNIDAD',
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "criticalLevel" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "supply_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supply_transactions" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "type" "SupplyTransactionType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reference" TEXT,

    CONSTRAINT "supply_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "supply_items_code_key" ON "supply_items"("code");

-- AddForeignKey
ALTER TABLE "supply_transactions" ADD CONSTRAINT "supply_transactions_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "supply_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
