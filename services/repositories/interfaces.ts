import { DistributionRecord, Employee, ExcessCase, UnitPolicy, Unit, UniformItem, RecoveryRecord, WaiverRecord, ImportRecord } from '@/types/domain';

export interface EmployeeRepository {
  getAll(): Promise<Employee[]>;
  getById(id: string): Promise<Employee | null>;
  save(employee: Employee): Promise<void>;
  saveAll(employees: Employee[]): Promise<void>;
}

export interface UnitRepository {
  getAll(): Promise<Unit[]>;
  save(unit: Unit): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface UniformItemRepository {
  getAll(): Promise<UniformItem[]>;
  save(item: UniformItem): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface UnitPolicyRepository {
  getAll(): Promise<UnitPolicy[]>;
  save(policy: UnitPolicy): Promise<void>;
  saveAll(policies: UnitPolicy[]): Promise<void>;
  delete(unitName: string, itemName: string): Promise<void>;
}

export interface DistributionRepository {
  getAll(): Promise<DistributionRecord[]>;
  save(record: DistributionRecord): Promise<void>;
  saveAll(records: DistributionRecord[]): Promise<void>;
}

export interface ExcessCaseRepository {
  getAll(): Promise<ExcessCase[]>;
  save(excessCase: ExcessCase): Promise<void>;
  saveAll(excessCases: ExcessCase[]): Promise<void>;
  update(excessCase: ExcessCase): Promise<void>;
}

export interface RecoveryRepository {
  getAll(): Promise<RecoveryRecord[]>;
  save(record: RecoveryRecord): Promise<void>;
}

export interface WaiverRepository {
  getAll(): Promise<WaiverRecord[]>;
  save(record: WaiverRecord): Promise<void>;
}

export interface ImportRepository {
  getAll(): Promise<ImportRecord[]>;
  save(record: ImportRecord): Promise<void>;
  getByFingerprint(fingerprint: string): Promise<ImportRecord | null>;
}
