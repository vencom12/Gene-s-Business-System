import type { StorageInterface, AppDataPayload } from './StorageInterface';
import { migrateData } from './DataMigration';
import { sanitizeJSONObject } from '../../utils/sanitizer';

const STORAGE_KEY = 'genes_bakery_system_v1';

export class LocalStorageService implements StorageInterface {
  loadData(): AppDataPayload | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const sanitized = sanitizeJSONObject(parsed);
      return migrateData(sanitized);
    } catch (error) {
      console.error('Failed to load data from LocalStorage:', error);
      return null;
    }
  }

  saveData(data: AppDataPayload): void {
    try {
      const sanitized = sanitizeJSONObject(data);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
    } catch (error) {
      console.error('Failed to save data to LocalStorage:', error);
    }
  }

  clearData(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear LocalStorage:', error);
    }
  }
}

export const storageService = new LocalStorageService();
