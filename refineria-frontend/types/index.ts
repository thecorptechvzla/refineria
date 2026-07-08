export type Role = 'ADMIN' | 'OWNER' | 'SUPERADMIN';

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

export interface SupplierImpact {
  supplierName: string;
  transactions: number;
  goldBars: number;
  processes: number;
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
  supplier?: { name: string };
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

export interface CustomFieldDefinition {
  id: string;
  tableName: string;
  fieldName: string;
  fieldType: 'text' | 'number' | 'date' | 'select';
  options: string | null;
  required: boolean;
  order: number;
}

export interface CustomFieldValue {
  id: string;
  tableName: string;
  recordId: string;
  fieldId: string;
  value: string | null;
  field: CustomFieldDefinition;
}

export type SupplyCategory = 'OPERATIONS' | 'GENERAL_SERVICES';
export type SupplyTransactionType = 'IN' | 'OUT';
export type CriticalType = 'QUIMICO' | 'GAS' | 'COMBUSTIBLE';

export interface SupplyItem {
  id: string;
  code: string;
  name: string;
  category: SupplyCategory;
  unit: string;
  currentStock: number;
  criticalLevel: number;
  isCritical: boolean;
  criticalType: CriticalType | null;
}

export interface SupplyTransaction {
  id: string;
  itemId: string;
  type: SupplyTransactionType;
  quantity: number;
  date: string;
  reference?: string;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
