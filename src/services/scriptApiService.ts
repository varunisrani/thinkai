
import { toast } from "sonner";

// Base API URL
const API_BASE_URL = "https://varun324242-sjuu.hf.space";

// API response types based on the provided data structures
export interface ScriptData {
  metadata: {
    global_requirements: {
      equipment: string[];
      props: string[];
      special_effects: string[];
    };
    scene_metadata: Array<{
      scene_number: number;
      lighting: {
        type: string;
        requirements: string[];
      };
      props: Record<string, string[]>;
      technical: Record<string, string[]>;
      department_notes: Record<string, string[]>;
    }>;
  };
  parsed_data: {
    scenes: Array<{
      scene_number: number;
      scene_id: string;
      location: {
        place: string;
      };
      description: string;
      technical_cues: string[];
      department_notes: Record<string, string[]>;
      main_characters: string[];
      complexity_score: number;
    }>;
    timeline: {
      total_duration: string;
      average_scene_duration: number;
      total_pages: number;
      scene_breakdown: Array<{
        scene_number: number;
        start_time: string;
        end_time: string;
        location: string;
        characters: string[];
        technical_complexity: number;
        setup_time: number;
      }>;
    };
  };
  validation: {
    validation_report: {
      technical_validation: {
        department_conflicts: Array<{
          scene_number: number;
          conflict: string;
        }>;
      };
    };
  };
}

export interface OneLinerData {
  scenes: Array<{
    scene_number: number;
    scene_id: string;
    one_liner: string;
  }>;
  overall_summary: string;
}

export interface CharacterData {
  characters: {
    [character_name: string]: {
      objectives: {
        main_objective: string;
        scene_objectives: Array<{
          scene: number;
          objective: string;
          obstacles: string[];
          outcome: string;
        }>;
      };
      dialogue_analysis: {
        total_lines: number;
        total_words: number;
        average_line_length: number;
        vocabulary_complexity: number;
      };
      emotional_range: {
        primary_emotion: string;
        emotional_spectrum: string[];
      };
      scene_presence: string[];
      props: {
        base: string[];
      };
    };
  };
  relationships: {
    [relationship_key: string]: {
      type: string;
      dynamics: string[];
      evolution: Array<{
        scene: number;
        dynamic_change: string;
        trigger: string;
      }>;
    };
  };
  scene_matrix: {
    [scene_id: string]: {
      present_characters: string[];
      emotional_atmosphere: string;
      key_developments: string[];
      interactions: Array<{
        characters: string[];
        type: string;
        significance: number;
      }>;
    };
  };
  statistics: {
    scene_stats: {
      total_scenes: number;
      average_characters_per_scene: number;
      total_interactions: number;
    };
    dialogue_stats: Record<string, {
      total_lines: number;
      total_words: number;
      average_line_length: number;
      vocabulary_complexity: number;
    }>;
    emotional_stats: Record<string, {
      primary_emotion: string;
      emotional_variety: number;
      average_intensity: number;
    }>;
    technical_stats: {
      costume_changes: Record<string, {
        total_changes: number;
        unique_costumes: number;
      }>;
      prop_usage: Record<string, {
        total_props: number;
        unique_props: number;
      }>;
      makeup_changes: Record<string, {
        total_changes: number;
        unique_looks: number;
      }>;
    };
  };
}

