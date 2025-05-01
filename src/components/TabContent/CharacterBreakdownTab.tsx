import React, { useState, useEffect } from 'react';
import { Users, Grid, BarChart2, Database, Loader2, RefreshCw } from 'lucide-react';
import { ArrowsUpDown } from '@/lib/icon-exports';
import { cn } from '@/lib/utils';
import { useScriptData } from '@/hooks/useScriptData';
import { toast } from 'sonner';

// API endpoint constant
const API_URL = 'https://varun324242-sjuu.hf.space/api';

// Debug logging helper with proper typing
const logDebug = (message: string, data?: unknown) => {
  console.log(`[CharacterBreakdownTab] ${message}`, data || '');
};

interface SubtabProps {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

interface CharacterObjectives {
  main_objective?: string;
  scene_objectives?: Array<{
    scene: string | number;
    objective: string;
    obstacles: string[];
    outcome: string;
  }>;
}

interface EmotionalJourney {
  scene: string;
  emotion: string;
  intensity: number;
  trigger: string;
}

interface CharacterEmotionalRange {
  primary_emotion?: string;
  emotional_spectrum?: string[];
  emotional_journey?: EmotionalJourney[];
}

interface DialogueAnalysis {
  total_lines: number;
  total_words: number;
  average_line_length?: number;
  vocabulary_complexity?: number;
  patterns?: {
    common_phrases?: string[];
    speech_style?: string;
    emotional_markers?: string[];
  };
}

interface ActionSequence {
  scene: string;
  sequence: string;
  interaction_type: string;
  emotional_context: string;
}

interface Makeup {
  base: {
    item: string;
  };
  timeline: Array<{
    scene: string;
    changes: {
      item: string;
    };
    special_effects: string[];
  }>;
}

interface PropChange {
  scene: string;
  additions: string[];
  removals: string[];
}

interface CostumeItem {
  scene?: string;
  description?: string;
  accessories?: string[];
}

interface RelationshipEvent {
  scene: string | number;
  description: string;
  trigger?: string;
}

interface Relationship {
  type: string | null;
  dynamics: string[];
  evolution: Array<{
    scene: number;
    dynamic_change: string;
    trigger: string;
  }>;
  interactions: string[];
  conflicts: string[];
}

interface EmotionalJourneyEntry {
  scene: string;
  emotion: string;
  intensity: number;
  trigger: string;
}

interface SceneMatrixData {
  characters?: string[];
  present_characters?: string[];
  emotional_tone?: string;
  emotional_atmosphere?: string;
}

interface EmotionalStats {
  primary_emotion: string;
  emotional_variety: number;
  average_intensity: number;
}

interface TechnicalStats {
  total_props: number;
  unique_props: number;
}

interface MakeupStats {
  total_changes: number;
}

interface CostumeStats {
  total_changes: number;
}

interface Statistics {
  scene_stats: {
    total_scenes: number;
    average_characters_per_scene: number;
    total_interactions: number;
  };
  dialogue_stats: Record<string, DialogueStats>;
  emotional_stats: Record<string, EmotionalStats>;
  technical_stats: {
    prop_usage: Record<string, { total_props: number; unique_props: number }>;
    makeup_changes: Record<string, { total_changes: number }>;
    costume_changes: Record<string, { total_changes: number }>;
  };
  relationship_stats: Record<string, {
    total_interactions: number;
    total_conflicts: number;
    dynamic_changes: number;
  }>;
}

interface Character {
  dialogue_analysis?: DialogueAnalysis;
  emotional_range?: CharacterEmotionalRange;
  action_sequences?: ActionSequence[];
  scene_presence?: string[];
  objectives?: CharacterObjectives;
  makeup?: {
    base?: { item: string };
    timeline?: Array<{
      scene: string;
      changes: { item: string };
      special_effects: string[];
    }>;
  };
  props?: {
    base?: string[];
    timeline?: PropChange[];
  };
  costumes?: CostumeItem[];
  importance_score?: number;
  screen_time_percentage?: number;
}

// Statistics interfaces
interface RelationshipStats {
  total_interactions: number;
  total_conflicts: number;
  dynamic_changes: number;
}

interface CharacterStats {
  primary_emotion: string;
  emotional_variety: number;
  average_intensity: number;
}

interface DialogueStats {
  total_lines: number;
  total_words: number;
  average_line_length: number;
  vocabulary_complexity: number;
}

interface TechnicalItemStats {
  total_changes: number;
  unique_items: number;
}

// Define the SceneMatrixEntry interface
interface SceneMatrixEntry {
  characters?: string[];
  present_characters?: string[];
  emotional_tone?: string;
  emotional_atmosphere?: string;
  key_developments?: string[];
  interactions?: Array<{
    characters: string[];
    type: string;
    significance: number;
  }>;
}

interface EmotionalJourneyEntry {
  scene: string;
  emotion: string;
  intensity: number;
  trigger: string;
}

interface SceneMatrixData {
  characters?: string[];
  present_characters?: string[];
  emotional_tone?: string;
  emotional_atmosphere?: string;
}

interface EmotionalStats {
  primary_emotion: string;
  emotional_variety: number;
  average_intensity: number;
}

interface TechnicalStats {
  total_props: number;
  unique_props: number;
}

interface MakeupStats {
  total_changes: number;
}

interface CostumeStats {
  total_changes: number;
}

interface Statistics {
  scene_stats: {
    total_scenes: number;
    average_characters_per_scene: number;
    total_interactions: number;
  };
  dialogue_stats: Record<string, DialogueStats>;
  emotional_stats: Record<string, EmotionalStats>;
  technical_stats: {
    prop_usage: Record<string, { total_props: number; unique_props: number }>;
    makeup_changes: Record<string, { total_changes: number }>;
    costume_changes: Record<string, { total_changes: number }>;
  };
  relationship_stats: Record<string, {
    total_interactions: number;
    total_conflicts: number;
    dynamic_changes: number;
  }>;
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

// Type-safe render functions
const renderCharacter = (charData: Character & { __name?: string }) => {
  // Extract data safely
  const dialogueAnalysis = charData?.dialogue_analysis || {
    total_lines: 0,
    total_words: 0,
    average_line_length: 0,
    vocabulary_complexity: 0,
    patterns: {
      common_phrases: [],
      speech_style: '',
      emotional_markers: []
    }
  };
  
  const emotionalRange = charData?.emotional_range || {
    primary_emotion: '',
    emotional_spectrum: [],
    emotional_journey: []
  };
  
  const actionSequences = charData?.action_sequences || [];
  const baseProps = charData?.props?.base || [];
  const propTimeline = charData?.props?.timeline || [];
  const baseMakeup = charData?.makeup?.base?.item || 'None specified';
  const makeupTimeline = charData?.makeup?.timeline || [];

  return (
    <div className="bg-studio-blue/40 border border-studio-border rounded-lg p-4">
      {/* Character Header */}
      <div className="flex items-center mb-4">
        <div className="h-12 w-12 rounded-full bg-studio-accent/30 flex items-center justify-center text-studio-accent font-bold">
          {charData.__name?.charAt(0) || '?'}
        </div>
        <div className="ml-3">
          <h4 className="font-medium text-studio-text-primary text-lg">{charData.__name || 'Unknown'}</h4>
          <p className="text-sm text-studio-text-secondary">
            Primary emotion: <span className="font-medium">{emotionalRange.primary_emotion}</span>
          </p>
        </div>
      </div>
      
      {/* Dialogue Analysis */}
      <div className="mb-6">
        <h5 className="text-sm font-medium text-studio-text-primary mb-2">Dialogue Analysis</h5>
        <div className="bg-studio-blue/30 p-3 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-studio-text-secondary">Lines:</span>
              <span>{dialogueAnalysis.total_lines}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-studio-text-secondary">Words:</span>
              <span>{dialogueAnalysis.total_words}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-studio-text-secondary">Avg Length:</span>
              <span>{dialogueAnalysis.average_line_length?.toFixed(1)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-studio-text-secondary">Complexity:</span>
              <span>{dialogueAnalysis.vocabulary_complexity?.toFixed(1)}</span>
            </div>
          </div>

          {dialogueAnalysis.patterns && (
            <div className="space-y-2 pt-2 border-t border-studio-border/30">
              <div>
                <p className="text-xs text-studio-text-secondary mb-1">Common Phrases:</p>
                <div className="flex flex-wrap gap-1">
                  {dialogueAnalysis.patterns.common_phrases?.map((phrase, i) => (
                    <span key={i} className="bg-studio-blue/20 px-2 py-0.5 rounded text-xs">
                      {phrase}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-studio-text-secondary mb-1">Speech Style:</p>
                <p className="text-sm">{dialogueAnalysis.patterns.speech_style}</p>
              </div>
              <div>
                <p className="text-xs text-studio-text-secondary mb-1">Emotional Markers:</p>
                <div className="flex flex-wrap gap-1">
                  {dialogueAnalysis.patterns.emotional_markers?.map((marker, i) => (
                    <span key={i} className="bg-studio-accent/20 px-2 py-0.5 rounded text-xs">
                      {marker}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Emotional Range */}
      <div className="mb-6">
        <h5 className="text-sm font-medium text-studio-text-primary mb-2">Emotional Journey</h5>
        <div className="bg-studio-blue/30 p-3 rounded-lg space-y-3">
          <div>
            <p className="text-xs text-studio-text-secondary mb-1">Emotional Spectrum:</p>
            <div className="flex flex-wrap gap-1">
              {emotionalRange.emotional_spectrum?.map((emotion, i) => (
                <span key={i} className="bg-studio-accent/20 px-2 py-0.5 rounded text-xs">
                  {emotion}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-studio-text-secondary">Scene Progression:</p>
            {emotionalRange.emotional_journey?.map((journey, i) => (
              <div key={i} className="bg-studio-blue/20 p-2 rounded">
                <div className="flex justify-between text-xs mb-1">
                  <span>Scene {journey.scene}</span>
                  <span className="text-studio-accent">
                    Intensity: {(journey.intensity * 10).toFixed(0)}/10
                  </span>
                </div>
                <p className="text-sm mb-1 font-medium">{journey.emotion}</p>
                <p className="text-xs text-studio-text-secondary">Trigger: {journey.trigger}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Sequences */}
      <div className="mb-6">
        <h5 className="text-sm font-medium text-studio-text-primary mb-2">Action Sequences</h5>
        <div className="space-y-2">
          {actionSequences.map((action, i) => (
            <div key={i} className="bg-studio-blue/30 p-3 rounded-lg">
              <div className="flex justify-between text-xs text-studio-text-secondary mb-1">
                <span>Scene {action.scene}</span>
                <span>{action.interaction_type}</span>
              </div>
              <p className="text-sm mb-2">{action.sequence}</p>
              <span className="text-xs px-2 py-0.5 bg-studio-accent/20 rounded">
                {action.emotional_context}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Makeup and Props */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Makeup */}
        <div>
          <h5 className="text-sm font-medium text-studio-text-primary mb-2">Makeup</h5>
          <div className="bg-studio-blue/30 p-3 rounded-lg">
            <div className="mb-3">
              <p className="text-xs text-studio-text-secondary mb-1">Base Look:</p>
              <p className="text-sm">{baseMakeup}</p>
            </div>
            {makeupTimeline.length > 0 && (
              <div>
                <p className="text-xs text-studio-text-secondary mb-1">Changes:</p>
                <div className="space-y-2">
                  {makeupTimeline.map((change, i) => (
                    <div key={i} className="bg-studio-blue/20 p-2 rounded text-sm">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Scene {change.scene}</span>
                      </div>
                      <p className="mb-1">{change.changes.item}</p>
                      {change.special_effects.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {change.special_effects.map((effect, j) => (
                            <span key={j} className="text-xs bg-studio-accent/20 px-2 py-0.5 rounded">
                              {effect}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Props */}
        <div>
          <h5 className="text-sm font-medium text-studio-text-primary mb-2">Props</h5>
          <div className="bg-studio-blue/30 p-3 rounded-lg">
            <div className="mb-3">
              <p className="text-xs text-studio-text-secondary mb-1">Base Props:</p>
              <div className="flex flex-wrap gap-1">
                {baseProps.map((prop, i) => (
                  <span key={i} className="bg-studio-blue/20 px-2 py-0.5 rounded text-sm">
                    {prop}
                  </span>
                ))}
              </div>
            </div>
            {propTimeline.length > 0 && (
              <div>
                <p className="text-xs text-studio-text-secondary mb-1">Changes:</p>
                <div className="space-y-2">
                  {propTimeline.map((change, i) => (
                    <div key={i} className="bg-studio-blue/20 p-2 rounded">
                      <p className="text-xs mb-1">Scene {change.scene}</p>
                      {change.additions.length > 0 && (
                        <div className="mb-1">
                          <span className="text-xs text-studio-success">+ </span>
                          {change.additions.join(', ')}
                        </div>
                      )}
                      {change.removals.length > 0 && (
                        <div>
                          <span className="text-xs text-studio-warning">- </span>
                          {change.removals.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Modify the CharacterCard component to use renderCharacter
const CharacterCard: React.FC<{
  name: string;
  character: Character;
}> = ({ name, character }) => {
  // Add name to character object for rendering
  const charData = {
    ...character,
    __name: name
  };
  
  return renderCharacter(charData);
};

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
  const { scriptData, characterData, updateCharacterData } = useScriptData();
  const [activeSubtab, setActiveSubtab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const subtabs = [
    { icon: Users, label: 'Character Profiles' },
    { icon: ArrowsUpDown, label: 'Arc & Relationships' },
    { icon: Grid, label: 'Scene Matrix' },
    { icon: BarChart2, label: 'Statistics' }
  ];

  const handleGenerateAnalysis = async () => {
    if (!scriptData) {
      toast.error('Please upload a script first');
      return;
    }

    const isRegeneration = !!characterData;
    setIsLoading(true);
    if (isRegeneration) {
      setIsRegenerating(true);
    }

    try {
      const response = await fetch(`${API_URL}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script_data: scriptData
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }

      // Save to localStorage
      localStorage.setItem('CHARACTER_DATA', JSON.stringify(result.data));

      // Force a re-render if regenerating
      if (isRegeneration) {
        // Temporarily clear the data to force a re-render
        updateCharacterData(null);
        setTimeout(() => {
          updateCharacterData(result.data);
        }, 0);
      } else {
        updateCharacterData(result.data);
      }

      toast.success(isRegeneration ? 'Character analysis regenerated successfully!' : 'Character analysis completed successfully!');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate analysis';
      toast.error(errorMessage);

      // Try to load from localStorage as fallback
      try {
        const storedData = localStorage.getItem('CHARACTER_DATA');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          updateCharacterData(parsedData);
          toast.success('Loaded character data from local storage');
        }
      } catch (storageError) {
        console.error('Failed to load from localStorage:', storageError);
      }
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-studio-border p-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-semibold text-studio-text-primary">
              Character Breakdown
            </h2>
            <p className="text-sm text-studio-text-secondary mt-1">
              Analyze character relationships, arcs, and technical requirements.
            </p>
          </div>
          
          {characterData && (
            <button 
              onClick={handleGenerateAnalysis}
              disabled={isLoading}
              className="flex items-center px-4 py-2 text-sm rounded-md bg-studio-accent hover:bg-studio-accent/90 disabled:bg-studio-accent/50 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in relative">
                {isRegenerating && (
                  <div className="absolute inset-0 bg-studio-blue/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                    <div className="text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-studio-accent" />
                      <p className="text-sm text-studio-text-secondary">Updating character profiles...</p>
                    </div>
                  </div>
                )}
                {Object.entries(characterData.characters).map(([name, character]) => (
                  <CharacterCard key={name} name={name} character={character} />
                ))}
              </div>
            )}
            
            {activeSubtab === 1 && (
              <div className="studio-section animate-fade-in relative">
                {isRegenerating && (
                  <div className="absolute inset-0 bg-studio-blue/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                    <div className="text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-studio-accent" />
                      <p className="text-sm text-studio-text-secondary">Updating character arcs & relationships...</p>
                    </div>
                  </div>
                )}
                <h3 className="text-xl font-medium mb-4">Character Arcs & Relationships</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {Object.entries(characterData.characters).map(([charName, char]) => {
                      const emotionalJourney = (char as Character).emotional_range?.emotional_journey || [];
                      
                      return (
                        <div key={charName} className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                          <h4 className="font-medium mb-3">{charName}'s Emotional Journey</h4>
                          
                          {emotionalJourney.length > 0 ? (
                            <div className="space-y-3">
                              {emotionalJourney.map((journey, i) => (
                                <div key={i} className="bg-studio-blue/30 p-3 rounded">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-studio-text-secondary">Scene {journey.scene}</span>
                                    <span className="text-xs px-2 py-0.5 bg-studio-accent/20 rounded text-studio-accent">
                                      Intensity: {(journey.intensity * 10).toFixed(0)}/10
                                    </span>
                                  </div>
                                  <div className="flex items-center text-sm mb-1">
                                    <span className="text-studio-text-secondary mr-2">Emotion:</span>
                                    <span className="font-medium">{journey.emotion}</span>
                                  </div>
                                  <div className="text-xs text-studio-text-secondary">
                                    Trigger: {journey.trigger}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center text-studio-text-secondary p-4">
                              No emotional journey data available
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  <h4 className="text-lg font-medium mb-3">Character Relationships</h4>
                  <div className="space-y-4">
                    {Object.entries(characterData.relationships || {}).map(([relationKey, relation]) => {
                      const charNames = relationKey.split('-');
                      return (
                        <div key={relationKey} className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                          <h5 className="font-medium mb-3">
                            <span className="text-studio-accent">{charNames[0]}</span> & <span className="text-studio-accent">{charNames[1]}</span>
                          </h5>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm text-studio-text-secondary mb-1">Relationship Type:</div>
                              <div className="text-sm bg-studio-blue/30 p-2 rounded">
                                {relation.type || 'Not specified'}
                              </div>
                            </div>
                            
                            <div>
                              <div className="text-sm text-studio-text-secondary mb-1">Dynamics:</div>
                              <div className="flex flex-wrap gap-1">
                                {relation.dynamics && relation.dynamics.length > 0 ? (
                                  relation.dynamics.map((dynamic, i) => (
                                    <span key={i} className="text-xs bg-studio-blue/20 px-2 py-1 rounded">
                                      {dynamic}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-sm text-studio-text-secondary">No dynamics defined</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            
            {activeSubtab === 2 && (
              <div className="studio-section animate-fade-in relative">
                {isRegenerating && (
                  <div className="absolute inset-0 bg-studio-blue/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                    <div className="text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-studio-accent" />
                      <p className="text-sm text-studio-text-secondary">Updating scene matrix...</p>
                    </div>
                  </div>
                )}
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
                            <th className="p-3 text-left text-studio-text-secondary font-medium">Emotional Tone</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(characterData.scene_matrix).map(([sceneId, sceneData]) => {
                            const scene = sceneData as SceneMatrixData;
                            const characters = scene.characters || scene.present_characters || [];
                            
                            return (
                              <tr key={sceneId} className="border-b border-studio-border/30">
                                <td className="p-3 font-medium">{sceneId}</td>
                                {Object.keys(characterData.characters).map(char => (
                                  <td key={`${sceneId}-${char}`} className="p-3">
                                    {characters.includes(char) ? (
                                      <span className="inline-block w-4 h-4 rounded-full bg-studio-success"></span>
                                    ) : (
                                      <span className="inline-block w-4 h-4 rounded-full bg-studio-border/30"></span>
                                    )}
                                  </td>
                                ))}
                                <td className="p-3 text-sm">
                                  <span className="bg-studio-blue/30 px-2 py-1 rounded">
                                    {scene.emotional_tone || 'Not specified'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {Object.entries(characterData.scene_matrix).map(([sceneId, sceneData]) => {
                        const scene = sceneData as SceneMatrixData;
                        const characters = scene.characters || scene.present_characters || [];
                        
                        return (
                          <div key={sceneId} className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                            <h4 className="font-medium mb-3">Scene {sceneId}</h4>
                            
                            <div className="mb-4">
                              <div className="text-sm font-medium text-studio-text-secondary mb-1">Characters Present:</div>
                              <div className="flex flex-wrap gap-1">
                                {characters.map((char: string, i: number) => (
                                  <span key={i} className="bg-studio-blue/30 px-2 py-0.5 rounded text-sm">
                                    {char}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            <div className="mb-2">
                              <div className="text-sm font-medium text-studio-text-secondary mb-1">Emotional Tone:</div>
                              <div className="text-sm bg-studio-accent/20 px-3 py-1 rounded inline-block">
                                {scene.emotional_tone || scene.emotional_atmosphere || 'Not specified'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
              <div className="studio-section animate-fade-in relative">
                {isRegenerating && (
                  <div className="absolute inset-0 bg-studio-blue/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                    <div className="text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-studio-accent" />
                      <p className="text-sm text-studio-text-secondary">Updating character statistics...</p>
                    </div>
                  </div>
                )}
                <h3 className="text-xl font-medium mb-4">Character Statistics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Scene Statistics</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-studio-text-secondary">Total Scenes:</span>
                        <span>{characterData.statistics?.scene_stats?.total_scenes || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-studio-text-secondary">Characters Per Scene (avg):</span>
                        <span>{(characterData.statistics?.scene_stats?.average_characters_per_scene || 0).toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-studio-text-secondary">Total Interactions:</span>
                        <span>{characterData.statistics?.scene_stats?.total_interactions || 0}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Emotional Statistics</h4>
                    <div className="space-y-3">
                      {Object.entries(characterData.statistics?.emotional_stats || {}).map(([charName, statData]) => {
                        const stats = statData as EmotionalStats;
                        return (
                          <div key={charName} className="text-sm">
                            <div className="flex justify-between font-medium">
                              <span>{charName}</span>
                              <span>
                                {stats.primary_emotion} ({stats.emotional_variety} emotions)
                              </span>
                            </div>
                            <div className="w-full bg-studio-blue/30 h-2 mt-1 rounded-full overflow-hidden">
                              <div 
                                className="bg-studio-accent h-full rounded-full"
                                style={{ width: `${stats.average_intensity * 100}%` }}
                              ></div>
                            </div>
                            <div className="text-xs text-studio-text-secondary text-right mt-1">
                              Average Intensity: {(stats.average_intensity * 10).toFixed(1)}/10
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                    <h4 className="font-medium mb-3">Dialogue Statistics</h4>
                    <div className="space-y-3">
                      {Object.entries(characterData.statistics?.dialogue_stats || {}).map(([charName, statData]) => {
                        const dialogueStats = statData as DialogueStats;
                        const allWordCounts = Object.values(characterData.statistics?.dialogue_stats || {}).map((s: DialogueStats) => s.total_words || 0);
                        const maxWords = Math.max(...allWordCounts);
                        return (
                          <div key={charName} className="text-sm">
                            <div className="flex justify-between font-medium">
                              <span>{charName}</span>
                              <span>{dialogueStats.total_lines} lines / {dialogueStats.total_words} words</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                              <div>
                                <span className="text-studio-text-secondary">Avg Line Length: </span>
                                <span>{dialogueStats.average_line_length?.toFixed(1) || '0'} words</span>
                              </div>
                              <div>
                                <span className="text-studio-text-secondary">Vocabulary Complexity: </span>
                                <span>{dialogueStats.vocabulary_complexity?.toFixed(1) || '0'}/5</span>
                              </div>
                            </div>
                            <div className="w-full bg-studio-blue/30 h-2 mt-1 rounded-full overflow-hidden">
                              <div 
                                className="bg-studio-accent h-full rounded-full"
                                style={{ width: `${(dialogueStats.total_words / (maxWords || 1)) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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

