import React, { useState, useEffect } from 'react';
import { History, FileSearch, BarChart2, Users, Database, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getScriptData, ScriptData } from '@/services/scriptApiService';
import { useScriptData } from '@/hooks/useScriptData';

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

const DataSection: React.FC<{title: string; children: React.ReactNode}> = ({ title, children }) => (
  <div className="p-6 animate-fade-in">
    <div className="bg-studio-blue/40 border border-studio-border rounded-lg p-6">
      <h3 className="text-xl font-medium mb-4">{title}</h3>
      {children}
    </div>
  </div>
);

const LoadingMessage: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <Loader className="h-12 w-12 text-studio-text-secondary mb-4 animate-spin" />
    <h3 className="text-xl font-medium mb-2">Loading script analysis...</h3>
    <p className="text-studio-text-secondary">
      Please wait while we process your script.
    </p>
  </div>
);

const ErrorMessage: React.FC<{message: string}> = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <AlertCircle className="h-12 w-12 text-studio-error mb-4" />
    <h3 className="text-xl font-medium mb-2">Error Loading Analysis</h3>
    <p className="text-studio-error mb-4">
      {message}
    </p>
  </div>
);

const NoDataMessage: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-64 text-center">
    <Database className="h-12 w-12 text-studio-text-secondary mb-4" />
    <h3 className="text-xl font-medium mb-2">No script data available</h3>
    <p className="text-studio-text-secondary mb-4">
      Please upload a script first to view analysis results.
    </p>
    <button 
      onClick={() => window.history.back()}
      className="px-4 py-2 bg-studio-blue text-white rounded-md hover:bg-studio-blue/90 transition-colors"
    >
      Go to Upload
    </button>
  </div>
);

