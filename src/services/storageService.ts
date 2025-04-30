import { toast } from 'sonner';
import {
  ScriptData,
  OneLinerData,
  CharacterData,
  ScheduleData,
  StoryboardData
} from './scriptApiService';

// Local storage keys
export const STORAGE_KEYS = {
  SCRIPT_DATA: 'SCRIPT_DATA',
  ONE_LINER_DATA: 'ONE_LINER_DATA',
  CHARACTER_DATA: 'CHARACTER_DATA',
  SCHEDULE_DATA: 'SCHEDULE_DATA',
  STORYBOARD_DATA: 'STORYBOARD_DATA',
};

// Save data to local storage
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage (${key}):`, error);
    toast.error('Failed to save data to local storage.');
  }
}

// Get data from local storage
export function getFromLocalStorage<T>(key: string): T | null {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) as T : null;
  } catch (error) {
    console.error(`Error reading from localStorage (${key}):`, error);
    toast.error('Failed to load data from local storage.');
    return null;
  }
}

// Specific storage functions
export function getStoredScriptData(): ScriptData | null {
  return getFromLocalStorage<ScriptData>(STORAGE_KEYS.SCRIPT_DATA);
}

export function getStoredOneLinerData(): OneLinerData | null {
  return getFromLocalStorage<OneLinerData>(STORAGE_KEYS.ONE_LINER_DATA);
}

export function getStoredCharacterData(): CharacterData | null {
  return getFromLocalStorage<CharacterData>(STORAGE_KEYS.CHARACTER_DATA);
}

export function getStoredScheduleData(): ScheduleData | null {
  return getFromLocalStorage<ScheduleData>(STORAGE_KEYS.SCHEDULE_DATA);
}

export function getStoredStoryboardData(): StoryboardData | null {
  return getFromLocalStorage<StoryboardData>(STORAGE_KEYS.STORYBOARD_DATA);
}

// Clear all stored data
export function clearAllStoredData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SCRIPT_DATA);
    localStorage.removeItem(STORAGE_KEYS.ONE_LINER_DATA);
    localStorage.removeItem(STORAGE_KEYS.CHARACTER_DATA);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULE_DATA);
    localStorage.removeItem(STORAGE_KEYS.STORYBOARD_DATA);
    toast.success('All stored script data has been cleared.');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
    toast.error('Failed to clear stored data.');
  }
}
