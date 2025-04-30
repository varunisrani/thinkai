import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
import { useScriptData } from '@/hooks/useScriptData';
import type { OneLinerData } from '@/types/script';
import { toast } from 'sonner';

// API endpoint constant
const API_URL = 'https://varun324242-sjuu.hf.space/api';

// Debug logging helper
const logDebug = (message: string, data?: unknown) => {
  console.log(`[OneLinerTab] ${message}`, data || '');
};

const OneLinerTab: React.FC = () => {
  const {
    scriptData,
    oneLinerData,
    updateOneLinerData,
    setActiveTab,
    canProceedToTab
  } = useScriptData();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Log initial mount
  useEffect(() => {
    logDebug('Component mounted');
    
    // Check localStorage on mount
    try {
      const keys = ['SCRIPT_DATA', 'ONE_LINER_DATA'];
      const storageState: Record<string, unknown> = {};
      
      keys.forEach(key => {
        const value = localStorage.getItem(key);
        storageState[key] = value ? 'Present' : 'Not found';
        if (value) {
          try {
            const parsed = JSON.parse(value);
            logDebug(`${key} content:`, parsed);
          } catch (err) {
            logDebug(`Error parsing ${key}:`, err);
          }
        }
      });
      
      logDebug('LocalStorage state:', storageState);
    } catch (err) {
      logDebug('Error accessing localStorage:', err);
    }

    // Load one-liner data from localStorage if not in context
    if (!oneLinerData) {
      logDebug('No one-liner data in context, checking localStorage...');
      try {
        const storedOneLinerData = localStorage.getItem('ONE_LINER_DATA');
        if (storedOneLinerData) {
          logDebug('Found one-liner data in localStorage');
          try {
            const parsedData = JSON.parse(storedOneLinerData);
            logDebug('Successfully parsed localStorage one-liner data:', parsedData);
            // Update context with data from localStorage
            updateOneLinerData(parsedData);
            logDebug('Updated context with one-liner data from localStorage');
          } catch (parseErr) {
            logDebug('Error parsing localStorage one-liner data:', parseErr);
          }
        } else {
          logDebug('No one-liner data found in localStorage');
        }
      } catch (err) {
        logDebug('Error accessing localStorage for one-liner data:', err);
      }
    }
  }, [oneLinerData, updateOneLinerData]);

  // Log component state changes
  useEffect(() => {
    logDebug('State updated:', {
      hasScriptData: !!scriptData,
      scriptDataType: scriptData ? typeof scriptData : 'null',
      hasOneLinerData: !!oneLinerData,
      oneLinerDataType: oneLinerData ? typeof oneLinerData : 'null',
      isLoading,
      error,
      scriptDataKeys: scriptData ? Object.keys(scriptData) : []
    });
  }, [scriptData, oneLinerData, isLoading, error]);

  // Verify script data on mount and changes
  useEffect(() => {
    if (!scriptData) {
      logDebug('No script data in context, checking localStorage...');
      
      try {
        const storedData = localStorage.getItem('SCRIPT_DATA');
        if (storedData) {
          logDebug('Found script data in localStorage');
          try {
            const parsedData = JSON.parse(storedData);
            logDebug('Successfully parsed localStorage script data:', parsedData);
            setError('Script data found in storage but not loaded in context. Please refresh the page.');
          } catch (parseErr) {
            logDebug('Error parsing localStorage script data:', parseErr);
            setError('Invalid script data in storage. Please try uploading again.');
          }
        } else {
          logDebug('No script data found in localStorage');
          setError('Please upload a script first');
        }
      } catch (err) {
        logDebug('Error accessing localStorage:', err);
        setError('Error accessing local storage. Please check browser settings.');
      }
    } else {
      logDebug('Script data present in context:', {
        type: typeof scriptData,
        keys: Object.keys(scriptData)
      });
      setError(null);
    }
  }, [scriptData]);

  const handleGenerateOneLiner = async () => {
    if (!scriptData) {
      const errorMsg = 'Please upload a script first';
      logDebug('Generate attempted without script data');
      toast.error(errorMsg);
      setError(errorMsg);
      return;
    }

    logDebug('Starting one-liner generation with script data:', {
      scriptDataKeys: Object.keys(scriptData),
      scriptDataSize: JSON.stringify(scriptData).length
    });

    setIsLoading(true);
    setError(null);
    
    try {
      logDebug('Making API request for one-liner analysis');
      
      const response = await fetch(`${API_URL}/one-liner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script_data: scriptData }),
      });

      logDebug('API response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      const result = await response.json();
      logDebug('API result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }

      logDebug('Updating one-liner data with result:', {
        resultKeys: Object.keys(result.data),
        sceneCount: result.data.scenes?.length
      });

      // Update the context state
      updateOneLinerData(result.data);
      
      // Save to localStorage
      try {
        localStorage.setItem('ONE_LINER_DATA', JSON.stringify(result.data));
        logDebug('Successfully saved one-liner data to localStorage');
      } catch (storageError) {
        logDebug('Error saving to localStorage:', storageError);
        // Don't throw here - we still want to update the UI even if storage fails
      }
      
      toast.success('One-liner analysis completed successfully!');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to generate one-liner analysis';
      logDebug('Error in generation:', error);
      toast.error(errorMsg);
      setError(errorMsg);
    } finally {
      setIsLoading(false);
      logDebug('Generation attempt completed');
    }
  };

  const handleExport = () => {
    if (!oneLinerData) {
      logDebug('Export attempted without one-liner data');
      toast.error('No one-liner data available to export');
      return;
    }
    
    try {
      logDebug('Starting export of one-liner data');
      const jsonStr = JSON.stringify(oneLinerData, null, 2);
      logDebug('Prepared export data size:', jsonStr.length);
      
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      logDebug('Created blob URL for download:', url);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'one-liner-analysis.json';
      document.body.appendChild(a);
      a.click();
      
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      logDebug('Export completed successfully');
      toast.success('One-liner analysis exported successfully');
    } catch (err) {
      logDebug('Error during export:', err);
      toast.error('Failed to export one-liner analysis');
    }
  };

  const handleNavigate = (direction: 'back' | 'forward') => {
    const targetTab = direction === 'back' ? 1 : 3; // 1 = Script Analysis, 3 = Character Breakdown
    logDebug('Navigation requested:', { direction, targetTab });
    
    if (canProceedToTab(targetTab)) {
      logDebug('Navigation allowed to tab:', targetTab);
      setActiveTab(targetTab);
    } else {
      logDebug('Navigation blocked - prerequisites not met');
      toast.error('Please complete the previous steps first');
    }
  };

  // If there's an error, show error state
  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-xl font-medium mb-4">{error}</h3>
          <button
            onClick={() => setActiveTab(0)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Go to Upload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-full overflow-y-auto animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-studio-text-primary">
            Script One-Liners
          </h2>
          
          <div className="flex space-x-2">
            {!oneLinerData && (
              <button 
                onClick={handleGenerateOneLiner}
                disabled={isLoading || !scriptData}
                className="flex items-center px-4 py-2 rounded-md bg-studio-accent hover:bg-studio-accent-hover disabled:bg-studio-blue disabled:text-studio-text-secondary text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-1" />
                    Generate
                  </>
                )}
              </button>
            )}
            
            {oneLinerData && (
              <button 
                onClick={handleExport}
                className="flex items-center px-4 py-2 rounded-md bg-studio-blue hover:bg-studio-blue/70 text-studio-text-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            )}
          </div>
        </div>
        
        {!oneLinerData ? (
          <div className="bg-studio-blue/40 border border-studio-border rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-studio-text-secondary" />
            <h3 className="text-lg font-medium mb-2">No One-Liner Analysis Available</h3>
            <p className="text-studio-text-secondary mb-6">
              Generate a one-liner analysis of your script to see concise scene descriptions and an overall summary.
            </p>
            <button
              onClick={handleGenerateOneLiner}
              disabled={isLoading || !scriptData}
              className="px-6 py-2 bg-studio-accent hover:bg-studio-accent-hover disabled:bg-studio-blue disabled:text-studio-text-secondary rounded-md text-white font-medium"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Analyzing...
                </span>
              ) : (
                'Generate One-Liner Analysis'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Summary */}
            <div className="bg-studio-blue/40 border border-studio-border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-3">Overall Summary</h3>
              <p className="text-studio-text-secondary">
                {oneLinerData.overall_summary}
              </p>
            </div>

            {/* Scene One-Liners */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Scene Breakdowns</h3>
              {oneLinerData.scenes.map((scene) => (
                <div 
                  key={scene.scene_number}
                  className="bg-studio-blue/30 border border-studio-border rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">Scene {scene.scene_number}</h4>
                  </div>
                  <p className="text-studio-text-secondary mb-2">{scene.one_liner}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => handleNavigate('back')}
            className="flex items-center px-4 py-2 bg-studio-blue/10 hover:bg-studio-blue/20 rounded-md text-studio-text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Script Analysis
          </button>
          
          <button
            onClick={() => handleNavigate('forward')}
            disabled={!oneLinerData}
            className="flex items-center px-4 py-2 bg-studio-accent hover:bg-studio-accent-hover disabled:bg-studio-blue/50 disabled:hover:bg-studio-blue/50 rounded-md text-white disabled:text-studio-text-secondary"
          >
            Continue to Character Breakdown
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OneLinerTab;
