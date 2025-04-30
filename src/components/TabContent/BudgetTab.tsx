import React, { useState, useEffect } from 'react';
import { 
  DollarSign, PieChart, ArrowDown, ArrowUp, 
  ChevronDown, ChevronUp, Download, Settings,
  RefreshCw, AlertCircle, Sliders, Users, Wrench as Tool,
  MapPin, Truck, Shield
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

type BudgetTabSection = 'summary' | 'locations' | 'equipment' | 'personnel' | 'logistics' | 'insurance' | 'optimization';

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
  const [error, setError] = useState<string | null>(null);
  const [budgetQualityLevel, setBudgetQualityLevel] = useState('Medium');
  const [equipmentPreference, setEquipmentPreference] = useState('Standard');
  const [crewSize, setCrewSize] = useState('Medium');
  const [targetBudget, setTargetBudget] = useState(0);
  const [activeTab, setActiveTab] = useState<BudgetTabSection>('summary');
  const [showSettings, setShowSettings] = useState(false);
  const [budgetResponse, setBudgetResponse] = useState<BudgetData | null>(null);

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
      logDebug('Generate budget failed - Missing required data', {
        hasScriptData: !!scriptData,
        hasCharacterData: !!characterData,
        hasScheduleData: !!scheduleData
      });
      toast.error('Please complete all previous steps first');
      return;
    }

    logDebug('Starting budget generation...');
    setLoading(true);
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

      // Make sure data is saved to localStorage properly
      logDebug('Saving budget data to localStorage and context');
      saveToStorage('BUDGET_DATA', result.data);
      setBudgetResponse(result.data);
      updateBudgetData(result.data);
      toast.success('Budget generated successfully!');

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
      logDebug('Budget generation completed');
    }
  };

  const handleOptimizeBudget = async (scenario: string) => {
    if (!budgetData) {
      console.warn('No budget data available for optimization');
      return;
    }

    setLoading(true);
    try {
      // Prepare scenario constraints
      const scenarioConstraints = {
        quality_impact_tolerance: 0.5, // 50%
        timeline_flexibility: 5, // 5 days
        risk_tolerance: "medium",
        original_constraints: {
          quality_level: budgetQualityLevel,
          equipment_preference: equipmentPreference,
          crew_size: crewSize
        }
      };

      const requestBody = {
        scenario_constraints: scenarioConstraints,
        scenario: scenario
      };

      console.group('Budget Optimization - API Request');
      console.log('Endpoint:', `${API_BASE_URL}/budget/optimize`);
      console.log('Scenario:', scenario);
      console.log('Request Body:', requestBody);
      console.groupEnd();

      logDebug('Making optimization request:', requestBody);

      const response = await fetch(`${API_BASE_URL}/budget/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      console.group('Budget Optimization - API Response');
      console.log('Status:', response.status);
      console.log('Status Text:', response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      console.groupEnd();

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      console.group('Budget Optimization - Response Data');
      console.log('Success:', result.success);
      console.log('Data:', result.data);
      if (!result.success) console.error('Error:', result.error);
      console.groupEnd();

      if (!result.success) {
        throw new Error(result.error || 'Unknown API error');
      }

      // Update budget data with scenario results
      const updatedBudgetData = {
        ...budgetData,
        scenario_results: result.data
      };

      console.log('Updating budget data with optimization results:', updatedBudgetData);
      updateBudgetData(updatedBudgetData);

      toast.success('Budget optimization completed!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to optimize budget';
      console.error('Budget optimization error:', err);
      setError(errorMessage);
      toast.error(errorMessage);
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

  return (
    <div className="p-6 h-full overflow-y-auto animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-studio-text-primary">
            Production Budget
          </h2>
          
          <div className="flex items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('summary')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium',
                  activeTab === 'summary' 
                    ? 'bg-studio-accent text-white' 
                    : 'bg-studio-blue/40 text-studio-text-secondary hover:bg-studio-blue/60'
                )}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('locations')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium',
                  activeTab === 'locations'
                    ? 'bg-studio-accent text-white'
                    : 'bg-studio-blue/40 text-studio-text-secondary hover:bg-studio-blue/60'
                )}
              >
                Locations
              </button>
              <button
                onClick={() => setActiveTab('equipment')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium',
                  activeTab === 'equipment'
                    ? 'bg-studio-accent text-white'
                    : 'bg-studio-blue/40 text-studio-text-secondary hover:bg-studio-blue/60'
                )}
              >
                Equipment
              </button>
              <button
                onClick={() => setActiveTab('personnel')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium',
                  activeTab === 'personnel'
                    ? 'bg-studio-accent text-white'
                    : 'bg-studio-blue/40 text-studio-text-secondary hover:bg-studio-blue/60'
                )}
              >
                Personnel
              </button>
              <button
                onClick={() => setActiveTab('logistics')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium',
                  activeTab === 'logistics'
                    ? 'bg-studio-accent text-white'
                    : 'bg-studio-blue/40 text-studio-text-secondary hover:bg-studio-blue/60'
                )}
              >
                Logistics
              </button>
              <button
                onClick={() => setActiveTab('insurance')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium',
                  activeTab === 'insurance'
                    ? 'bg-studio-accent text-white'
                    : 'bg-studio-blue/40 text-studio-text-secondary hover:bg-studio-blue/60'
                )}
              >
                Insurance
              </button>
              <button
                onClick={() => setActiveTab('optimization')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium',
                  activeTab === 'optimization'
                    ? 'bg-studio-accent text-white'
                    : 'bg-studio-blue/40 text-studio-text-secondary hover:bg-studio-blue/60'
                )}
              >
                Optimization
              </button>
            </div>
          
          <div className="flex space-x-2">
              <button 
                onClick={() => setShowSettings(true)}
                className="flex items-center px-3 py-1.5 rounded-md bg-studio-blue/40 text-studio-text-secondary hover:bg-studio-blue/60"
              >
                <Settings className="h-4 w-4 mr-1" />
                Settings
              </button>
              <button 
                onClick={handleGenerateBudget}
                disabled={loading}
                className="flex items-center px-3 py-1.5 rounded-md bg-studio-accent text-white hover:bg-studio-accent-dark disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {loading ? 'Regenerating...' : 'Regenerate'}
            </button>
              <button 
                onClick={() => {
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
                }}
                className="flex items-center px-3 py-1.5 rounded-md bg-studio-blue/40 text-studio-text-secondary hover:bg-studio-blue/60"
              >
                <Download className="h-4 w-4 mr-1" />
                Export
            </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {/* Budget Summary Cards - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="studio-section flex items-center">
            <div className="h-12 w-12 rounded-full bg-studio-highlight/20 flex items-center justify-center text-studio-highlight mr-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-studio-text-secondary text-sm">Total Budget</p>
              <p className="text-xl font-semibold text-studio-text-primary">
                {formatCurrency(totalBudget)}
              </p>
            </div>
          </div>
          
          <div className="studio-section flex items-center">
            <div className="h-12 w-12 rounded-full bg-studio-accent/20 flex items-center justify-center text-studio-accent mr-4">
              <ArrowDown className="h-6 w-6" />
            </div>
            <div>
              <p className="text-studio-text-secondary text-sm">Allocated</p>
              <p className="text-xl font-semibold text-studio-text-primary">
                {formatCurrency(allocatedBudget)}
                <span className="text-sm text-studio-text-secondary ml-1">
                  ({calculatePercentage(allocatedBudget, totalBudget)}%)
                </span>
              </p>
            </div>
          </div>
          
          <div className="studio-section flex items-center">
            <div className="h-12 w-12 rounded-full bg-studio-success/20 flex items-center justify-center text-studio-success mr-4">
              <ArrowUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-studio-text-secondary text-sm">Remaining</p>
              <p className="text-xl font-semibold text-studio-text-primary">
                {formatCurrency(remainingBudget)}
                <span className="text-sm text-studio-text-secondary ml-1">
                  ({calculatePercentage(remainingBudget, totalBudget)}%)
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
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
          <button
            onClick={() => setActiveTab('optimization')}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-t-lg',
              activeTab === 'optimization'
                ? 'bg-studio-accent text-white'
                : 'text-studio-text-secondary hover:bg-studio-blue/20'
            )}
          >
            Optimization
          </button>
        </div>

        {/* Tab Content */}
        <div className="studio-section">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-studio-blue/40 p-4 rounded-lg">
                  <p className="text-sm text-studio-text-secondary">Total Days</p>
                  <p className="text-xl font-semibold">{budgetResponse?.summary?.total_days ?? 0}</p>
                </div>
                <div className="bg-studio-blue/40 p-4 rounded-lg">
                  <p className="text-sm text-studio-text-secondary">Locations</p>
                  <p className="text-xl font-semibold">
                    {(budgetResponse as BudgetData)?.summary?.total_locations ?? 0}
                  </p>
                </div>
                <div className="bg-studio-blue/40 p-4 rounded-lg">
                  <p className="text-sm text-studio-text-secondary">Crew Size</p>
                  <p className="text-xl font-semibold">{budgetResponse?.summary?.total_crew ?? 0}</p>
                </div>
                <div className="bg-studio-blue/40 p-4 rounded-lg">
                  <p className="text-sm text-studio-text-secondary">Cost per Day</p>
                  <p className="text-xl font-semibold">{formatCurrency(budgetResponse?.summary?.cost_per_day ?? 0)}</p>
                </div>
              </div>

              {/* Total Estimates */}
              <div className="bg-studio-blue/40 p-6 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Total Estimates</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total Location Costs</span>
                    <span>{formatCurrency((budgetResponse as BudgetData).total_estimates?.total_location_costs ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Equipment Costs</span>
                    <span>{formatCurrency((budgetResponse as BudgetData).total_estimates?.total_equipment_costs ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Personnel Costs</span>
                    <span>{formatCurrency((budgetResponse as BudgetData).total_estimates?.total_personnel_costs ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Logistics Costs</span>
                    <span>{formatCurrency((budgetResponse as BudgetData).total_estimates?.total_logistics_costs ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Insurance Costs</span>
                    <span>{formatCurrency((budgetResponse as BudgetData).total_estimates?.total_insurance_costs ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Contingency Amount</span>
                    <span>{formatCurrency((budgetResponse as BudgetData).total_estimates?.contingency_amount ?? 0)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg mt-4 pt-4 border-t border-studio-border">
                    <span>Grand Total</span>
                    <span>{formatCurrency((budgetResponse as BudgetData).total_estimates?.grand_total ?? 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="space-y-4">
              {Object.entries(getBudgetSectionData(budgetResponse.location_costs)).map(([location, data]) => (
                <div key={location} className="bg-studio-blue/40 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{location}</h4>
                    <span>{formatCurrency(data.total_cost)}</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    <div className="flex justify-between text-sm text-studio-text-secondary">
                      <span>Daily Rate</span>
                      <span>{formatCurrency(data.daily_rate ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-studio-text-secondary">
                      <span>Permit Costs</span>
                      <span>{formatCurrency(data.permit_costs ?? 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-studio-text-secondary">
                      <span>Total Days</span>
                      <span>{data.total_days ?? 0}</span>
                    </div>
                    {data.additional_fees && data.additional_fees.length > 0 && (
                      <div className="text-sm text-studio-text-secondary">
                        <span>Additional Fees:</span>
                        <ul className="list-disc list-inside mt-1">
                          {data.additional_fees.map((fee, index) => (
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
            <div className="space-y-4">
              {Object.entries(getBudgetSectionData(budgetResponse.equipment_costs)).map(([category, data]) => (
                <div key={category} className="bg-studio-blue/40 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">{category}</h4>
                    <span>{formatCurrency(data.total_cost)}</span>
                  </div>
                  <div className="space-y-2 mt-2">
                    {data.items && (
                      <div className="text-sm text-studio-text-secondary">
                        <span>Items:</span>
                        <ul className="list-disc list-inside mt-1">
                          {data.items.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {data.rental_rates && Object.entries(data.rental_rates).length > 0 && (
                      <div className="mt-2">
                        <span className="text-sm text-studio-text-secondary">Rental Rates:</span>
                        <div className="space-y-1 mt-1">
                          {Object.entries(data.rental_rates).map(([item, rate]) => (
                            <div key={item} className="flex justify-between text-sm text-studio-text-secondary">
                              <span>{item}</span>
                              <span>{formatCurrency(rate)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {data.insurance_costs && (
                      <div className="flex justify-between text-sm text-studio-text-secondary">
                        <span>Insurance Costs</span>
                        <span>{formatCurrency(data.insurance_costs)}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'personnel' && (
            <div className="space-y-4">
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
            <div className="space-y-4">
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
            <div className="space-y-4">
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

          {activeTab === 'optimization' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleOptimizeBudget('cost_reduction')}
                  className="p-4 bg-studio-blue/40 rounded-lg hover:bg-studio-blue/60 transition-colors"
                >
                  <DollarSign className="h-8 w-8 mb-2 text-studio-accent" />
                  <h4 className="font-medium mb-1">Cost Reduction</h4>
                  <p className="text-sm text-studio-text-secondary">
                    Find areas to reduce costs while minimizing impact
                  </p>
                </button>

                <button
                  onClick={() => handleOptimizeBudget('quality_improvement')}
                  className="p-4 bg-studio-blue/40 rounded-lg hover:bg-studio-blue/60 transition-colors"
                >
                  <Tool className="h-8 w-8 mb-2 text-studio-accent" />
                  <h4 className="font-medium mb-1">Quality Improvement</h4>
                  <p className="text-sm text-studio-text-secondary">
                    Optimize budget allocation for better quality
                  </p>
                </button>

                <button
                  onClick={() => handleOptimizeBudget('resource_efficiency')}
                  className="p-4 bg-studio-blue/40 rounded-lg hover:bg-studio-blue/60 transition-colors"
                >
                  <Users className="h-8 w-8 mb-2 text-studio-accent" />
                  <h4 className="font-medium mb-1">Resource Efficiency</h4>
                  <p className="text-sm text-studio-text-secondary">
                    Improve resource allocation and utilization
                  </p>
                </button>
              </div>

              {(budgetData as unknown as BudgetData).scenario_results && (
                <div>
                  <h3 className="text-xl font-medium mb-4">Optimization Results</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Cost Savings</h4>
                        <p className="text-2xl font-semibold text-studio-accent">
                          {formatCurrency((budgetData as unknown as BudgetData).scenario_results.cost_savings)}
                        </p>
                      </div>
                      <div className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Quality Impact</h4>
                        <p className="text-2xl font-semibold text-studio-accent">
                          {(budgetData as unknown as BudgetData).scenario_results.quality_impact}%
                        </p>
                      </div>
                    </div>
                    <div className="bg-studio-blue/40 border border-studio-border p-4 rounded-lg">
                      <h4 className="font-medium mb-4">Recommendations</h4>
                      <div className="space-y-3">
                        {(budgetData as unknown as BudgetData).scenario_results.recommendations.map((rec, index) => (
                          <div key={index} className="bg-studio-blue/20 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{rec.category}</span>
                              <div className="text-right">
                                <span className="text-sm text-studio-text-secondary">Impact:</span>
                                <div>
                                  <span className="text-studio-accent">{formatCurrency(rec.impact.cost)}</span>
                                  <span className="text-studio-text-secondary mx-1">|</span>
                                  <span className="text-studio-success">{rec.impact.quality}%</span>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-studio-text-secondary">{rec.action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
