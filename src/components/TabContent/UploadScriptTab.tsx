
import React, { useState } from 'react';
import { Upload, FileText, Settings, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { uploadScriptFile, analyzeScriptText } from '@/services/scriptApiService';

const UploadScriptTab: React.FC = () => {
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [scriptText, setScriptText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
        // Handle file upload with new API
        const result = await uploadScriptFile(file);
        
        if (result) {
          toast.success('Script uploaded and processed successfully!');
        }
      } else if (uploadMode === 'text' && scriptText) {
        // Handle text input with new API
        const result = await analyzeScriptText(scriptText);
        
        if (result) {
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
    <div className="p-6 h-full overflow-y-auto animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-studio-text-primary">
          Upload Your Script
        </h2>
        
        <div className="bg-studio-blue/40 border border-studio-border rounded-lg p-6 mb-8">
          <div className="flex mb-6">
            <button
              onClick={() => setUploadMode('file')}
              className={`flex items-center px-4 py-2 rounded-md mr-4 ${
                uploadMode === 'file'
                  ? 'bg-studio-accent text-white'
                  : 'bg-studio-blue text-studio-text-secondary hover:bg-studio-accent/20'
              }`}
            >
              <Upload className="h-4 w-4 mr-2" />
              File Upload
            </button>
            <button
              onClick={() => setUploadMode('text')}
              className={`flex items-center px-4 py-2 rounded-md ${
                uploadMode === 'text'
                  ? 'bg-studio-accent text-white'
                  : 'bg-studio-blue text-studio-text-secondary hover:bg-studio-accent/20'
              }`}
            >
              <FileText className="h-4 w-4 mr-2" />
              Text Input
            </button>
          </div>
          
          {uploadMode === 'file' ? (
            <div className="border-2 border-dashed border-studio-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-studio-text-secondary" />
              <h3 className="text-lg font-medium mb-2">Drag and drop your script file</h3>
              <p className="text-studio-text-secondary mb-4">
                or click to browse your files (PDF, Fountain, or Final Draft)
              </p>
              <input
                type="file"
                id="script-upload"
                className="hidden"
                accept=".pdf,.fountain,.fdx,.txt"
                onChange={handleFileUpload}
              />
              <label
                htmlFor="script-upload"
                className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-studio-accent hover:bg-studio-accent-hover transition-colors text-white cursor-pointer"
              >
                Select File
              </label>
              {file && (
                <p className="mt-3 text-studio-success">
                  Selected: {file.name}
                </p>
              )}
            </div>
          ) : (
            <div>
              <textarea
                className="w-full h-96 bg-studio-dark-blue border border-studio-border rounded-md p-4 text-studio-text-primary font-mono focus:outline-none focus:ring-1 focus:ring-studio-accent/50"
                placeholder="Paste your script text here..."
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
              ></textarea>
            </div>
          )}
          
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              API Connection
            </h3>
            
            <div className="bg-studio-dark-blue p-4 rounded-md border border-studio-border">
              <div className="flex items-start space-x-2 text-sm text-studio-text-secondary bg-studio-accent/10 p-3 rounded-md">
                <AlertCircle className="h-4 w-4 text-studio-accent flex-shrink-0 mt-0.5" />
                <p>
                  Connected to API: https://varun324242-sjuu.hf.space
                  <br />
                  All data will be stored locally in your browser for persistence between sessions.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleScriptSubmit}
              disabled={isLoading || (uploadMode === 'file' && !file) || (uploadMode === 'text' && !scriptText)}
              className="px-6 py-2 bg-studio-accent hover:bg-studio-accent-hover disabled:bg-studio-blue disabled:text-studio-text-secondary rounded-md text-white font-medium flex items-center"
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadScriptTab;
