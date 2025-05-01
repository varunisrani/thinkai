import React, { useState, useEffect } from 'react';
import { 
  DollarSign, PieChart, ArrowDown, ArrowUp, 
  ChevronDown, ChevronUp, Download, Settings,
  RefreshCw, AlertCircle, Sliders, Users,
  MapPin, Truck, Shield, Loader2
} from 'lucide-react';
import { useScriptData } from '@/hooks/useScriptData';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { saveToStorage, loadFromStorage } from '@/utils/storage';

// Debug logging helper
const logDebug = (message: string, data?: unknown) => {
  console.log(`[BudgetTab] ${message}`, data || '');
};

// API endpoint
const API_BASE_URL = 'https://varun324242-sjuu.hf.space/api';

interface BudgetTabProps {
  darkMode: boolean;
  apiUrl: string;
}

interface BudgetItem {
  name: string;
  amount: number;
}

interface BudgetCategory {
  id: string;
  name: string;
  amount: number;
  percentage: number;
  items: BudgetItem[];
}

interface BudgetCostBreakdown {
  daily_rate?: number;
  permit_costs?: number;
  additional_fees?: string[];
  total_days?: number;
  total_cost: number;
  items?: string[];
  rental_rates?: { [key: string]: number };
  purchase_costs?: { [key: string]: number };
  insurance_costs?: number;
  overtime_rate?: number;
  benefits?: number;
  rental_vehicle?: number;
  hotel?: number;
  meal_service?: number;
  misc_expenses?: string[];
  type?: number;
}

interface BudgetCostSection {
  [key: string]: BudgetCostBreakdown;
}

interface LogisticsCosts {
  transportation: { rental_vehicle: number };
  accommodation: { hotel: number };
  catering: { meal_service: number };
  misc_expenses: string[];
}

interface InsuranceCosts {
  type: number;
}

interface TotalEstimates {
  total_location_costs: number;
  total_equipment_costs: number;
  total_personnel_costs: number;
  total_logistics_costs: number;
  total_insurance_costs: number;
  contingency_amount: number;
  grand_total: number;
}

interface BudgetSummary {
  total_days: number;
  total_locations: number;
  total_crew: number;
  cost_per_day: number;
}

interface BudgetContingency {
  amount: number;
  percentage: number;
}

interface BudgetScenarioResult {
  cost_savings: number;
  quality_impact: number;
  recommendations: Array<{
    category: string;
    action: string;
    impact: {
      cost: number;
      quality: number;
    };
  }>;
}

interface BudgetData {
  total_budget: number;
  categories: BudgetCategory[];
  location_costs: { [key: string]: BudgetCostBreakdown };
  equipment_costs: { [key: string]: BudgetCostBreakdown };
  personnel_costs: { [key: string]: BudgetCostBreakdown };
  logistics_costs: LogisticsCosts;
  insurance_costs: InsuranceCosts;
  contingency: BudgetContingency;
  total_estimates: TotalEstimates;
  summary: BudgetSummary;
  scenario_results?: BudgetScenarioResult;
}

// Default budget data
const defaultBudgetData: BudgetData = {
  total_budget: 0,
  categories: [],
  location_costs: {},
  equipment_costs: {},
  personnel_costs: {},
  logistics_costs: {
    transportation: { rental_vehicle: 0 },
    accommodation: { hotel: 0 },
    catering: { meal_service: 0 },
    misc_expenses: []
  } as LogisticsCosts,
  insurance_costs: { type: 0 } as InsuranceCosts,
  contingency: { percentage: 0, amount: 0 },
  total_estimates: {
    total_location_costs: 0,
    total_equipment_costs: 0,
    total_personnel_costs: 0,
    total_logistics_costs: 0,
    total_insurance_costs: 0,
    contingency_amount: 0,
    grand_total: 0
  },
  summary: {
    total_days: 0,
    total_locations: 0,
    total_crew: 0,
    cost_per_day: 0
  }
};

