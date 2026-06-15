import * as XLSX from 'xlsx';

import type { DistributionRecord, Employee, ImportIssue } from '@/types/domain';

type Cell = string | number | boolean | Date | null | undefined;
type Matrix = Cell[][];

export interface ParsedWorkbook {
  employees: Employee[];
  distributions: DistributionRecord[];
  issues: ImportIssue[];
  sheetSummaries: string[];
}

interface HeaderMatch {
  headerRowIndex: number;
  headers: string[];
  codeIndex: number;
  nameIndex?: number;
  unitIndex?: number;
  fatherIndex?: number;
  joiningIndex?: number;
  statusIndex?: number;
  dateIndex?: number;
  itemIndex?: number;
  quantityIndex?: number;
  itemQuantityColumns: Array<{ index: number; itemName: string }>;
}

const employeeCodeAliases = [
  'employee code', 'emp code', 'employee id', 'emp id', 'guard code', 'guard id', 'code',
  'ec no', 'ec number', 'staff code', 'personnel no', 'personnel number', 'id no', 'id number',
  'card no', 'card number', 'token no', 'token number', 'e code', 'ecode', 'emp no', 'emp number',
];
const employeeNameAliases = ['employee name', 'emp name', 'guard name', 'name', 'person name', 'staff name', 'security name', 'g name', 'worker name'];
const fatherAliases = ['father name', "father's name", 'father', 'father husband name', 'guardian name', 'f name', 'father husband'];
const unitAliases = ['unit', 'unit name', 'client', 'client name', 'site', 'site name', 'location', 'branch', 'posting', 'place', 'department'];
const joiningAliases = ['joining date', 'date of joining', 'doj', 'join date'];
const statusAliases = ['status', 'employee status', 'active status'];
const dateAliases = ['date', 'issue date', 'issued date', 'distribution date', 'month date', 'entry date'];
const itemAliases = ['item', 'item name', 'uniform item', 'uniform', 'article', 'material', 'particular'];
const quantityAliases = ['quantity', 'qty', 'issued quantity', 'issue qty', 'issued qty', 'pieces', 'pcs', 'nos'];
const ignoredWideColumns = [
  ...employeeCodeAliases,
  ...employeeNameAliases,
  ...fatherAliases,
  ...unitAliases,
  ...joiningAliases,
  ...statusAliases,
  ...dateAliases,
  ...itemAliases,
  ...quantityAliases,
  'sr no', 's no', 'serial no', 'remarks', 'remark', 'amount', 'rate',
];

export function readWorkbook(buffer: ArrayBuffer) {
  return XLSX.read(buffer, { type: 'array', cellDates: true });
}

