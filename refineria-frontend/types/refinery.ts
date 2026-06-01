export interface GoldBar {
  id: string;
  codigo: string;
  supplierId: string;
  pesoBruto: number;
  analitico: number;
  esperado: number;
  recuperado: number;
  disponible: boolean;
  fechaRegistro: string;
}

export interface ProcessLot {
  id: string;
  numero: number;
  supplierId: string;
  barIds: string[];
  fechaCreacion: string;
}
