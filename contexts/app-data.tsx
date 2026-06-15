import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

import { getAsyncStorageRepositories, Repositories } from '@/services/repositories';
import { calculateNewExcessCases } from '@/services/entitlement';
import { DistributionRecord, Employee, ExcessCase, UnitPolicy, Unit, UniformItem, RecoveryRecord, WaiverRecord, ImportRecord } from '@/types/domain';

interface ImportOutcome {
  imported: number;
  duplicates: number;
  newCases: ExcessCase[];
  calculationIssues: string[];
}

interface AppDataValue {
  employees: Employee[];
  distributionRecords: DistributionRecord[];
  excessCases: ExcessCase[];
  policies: UnitPolicy[];
  units: Unit[];
  items: UniformItem[];
  recoveries: RecoveryRecord[];
  waivers: WaiverRecord[];
  importHistory: ImportRecord[];
  importEmployees: (rows: Employee[]) => Promise<ImportOutcome>;
  importDistributions: (rows: DistributionRecord[], meta: { fileName: string, fingerprint: string }) => Promise<ImportOutcome>;
  resolveExcess: (id: string, action: 'deduct' | 'waive', quantity: number) => Promise<void>;
  isDuplicateFile: (fingerprint: string) => Promise<boolean>;
  // Added for Editable Management
  saveUnit: (unit: Unit) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  saveItem: (item: UniformItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  savePolicy: (policy: UnitPolicy) => Promise<void>;
  deletePolicy: (unitName: string, itemName: string) => Promise<void>;
}

const AppDataContext = createContext<AppDataValue | null>(null);

const repos: Repositories = getAsyncStorageRepositories();

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [distributionRecords, setDistributionRecords] = useState<DistributionRecord[]>([]);
  const [excessCases, setExcessCases] = useState<ExcessCase[]>([]);
  const [policies, setPolicies] = useState<UnitPolicy[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [items, setItems] = useState<UniformItem[]>([]);
  const [recoveries, setRecoveries] = useState<RecoveryRecord[]>([]);
  const [waivers, setWaivers] = useState<WaiverRecord[]>([]);
  const [importHistory, setImportHistory] = useState<ImportRecord[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function load() {
      const [e, d, ex, p, u, i, r, w, ih] = await Promise.all([
        repos.employees.getAll(),
        repos.distributions.getAll(),
        repos.excessCases.getAll(),
        repos.policies.getAll(),
        repos.units.getAll(),
        repos.items.getAll(),
        repos.recoveries.getAll(),
        repos.waivers.getAll(),
        repos.imports.getAll(),
      ]);
      setEmployees(e);
      setDistributionRecords(d);
      setExcessCases(ex);
      setPolicies(p);
      setUnits(u);
      setItems(i);
      setRecoveries(r);
      setWaivers(w);
      setImportHistory(ih);
      setHydrated(true);
    }
    load();
  }, []);

  async function isDuplicateFile(fingerprint: string) {
    const existing = await repos.imports.getByFingerprint(fingerprint);
    return !!existing;
  }

  async function importEmployees(rows: Employee[]): Promise<ImportOutcome> {
    const existingCodes = new Set(employees.map((employee) => normalize(employee.code)));
    const accepted = rows.filter((row) => !existingCodes.has(normalize(row.code)));
    
    if (accepted.length > 0) {
      await repos.employees.saveAll(accepted);
      setEmployees((current) => [...current, ...accepted]);
    }
    
    return { imported: accepted.length, duplicates: rows.length - accepted.length, newCases: [], calculationIssues: [] };
  }

  async function importDistributions(rows: DistributionRecord[], meta: { fileName: string, fingerprint: string }): Promise<ImportOutcome> {
    const existingKeys = new Set(distributionRecords.map(recordKey));
    const accepted = rows.filter((row) => !existingKeys.has(recordKey(row)));
    
    if (accepted.length === 0) {
      return { imported: 0, duplicates: rows.length, newCases: [], calculationIssues: [] };
    }

    const combined = [...distributionRecords, ...accepted];
    const newIds = new Set(accepted.map((row) => row.id));
    const calculation = calculateNewExcessCases(combined, newIds, employees, policies);

    await repos.distributions.saveAll(accepted);
    setDistributionRecords(combined);

    const filteredNewCases = calculation.cases.filter(
      (candidate) => !excessCases.some((item) => item.transactionId === candidate.transactionId)
    );

    if (filteredNewCases.length > 0) {
      await repos.excessCases.saveAll(filteredNewCases);
      setExcessCases((current) => [...current, ...filteredNewCases]);
    }

    // Save import history
    const importRecord: ImportRecord = {
      id: `import-${Date.now()}`,
      fileName: meta.fileName,
      records: accepted.length,
      importedAt: new Date().toLocaleString(),
      fingerprint: meta.fingerprint,
    };
    await repos.imports.save(importRecord);
    setImportHistory(prev => [importRecord, ...prev]);

    return {
      imported: accepted.length,
      duplicates: rows.length - accepted.length,
      newCases: calculation.cases,
      calculationIssues: calculation.issues,
    };
  }

