import React, { useState, useEffect, useCallback } from 'react';
import { 
  Camera, RefreshCw, ChevronDown, ArrowLeft, ArrowRight, Grid, Film, Sliders, Download, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useScriptData } from '@/hooks/useScriptData';
import { saveToStorage, loadFromStorage } from '@/utils/storage';
import { ScriptData, CharacterData, StoryboardData } from '@/services/scriptApiService';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Slider } from '@/components/ui/slider';

// Debug logging helper
const logDebug = (message: string, data?: unknown) => {
  console.log(`[StoryboardTab] ${message}`, data || '');
};

// TEMPORARY: Debug helper to populate mock data
const populateDebugData = () => {
  const mockScriptData = {
    scenes: [
      { scene_id: '1', description: 'A dimly lit alleyway. JOHN walks cautiously, looking over his shoulder.' },
      { scene_id: '2', description: 'Inside a coffee shop. SARAH sits by the window, waiting anxiously.' },
      { scene_id: '3', description: 'A crowded train station. JOHN spots SARAH in the distance.' }
    ],
    characters: ['JOHN', 'SARAH'],
    title: 'Test Script',
    metadata: {
      author: 'Debug User',
      date: new Date().toISOString()
    }
  };
  
  localStorage.setItem('SCRIPT_DATA', JSON.stringify(mockScriptData));
  console.log('[StoryboardTab] Populated mock SCRIPT_DATA for testing');
  window.location.reload(); // Reload to apply changes
};

// Define only interfaces that don't conflict with imported types
interface StoryboardTabProps {
  darkMode: boolean;
  apiUrl: string;
}

