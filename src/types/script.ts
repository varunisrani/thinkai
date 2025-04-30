// Script Data Types
export interface ScriptData {
  id: string;
  title: string;
  content: string;
  metadata: {
    author?: string;
    date?: string;
    version?: string;
  };
  parsed_data: {
    scenes: Scene[];
    timeline?: Timeline;
    technical_requirements?: TechnicalRequirements;
  };
}

export interface Scene {
  scene_id: string;
  scene_number: number;
  location: {
    place: string;
    time_of_day: string;
    interior_exterior: 'INT' | 'EXT';
  };
  description: string;
  characters: string[];
  dialogue: DialogueLine[];
  duration_minutes?: number;
}

export interface DialogueLine {
  character: string;
  text: string;
  parenthetical?: string;
}

export interface Timeline {
  total_duration: string;
  total_pages: number;
  average_scene_duration: number;
  scene_breakdown: {
    scene_number: number;
    start_time: string;
    end_time: string;
    location: string;
    characters: string[];
  }[];
}

export interface TechnicalRequirements {
  equipment: string[];
  special_effects: string[];
  props: string[];
  costumes: string[];
}

// One-Liner Data Types
export interface OneLinerData {
  id: string;
  script_id: string;
  scenes: {
    scene_number: number;
    one_liner: string;
    key_elements: string[];
  }[];
  overall_summary: string;
}

// Character Data Types
export interface CharacterData {
  id: string;
  script_id: string;
  characters: {
    [key: string]: {
      name: string;
      role: string;
      description: string;
      arc: string;
      dialogue_analysis: {
        total_lines: number;
        total_words: number;
        average_line_length: number;
        vocabulary_complexity: number;
      };
      relationships: {
        character: string;
        relationship_type: string;
        intensity: number;
      }[];
    };
  };
  scene_matrix: {
    [key: string]: {
      present_characters: string[];
      interactions: {
        characters: string[];
        type: string;
        significance: number;
      }[];
      emotional_atmosphere: string;
      key_developments: string[];
    };
  };
  statistics: {
    scene_stats: {
      total_scenes: number;
      average_characters_per_scene: number;
      total_interactions: number;
    };
    dialogue_stats: {
      [key: string]: {
        total_lines: number;
        total_words: number;
      };
    };
  };
}

// Schedule Data Types
export interface ScheduleData {
  id: string;
  script_id: string;
  schedule: {
    date: string;
    day_number: number;
    scenes: {
      scene_id: string;
      scene_number: number;
      start_time: string;
      end_time: string;
      location_id: string;
      characters: string[];
      requirements: {
        equipment: string[];
        props: string[];
        special_effects: string[];
      };
    }[];
    breaks: {
      type: string;
      start_time: string;
      duration_minutes: number;
    }[];
  }[];
  locations: {
    [key: string]: {
      name: string;
      address?: string;
      requirements: string[];
      availability: {
        date: string;
        available_times: string[];
      }[];
    };
  };
}

// Storyboard Data Types
export interface StoryboardData {
  id: string;
  script_id: string;
  scenes: {
    scene_id: string;
    scene_number: number;
    description: string;
    panels: {
      panel_number: number;
      image_url: string;
      description: string;
      technical_params: {
        shot_type: string;
        camera_angle: string;
        movement?: string;
        mood: string;
      };
    }[];
  }[];
  settings: {
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