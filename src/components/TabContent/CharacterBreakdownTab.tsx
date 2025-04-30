
import React, { useState, useEffect } from 'react';
import { Users, Grid, BarChart2, Database, Loader2 } from 'lucide-react';
import { ArrowsUpDown } from '@/lib/icon-exports';
import { cn } from '@/lib/utils';
import { analyzeCharacters, getCharacterData, CharacterData } from '@/services/scriptApiService';
import { toast } from 'sonner';

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

const CharacterCard: React.FC<{
  name: string;
  character: CharacterData['characters'][string];
}> = ({ name, character }) => (
  <div className="bg-studio-blue/40 border border-studio-border rounded-lg p-4">
    <div className="flex items-center mb-3">
      <div className="h-12 w-12 rounded-full bg-studio-accent/30 flex items-center justify-center text-studio-accent font-bold">
        {name.charAt(0)}
      </div>
      <div className="ml-3">
        <h4 className="font-medium text-studio-text-primary">{name}</h4>
        <p className="text-sm text-studio-text-secondary">
          {character.objectives.main_objective.split(' ').slice(0, 4).join(' ')}...
        </p>
      </div>
    </div>
    
    <p className="text-studio-text-primary mb-3">{character.objectives.main_objective}</p>
    
    <div className="flex flex-wrap gap-2">
      {character.emotional_range.emotional_spectrum.slice(0, 3).map((trait, i) => (
        <span key={i} className="bg-studio-blue px-2 py-1 rounded-md text-xs text-studio-text-secondary">
          {trait}
        </span>
      ))}
    </div>

    <div className="mt-3 text-sm">
      <div className="flex justify-between mt-2">
        <span className="text-studio-text-secondary">Lines:</span>
        <span>{character.dialogue_analysis.total_lines}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-studio-text-secondary">Words:</span>
        <span>{character.dialogue_analysis.total_words}</span>
      </div>
    </div>
  </div>
);

const NoDataMessage: React.FC<{onGenerateClick: () => void; isLoading: boolean}> = ({
  onGenerateClick, isLoading
}) => (
  <div className="flex flex-col items-center justify-center h-64 text-center p-6">
    <Users className="h-12 w-12 text-studio-text-secondary mb-4" />
    <h3 className="text-xl font-medium mb-2">No character data available</h3>
    <p className="text-studio-text-secondary mb-4">
      Generate character analysis to view detailed breakdowns of your script's characters.
    </p>
    <button
      onClick={onGenerateClick}
      disabled={isLoading}
      className="px-6 py-2 bg-studio-accent hover:bg-studio-accent-hover disabled:bg-studio-blue disabled:text-studio-text-secondary rounded-md text-white font-medium flex items-center"
    >
      {isLoading ? (
        <>
          <Loader2 className="animate-spin h-4 w-4 mr-2" />
          Analyzing...
        </>
      ) : (
        'Generate Character Analysis'
      )}
    </button>
  </div>
);

