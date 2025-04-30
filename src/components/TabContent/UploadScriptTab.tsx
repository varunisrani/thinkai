import React, { useState, useEffect } from 'react';
import { Upload, FileText, Settings, AlertCircle, Info, Calendar, BarChart2, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useScriptData } from '@/hooks/useScriptData';
import { Button } from '@/components/ui/button';
import type { ScriptData } from '@/services/scriptApiService';

// API endpoint constant matching oldpage.jsx
const API_URL = 'https://varun324242-sjuu.hf.space/api';

// Storage keys matching oldpage.jsx
const STORAGE_KEYS = {
  SCRIPT_DATA: 'SCRIPT_DATA',
  ONE_LINER_DATA: 'ONE_LINER_DATA',
  CHARACTER_DATA: 'CHARACTER_DATA',
  SCHEDULE_DATA: 'SCHEDULE_DATA',
  BUDGET_DATA: 'BUDGET_DATA',
  STORYBOARD_DATA: 'STORYBOARD_DATA',
  THEME_MODE: 'THEME_MODE'
};

// Types matching oldpage.jsx data structures
interface ScriptMetadata {
  global_requirements: {
    equipment: string[];
    props: string[];
    special_effects: string[];
  };
  scene_metadata: Array<{
    scene_number: number;
    lighting?: {
      type?: string;
      requirements?: string[];
    };
    props?: Record<string, string[]>;
    technical?: Record<string, string[]>;
    department_notes: Record<string, string[]>;
  }>;
}

interface ParsedData {
  scenes: Array<{
    scene_number: number;
    scene_id?: string;
    location?: {
      place: string;
    };
    description?: string;
    time?: string;
    technical_cues?: string[];
    department_notes: Record<string, string[]>;
  }>;
  timeline?: {
    total_duration: number;
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
}

interface ValidationReport {
  validation_report: {
    technical_validation: {
      department_conflicts: Array<{
        scene_number: number;
        conflict: string;
      }>;
    };
  };
}

const FeatureCard = ({ icon, title, description }) => {
  const Icon = icon;
  let gradientClass = '';
  
  if (title === 'Scene Analysis') {
    gradientClass = 'gradient-blue-bg text-blue-500';
  } else if (title === 'Scheduling') {
    gradientClass = 'gradient-purple-bg text-purple-500';
  } else if (title === 'Budgeting') {
    gradientClass = 'gradient-red-bg text-red-500';
  } else {
    gradientClass = 'gradient-green-bg text-green-500';
  }
  
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col items-center text-center">
      <div className={`feature-icon-container ${gradientClass} mb-4`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </div>
  );
};

const UploadScriptTab: React.FC = () => {
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [scriptText, setScriptText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  
  const { updateScriptData } = useScriptData();

  // Add offline detection from oldpage.jsx
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      setUploadMode('file');
      setError(null); // Clear any previous errors
    }
  };

