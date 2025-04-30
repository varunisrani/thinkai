import React from 'react';
import { Bell, Search, Settings, User } from 'lucide-react';
import { Input } from './ui/input';

const AppHeader: React.FC = () => {
  return (
    <header className="h-16 border-b border-gray-100 bg-white sticky top-0 z-50 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-600 relative">
            <img 
              src="https://api.iconify.design/bx:film.svg?color=white"
              alt="Think AI" 
              className="w-6 h-6 object-contain" 
              onError={(e) => {
                e.currentTarget.src = "https://api.iconify.design/bx:film.svg?color=white";
              }}
            />
          </div>
          <h1 className="text-xl font-semibold text-studio-text-primary">
            Think AI
          </h1>
        </div>
        <div className="ml-6 text-sm px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-100">
          Professional Edition
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input 
            type="text" 
            placeholder="Search..." 
            className="pl-10 pr-4 py-1.5 text-sm focus:outline-none focus:ring-1 w-64 border-gray-200"
          />
        </div>
        
        <button className="p-2 rounded-full hover:bg-gray-100 relative">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        
        <button className="p-2 rounded-full hover:bg-gray-100">
          <Settings className="h-5 w-5 text-gray-500" />
        </button>
        
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
            <User className="h-4 w-4 text-purple-600" />
          </div>
          <span className="text-sm font-medium">User</span>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
