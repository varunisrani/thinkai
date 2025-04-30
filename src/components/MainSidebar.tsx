
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
  const [darkMode, setDarkMode] = useState(true);

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
      'h-full flex flex-col bg-studio-blue border-r border-studio-border transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )}>
      <div className="flex items-center justify-between p-4 border-b border-studio-border">
        {!collapsed && (
          <div className="flex items-center">
            <Film className="h-6 w-6 text-studio-accent mr-2" />
            <span className="text-lg font-semibold text-studio-text-primary">
              AI Studio
            </span>
          </div>
        )}
        {collapsed && <Film className="h-6 w-6 text-studio-accent mx-auto" />}
        
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1 rounded-md hover:bg-studio-blue/50"
        >
          <Menu className="h-5 w-5 text-studio-text-secondary" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {sidebarItems.map((item) => (
            <button
              key={item.index}
              className={cn(
                'w-full flex items-center px-3 py-2.5 rounded-md mb-1 transition-colors',
                activeTab === item.index
                  ? 'bg-studio-accent text-white'
                  : 'text-studio-text-secondary hover:bg-studio-blue/50 hover:text-studio-text-primary'
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
      
      <div className="p-4 border-t border-studio-border space-y-2">
        <a 
          href="#api-logs" 
          className={cn(
            'flex items-center px-3 py-2 rounded-md transition-colors',
            'text-studio-text-secondary hover:bg-studio-blue/50 hover:text-studio-text-primary'
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
            'text-studio-text-secondary hover:bg-studio-blue/50 hover:text-studio-text-primary'
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
