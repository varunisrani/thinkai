
import { toast } from "sonner";

// API endpoints
const API_BASE_URL = "https://api.scripttoscreenai.com"; // Replace with actual API URL

// API response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Common fetch wrapper with error handling
async function fetchFromAPI<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }
    
    return data as ApiResponse<T>;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    toast.error(`API Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Script processing APIs
export async function uploadScriptFile(file: File, validationLevel: string = 'lenient'): Promise<ApiResponse<any>> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('validation_level', validationLevel);

  return fetchFromAPI('/api/script/upload', {
    method: 'POST',
    body: formData,
    headers: {}, // Let browser set content-type for FormData
  });
}

export async function analyzeScriptText(
  scriptText: string, 
  validationLevel: string = 'lenient'
): Promise<ApiResponse<any>> {
  return fetchFromAPI('/api/script/text', {
    method: 'POST',
    body: JSON.stringify({ script: scriptText, validation_level: validationLevel }),
  });
}

// One-liner API
export async function generateOneLiner(scriptData: any): Promise<ApiResponse<any>> {
  return fetchFromAPI('/api/one-liner', {
    method: 'POST',
    body: JSON.stringify(scriptData),
  });
}

// Character breakdown API
export async function analyzeCharacters(scriptData: any): Promise<ApiResponse<any>> {
  return fetchFromAPI('/api/characters', {
    method: 'POST',
    body: JSON.stringify({ script_data: scriptData }),
  });
}

// Schedule API
export async function createSchedule(
  scriptResults: any,
  characterResults: any,
  startDate: string,
  locationConstraints: any = {},
  scheduleConstraints: any = {}
): Promise<ApiResponse<any>> {
  return fetchFromAPI('/api/schedule', {
    method: 'POST',
    body: JSON.stringify({
      script_results: scriptResults,
      character_results: characterResults,
      start_date: startDate,
      location_constraints: locationConstraints,
      schedule_constraints: scheduleConstraints
    }),
  });
}

// Budget API
export async function createBudget(
  scriptResults: any,
  scheduleResults: any,
  productionData: any = null,
  locationData: any = null,
  crewData: any = null,
  targetBudget: number | null = null
): Promise<ApiResponse<any>> {
  return fetchFromAPI('/api/budget', {
    method: 'POST',
    body: JSON.stringify({
      script_results: scriptResults,
      schedule_results: scheduleResults,
      production_data: productionData,
      location_data: locationData,
      crew_data: crewData,
      target_budget: targetBudget
    }),
  });
}

// Storyboard APIs
export async function generateStoryboard(
  sceneId: string,
  sceneDescription: string,
  stylePrompt: string = '',
  shotType: string = 'MS',
  mood: string = 'neutral',
  cameraAngle: string = 'eye_level'
): Promise<ApiResponse<any>> {
  return fetchFromAPI('/api/storyboard', {
    method: 'POST',
    body: JSON.stringify({
      scene_id: sceneId,
      scene_description: sceneDescription,
      style_prompt: stylePrompt,
      shot_type: shotType,
      mood: mood,
      camera_angle: cameraAngle
    }),
  });
}

export async function generateStoryboardBatch(
  scriptResults: any,
  shotSettings: any = null
): Promise<ApiResponse<any>> {
  return fetchFromAPI('/api/storyboard/batch', {
    method: 'POST',
    body: JSON.stringify({
      script_results: scriptResults,
      shot_settings: shotSettings
    }),
  });
}

// Storage APIs
export async function getStoredData(filename: string): Promise<ApiResponse<any>> {
  return fetchFromAPI(`/api/storage/${filename}`);
}

export async function clearStorage(): Promise<ApiResponse<any>> {
  return fetchFromAPI('/api/storage', {
    method: 'DELETE',
  });
}

// Logs APIs
export async function getApiLogs(): Promise<ApiResponse<any>> {
  return fetchFromAPI('/api/logs');
}

export async function getApiStats(): Promise<ApiResponse<any>> {
  return fetchFromAPI('/api/logs/stats');
}

export async function clearApiLogs(): Promise<ApiResponse<any>> {
  return fetchFromAPI('/api/logs', {
    method: 'DELETE',
  });
}
