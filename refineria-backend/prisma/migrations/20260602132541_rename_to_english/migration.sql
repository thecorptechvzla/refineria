/*
  Warnings:

  - You are about to drop the column `analitico` on the `gold_bars` table. All the data in the column will be lost.
  - You are about to drop the column `codigo` on the `gold_bars` table. All the data in the column will be lost.
  - You are about to drop the column `disponible` on the `gold_bars` table. All the data in the column will be lost.
  - You are about to drop the column `esperado` on the `gold_bars` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_registro` on the `gold_bars` table. All the data in the column will be lost.
  - You are about to drop the column `peso_bruto` on the `gold_bars` table. All the data in the column will be lost.
  - You are about to drop the column `recuperado` on the `gold_bars` table. All the data in the column will be lost.
  - You are about to drop the column `fecha_creacion` on the `process_lots` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `process_lots` table. All the data in the column will be lost.
  - You are about to drop the column `numero` on the `processes` table. All the data in the column will be lost.
  - Added the required column `analytical` to the `gold_bars` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `gold_bars` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expected` to the `gold_bars` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gross_weight` to the `gold_bars` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recovered` to the `gold_bars` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `process_lots` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `processes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gold_bars" DROP COLUMN "analitico",
DROP COLUMN "codigo",
DROP COLUMN "disponible",
DROP COLUMN "esperado",
DROP COLUMN "fecha_registro",
DROP COLUMN "peso_bruto",
DROP COLUMN "recuperado",
ADD COLUMN     "analytical" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "available" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "expected" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "gross_weight" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "recovered" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "process_lots" DROP COLUMN "fecha_creacion",
DROP COLUMN "numero",
ADD COLUMN     "creation_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "number" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "processes" DROP COLUMN "numero",
ADD COLUMN     "number" INTEGER NOT NULL;
