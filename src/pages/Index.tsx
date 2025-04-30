
import React, { useState } from 'react';
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

const Index = () => {
  const [activeTab, setActiveTab] = useState(0);

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

  return (
    <div className="h-screen flex flex-col">
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
  );
};

export default Index;
