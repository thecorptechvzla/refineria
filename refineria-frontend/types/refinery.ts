export type ProcessStatus = 'open' | 'closed';

export interface GoldBar {
  id: string;
  code: string;
  supplierId: string;
  grossWeight: number;
  ley?: number | null;
  analytical: number;
  expected: number;
  recovered: number;
  available: boolean;
  registrationDate: string;
}

export interface ProcessLot {
  id: string;
  processId: string;
  number: number;
  barIds: string[];
  recovered?: number | null;
  creationDate: string;
}

export interface Process {
  id: string;
  number: number;
  supplierId: string;
  status: ProcessStatus;
  lots: ProcessLot[];
  createdAt: string;
  closedAt?: string;
}
