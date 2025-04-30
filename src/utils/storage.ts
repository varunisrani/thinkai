export const STORAGE_KEYS = {
  SCRIPT_DATA: 'script_data',
  ONE_LINER_DATA: 'one_liner_data',
  CHARACTER_DATA: 'character_data',
  SCHEDULE_DATA: 'schedule_data',
  BUDGET_DATA: 'budget_data',
  THEME_MODE: 'theme_mode'
} as const;

export type StorageKey = keyof typeof STORAGE_KEYS;

export const saveToStorage = (key: StorageKey, data: any): void => {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

export const loadFromStorage = <T>(key: StorageKey): T | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS[key]);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return null;
  }
};

export const clearStorage = (key?: StorageKey): void => {
  try {
    if (key) {
      localStorage.removeItem(STORAGE_KEYS[key]);
    } else {
      Object.values(STORAGE_KEYS).forEach(storageKey => {
        localStorage.removeItem(storageKey);
      });
    }
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
}; 