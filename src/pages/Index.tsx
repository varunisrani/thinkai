
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
import { ScriptData, OneLinerData, CharacterData, ScheduleData, StoryboardData } from '@/services/scriptApiService';

// Create context for script data
export interface ScriptDataContextType {
  activeTab: number;
  setActiveTab: (tab: number) => void;
  scriptData: ScriptData | null;
  oneLinerData: OneLinerData | null;
  characterData: CharacterData | null;
  scheduleData: ScheduleData | null;
  storyboardData: StoryboardData | null;
  updateScriptData: (data: ScriptData | null) => void;
  updateOneLinerData: (data: OneLinerData | null) => void;
  updateCharacterData: (data: CharacterData | null) => void;
  updateScheduleData: (data: ScheduleData | null) => void;
  updateStoryboardData: (data: StoryboardData | null) => void;
}

export const ScriptDataContext = createContext<ScriptDataContextType>({
  activeTab: 0,
  setActiveTab: () => {},
  scriptData: null,
  oneLinerData: null,
  characterData: null,
  scheduleData: null,
  storyboardData: null,
  updateScriptData: () => {},
  updateOneLinerData: () => {},
  updateCharacterData: () => {},
  updateScheduleData: () => {},
  updateStoryboardData: () => {},
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
    <BudgetTab key={5} />,
    <StoryboardTab key={6} />,
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
    updateScriptData: setScriptData,
    updateOneLinerData: setOneLinerData,
    updateCharacterData: setCharacterData,
    updateScheduleData: setScheduleData,
    updateStoryboardData: setStoryboardData,
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
