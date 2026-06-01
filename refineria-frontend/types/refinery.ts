export type ProcessStatus = 'open' | 'closed';

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
  barIds: string[];
  fechaCreacion: string;
}

export interface Process {
  id: string;
  numero: number;
  supplierId: string;
  status: ProcessStatus;
  lotes: ProcessLot[];
  createdAt: string;
  closedAt?: string;
}