interface SubtabProps {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

interface SceneSettings {
  shot_type?: string;
  style?: string;
  mood?: string;
  camera_angle?: string;
  lighting?: string;
  composition?: string;
  [key: string]: string | undefined;
}

interface StoryboardSettings {
  shot_settings: {
    default_shot_type: string;
    style: string;
    mood: string;
    camera_angle: string;
    scene_settings: Record<string, SceneSettings>;
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
}

// Define scene type
type ScriptScene = {
  scene_id?: string;
  scene_number?: number;
  description?: string;
  location?: {
    place?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

interface ScriptDataWithScenes {
  scenes: ScriptScene[];
  parsed_data?: {
    scenes: ScriptScene[];
  };
}

interface StoryboardScene {
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
}

interface ParsedStoryboardData {
  scenes: StoryboardScene[];
}

const StoryboardTab: React.FC<StoryboardTabProps> = ({ darkMode, apiUrl }) => {
  const { 
    scriptData, 
    storyboardData, 
    updateStoryboardData
  } = useScriptData();

  // Component state
  const [storyboardView, setStoryboardView] = useState('grid');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [storyboardSettings, setStoryboardSettings] = useState<StoryboardSettings>({
    shot_settings: {
      default_shot_type: 'MS',
      style: 'realistic',
      mood: 'neutral',
      camera_angle: 'eye_level',
      scene_settings: {}
    },
    layout: {
      panels_per_row: 3,
      panel_size: 'medium',
      show_captions: true,
      show_technical: true
    },
    image: {
      quality: 'standard',
      aspect_ratio: '16:9',
      color_mode: 'color',
      border: 'thin'
    }
  });

  // Load data from localStorage on initial mount
  useEffect(() => {
    logDebug('StoryboardTab component mounted');
    
    // Try to load storyboard data from localStorage
    if (!storyboardData && scriptData) {
      try {
        const storedData = localStorage.getItem('STORYBOARD_DATA');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          logDebug('Found storyboard data in localStorage, loading it');
          
          // Ensure the data matches the expected structure with required fields
          const formattedData: ParsedStoryboardData = {
            scenes: parsedData.scenes.map((scene: Partial<StoryboardScene>) => ({
              scene_id: scene.scene_id || '',
              description: scene.description || '',
              prompt: scene.prompt || '',
              enhanced_prompt: scene.enhanced_prompt || '',
              image_url: scene.image_url || '',
              image_path: scene.image_path || '',
              technical_params: {
                shot_type: scene.technical_params?.shot_type || 'MS',
                camera_angle: scene.technical_params?.camera_angle || 'eye_level',
                mood: scene.technical_params?.mood || 'neutral'
              }
            }))
          };
          
          updateStoryboardData(formattedData);
          logDebug('Successfully loaded and formatted storyboard data');
        } else {
          logDebug('No storyboard data found in localStorage');
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logDebug('Error loading storyboard data from localStorage:', errorMessage);
      }
    }
  }, []);

  // Save storyboard data to localStorage when it changes
  useEffect(() => {
    if (storyboardData) {
      localStorage.setItem('STORYBOARD_DATA', JSON.stringify(storyboardData));
      logDebug('Saved storyboard data to localStorage');
    }
  }, [storyboardData]);

  // Define fetchStoryboardImage with useCallback
  const fetchStoryboardImage = useCallback(async (sceneId: string) => {
    try {
      setImageLoading(prev => ({...prev, [sceneId]: true}));

      const response = await fetch(`https://varun324242-sjuu.hf.space/api/storyboard/image/${sceneId}`);

      if (!response.ok) {
        throw new Error(`Failed to load image (status ${response.status})`);
      }

      // Check if it's an image response and not an error JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }

      // Image loaded successfully
      setError(null);
      return `https://varun324242-sjuu.hf.space/api/storyboard/image/${sceneId}?t=${Date.now()}`; // Add cache buster
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      logDebug(`Error loading storyboard image for scene ${sceneId}:`, error);
      setError(`Failed to load storyboard image for scene ${sceneId}: ${error.message}`);
      return null;
    } finally {
      setImageLoading(prev => ({...prev, [sceneId]: false}));
    }
  }, []);

  // Use effect to load storyboard images
  useEffect(() => {
    if (storyboardData?.scenes && storyboardData.scenes.length > 0) {
      // Load all storyboard images
      const loadImages = async () => {
        const loadingStates: Record<string, boolean> = {};
        storyboardData.scenes.forEach(scene => {
          loadingStates[scene.scene_id] = true;
        });
        setImageLoading(loadingStates);

        // Fetch all images in parallel
        await Promise.all(storyboardData.scenes.map(scene =>
          fetchStoryboardImage(scene.scene_id)
        ));
      };

      loadImages();
    }
  }, [storyboardData, fetchStoryboardImage]);

  const generateStoryboard = async (sceneId: string, description: string, stylePrompt?: string) => {
    if (!scriptData) {
      toast.error('Please upload a script first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      logDebug(`Generating storyboard for scene ${sceneId}`);
      
      const response = await fetch(`https://varun324242-sjuu.hf.space/api/storyboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_id: sceneId,
          scene_description: description,
          style_prompt: stylePrompt,
          shot_type: storyboardSettings.shot_settings.default_shot_type,
          mood: storyboardSettings.shot_settings.mood,
          camera_angle: storyboardSettings.shot_settings.camera_angle
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Unknown API error');

      logDebug('Storyboard API response:', result.data);

      // Process the scene data
      const sceneData = result.data;

      // Update the image URL construction
      if (!sceneData.image_url && sceneData.image_path) {
        sceneData.image_url = `https://varun324242-sjuu.hf.space/api/storyboard/image/${sceneId}`;
      }

      if (!sceneData.image_url && !sceneData.image_path) {
        sceneData.image_url = `https://varun324242-sjuu.hf.space/api/storyboard/image/${sceneId}`;
      }

      // Update storyboard data
      if (storyboardData && storyboardData.scenes) {
        const updatedScenes = [...storyboardData.scenes];
        const sceneIndex = updatedScenes.findIndex(scene => scene.scene_id === sceneId);

        if (sceneIndex >= 0) {
          updatedScenes[sceneIndex] = sceneData;
        } else {
          updatedScenes.push(sceneData);
        }

        updateStoryboardData({
          ...storyboardData,
          scenes: updatedScenes
        });
      } else {
        updateStoryboardData({
          scenes: [sceneData]
        });
      }

      toast.success('Storyboard generated successfully!');
      setSuccess('Storyboard generated successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate storyboard';
      logDebug('Error during storyboard generation:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const generateFullStoryboard = async () => {
    if (!scriptData) {
      toast.error('Please upload a script first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      logDebug('Generating full storyboard');
      
      // Create proper payload structure with script_results
      const apiPayload = {
        script_results: scriptData, // Using script_results as in the old code
        shot_settings: storyboardSettings.shot_settings
      };
      
      const response = await fetch(`https://varun324242-sjuu.hf.space/api/storyboard/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Unknown API error');

      logDebug('Full storyboard API response:', result.data);

      // Process the storyboard data to ensure image URLs are set
      const processedData = { ...result.data };

      if (processedData.scenes && Array.isArray(processedData.scenes)) {
        processedData.scenes = processedData.scenes.map(scene => {
          // If image_url is not set but image_path is, create a URL from it
          if (!scene.image_url && scene.image_path) {
            scene.image_url = `https://varun324242-sjuu.hf.space/api/storyboard/image/${scene.scene_id}`;
          }

          // If neither is set, set a default URL
          if (!scene.image_url && !scene.image_path) {
            scene.image_url = `https://varun324242-sjuu.hf.space/api/storyboard/image/${scene.scene_id}`;
          }

          return scene;
        });
      }

      updateStoryboardData(processedData);
      toast.success('Full storyboard generated successfully!');
      setSuccess('Full storyboard generated successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate storyboard';
      logDebug('Error during full storyboard generation:', error);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading && !storyboardData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-studio-accent" />
          <p className="text-studio-text-secondary">Loading storyboard data...</p>
        </div>
      </div>
    );
  }

  // Show error state if no script data
  if (!scriptData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-studio-error" />
          <h3 className="text-xl font-medium mb-4">
            {error || 'Please complete script analysis first'}
          </h3>
          <div className="flex flex-col gap-4 items-center">
            <Button 
              onClick={() => window.location.href="/"}
              variant="default"
            >
              Go to Upload
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto min-h-screen">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-studio-text-primary">
          Storyboard Generation
        </h2>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="mb-4">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
      </div>

      {!storyboardData ? (
        <div className="overflow-y-auto">
          <div className="mb-8">
            <h3 className="text-xl font-medium mb-4">
              Generate a complete storyboard for your script
            </h3>
            <p className="text-studio-text-secondary mb-4">
              The storyboard generator will create visual representations for each scene in your script.
              You can customize the shot types, visual style, and other parameters below.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="default-shot-type">Default Shot Type</Label>
                <Select
                  defaultValue={storyboardSettings.shot_settings.default_shot_type}
                  onValueChange={(value) => setStoryboardSettings({
                    ...storyboardSettings,
                    shot_settings: {
                      ...storyboardSettings.shot_settings,
                      default_shot_type: value
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select shot type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MS">Medium Shot (MS)</SelectItem>
                    <SelectItem value="WS">Wide Shot (WS)</SelectItem>
                    <SelectItem value="CU">Close-Up (CU)</SelectItem>
                    <SelectItem value="ECU">Extreme Close-Up (ECU)</SelectItem>
                    <SelectItem value="OTS">Over The Shoulder (OTS)</SelectItem>
                    <SelectItem value="POV">Point of View (POV)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="visual-style">Visual Style</Label>
                <Select
                  defaultValue={storyboardSettings.shot_settings.style}
                  onValueChange={(value) => setStoryboardSettings({
                    ...storyboardSettings,
                    shot_settings: {
                      ...storyboardSettings.shot_settings,
                      style: value
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select visual style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realistic">Realistic</SelectItem>
                    <SelectItem value="scribble">Scribble/Sketch</SelectItem>
                    <SelectItem value="noir">Film Noir</SelectItem>
                    <SelectItem value="anime">Anime</SelectItem>
                    <SelectItem value="watercolor">Watercolor</SelectItem>
                    <SelectItem value="storyboard">Classic Storyboard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              variant="default"
              className="w-full"
              disabled={loading || !scriptData}
              onClick={generateFullStoryboard}
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Generating Storyboard...
                </>
              ) : 'Generate Complete Storyboard'}
            </Button>
          </div>

          <Separator className="my-6" />

          <h3 className="text-xl font-medium mb-4">
            Or generate storyboards for individual scenes
          </h3>

          {scriptData && scriptData.parsed_data && scriptData.parsed_data.scenes ? (
            <div className="space-y-4 overflow-y-auto max-h-[60vh] pb-6">
              {scriptData.parsed_data.scenes.map((scene: ScriptScene, index: number) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h4 className="text-lg font-medium mb-2">
                      Scene {scene.scene_number} - {scene.location?.place || 'Unknown Location'}
                    </h4>
                    <p className="text-studio-text-secondary mb-4">
                      {scene.description}
                    </p>
                    <Button 
                      variant="secondary"
                      onClick={() => generateStoryboard(
                        scene.scene_id || scene.scene_number?.toString() || index.toString(),
                        scene.description || ''
                      )}
                      disabled={loading}
                    >
                      Generate Storyboard
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-studio-text-secondary">
              Please complete script analysis first to generate storyboards.
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-y-auto flex-1">
          <Tabs defaultValue="grid" className="mb-6">
            <TabsList>
              <TabsTrigger value="grid" onClick={() => setStoryboardView('grid')}>
                <Grid className="h-4 w-4 mr-2" />
                Grid View
              </TabsTrigger>
              <TabsTrigger value="slideshow" onClick={() => setStoryboardView('slideshow')}>
                <Film className="h-4 w-4 mr-2" />
                Slideshow
              </TabsTrigger>
              <TabsTrigger value="settings" onClick={() => setStoryboardView('settings')}>
                <Sliders className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="export" onClick={() => setStoryboardView('export')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="mt-6 overflow-auto">
              <h3 className="text-xl font-medium mb-4">
                Storyboard Sequence
              </h3>

              <div className="mb-4">
                <Label htmlFor="panels-per-row">Panels per row</Label>
                <Select
                  defaultValue={storyboardSettings.layout.panels_per_row.toString()}
                  onValueChange={(value) => setStoryboardSettings({
                    ...storyboardSettings,
                    layout: {
                      ...storyboardSettings.layout,
                      panels_per_row: parseInt(value)
                    }
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select panels per row" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 panels</SelectItem>
                    <SelectItem value="3">3 panels</SelectItem>
                    <SelectItem value="4">4 panels</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {storyboardData.scenes && storyboardData.scenes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pb-6">
                  {storyboardData.scenes.map((scene, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <h4 className="text-lg font-medium mb-2">
                          Scene {scene.scene_id} - {scene.technical_params?.shot_type || 'MS'}
                        </h4>

                        <div className="relative aspect-video w-full bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden mb-2">
                          {imageLoading[scene.scene_id] && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="animate-spin h-8 w-8">⏳</div>
                            </div>
                          )}

                          <img
                            src={`https://varun324242-sjuu.hf.space/api/storyboard/image/${scene.scene_id}?t=${Date.now()}`}
                            alt={`Storyboard for Scene ${scene.scene_id}`}
                            className={cn(
                              "object-contain w-full h-full transition-opacity",
                              imageLoading[scene.scene_id] ? "opacity-50" : "opacity-100"
                            )}
                            onError={(e) => {
                              console.error(`Failed to load image for scene ${scene.scene_id}`);
                              setError(`Storyboard image for scene ${scene.scene_id} not found.`);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>

                        {storyboardSettings.layout.show_captions && (
                          <p className="text-studio-text-secondary text-sm mb-2">
                            {scene?.description || 'No description available'}
                          </p>
                        )}

                        {storyboardSettings.layout.show_technical && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            <Badge variant="outline">{scene?.technical_params?.shot_type || 'MS'}</Badge>
                            <Badge variant="outline">{scene?.technical_params?.camera_angle || 'eye_level'}</Badge>
                            <Badge variant="outline">{scene?.technical_params?.mood || 'neutral'}</Badge>
                          </div>
                        )}

                        <Accordion type="single" collapsible>
                          <AccordionItem value="prompt">
                            <AccordionTrigger>View Prompt</AccordionTrigger>
                            <AccordionContent>
                              <p className="text-sm font-medium mb-1">Original Prompt:</p>
                              <p className="text-sm text-studio-text-secondary mb-2 whitespace-pre-wrap">
                                {scene.prompt || 'No prompt available'}
                              </p>

                              {scene.enhanced_prompt && (
                                <>
                                  <p className="text-sm font-medium mb-1">Enhanced Prompt:</p>
                                  <p className="text-sm text-studio-text-secondary whitespace-pre-wrap">
                                    {scene.enhanced_prompt}
                                  </p>
                                </>
                              )}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        <Button 
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => generateStoryboard(
                            scene.scene_id,
                            scene.description || '',
                            scene.prompt
                          )}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-studio-text-secondary">
                  No storyboard scenes available. Try generating the storyboard first.
                </p>
              )}
            </TabsContent>

            <TabsContent value="slideshow" className="mt-6 overflow-auto">
              {storyboardData.scenes && storyboardData.scenes.length > 0 ? (
                <div>
                  <div className="flex justify-center items-center mb-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (currentSceneIndex > 0) {
                          setCurrentSceneIndex(currentSceneIndex - 1);
                        }
                      }}
                      disabled={currentSceneIndex === 0}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <span className="mx-4">
                      Scene {currentSceneIndex + 1} of {storyboardData.scenes.length}
                    </span>

                    <Button
                      variant="outline"
                      onClick={() => {
                        if (currentSceneIndex < storyboardData.scenes.length - 1) {
                          setCurrentSceneIndex(currentSceneIndex + 1);
                        }
                      }}
                      disabled={currentSceneIndex === storyboardData.scenes.length - 1}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>

                  <Card className="max-w-2xl mx-auto">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-medium mb-2">
                        Scene {storyboardData.scenes[currentSceneIndex].scene_id}
                      </h3>

                      <div className="relative aspect-video w-full bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden mb-4">
                        <img
                          src={`https://varun324242-sjuu.hf.space/api/storyboard/image/${storyboardData.scenes[currentSceneIndex].scene_id}?t=${Date.now()}`}
                          alt={`Storyboard for Scene ${storyboardData.scenes[currentSceneIndex].scene_id}`}
                          className="object-contain w-full h-full"
                          onError={(e) => {
                            console.log('Slideshow image load error, using placeholder');
                            e.currentTarget.src = 'https://via.placeholder.com/800x450?text=Image+Not+Available';
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium mb-1">Scene Description:</h4>
                          <p className="text-studio-text-secondary">
                            {storyboardData.scenes[currentSceneIndex].description || 'No description available'}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1">Technical Notes:</h4>
                          <p className="text-studio-text-secondary">
                            Shot Type: {storyboardData.scenes[currentSceneIndex].technical_params?.shot_type || 'MS'}<br />
                            Camera Angle: {storyboardData.scenes[currentSceneIndex].technical_params?.camera_angle || 'eye_level'}<br />
                            Mood: {storyboardData.scenes[currentSceneIndex].technical_params?.mood || 'neutral'}
                          </p>
                        </div>
                      </div>

                      <Accordion type="single" collapsible>
                        <AccordionItem value="prompt">
                          <AccordionTrigger>View Prompt</AccordionTrigger>
                          <AccordionContent>
                            <p className="text-sm font-medium mb-1">Original Prompt:</p>
                            <p className="text-sm text-studio-text-secondary mb-2 whitespace-pre-wrap">
                              {storyboardData.scenes[currentSceneIndex].prompt || 'No prompt available'}
                            </p>

                            {storyboardData.scenes[currentSceneIndex].enhanced_prompt && (
                              <>
                                <p className="text-sm font-medium mb-1">Enhanced Prompt:</p>
                                <p className="text-sm text-studio-text-secondary whitespace-pre-wrap">
                                  {storyboardData.scenes[currentSceneIndex].enhanced_prompt}
                                </p>
                              </>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>

                  <div className="max-w-2xl mx-auto mt-4 px-4">
                    <Slider
                      defaultValue={[currentSceneIndex]}
                      min={0}
                      max={storyboardData.scenes.length - 1}
                      step={1}
                      onValueChange={(values) => setCurrentSceneIndex(values[0])}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-studio-text-secondary">
                  No storyboard scenes available. Try generating the storyboard first.
                </p>
              )}
            </TabsContent>

            <TabsContent value="settings" className="mt-6 overflow-auto">
              <h3 className="text-xl font-medium mb-4">
                Storyboard Settings
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <h4 className="text-lg font-medium">Shot Settings</h4>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="default-shot-type">Default Shot Type</Label>
                      <Select
                        defaultValue={storyboardSettings.shot_settings.default_shot_type}
                        onValueChange={(value) => setStoryboardSettings({
                          ...storyboardSettings,
                          shot_settings: {
                            ...storyboardSettings.shot_settings,
                            default_shot_type: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select shot type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MS">Medium Shot (MS)</SelectItem>
                          <SelectItem value="WS">Wide Shot (WS)</SelectItem>
                          <SelectItem value="CU">Close-Up (CU)</SelectItem>
                          <SelectItem value="ECU">Extreme Close-Up (ECU)</SelectItem>
                          <SelectItem value="OTS">Over The Shoulder (OTS)</SelectItem>
                          <SelectItem value="POV">Point of View (POV)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="visual-style">Visual Style</Label>
                      <Select
                        defaultValue={storyboardSettings.shot_settings.style}
                        onValueChange={(value) => setStoryboardSettings({
                          ...storyboardSettings,
                          shot_settings: {
                            ...storyboardSettings.shot_settings,
                            style: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select visual style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="realistic">Realistic</SelectItem>
                          <SelectItem value="scribble">Scribble/Sketch</SelectItem>
                          <SelectItem value="noir">Film Noir</SelectItem>
                          <SelectItem value="anime">Anime</SelectItem>
                          <SelectItem value="watercolor">Watercolor</SelectItem>
                          <SelectItem value="storyboard">Classic Storyboard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="default-mood">Default Mood</Label>
                      <Select
                        defaultValue={storyboardSettings.shot_settings.mood}
                        onValueChange={(value) => setStoryboardSettings({
                          ...storyboardSettings,
                          shot_settings: {
                            ...storyboardSettings.shot_settings,
                            mood: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select mood" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="dramatic">Dramatic</SelectItem>
                          <SelectItem value="tense">Tense</SelectItem>
                          <SelectItem value="joyful">Joyful</SelectItem>
                          <SelectItem value="mysterious">Mysterious</SelectItem>
                          <SelectItem value="melancholic">Melancholic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="camera-angle">Default Camera Angle</Label>
                      <Select
                        defaultValue={storyboardSettings.shot_settings.camera_angle}
                        onValueChange={(value) => setStoryboardSettings({
                          ...storyboardSettings,
                          shot_settings: {
                            ...storyboardSettings.shot_settings,
                            camera_angle: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select camera angle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eye_level">Eye Level</SelectItem>
                          <SelectItem value="low_angle">Low Angle</SelectItem>
                          <SelectItem value="high_angle">High Angle</SelectItem>
                          <SelectItem value="dutch_angle">Dutch Angle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <h4 className="text-lg font-medium">Layout Settings</h4>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="panels-per-row">Panels per Row</Label>
                        <Select
                          defaultValue={storyboardSettings.layout.panels_per_row.toString()}
                          onValueChange={(value) => setStoryboardSettings({
                            ...storyboardSettings,
                            layout: {
                              ...storyboardSettings.layout,
                              panels_per_row: parseInt(value)
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select panels per row" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 panels</SelectItem>
                            <SelectItem value="3">3 panels</SelectItem>
                            <SelectItem value="4">4 panels</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="panel-size">Panel Size</Label>
                        <Select
                          defaultValue={storyboardSettings.layout.panel_size}
                          onValueChange={(value) => setStoryboardSettings({
                            ...storyboardSettings,
                            layout: {
                              ...storyboardSettings.layout,
                              panel_size: value
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select panel size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">Small</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="large">Large</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-captions"
                          checked={storyboardSettings.layout.show_captions}
                          onCheckedChange={(checked) => setStoryboardSettings({
                            ...storyboardSettings,
                            layout: {
                              ...storyboardSettings.layout,
                              show_captions: checked
                            }
                          })}
                        />
                        <Label htmlFor="show-captions">Show Captions</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-technical"
                          checked={storyboardSettings.layout.show_technical}
                          onCheckedChange={(checked) => setStoryboardSettings({
                            ...storyboardSettings,
                            layout: {
                              ...storyboardSettings.layout,
                              show_technical: checked
                            }
                          })}
                        />
                        <Label htmlFor="show-technical">Show Technical Info</Label>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h4 className="text-lg font-medium">Image Settings</h4>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="image-quality">Image Quality</Label>
                        <Select
                          defaultValue={storyboardSettings.image.quality}
                          onValueChange={(value) => setStoryboardSettings({
                            ...storyboardSettings,
                            image: {
                              ...storyboardSettings.image,
                              quality: value
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select image quality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="hd">High Definition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                        <Select
                          defaultValue={storyboardSettings.image.aspect_ratio}
                          onValueChange={(value) => setStoryboardSettings({
                            ...storyboardSettings,
                            image: {
                              ...storyboardSettings.image,
                              aspect_ratio: value
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select aspect ratio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1:1">1:1 (Square)</SelectItem>
                            <SelectItem value="16:9">16:9 (Widescreen)</SelectItem>
                            <SelectItem value="4:3">4:3 (Standard)</SelectItem>
                            <SelectItem value="2.35:1">2.35:1 (Cinemascope)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="color-mode">Color Mode</Label>
                        <Select
                          defaultValue={storyboardSettings.image.color_mode}
                          onValueChange={(value) => setStoryboardSettings({
                            ...storyboardSettings,
                            image: {
                              ...storyboardSettings.image,
                              color_mode: value
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select color mode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="color">Color</SelectItem>
                            <SelectItem value="grayscale">Grayscale</SelectItem>
                            <SelectItem value="sepia">Sepia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Button 
                variant="default"
                className="mt-6"
                onClick={generateFullStoryboard}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate Storyboard with New Settings
              </Button>
            </TabsContent>

            <TabsContent value="export" className="mt-6 overflow-auto">
              <h3 className="text-xl font-medium mb-4">
                Export Options
              </h3>

              <Card>
                <CardContent className="p-6">
                  <h4 className="text-lg font-medium mb-2">Export Format</h4>

                  <div className="flex items-center space-x-4 mb-6">
                    <Button variant="outline" className="border-primary">
                      PDF Document
                    </Button>
                    <Button variant="outline">
                      Slideshow
                    </Button>
                  </div>

                  <h4 className="text-lg font-medium mb-2">Export Options</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-annotations" defaultChecked />
                      <Label htmlFor="include-annotations">Include Annotations</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-technical" defaultChecked />
                      <Label htmlFor="include-technical">Include Technical Notes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="include-descriptions" defaultChecked />
                      <Label htmlFor="include-descriptions">Include Scene Descriptions</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="high-quality" defaultChecked />
                      <Label htmlFor="high-quality">High Quality Export</Label>
                    </div>
                  </div>

                  <Button 
                    variant="default"
                    className="mt-6"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Storyboard
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {storyboardView !== 'settings' && (
            <div className="flex justify-center mt-6 pb-6">
              <Button 
                variant="outline"
                onClick={generateFullStoryboard}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerate Complete Storyboard
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StoryboardTab;
