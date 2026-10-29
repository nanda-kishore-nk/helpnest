// src/utils/csv.ts
// RFC-4180 Compliant Zero-Cost CSV Parser & Exporter

export interface ParsedCsvRow {
  index: number;
  name: string;
  email: string;
  role: string;
  organization?: string;
  isValid: boolean;
  isDuplicate: boolean;
  errors: string[];
}

export interface CsvValidationSummary {
  totalRows: number;
  validRows: ParsedCsvRow[];
  invalidRows: ParsedCsvRow[];
  duplicateRows: ParsedCsvRow[];
  accountsToCreate: ParsedCsvRow[];
}

/**
 * Section G: Validate CSV file contents for bulk account creation.
 */
export function validateBulkUserCsv(
  csvContent: string,
  existingEmails: Set<string>
): CsvValidationSummary {
  const lines = csvContent
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);

  if (lines.length === 0) {
    return {
      totalRows: 0,
      validRows: [],
      invalidRows: [],
      duplicateRows: [],
      accountsToCreate: []
    };
  }

  // Detect header
  let startIndex = 0;
  const firstLine = lines[0].toLowerCase();
  if (firstLine.includes('name') && firstLine.includes('email')) {
    startIndex = 1;
  }

  const seenInFile = new Set<string>();
  const validRows: ParsedCsvRow[] = [];
  const invalidRows: ParsedCsvRow[] = [];
  const duplicateRows: ParsedCsvRow[] = [];
  const accountsToCreate: ParsedCsvRow[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i];
    // Split by comma with basic quote handling
    const cols = parseCsvLine(rawLine);
    const name = cols[0]?.trim() || '';
    const email = cols[1]?.trim().toLowerCase() || '';
    const role = cols[2]?.trim().toLowerCase() || 'user';
    const organization = cols[3]?.trim() || '';

    const errors: string[] = [];

    if (!name) errors.push('Name is required');
    if (!email) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email address format');
    }

    const isDuplicate = existingEmails.has(email) || seenInFile.has(email);
    if (isDuplicate) {
      if (existingEmails.has(email)) {
        errors.push(`Account already exists in database`);
      } else {
        errors.push(`Duplicate email within this CSV`);
      }
    } else if (email) {
      seenInFile.add(email);
    }

    const row: ParsedCsvRow = {
      index: i + 1,
      name,
      email,
      role: ['admin', 'moderator', 'user'].includes(role) ? role : 'user',
      organization,
      isValid: errors.length === 0,
      isDuplicate,
      errors
    };

    if (row.isDuplicate) {
      duplicateRows.push(row);
    } else if (!row.isValid) {
      invalidRows.push(row);
    } else {
      validRows.push(row);
      accountsToCreate.push(row);
    }
  }

  return {
    totalRows: lines.length - startIndex,
    validRows,
    invalidRows,
    duplicateRows,
    accountsToCreate
  };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Section R: Export tabular data as clean CSV.
 * Strict privacy rule: NEVER export passwords, OTPs, or auth secrets.
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number | boolean)[][]): void {
  const escapeCell = (val: any) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvRows = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ];

  const blob = new Blob([csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
