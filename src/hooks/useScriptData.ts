
import { useContext } from 'react';
import { ScriptDataContext } from '@/pages/Index';

// Custom hook to access the script data context
export function useScriptData() {
  const context = useContext(ScriptDataContext);
  if (context === undefined) {
    throw new Error('useScriptData must be used within a ScriptDataProvider');
  }
  return context;
}
