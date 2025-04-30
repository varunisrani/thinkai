
import React, { useState } from 'react';
import { 
  Upload, FileText, Film, Users, Calendar, BarChart2, 
  Grid, Layout, FileSearch, Settings, Menu, Moon, Sun,
  Database
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  index: number;
}

interface MainSidebarProps {
  activeTab: number;
  setActiveTab: (tab: number) => void;
}

const MainSidebar: React.FC<MainSidebarProps> = ({ activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const sidebarItems: SidebarItem[] = [
    { icon: Upload, label: 'Upload Script', index: 0 },
    { icon: FileText, label: 'Script Analysis', index: 1 },
    { icon: Film, label: 'One-Liner', index: 2 },
    { icon: Users, label: 'Character Breakdown', index: 3 },
    { icon: Calendar, label: 'Schedule', index: 4 },
    { icon: BarChart2, label: 'Budget', index: 5 },
    { icon: Grid, label: 'Storyboard', index: 6 },
    { icon: Layout, label: 'Project Overview', index: 7 }
  ];

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // In a real implementation, this would toggle the theme
  };

  return (
    <div className={cn(
      'h-full flex flex-col bg-white border-r border-gray-100 transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        {!collapsed && (
          <div className="flex items-center">
            <Film className="h-6 w-6 text-purple-600 mr-2" />
            <span className="text-lg font-semibold text-gray-800">
              AI Studio
            </span>
          </div>
        )}
        {collapsed && <Film className="h-6 w-6 text-purple-600 mx-auto" />}
        
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1 rounded-md hover:bg-gray-100"
        >
          <Menu className="h-5 w-5 text-gray-500" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {sidebarItems.map((item) => (
            <button
              key={item.index}
              className={cn(
                'w-full flex items-center px-3 py-2.5 rounded-lg mb-1 transition-colors',
                activeTab === item.index
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
              onClick={() => setActiveTab(item.index)}
            >
              <item.icon className={cn('h-5 w-5 flex-shrink-0', 
                collapsed ? 'mx-auto' : 'mr-3')} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-100 space-y-2">
        <a 
          href="#api-logs" 
          className={cn(
            'flex items-center px-3 py-2 rounded-md transition-colors',
            'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          <Database className={cn('h-5 w-5 flex-shrink-0', 
            collapsed ? 'mx-auto' : 'mr-3')} />
          {!collapsed && <span>API Logs</span>}
        </a>
        
        <button
          onClick={toggleTheme}
          className={cn(
            'flex items-center px-3 py-2 rounded-md w-full transition-colors',
            'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          )}
        >
          {darkMode ? (
            <>
              <Sun className={cn('h-5 w-5 flex-shrink-0', 
                collapsed ? 'mx-auto' : 'mr-3')} />
              {!collapsed && <span>Light Mode</span>}
            </>
          ) : (
            <>
              <Moon className={cn('h-5 w-5 flex-shrink-0', 
                collapsed ? 'mx-auto' : 'mr-3')} />
              {!collapsed && <span>Dark Mode</span>}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MainSidebar;
