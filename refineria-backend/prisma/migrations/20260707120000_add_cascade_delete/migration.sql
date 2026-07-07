-- Add FK with CASCADE to gold_bars
ALTER TABLE "gold_bars" ADD CONSTRAINT "gold_bars_supplier_id_fkey"
  FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Add FK with CASCADE to processes
ALTER TABLE "processes" ADD CONSTRAINT "processes_supplier_id_fkey"
  FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Change transactions FK from SET NULL to CASCADE
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_supplier_id_fkey";
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_supplier_id_fkey"
  FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
