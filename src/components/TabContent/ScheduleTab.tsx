import React, { useState, useEffect } from 'react';
import { 
  Calendar, List, MapPin, Users, Calendar as CalendarIcon, 
  FileText, ChartGantt, FilePieChart, Database, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Tool } from '@/lib/icon-exports';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useScriptData } from '@/hooks/useScriptData';
import { saveToStorage, loadFromStorage } from '@/utils/storage';
import { ScriptData, CharacterData, ScheduleData } from '@/services/scriptApiService';
import { toast } from 'sonner';

// Debug logging helper
const logDebug = (message: string, data?: unknown) => {
  console.log(`[ScheduleTab] ${message}`, data || '');
};

// API endpoint
const API_URL = 'https://varun324242-sjuu.hf.space/api';

interface SubtabProps {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

// Define proper TypeScript interfaces for the data
interface Scene {
  scene_id: string;
  location_id: string;
  start_time: string;
  end_time: string;
  setup_time: string;
  wrap_time: string;
  crew_ids?: string[];
  equipment_ids?: string[];
}

interface ScheduleDay {
  day: number;
  date: string;
  scenes: Scene[];
}

interface Location {
  id: string;
  name: string;
  address: string;
  scenes: string[];
  setup_time_minutes: number;
  wrap_time_minutes: number;
}

interface LocationPlan {
  locations: Location[];
}

interface ScheduleParams {
  script_results: ScriptData;
  character_results: CharacterData;
  start_date: string;
  location_constraints: {
    preferred_locations: string[];
    avoid_weather: string[];
  };
  schedule_constraints: {
    max_hours_per_day: number;
    meal_break_duration: number;
    company_moves_per_day: number;
  };
}

const Subtab: React.FC<SubtabProps> = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center px-4 py-2 rounded-md mr-3 transition-colors whitespace-nowrap',
      active ? 'tab-active' : 'tab-inactive'
    )}
  >
    <Icon className="h-4 w-4 mr-2" />
    {label}
  </button>
);

