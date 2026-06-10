export type Role = 'ADMIN' | 'SUPERADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Supplier {
  id: string;
  name: string;
  rif: string;
  contactInfo: string;
  registrationDate: string;
}

export type TransactionType = 'IN' | 'OUT';

export type WeightUnit = 'g' | 'kg';

export interface Transaction {
  id: string;
  type: TransactionType;
  weight: number;
  weightUnit: WeightUnit;
  purity: number;
  supplierId?: string;
  date: string;
}

export type WorkerStatus = 'active' | 'inactive';

export interface Worker {
  id: string;
  name: string;
  position: string;
  status: WorkerStatus;
  startDate: string;
}