export function parseWorkbookAuto(workbook: XLSX.WorkBook, sourceFile: string): ParsedWorkbook {
  const employees: Employee[] = [];
  const distributions: DistributionRecord[] = [];
  const issues: ImportIssue[] = [];
  const sheetSummaries: string[] = [];
  const seenEmployeeCodes = new Set<string>();

  for (const sheetName of workbook.SheetNames) {
    const matrix = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
      header: 1,
      defval: '',
      blankrows: false,
      raw: false,
    }) as Matrix;

    const match = detectHeader(matrix);
    if (!match) {
      if (hasAnyContent(matrix)) {
        const fallback = parseRowsWithoutHeader(matrix, sheetName, sourceFile, seenEmployeeCodes);
        employees.push(...fallback.employees);
        distributions.push(...fallback.distributions);
        issues.push(...fallback.issues);
        sheetSummaries.push(fallback.summary);
      }
      continue;
    }

    let employeeCount = 0;
    let distributionCount = 0;
    const inferredDate = inferDateFromSheetName(sheetName);

    for (let rowIndex = match.headerRowIndex + 1; rowIndex < matrix.length; rowIndex += 1) {
      const row = matrix[rowIndex] ?? [];
      const rowNumber = rowIndex + 1;
      const employeeCode = cleanCode(row[match.codeIndex]);
      if (!employeeCode) continue;

      if (match.nameIndex !== undefined && match.unitIndex !== undefined) {
        const name = text(row[match.nameIndex]);
        const unitName = text(row[match.unitIndex]);
        if (name && unitName && !seenEmployeeCodes.has(normalize(employeeCode))) {
          seenEmployeeCodes.add(normalize(employeeCode));
          employees.push({
            id: `emp-import-${slug(employeeCode)}`,
            code: employeeCode,
            name,
            fatherName: match.fatherIndex !== undefined ? text(row[match.fatherIndex]) || 'Not provided' : 'Not provided',
            unitId: slug(unitName),
            unitName,
            joiningDate: match.joiningIndex !== undefined ? formatDate(row[match.joiningIndex]) || 'Not provided' : 'Not provided',
            status: match.statusIndex !== undefined && text(row[match.statusIndex]).toLowerCase() === 'inactive' ? 'inactive' : 'active',
          });
          employeeCount += 1;
        }
      }

      if (match.itemIndex !== undefined && match.quantityIndex !== undefined) {
        const itemName = text(row[match.itemIndex]);
        const quantity = numeric(row[match.quantityIndex]);
        const issuedAt = match.dateIndex !== undefined ? isoDate(row[match.dateIndex]) : inferredDate;
        if (!itemName && !quantity && !issuedAt) continue;
        if (!itemName || !issuedAt || !Number.isFinite(quantity) || quantity <= 0) {
          issues.push({ row: rowNumber, message: `${sheetName}: item, quantity, and date/month are required for distribution rows.` });
          continue;
        }
        distributions.push({
          id: `dist-${slug(sourceFile)}-${slug(sheetName)}-${rowNumber}`,
          employeeCode,
          itemName,
          quantity,
          issuedAt,
          sourceFile,
          sourceRow: rowNumber,
        });
        distributionCount += 1;
      }

      for (const column of match.itemQuantityColumns) {
        const quantity = numeric(row[column.index]);
        if (!Number.isFinite(quantity) || quantity <= 0) continue;
        const issuedAt = match.dateIndex !== undefined ? isoDate(row[match.dateIndex]) : inferredDate;
        if (!issuedAt) {
          issues.push({ row: rowNumber, message: `${sheetName}: ${column.itemName} has quantity but no date/month could be detected.` });
          continue;
        }
        distributions.push({
          id: `dist-${slug(sourceFile)}-${slug(sheetName)}-${rowNumber}-${slug(column.itemName)}`,
          employeeCode,
          itemName: column.itemName,
          quantity,
          issuedAt,
          sourceFile,
          sourceRow: rowNumber,
        });
        distributionCount += 1;
      }
    }

    if (employeeCount || distributionCount) {
      sheetSummaries.push(`${sheetName}: ${employeeCount} employee row(s), ${distributionCount} distribution row(s)`);
    } else {
      sheetSummaries.push(`${sheetName}: header detected but no valid rows found`);
    }
  }

  if (!employees.length && !distributions.length && !issues.length) {
    issues.push({
      row: -1,
      message: 'No employee or distribution rows were detected. The app looks for employee code plus name/unit, or employee code plus item quantities/date.',
    });
  }

  return { employees, distributions, issues, sheetSummaries };
}

// Backward-compatible exports for any older screen code.
export function parseEmployeeSheet(workbook: XLSX.WorkBook) {
  const parsed = parseWorkbookAuto(workbook, 'workbook.xlsx');
  return { rows: parsed.employees, issues: parsed.issues };
}

export function parseDistributionSheet(workbook: XLSX.WorkBook, sourceFile: string) {
  const parsed = parseWorkbookAuto(workbook, sourceFile);
  return { rows: parsed.distributions, issues: parsed.issues };
}

function detectHeader(matrix: Matrix): HeaderMatch | null {
  const limit = Math.min(matrix.length, 25);
  let best: HeaderMatch | null = null;
  let bestScore = 0;

  for (let rowIndex = 0; rowIndex < limit; rowIndex += 1) {
    const headers = (matrix[rowIndex] ?? []).map((cell) => normalize(text(cell)));
    if (!headers.some(Boolean)) continue;

    const codeIndex = findHeader(headers, employeeCodeAliases);
    if (codeIndex === -1) continue;

    const nameIndex = findOptionalHeader(headers, employeeNameAliases);
    const unitIndex = findOptionalHeader(headers, unitAliases);
    const dateIndex = findOptionalHeader(headers, dateAliases);
    const itemIndex = findOptionalHeader(headers, itemAliases);
    const quantityIndex = findOptionalHeader(headers, quantityAliases);
    const itemQuantityColumns = itemIndex !== undefined && quantityIndex !== undefined
      ? []
      : detectWideItemColumns(matrix, rowIndex, headers);

    const hasEmployeeShape = nameIndex !== undefined && unitIndex !== undefined;
    const hasLongDistributionShape = itemIndex !== undefined && quantityIndex !== undefined && dateIndex !== undefined;
    const hasWideDistributionShape = itemQuantityColumns.length > 0 && (dateIndex !== undefined || inferDateFromNearbyRows(matrix, rowIndex));

    if (!hasEmployeeShape && !hasLongDistributionShape && !hasWideDistributionShape) continue;

    const score =
      (hasEmployeeShape ? 4 : 0) +
      (hasLongDistributionShape ? 5 : 0) +
      (hasWideDistributionShape ? 5 : 0) +
      itemQuantityColumns.length;

    if (score > bestScore) {
      bestScore = score;
      best = {
        headerRowIndex: rowIndex,
        headers,
        codeIndex,
        nameIndex,
        unitIndex,
        fatherIndex: findOptionalHeader(headers, fatherAliases),
        joiningIndex: findOptionalHeader(headers, joiningAliases),
        statusIndex: findOptionalHeader(headers, statusAliases),
        dateIndex,
        itemIndex,
        quantityIndex,
        itemQuantityColumns,
      };
    }
  }

  return best;
}

