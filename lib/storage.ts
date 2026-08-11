// Storage adapter — swap point for Pocketbase/Supabase post-MVP (plan-mvp A2).

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

// 1MB soft cap — warn before quota blow (PRD §6.5).
export const STORAGE_WARN_BYTES = 1_000_000;

export function loadFromStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveToStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
    if (value.length > STORAGE_WARN_BYTES) {
      console.warn(`[myduitku] storage near limit: ${value.length} bytes`);
    }
  } catch (err) {
    console.error("[myduitku] localStorage quota exceeded", err);
  }
}
