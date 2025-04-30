
import React, { useState } from 'react';
import { FileText, Download } from 'lucide-react';

const OneLinerTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  const dummyScenes = [
    {
      id: '1',
      scene_number: '1',
      location: 'EXT. CITY STREET - DAY',
      summary: 'JOHN (30s) walks down a busy city street, checking his watch nervously.'
    },
    {
      id: '2',
      scene_number: '2',
      location: 'INT. COFFEE SHOP - DAY',
      summary: 'SARAH (20s) waits at a table, scanning the door each time it opens.'
    },
    {
      id: '3',
      scene_number: '3',
      location: 'INT. COFFEE SHOP - DAY',
      summary: 'John enters, spots Sarah. They make eye contact for the first time in years.'
    },
    {
      id: '4',
      scene_number: '4',
      location: 'EXT. PARK - DUSK',
      summary: 'John and Sarah walk through the park, deep in conversation about their past.'
    },
    {
      id: '5',
      scene_number: '5',
      location: 'INT. JOHN\'S APARTMENT - NIGHT',
      summary: 'John stares at an old photograph of him and Sarah, then makes a phone call.'
    },
  ];

  const handleExport = () => {
    alert('Export functionality would be implemented here');
  };

  return (
    <div className="p-6 h-full overflow-y-auto animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-studio-text-primary">
            Script One-Liners
          </h2>
          
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 rounded-md bg-studio-blue hover:bg-studio-blue/70 text-studio-text-secondary"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
        
        <div className="studio-section mb-8">
          <h3 className="text-xl font-medium mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-studio-accent" />
            Scene Summaries
          </h3>
          
          <div className="space-y-4">
            {dummyScenes.map((scene) => (
              <div 
                key={scene.id}
                className="p-4 bg-studio-blue/40 border border-studio-border rounded-lg"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className="bg-studio-accent text-white text-xs px-2 py-0.5 rounded-md mr-2">
                      Scene {scene.scene_number}
                    </span>
                    <span className="text-studio-text-secondary font-mono text-sm">
                      {scene.location}
                    </span>
                  </div>
                  <button className="text-xs text-studio-text-secondary hover:text-studio-accent">
                    Edit
                  </button>
                </div>
                <p className="text-studio-text-primary">
                  {scene.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="studio-section">
          <h3 className="text-xl font-medium mb-4">Overall Summary</h3>
          <div className="p-4 bg-studio-blue/40 border border-studio-border rounded-lg">
            <p className="text-studio-text-primary mb-4">
              A story of chance reunion between former lovers John and Sarah, who 
              reconnect after years apart. Their meeting at a coffee shop leads to a 
              walk through the park where they revisit their shared history. Later, 
              John reflects on their encounter and decides to reach out to Sarah again, 
              suggesting the possibility of rekindling their relationship.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="bg-studio-blue px-2 py-1 rounded-md text-xs text-studio-text-secondary">
                Romance
              </span>
              <span className="bg-studio-blue px-2 py-1 rounded-md text-xs text-studio-text-secondary">
                Drama
              </span>
              <span className="bg-studio-blue px-2 py-1 rounded-md text-xs text-studio-text-secondary">
                Relationship
              </span>
              <span className="bg-studio-blue px-2 py-1 rounded-md text-xs text-studio-text-secondary">
                Reunion
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OneLinerTab;