function parseRowsWithoutHeader(
  matrix: Matrix,
  sheetName: string,
  sourceFile: string,
  seenEmployeeCodes: Set<string>,
) {
  const employees: Employee[] = [];
  const distributions: DistributionRecord[] = [];
  const issues: ImportIssue[] = [];
  const inferredDate = inferDateFromSheetName(sheetName) || inferDateFromNearbyRows(matrix, Math.min(5, matrix.length));

  for (let rowIndex = 0; rowIndex < matrix.length; rowIndex += 1) {
    const row = matrix[rowIndex] ?? [];
    const rowNumber = rowIndex + 1;
    const values = row.map((cell, index) => ({ cell, index, value: text(cell) })).filter((item) => item.value);
    if (values.length < 2) continue;

    const code = findLikelyCode(row);
    if (!code) continue;

    const dateCell = values.find((item) => isoDate(item.cell));
    const issuedAt = dateCell ? isoDate(dateCell.cell) : inferredDate;
    const quantityCell = values.find((item) =>
      item.value !== code &&
      !isoDate(item.cell) &&
      Number.isFinite(numeric(item.cell)) &&
      numeric(item.cell) > 0 &&
      numeric(item.cell) <= 100
    );

    if (issuedAt && quantityCell) {
      const itemName = findLikelyItemName(row, quantityCell.index, code);
      if (itemName) {
        distributions.push({
          id: `dist-${slug(sourceFile)}-${slug(sheetName)}-${rowNumber}-${slug(itemName)}`,
          employeeCode: code,
          itemName,
          quantity: numeric(quantityCell.cell),
          issuedAt,
          sourceFile,
          sourceRow: rowNumber,
        });
        continue;
      }
    }

    const textValues = values
      .filter((item) => item.value !== code && !isoDate(item.cell) && !Number.isFinite(numeric(item.cell)))
      .map((item) => item.value);
    if (textValues.length >= 2 && !seenEmployeeCodes.has(normalize(code))) {
      const [name, unitName] = textValues;
      seenEmployeeCodes.add(normalize(code));
      employees.push({
        id: `emp-import-${slug(code)}`,
        code,
        name,
        fatherName: 'Not provided',
        unitId: slug(unitName),
        unitName,
        joiningDate: 'Not provided',
        status: 'active',
      });
    }
  }

  return {
    employees,
    distributions,
    issues,
    summary: `${sheetName}: fallback scan found ${employees.length} employee row(s), ${distributions.length} distribution row(s)`,
  };
}

function detectWideItemColumns(matrix: Matrix, headerRowIndex: number, headers: string[]) {
  const columns: Array<{ index: number; itemName: string }> = [];
  const sampleRows = matrix.slice(headerRowIndex + 1, headerRowIndex + 16);

  headers.forEach((header, index) => {
    if (!header || ignoredWideColumns.some((alias) => header === normalize(alias))) return;
    const numericCells = sampleRows.filter((row) => {
      const value = numeric(row[index]);
      return Number.isFinite(value) && value > 0;
    }).length;
    if (numericCells > 0) columns.push({ index, itemName: titleCase(header) });
  });

  return columns;
}

function findHeader(headers: string[], aliases: string[]) {
  return headers.findIndex((header) => aliases.some((alias) => header === normalize(alias) || header.includes(normalize(alias))));
}

function findOptionalHeader(headers: string[], aliases: string[]) {
  const index = findHeader(headers, aliases);
  return index === -1 ? undefined : index;
}

