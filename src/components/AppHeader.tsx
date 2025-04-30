
import React from 'react';
import { Bell, Search, Settings, User } from 'lucide-react';

const AppHeader: React.FC = () => {
  return (
    <header className="h-16 border-b border-studio-border bg-studio-blue/50 backdrop-blur-sm px-6 flex items-center justify-between">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-studio-text-primary">
          Script-to-Screen AI Studio
        </h1>
        <div className="ml-6 text-sm px-3 py-1 rounded-full bg-studio-accent/20 text-studio-accent border border-studio-accent/30">
          Professional Edition
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-studio-text-secondary" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-studio-blue/70 border border-studio-border/50 rounded-md pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-studio-accent/50 w-64"
          />
        </div>
        
        <button className="p-2 rounded-full hover:bg-studio-blue/70 relative">
          <Bell className="h-5 w-5 text-studio-text-secondary" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-studio-highlight rounded-full"></span>
        </button>
        
        <button className="p-2 rounded-full hover:bg-studio-blue/70">
          <Settings className="h-5 w-5 text-studio-text-secondary" />
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-studio-accent/20 flex items-center justify-center">
            <User className="h-4 w-4 text-studio-accent" />
          </div>
          <span className="text-sm font-medium">User</span>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
