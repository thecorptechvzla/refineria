-- CreateEnum
CREATE TYPE "CriticalType" AS ENUM ('QUIMICO', 'GAS', 'COMBUSTIBLE');

-- AlterEnum
ALTER TYPE "SupplyCategory" ADD VALUE 'CRITICAL';

-- AlterTable
ALTER TABLE "gold_bars" ADD COLUMN     "original_lot" TEXT;

-- AlterTable
ALTER TABLE "supply_items" ADD COLUMN     "critical_type" "CriticalType",
ADD COLUMN     "is_critical" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);