  async function resolveExcess(id: string, action: 'deduct' | 'waive', quantity: number) {
    const itemCase = excessCases.find(c => c.id === id);
    if (!itemCase) return;

    const resolvedQty = Math.min(quantity, itemCase.pendingQuantity);
    const date = new Date().toISOString().split('T')[0];

    if (action === 'deduct') {
      const uniformItem = items.find(i => i.name.toLowerCase() === itemCase.itemName.toLowerCase());
      const cost = uniformItem?.recoveryCost || 0;
      const record: RecoveryRecord = {
        id: `rec-${id}-${Date.now()}`,
        employeeId: itemCase.employeeId,
        employeeCode: itemCase.employeeCode,
        itemName: itemCase.itemName,
        quantity: resolvedQty,
        amount: resolvedQty * cost,
        date,
      };
      await repos.recoveries.save(record);
      setRecoveries(prev => [...prev, record]);
    } else {
      const record: WaiverRecord = {
        id: `wav-${id}-${Date.now()}`,
        employeeId: itemCase.employeeId,
        employeeCode: itemCase.employeeCode,
        itemName: itemCase.itemName,
        quantity: resolvedQty,
        date,
      };
      await repos.waivers.save(record);
      setWaivers(prev => [...prev, record]);
    }

    const updatedCases = excessCases.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          pendingQuantity: item.pendingQuantity - resolvedQty,
          deductedQuantity: action === 'deduct' ? item.deductedQuantity + resolvedQty : item.deductedQuantity,
          waivedQuantity: action === 'waive' ? item.waivedQuantity + resolvedQty : item.waivedQuantity,
        };
      }
      return item;
    });

    const updatedCase = updatedCases.find(c => c.id === id);
    if (updatedCase) {
      await repos.excessCases.update(updatedCase);
      setExcessCases(updatedCases);
    }
  }

  async function saveUnit(unit: Unit) {
    await repos.units.save(unit);
    setUnits(await repos.units.getAll());
  }

  async function deleteUnit(id: string) {
    await repos.units.delete(id);
    setUnits(await repos.units.getAll());
  }

  async function saveItem(item: UniformItem) {
    await repos.items.save(item);
    setItems(await repos.items.getAll());
  }

  async function deleteItem(id: string) {
    await repos.items.delete(id);
    setItems(await repos.items.getAll());
  }

  async function savePolicy(policy: UnitPolicy) {
    await repos.policies.save(policy);
    setPolicies(await repos.policies.getAll());
  }

  async function deletePolicy(unitName: string, itemName: string) {
    await repos.policies.delete(unitName, itemName);
    setPolicies(await repos.policies.getAll());
  }

  const value = useMemo<AppDataValue>(() => ({
    employees,
    distributionRecords,
    excessCases: excessCases.filter((item) => item.pendingQuantity > 0),
    policies,
    units,
    items,
    recoveries,
    waivers,
    importHistory,
    importEmployees,
    importDistributions,
    resolveExcess,
    isDuplicateFile,
    saveUnit,
    deleteUnit,
    saveItem,
    deleteItem,
    savePolicy,
    deletePolicy,
  }), [distributionRecords, employees, excessCases, policies, units, items, recoveries, waivers, importHistory]);

  if (!hydrated) return null;

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error('useAppData must be used inside AppDataProvider');
  return value;
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function recordKey(record: DistributionRecord) {
  return `${record.sourceFile.toLowerCase()}|${record.sourceRow}|${normalize(record.employeeCode)}|${normalize(record.itemName)}|${record.issuedAt}|${record.quantity}`;
}
