import React, { useState, useEffect } from 'react';
import { 
  Calendar, List, MapPin, Users, Calendar as CalendarIcon, 
  FileText, ChartGantt, FilePieChart, Database, ChevronLeft, ChevronRight,
  Wrench, Clock, Briefcase
} from 'lucide-react';
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

interface ScheduleParams {
  script_results: {
    validation: {
      validation_report: {
        technical_validation: {
          department_conflicts: any[];
        };
      };
    };
    characters: Record<string, unknown>;
  };
  character_results: {
    relationships: Record<string, unknown>;
  };
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
  breaks?: Array<{
    type: string;
    start_time: string;
    end_time: string;
  }>;
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
  requirements: string[];
}

interface LocationPlan {
  locations: Location[];
  location_groups: Array<{
    group_id: string;
    locations: string[];
    reason: string;
  }>;
  weather_dependencies: Record<string, {
    preferred_conditions: string[];
    avoid_conditions: string[];
    seasonal_notes: string[];
  }>;
}

interface CrewMember {
  crew_member: string;
  role: string;
  assigned_scenes: string[];
  work_hours: number;
  turnaround_hours: number;
  meal_break_interval: number;
  equipment_assigned: string[];
}

interface Equipment {
  equipment_id: string;
  type: string;
  assigned_scenes: string[];
  setup_time_minutes: number;
  assigned_crew: string[];
}

interface CrewAllocation {
  crew_assignments: CrewMember[];
  equipment_assignments: Equipment[];
  department_schedules: Record<string, {
    crew: string[];
    equipment: string[];
    notes: string[];
  }>;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  resourceId: string;
  color: string;
  textColor: string;
  description: string;
  location: string;
  crew: string[];
  equipment: string[];
}

interface GanttTask {
  id: string;
  text: string;
  start_date: string;
  end_date: string;
  progress: number;
  parent: string;
  dependencies: string[];
  resource_ids: string[];
  type: string;
  color: string;
}

interface TimelineEvent {
  title: string;
  time: string;
  description: string;
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

  // Define all available subtabs
  const subtabs = [
    { icon: Calendar, label: "Calendar View" },
    { icon: List, label: "Schedule List" },
    { icon: MapPin, label: "Location Plan" },
    { icon: Users, label: "Crew Allocation" },
    { icon: Wrench, label: "Equipment" },
    { icon: ChartGantt, label: "Gantt Chart" }
  ];

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

  const renderCalendarView = () => {
    return (
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
    );
  };

  const renderScheduleList = () => {
    return (
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
    );
  };

