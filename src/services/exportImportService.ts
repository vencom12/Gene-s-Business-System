import type { AppDataPayload } from './storage/StorageInterface';
import { sanitizeJSONObject } from '../utils/sanitizer';
import { migrateData } from './storage/DataMigration';

export function exportDataToJSON(data: AppDataPayload, filenamePrefix: string = 'genes-bakery-backup'): void {
  const exportPayload: AppDataPayload = {
    ...data,
    exportedAt: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().split('T')[0];
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseAndValidateImportJSON(jsonText: string): { success: boolean; data?: AppDataPayload; error?: string } {
  try {
    const rawParsed = JSON.parse(jsonText);

    if (typeof rawParsed !== 'object' || rawParsed === null) {
      return { success: false, error: 'Invalid JSON file structure.' };
    }

    const sanitized = sanitizeJSONObject(rawParsed);

    if (!Array.isArray(sanitized.inventory) && !Array.isArray(sanitized.recipes)) {
      return { success: false, error: 'File does not contain valid bakery backup data.' };
    }

    const migrated = migrateData(sanitized);
    return { success: true, data: migrated };
  } catch (err) {
    return { success: false, error: 'Failed to parse JSON file. File may be corrupted.' };
  }
}
