import React, { useState, useEffect } from 'react';
import { History, FileSearch, BarChart2, Users, Database, Loader, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getScriptData } from '@/services/scriptApiService';
import { useScriptData } from '@/hooks/useScriptData';

// Define better types for the ScriptData interface
export interface ScriptData {
  parsed_data: {
    scenes: Array<{
      scene_number: string;
      location: {
        type: string;
        place: string;
      };
      time: string;
      description: string;
      duration: number;
      main_characters: string[];
      technical_cues: string[];
      department_notes: Record<string, string[]>;
      dialogues: Array<{
        character: string;
        line: string;
        parenthetical?: string;
      }>;
      transitions: string[];
      complexity_score?: number;
    }>;
    timeline: {
      total_duration: string;
      scene_breakdown: Array<{
        scene_number: string;
        start_time: string;
        end_time: string;
        duration_minutes: number;
        location: string;
        characters: string[];
        technical_complexity: number;
        setup_time: number;
      }>;
      average_scene_duration: number;
    };
    formatted_text: string;
  };
  metadata: {
    timestamp: string;
    scene_metadata: Array<{
      scene_number: string;
      mood: string;
      lighting: {
        type: string;
        requirements: string[];
        special_effects: string[];
      };
      time_details: {
        time_of_day: string;
        duration: string;
      };
      weather: {
        conditions: string[];
        effects_needed: string[];
      };
      props: Record<string, string[]>;
      technical: Record<string, string[]>;
      department_notes: Record<string, string[]>;
    }>;
    global_requirements: {
      equipment: string[];
      props: string[];
      special_effects: string[];
    };
  };
  validation: {
    is_valid: boolean;
    validation_report: {
      is_valid: boolean;
      issues: Array<{
        type: string;
        category: string;
        scene_number: string;
        description: string;
        suggestion: string;
      }>;
      scene_validations: Array<{
        scene_number: string;
        checks: Array<{
          check_name: string;
          status: string;
          details: string;
        }>;
      }>;
      timeline_validation: {
        is_valid: boolean;
        continuity_issues: string[];
        duration_issues: string[];
      };
      technical_validation: {
        department_conflicts: Array<{
          scene_number: string;
          conflict: string;
        }>;
        resource_requirements: Array<{
          scene_number: string;
          department: string;
          requirements: string[];
        }>;
      };
      summary: {
        total_scenes: number;
        valid_scenes: number;
        scenes_with_issues: number;
        total_issues: number;
      };
    };
  };
  statistics: {
    total_scenes: number;
    total_pages: number;
    estimated_runtime: string;
    total_cast: number;
    unique_locations: number;
    scene_statistics: {
      average_duration: number;
      shortest_scene: number;
      longest_scene: number;
      total_duration: number;
    };
    complex_scenes: number;
    dialogue_heavy_scenes: number;
    effects_required: number;
  };
  ui_metadata: {
    color_coding: {
      location_colors: Record<string, string>;
      time_colors: Record<string, string>;
      department_colors: Record<string, string>;
    };
    scene_complexity: Record<string, number>;
  };
}

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
  if (!scriptData || !scriptData.parsed_data || !scriptData.parsed_data.timeline) {
    return <NoDataMessage />;
  }

  const { timeline } = scriptData.parsed_data;
  const { statistics } = scriptData;

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
              <span className="text-studio-text-secondary">Total Scenes:</span>
              <span className="font-medium">{statistics?.total_scenes || timeline.scene_breakdown.length}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-studio-text-secondary">Average Scene Duration:</span>
              <span className="font-medium">{timeline.average_scene_duration} min</span>
            </div>
            {statistics?.scene_statistics && (
              <>
                <div className="flex justify-between mb-2">
                  <span className="text-studio-text-secondary">Shortest Scene:</span>
                  <span className="font-medium">{statistics.scene_statistics.shortest_scene} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-studio-text-secondary">Longest Scene:</span>
                  <span className="font-medium">{statistics.scene_statistics.longest_scene} min</span>
                </div>
              </>
            )}
          </div>

          <h4 className="text-lg font-medium mt-4 mb-2">Scene Breakdown</h4>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
            {timeline.scene_breakdown.map((scene, index) => (
              <div key={index} className="bg-studio-blue/30 p-3 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">Scene {scene.scene_number}</span>
                  <span className="text-sm text-studio-text-secondary">
                    {scene.start_time} - {scene.end_time} ({scene.duration_minutes} min)
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-studio-text-secondary">{scene.location}</span>
                  <span className="text-studio-accent">
                    {scene.characters && scene.characters.length > 0 
                      ? `${scene.characters.length} characters` 
                      : "No characters"}
                  </span>
                </div>
                {scene.technical_complexity !== undefined && (
                  <div className="text-xs mt-1 text-studio-text-secondary">
                    Technical Complexity: {scene.technical_complexity} | Setup Time: {scene.setup_time} min
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="bg-studio-blue/50 p-4 rounded-lg mb-4">
            <h4 className="text-lg font-medium mb-3">Timeline Statistics</h4>
            {scriptData.validation?.validation_report?.timeline_validation && (
              <div className="mb-4">
                <h5 className="text-sm font-medium text-studio-text-secondary mb-1">Timeline Validation:</h5>
                <div className={`text-sm ${scriptData.validation.validation_report.timeline_validation.is_valid 
                  ? "text-studio-success" : "text-studio-warning"}`}>
                  Status: {scriptData.validation.validation_report.timeline_validation.is_valid ? "Valid" : "Invalid"}
                </div>
                {scriptData.validation.validation_report.timeline_validation.duration_issues.length > 0 && (
                  <div className="mt-2">
                    <h6 className="text-xs font-medium text-studio-text-secondary">Issues:</h6>
                    <ul className="list-disc list-inside text-xs text-studio-warning">
                      {scriptData.validation.validation_report.timeline_validation.duration_issues.map((issue, i) => (
                        <li key={i}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {statistics && (
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-studio-blue/30 p-2 rounded">
                  <div className="text-xs text-studio-text-secondary">Complex Scenes</div>
                  <div className="text-xl font-medium">{statistics.complex_scenes || 0}</div>
                </div>
                <div className="bg-studio-blue/30 p-2 rounded">
                  <div className="text-xs text-studio-text-secondary">Dialogue-Heavy</div>
                  <div className="text-xl font-medium">{statistics.dialogue_heavy_scenes || 0}</div>
                </div>
                <div className="bg-studio-blue/30 p-2 rounded">
                  <div className="text-xs text-studio-text-secondary">Effects Required</div>
                  <div className="text-xl font-medium">{statistics.effects_required || 0}</div>
                </div>
                <div className="bg-studio-blue/30 p-2 rounded">
                  <div className="text-xs text-studio-text-secondary">Unique Locations</div>
                  <div className="text-xl font-medium">{statistics.unique_locations || 0}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="h-60 bg-studio-blue/20 rounded-lg p-4">
            <h4 className="text-md font-medium mb-2">Timing Visualization</h4>
            <div className="h-full flex items-center justify-center">
              <p className="text-studio-text-secondary text-sm">
                Timeline visualization would be displayed here
              </p>
            </div>
          </div>
        </div>
      </div>
    </DataSection>
  );
};

const SceneAnalysis: React.FC<{scriptData: ScriptData | null}> = ({ scriptData }) => {
  if (!scriptData || !scriptData.parsed_data || !scriptData.parsed_data.scenes) {
    return <NoDataMessage />;
  }

  const { scenes } = scriptData.parsed_data;
  const sceneComplexity = scriptData.ui_metadata?.scene_complexity || {};

  return (
    <DataSection title="Scene Analysis">
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-studio-blue/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Scene Complexity Overview</h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-studio-blue/30 p-2 rounded text-center">
                <div className="text-xs text-studio-text-secondary">Low</div>
                <div className="text-xl font-medium">
                  {Object.values(sceneComplexity).filter(v => (v as number) === 1).length || 0}
                </div>
              </div>
              <div className="bg-studio-blue/30 p-2 rounded text-center">
                <div className="text-xs text-studio-text-secondary">Medium</div>
                <div className="text-xl font-medium">
                  {Object.values(sceneComplexity).filter(v => (v as number) === 2).length || 0}
                </div>
              </div>
              <div className="bg-studio-blue/30 p-2 rounded text-center">
                <div className="text-xs text-studio-text-secondary">High</div>
                <div className="text-xl font-medium">
                  {Object.values(sceneComplexity).filter(v => (v as number) >= 3).length || 0}
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-studio-blue/50 p-4 rounded-lg">
            <h4 className="font-medium mb-3">Scene Validation</h4>
            {scriptData.validation?.validation_report?.scene_validations ? (
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-24 text-sm text-studio-text-secondary">Valid Scenes:</div>
                  <div className="font-medium">
                    {scriptData.validation.validation_report.summary?.valid_scenes || 0}
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-24 text-sm text-studio-text-secondary">With Issues:</div>
                  <div className="font-medium text-studio-warning">
                    {scriptData.validation.validation_report.summary?.scenes_with_issues || 0}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-studio-text-secondary">Validation data not available</div>
            )}
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        {scenes.map((scene, index) => {
          // Get scene metadata if available
          const sceneMetadata = scriptData.metadata?.scene_metadata?.find(
            meta => meta.scene_number === scene.scene_number
          );
          
          return (
            <div key={index} className="bg-studio-blue/30 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-lg">Scene {scene.scene_number}</h4>
                  <div className="text-sm text-studio-text-secondary">
                    {scene.location?.type} {scene.location?.place} - {scene.time}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm bg-studio-accent/20 text-studio-accent px-2 py-0.5 rounded">
                    Duration: {scene.duration || 0} min
                  </span>
                  <span className="text-sm bg-studio-blue/40 text-white px-2 py-0.5 rounded">
                    Complexity: {sceneComplexity[scene.scene_number] || "N/A"}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-studio-text-primary">
                  {scene.description || 'No description available'}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  {scene.technical_cues && scene.technical_cues.length > 0 && (
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-studio-text-secondary mb-1">Technical Cues:</h5>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {scene.technical_cues.map((cue, i) => (
                          <li key={i} className="text-studio-text-secondary">{cue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  <div className="mb-3">
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
                
                <div>
                  {sceneMetadata && (
                    <div>
                      <h5 className="text-sm font-medium text-studio-text-secondary mb-1">Scene Mood:</h5>
                      <p className="text-sm mb-2">{sceneMetadata.mood || "Not specified"}</p>
                      
                      <h5 className="text-sm font-medium text-studio-text-secondary mb-1">Lighting Type:</h5>
                      <p className="text-sm">{sceneMetadata.lighting?.type || "Not specified"}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {scene.dialogues && scene.dialogues.length > 0 && (
                <div className="mt-4 pt-3 border-t border-studio-border">
                  <h5 className="text-sm font-medium mb-2">Dialogue Preview:</h5>
                  <div className="space-y-2 bg-studio-blue/20 p-2 rounded-md">
                    {scene.dialogues.slice(0, 2).map((dialogue, i) => (
                      <div key={i} className="text-sm">
                        <div className="font-medium">{dialogue.character}</div>
                        {dialogue.parenthetical && (
                          <div className="text-xs text-studio-text-secondary">{dialogue.parenthetical}</div>
                        )}
                        <div className="pl-3 text-studio-text-secondary">"{dialogue.line}"</div>
                      </div>
                    ))}
                    {scene.dialogues.length > 2 && (
                      <div className="text-xs text-studio-text-secondary text-right">
                        +{scene.dialogues.length - 2} more lines
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {scriptData.validation?.validation_report?.scene_validations && (
                <div className="mt-4 pt-3 border-t border-studio-border">
                  <h5 className="text-sm font-medium mb-2">Validation:</h5>
                  <div>
                    {scriptData.validation.validation_report.scene_validations
                      .find(v => v.scene_number === scene.scene_number)?.checks.map((check, i) => (
                        <div key={i} className="flex items-start mb-1">
                          <span className={`mr-1 ${check.status === 'pass' ? 'text-studio-success' : 'text-studio-warning'}`}>
                            {check.status === 'pass' ? '✓' : '⚠️'}
                          </span>
                          <span className="text-xs">
                            <span className="font-medium">{check.check_name}:</span> {check.details}
                          </span>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </DataSection>
  );
};

const TechnicalRequirements: React.FC<{scriptData: ScriptData | null}> = ({ scriptData }) => {
  if (!scriptData || !scriptData.metadata || !scriptData.metadata.global_requirements) {
    return <NoDataMessage />;
  }

  const { global_requirements } = scriptData.metadata;
  const { statistics } = scriptData;

  return (
    <DataSection title="Technical Requirements">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-studio-blue/50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Technical Statistics</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-studio-blue/30 p-3 rounded">
              <div className="text-xs text-studio-text-secondary">Total Scenes</div>
              <div className="text-xl font-medium">{statistics?.total_scenes || 0}</div>
            </div>
            <div className="bg-studio-blue/30 p-3 rounded">
              <div className="text-xs text-studio-text-secondary">Estimated Runtime</div>
              <div className="text-xl font-medium">{statistics?.estimated_runtime || "00:00:00"}</div>
            </div>
            <div className="bg-studio-blue/30 p-3 rounded">
              <div className="text-xs text-studio-text-secondary">Complex Scenes</div>
              <div className="text-xl font-medium">{statistics?.complex_scenes || 0}</div>
            </div>
            <div className="bg-studio-blue/30 p-3 rounded">
              <div className="text-xs text-studio-text-secondary">Special Effects</div>
              <div className="text-xl font-medium">{statistics?.effects_required || 0}</div>
            </div>
          </div>
        </div>
        
        <div className="bg-studio-blue/50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Technical Validation</h4>
          {scriptData.validation?.is_valid !== undefined && (
            <div className={`p-3 rounded-lg mb-3 ${scriptData.validation.is_valid 
              ? "bg-studio-success/20 border border-studio-success/50" 
              : "bg-studio-warning/20 border border-studio-warning/50"}`}
            >
              <div className="flex items-center">
                {scriptData.validation.is_valid ? (
                  <>
                    <div className="w-5 h-5 mr-2 text-studio-success">✓</div>
                    <div className="font-medium">Script validation passed</div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 mr-2 text-studio-warning" />
                    <div className="font-medium">Script validation failed</div>
                  </>
                )}
              </div>
              {!scriptData.validation.is_valid && scriptData.validation.validation_report?.issues && (
                <div className="mt-2 text-sm">
                  <div className="font-medium mb-1">Issues found:</div>
                  <ul className="list-disc list-inside">
                    {scriptData.validation.validation_report.issues.slice(0, 3).map((issue, i) => (
                      <li key={i} className="text-studio-warning text-xs mb-1">
                        {issue.description}
                      </li>
                    ))}
                    {scriptData.validation.validation_report.issues.length > 3 && (
                      <li className="text-studio-text-secondary text-xs">
                        +{scriptData.validation.validation_report.issues.length - 3} more issues...
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="bg-studio-blue/70 rounded-lg p-4 mb-3">
            <h4 className="font-medium mb-2 text-studio-accent">Equipment</h4>
            <ul className="list-disc list-inside space-y-1">
              {global_requirements.equipment.map((item, index) => (
                <li key={index} className="text-studio-text-secondary">{item}</li>
              ))}
              {global_requirements.equipment.length === 0 && (
                <li className="text-studio-text-secondary italic">No equipment specified</li>
              )}
            </ul>
          </div>
        </div>
        
        <div>
          <div className="bg-studio-blue/70 rounded-lg p-4 mb-3">
            <h4 className="font-medium mb-2 text-studio-accent">Props</h4>
            <ul className="list-disc list-inside space-y-1">
              {global_requirements.props.map((item, index) => (
                <li key={index} className="text-studio-text-secondary">{item}</li>
              ))}
              {global_requirements.props.length === 0 && (
                <li className="text-studio-text-secondary italic">No props specified</li>
              )}
            </ul>
          </div>
        </div>
        
        <div>
          <div className="bg-studio-blue/70 rounded-lg p-4 mb-3">
            <h4 className="font-medium mb-2 text-studio-accent">Special Effects</h4>
            <ul className="list-disc list-inside space-y-1">
              {global_requirements.special_effects.map((item, index) => (
                <li key={index} className="text-studio-text-secondary">{item}</li>
              ))}
              {global_requirements.special_effects.length === 0 && (
                <li className="text-studio-text-secondary italic">No special effects specified</li>
              )}
            </ul>
          </div>
        </div>
      </div>
      
      <div className="mt-8">
        <h4 className="font-medium mb-3">Scene-Specific Requirements</h4>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {scriptData.metadata.scene_metadata.map((scene, index) => (
            <div key={index} className="bg-studio-blue/30 p-3 rounded-lg">
              <div className="flex justify-between mb-2">
                <h5 className="font-medium">Scene {scene.scene_number}</h5>
                <span className="text-xs bg-studio-accent/20 text-studio-accent px-2 py-0.5 rounded">
                  Mood: {scene.mood}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="text-sm font-medium text-studio-text-secondary mb-1">Lighting</h6>
                  <div className="text-sm mb-1">Type: {scene.lighting.type}</div>
                  {scene.lighting.requirements.length > 0 && (
                    <>
                      <div className="text-xs text-studio-text-secondary mb-1">Requirements:</div>
                      <ul className="list-disc list-inside text-xs text-studio-text-secondary ml-2">
                        {scene.lighting.requirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
                
                <div>
                  <h6 className="text-sm font-medium text-studio-text-secondary mb-1">Props</h6>
                  {Object.entries(scene.props).map(([category, items], i) => {
                    // Convert items to array if it's not already
                    const itemsArray = Array.isArray(items) ? items : [];
                    return itemsArray.length > 0 ? (
                      <div key={i} className="mb-2">
                        <div className="text-xs text-studio-text-secondary">{category}:</div>
                        <ul className="list-disc list-inside text-xs text-studio-text-secondary ml-2">
                          {itemsArray.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              
              {scene.technical && Object.keys(scene.technical).length > 0 && (
                <div className="mt-3 pt-3 border-t border-studio-border">
                  <h6 className="text-sm font-medium text-studio-text-secondary mb-1">Technical Requirements:</h6>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(scene.technical).map(([category, items], i) => {
                      // Convert items to array if it's not already
                      const itemsArray = Array.isArray(items) ? items : [];
                      return itemsArray.length > 0 ? (
                        <div key={i}>
                          <div className="text-xs text-studio-text-secondary">{category}:</div>
                          <ul className="list-disc list-inside text-xs text-studio-text-secondary ml-2">
                            {itemsArray.map((item, j) => (
                              <li key={j}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </DataSection>
  );
};

const DepartmentAnalysis: React.FC<{scriptData: ScriptData | null}> = ({ scriptData }) => {
  if (!scriptData || !scriptData.parsed_data || !scriptData.parsed_data.scenes) {
    return <NoDataMessage />;
  }

  // Extract department notes from all scenes
  const allDepartments = new Set<string>();
  const departmentRequirements: Record<string, Set<string>> = {};
  
  scriptData.parsed_data.scenes.forEach(scene => {
    if (scene.department_notes) {
      Object.entries(scene.department_notes).forEach(([dept, requirements]) => {
        const departmentName = dept.toUpperCase();
        allDepartments.add(departmentName);
        
        if (!departmentRequirements[departmentName]) {
          departmentRequirements[departmentName] = new Set<string>();
        }
        
        // Add each requirement to the set
        if (Array.isArray(requirements)) {
          requirements.forEach(req => departmentRequirements[departmentName].add(req));
        }
      });
    }
  });
  
  const departments = Array.from(allDepartments);
  
  // Get color coding for departments if available
  const departmentColors = scriptData.ui_metadata?.color_coding?.department_colors || {};

  // Ensure validation exists and has the required properties
  const hasValidation = scriptData.validation && 
    scriptData.validation.validation_report && 
    scriptData.validation.validation_report.technical_validation &&
    scriptData.validation.validation_report.technical_validation.department_conflicts;

  return (
    <DataSection title="Department Analysis">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-studio-blue/50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Department Overview</h4>
          <div className="space-y-2">
            {departments.map(dept => {
              const colorStyle = departmentColors[dept] 
                ? { backgroundColor: `${departmentColors[dept]}20`, borderColor: departmentColors[dept] }
                : {};
                
              return (
                <div 
                  key={dept} 
                  className="border p-3 rounded-lg flex items-center justify-between"
                  style={colorStyle}
                >
                  <div className="font-medium">{dept}</div>
                  <div className="text-sm bg-studio-blue/40 px-2 py-0.5 rounded">
                    {departmentRequirements[dept] ? departmentRequirements[dept].size : 0} items
                  </div>
                </div>
              );
            })}
            
            {departments.length === 0 && (
              <div className="text-center text-studio-text-secondary p-4">
                No department information available
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-studio-blue/50 p-4 rounded-lg">
          <h4 className="font-medium mb-3">Department Conflicts</h4>
          {hasValidation ? (
            <div className="space-y-2">
              {scriptData.validation.validation_report.technical_validation.department_conflicts.map((conflict, index) => (
                <div key={index} className="bg-studio-warning/20 border border-studio-warning/30 p-3 rounded-lg">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-studio-warning mr-2 mt-0.5 flex-shrink-0" />
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
            </div>
          ) : (
            <div className="bg-studio-blue/20 border border-studio-blue/30 p-3 rounded-lg text-center">
              <p>Validation data not available</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <h4 className="font-medium mb-3">Department Requirements by Scene</h4>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {scriptData.validation?.validation_report?.technical_validation?.resource_requirements && (
            <div className="grid grid-cols-1 gap-4">
              {scriptData.parsed_data.scenes.map((scene, sceneIndex) => {
                // Get all resource requirements for this scene
                const sceneRequirements = scriptData.validation?.validation_report?.technical_validation?.resource_requirements?.filter(
                  req => req.scene_number === scene.scene_number
                );
                
                return sceneRequirements && sceneRequirements.length > 0 ? (
                  <div key={sceneIndex} className="bg-studio-blue/30 p-4 rounded-lg">
                    <h5 className="font-medium mb-3">Scene {scene.scene_number}: {scene.location?.place}</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {sceneRequirements.map((req, reqIndex) => {
                        const colorStyle = departmentColors[req.department.toUpperCase()] 
                          ? { backgroundColor: `${departmentColors[req.department.toUpperCase()]}20` }
                          : {};
                          
                        return (
                          <div key={reqIndex} className="p-3 rounded-lg" style={colorStyle}>
                            <h6 className="font-medium text-sm mb-1 capitalize">{req.department}</h6>
                            <ul className="list-disc list-inside text-xs text-studio-text-secondary space-y-1">
                              {req.requirements.map((item, itemIndex) => (
                                <li key={itemIndex}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          )}
          
          {(!scriptData.validation?.validation_report?.technical_validation?.resource_requirements || 
            scriptData.validation.validation_report.technical_validation.resource_requirements.length === 0) && (
            <div className="bg-studio-blue/20 p-4 rounded-lg text-center">
              <p className="text-studio-text-secondary">No detailed department requirements available</p>
            </div>
          )}
        </div>
      </div>
    </DataSection>
  );
};

const RawData: React.FC<{scriptData: ScriptData | null}> = ({ scriptData }) => {
  if (!scriptData) {
    return <NoDataMessage />;
  }

  // Extract key sections for better organization in the UI
  const sections = [
    { title: "Script Metadata", data: scriptData.metadata },
    { title: "Scenes", data: scriptData.parsed_data.scenes },
    { title: "Timeline", data: scriptData.parsed_data.timeline },
    { title: "Validation Results", data: scriptData.validation },
    { title: "Statistics", data: scriptData.statistics },
    { title: "UI Metadata", data: scriptData.ui_metadata }
  ];

  return (
    <DataSection title="Raw Data">
      <div className="space-y-4">
        <div className="bg-studio-blue/50 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-medium mb-3">Script Data Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-studio-blue/30 p-3 rounded">
              <div className="text-sm text-studio-text-secondary">Total Scenes</div>
              <div className="text-lg font-medium">{scriptData.statistics?.total_scenes || scriptData.parsed_data.scenes.length}</div>
            </div>
            <div className="bg-studio-blue/30 p-3 rounded">
              <div className="text-sm text-studio-text-secondary">Validation Status</div>
              <div className={`text-lg font-medium ${scriptData.validation?.is_valid ? "text-studio-success" : "text-studio-warning"}`}>
                {scriptData.validation?.is_valid ? "Valid" : "Invalid"}
              </div>
            </div>
            <div className="bg-studio-blue/30 p-3 rounded">
              <div className="text-sm text-studio-text-secondary">Analysis Date</div>
              <div className="text-lg font-medium">{scriptData.metadata?.timestamp || "Unknown"}</div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <div key={index} className="bg-studio-dark-blue rounded-md">
              <div className="p-3 border-b border-studio-border">
                <h4 className="font-medium text-studio-accent">{section.title}</h4>
              </div>
              <div className="p-4 overflow-x-auto max-h-64 scrollbar-thin scrollbar-thumb-studio-border scrollbar-track-studio-dark-blue">
                <pre className="whitespace-pre-wrap text-sm text-studio-text-secondary">
                  {JSON.stringify(section.data, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DataSection>
  );
};

const ScriptAnalysisTab: React.FC = () => {
  const [activeSubtab, setActiveSubtab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use unknown type assertion to handle different ScriptData interfaces
  const context = useScriptData();
  const scriptData = context.scriptData as unknown as ScriptData | null;
  const updateScriptData = context.updateScriptData as (data: unknown) => void;

  const subtabs = [
    { icon: History, label: 'Timeline' },
    { icon: FileSearch, label: 'Scene Analysis' },
    { icon: BarChart2, label: 'Technical Requirements' },
    { icon: Users, label: 'Department Analysis' },
    { icon: Database, label: 'Raw Data' }
  ];

  useEffect(() => {
    const loadScriptData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if we have script data in context
        if (!scriptData) {
          // Try to load from storage if not in context
          const data = getScriptData() as unknown as ScriptData | null;
          
          if (!data) {
            setError('No script data found. Please upload a script first.');
          } else if (updateScriptData) {
            // Update the context with the data from localStorage
            updateScriptData(data);
          }
        }
      } catch (err) {
        setError('Failed to load script data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadScriptData();
  }, [scriptData, updateScriptData]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingMessage />;
    }

    if (error) {
      return <ErrorMessage message={error} />;
    }

    if (!scriptData) {
      return <NoDataMessage />;
    }
    
    const components = {
      0: () => <TimelineAnalysis scriptData={scriptData} />,
      1: () => <SceneAnalysis scriptData={scriptData} />,
      2: () => <TechnicalRequirements scriptData={scriptData} />,
      3: () => <DepartmentAnalysis scriptData={scriptData} />,
      4: () => <RawData scriptData={scriptData} />
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
              onClick={() => setActiveSubtab(index)}
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
