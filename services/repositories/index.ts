import {
  AsyncStorageEmployeeRepository,
  AsyncStorageUnitRepository,
  AsyncStorageUniformItemRepository,
  AsyncStorageUnitPolicyRepository,
  AsyncStorageDistributionRepository,
  AsyncStorageExcessCaseRepository,
  AsyncStorageRecoveryRepository,
  AsyncStorageWaiverRepository,
  AsyncStorageImportRepository,
} from './async-storage-repo';
import {
  EmployeeRepository,
  UnitRepository,
  UniformItemRepository,
  UnitPolicyRepository,
  DistributionRepository,
  ExcessCaseRepository,
  RecoveryRepository,
  WaiverRepository,
  ImportRepository,
} from './interfaces';

export interface Repositories {
  employees: EmployeeRepository;
  units: UnitRepository;
  items: UniformItemRepository;
  policies: UnitPolicyRepository;
  distributions: DistributionRepository;
  excessCases: ExcessCaseRepository;
  recoveries: RecoveryRepository;
  waivers: WaiverRepository;
  imports: ImportRepository;
}

export function getAsyncStorageRepositories(): Repositories {
  return {
    employees: new AsyncStorageEmployeeRepository(),
    units: new AsyncStorageUnitRepository(),
    items: new AsyncStorageUniformItemRepository(),
    policies: new AsyncStorageUnitPolicyRepository(),
    distributions: new AsyncStorageDistributionRepository(),
    excessCases: new AsyncStorageExcessCaseRepository(),
    recoveries: new AsyncStorageRecoveryRepository(),
    waivers: new AsyncStorageWaiverRepository(),
    imports: new AsyncStorageImportRepository(),
  };
}
