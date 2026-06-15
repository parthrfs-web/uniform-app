import type { DistributionRecord, Employee, ExcessCase, UnitPolicy } from '@/types/domain';

export interface ExcessCalculation {
  cases: ExcessCase[];
  issues: string[];
}

export function calculateNewExcessCases(
  allRecords: DistributionRecord[],
  newRecordIds: Set<string>,
  employees: Employee[],
  policies: UnitPolicy[],
): ExcessCalculation {
  const cases: ExcessCase[] = [];
  const issues: string[] = [];
  const employeeByCode = new Map(employees.map((employee) => [normalize(employee.code), employee]));
  const grouped = new Map<string, DistributionRecord[]>();

  for (const record of allRecords) {
    const employee = employeeByCode.get(normalize(record.employeeCode));
    if (!employee) {
      if (newRecordIds.has(record.id)) issues.push(`${record.employeeCode}: employee was not found`);
      continue;
    }

    const year = new Date(`${record.issuedAt}T00:00:00`).getFullYear();
    const key = `${normalize(record.employeeCode)}|${normalize(record.itemName)}|${year}`;
    grouped.set(key, [...(grouped.get(key) ?? []), record]);
  }

  for (const records of grouped.values()) {
    records.sort((a, b) => a.issuedAt.localeCompare(b.issuedAt) || a.sourceRow - b.sourceRow);
    const employee = employeeByCode.get(normalize(records[0].employeeCode))!;
    const itemName = records[0].itemName.trim();
    const policy = policies.find(
      (candidate) =>
        normalize(candidate.unitName) === normalize(employee.unitName) &&
        normalize(candidate.itemName) === normalize(itemName),
    );

    if (!policy) {
      if (records.some((record) => newRecordIds.has(record.id))) {
        issues.push(`${employee.code} / ${itemName}: no annual policy exists for ${employee.unitName}`);
      }
      continue;
    }

    let cumulative = 0;
    for (const record of records) {
      const previousExcess = Math.max(0, cumulative - policy.annualLimit);
      cumulative += record.quantity;
      const currentExcess = Math.max(0, cumulative - policy.annualLimit);
      const newlyExcess = currentExcess - previousExcess;

      if (newRecordIds.has(record.id) && newlyExcess > 0) {
        const date = new Date(`${record.issuedAt}T00:00:00`);
        cases.push({
          id: `exc-${record.id}`,
          transactionId: record.id,
          employeeId: employee.id,
          employeeCode: employee.code,
          employeeName: employee.name,
          unitName: employee.unitName,
          itemName,
          year: date.getFullYear(),
          triggerDate: record.issuedAt,
          triggerMonth: date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }),
          allowedQuantity: policy.annualLimit,
          issuedQuantity: cumulative,
          deductedQuantity: 0,
          waivedQuantity: 0,
          pendingQuantity: newlyExcess,
        });
      }
    }
  }

  return { cases, issues };
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}
