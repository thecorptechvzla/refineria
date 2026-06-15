export type ProcessStatus = 'open' | 'in_progress' | 'closed';

export interface GoldBar {
  id: string;
  code: string;
  supplierId: string;
  grossWeight: number;
  ley?: number | null;
  analytical: number;
  expected: number;
  recovered: number;
  leyAg?: number | null;
  analyticalAg?: number | null;
  available: boolean;
  registrationDate: string;
}

export interface ProcessLot {
  id: string;
  processId: string;
  number: number;
  barIds: string[];
  recovered?: number | null;
  egresadoG: number;
  creationDate: string;
}

export interface Process {
  id: string;
  number: string;
  supplierId: string;
  status: ProcessStatus;
  lots: ProcessLot[];
  createdAt: string;
  closedAt?: string;
  actaRecepcion?: string | null;
  actaFundicion?: string | null;
  actaConformidad?: string | null;
}