type BudgetTabSection = 'summary' | 'locations' | 'equipment' | 'personnel' | 'logistics' | 'insurance';

const BudgetTab: React.FC<BudgetTabProps> = ({ darkMode, apiUrl }) => {
  const { 
    scriptData, 
    oneLinerData, 
    characterData, 
    scheduleData, 
    budgetData, 
    updateBudgetData 
  } = useScriptData();
  
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['personnel']);
  const [loading, setLoading] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [budgetQualityLevel, setBudgetQualityLevel] = useState('Medium');
  const [equipmentPreference, setEquipmentPreference] = useState('Standard');
  const [crewSize, setCrewSize] = useState('Medium');
  const [targetBudget, setTargetBudget] = useState(0);
  const [activeTab, setActiveTab] = useState<BudgetTabSection>('summary');
  const [showSettings, setShowSettings] = useState(false);
  const [budgetResponse, setBudgetResponse] = useState<BudgetData | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Update budgetResponse when budgetData changes
  useEffect(() => {
    if (budgetData) {
      setBudgetResponse(budgetData);
      logDebug('Budget data updated from context:', budgetData);
    }
  }, [budgetData]);

  // Load data from localStorage on initial mount
  useEffect(() => {
    logDebug('Component mounted');
    logDebug('Initial state:', {
      hasScriptData: !!scriptData,
      hasCharacterData: !!characterData,
      hasScheduleData: !!scheduleData,
      hasBudgetData: !!budgetData,
      budgetQualityLevel,
      equipmentPreference,
      crewSize,
      targetBudget,
      activeTab,
      loading
    });

    // If there's no budget data in context, try to load from localStorage
    if (!budgetData) {
      try {
        const storedBudgetData = loadFromStorage<BudgetData>('BUDGET_DATA');
        logDebug('Trying to load budget data from localStorage', storedBudgetData ? 'Found data' : 'No data found');
        
        if (storedBudgetData) {
          setBudgetResponse(storedBudgetData);
          updateBudgetData(storedBudgetData);
          logDebug('Successfully loaded budget data from localStorage');
        }
      } catch (err) {
        logDebug('Error loading budget data from localStorage:', err);
        console.error('Failed to load budget data from localStorage:', err);
      }
    }
  }, [budgetData, updateBudgetData]);

  // Log data changes
  useEffect(() => {
    logDebug('Budget data updated:', budgetData);
  }, [budgetData]);

  // Log settings changes
  useEffect(() => {
    logDebug('Settings updated:', {
      budgetQualityLevel,
      equipmentPreference,
      crewSize,
      targetBudget
    });
  }, [budgetQualityLevel, equipmentPreference, crewSize, targetBudget]);

  // Log tab changes
  useEffect(() => {
    logDebug('Active tab changed:', {
      tab: activeTab
    });
  }, [activeTab]);
  
  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };
  
  const handleGenerateBudget = async () => {
    if (!scriptData || !characterData || !scheduleData) {
      logDebug('Generate budget failed - Missing required data');
      toast.error('Please complete all previous steps first');
      return;
    }

    const isRegeneration = !!budgetData;
    setLoading(true);
    if (isRegeneration) {
      setIsRegenerating(true);
    }
    setError(null);

    try {
      // Prepare production data
      const productionData = {
        script_metadata: scriptData.metadata || {},
        scene_count: scriptData.parsed_data?.scenes?.length || 0,
        character_count: characterData.characters ? Object.keys(characterData.characters).length : 0,
        schedule_days: scheduleData?.schedule?.length || 0,
        quality_level: budgetQualityLevel
      };

      // Prepare location data from schedule
      const locationData = {
        locations: scheduleData?.schedule?.flatMap(day =>
          day.scenes.map(scene => scene.location_id)
        ) || []
      };

      // Prepare crew data
      const crewData = {
        size: crewSize,
        equipment_level: equipmentPreference,
        departments: ["Production", "Camera", "Lighting", "Sound", "Art", "Makeup", "Wardrobe"]
      };

      // Prepare constraints
      const constraints = {
        quality_level: budgetQualityLevel,
        equipment_preference: equipmentPreference,
        crew_size: crewSize,
        schedule_days: scheduleData?.schedule?.length || 0,
        total_scenes: scriptData.parsed_data?.scenes?.length || 0,
        total_characters: characterData.characters ? Object.keys(characterData.characters).length : 0
      };

      const requestBody = {
        script_results: scriptData,
        schedule_results: scheduleData,
        production_data: productionData,
        location_data: locationData,
        crew_data: crewData,
        target_budget: targetBudget > 0 ? targetBudget : undefined,
        constraints: constraints
      };

      logDebug('Making API request with params:', requestBody);

      const response = await fetch(`${API_BASE_URL}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      logDebug('API response received:', {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get('content-type')
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      logDebug('API response data:', result);

      if (!result.success) {
        throw new Error(result.error || 'Unknown API error');
      }

      // Force a re-render if regenerating
      if (isRegeneration) {
        // Temporarily clear the data to force a re-render
        updateBudgetData(null);
        setBudgetResponse(null);
        
        // Wait for a tick to ensure UI updates
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Update storage and data
        saveToStorage('BUDGET_DATA', result.data);
        setBudgetResponse(result.data);
        updateBudgetData(result.data);
        
        // Force component update
        setForceUpdate(prev => prev + 1);

        // Add a small delay before removing regeneration state
        setTimeout(() => {
          setIsRegenerating(false);
        }, 500);
      } else {
        saveToStorage('BUDGET_DATA', result.data);
        setBudgetResponse(result.data);
        updateBudgetData(result.data);
      }

      toast.success(isRegeneration ? 'Budget regenerated successfully!' : 'Budget generated successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate budget';
      logDebug('Error during budget generation:', err);
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Try to load from localStorage as fallback
      try {
        const storedData = loadFromStorage<BudgetData>('BUDGET_DATA');
        if (storedData) {
          logDebug('Found backup data in localStorage');
          setBudgetResponse(storedData);
          updateBudgetData(storedData);
          toast.success('Loaded budget from local storage');
        }
      } catch (storageErr) {
        logDebug('Failed to load backup from localStorage:', storageErr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate section total
  const calculateSectionTotal = (section: BudgetCostSection | undefined) => {
    if (!section) return 0;
    if (typeof section.total === 'number') return section.total;
    if (!section.breakdown) return 0;
    
    return Object.values(section.breakdown).reduce((sum, item) => {
      return sum + (item?.amount || 0);
    }, 0);
  };

  // Helper function to get section color
  const getSectionColor = (section: string) => {
    const colors: { [key: string]: string } = {
      location: 'bg-blue-500',
      equipment: 'bg-green-500',
      personnel: 'bg-yellow-500',
      logistics: 'bg-purple-500',
      insurance: 'bg-red-500',
      contingency: 'bg-gray-500'
    };
    return colors[section.split('_')[0]] || 'bg-gray-500';
  };

  // Calculate totals
  const budgetResponseData = (budgetData || defaultBudgetData) as BudgetData;
  const totalBudget = budgetResponseData.total_budget || 0;
  const allocatedBudget = [
    'location_costs',
    'equipment_costs',
    'personnel_costs',
    'logistics_costs',
    'insurance_costs'
  ].reduce((sum, key) => {
    const section = budgetResponseData[key as keyof BudgetData] as BudgetCostSection;
    return sum + calculateSectionTotal(section);
  }, 0) + (budgetResponseData.contingency?.amount || 0);

  const remainingBudget = Math.max(0, totalBudget - allocatedBudget);

  // If any required data is missing, show appropriate message
  if (!scriptData || !oneLinerData || !characterData || !scheduleData) {
    return (
      <div className="p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-studio-error" />
          <h3 className="text-xl font-medium mb-4">
            {error || 'Please complete all previous steps first'}
          </h3>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-studio-blue text-white rounded-md hover:bg-studio-blue-dark"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If no budget data exists yet, show generate button with settings
  if (!budgetResponse && !budgetData) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold mb-6 text-center">Generate Production Budget</h3>
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="studio-section mb-6">
            <h4 className="text-lg font-medium mb-4 flex items-center">
              <Sliders className="h-5 w-5 mr-2 text-studio-accent" />
              Budget Settings
            </h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quality Level</label>
                <select
                  value={budgetQualityLevel}
                  onChange={(e) => setBudgetQualityLevel(e.target.value)}
                  className="w-full p-2 rounded-md border border-studio-border bg-studio-blue/20"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Equipment Preference</label>
                <select
                  value={equipmentPreference}
                  onChange={(e) => setEquipmentPreference(e.target.value)}
                  className="w-full p-2 rounded-md border border-studio-border bg-studio-blue/20"
                >
                  <option value="Premium">Premium</option>
                  <option value="Standard">Standard</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Crew Size</label>
                <select
                  value={crewSize}
                  onChange={(e) => setCrewSize(e.target.value)}
                  className="w-full p-2 rounded-md border border-studio-border bg-studio-blue/20"
                >
                  <option value="Large">Large</option>
                  <option value="Medium">Medium</option>
                  <option value="Small">Small</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Budget (Optional)</label>
                <input
                  type="number"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(Number(e.target.value))}
                  placeholder="Enter target budget..."
                  className="w-full p-2 rounded-md border border-studio-border bg-studio-blue/20"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleGenerateBudget}
              disabled={loading}
              className="w-full max-w-md py-3 bg-studio-accent text-white rounded-md hover:bg-studio-accent-dark font-medium disabled:opacity-50"
            >
              {loading ? 'Generating Budget...' : 'Generate Budget'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use safe budget data with defaults
  const safeBudgetData = {
    ...defaultBudgetData,
    ...(budgetResponse || budgetData)
  };

  // Format currency with proper decimals
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  // Calculate percentages safely
  const calculatePercentage = (value: number, total: number) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  };

  // Get category color based on type
  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      personnel: 'bg-blue-500',
      equipment: 'bg-green-500',
      locations: 'bg-yellow-500',
      production: 'bg-purple-500',
      postProduction: 'bg-red-500',
      other: 'bg-gray-500'
    };
    return colors[category.toLowerCase()] || colors.other;
  };

  // Update the getBudgetSectionData helper function with stricter typing
  const getBudgetSectionData = (section: unknown): { [key: string]: BudgetCostBreakdown } => {
    if (!section || typeof section !== 'object') return {};
    return section as { [key: string]: BudgetCostBreakdown };
  };

  // Log render state
  logDebug('Rendering with state:', {
    hasScriptData: !!scriptData,
    hasCharacterData: !!characterData,
    hasScheduleData: !!scheduleData,
    hasBudgetData: !!budgetData,
    activeTab,
    loading,
    error,
    settings: {
      budgetQualityLevel,
      equipmentPreference,
      crewSize,
      targetBudget
    }
  });

  const renderRegenerateButton = () => {
    if (!budgetData) return null;

    return (
      <button 
        onClick={handleGenerateBudget}
        disabled={loading || isRegenerating}
        className={cn(
          "flex items-center px-4 py-2 text-sm rounded-md",
          "bg-studio-accent hover:bg-studio-accent/90 disabled:bg-studio-accent/50",
          "text-white transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-studio-accent focus:ring-offset-2",
          "disabled:cursor-not-allowed"
        )}
      >
        {loading || isRegenerating ? (
          <div className="flex items-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>Regenerating...</span>
          </div>
        ) : (
          <div className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span>Regenerate Budget</span>
          </div>
        )}
      </button>
    );
  };

  const renderExportButton = () => {
    const handleExport = () => {
      if (!budgetData) return;
      const jsonStr = JSON.stringify(budgetData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'budget_data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };

    return (
      <button 
        onClick={handleExport}
        className={cn(
          "flex items-center px-4 py-2 text-sm rounded-md",
          "bg-studio-blue/40 hover:bg-studio-blue/60",
          "text-studio-text-secondary transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-studio-blue focus:ring-offset-2"
        )}
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </button>
    );
  };

  const renderLoadingOverlay = () => {
    if (!isRegenerating) return null;

    const getMessage = () => {
      switch (activeTab) {
        case 'summary':
          return 'Updating budget summary...';
        case 'locations':
          return 'Updating location costs...';
        case 'equipment':
          return 'Updating equipment costs...';
        case 'personnel':
          return 'Updating personnel costs...';
        case 'logistics':
          return 'Updating logistics costs...';
        case 'insurance':
          return 'Updating insurance costs...';
        default:
          return 'Updating budget data...';
      }
    };

    return (
      <div className="absolute inset-0 bg-studio-blue/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-studio-accent" />
          <p className="text-sm text-studio-text-secondary">{getMessage()}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 h-full overflow-y-auto animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-studio-text-primary">
              Production Budget
            </h2>
            <p className="text-sm text-studio-text-secondary mt-1">
              Plan and manage your production budget efficiently.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {(budgetData || budgetResponse) && (
              <div className="flex space-x-2">
                <button 
                  onClick={handleGenerateBudget}
                  disabled={loading || isRegenerating}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm rounded-md",
                    "bg-studio-accent hover:bg-studio-accent/90 disabled:bg-studio-accent/50",
                    "text-white transition-colors duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-studio-accent focus:ring-offset-2",
                    "disabled:cursor-not-allowed"
                  )}
                >
                  {loading || isRegenerating ? (
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span>Regenerating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      <span>Regenerate Budget</span>
                    </div>
                  )}
                </button>
                <button 
                  onClick={() => setShowSettings(true)}
                  className={cn(
                    "flex items-center px-4 py-2 text-sm rounded-md",
                    "bg-studio-blue/40 hover:bg-studio-blue/60",
                    "text-studio-text-secondary transition-colors duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-studio-blue focus:ring-offset-2"
                  )}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
                {renderExportButton()}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md" role="alert">
            {error}
          </div>
        )}

        {/* Tab Navigation - Single unified navigation */}
        <div className="flex space-x-1 mb-6 border-b border-studio-border">
          <button
            onClick={() => setActiveTab('summary')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-t-lg',
              activeTab === 'summary'
                ? 'bg-studio-accent text-white'
                : 'text-studio-text-secondary hover:bg-studio-blue/20'
            )}
          >
            Summary
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-t-lg',
              activeTab === 'locations'
                ? 'bg-studio-accent text-white'
                : 'text-studio-text-secondary hover:bg-studio-blue/20'
            )}
          >
            Locations
          </button>
          <button
            onClick={() => setActiveTab('equipment')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-t-lg',
              activeTab === 'equipment'
                ? 'bg-studio-accent text-white'
                : 'text-studio-text-secondary hover:bg-studio-blue/20'
            )}
          >
            Equipment
          </button>
          <button
            onClick={() => setActiveTab('personnel')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-t-lg',
              activeTab === 'personnel'
                ? 'bg-studio-accent text-white'
                : 'text-studio-text-secondary hover:bg-studio-blue/20'
            )}
          >
            Personnel
          </button>
          <button
            onClick={() => setActiveTab('logistics')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-t-lg',
              activeTab === 'logistics'
                ? 'bg-studio-accent text-white'
                : 'text-studio-text-secondary hover:bg-studio-blue/20'
            )}
          >
            Logistics
          </button>
          <button
            onClick={() => setActiveTab('insurance')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-t-lg',
              activeTab === 'insurance'
                ? 'bg-studio-accent text-white'
                : 'text-studio-text-secondary hover:bg-studio-blue/20'
            )}
          >
            Insurance
          </button>
        </div>

        {/* Tab Content */}
        <div className="studio-section relative">
          {renderLoadingOverlay()}

          {activeTab === 'summary' && (
            <div className="space-y-6 relative">
              {isRegenerating && (
                <div className="absolute inset-0 bg-studio-blue/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-studio-accent" />
                    <p className="text-sm text-studio-text-secondary">Updating budget summary...</p>
                  </div>
                </div>
              )}
              {/* Budget Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-studio-blue/40 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Location Costs Overview</h3>
                  <div className="space-y-3">
                    {Object.entries(budgetResponse?.location_costs || {}).map(([location, data]) => (
                      <div key={location} className="flex justify-between text-sm">
                        <span>{location}</span>
                        <span>{formatCurrency((data as BudgetCostBreakdown).total_cost)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-studio-blue/40 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Equipment Costs Overview</h3>
                  <div className="space-y-3">
                    {Object.entries(budgetResponse?.equipment_costs || {}).map(([category, data]) => (
                      <div key={category} className="space-y-2">
                        <div className="flex justify-between font-medium">
                          <span>{category}</span>
                          <span>{formatCurrency((data as BudgetCostBreakdown).total_cost)}</span>
                        </div>
                        {(data as BudgetCostBreakdown).items && (
                          <div className="text-xs text-studio-text-secondary">
                            Items: {(data as BudgetCostBreakdown).items?.join(', ')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logistics & Insurance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-studio-blue/40 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Logistics Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Transportation</span>
                      <span>{formatCurrency(budgetResponse?.logistics_costs?.transportation?.rental_vehicle || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Accommodation</span>
                      <span>{formatCurrency(budgetResponse?.logistics_costs?.accommodation?.hotel || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Catering</span>
                      <span>{formatCurrency(budgetResponse?.logistics_costs?.catering?.meal_service || 0)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-studio-blue/40 p-6 rounded-lg">
                  <h3 className="text-lg font-medium mb-4">Insurance & Contingency</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Insurance Coverage</span>
                      <span>{formatCurrency(budgetResponse?.insurance_costs?.type || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Contingency ({budgetResponse?.contingency?.percentage}%)</span>
                      <span>{formatCurrency(budgetResponse?.contingency?.amount || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Estimates */}
              <div className="bg-studio-blue/40 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Total Estimates</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total Location Costs</span>
                    <span>{formatCurrency(budgetResponse?.total_estimates?.total_location_costs || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Equipment Costs</span>
                    <span>{formatCurrency(budgetResponse?.total_estimates?.total_equipment_costs || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Personnel Costs</span>
                    <span>{formatCurrency(budgetResponse?.total_estimates?.total_personnel_costs || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Logistics Costs</span>
                    <span>{formatCurrency(budgetResponse?.total_estimates?.total_logistics_costs || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Insurance Costs</span>
                    <span>{formatCurrency(budgetResponse?.total_estimates?.total_insurance_costs || 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Contingency Amount</span>
                    <span>{formatCurrency(budgetResponse?.total_estimates?.contingency_amount || 0)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg mt-4 pt-4 border-t border-studio-border">
                    <span>Grand Total</span>
                    <span>{formatCurrency(budgetResponse?.total_estimates?.grand_total || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="space-y-4 relative">
              {isRegenerating && (
                <div className="absolute inset-0 bg-studio-blue/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-studio-accent" />
                    <p className="text-sm text-studio-text-secondary">Updating location costs...</p>
                  </div>
                </div>
              )}
              {Object.entries(budgetResponse?.location_costs || {}).map(([location, data]) => (
                <div key={location} className="bg-studio-blue/40 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-lg">{location}</h4>
                    <span className="text-xl font-semibold">{formatCurrency((data as BudgetCostBreakdown).total_cost)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-studio-text-secondary">Daily Rate:</span>
                        <span className="ml-2">{formatCurrency((data as BudgetCostBreakdown).daily_rate || 0)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-studio-text-secondary">Permit Costs:</span>
                        <span className="ml-2">{formatCurrency((data as BudgetCostBreakdown).permit_costs || 0)}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-studio-text-secondary">Total Days:</span>
                        <span className="ml-2">{(data as BudgetCostBreakdown).total_days || 0}</span>
                      </div>
                    </div>
                    {(data as BudgetCostBreakdown).additional_fees && (
                      <div>
                        <p className="text-sm text-studio-text-secondary mb-1">Additional Fees:</p>
                        <ul className="list-disc list-inside text-sm">
                          {(data as BudgetCostBreakdown).additional_fees?.map((fee, index) => (
                            <li key={index}>{fee}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'equipment' && (
            <div className="space-y-4 relative">
              {isRegenerating && (
                <div className="absolute inset-0 bg-studio-blue/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-studio-accent" />
                    <p className="text-sm text-studio-text-secondary">Updating equipment costs...</p>
                  </div>
                </div>
              )}
              {Object.entries(budgetResponse?.equipment_costs || {}).map(([category, data]) => (
                <div key={category} className="bg-studio-blue/40 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-lg">{category}</h4>
                    <span className="text-xl font-semibold">{formatCurrency((data as BudgetCostBreakdown).total_cost)}</span>
                  </div>
                  <div className="space-y-4">
                    {(data as BudgetCostBreakdown).items && (
                      <div>
                        <p className="text-sm text-studio-text-secondary mb-1">Items:</p>
                        <div className="flex flex-wrap gap-2">
                          {(data as BudgetCostBreakdown).items?.map((item, index) => (
                            <span key={index} className="px-2 py-1 bg-studio-blue/30 rounded text-sm">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(data as BudgetCostBreakdown).rental_rates && (
                      <div>
                        <p className="text-sm text-studio-text-secondary mb-1">Rental Rates:</p>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries((data as BudgetCostBreakdown).rental_rates || {}).map(([item, rate]) => (
                            <div key={item} className="flex justify-between text-sm">
                              <span>{item}:</span>
                              <span>{formatCurrency(rate)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {(data as BudgetCostBreakdown).insurance_costs && (
                      <div className="flex justify-between text-sm">
                        <span className="text-studio-text-secondary">Insurance:</span>
                        <span>{formatCurrency((data as BudgetCostBreakdown).insurance_costs)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'personnel' && (
            <div className="space-y-4 relative">
              {isRegenerating && (
                <div className="absolute inset-0 bg-studio-blue/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-studio-accent" />
                    <p className="text-sm text-studio-text-secondary">Updating personnel costs...</p>
                  </div>
                </div>
              )}
              {Object.entries(getBudgetSectionData(budgetResponse.personnel_costs)).map(([role, data]) => (
                <div key={role} className="bg-studio-blue/40 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{role}</h4>
                    <span>{formatCurrency(data.total_cost)}</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-sm text-studio-text-secondary">
                      <span>Daily Rate</span>
                      <span>{formatCurrency(data.daily_rate ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-studio-text-secondary">
                      <span>Overtime Rate</span>
                      <span>{formatCurrency(data.overtime_rate ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-studio-text-secondary">
                      <span>Total Days</span>
                      <span>{data.total_days ?? 0}</span>
                    </div>
                    <div className="flex justify-between text-sm text-studio-text-secondary">
                      <span>Benefits</span>
                      <span>{formatCurrency(data.benefits ?? 0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'logistics' && (
            <div className="space-y-4 relative">
              {isRegenerating && (
                <div className="absolute inset-0 bg-studio-blue/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-studio-accent" />
                    <p className="text-sm text-studio-text-secondary">Updating logistics costs...</p>
                  </div>
                </div>
              )}
              <div className="bg-studio-blue/40 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Transportation</h4>
                <div className="flex justify-between text-sm text-studio-text-secondary">
                  <span>Rental Vehicle</span>
                  <span>{formatCurrency((budgetResponse.logistics_costs as LogisticsCosts)?.transportation?.rental_vehicle ?? 0)}</span>
                </div>
              </div>
              <div className="bg-studio-blue/40 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Accommodation</h4>
                <div className="flex justify-between text-sm text-studio-text-secondary">
                  <span>Hotel</span>
                  <span>{formatCurrency((budgetResponse.logistics_costs as LogisticsCosts)?.accommodation?.hotel ?? 0)}</span>
                </div>
              </div>
              <div className="bg-studio-blue/40 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Catering</h4>
                <div className="flex justify-between text-sm text-studio-text-secondary">
                  <span>Meal Service</span>
                  <span>{formatCurrency((budgetResponse.logistics_costs as LogisticsCosts)?.catering?.meal_service ?? 0)}</span>
                </div>
              </div>
              {(budgetResponse.logistics_costs as LogisticsCosts)?.misc_expenses && (
                <div className="bg-studio-blue/40 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Miscellaneous Expenses</h4>
                  <ul className="list-disc list-inside text-sm text-studio-text-secondary">
                    {(budgetResponse.logistics_costs as LogisticsCosts).misc_expenses.map((expense, index) => (
                      <li key={index}>{expense}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'insurance' && (
            <div className="space-y-4 relative">
              {isRegenerating && (
                <div className="absolute inset-0 bg-studio-blue/10 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2 text-studio-accent" />
                    <p className="text-sm text-studio-text-secondary">Updating insurance costs...</p>
                  </div>
                </div>
              )}
              <div className="bg-studio-blue/40 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span>Insurance Coverage</span>
                  <span>{formatCurrency((budgetResponse.insurance_costs as InsuranceCosts)?.type ?? 0)}</span>
                </div>
              </div>
              <div className="bg-studio-blue/40 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">Contingency Reserve</h4>
                    <p className="text-sm text-studio-text-secondary">
                      {(budgetResponse as BudgetData)?.contingency?.percentage ?? 0}% of total budget
                    </p>
                  </div>
                  <span>{formatCurrency(budgetResponse?.contingency?.amount ?? 0)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-studio-background rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-medium mb-4">Budget Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Quality Level</label>
                <select
                  value={budgetQualityLevel}
                  onChange={(e) => setBudgetQualityLevel(e.target.value)}
                  className="w-full p-2 rounded-md border border-studio-border bg-studio-blue/20"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Equipment Preference</label>
                <select
                  value={equipmentPreference}
                  onChange={(e) => setEquipmentPreference(e.target.value)}
                  className="w-full p-2 rounded-md border border-studio-border bg-studio-blue/20"
                >
                  <option value="Premium">Premium</option>
                  <option value="Standard">Standard</option>
                  <option value="Basic">Basic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Crew Size</label>
                <select
                  value={crewSize}
                  onChange={(e) => setCrewSize(e.target.value)}
                  className="w-full p-2 rounded-md border border-studio-border bg-studio-blue/20"
                >
                  <option value="Large">Large</option>
                  <option value="Medium">Medium</option>
                  <option value="Small">Small</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Budget</label>
                <input
                  type="number"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(Number(e.target.value))}
                  placeholder="Enter target budget..."
                  className="w-full p-2 rounded-md border border-studio-border bg-studio-blue/20"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 space-x-2">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-md bg-studio-blue/40 text-studio-text-secondary hover:bg-studio-blue/60"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleGenerateBudget();
                  setShowSettings(false);
                }}
                className="px-4 py-2 rounded-md bg-studio-accent text-white hover:bg-studio-accent-dark"
              >
                Apply & Regenerate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetTab;