export interface ScheduleData {
  schedule: Array<{
    day: number;
    date: string;
    scenes: Array<{
      scene_id: string;
      location_id: string;
      start_time: string;
      end_time: string;
      setup_time: string;
      wrap_time: string;
      duration_minutes: number;
      crew_ids: string[];
      equipment_ids: string[];
      breaks: Array<{
        type: string;
      }>;
    }>;
  }>;
  location_plan: {
    locations: Array<{
      id: string;
      name: string;
      address: string;
      scenes: string[];
      setup_time_minutes: number;
      wrap_time_minutes: number;
      requirements: string[];
    }>;
    weather_dependencies: Record<string, {
      preferred_conditions: string[];
      avoid_conditions: string[];
      seasonal_notes: string[];
    }>;
    daylight_requirements: Record<string, {
      needs_daylight: boolean;
      golden_hour: boolean;
      time_window: {
        start: string;
        end: string;
      };
    }>;
    location_groups: Array<{
      group_id: string;
      locations: string[];
      reason: string;
    }>;
    shooting_sequence: string[];
    optimization_notes: string[];
  };
  crew_allocation: {
    crew_assignments: Array<{
      crew_member: string;
      role: string;
      assigned_scenes: string[];
      work_hours: string;
      turnaround_hours: number;
      meal_break_interval: number;
      equipment_assigned: string[];
    }>;
    equipment_assignments: Array<{
      equipment_id: string;
      type: string;
      setup_time_minutes: number;
      assigned_scenes: string[];
      assigned_crew: string[];
    }>;
    department_schedules: Record<string, {
      crew: string[];
      equipment: string[];
      notes: string[];
    }>;
  };
  gantt_data: {
    tasks: Array<{
      id: string;
      text: string;
      start_date: string;
      end_date: string;
      type: string;
      dependencies: string[];
    }>;
    resources: Array<{
      id: string;
      name: string;
      type: string;
      calendar_id: string;
    }>;
  };
  summary: {
    total_days: number;
    total_scenes: number;
    total_pages: number;
    start_date: string;
    end_date: string;
    total_runtime_minutes: number;
  };
  optimization_notes: string[];
}

export interface StoryboardData {
  scenes: Array<{
    scene_id: string;
    description: string;
    prompt: string;
    enhanced_prompt: string;
    image_url: string;
    image_path: string;
    technical_params: {
      shot_type: string;
      camera_angle: string;
      mood: string;
    };
  }>;
}

