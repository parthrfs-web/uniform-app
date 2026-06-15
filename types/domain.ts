export type EmployeeStatus = 'active' | 'inactive';

export interface Employee {
  id: string;
  code: string;
  name: string;
  fatherName: string;
  unitId: string;
  unitName: string;
  joiningDate: string;
  status: EmployeeStatus;
}

export interface ExcessCase {
  id: string;
  employeeId: string;
  transactionId?: string;
  employeeCode: string;
  employeeName: string;
  unitName: string;
  itemName: string;
  year: number;
  triggerDate?: string;
  triggerMonth?: string;
  allowedQuantity: number;
  issuedQuantity: number;
  deductedQuantity: number;
  waivedQuantity: number;
  pendingQuantity: number;
}

export interface ImportRecord {
  id: string;
  fileName: string;
  records: number;
  importedAt: string;
  fingerprint: string;
}

export interface DistributionRecord {
  id: string;
  employeeCode: string;
  itemName: string;
  quantity: number;
  issuedAt: string;
  sourceFile: string;
  sourceRow: number;
}

export interface Unit {
  id: string;
  name: string;
}

export interface UniformItem {
  id: string;
  name: string;
  recoveryCost?: number;
}

export interface UnitPolicy {
  unitName: string;
  itemName: string;
  annualLimit: number;
}

export interface ImportIssue {
  row: number;
  message: string;
}

export interface RecoveryRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  itemName: string;
  quantity: number;
  amount: number;
  date: string;
}

export interface WaiverRecord {
  id: string;
  employeeId: string;
  employeeCode: string;
  itemName: string;
  quantity: number;
  date: string;
}
