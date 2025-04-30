
import React, { useState, useEffect } from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';
import { generateOneLiner, getOneLinerData, OneLinerData } from '@/services/scriptApiService';
import { toast } from 'sonner';
import { useScriptData } from '@/hooks/useScriptData';

const OneLinerTab: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [oneLinerData, setOneLinerData] = useState<OneLinerData | null>(null);
  const { updateOneLinerData } = useScriptData();
  
  useEffect(() => {
    // Load one-liner data from localStorage on component mount
    const data = getOneLinerData();
    if (data) {
      setOneLinerData(data);
      updateOneLinerData(data);
    }
  }, [updateOneLinerData]);

  const handleGenerateOneLiner = async () => {
    setIsLoading(true);
    try {
      const result = await generateOneLiner();
      if (result) {
        setOneLinerData(result);
        updateOneLinerData(result);
        toast.success('One-liner analysis completed successfully!');
      }
    } catch (error) {
      console.error('Error generating one-liner:', error);
      toast.error('Failed to generate one-liner analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    if (!oneLinerData) return;
    
    // Create a Blob with the JSON data
    const blob = new Blob([JSON.stringify(oneLinerData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = 'one-liner-analysis.json';
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
                disabled={isLoading}
                className="flex items-center px-4 py-2 rounded-md bg-studio-accent hover:bg-studio-accent-hover disabled:bg-studio-blue disabled:text-studio-text-secondary text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Analysis'
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
              disabled={isLoading}
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
          <>
            <div className="studio-section mb-8">
              <h3 className="text-xl font-medium mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-studio-accent" />
                Scene Summaries
              </h3>
              
              <div className="space-y-4">
                {oneLinerData.scenes.map((scene) => (
                  <div 
                    key={scene.scene_id}
                    className="p-4 bg-studio-blue/40 border border-studio-border rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <span className="bg-studio-accent text-white text-xs px-2 py-0.5 rounded-md mr-2">
                          Scene {scene.scene_number}
                        </span>
                      </div>
                    </div>
                    <p className="text-studio-text-primary">
                      {scene.one_liner}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="studio-section">
              <h3 className="text-xl font-medium mb-4">Overall Summary</h3>
              <div className="p-4 bg-studio-blue/40 border border-studio-border rounded-lg">
                <p className="text-studio-text-primary mb-4">
                  {oneLinerData.overall_summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-studio-blue px-2 py-1 rounded-md text-xs text-studio-text-secondary">
                    Summary
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OneLinerTab;