  const renderLocationPlan = () => {
    if (!scheduleData?.location_plan) return null;
    
    return (
      <div className="p-6 space-y-6">
        {/* Locations */}
        <div className="studio-section">
          <h3 className="text-xl font-medium mb-4">Locations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduleData.location_plan.locations.map((location) => (
              <div key={location.id} className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-lg">{location.name}</h4>
                  <span className="px-2 py-1 bg-studio-blue/30 rounded text-xs">ID: {location.id}</span>
                </div>

                <div className="space-y-3">
                  {/* Basic Info */}
                  <div>
                    <p className="text-sm"><span className="text-studio-text-secondary">Address:</span> {location.address}</p>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <p className="text-sm"><span className="text-studio-text-secondary">Setup:</span> {location.setup_time_minutes}min</p>
                      <p className="text-sm"><span className="text-studio-text-secondary">Wrap:</span> {location.wrap_time_minutes}min</p>
                    </div>
                  </div>

                  {/* Scenes */}
                  <div>
                    <p className="text-sm font-medium text-studio-text-secondary mb-1">Scenes:</p>
                    <div className="flex flex-wrap gap-1">
                      {location.scenes.map((scene, i) => (
                        <span key={i} className="bg-studio-accent/20 px-2 py-0.5 rounded text-xs">
                          Scene {scene}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Requirements */}
                  <div>
                    <p className="text-sm font-medium text-studio-text-secondary mb-1">Requirements:</p>
                    <div className="flex flex-wrap gap-1">
                      {location.requirements.map((req, i) => (
                        <span key={i} className="bg-studio-blue/30 px-2 py-0.5 rounded text-xs">
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Weather Dependencies */}
                  {scheduleData.location_plan.weather_dependencies[location.id] && (
                    <div className="border-t border-studio-border pt-3 mt-3">
                      <p className="text-sm font-medium text-studio-text-secondary mb-2">Weather Conditions:</p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-studio-text-secondary mb-1">Preferred:</p>
                          <div className="flex flex-wrap gap-1">
                            {scheduleData.location_plan.weather_dependencies[location.id].preferred_conditions.map((condition, i) => (
                              <span key={i} className="bg-studio-success/20 px-2 py-0.5 rounded text-xs">
                                {condition}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-studio-text-secondary mb-1">Avoid:</p>
                          <div className="flex flex-wrap gap-1">
                            {scheduleData.location_plan.weather_dependencies[location.id].avoid_conditions.map((condition, i) => (
                              <span key={i} className="bg-studio-warning/20 px-2 py-0.5 rounded text-xs">
                                {condition}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Location Groups */}
        <div className="studio-section">
          <h3 className="text-xl font-medium mb-4">Location Groups & Dependencies</h3>
          <div className="space-y-4">
            {scheduleData.location_plan.location_groups.map((group) => (
              <div key={group.group_id} className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">Group {group.group_id}</h4>
                  <span className="px-2 py-1 bg-studio-blue/30 rounded text-xs">
                    {group.locations.length} locations
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-studio-text-secondary mb-1">Grouping Reason:</p>
                    <p className="text-sm bg-studio-blue/30 p-2 rounded">{group.reason}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-studio-text-secondary mb-1">Locations in Group:</p>
                    <div className="flex flex-wrap gap-2">
                      {group.locations.map((locId) => {
                        const location = scheduleData.location_plan.locations.find(l => l.id === locId);
                        return (
                          <span key={locId} className="bg-studio-accent/20 px-2 py-1 rounded text-sm flex items-center">
                            <span className="text-xs text-studio-text-secondary mr-1">{locId}:</span>
                            {location?.name || locId}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seasonal Notes */}
        <div className="studio-section">
          <h3 className="text-xl font-medium mb-4">Seasonal Considerations</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(scheduleData.location_plan.weather_dependencies).map(([locId, weather]) => (
              weather.seasonal_notes.length > 0 && (
                <div key={locId} className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">
                      {scheduleData.location_plan.locations.find(l => l.id === locId)?.name || locId}
                    </h4>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-studio-text-secondary mb-2">Seasonal Notes:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {weather.seasonal_notes.map((note, i) => (
                        <li key={i} className="text-sm text-studio-text-primary">
                          {note}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderCrewAllocation = () => {
    if (!scheduleData?.crew_allocation) return null;

    return (
      <div className="p-6 space-y-6">
        {/* Crew Assignments */}
        <div className="studio-section">
          <h3 className="text-xl font-medium mb-4">Crew Assignments</h3>
          <div className="space-y-4">
            {scheduleData.crew_allocation.crew_assignments.map((crew) => (
              <div key={crew.crew_member} className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium">{crew.crew_member}</h4>
                    <p className="text-sm text-studio-text-secondary">{crew.role}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p>{crew.work_hours}hr shift</p>
                    <p className="text-studio-text-secondary">{crew.turnaround_hours}hr turnaround</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-studio-text-secondary mb-1">Assigned Scenes:</p>
                    <div className="flex flex-wrap gap-1">
                      {crew.assigned_scenes.map((scene, i) => (
                        <span key={i} className="bg-studio-blue/30 px-2 py-0.5 rounded text-xs">
                          Scene {scene}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-studio-text-secondary mb-1">Equipment:</p>
                    <div className="flex flex-wrap gap-1">
                      {crew.equipment_assigned.map((equipment, i) => (
                        <span key={i} className="bg-studio-blue/30 px-2 py-0.5 rounded text-xs">
                          {equipment}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Schedules */}
        <div className="studio-section">
          <h3 className="text-xl font-medium mb-4">Department Schedules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(scheduleData.crew_allocation.department_schedules).map(([dept, info]) => (
              <div key={dept} className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                <h4 className="font-medium mb-2">{dept}</h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-studio-text-secondary mb-1">Crew:</p>
                    <div className="flex flex-wrap gap-1">
                      {info.crew.map((member, i) => (
                        <span key={i} className="bg-studio-blue/30 px-2 py-0.5 rounded text-xs">
                          {member}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-studio-text-secondary mb-1">Equipment:</p>
                    <div className="flex flex-wrap gap-1">
                      {info.equipment.map((item, i) => (
                        <span key={i} className="bg-studio-blue/30 px-2 py-0.5 rounded text-xs">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  {info.notes.length > 0 && (
                    <div>
                      <p className="text-sm text-studio-text-secondary mb-1">Notes:</p>
                      <ul className="list-disc list-inside text-xs">
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
        </div>
      </div>
    );
  };

  const renderEquipment = () => {
    if (!scheduleData?.crew_allocation?.equipment_assignments) return null;

    return (
      <div className="p-6">
        <div className="studio-section">
          <h3 className="text-xl font-medium mb-4">Equipment Assignments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduleData.crew_allocation.equipment_assignments.map((equipment) => (
              <div key={equipment.equipment_id} className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                <h4 className="font-medium mb-2">{equipment.equipment_id}</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-studio-text-secondary">Type:</span> {equipment.type}
                  </p>
                  <p className="text-sm">
                    <span className="text-studio-text-secondary">Setup Time:</span> {equipment.setup_time_minutes} minutes
                  </p>
                  <div>
                    <p className="text-sm text-studio-text-secondary mb-1">Assigned Scenes:</p>
                    <div className="flex flex-wrap gap-1">
                      {equipment.assigned_scenes.map((scene, i) => (
                        <span key={i} className="bg-studio-blue/30 px-2 py-0.5 rounded text-xs">
                          Scene {scene}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-studio-text-secondary mb-1">Assigned Crew:</p>
                    <div className="flex flex-wrap gap-1">
                      {equipment.assigned_crew.map((crew, i) => (
                        <span key={i} className="bg-studio-blue/30 px-2 py-0.5 rounded text-xs">
                          {crew}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderGanttChart = () => {
    if (!scheduleData?.gantt_data) return null;

    return (
      <div className="p-6">
        <div className="studio-section">
          <h3 className="text-xl font-medium mb-4">Production Timeline</h3>
          <div className="space-y-4">
            {scheduleData.gantt_data.tasks.map((task: GanttTask) => (
              <div 
                key={task.id} 
                className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg"
                style={{ borderLeft: `4px solid ${task.color}` }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{task.text}</h4>
                  <span className="text-sm text-studio-text-secondary">
                    {format(new Date(task.start_date), 'MMM d, HH:mm')} - 
                    {format(new Date(task.end_date), 'HH:mm')}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  {task.parent && (
                    <p><span className="text-studio-text-secondary">Parent Task:</span> {task.parent}</p>
                  )}
                  {task.dependencies.length > 0 && (
                    <div>
                      <p className="text-studio-text-secondary mb-1">Dependencies:</p>
                      <div className="flex flex-wrap gap-1">
                        {task.dependencies.map((dep, i) => (
                          <span key={i} className="bg-studio-blue/30 px-2 py-0.5 rounded text-xs">
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="w-full bg-studio-blue/30 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-studio-accent h-full rounded-full"
                      style={{ width: `${task.progress * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-studio-border p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-studio-text-primary">
            Production Schedule
          </h2>
          {scheduleData && (
            <button 
              onClick={handleGenerateSchedule}
              disabled={loading}
              className="px-4 py-2 bg-studio-accent text-white rounded-md hover:bg-studio-accent-dark disabled:opacity-50"
            >
              {loading ? 'Regenerating...' : 'Regenerate Schedule'}
            </button>
          )}
        </div>
        
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
        {!scheduleData ? (
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
        ) : (
          <>
            {activeSubtab === 0 && renderCalendarView()}
            {activeSubtab === 1 && renderScheduleList()}
            {activeSubtab === 2 && renderLocationPlan()}
            {activeSubtab === 3 && renderCrewAllocation()}
            {activeSubtab === 4 && renderEquipment()}
            {activeSubtab === 5 && renderGanttChart()}
          </>
        )}
      </div>
    </div>
  );
};

export default ScheduleTab;