  const handleScriptTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setScriptText(e.target.value);
    if (e.target.value.trim() !== '') {
      setUploadMode('text');
      setError(null); // Clear any previous errors
    }
  };

  const createBasicScriptData = (content: string): ScriptData => ({
    metadata: {
      global_requirements: {
        equipment: [],
        props: [],
        special_effects: []
      },
      scene_metadata: [{
        scene_number: 1,
        lighting: {
          type: 'natural',
          requirements: []
        },
        props: {},
        technical: {},
        department_notes: {}
      }]
    },
    parsed_data: {
      scenes: [{
        scene_number: 1,
        scene_id: '1',
        location: {
          place: 'UNKNOWN'
        },
        description: content.slice(0, 100) + '...',
        technical_cues: [],
        department_notes: {},
        main_characters: [],
        complexity_score: 1
      }],
      timeline: {
        total_duration: '0',
        average_scene_duration: 0,
        total_pages: 1,
        scene_breakdown: [{
          scene_number: 1,
          start_time: '00:00',
          end_time: '00:05',
          location: 'UNKNOWN',
          characters: [],
          technical_complexity: 1,
          setup_time: 30
        }]
      }
    },
    validation: {
      validation_report: {
        technical_validation: {
          department_conflicts: []
        }
      }
    },
    characters: {
      UNKNOWN: {
        name: 'UNKNOWN',
        description: 'Default character',
        traits: [],
        relationships: []
      }
    }
  });

  const handleScriptSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (uploadMode === 'file' && file) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('validation_level', 'lenient');

        try {
          const response = await fetch(`${API_URL}/script/upload`, {
            method: 'POST',
            body: formData,
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error);
          }

          // Save to local storage like oldpage.jsx
          localStorage.setItem(STORAGE_KEYS.SCRIPT_DATA, JSON.stringify(result.data));
          
          // Update context
          updateScriptData(result.data);
          setSuccess('Script uploaded and analyzed successfully!');
          toast.success('Script uploaded and processed successfully!');
        } catch (apiError) {
          console.warn('API call failed, using local storage:', apiError);
          
          // Process the file locally if API fails (from oldpage.jsx)
          const reader = new FileReader();
          reader.onload = async (e) => {
            const text = e.target.result;
            const content = typeof text === 'string' ? text : '';
            const basicData = createBasicScriptData(content);
            
            localStorage.setItem(STORAGE_KEYS.SCRIPT_DATA, JSON.stringify(basicData));
            updateScriptData(basicData);
            setSuccess('Script saved locally (offline mode)');
            toast.success('Script saved locally (offline mode)');
          };
          reader.readAsText(file);
        }
      } else if (uploadMode === 'text' && scriptText) {
        try {
          const response = await fetch(`${API_URL}/script/text`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              script: scriptText,
              validation_level: 'lenient'
            }),
          });

          const result = await response.json();

          if (!result.success) {
            throw new Error(result.error);
          }

          // Save to local storage
          localStorage.setItem(STORAGE_KEYS.SCRIPT_DATA, JSON.stringify(result.data));
          
          // Update context
          updateScriptData(result.data);
          setSuccess('Script analyzed successfully!');
          toast.success('Script text processed successfully!');
        } catch (apiError) {
          // Handle offline mode for text input
          const basicData = createBasicScriptData(scriptText);
          localStorage.setItem(STORAGE_KEYS.SCRIPT_DATA, JSON.stringify(basicData));
          updateScriptData(basicData);
          setSuccess('Script saved locally (offline mode)');
          toast.success('Script saved locally (offline mode)');
        }
      } else {
        setError('Please provide a script file or text before submitting.');
        toast.error('Please provide a script file or text before submitting.');
      }
    } catch (error) {
      console.error('Error uploading script:', error);
      setError(error.message || 'An error occurred while processing the script.');
      toast.error('An error occurred while processing the script.');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if we can submit the script
  const canSubmitScript = 
    !isLoading && ((uploadMode === 'file' && file) || (uploadMode === 'text' && scriptText.trim() !== ''));

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Show offline warning from oldpage.jsx */}
        {isOffline && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <p className="text-yellow-700">
                You are currently offline. Changes will be saved locally and synced when you're back online.
              </p>
            </div>
          </div>
        )}

        {/* Show error message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Show success message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-green-500" />
              <p className="text-green-700">{success}</p>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-purple-600 mb-3">
            Welcome to Think AI
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Transform your script into a complete production plan with our AI-powered tools
          </p>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <FeatureCard 
            icon={FileText} 
            title="Scene Analysis"
            description="Detailed breakdown of each scene"
          />
          <FeatureCard 
            icon={Calendar} 
            title="Scheduling"
            description="Optimized shooting schedule"
          />
          <FeatureCard 
            icon={BarChart2} 
            title="Budgeting"
            description="Comprehensive budget estimates"
          />
          <FeatureCard 
            icon={Users} 
            title="Characters"
            description="Complete character breakdowns"
          />
        </div>
        
        {/* Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`bg-white border ${uploadMode === 'file' ? 'border-purple-300 ring-1 ring-purple-200' : 'border-gray-100'} shadow-sm rounded-xl p-6`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Upload className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">
                Upload your script file
              </h3>
            </div>
            
            <div 
              className={`border-2 border-dashed ${file ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-gray-50'} rounded-lg p-8 text-center cursor-pointer`}
              onClick={() => document.getElementById('script-upload')?.click()}
            >
              <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2 text-gray-700">Drag & drop your file here</h3>
              <p className="text-gray-500 mb-4">
                or click to browse files
              </p>
              <input
                type="file"
                id="script-upload"
                className="hidden"
                accept=".pdf,.fountain,.fdx,.txt"
                onChange={handleFileUpload}
              />
              <Button
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById('script-upload')?.click();
                }}
              >
                Choose File
              </Button>
              {file && (
                <p className="mt-3 text-green-600">
                  Selected: {file.name}
                </p>
              )}
            </div>
            
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <Info className="h-4 w-4" />
              <span>Supported format: .txt (PDF and DOCX support coming soon)</span>
            </div>
          </div>
          
          <div className={`bg-white border ${uploadMode === 'text' ? 'border-purple-300 ring-1 ring-purple-200' : 'border-gray-100'} shadow-sm rounded-xl p-6`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">
                Or paste your script here
              </h3>
            </div>
            
            <textarea
              className="w-full h-64 bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700 font-mono focus:outline-none focus:ring-1 focus:ring-purple-300 focus:border-purple-300"
              placeholder="Paste your script text here..."
              value={scriptText}
              onChange={handleScriptTextChange}
              onClick={() => setUploadMode('text')}
            ></textarea>
          </div>
        </div>
        
        {/* Updated API Connection Info */}
        <div className="mt-8 bg-white border border-gray-100 shadow-sm rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center text-gray-800">
            <Settings className="h-5 w-5 mr-2 text-gray-600" />
            API Connection Status
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-2 text-sm bg-blue-50 p-3 rounded-md border border-blue-100">
              <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-blue-700">
                <p>API Endpoint: {API_URL}</p>
                <p>Connection Status: {isOffline ? 'Offline (Local Storage Mode)' : 'Online'}</p>
                <p>Storage: Using browser local storage for data persistence</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleScriptSubmit}
            disabled={!canSubmitScript}
            className="px-8 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 rounded-lg text-white font-medium flex items-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Process Script'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadScriptTab;
