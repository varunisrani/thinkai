import React, { useState, useContext } from 'react';
import { 
  Upload, FileText, Film, Users, Calendar, BarChart2, 
  Grid, Layout, FileSearch, Settings, Menu, Moon, Sun,
  Database, Trash2, AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from "sonner";
import { clearAllData } from '@/services/scriptApiService';
import { ScriptDataContext } from '@/pages/Index';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [showClearDialog, setShowClearDialog] = useState(false);
  
  // Access context directly
  const { 
    updateScriptData, 
    updateOneLinerData, 
    updateCharacterData, 
    updateScheduleData, 
    updateStoryboardData, 
    updateBudgetData 
  } = useContext(ScriptDataContext);

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

  const clearLocalStorage = () => {
    // Clear all localStorage data using the imported function
    clearAllData();
    
    // Clear any storyboard image caches that might be stored separately
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.includes('storyboard') || 
          key.includes('image') || 
          key.includes('scene') || 
          key.includes('STORYBOARD') || 
          key.includes('IMAGE')) {
        try {
          localStorage.removeItem(key);
          console.log(`Cleared localStorage key: ${key}`);
        } catch (err) {
          console.error(`Error clearing localStorage key ${key}:`, err);
        }
      }
    });

    // Also clear sessionStorage in case any data is cached there
    try {
      sessionStorage.clear();
      console.log('Cleared sessionStorage');
    } catch (err) {
      console.error('Error clearing sessionStorage:', err);
    }
    
    // Reset all application state by setting all data to null
    updateScriptData(null);
    updateOneLinerData(null);
    updateCharacterData(null);
    updateScheduleData(null);
    updateStoryboardData(null);
    if (updateBudgetData) {
      updateBudgetData(null);
    }
    
    // Reset the active tab to the Upload Script tab
    setActiveTab(0);
    
    toast.success("All data has been cleared. You can upload a new script.", {
      duration: 3000,
    });
    
    // Close the dialog
    setShowClearDialog(false);
  };

  return (
    <>
      <div className={cn(
        'h-full flex flex-col bg-white border-r border-gray-100 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {!collapsed && (
            <div className="flex items-center">
              <Film className="h-6 w-6 text-purple-600 mr-2" />
              <span className="text-lg font-semibold text-gray-800">
                Think AI
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
          
          <button
            onClick={() => setShowClearDialog(true)}
            className={cn(
              'flex items-center px-3 py-2 rounded-md w-full transition-colors',
              'text-red-600 hover:bg-red-50'
            )}
          >
            <Trash2 className={cn('h-5 w-5 flex-shrink-0', 
              collapsed ? 'mx-auto' : 'mr-3')} />
            {!collapsed && <span>Clear Storage</span>}
          </button>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" /> 
              Clear All Data
            </AlertDialogTitle>
            <AlertDialogDescription>
              <p className="mb-4">
                Are you sure you want to clear all data? This action will:
              </p>
              <ul className="list-disc pl-5 mb-4 text-sm space-y-1">
                <li>Delete all script data</li>
                <li>Remove all character analyses</li>
                <li>Clear all schedules and budgets</li>
                <li>Delete all generated storyboard images</li>
                <li>Remove any other saved information</li>
              </ul>
              <p className="font-medium text-red-600">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={clearLocalStorage}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Yes, Clear All Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MainSidebar;
