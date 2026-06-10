/*
  Warnings:

  - Made the column `rif` on table `suppliers` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "suppliers" ALTER COLUMN "rif" SET NOT NULL;