const ScheduleTab: React.FC = () => {
  const { scriptData, characterData, scheduleData, updateScheduleData } = useScriptData();
  const [activeSubtab, setActiveSubtab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage on initial mount
  useEffect(() => {
    logDebug('Component mounted');
    logDebug('Initial state:', {
      hasScriptData: !!scriptData,
      hasCharacterData: !!characterData,
      hasScheduleData: !!scheduleData,
      activeSubtab,
      loading
    });

    // If there's no schedule data in context, try to load from localStorage
    if (!scheduleData) {
      try {
        const storedScheduleData = loadFromStorage<ScheduleData>('SCHEDULE_DATA');
        logDebug('Trying to load schedule data from localStorage', storedScheduleData ? 'Found data' : 'No data found');
        
        if (storedScheduleData) {
          updateScheduleData(storedScheduleData);
          logDebug('Successfully loaded schedule data from localStorage');
        }
      } catch (err) {
        logDebug('Error loading schedule data from localStorage:', err);
        console.error('Failed to load schedule data from localStorage:', err);
      }
    }
  }, [scheduleData, updateScheduleData]);

  // Log data changes
  useEffect(() => {
    logDebug('Schedule data updated:', scheduleData);
  }, [scheduleData]);

  // Log subtab changes
  useEffect(() => {
    logDebug('Active subtab changed:', {
      index: activeSubtab,
      label: activeSubtab === 0 ? 'Calendar View' : 
             activeSubtab === 1 ? 'Schedule List' : 'Location Plan'
    });
  }, [activeSubtab]);

  const handleGenerateSchedule = async () => {
    if (!scriptData || !characterData) {
      logDebug('Generate schedule failed - Missing required data', {
        hasScriptData: !!scriptData,
        hasCharacterData: !!characterData
      });
      toast.error('Please complete script analysis and character breakdown first');
      return;
    }

    logDebug('Starting schedule generation...');
    setLoading(true);
    setError(null);

    try {
      const params: ScheduleParams = {
        script_results: {
          ...scriptData,
          validation: {
            validation_report: {
              technical_validation: {
                department_conflicts: []
              }
            }
          },
          characters: {}
        },
        character_results: {
          ...characterData,
          relationships: {}
        },
        start_date: format(new Date(), 'yyyy-MM-dd'),
        location_constraints: {
          preferred_locations: [],
          avoid_weather: ["Rain", "Snow", "High Winds"]
        },
        schedule_constraints: {
          max_hours_per_day: 12,
          meal_break_duration: 60,
          company_moves_per_day: 2
        }
      };

      logDebug('Making API request with params:', params);

      // First try the API
      try {
        const response = await fetch(`${API_URL}/schedule`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });

        logDebug('API response received:', {
          status: response.status,
          ok: response.ok,
          contentType: response.headers.get('content-type')
        });

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error('API returned non-JSON response');
        }

        const result = await response.json();
        logDebug('API result:', result);

        if (!result.success) {
          throw new Error(result.error || 'Unknown API error');
        }

        // Make sure data is saved to localStorage properly
        logDebug('Saving schedule data to localStorage and context');
        saveToStorage('SCHEDULE_DATA', result.data);
        updateScheduleData(result.data);
        toast.success('Schedule generated successfully!');

      } catch (apiError) {
        logDebug('API call failed:', apiError);
        // Try loading from storage as fallback
        const storedData = loadFromStorage<ScheduleData>('SCHEDULE_DATA');
        if (storedData) {
          logDebug('Found backup data in localStorage');
          updateScheduleData(storedData);
          toast.success('Loaded schedule from local storage');
        } else {
          logDebug('No backup data found in localStorage');
          throw new Error('Failed to generate or load schedule');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate schedule';
      logDebug('Error during schedule generation:', err);
      console.error('Schedule generation error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
      logDebug('Schedule generation completed');
    }
  };

  // Log render state
  logDebug('Rendering with state:', {
    hasScriptData: !!scriptData,
    hasCharacterData: !!characterData,
    hasScheduleData: !!scheduleData,
    activeSubtab,
    loading,
    error
  });

  if (!scriptData || !characterData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-4">Please complete script analysis and character breakdown first</h3>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-studio-blue text-white rounded-md hover:bg-studio-blue-dark"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!scheduleData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-6">Generate Production Schedule</h3>
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <button
            onClick={handleGenerateSchedule}
            disabled={loading}
            className="w-full max-w-md py-3 bg-studio-accent text-white rounded-md hover:bg-studio-accent-dark font-medium disabled:opacity-50"
          >
            {loading ? 'Generating Schedule...' : 'Generate Schedule'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-studio-border p-4">
        <h2 className="text-2xl font-semibold mb-4 text-studio-text-primary">
          Production Schedule
        </h2>
        
        <div className="flex overflow-x-auto pb-2">
          <Subtab
            active={activeSubtab === 0}
            icon={Calendar}
            label="Calendar View"
            onClick={() => setActiveSubtab(0)}
          />
          <Subtab
            active={activeSubtab === 1}
            icon={List}
            label="Schedule List"
            onClick={() => setActiveSubtab(1)}
          />
          <Subtab
            active={activeSubtab === 2}
            icon={MapPin}
            label="Location Plan"
            onClick={() => setActiveSubtab(2)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {/* Calendar View */}
        {activeSubtab === 0 && (
          <div className="animate-fade-in">
            <div className="p-6">
              <div className="mb-4 flex justify-between items-center">
                <button 
                  onClick={handleGenerateSchedule}
                  disabled={loading}
                  className="px-4 py-2 bg-studio-accent text-white rounded-md hover:bg-studio-accent-dark disabled:opacity-50"
                >
                  {loading ? 'Regenerating...' : 'Regenerate Schedule'}
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              {scheduleData.schedule?.map((day, index) => (
                <div key={index} className="mb-4">
                  <div className="studio-section">
                    <h3 className="text-xl font-medium mb-4">
                      Day {index + 1} - {format(new Date(day.date), 'MMMM d, yyyy')}
                    </h3>

                    <div className="space-y-4">
                      {day.scenes.map((scene, sceneIndex) => (
                        <div 
                          key={sceneIndex}
                          className="p-4 bg-studio-blue/30 border border-studio-border rounded-lg"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-2 text-studio-accent" />
                              <span className="font-medium">Scene {scene.scene_id}</span>
                            </div>
                            <span className="text-sm text-studio-text-secondary">
                              {scene.start_time} - {scene.end_time}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-studio-text-secondary">Location:</p>
                              <p>{scene.location_id}</p>
                            </div>
                            <div>
                              <p className="text-studio-text-secondary">Duration:</p>
                              <p>{scene.duration_minutes} minutes</p>
                            </div>
                            <div>
                              <p className="text-studio-text-secondary">Equipment:</p>
                              <p>{scene.equipment_ids.join(', ')}</p>
                            </div>
                          </div>

                          {scene.crew_ids && scene.crew_ids.length > 0 && (
                            <div className="mt-2">
                              <p className="text-studio-text-secondary mb-1">Crew:</p>
                              <div className="flex flex-wrap gap-2">
                                {scene.crew_ids.map((crew, i) => (
                                  <span 
                                    key={i}
                                    className="px-2 py-1 bg-studio-blue/20 rounded-md text-sm"
                                  >
                                    {crew}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {scene.breaks && scene.breaks.length > 0 && (
                            <div className="mt-2">
                              <p className="text-studio-text-secondary mb-1">Breaks:</p>
                              <div className="flex flex-wrap gap-2">
                                {scene.breaks.map((breakItem, i) => (
                                  <span 
                                    key={i}
                                    className="px-2 py-1 bg-studio-blue/20 rounded-md text-sm"
                                  >
                                    {breakItem.type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Schedule List */}
        {activeSubtab === 1 && (
          <div className="p-6 animate-fade-in">
            <div className="studio-section">
              <h3 className="text-xl font-medium mb-4">Schedule List</h3>
              <div className="space-y-4">
                {scheduleData.schedule?.map((day, index) => (
                  <div key={index} className="p-4 bg-studio-blue/40 border border-studio-border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-2 text-studio-accent" />
                        <span className="font-medium">Day {index + 1} ({format(new Date(day.date), 'MMMM d, yyyy')})</span>
                      </div>
                      <span className="text-sm text-studio-text-secondary">8:00 AM - 6:00 PM</span>
                    </div>
                    <div className="space-y-2">
                      {day.scenes.map((scene, sceneIndex) => (
                        <div key={sceneIndex} className="p-2 bg-studio-blue/30 rounded flex justify-between">
                          <div>
                            <span className="text-studio-accent">Scene {scene.scene_id}</span>
                            <span className="mx-2 text-studio-text-secondary">|</span>
                            <span>{scene.location_id}</span>
                          </div>
                          <span className="text-sm text-studio-text-secondary">
                            {scene.start_time} - {scene.end_time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Location Plan */}
        {activeSubtab === 2 && (
          <div className="p-6 animate-fade-in">
            <div className="studio-section">
              <h3 className="text-xl font-medium mb-4">Location Plan</h3>
              {scheduleData.crew_allocation?.department_schedules ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(scheduleData.crew_allocation.department_schedules).map(([dept, info], index) => (
                    <div key={index} className="p-4 bg-studio-blue/40 border border-studio-border rounded-lg">
                      <h4 className="text-lg font-medium mb-2">{dept}</h4>
                      <div className="space-y-2">
                        <p><strong>Crew:</strong> {info.crew.join(', ')}</p>
                        <p><strong>Equipment:</strong> {info.equipment.join(', ')}</p>
                        {info.notes.length > 0 && (
                          <div>
                            <strong>Notes:</strong>
                            <ul className="list-disc list-inside">
                              {info.notes.map((note, i) => (
                                <li key={i}>{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-studio-text-secondary">No department schedule data available.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleTab;
