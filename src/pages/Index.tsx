import React, { useState, createContext, useEffect } from 'react';
import MainSidebar from '../components/MainSidebar';
import AppHeader from '../components/AppHeader';
import UploadScriptTab from '../components/TabContent/UploadScriptTab';
import ScriptAnalysisTab from '../components/TabContent/ScriptAnalysisTab';
import OneLinerTab from '../components/TabContent/OneLinerTab';
import CharacterBreakdownTab from '../components/TabContent/CharacterBreakdownTab';
import ScheduleTab from '../components/TabContent/ScheduleTab';
import BudgetTab from '../components/TabContent/BudgetTab';
import StoryboardTab from '../components/TabContent/StoryboardTab';
import ProjectOverviewTab from '../components/TabContent/ProjectOverviewTab';
import { getStoredScriptData, getStoredOneLinerData, getStoredCharacterData, getStoredScheduleData, getStoredStoryboardData } from '@/services/storageService';
import { ScriptData, OneLinerData, CharacterData, ScheduleData, StoryboardData, BudgetData } from '@/services/scriptApiService';

// Create context for script data
export interface ScriptDataContextType {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  scriptData: ScriptData | null;
  oneLinerData: OneLinerData | null;
  characterData: CharacterData | null;
  scheduleData: ScheduleData | null;
  storyboardData: StoryboardData | null;
  budgetData: BudgetData | null;
  updateScriptData: (data: ScriptData | null) => void;
  updateOneLinerData: (data: OneLinerData | null) => void;
  updateCharacterData: (data: CharacterData | null) => void;
  updateScheduleData: (data: ScheduleData | null) => void;
  updateStoryboardData: (data: StoryboardData | null) => void;
  updateBudgetData: (data: BudgetData | null) => void;
  canProceedToTab: (tabIndex: number) => boolean;
}

export const ScriptDataContext = createContext<ScriptDataContextType>({
  activeTab: 0,
  setActiveTab: () => {},
  scriptData: null,
  oneLinerData: null,
  characterData: null,
  scheduleData: null,
  storyboardData: null,
  budgetData: null,
  updateScriptData: () => {},
  updateOneLinerData: () => {},
  updateCharacterData: () => {},
  updateScheduleData: () => {},
  updateStoryboardData: () => {},
  updateBudgetData: () => {},
  canProceedToTab: () => true,
});

const Index = () => {
  const [activeTab, setActiveTab] = useState(0);
  // Initialize states with data from localStorage
  const [scriptData, setScriptData] = useState<ScriptData | null>(getStoredScriptData());
  const [oneLinerData, setOneLinerData] = useState<OneLinerData | null>(getStoredOneLinerData());
  const [characterData, setCharacterData] = useState<CharacterData | null>(getStoredCharacterData());
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(getStoredScheduleData());
  const [storyboardData, setStoryboardData] = useState<StoryboardData | null>(getStoredStoryboardData());

  // Mapping of tab indices to their components
  const tabComponents = [
    <UploadScriptTab key={0} />,
    <ScriptAnalysisTab key={1} />,
    <OneLinerTab key={2} />,
    <CharacterBreakdownTab key={3} />,
    <ScheduleTab key={4} />,
    <BudgetTab key={5} darkMode={false} apiUrl="/api/budget" />,
    <StoryboardTab key={6} darkMode={false} apiUrl="/api/storyboard" />,
    <ProjectOverviewTab key={7} />,
  ];

  // Context value
  const contextValue: ScriptDataContextType = {
    activeTab,
    setActiveTab,
    scriptData,
    oneLinerData,
    characterData,
    scheduleData,
    storyboardData,
    budgetData: null,
    updateScriptData: setScriptData,
    updateOneLinerData: setOneLinerData,
    updateCharacterData: setCharacterData,
    updateScheduleData: setScheduleData,
    updateStoryboardData: setStoryboardData,
    updateBudgetData: () => {},
    canProceedToTab: (tabIndex: number) => {
      // Tab 0 (Upload) is always accessible
      if (tabIndex === 0) return true;
      
      // Script Analysis (1) requires script data
      if (tabIndex === 1) return !!scriptData;
      
      // One-liner (2) requires script data
      if (tabIndex === 2) return !!scriptData;
      
      // Character Breakdown (3) requires script data and one-liner
      if (tabIndex === 3) return !!scriptData && !!oneLinerData;
      
      // Schedule (4) requires character data
      if (tabIndex === 4) return !!scriptData && !!characterData;
      
      // Budget (5) requires schedule
      if (tabIndex === 5) return !!scriptData && !!scheduleData;
      
      // Storyboard (6) requires script data
      if (tabIndex === 6) return !!scriptData;
      
      // Project Overview (7) requires script data
      if (tabIndex === 7) return !!scriptData;
      
      return false;
    }
  };

  return (
    <ScriptDataContext.Provider value={contextValue}>
      <div className="h-screen flex flex-col bg-gray-50">
        <AppHeader />
        
        <div className="flex-1 flex overflow-hidden">
          <MainSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          <main className="flex-1 overflow-hidden">
            {/* Display the active tab content */}
            <div className="h-full">
              {tabComponents[activeTab]}
            </div>
          </main>
        </div>
      </div>
    </ScriptDataContext.Provider>
  );
};

export default Index;
