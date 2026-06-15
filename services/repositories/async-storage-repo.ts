import AsyncStorage from '@react-native-async-storage/async-storage';
import { DistributionRecord, Employee, ExcessCase, UnitPolicy, Unit, UniformItem, RecoveryRecord, WaiverRecord, ImportRecord } from '@/types/domain';
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
import { employees as seedEmployees, initialDistributionRecords, initialExcessCases, unitPolicies as seedPolicies, recentImports as seedImports } from '@/data/sample-data';

const STORAGE_KEY = '@uniform-manager/data-v1';

interface StoredData {
  employees: Employee[];
  distributionRecords: DistributionRecord[];
  excessCases: ExcessCase[];
  policies?: UnitPolicy[];
  units?: Unit[];
  items?: UniformItem[];
  recoveries?: RecoveryRecord[];
  waivers?: WaiverRecord[];
  imports?: ImportRecord[];
}

function getInitialUnits(): Unit[] {
  const unitsMap = new Map<string, string>();
  seedEmployees.forEach(e => unitsMap.set(e.unitId, e.unitName));
  return Array.from(unitsMap.entries()).map(([id, name]) => ({ id, name }));
}

function getInitialItems(): UniformItem[] {
  const itemsSet = new Set<string>();
  seedPolicies.forEach(p => itemsSet.add(p.itemName));
  return Array.from(itemsSet).map(name => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    name
  }));
}

function getInitialImports(): ImportRecord[] {
  return seedImports.map(i => ({ ...i, fingerprint: `manual-${i.id}` }));
}

class AsyncStorageDataStore {
  private data: StoredData | null = null;

  async load(): Promise<StoredData> {
    if (this.data) return this.data;
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      this.data = JSON.parse(stored);
      if (!this.data!.units) this.data!.units = getInitialUnits();
      if (!this.data!.items) this.data!.items = getInitialItems();
      if (!this.data!.recoveries) this.data!.recoveries = [];
      if (!this.data!.waivers) this.data!.waivers = [];
      if (!this.data!.imports) this.data!.imports = getInitialImports();
    } else {
      this.data = {
        employees: seedEmployees,
        distributionRecords: initialDistributionRecords,
        excessCases: initialExcessCases,
        policies: seedPolicies,
        units: getInitialUnits(),
        items: getInitialItems(),
        recoveries: [],
        waivers: [],
        imports: getInitialImports(),
      };
    }
    return this.data!;
  }

  async save(data: StoredData): Promise<void> {
    this.data = data;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
}

const dataStore = new AsyncStorageDataStore();

export class AsyncStorageEmployeeRepository implements EmployeeRepository {
  async getAll(): Promise<Employee[]> {
    const data = await dataStore.load();
    return data.employees;
  }

  async getById(id: string): Promise<Employee | null> {
    const employees = await this.getAll();
    return employees.find(e => e.id === id) || null;
  }

  async save(employee: Employee): Promise<void> {
    const data = await dataStore.load();
    const index = data.employees.findIndex(e => e.id === employee.id);
    if (index >= 0) {
      data.employees[index] = employee;
    } else {
      data.employees.push(employee);
    }
    await dataStore.save(data);
  }

  async saveAll(employees: Employee[]): Promise<void> {
    const data = await dataStore.load();
    const employeeMap = new Map(data.employees.map(e => [e.id, e]));
    employees.forEach(e => employeeMap.set(e.id, e));
    data.employees = Array.from(employeeMap.values());
    await dataStore.save(data);
  }
}

export class AsyncStorageUnitRepository implements UnitRepository {
  async getAll(): Promise<Unit[]> {
    const data = await dataStore.load();
    return data.units || [];
  }

  async save(unit: Unit): Promise<void> {
    const data = await dataStore.load();
    if (!data.units) data.units = [];
    const index = data.units.findIndex(u => u.id === unit.id);
    if (index >= 0) {
      data.units[index] = unit;
    } else {
      data.units.push(unit);
    }
    await dataStore.save(data);
  }

  async delete(id: string): Promise<void> {
    const data = await dataStore.load();
    if (!data.units) return;
    data.units = data.units.filter(u => u.id !== id);
    await dataStore.save(data);
  }
}

export class AsyncStorageUniformItemRepository implements UniformItemRepository {
  async getAll(): Promise<UniformItem[]> {
    const data = await dataStore.load();
    return data.items || [];
  }

