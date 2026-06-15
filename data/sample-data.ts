import { DistributionRecord, Employee, ExcessCase, ImportRecord, UnitPolicy } from '@/types/domain';

export const stats = {
  employees: 1248,
  units: 18,
  pendingCases: 27,
  recoveries: 48620,
  items: 14,
};

export const employees: Employee[] = [
  { id: 'emp-1', code: 'SG-1042', name: 'Rakesh Kumar', fatherName: 'Mohan Lal', unitId: 'reliance', unitName: 'Reliance', joiningDate: '14 March 2022', status: 'active' },
  { id: 'emp-2', code: 'SG-1087', name: 'Amit Singh', fatherName: 'Rajendra Singh', unitId: 'anms', unitName: 'ANMS', joiningDate: '02 July 2021', status: 'active' },
  { id: 'emp-3', code: 'SG-1123', name: 'Suresh Yadav', fatherName: 'Ram Yadav', unitId: 'mrf', unitName: 'MRF', joiningDate: '21 January 2023', status: 'active' },
  { id: 'emp-4', code: 'SG-1198', name: 'Deepak Sharma', fatherName: 'Ravi Sharma', unitId: 'reliance', unitName: 'Reliance', joiningDate: '18 September 2020', status: 'inactive' },
  { id: 'emp-5', code: 'SG-1216', name: 'Vikram Patel', fatherName: 'Mahesh Patel', unitId: 'anms', unitName: 'ANMS', joiningDate: '05 May 2024', status: 'active' },
  { id: 'emp-6', code: 'SG-1261', name: 'Manoj Verma', fatherName: 'Dinesh Verma', unitId: 'reliance', unitName: 'Reliance', joiningDate: '11 February 2025', status: 'active' },
];

export const unitPolicies: UnitPolicy[] = [
  { unitName: 'Reliance', itemName: 'Shirt', annualLimit: 2 },
  { unitName: 'Reliance', itemName: 'Pant', annualLimit: 2 },
  { unitName: 'Reliance', itemName: 'Shoes 530', annualLimit: 1 },
  { unitName: 'ANMS', itemName: 'Shirt', annualLimit: 3 },
  { unitName: 'ANMS', itemName: 'Pant', annualLimit: 3 },
  { unitName: 'ANMS', itemName: 'Shoes 530', annualLimit: 1 },
  { unitName: 'MRF', itemName: 'Shirt', annualLimit: 0 },
  { unitName: 'MRF', itemName: 'Pant', annualLimit: 0 },
  { unitName: 'MRF', itemName: 'Raincoat', annualLimit: 0 },
];

export const initialDistributionRecords: DistributionRecord[] = [
  { id: 'dist-1', employeeCode: 'SG-1042', itemName: 'Shirt', quantity: 2, issuedAt: '2026-03-14', sourceFile: 'March_2026.xlsx', sourceRow: 2 },
  { id: 'dist-2', employeeCode: 'SG-1042', itemName: 'Shirt', quantity: 1, issuedAt: '2026-05-08', sourceFile: 'May_2026.xlsx', sourceRow: 7 },
  { id: 'dist-3', employeeCode: 'SG-1087', itemName: 'Shoes 530', quantity: 2, issuedAt: '2026-04-19', sourceFile: 'April_2026.xlsx', sourceRow: 4 },
  { id: 'dist-4', employeeCode: 'SG-1123', itemName: 'Raincoat', quantity: 1, issuedAt: '2026-02-11', sourceFile: 'February_2026.xlsx', sourceRow: 9 },
];

export const initialExcessCases: ExcessCase[] = [
  { id: 'exc-1', employeeId: 'emp-1', transactionId: 'dist-2', employeeCode: 'SG-1042', employeeName: 'Rakesh Kumar', unitName: 'Reliance', itemName: 'Shirt', year: 2026, triggerDate: '2026-05-08', triggerMonth: 'May 2026', allowedQuantity: 2, issuedQuantity: 3, deductedQuantity: 0, waivedQuantity: 0, pendingQuantity: 1 },
  { id: 'exc-2', employeeId: 'emp-2', transactionId: 'dist-3', employeeCode: 'SG-1087', employeeName: 'Amit Singh', unitName: 'ANMS', itemName: 'Shoes 530', year: 2026, triggerDate: '2026-04-19', triggerMonth: 'April 2026', allowedQuantity: 1, issuedQuantity: 2, deductedQuantity: 0, waivedQuantity: 0, pendingQuantity: 1 },
  { id: 'exc-3', employeeId: 'emp-3', transactionId: 'dist-4', employeeCode: 'SG-1123', employeeName: 'Suresh Yadav', unitName: 'MRF', itemName: 'Raincoat', year: 2026, triggerDate: '2026-02-11', triggerMonth: 'February 2026', allowedQuantity: 0, issuedQuantity: 1, deductedQuantity: 0, waivedQuantity: 0, pendingQuantity: 1 },
];

export const recentImports: ImportRecord[] = [
  { id: 'imp-1', fileName: 'May_2026_Distribution.xlsx', records: 186, importedAt: 'Today, 10:24 AM', fingerprint: 'fp-imp-1' },
  { id: 'imp-2', fileName: 'April_2026_Distribution.xlsx', records: 214, importedAt: '2 May 2026', fingerprint: 'fp-imp-2' },
  { id: 'imp-3', fileName: 'Historical_Reliance_2025.xlsx', records: 842, importedAt: '28 Apr 2026', fingerprint: 'fp-imp-3' },
];

export const distributionHistory = [
  { itemName: 'Shirt', allowed: 2, issued: 3 },
  { itemName: 'Pant', allowed: 2, issued: 2 },
  { itemName: 'Shoes 530', allowed: 1, issued: 1 },
  { itemName: 'Belt', allowed: 1, issued: 1 },
];
