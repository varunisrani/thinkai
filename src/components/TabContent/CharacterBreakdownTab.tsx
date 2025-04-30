
import React, { useState } from 'react';
import { Users, Grid, BarChart2, Database } from 'lucide-react';
import { ArrowsUpDown } from '@/lib/icon-exports'; // Import from our icon-exports file
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

const CharacterCard: React.FC<{name: string; role: string; traits: string[]; description: string}> = ({
  name,
  role,
  traits,
  description
}) => (
  <div className="bg-studio-blue/40 border border-studio-border rounded-lg p-4">
    <div className="flex items-center mb-3">
      <div className="h-12 w-12 rounded-full bg-studio-accent/30 flex items-center justify-center text-studio-accent font-bold">
        {name.charAt(0)}
      </div>
      <div className="ml-3">
        <h4 className="font-medium text-studio-text-primary">{name}</h4>
        <p className="text-sm text-studio-text-secondary">{role}</p>
      </div>
    </div>
    
    <p className="text-studio-text-primary mb-3">{description}</p>
    
    <div className="flex flex-wrap gap-2">
      {traits.map((trait, i) => (
        <span key={i} className="bg-studio-blue px-2 py-1 rounded-md text-xs text-studio-text-secondary">
          {trait}
        </span>
      ))}
    </div>
  </div>
);

const CharacterBreakdownTab: React.FC = () => {
  const [activeSubtab, setActiveSubtab] = useState(0);
  
  const subtabs = [
    { icon: Users, label: 'Character Profiles' },
    { icon: ArrowsUpDown, label: 'Arc & Relationships' },
    { icon: Grid, label: 'Scene Matrix' },
    { icon: BarChart2, label: 'Statistics' },
    { icon: Database, label: 'Raw Data' }
  ];

  const characters = [
    {
      name: 'John',
      role: 'Protagonist',
      traits: ['Anxious', 'Hopeful', 'Reflective'],
      description: 'A man in his 30s who still carries emotional weight from his past relationship with Sarah.'
    },
    {
      name: 'Sarah',
      role: 'Deuteragonist',
      traits: ['Patient', 'Curious', 'Composed'],
      description: 'A woman in her 20s who seems to have been waiting for a chance to reconnect with John.'
    }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-studio-border p-4">
        <h2 className="text-2xl font-semibold mb-4 text-studio-text-primary">
          Character Breakdown
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
      
      <div className="flex-1 overflow-y-auto p-6">
        {activeSubtab === 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {characters.map((character, index) => (
              <CharacterCard key={index} {...character} />
            ))}
          </div>
        )}
        
        {activeSubtab === 1 && (
          <div className="studio-section animate-fade-in">
            <h3 className="text-xl font-medium mb-4">Character Arcs & Relationships</h3>
            <div className="h-96 bg-studio-blue/70 rounded-md flex items-center justify-center">
              <p className="text-studio-text-secondary text-lg">Relationship Graph Visualization</p>
            </div>
          </div>
        )}
        
        {activeSubtab === 2 && (
          <div className="studio-section animate-fade-in">
            <h3 className="text-xl font-medium mb-4">Scene Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-studio-border">
                    <th className="p-3 text-left text-studio-text-secondary font-medium">Scene</th>
                    <th className="p-3 text-left text-studio-text-secondary font-medium">John</th>
                    <th className="p-3 text-left text-studio-text-secondary font-medium">Sarah</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-studio-border/30">
                    <td className="p-3">Scene 1</td>
                    <td className="p-3"><span className="inline-block w-4 h-4 rounded-full bg-studio-success"></span></td>
                    <td className="p-3"><span className="inline-block w-4 h-4 rounded-full bg-studio-border/30"></span></td>
                  </tr>
                  <tr className="border-b border-studio-border/30">
                    <td className="p-3">Scene 2</td>
                    <td className="p-3"><span className="inline-block w-4 h-4 rounded-full bg-studio-border/30"></span></td>
                    <td className="p-3"><span className="inline-block w-4 h-4 rounded-full bg-studio-success"></span></td>
                  </tr>
                  <tr className="border-b border-studio-border/30">
                    <td className="p-3">Scene 3</td>
                    <td className="p-3"><span className="inline-block w-4 h-4 rounded-full bg-studio-success"></span></td>
                    <td className="p-3"><span className="inline-block w-4 h-4 rounded-full bg-studio-success"></span></td>
                  </tr>
                  <tr className="border-b border-studio-border/30">
                    <td className="p-3">Scene 4</td>
                    <td className="p-3"><span className="inline-block w-4 h-4 rounded-full bg-studio-success"></span></td>
                    <td className="p-3"><span className="inline-block w-4 h-4 rounded-full bg-studio-success"></span></td>
                  </tr>
                  <tr className="border-b border-studio-border/30">
                    <td className="p-3">Scene 5</td>
                    <td className="p-3"><span className="inline-block w-4 h-4 rounded-full bg-studio-success"></span></td>
                    <td className="p-3"><span className="inline-block w-4 h-4 rounded-full bg-studio-border/30"></span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {activeSubtab === 3 && (
          <div className="studio-section animate-fade-in">
            <h3 className="text-xl font-medium mb-4">Character Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-studio-blue/70 rounded-md animate-pulse"></div>
              <div className="h-64 bg-studio-blue/70 rounded-md animate-pulse"></div>
            </div>
          </div>
        )}
        
        {activeSubtab === 4 && (
          <div className="studio-section animate-fade-in">
            <h3 className="text-xl font-medium mb-4">Raw Character Data</h3>
            <div className="bg-studio-dark-blue rounded-md p-4 font-mono text-sm text-studio-text-secondary overflow-x-auto">
              <pre>{JSON.stringify({ characters }, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharacterBreakdownTab;