  async save(item: UniformItem): Promise<void> {
    const data = await dataStore.load();
    if (!data.items) data.items = [];
    const index = data.items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      data.items[index] = item;
    } else {
      data.items.push(item);
    }
    await dataStore.save(data);
  }

  async delete(id: string): Promise<void> {
    const data = await dataStore.load();
    if (!data.items) return;
    data.items = data.items.filter(i => i.id !== id);
    await dataStore.save(data);
  }
}

export class AsyncStorageUnitPolicyRepository implements UnitPolicyRepository {
  async getAll(): Promise<UnitPolicy[]> {
    const data = await dataStore.load();
    return data.policies || seedPolicies;
  }

  async save(policy: UnitPolicy): Promise<void> {
    const data = await dataStore.load();
    if (!data.policies) data.policies = [...seedPolicies];
    const index = data.policies.findIndex(
      p => p.unitName.toLowerCase() === policy.unitName.toLowerCase() && 
           p.itemName.toLowerCase() === policy.itemName.toLowerCase()
    );
    if (index >= 0) {
      data.policies[index] = policy;
    } else {
      data.policies.push(policy);
    }
    await dataStore.save(data);
  }

  async saveAll(policies: UnitPolicy[]): Promise<void> {
    const data = await dataStore.load();
    data.policies = policies;
    await dataStore.save(data);
  }

  async delete(unitName: string, itemName: string): Promise<void> {
    const data = await dataStore.load();
    if (!data.policies) data.policies = [...seedPolicies];
    data.policies = data.policies.filter(
      p => !(p.unitName.toLowerCase() === unitName.toLowerCase() && 
             p.itemName.toLowerCase() === itemName.toLowerCase())
    );
    await dataStore.save(data);
  }
}

export class AsyncStorageDistributionRepository implements DistributionRepository {
  async getAll(): Promise<DistributionRecord[]> {
    const data = await dataStore.load();
    return data.distributionRecords;
  }

  async save(record: DistributionRecord): Promise<void> {
    const data = await dataStore.load();
    data.distributionRecords.push(record);
    await dataStore.save(data);
  }

  async saveAll(records: DistributionRecord[]): Promise<void> {
    const data = await dataStore.load();
    data.distributionRecords.push(...records);
    await dataStore.save(data);
  }
}

export class AsyncStorageExcessCaseRepository implements ExcessCaseRepository {
  async getAll(): Promise<ExcessCase[]> {
    const data = await dataStore.load();
    return data.excessCases;
  }

  async save(excessCase: ExcessCase): Promise<void> {
    const data = await dataStore.load();
    data.excessCases.push(excessCase);
    await dataStore.save(data);
  }

  async saveAll(excessCases: ExcessCase[]): Promise<void> {
    const data = await dataStore.load();
    data.excessCases.push(...excessCases);
    await dataStore.save(data);
  }

  async update(excessCase: ExcessCase): Promise<void> {
    const data = await dataStore.load();
    const index = data.excessCases.findIndex(c => c.id === excessCase.id);
    if (index >= 0) {
      data.excessCases[index] = excessCase;
      await dataStore.save(data);
    }
  }
}

export class AsyncStorageRecoveryRepository implements RecoveryRepository {
  async getAll(): Promise<RecoveryRecord[]> {
    const data = await dataStore.load();
    return data.recoveries || [];
  }

  async save(record: RecoveryRecord): Promise<void> {
    const data = await dataStore.load();
    if (!data.recoveries) data.recoveries = [];
    data.recoveries.push(record);
    await dataStore.save(data);
  }
}

export class AsyncStorageWaiverRepository implements WaiverRepository {
  async getAll(): Promise<WaiverRecord[]> {
    const data = await dataStore.load();
    return data.waivers || [];
  }

  async save(record: WaiverRecord): Promise<void> {
    const data = await dataStore.load();
    if (!data.waivers) data.waivers = [];
    data.waivers.push(record);
    await dataStore.save(data);
  }
}

export class AsyncStorageImportRepository implements ImportRepository {
  async getAll(): Promise<ImportRecord[]> {
    const data = await dataStore.load();
    return data.imports || [];
  }

  async save(record: ImportRecord): Promise<void> {
    const data = await dataStore.load();
    if (!data.imports) data.imports = [];
    data.imports.push(record);
    await dataStore.save(data);
  }

  async getByFingerprint(fingerprint: string): Promise<ImportRecord | null> {
    const imports = await this.getAll();
    return imports.find(i => i.fingerprint === fingerprint) || null;
  }
}