function hasAnyContent(matrix: Matrix) {
  return matrix.some((row) => row.some((cell) => text(cell)));
}

function inferDateFromNearbyRows(matrix: Matrix, headerRowIndex: number) {
  const before = matrix.slice(Math.max(0, headerRowIndex - 4), headerRowIndex).flat().map(text).join(' ');
  return inferDateFromSheetName(before);
}

function inferDateFromSheetName(value: string) {
  const normalized = value.toLowerCase();
  const yearMatch = normalized.match(/\b(20\d{2})\b/);
  const year = yearMatch ? Number(yearMatch[1]) : new Date().getFullYear();
  const months: Array<[number, string[]]> = [
    [1, ['january', 'jan']],
    [2, ['february', 'feb']],
    [3, ['march', 'mar']],
    [4, ['april', 'apr']],
    [5, ['may']],
    [6, ['june', 'jun']],
    [7, ['july', 'jul']],
    [8, ['august', 'aug']],
    [9, ['september', 'sept', 'sep']],
    [10, ['october', 'oct']],
    [11, ['november', 'nov']],
    [12, ['december', 'dec']],
  ];
  const found = months.find(([, aliases]) => aliases.some((month) => new RegExp(`\\b${month}\\b`).test(normalized)));
  if (!found) return '';
  const [month] = found;
  return `${year}-${pad(month)}-01`;
}

function text(value: unknown) {
  return String(value ?? '').trim();
}

function numeric(value: unknown) {
  if (typeof value === 'number') return value;
  const cleaned = text(value)
    .replace(/,/g, '')
    .match(/^\s*-?\d+(\.\d+)?/)?.[0] ?? '';
  if (!cleaned) return Number.NaN;
  return Number(cleaned);
}

function isoDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return localIso(value);
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value);
    if (parsed) return `${parsed.y}-${pad(parsed.m)}-${pad(parsed.d)}`;
  }
  const textValue = text(value);
  if (!textValue) return '';
  const monthDate = inferDateFromSheetName(textValue);
  if (monthDate) return monthDate;
  const indian = parseDayMonthYear(textValue);
  if (indian) return indian;
  if (!looksDateLike(textValue)) return '';
  const direct = /^\d{4}-\d{2}-\d{2}$/.test(textValue) ? new Date(`${textValue}T00:00:00`) : new Date(textValue);
  return Number.isNaN(direct.getTime()) ? '' : localIso(direct);
}

function looksDateLike(value: string) {
  return /\b\d{4}-\d{1,2}-\d{1,2}\b/.test(value) ||
    /\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/.test(value) ||
    /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\b/i.test(value);
}

function parseDayMonthYear(value: string) {
  const match = value.trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})$/);
  if (!match) return '';
  const day = Number(match[1]);
  const month = Number(match[2]);
  const rawYear = Number(match[3]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2000) return '';
  return `${year}-${pad(month)}-${pad(day)}`;
}

function formatDate(value: unknown) {
  const date = isoDate(value);
  return date
    ? new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';
}

function localIso(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/[_./-]+/g, ' ').replace(/\s+/g, ' ');
}

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function titleCase(value: string) {
  return value.replace(/\w\S*/g, (part) => part.charAt(0).toUpperCase() + part.slice(1));
}

function cleanCode(value: unknown) {
  const raw = text(value);
  if (!raw) return '';
  return raw.replace(/\.0$/, '').trim();
}

function findLikelyCode(row: Cell[]) {
  for (const cell of row) {
    const value = cleanCode(cell);
    if (!value) continue;
    if (/^[a-z]{1,8}[\s/-]?\d{2,}$/i.test(value)) return value;
    if (/^\d{3,10}$/.test(value) && !isoDate(value)) return value;
  }
  return '';
}

function findLikelyItemName(row: Cell[], quantityIndex: number, code: string) {
  for (let index = quantityIndex - 1; index >= 0; index -= 1) {
    const value = text(row[index]);
    if (isUsableItemText(value, code)) return titleCase(value);
  }
  for (let index = 0; index < row.length; index += 1) {
    const value = text(row[index]);
    if (isUsableItemText(value, code)) return titleCase(value);
  }
  return '';
}

function isUsableItemText(value: string, code: string) {
  if (!value || value === code) return false;
  if (isoDate(value) || Number.isFinite(numeric(value))) return false;
  const normalized = normalize(value);
  if (ignoredWideColumns.some((alias) => normalized === normalize(alias))) return false;
  return normalized.length >= 2;
}
