
import React, { useState } from 'react';
import { Upload, FileText, Settings, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { uploadScriptFile, analyzeScriptText } from '@/services/scriptApiService';
import { useScriptData } from '@/hooks/useScriptData';
import { Button } from '@/components/ui/button';

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
  
  const { updateScriptData } = useScriptData();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
    }
  };

  const handleScriptSubmit = async () => {
    setIsLoading(true);
    try {
      if (uploadMode === 'file' && file) {
        // Handle file upload with API
        const result = await uploadScriptFile(file);
        
        if (result) {
          // Update context with the script data
          updateScriptData(result);
          toast.success('Script uploaded and processed successfully!');
        }
      } else if (uploadMode === 'text' && scriptText) {
        // Handle text input with API
        const result = await analyzeScriptText(scriptText);
        
        if (result) {
          // Update context with the script data
          updateScriptData(result);
          toast.success('Script text processed successfully!');
        }
      } else {
        toast.error('Please provide a script file or text before submitting.');
      }
    } catch (error) {
      console.error('Error uploading script:', error);
      toast.error('An error occurred while processing the script.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-50 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-purple-600 mb-3">
            Welcome to the Film Production AI Assistant
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
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <Upload className="h-4 w-4 text-purple-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">
                Upload your script file
              </h3>
            </div>
            
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50">
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
                onClick={() => document.getElementById('script-upload')?.click()}
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
          
          <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-6">
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
              onChange={(e) => setScriptText(e.target.value)}
            ></textarea>
          </div>
        </div>
        
        {/* API Connection Info */}
        <div className="mt-8 bg-white border border-gray-100 shadow-sm rounded-xl p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center text-gray-800">
            <Settings className="h-5 w-5 mr-2 text-gray-600" />
            API Connection
          </h3>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-2 text-sm bg-blue-50 p-3 rounded-md border border-blue-100">
              <AlertCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-blue-700">
                Connected to API: https://varun324242-sjuu.hf.space
                <br />
                All data will be stored locally in your browser for persistence between sessions.
              </p>
            </div>
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleScriptSubmit}
            disabled={isLoading || (uploadMode === 'file' && !file) || (uploadMode === 'text' && !scriptText)}
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
