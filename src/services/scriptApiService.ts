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
  characters: {
    [key: string]: {
      name: string;
      description: string;
      traits: string[];
      relationships: Array<{
        character: string;
        relationship_type: string;
        intensity: number;
      }>;
    };
  };
  [key: string]: unknown;
}

export interface OneLinerData {
  scenes: Array<{
    scene_number: number;
    scene_id: string;
    one_liner: string;
  }>;
  overall_summary: string;
  [key: string]: unknown;
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
  [key: string]: unknown;
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
  [key: string]: unknown;
}

export interface StoryboardData {
  id?: string;
  script_id?: string;
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
  settings?: {
    shot_settings: {
      default_shot_type: string;
      style: string;
      mood: string;
      camera_angle: string;
      scene_settings: Record<string, unknown>;
    };
    layout: {
      panels_per_row: number;
      panel_size: string;
      show_captions: boolean;
      show_technical: boolean;
    };
    image: {
      quality: string;
      aspect_ratio: string;
      color_mode: string;
      border: string;
    };
  };
}

export interface BudgetData {
  total_budget: number;
  categories: Array<{
    id: string;
    name: string;
    amount: number;
    percentage: number;
    items: Array<{
      name: string;
      amount: number;
    }>;
  }>;
  location_costs: {
    [key: string]: {
      daily_rate?: number;
      permit_costs?: number;
      additional_fees?: string[];
      total_days?: number;
      total_cost: number;
    }
  };
  equipment_costs: {
    [key: string]: {
      items?: string[];
      rental_rates?: { [key: string]: number };
      insurance_costs?: number;
      total_cost: number;
    }
  };
  personnel_costs: {
    [key: string]: {
      daily_rate?: number;
      overtime_rate?: number;
      benefits?: number;
      total_days?: number;
      total_cost: number;
    }
  };
  logistics_costs: {
    transportation: { rental_vehicle: number };
    accommodation: { hotel: number };
    catering: { meal_service: number };
    misc_expenses: string[];
  };
  insurance_costs: { type: number };
  contingency: {
    amount: number;
    percentage: number;
  };
  total_estimates: {
    total_location_costs: number;
    total_equipment_costs: number;
    total_personnel_costs: number;
    total_logistics_costs: number;
    total_insurance_costs: number;
    contingency_amount: number;
    grand_total: number;
  };
  summary: {
    total_days: number;
    total_locations: number;
    total_crew: number;
    cost_per_day: number;
  };
  scenario_results?: {
    cost_savings: number;
    quality_impact: number;
    recommendations: Array<{
      category: string;
      action: string;
      impact: {
        cost: number;
        quality: number;
      };
    }>;
  };
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
    
    // Enhanced response handling
    if (data && typeof data === 'object') {
      // If response has success field
      if ('success' in data) {
        if (!data.success) {
          throw new Error(data.error || 'API returned error status');
        }
        // Return the data field if it exists
        const resultData = data.data !== undefined ? data.data : data;
        
        // Save to localStorage based on endpoint
        if (endpoint.includes('/script')) {
          saveToLocalStorage(STORAGE_KEYS.SCRIPT_DATA, resultData);
        } else if (endpoint.includes('/one-liner')) {
          saveToLocalStorage(STORAGE_KEYS.ONE_LINER_DATA, resultData);
        } else if (endpoint.includes('/characters')) {
          saveToLocalStorage(STORAGE_KEYS.CHARACTER_DATA, resultData);
        } else if (endpoint.includes('/schedule')) {
          saveToLocalStorage(STORAGE_KEYS.SCHEDULE_DATA, resultData);
        } else if (endpoint.includes('/storyboard')) {
          saveToLocalStorage(STORAGE_KEYS.STORYBOARD_DATA, resultData);
        }
        
        return resultData as T;
      }
      
      // If no success field, treat as direct data
      return data as T;
    }
    
