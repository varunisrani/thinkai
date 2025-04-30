import { toast } from "sonner";
import {
  getFromLocalStorage,
  saveToLocalStorage,
  STORAGE_KEYS
} from "./storageService";

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
    
    // Check for the API response structure
    if (data && typeof data === 'object') {
      // If response has success field (matches ApiResponse model in API.py)
      if ('success' in data) {
        if (!data.success) {
          throw new Error(data.error || 'API returned error status');
        }
        // Return the data field if it exists, otherwise the whole response
        return (data.data !== undefined) ? data.data as T : data as T;
      }
      
      // Otherwise return the whole response
      return data as T;
    }
    
    return data as T;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    toast.error(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

// Script processing APIs
export async function uploadScriptFile(file: File): Promise<ScriptData | null> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('validation_level', 'lenient');

  try {
    const response = await fetch(`${API_BASE_URL}/api/script/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `API Error: ${response.status}`);
    }
    
    const responseData = await response.json();
    const data = responseData.data as ScriptData;
    
    // Store in localStorage
    saveToLocalStorage(STORAGE_KEYS.SCRIPT_DATA, data);
    
    return data;
  } catch (error) {
    console.error('Error uploading script:', error);
    toast.error(`Upload Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

export async function analyzeScriptText(scriptText: string): Promise<ScriptData | null> {
  try {
    const responseData = await fetchFromAPI<{success: boolean, data: ScriptData, error?: string}>('/api/script/text', {
      method: 'POST',
      body: JSON.stringify({ script: scriptText, validation_level: 'lenient' }),
    });
    
    if (responseData && 'data' in responseData) {
      const data = responseData.data;
      // Store in localStorage
      saveToLocalStorage(STORAGE_KEYS.SCRIPT_DATA, data);
      return data;
    } else if (responseData) {
      // Handle case where the response doesn't match expected structure
      saveToLocalStorage(STORAGE_KEYS.SCRIPT_DATA, responseData);
      return responseData as unknown as ScriptData;
    }
    
    return null;
  } catch (error) {
    console.error('Error analyzing script text:', error);
    toast.error(`Analysis Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

// One-liner API
export async function generateOneLiner(): Promise<OneLinerData | null> {
  // First check if we have script data in local storage
  const scriptData = getFromLocalStorage<ScriptData>(STORAGE_KEYS.SCRIPT_DATA);
  if (!scriptData) {
    toast.error('No script data available. Please upload a script first.');
    return null;
  }

  try {
    const responseData = await fetchFromAPI<{success: boolean, data: OneLinerData, error?: string}>('/api/one-liner', {
      method: 'POST',
      body: JSON.stringify(scriptData),
    });
    
    if (responseData && 'data' in responseData) {
      const data = responseData.data;
      // Store in localStorage
      saveToLocalStorage(STORAGE_KEYS.ONE_LINER_DATA, data);
      return data;
    } else if (responseData) {
      // Handle case where the response doesn't match expected structure
      saveToLocalStorage(STORAGE_KEYS.ONE_LINER_DATA, responseData);
      return responseData as unknown as OneLinerData;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating one-liner:', error);
    toast.error(`One-liner Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

// Character breakdown API
export async function analyzeCharacters(): Promise<CharacterData | null> {
  // First check if we have script data in local storage
  const scriptData = getFromLocalStorage<ScriptData>(STORAGE_KEYS.SCRIPT_DATA);
  if (!scriptData) {
    toast.error('No script data available. Please upload a script first.');
    return null;
  }

  try {
    const responseData = await fetchFromAPI<{success: boolean, data: CharacterData, error?: string}>('/api/characters', {
      method: 'POST',
      body: JSON.stringify({ script_data: scriptData }),
    });
    
    if (responseData && 'data' in responseData) {
      const data = responseData.data;
      // Store in localStorage
      saveToLocalStorage(STORAGE_KEYS.CHARACTER_DATA, data);
      return data;
    } else if (responseData) {
      // Handle case where the response doesn't match expected structure
      saveToLocalStorage(STORAGE_KEYS.CHARACTER_DATA, responseData);
      return responseData as unknown as CharacterData;
    }
    
    return null;
  } catch (error) {
    console.error('Error analyzing characters:', error);
    toast.error(`Character Analysis Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

// Schedule API
export async function createSchedule(startDate: string): Promise<ScheduleData | null> {
  // First check if we have script and character data in local storage
  const scriptData = getFromLocalStorage<ScriptData>(STORAGE_KEYS.SCRIPT_DATA);
  const characterData = getFromLocalStorage<CharacterData>(STORAGE_KEYS.CHARACTER_DATA);
  
  if (!scriptData || !characterData) {
    toast.error('Script and character data required. Please complete those steps first.');
    return null;
  }

  try {
    const requestData = {
      script_results: scriptData,
      character_results: characterData,
      start_date: startDate,
      location_constraints: {"preferred_locations": [], "avoid_weather": ["Rain", "Snow", "High Winds"]},
      schedule_constraints: {"max_hours_per_day": 12, "meal_break_duration": 60, "company_moves_per_day": 2}
    };

    const responseData = await fetchFromAPI<{success: boolean, data: ScheduleData, error?: string}>('/api/schedule', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    
    if (responseData && 'data' in responseData) {
      const data = responseData.data;
      // Store in localStorage
      saveToLocalStorage(STORAGE_KEYS.SCHEDULE_DATA, data);
      return data;
    } else if (responseData) {
      // Handle case where the response doesn't match expected structure
      saveToLocalStorage(STORAGE_KEYS.SCHEDULE_DATA, responseData);
      return responseData as unknown as ScheduleData;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating schedule:', error);
    toast.error(`Schedule Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

// Storyboard API
export async function generateStoryboard(
  sceneId: string,
  sceneDescription: string,
  shotType: string = 'MS',
  cameraAngle: string = 'eye_level',
  mood: string = 'neutral',
  stylePrompt: string = ''
): Promise<StoryboardData | null> {
  try {
    const requestData = {
      scene_id: sceneId,
      scene_description: sceneDescription,
      style_prompt: stylePrompt,
      shot_type: shotType,
      mood: mood,
      camera_angle: cameraAngle
    };

    const responseData = await fetchFromAPI<{success: boolean, data: any, error?: string}>('/api/storyboard', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    
    if (!responseData) {
      return null;
    }

    // Get existing storyboard data or initialize empty
    const existingData = getFromLocalStorage<StoryboardData>(STORAGE_KEYS.STORYBOARD_DATA);
    let updatedData: StoryboardData;
    
    // Single scene response (might not have scenes array)
    const singleSceneData = responseData.data || responseData;
    
    if (existingData) {
      // Check if the scene already exists in our stored data
      const sceneIndex = existingData.scenes.findIndex(s => s.scene_id === sceneId);
      
      if (sceneIndex >= 0) {
        // Update existing scene
        if ('scenes' in singleSceneData && Array.isArray(singleSceneData.scenes)) {
          // If response has scenes array, use the first item
          existingData.scenes[sceneIndex] = singleSceneData.scenes[0];
        } else {
          // If response is just the scene data
          existingData.scenes[sceneIndex] = singleSceneData;
        }
        updatedData = existingData;
      } else {
        // Add new scene
        if ('scenes' in singleSceneData && Array.isArray(singleSceneData.scenes)) {
          // If response has scenes array, add them all
          updatedData = {
            scenes: [...existingData.scenes, ...singleSceneData.scenes]
          };
        } else {
          // If response is just the scene data
          updatedData = {
            scenes: [...existingData.scenes, singleSceneData]
          };
        }
      }
    } else {
      // No existing data
      if ('scenes' in singleSceneData && Array.isArray(singleSceneData.scenes)) {
        // If response has scenes array, use it
        updatedData = singleSceneData;
      } else {
        // If response is just the scene data
        updatedData = {
          scenes: [singleSceneData]
        };
      }
    }
    
    // Store updated data in localStorage
    saveToLocalStorage(STORAGE_KEYS.STORYBOARD_DATA, updatedData);
    return updatedData;
  } catch (error) {
    console.error('Error generating storyboard:', error);
    toast.error(`Storyboard Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

// Batch storyboard generation for multiple scenes
export async function generateStoryboardBatch(): Promise<StoryboardData | null> {
  // First check if we have script data in local storage
  const scriptData = getFromLocalStorage<ScriptData>(STORAGE_KEYS.SCRIPT_DATA);
  if (!scriptData) {
    toast.error('No script data available. Please upload a script first.');
    return null;
  }

  try {
    const requestData = {
      script_results: scriptData,
      shot_settings: {
        default_shot_type: "MS",
        style: "realistic",
        mood: "neutral",
        camera_angle: "eye_level"
      }
    };

    const responseData = await fetchFromAPI<{success: boolean, data: StoryboardData, error?: string}>('/api/storyboard/batch', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
    
    if (responseData && 'data' in responseData) {
      const data = responseData.data;
      // Store in localStorage
      saveToLocalStorage(STORAGE_KEYS.STORYBOARD_DATA, data);
      return data;
    } else if (responseData) {
      // Handle case where the response doesn't match expected structure
      saveToLocalStorage(STORAGE_KEYS.STORYBOARD_DATA, responseData);
      return responseData as unknown as StoryboardData;
    }
    
    return null;
  } catch (error) {
    console.error('Error generating batch storyboards:', error);
    toast.error(`Storyboard Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

// Utility functions to get data from storage service
export function getScriptData(): ScriptData | null {
  return getFromLocalStorage<ScriptData>(STORAGE_KEYS.SCRIPT_DATA);
}

export function getOneLinerData(): OneLinerData | null {
  return getFromLocalStorage<OneLinerData>(STORAGE_KEYS.ONE_LINER_DATA);
}

export function getCharacterData(): CharacterData | null {
  return getFromLocalStorage<CharacterData>(STORAGE_KEYS.CHARACTER_DATA);
}

export function getScheduleData(): ScheduleData | null {
  return getFromLocalStorage<ScheduleData>(STORAGE_KEYS.SCHEDULE_DATA);
}

export function getStoryboardData(): StoryboardData | null {
  return getFromLocalStorage<StoryboardData>(STORAGE_KEYS.STORYBOARD_DATA);
}

// Function to clear all data
export function clearAllData(): void {
  [
    STORAGE_KEYS.SCRIPT_DATA,
    STORAGE_KEYS.ONE_LINER_DATA,
    STORAGE_KEYS.CHARACTER_DATA,
    STORAGE_KEYS.SCHEDULE_DATA,
    STORAGE_KEYS.STORYBOARD_DATA
  ].forEach(key => localStorage.removeItem(key));
  
  toast.success('All script data cleared successfully');
}
