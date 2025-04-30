
import React from 'react';
import { FileText, Activity, Plus, Check, AlertTriangle, Clock } from 'lucide-react';

const ProjectOverviewTab: React.FC = () => {
  return (
    <div className="p-6 h-full overflow-y-auto animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-studio-text-primary">
          Project Overview
        </h2>
        
        {/* Project Header */}
        <div className="studio-section mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-medium">Reunion</h3>
            <span className="text-sm bg-studio-accent/20 text-studio-accent px-2 py-1 rounded">
              In Pre-Production
            </span>
          </div>
          
          <p className="text-studio-text-secondary mb-4">
            A short film about former lovers reconnecting after years apart.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-studio-text-secondary">Director</p>
              <p className="font-medium">Alex Johnson</p>
            </div>
            <div>
              <p className="text-studio-text-secondary">Producer</p>
              <p className="font-medium">Sam Taylor</p>
            </div>
            <div>
              <p className="text-studio-text-secondary">Writer</p>
              <p className="font-medium">Jamie Smith</p>
            </div>
            <div>
              <p className="text-studio-text-secondary">Production Date</p>
              <p className="font-medium">June 4-6, 2025</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Script Status */}
          <div className="studio-section">
            <h3 className="text-xl font-medium mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-studio-accent" />
              Script Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-studio-success mr-2" />
                  <span>Script Uploaded</span>
                </div>
                <span className="text-xs bg-studio-success/20 text-studio-success px-2 py-1 rounded">
                  Complete
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-studio-success mr-2" />
                  <span>Script Analysis</span>
                </div>
                <span className="text-xs bg-studio-success/20 text-studio-success px-2 py-1 rounded">
                  Complete
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-studio-success mr-2" />
                  <span>One-Liner Generated</span>
                </div>
                <span className="text-xs bg-studio-success/20 text-studio-success px-2 py-1 rounded">
                  Complete
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-studio-success mr-2" />
                  <span>Character Breakdown</span>
                </div>
                <span className="text-xs bg-studio-success/20 text-studio-success px-2 py-1 rounded">
                  Complete
                </span>
              </div>
              
              <div className="pt-2 pb-1">
                <div className="w-full bg-studio-blue/50 rounded-full h-2">
                  <div className="bg-studio-success h-2 rounded-full w-full"></div>
                </div>
                <p className="text-right text-xs text-studio-text-secondary mt-1">
                  4/4 tasks complete
                </p>
              </div>
            </div>
          </div>
          
          {/* Production Status */}
          <div className="studio-section">
            <h3 className="text-xl font-medium mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-studio-accent" />
              Production Status
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-studio-success mr-2" />
                  <span>Schedule Created</span>
                </div>
                <span className="text-xs bg-studio-success/20 text-studio-success px-2 py-1 rounded">
                  Complete
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Check className="h-4 w-4 text-studio-success mr-2" />
                  <span>Budget Generated</span>
                </div>
                <span className="text-xs bg-studio-success/20 text-studio-success px-2 py-1 rounded">
                  Complete
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-studio-warning mr-2" />
                  <span>Storyboard</span>
                </div>
                <span className="text-xs bg-studio-warning/20 text-studio-warning px-2 py-1 rounded">
                  In Progress
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-studio-text-secondary mr-2" />
                  <span className="text-studio-text-secondary">Call Sheets</span>
                </div>
                <span className="text-xs bg-studio-blue text-studio-text-secondary px-2 py-1 rounded">
                  Pending
                </span>
              </div>
              
              <div className="pt-2 pb-1">
                <div className="w-full bg-studio-blue/50 rounded-full h-2">
                  <div className="bg-studio-success h-2 rounded-full w-2/3"></div>
                </div>
                <p className="text-right text-xs text-studio-text-secondary mt-1">
                  2/4 tasks complete
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="studio-section mt-8">
          <h3 className="text-xl font-medium mb-4 flex items-center">
            <Plus className="h-5 w-5 mr-2 text-studio-accent" />
            Quick Actions
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-studio-blue/40 hover:bg-studio-blue/60 transition-colors rounded-lg text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-studio-accent" />
              <span>Edit Script</span>
            </button>
            
            <button className="p-4 bg-studio-blue/40 hover:bg-studio-blue/60 transition-colors rounded-lg text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-studio-accent" />
              <span>Production Meeting</span>
            </button>
            
            <button className="p-4 bg-studio-blue/40 hover:bg-studio-blue/60 transition-colors rounded-lg text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-studio-accent" />
              <span>Cast Management</span>
            </button>
            
            <button className="p-4 bg-studio-blue/40 hover:bg-studio-blue/60 transition-colors rounded-lg text-center">
              <Download className="h-8 w-8 mx-auto mb-2 text-studio-accent" />
              <span>Export Project</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Import needed icon
import { Users, Download } from 'lucide-react';

export default ProjectOverviewTab;