    return data as T;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    // Try to load from localStorage as fallback
    const storageKey = getStorageKeyFromEndpoint(endpoint);
    if (storageKey) {
      const cachedData = getFromLocalStorage<T>(storageKey);
      if (cachedData) {
        console.log(`Loaded cached data for ${endpoint}`);
        return cachedData;
      }
    }
    toast.error(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

// Helper to get storage key from endpoint
function getStorageKeyFromEndpoint(endpoint: string): string | null {
  if (endpoint.includes('/script')) {
    return STORAGE_KEYS.SCRIPT_DATA;
  } else if (endpoint.includes('/one-liner')) {
    return STORAGE_KEYS.ONE_LINER_DATA;
  } else if (endpoint.includes('/characters')) {
    return STORAGE_KEYS.CHARACTER_DATA;
  } else if (endpoint.includes('/schedule')) {
    return STORAGE_KEYS.SCHEDULE_DATA;
  } else if (endpoint.includes('/storyboard')) {
    return STORAGE_KEYS.STORYBOARD_DATA;
  }
  return null;
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

    const responseData = await fetchFromAPI<{success: boolean, data: StoryboardData, error?: string}>('/api/storyboard', {
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
          const sceneData = ('data' in singleSceneData ? singleSceneData.data : singleSceneData) as StoryboardData['scenes'][0];
          existingData.scenes[sceneIndex] = sceneData;
          updatedData = existingData;
        } else {
          // If response is just the scene data
          const sceneData = ('data' in singleSceneData ? singleSceneData.data.scenes[0] : singleSceneData) as StoryboardData['scenes'][0];
          existingData.scenes[sceneIndex] = sceneData;
          updatedData = existingData;
        }
      } else {
        // Add new scene
        if ('scenes' in singleSceneData && Array.isArray(singleSceneData.scenes)) {
          // If response has scenes array, add them all
          updatedData = {
            scenes: [...existingData.scenes, ...singleSceneData.scenes]
          };
        } else {
          // If response is just the scene data
          const sceneData = ('data' in singleSceneData ? singleSceneData.data.scenes[0] : singleSceneData) as StoryboardData['scenes'][0];
          updatedData = {
            scenes: [...existingData.scenes, sceneData]
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
        const sceneData = ('data' in singleSceneData ? singleSceneData.data.scenes[0] : singleSceneData) as StoryboardData['scenes'][0];
        updatedData = {
          scenes: [sceneData]
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

// Enhanced data loading functions
export function getScriptData(): ScriptData | null {
  const data = getFromLocalStorage<ScriptData>(STORAGE_KEYS.SCRIPT_DATA);
  if (!data) {
    console.log('No script data found in storage');
    return null;
  }
  return data;
}

export function getOneLinerData(): OneLinerData | null {
  const data = getFromLocalStorage<OneLinerData>(STORAGE_KEYS.ONE_LINER_DATA);
  if (!data) {
    console.log('No one-liner data found in storage');
    return null;
  }
  return data;
}

export function getCharacterData(): CharacterData | null {
  const data = getFromLocalStorage<CharacterData>(STORAGE_KEYS.CHARACTER_DATA);
  if (!data) {
    console.log('No character data found in storage');
    return null;
  }
  return data;
}

export function getScheduleData(): ScheduleData | null {
  const data = getFromLocalStorage<ScheduleData>(STORAGE_KEYS.SCHEDULE_DATA);
  if (!data) {
    console.log('No schedule data found in storage');
    return null;
  }
  return data;
}

export function getStoryboardData(): StoryboardData | null {
  const data = getFromLocalStorage<StoryboardData>(STORAGE_KEYS.STORYBOARD_DATA);
  if (!data) {
    console.log('No storyboard data found in storage');
    return null;
  }
  return data;
}

// Enhanced clear data function
export function clearAllData(): void {
  try {
    [
      STORAGE_KEYS.SCRIPT_DATA,
      STORAGE_KEYS.ONE_LINER_DATA,
      STORAGE_KEYS.CHARACTER_DATA,
      STORAGE_KEYS.SCHEDULE_DATA,
      STORAGE_KEYS.STORYBOARD_DATA
    ].forEach(key => {
      localStorage.removeItem(key);
      console.log(`Cleared ${key} from storage`);
    });
    
    // Also try to clear from API storage
    fetch(`${API_BASE_URL}/storage`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    }).catch(err => console.warn('Failed to clear API storage:', err));
    
    toast.success('All script data cleared successfully');
  } catch (error) {
    console.error('Error clearing data:', error);
    toast.error('Failed to clear some data');
  }
}

// Add data validation function
export function validateRequiredData(currentStep: string): boolean {
  switch (currentStep) {
    case 'one-liner':
      return !!getScriptData();
    case 'characters':
      return !!getScriptData();
    case 'schedule':
      return !!getScriptData() && !!getCharacterData();
    case 'budget':
      return !!getScriptData() && !!getScheduleData();
    case 'storyboard':
      return !!getScriptData();
    default:
      return true;
  }
}