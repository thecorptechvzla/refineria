import { Supplier, Transaction, User, Worker } from '@/types';

export const mockUsers: User[] = [
  { id: '1', name: 'César Mendoza', email: 'admin@goldtrack.com', role: 'ADMIN' },
  { id: '2', name: 'Alejandro Vargas', email: 'dueno@goldtrack.com', role: 'SUPERADMIN' },
];

export const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'Minera Los Andes SAC', contactInfo: 'contacto@losandes.pe | +51 987 654 321', registrationDate: '2023-01-15T10:00:00Z' },
  { id: 's2', name: 'Cooperativa Aurífera del Sur', contactInfo: 'ventas@coopaurifera.com | +51 976 543 210', registrationDate: '2023-03-22T14:30:00Z' },
  { id: 's3', name: 'Corporación Minera Dorado', contactInfo: 'info@doradocorp.pe | +51 965 432 109', registrationDate: '2023-06-10T09:00:00Z' },
  { id: 's4', name: 'Inversiones El Dorado EIRL', contactInfo: 'operaciones@eldorado.pe | +51 954 321 098', registrationDate: '2023-08-05T11:45:00Z' },
  { id: 's5', name: 'Compañía Minera del Centro', contactInfo: 'logistica@cmcentro.pe | +51 943 210 987', registrationDate: '2024-01-20T08:30:00Z' },
  { id: 's6', name: 'Sociedad Minera Río Seco', contactInfo: 'admin@rioseco.pe | +51 932 109 876', registrationDate: '2024-04-12T16:00:00Z' },
];

export const mockTransactions: Transaction[] = [
  { id: 't01', type: 'IN', weight: 3.5, weightUnit: 'kg', purity: 0.95, supplierId: 's1', date: '2024-01-08T09:15:00Z' },
  { id: 't02', type: 'IN', weight: 1.2, weightUnit: 'kg', purity: 0.92, supplierId: 's2', date: '2024-01-15T14:30:00Z' },
  { id: 't03', type: 'OUT', weight: 2.0, weightUnit: 'kg', purity: 0.99, supplierId: 's1', date: '2024-02-01T11:00:00Z' },
  { id: 't04', type: 'IN', weight: 850, weightUnit: 'g', purity: 0.88, supplierId: 's3', date: '2024-02-18T10:45:00Z' },
  { id: 't05', type: 'IN', weight: 2.8, weightUnit: 'kg', purity: 0.94, supplierId: 's4', date: '2024-03-05T08:20:00Z' },
  { id: 't06', type: 'IN', weight: 1.5, weightUnit: 'kg', purity: 0.91, supplierId: 's1', date: '2024-03-22T16:10:00Z' },
  { id: 't07', type: 'OUT', weight: 1.0, weightUnit: 'kg', purity: 0.99, supplierId: 's2', date: '2024-04-10T09:30:00Z' },
  { id: 't08', type: 'IN', weight: 620, weightUnit: 'g', purity: 0.85, supplierId: 's5', date: '2024-04-28T13:15:00Z' },
  { id: 't09', type: 'IN', weight: 4.2, weightUnit: 'kg', purity: 0.96, supplierId: 's3', date: '2024-05-14T11:00:00Z' },
  { id: 't10', type: 'OUT', weight: 3.0, weightUnit: 'kg', purity: 0.99, supplierId: 's4', date: '2024-06-01T15:45:00Z' },
  { id: 't11', type: 'IN', weight: 1.8, weightUnit: 'kg', purity: 0.93, supplierId: 's6', date: '2024-06-20T08:30:00Z' },
  { id: 't12', type: 'IN', weight: 950, weightUnit: 'g', purity: 0.89, supplierId: 's2', date: '2024-07-08T10:00:00Z' },
  { id: 't13', type: 'IN', weight: 2.3, weightUnit: 'kg', purity: 0.94, supplierId: 's1', date: '2024-07-25T14:20:00Z' },
  { id: 't14', type: 'OUT', weight: 1.5, weightUnit: 'kg', purity: 0.99, supplierId: 's5', date: '2024-08-12T09:00:00Z' },
  { id: 't15', type: 'IN', weight: 3.0, weightUnit: 'kg', purity: 0.97, supplierId: 's4', date: '2024-09-03T11:30:00Z' },
  { id: 't16', type: 'IN', weight: 1.1, weightUnit: 'kg', purity: 0.90, supplierId: 's3', date: '2024-09-21T16:00:00Z' },
  { id: 't17', type: 'IN', weight: 2.0, weightUnit: 'kg', purity: 0.95, supplierId: 's6', date: '2025-01-10T08:45:00Z' },
  { id: 't18', type: 'OUT', weight: 4.0, weightUnit: 'kg', purity: 0.99, supplierId: 's1', date: '2025-02-20T10:30:00Z' },
  { id: 't19', type: 'IN', weight: 1.4, weightUnit: 'kg', purity: 0.92, supplierId: 's5', date: '2025-03-15T09:15:00Z' },
  { id: 't20', type: 'IN', weight: 750, weightUnit: 'g', purity: 0.87, supplierId: 's2', date: '2025-04-02T14:00:00Z' },
];

export const mockWorkers: Worker[] = [
  { id: 'w1', name: 'Roberto Huamán', position: 'Fundidor', status: 'active', startDate: '2022-06-01T08:00:00Z' },
  { id: 'w2', name: 'María Quispe', position: 'Analista de Calidad', status: 'active', startDate: '2022-09-15T08:00:00Z' },
  { id: 'w3', name: 'Juan Paredes', position: 'Operador de Báscula', status: 'active', startDate: '2023-01-10T08:00:00Z' },
  { id: 'w4', name: 'Lucía Fernández', position: 'Asistente Administrativa', status: 'active', startDate: '2023-04-20T08:00:00Z' },
  { id: 'w5', name: 'Carlos Gutiérrez', position: 'Jefe de Planta', status: 'active', startDate: '2022-03-01T08:00:00Z' },
  { id: 'w6', name: 'Ana Condori', position: 'Laboratorista', status: 'active', startDate: '2023-08-05T08:00:00Z' },
  { id: 'w7', name: 'Pedro Castillo', position: 'Chofer', status: 'inactive', startDate: '2022-11-01T08:00:00Z' },
  { id: 'w8', name: 'Sofía Mamani', position: 'Auxiliar de Oficina', status: 'inactive', startDate: '2023-02-15T08:00:00Z' },
];