const CharacterBreakdownTab: React.FC = () => {
  const [activeSubtab, setActiveSubtab] = useState(0);
  const [characterData, setCharacterData] = useState<CharacterData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const subtabs = [
    { icon: Users, label: 'Character Profiles' },
    { icon: ArrowsUpDown, label: 'Arc & Relationships' },
    { icon: Grid, label: 'Scene Matrix' },
    { icon: BarChart2, label: 'Statistics' },
    { icon: Database, label: 'Raw Data' }
  ];

  useEffect(() => {
    // Load character data from localStorage on component mount
    const data = getCharacterData();
    setCharacterData(data);
  }, []);

  const handleGenerateAnalysis = async () => {
    setIsLoading(true);
    try {
      const result = await analyzeCharacters();
      if (result) {
        setCharacterData(result);
        toast.success('Character analysis completed successfully!');
      }
    } catch (error) {
      console.error('Error analyzing characters:', error);
      toast.error('Failed to generate character analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-studio-border p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-studio-text-primary">
            Character Breakdown
          </h2>
          
          {characterData && (
            <button 
              onClick={handleGenerateAnalysis}
              disabled={isLoading}
              className="flex items-center px-3 py-1 text-sm rounded-md bg-studio-blue hover:bg-studio-blue/70 text-studio-text-secondary"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh Analysis'
              )}
            </button>
          )}
        </div>
        
        <div className="flex overflow-x-auto pb-2 mt-4">
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
        {!characterData ? (
          <NoDataMessage onGenerateClick={handleGenerateAnalysis} isLoading={isLoading} />
        ) : (
          <>
            {activeSubtab === 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                {Object.entries(characterData.characters).map(([name, character]) => (
                  <CharacterCard key={name} name={name} character={character} />
                ))}
              </div>
            )}
            
            {activeSubtab === 1 && (
              <div className="studio-section animate-fade-in">
                <h3 className="text-xl font-medium mb-4">Character Arcs & Relationships</h3>
                
                <div className="space-y-6">
                  <div className="h-96 bg-studio-blue/40 border border-studio-border rounded-lg flex items-center justify-center">
                    <p className="text-studio-text-secondary text-lg">Relationship Graph Visualization</p>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-medium mb-3">Character Relationships</h4>
                    <div className="space-y-4">
                      {Object.entries(characterData.relationships).map(([key, relation]) => (
                        <div key={key} className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                          <h5 className="font-medium mb-2">{key}</h5>
                          <div className="flex items-center mb-2">
                            <span className="text-studio-text-secondary mr-2">Type:</span>
                            <span className="bg-studio-blue px-2 py-0.5 rounded text-xs">
                              {relation.type}
                            </span>
                          </div>
                          
                          <div className="mb-2">
                            <h6 className="text-sm text-studio-text-secondary mb-1">Dynamics:</h6>
                            <ul className="list-disc list-inside">
                              {relation.dynamics.map((dynamic, i) => (
                                <li key={i} className="text-sm">{dynamic}</li>
                              ))}
                            </ul>
                          </div>
                          
                          {relation.evolution && relation.evolution.length > 0 && (
                            <div>
                              <h6 className="text-sm text-studio-text-secondary mb-1">Evolution:</h6>
                              <div className="space-y-2">
                                {relation.evolution.map((event, i) => (
                                  <div key={i} className="bg-studio-blue/30 p-2 rounded">
                                    <div className="text-xs font-medium mb-0.5">
                                      Scene {event.scene}
                                    </div>
                                    <div className="text-sm">{event.dynamic_change}</div>
                                    <div className="text-xs text-studio-text-secondary mt-1">
                                      Trigger: {event.trigger}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeSubtab === 2 && (
              <div className="studio-section animate-fade-in">
                <h3 className="text-xl font-medium mb-4">Scene Matrix</h3>
                
                {characterData.scene_matrix && Object.keys(characterData.scene_matrix).length > 0 ? (
                  <div className="space-y-6">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b border-studio-border">
                            <th className="p-3 text-left text-studio-text-secondary font-medium">Scene</th>
                            {Object.keys(characterData.characters).map(char => (
                              <th key={char} className="p-3 text-left text-studio-text-secondary font-medium">
                                {char}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(characterData.scene_matrix).map(([sceneId, scene]) => (
                            <tr key={sceneId} className="border-b border-studio-border/30">
                              <td className="p-3">{sceneId}</td>
                              {Object.keys(characterData.characters).map(char => (
                                <td key={`${sceneId}-${char}`} className="p-3">
                                  {scene.present_characters.includes(char) ? (
                                    <span className="inline-block w-4 h-4 rounded-full bg-studio-success"></span>
                                  ) : (
                                    <span className="inline-block w-4 h-4 rounded-full bg-studio-border/30"></span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium">Scene Details</h4>
                      
                      {Object.entries(characterData.scene_matrix).map(([sceneId, scene]) => (
                        <div key={sceneId} className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                          <h5 className="font-medium mb-2">{sceneId}</h5>
                          
                          <div className="mb-3">
                            <div className="text-sm text-studio-text-secondary mb-1">Emotional Atmosphere:</div>
                            <div className="text-sm">{scene.emotional_atmosphere}</div>
                          </div>
                          
                          <div className="mb-3">
                            <div className="text-sm text-studio-text-secondary mb-1">Key Developments:</div>
                            <ul className="list-disc list-inside">
                              {scene.key_developments.map((dev, i) => (
                                <li key={i} className="text-sm">{dev}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <div className="text-sm text-studio-text-secondary mb-1">Interactions:</div>
                            <div className="space-y-2">
                              {scene.interactions.map((interaction, i) => (
                                <div key={i} className="bg-studio-blue/30 p-2 rounded text-sm">
                                  <div>
                                    <span className="text-studio-text-secondary">Characters: </span>
                                    {interaction.characters.join(', ')}
                                  </div>
                                  <div>
                                    <span className="text-studio-text-secondary">Type: </span>
                                    {interaction.type}
                                  </div>
                                  <div>
                                    <span className="text-studio-text-secondary">Significance: </span>
                                    {interaction.significance}/10
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-studio-blue/40 border border-studio-border p-6 rounded-lg text-center">
                    <p className="text-studio-text-secondary">
                      Scene matrix data is not available in the current dataset.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {activeSubtab === 3 && (
              <div className="studio-section animate-fade-in">
                <h3 className="text-xl font-medium mb-4">Character Statistics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Scene Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-studio-text-secondary">Total Scenes:</span>
                        <span>{characterData.statistics.scene_stats.total_scenes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-studio-text-secondary">Characters Per Scene (avg):</span>
                        <span>{characterData.statistics.scene_stats.average_characters_per_scene.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-studio-text-secondary">Total Interactions:</span>
                        <span>{characterData.statistics.scene_stats.total_interactions}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Dialogue Comparison</h4>
                    <div className="space-y-3">
                      {Object.entries(characterData.statistics.dialogue_stats).map(([char, stats]) => (
                        <div key={char} className="text-sm">
                          <div className="flex justify-between font-medium">
                            <span>{char}</span>
                            <span>{stats.total_lines} lines / {stats.total_words} words</span>
                          </div>
                          <div className="w-full bg-studio-blue/30 h-2 mt-1 rounded-full overflow-hidden">
                            <div 
                              className="bg-studio-accent h-full rounded-full"
                              style={{ width: `${(stats.total_words / 500) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {activeSubtab === 4 && (
              <div className="studio-section animate-fade-in">
                <h3 className="text-xl font-medium mb-4">Raw Character Data</h3>
                <div className="bg-studio-dark-blue rounded-md p-4 font-mono text-sm text-studio-text-secondary overflow-x-auto">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(characterData, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CharacterBreakdownTab;
