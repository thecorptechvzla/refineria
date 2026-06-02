-- CreateEnum
CREATE TYPE "ProcessStatus" AS ENUM ('open', 'closed');

-- CreateTable
CREATE TABLE "gold_bars" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "peso_bruto" DOUBLE PRECISION NOT NULL,
    "analitico" DOUBLE PRECISION NOT NULL,
    "esperado" DOUBLE PRECISION NOT NULL,
    "recuperado" DOUBLE PRECISION NOT NULL,
    "disponible" BOOLEAN NOT NULL DEFAULT true,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gold_bars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "processes" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "status" "ProcessStatus" NOT NULL DEFAULT 'open',
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "process_lots" (
    "id" TEXT NOT NULL,
    "process_id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "bar_ids" TEXT[],
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "process_lots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "process_lots" ADD CONSTRAINT "process_lots_process_id_fkey" FOREIGN KEY ("process_id") REFERENCES "processes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
