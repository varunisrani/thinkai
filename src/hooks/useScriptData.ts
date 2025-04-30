import { useContext, useEffect } from 'react';
import { ScriptDataContext, ScriptDataContextType } from '@/pages/Index';
import { 
  getFromLocalStorage,
  STORAGE_KEYS
} from '@/services/storageService';
import {
  ScriptData,
  OneLinerData,
  CharacterData,
  ScheduleData,
  StoryboardData
} from '@/services/scriptApiService';

// Custom hook to access the script data context
export function useScriptData(): ScriptDataContextType {
  const context = useContext(ScriptDataContext);
  if (context === undefined) {
    throw new Error('useScriptData must be used within a ScriptDataProvider');
  }
  
  // Load data from localStorage on mount
  useEffect(() => {
    // Load script data
    const scriptData = getFromLocalStorage<ScriptData>(STORAGE_KEYS.SCRIPT_DATA);
    if (scriptData && context.updateScriptData) {
      context.updateScriptData(scriptData);
    }
    
    // Load one-liner data
    const oneLinerData = getFromLocalStorage<OneLinerData>(STORAGE_KEYS.ONE_LINER_DATA);
    if (oneLinerData && context.updateOneLinerData) {
      context.updateOneLinerData(oneLinerData);
    }
    
    // Load character data
    const characterData = getFromLocalStorage<CharacterData>(STORAGE_KEYS.CHARACTER_DATA);
    if (characterData && context.updateCharacterData) {
      context.updateCharacterData(characterData);
    }
    
    // Load schedule data
    const scheduleData = getFromLocalStorage<ScheduleData>(STORAGE_KEYS.SCHEDULE_DATA);
    if (scheduleData && context.updateScheduleData) {
      context.updateScheduleData(scheduleData);
    }
    
    // Load storyboard data
    const storyboardData = getFromLocalStorage<StoryboardData>(STORAGE_KEYS.STORYBOARD_DATA);
    if (storyboardData && context.updateStoryboardData) {
      context.updateStoryboardData(storyboardData);
    }
  }, [
    context.updateScriptData, 
    context.updateOneLinerData, 
    context.updateCharacterData, 
    context.updateScheduleData, 
    context.updateStoryboardData
  ]);
  
  return context;
}
