import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ScriptData, OneLinerData, CharacterData, ScheduleData, StoryboardData } from '@/services/scriptApiService';

interface BudgetData {
  // Add budget data type properties here
  id: string;
  total: number;
  breakdown: Record<string, number>;
  // Add other budget-related fields
}

interface StorageKeys {
  SCRIPT_DATA: string;
  ONE_LINER_DATA: string;
  CHARACTER_DATA: string;
  SCHEDULE_DATA: string;
  BUDGET_DATA: string;
  STORYBOARD_DATA: string;
}

const STORAGE_KEYS: StorageKeys = {
  SCRIPT_DATA: 'SCRIPT_DATA',
  ONE_LINER_DATA: 'ONE_LINER_DATA',
  CHARACTER_DATA: 'CHARACTER_DATA',
  SCHEDULE_DATA: 'SCHEDULE_DATA',
  BUDGET_DATA: 'BUDGET_DATA',
  STORYBOARD_DATA: 'STORYBOARD_DATA'
};

// Storage helper functions
const saveToStorage = (key: string, data: unknown): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

const getFromLocalStorage = <T,>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return null;
  }
};

interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  [key: string]: unknown;
}

// Context type
interface ScriptDataContextType {
  // Data states
  scriptData: ScriptData | null;
  oneLinerData: OneLinerData | null;
  characterData: CharacterData | null;
  scheduleData: ScheduleData | null;
  budgetData: BudgetData | null;
  storyboardData: StoryboardData | null;
  
  // Update functions
  updateScriptData: (data: ScriptData | null) => void;
  updateOneLinerData: (data: OneLinerData | null) => void;
  updateCharacterData: (data: CharacterData | null) => void;
  updateScheduleData: (data: ScheduleData | null) => void;
  updateBudgetData: (data: BudgetData | null) => void;
  updateStoryboardData: (data: StoryboardData | null) => void;
  
  // Navigation
  activeTab: number;
  setActiveTab: (tab: number) => void;
  
  // Helper functions
  clearAllData: () => void;
  canProceedToTab: (tabIndex: number) => boolean;
  getNextRequiredData: () => string;
}

const defaultContext: ScriptDataContextType = {
  scriptData: null,
  oneLinerData: null,
  characterData: null,
  scheduleData: null,
  budgetData: null,
  storyboardData: null,
  updateScriptData: () => {},
  updateOneLinerData: () => {},
  updateCharacterData: () => {},
  updateScheduleData: () => {},
  updateBudgetData: () => {},
  updateStoryboardData: () => {},
  activeTab: 0,
  setActiveTab: () => {},
  clearAllData: () => {},
  canProceedToTab: () => false,
  getNextRequiredData: () => '',
};

export const ScriptDataContext = createContext<ScriptDataContextType>(defaultContext);

// Add debug logging helper
const logDebug = (message: string, data?: any) => {
  console.log(`[ScriptDataContext] ${message}`, data || '');
};