const TimelineAnalysis: React.FC<{scriptData: ScriptData | null}> = ({ scriptData }) => {
  console.log('TimelineAnalysis rendered with:', {
    hasData: !!scriptData,
    hasTimeline: !!scriptData?.parsed_data?.timeline
  });

  if (!scriptData || !scriptData.parsed_data || !scriptData.parsed_data.timeline) {
    return <NoDataMessage />;
  }

  const { timeline } = scriptData.parsed_data;

  return (
    <DataSection title="Timeline Analysis">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-studio-blue/70 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <span className="text-studio-text-secondary">Total Duration:</span>
              <span className="font-medium">{timeline.total_duration}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-studio-text-secondary">Total Pages:</span>
              <span className="font-medium">{timeline.total_pages}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-studio-text-secondary">Average Scene Duration:</span>
              <span className="font-medium">{timeline.average_scene_duration} min</span>
            </div>
          </div>

          <h4 className="text-lg font-medium mt-4 mb-2">Scene Breakdown</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {timeline.scene_breakdown.map((scene, index) => (
              <div key={index} className="bg-studio-blue/30 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Scene {scene.scene_number}</span>
                  <span className="text-sm text-studio-text-secondary">
                    {scene.start_time} - {scene.end_time}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-studio-text-secondary">{scene.location}</span>
                  <span className="text-studio-accent">
                    {scene.characters.length} characters
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-96 bg-studio-blue/70 rounded-lg flex items-center justify-center">
          <p className="text-studio-text-secondary">Timeline visualization would be displayed here</p>
        </div>
      </div>
    </DataSection>
  );
};

const SceneAnalysis: React.FC<{scriptData: ScriptData | null}> = ({ scriptData }) => {
  console.log('SceneAnalysis rendered with:', {
    hasData: !!scriptData,
    hasScenes: !!scriptData?.parsed_data?.scenes,
    sceneDetails: scriptData?.parsed_data?.scenes?.map(scene => ({
      number: scene.scene_number,
      complexity: scene.complexity_score
    }))
  });

  if (!scriptData || !scriptData.parsed_data || !scriptData.parsed_data.scenes) {
    return <NoDataMessage />;
  }

  const { scenes } = scriptData.parsed_data;

  return (
    <DataSection title="Scene Analysis">
      <div className="space-y-6">
        {scenes.map((scene, index) => (
          <div key={index} className="bg-studio-blue/70 p-4 rounded-lg">
            <div className="flex justify-between mb-2">
              <h4 className="font-medium">Scene {scene.scene_number}</h4>
              <span className="text-sm bg-studio-accent/20 text-studio-accent px-2 py-0.5 rounded">
                Complexity: {(scene.complexity_score || 0).toFixed(1)}
              </span>
            </div>
            
            <div className="mb-3">
              <span className="text-studio-text-secondary font-mono text-sm">
                {scene.location?.place || 'Unknown Location'}
              </span>
            </div>
            
            <p className="text-studio-text-primary mb-3">
              {scene.description || 'No description available'}
            </p>
            
            {scene.technical_cues && scene.technical_cues.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-studio-text-secondary mb-1">Technical Cues:</h5>
                <ul className="list-disc list-inside text-sm">
                  {scene.technical_cues.map((cue, i) => (
                    <li key={i} className="text-studio-text-secondary">{cue}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div>
              <h5 className="text-sm font-medium text-studio-text-secondary mb-1">Characters:</h5>
              <div className="flex flex-wrap gap-1">
                {(scene.main_characters || []).map((character, i) => (
                  <span key={i} className="bg-studio-blue px-2 py-0.5 rounded text-xs">
                    {character}
                  </span>
                ))}
                {(!scene.main_characters || scene.main_characters.length === 0) && (
                  <span className="text-studio-text-secondary text-xs">No characters listed</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DataSection>
  );
};

const TechnicalRequirements: React.FC<{scriptData: ScriptData | null}> = ({ scriptData }) => {
  console.log('TechnicalRequirements rendered with:', {
    hasData: !!scriptData,
    hasMetadata: !!scriptData?.metadata
  });

  if (!scriptData || !scriptData.metadata || !scriptData.metadata.global_requirements) {
    return <NoDataMessage />;
  }

  const { global_requirements } = scriptData.metadata;

  return (
    <DataSection title="Technical Requirements">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h4 className="font-medium mb-2 text-studio-accent">Equipment</h4>
          <ul className="list-disc list-inside space-y-1">
            {global_requirements.equipment.map((item, index) => (
              <li key={index} className="text-studio-text-secondary">{item}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-2 text-studio-accent">Props</h4>
          <ul className="list-disc list-inside space-y-1">
            {global_requirements.props.map((item, index) => (
              <li key={index} className="text-studio-text-secondary">{item}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium mb-2 text-studio-accent">Special Effects</h4>
          <ul className="list-disc list-inside space-y-1">
            {global_requirements.special_effects.map((item, index) => (
              <li key={index} className="text-studio-text-secondary">{item}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-8">
        <h4 className="font-medium mb-3">Scene Specific Requirements</h4>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {scriptData.metadata.scene_metadata.map((scene, index) => (
            <div key={index} className="bg-studio-blue/30 p-3 rounded-lg">
              <h5 className="font-medium mb-2">Scene {scene.scene_number}</h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="text-sm font-medium text-studio-text-secondary mb-1">Lighting</h6>
                  <div className="text-sm mb-2">Type: {scene.lighting.type}</div>
                  {scene.lighting.requirements.length > 0 && (
                    <ul className="list-disc list-inside text-xs text-studio-text-secondary">
                      {scene.lighting.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                  )}
                </div>
                
                <div>
                  <h6 className="text-sm font-medium text-studio-text-secondary mb-1">Props</h6>
                  {Object.entries(scene.props).map(([category, items], i) => (
                    <div key={i} className="mb-1">
                      <div className="text-xs">{category}:</div>
                      <ul className="list-disc list-inside text-xs text-studio-text-secondary ml-2">
                        {items.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DataSection>
  );
};

const DepartmentAnalysis: React.FC<{scriptData: ScriptData | null}> = ({ scriptData }) => {
  console.log('DepartmentAnalysis rendered with:', {
    hasData: !!scriptData,
    hasScenes: !!scriptData?.parsed_data?.scenes
  });

  if (!scriptData || !scriptData.parsed_data || !scriptData.parsed_data.scenes) {
    return <NoDataMessage />;
  }

  // Extract department notes from all scenes
  const allDepartments = new Set<string>();
  scriptData.parsed_data.scenes.forEach(scene => {
    Object.keys(scene.department_notes || {}).forEach(dept => {
      allDepartments.add(dept);
    });
  });
  
  const departments = Array.from(allDepartments);

  // Ensure validation exists and has the required properties
  const hasValidation = scriptData.validation && 
    scriptData.validation.validation_report && 
    scriptData.validation.validation_report.technical_validation &&
    scriptData.validation.validation_report.technical_validation.department_conflicts;

  return (
    <DataSection title="Department Analysis">
      <div className="mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {departments.map((dept) => (
            <div key={dept} className="bg-studio-blue/70 p-3 rounded-lg">
              <h4 className="font-medium">{dept}</h4>
              <div className="text-xs text-studio-text-secondary mt-1">
                Click for detailed notes
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <h4 className="font-medium">Department Conflicts</h4>
        {hasValidation ? (
          <>
            {scriptData.validation.validation_report.technical_validation.department_conflicts.map((conflict, index) => (
              <div key={index} className="bg-studio-warning/20 border border-studio-warning/30 p-3 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-studio-warning mr-2 mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Scene {conflict.scene_number} Conflict</div>
                    <p className="text-sm">{conflict.conflict}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {scriptData.validation.validation_report.technical_validation.department_conflicts.length === 0 && (
              <div className="bg-studio-success/20 border border-studio-success/30 p-3 rounded-lg text-center">
                <p>No department conflicts detected</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-studio-blue/20 border border-studio-blue/30 p-3 rounded-lg text-center">
            <p>Validation data not available</p>
          </div>
        )}
      </div>
    </DataSection>
  );
};

const RawData: React.FC<{scriptData: ScriptData | null}> = ({ scriptData }) => {
  console.log('RawData rendered with:', {
    hasData: !!scriptData
  });

  if (!scriptData) {
    return <NoDataMessage />;
  }

  return (
    <DataSection title="Raw Data">
      <div className="bg-studio-dark-blue rounded-md p-4 font-mono text-sm text-studio-text-secondary overflow-x-auto">
        <pre className="whitespace-pre-wrap">
          {JSON.stringify(scriptData, null, 2)}
        </pre>
      </div>
    </DataSection>
  );
};

// Import AlertCircle icon
import { AlertCircle } from 'lucide-react';

const ScriptAnalysisTab: React.FC = () => {
  const [activeSubtab, setActiveSubtab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the scriptData from context instead of local state
  const { scriptData, updateScriptData } = useScriptData();
  
  console.log('ScriptAnalysisTab rendered with:', {
    isLoading,
    hasError: !!error,
    hasScriptData: !!scriptData,
    activeSubtab
  });

  const subtabs = [
    { icon: History, label: 'Timeline' },
    { icon: FileSearch, label: 'Scene Analysis' },
    { icon: BarChart2, label: 'Technical Requirements' },
    { icon: Users, label: 'Department Analysis' },
    { icon: Database, label: 'Raw Data' }
  ];

  useEffect(() => {
    const loadScriptData = async () => {
      console.log('Starting loadScriptData...');
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if we have script data in context
        if (!scriptData) {
          console.log('No script data in context, trying localStorage...');
          // Try to load from storage if not in context
          const data = getScriptData();
          console.log('Data from localStorage:', data ? 'Found' : 'Not found');
          
          if (!data) {
            console.warn('No script data found in localStorage');
            setError('No script data found. Please upload a script first.');
          } else {
            console.log('Successfully loaded script data from localStorage');
            // Update the context with the data from localStorage
            if (data && updateScriptData) {
              updateScriptData(data);
              console.log('Updated context with script data from localStorage');
            }
          }
        } else {
          console.log('Script data found in context:', {
            hasTimeline: !!scriptData.parsed_data?.timeline,
            hasScenes: !!scriptData.parsed_data?.scenes,
            sceneCount: scriptData.parsed_data?.scenes?.length
          });
        }
      } catch (err) {
        console.error('Error in loadScriptData:', err);
        setError('Failed to load script data. Please try again.');
      } finally {
        console.log('Finishing loadScriptData, setting isLoading to false');
        setIsLoading(false);
      }
    };

    loadScriptData();

    // Cleanup function to log component unmount
    return () => {
      console.log('ScriptAnalysisTab unmounting');
    };
  }, [scriptData, updateScriptData]);

  // Log when active subtab changes
  useEffect(() => {
    console.log('Active subtab changed to:', {
      index: activeSubtab,
      label: subtabs[activeSubtab].label
    });
  }, [activeSubtab]);

  const renderContent = () => {
    console.log('Rendering content with states:', {
      isLoading,
      hasError: !!error,
      hasScriptData: !!scriptData,
      activeSubtab
    });

    if (isLoading) {
      console.log('Showing loading message');
      return <LoadingMessage />;
    }

    if (error) {
      console.log('Showing error message:', error);
      return <ErrorMessage message={error} />;
    }

    if (!scriptData) {
      console.log('Showing no data message');
      return <NoDataMessage />;
    }

    console.log('Rendering analysis component for subtab:', subtabs[activeSubtab].label);
    
    // Add logging to each analysis component
    const components = {
      0: () => {
        console.log('Rendering TimelineAnalysis with data:', {
          hasTimeline: !!scriptData.parsed_data?.timeline
        });
        return <TimelineAnalysis scriptData={scriptData} />;
      },
      1: () => {
        console.log('Rendering SceneAnalysis with data:', {
          sceneCount: scriptData.parsed_data?.scenes?.length
        });
        return <SceneAnalysis scriptData={scriptData} />;
      },
      2: () => {
        console.log('Rendering TechnicalRequirements with data:', {
          hasMetadata: !!scriptData.metadata
        });
        return <TechnicalRequirements scriptData={scriptData} />;
      },
      3: () => {
        console.log('Rendering DepartmentAnalysis with data:', {
          hasScenes: !!scriptData.parsed_data?.scenes
        });
        return <DepartmentAnalysis scriptData={scriptData} />;
      },
      4: () => {
        console.log('Rendering RawData');
        return <RawData scriptData={scriptData} />;
      }
    };

    return components[activeSubtab as keyof typeof components]?.();
  };

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
              onClick={() => {
                console.log('Subtab clicked:', {
                  from: activeSubtab,
                  to: index,
                  label: tab.label
                });
                setActiveSubtab(index);
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default ScriptAnalysisTab;
