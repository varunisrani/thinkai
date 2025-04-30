
import React, { useState } from 'react';
import { Timeline, FileSearch, BarChart2, Users, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubtabProps {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

const Subtab: React.FC<SubtabProps> = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center px-4 py-2 rounded-md mr-3 transition-colors',
      active ? 'tab-active' : 'tab-inactive'
    )}
  >
    <Icon className="h-4 w-4 mr-2" />
    {label}
  </button>
);

const PlaceholderContent: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-6 animate-fade-in">
    <div className="bg-studio-blue/40 border border-studio-border rounded-lg p-6">
      <h3 className="text-xl font-medium mb-4">{title}</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-studio-blue/70 rounded-md animate-pulse"></div>
        <div className="space-y-2">
          <div className="h-8 bg-studio-blue/70 rounded-md animate-pulse w-3/4"></div>
          <div className="h-4 bg-studio-blue/70 rounded-md animate-pulse w-full"></div>
          <div className="h-4 bg-studio-blue/70 rounded-md animate-pulse w-5/6"></div>
          <div className="h-4 bg-studio-blue/70 rounded-md animate-pulse w-4/5"></div>
          <div className="h-8 bg-studio-blue/70 rounded-md animate-pulse w-2/3 mt-4"></div>
          <div className="h-4 bg-studio-blue/70 rounded-md animate-pulse w-full"></div>
          <div className="h-4 bg-studio-blue/70 rounded-md animate-pulse w-3/4"></div>
        </div>
      </div>
    </div>
  </div>
);

const ScriptAnalysisTab: React.FC = () => {
  const [activeSubtab, setActiveSubtab] = useState(0);
  
  const subtabs = [
    { icon: Timeline, label: 'Timeline' },
    { icon: FileSearch, label: 'Scene Analysis' },
    { icon: BarChart2, label: 'Technical Requirements' },
    { icon: Users, label: 'Department Analysis' },
    { icon: Database, label: 'Raw Data' }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-studio-border p-4">
        <h2 className="text-2xl font-semibold mb-4 text-studio-text-primary">
          Script Analysis
        </h2>
        
        <div className="flex overflow-x-auto pb-2">
          {subtabs.map((tab, index) => (
            <Subtab
              key={index}
              active={activeSubtab === index}
              icon={tab.icon}
              label={tab.label}
              onClick={() => setActiveSubtab(index)}
            />
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeSubtab === 0 && <PlaceholderContent title="Timeline Analysis" />}
        {activeSubtab === 1 && <PlaceholderContent title="Scene Analysis" />}
        {activeSubtab === 2 && <PlaceholderContent title="Technical Requirements" />}
        {activeSubtab === 3 && <PlaceholderContent title="Department Analysis" />}
        {activeSubtab === 4 && <PlaceholderContent title="Raw Data" />}
      </div>
    </div>
  );
};

export default ScriptAnalysisTab;