export const ScriptDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize states with data from localStorage
  const [scriptData, setScriptData] = React.useState<ScriptData | null>(() => {
    try {
      const data = getFromLocalStorage<ScriptData>(STORAGE_KEYS.SCRIPT_DATA);
      logDebug('Initializing scriptData from localStorage:', data ? 'Found' : 'Not found');
      return data;
    } catch (err) {
      console.error('Error loading script data from storage:', err);
      return null;
    }
  });

  const [oneLinerData, setOneLinerData] = React.useState<OneLinerData | null>(() => {
    try {
      const data = getFromLocalStorage<OneLinerData>(STORAGE_KEYS.ONE_LINER_DATA);
      logDebug('Initializing oneLinerData from localStorage:', data ? 'Found' : 'Not found');
      return data;
    } catch (err) {
      console.error('Error loading one-liner data from storage:', err);
      return null;
    }
  });

  const [characterData, setCharacterData] = React.useState<CharacterData | null>(() => {
    try {
      const data = getFromLocalStorage<CharacterData>(STORAGE_KEYS.CHARACTER_DATA);
      logDebug('Initializing characterData from localStorage:', data ? 'Found' : 'Not found');
      return data;
    } catch (err) {
      console.error('Error loading character data from storage:', err);
      return null;
    }
  });

  const [scheduleData, setScheduleData] = React.useState<ScheduleData | null>(() => {
    try {
      const data = getFromLocalStorage<ScheduleData>(STORAGE_KEYS.SCHEDULE_DATA);
      logDebug('Initializing scheduleData from localStorage:', data ? 'Found' : 'Not found');
      return data;
    } catch (err) {
      console.error('Error loading schedule data from storage:', err);
      return null;
    }
  });

  const [budgetData, setBudgetData] = React.useState<BudgetData | null>(() => {
    try {
      const data = getFromLocalStorage<BudgetData>(STORAGE_KEYS.BUDGET_DATA);
      logDebug('Initializing budgetData from localStorage:', data ? 'Found' : 'Not found');
      return data;
    } catch (err) {
      console.error('Error loading budget data from storage:', err);
      return null;
    }
  });

  const [storyboardData, setStoryboardData] = React.useState<StoryboardData | null>(() => {
    try {
      const data = getFromLocalStorage<StoryboardData>(STORAGE_KEYS.STORYBOARD_DATA);
      logDebug('Initializing storyboardData from localStorage:', data ? 'Found' : 'Not found');
      return data;
    } catch (err) {
      console.error('Error loading storyboard data from storage:', err);
      return null;
    }
  });

  const [activeTab, setActiveTab] = React.useState(0);

  // Load data from localStorage on mount and handle storage events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key) return;

      logDebug('Storage change detected for key:', e.key);
      
      try {
        switch (e.key) {
          case STORAGE_KEYS.SCRIPT_DATA:
            if (e.newValue) {
              const newData = JSON.parse(e.newValue);
              logDebug('Updating scriptData from storage event:', newData);
              setScriptData(newData);
            }
            break;
          case STORAGE_KEYS.ONE_LINER_DATA:
            if (e.newValue) {
              const newData = JSON.parse(e.newValue);
              logDebug('Updating oneLinerData from storage event:', newData);
              setOneLinerData(newData);
            }
            break;
          case STORAGE_KEYS.CHARACTER_DATA:
            if (e.newValue) {
              const newData = JSON.parse(e.newValue);
              logDebug('Updating characterData from storage event:', newData);
              setCharacterData(newData);
            }
            break;
          case STORAGE_KEYS.SCHEDULE_DATA:
            if (e.newValue) {
              const newData = JSON.parse(e.newValue);
              logDebug('Updating scheduleData from storage event:', newData);
              setScheduleData(newData);
            }
            break;
          case STORAGE_KEYS.BUDGET_DATA:
            if (e.newValue) {
              const newData = JSON.parse(e.newValue);
              logDebug('Updating budgetData from storage event:', newData);
              setBudgetData(newData);
            }
            break;
          case STORAGE_KEYS.STORYBOARD_DATA:
            if (e.newValue) {
              const newData = JSON.parse(e.newValue);
              logDebug('Updating storyboardData from storage event:', newData);
              setStoryboardData(newData);
            }
            break;
        }
      } catch (err) {
        console.error('Error handling storage event:', err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Update functions with validation and notifications
  const updateScriptData = useCallback((data: ScriptData | null) => {
    logDebug('Updating scriptData:', data ? 'Has data' : 'Null');
    
    setScriptData(data);
    if (data) {
      saveToStorage(STORAGE_KEYS.SCRIPT_DATA, data);
    } else {
      // Clear dependent data when script data is cleared
      setOneLinerData(null);
      setCharacterData(null);
      setScheduleData(null);
      setBudgetData(null);
      setStoryboardData(null);
      
      // Clear from storage
      localStorage.removeItem(STORAGE_KEYS.SCRIPT_DATA);
      localStorage.removeItem(STORAGE_KEYS.ONE_LINER_DATA);
      localStorage.removeItem(STORAGE_KEYS.CHARACTER_DATA);
      localStorage.removeItem(STORAGE_KEYS.SCHEDULE_DATA);
      localStorage.removeItem(STORAGE_KEYS.BUDGET_DATA);
      localStorage.removeItem(STORAGE_KEYS.STORYBOARD_DATA);
    }
  }, []);

  const updateOneLinerData = useCallback((data: OneLinerData | null) => {
    logDebug('Updating oneLinerData:', data ? 'Has data' : 'Null');
    
    // Check localStorage for script data if not in context
    if (!scriptData) {
      const storedScriptData = getFromLocalStorage<ScriptData>(STORAGE_KEYS.SCRIPT_DATA);
      if (!storedScriptData) {
        toast.error('Cannot update one-liner data without script data');
        return;
      }
      // If found in storage but not in context, update context
      setScriptData(storedScriptData);
    }
    
    setOneLinerData(data);
    if (data) {
      saveToStorage(STORAGE_KEYS.ONE_LINER_DATA, data);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ONE_LINER_DATA);
    }
  }, [scriptData]);

  const updateCharacterData = useCallback((data: CharacterData | null) => {
    if (!scriptData && data) {
      toast.error('Cannot update character data without script data');
      return;
    }
    setCharacterData(data);
  }, [scriptData]);

  const updateScheduleData = useCallback((data: ScheduleData | null) => {
    if (!characterData && data) {
      toast.error('Cannot update schedule data without character analysis');
      return;
    }
    setScheduleData(data);
  }, [characterData]);

  const updateBudgetData = useCallback((data: BudgetData | null) => {
    if (!scheduleData && data) {
      toast.error('Cannot update budget data without schedule data');
      return;
    }
    setBudgetData(data);
  }, [scheduleData]);

  const updateStoryboardData = useCallback((data: StoryboardData | null) => {
    if (!scriptData && data) {
      toast.error('Cannot update storyboard data without script data');
      return;
    }
    setStoryboardData(data);
  }, [scriptData]);

  // Helper function to clear all data
  const clearAllData = useCallback(() => {
    updateScriptData(null);
    // Other data will be cleared by the updateScriptData function
  }, [updateScriptData]);

  // Helper function to check if can proceed to a tab
  const canProceedToTab = useCallback((tabIndex: number): boolean => {
    switch (tabIndex) {
      case 0: // Upload
        return true;
      case 1: // Script Analysis
        return !!scriptData;
      case 2: // One-Liner
        return !!scriptData;
      case 3: // Character Breakdown
        return !!scriptData;
      case 4: // Schedule
        return !!scriptData && !!characterData;
      case 5: // Budget
        return !!scriptData && !!scheduleData;
      case 6: // Storyboard
        return !!scriptData;
      case 7: // Project Overview
        return !!scriptData;
      default:
        return false;
    }
  }, [scriptData, characterData, scheduleData]);

  // Helper function to get next required data
  const getNextRequiredData = useCallback((): string => {
    if (!scriptData) return 'script';
    if (!oneLinerData) return 'one-liner analysis';
    if (!characterData) return 'character analysis';
    if (!scheduleData) return 'schedule';
    if (!budgetData) return 'budget';
    if (!storyboardData) return 'storyboard';
    return '';
  }, [scriptData, oneLinerData, characterData, scheduleData, budgetData, storyboardData]);

  const contextValue: ScriptDataContextType = {
    scriptData,
    oneLinerData,
    characterData,
    scheduleData,
    budgetData,
    storyboardData,
    updateScriptData,
    updateOneLinerData,
    updateCharacterData,
    updateScheduleData,
    updateBudgetData,
    updateStoryboardData,
    activeTab,
    setActiveTab,
    clearAllData,
    canProceedToTab,
    getNextRequiredData,
  };

  return (
    <ScriptDataContext.Provider value={contextValue}>
      {children}
    </ScriptDataContext.Provider>
  );
};

// Custom hook to use the script data context
export const useScriptData = () => {
  const context = useContext(ScriptDataContext);
  if (context === undefined) {
    throw new Error('useScriptData must be used within a ScriptDataProvider');
  }
  return context;
};

export default ScriptDataContext; 