// Common fetch wrapper with error handling
async function fetchFromAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    toast.error(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

// Local storage keys
const STORAGE_KEYS = {
  SCRIPT_DATA: 'script_data',
  ONE_LINER_DATA: 'one_liner_data',
  CHARACTER_DATA: 'character_data',
  SCHEDULE_DATA: 'schedule_data',
  STORYBOARD_DATA: 'storyboard_data',
};

// Script processing APIs
export async function uploadScriptFile(file: File): Promise<ScriptData | null> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/upload_script`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API Error: ${response.status}`);
    }
    
    const data = await response.json() as ScriptData;
    
    // Store in localStorage
    localStorage.setItem(STORAGE_KEYS.SCRIPT_DATA, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Error uploading script:', error);
    toast.error(`Upload Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

export async function analyzeScriptText(scriptText: string): Promise<ScriptData | null> {
  try {
    const data = await fetchFromAPI<ScriptData>('/analyze_script', {
      method: 'POST',
      body: JSON.stringify({ script: scriptText }),
    });
    
    if (data) {
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.SCRIPT_DATA, JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    console.error('Error analyzing script text:', error);
    return null;
  }
}

// One-liner API
export async function generateOneLiner(): Promise<OneLinerData | null> {
  // First check if we have script data in local storage
  const scriptData = localStorage.getItem(STORAGE_KEYS.SCRIPT_DATA);
  if (!scriptData) {
    toast.error('No script data available. Please upload a script first.');
    return null;
  }

  try {
    const data = await fetchFromAPI<OneLinerData>('/generate_one_liner', {
      method: 'POST',
      body: scriptData,
    });
    
    if (data) {
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.ONE_LINER_DATA, JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    console.error('Error generating one-liner:', error);
    return null;
  }
}

// Character breakdown API
export async function analyzeCharacters(): Promise<CharacterData | null> {
  // First check if we have script data in local storage
  const scriptData = localStorage.getItem(STORAGE_KEYS.SCRIPT_DATA);
  if (!scriptData) {
    toast.error('No script data available. Please upload a script first.');
    return null;
  }

  try {
    const data = await fetchFromAPI<CharacterData>('/analyze_characters', {
      method: 'POST',
      body: scriptData,
    });
    
    if (data) {
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.CHARACTER_DATA, JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    console.error('Error analyzing characters:', error);
    return null;
  }
}

// Schedule API
export async function createSchedule(startDate: string): Promise<ScheduleData | null> {
  // First check if we have script and character data in local storage
  const scriptData = localStorage.getItem(STORAGE_KEYS.SCRIPT_DATA);
  const characterData = localStorage.getItem(STORAGE_KEYS.CHARACTER_DATA);
  
  if (!scriptData || !characterData) {
    toast.error('Script and character data required. Please complete those steps first.');
    return null;
  }

  try {
    const requestData = {
      script_data: JSON.parse(scriptData),
      character_data: JSON.parse(characterData),
      start_date: startDate,
    };

    const data = await fetchFromAPI<ScheduleData>('/create_schedule', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    
    if (data) {
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.SCHEDULE_DATA, JSON.stringify(data));
    }
    
    return data;
  } catch (error) {
    console.error('Error creating schedule:', error);
    return null;
  }
}

// Storyboard API
export async function generateStoryboard(
  sceneId: string,
  sceneDescription: string,
  shotType: string = 'MS',
  cameraAngle: string = 'eye_level',
  mood: string = 'neutral'
): Promise<StoryboardData | null> {
  try {
    const requestData = {
      scene_id: sceneId,
      scene_description: sceneDescription,
      technical_params: {
        shot_type: shotType,
        camera_angle: cameraAngle,
        mood: mood
      }
    };

    const data = await fetchFromAPI<StoryboardData>('/generate_storyboard', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    
    if (data) {
      // Get existing storyboard data or initialize empty
      const existingData = localStorage.getItem(STORAGE_KEYS.STORYBOARD_DATA);
      let updatedData: StoryboardData;
      
      if (existingData) {
        const parsedData = JSON.parse(existingData) as StoryboardData;
        // Check if scene already exists and update or add
        const sceneIndex = parsedData.scenes.findIndex(s => s.scene_id === sceneId);
        if (sceneIndex >= 0) {
          parsedData.scenes[sceneIndex] = data.scenes[0];
          updatedData = parsedData;
        } else {
          updatedData = {
            scenes: [...parsedData.scenes, ...data.scenes]
          };
        }
      } else {
        updatedData = data;
      }
      
      // Store updated data in localStorage
      localStorage.setItem(STORAGE_KEYS.STORYBOARD_DATA, JSON.stringify(updatedData));
      return updatedData;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating storyboard:', error);
    return null;
  }
}

// Utility functions to get data from localStorage
export function getScriptData(): ScriptData | null {
  const data = localStorage.getItem(STORAGE_KEYS.SCRIPT_DATA);
  return data ? JSON.parse(data) : null;
}

export function getOneLinerData(): OneLinerData | null {
  const data = localStorage.getItem(STORAGE_KEYS.ONE_LINER_DATA);
  return data ? JSON.parse(data) : null;
}

export function getCharacterData(): CharacterData | null {
  const data = localStorage.getItem(STORAGE_KEYS.CHARACTER_DATA);
  return data ? JSON.parse(data) : null;
}

export function getScheduleData(): ScheduleData | null {
  const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE_DATA);
  return data ? JSON.parse(data) : null;
}

export function getStoryboardData(): StoryboardData | null {
  const data = localStorage.getItem(STORAGE_KEYS.STORYBOARD_DATA);
  return data ? JSON.parse(data) : null;
}

// Function to clear all data from localStorage
export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.SCRIPT_DATA);
  localStorage.removeItem(STORAGE_KEYS.ONE_LINER_DATA);
  localStorage.removeItem(STORAGE_KEYS.CHARACTER_DATA);
  localStorage.removeItem(STORAGE_KEYS.SCHEDULE_DATA);
  localStorage.removeItem(STORAGE_KEYS.STORYBOARD_DATA);
  toast.success('All script data cleared successfully');
}
