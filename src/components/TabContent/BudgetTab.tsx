
import React, { useState } from 'react';
import { 
  DollarSign, PieChart, ArrowDown, ArrowUp, 
  ChevronDown, ChevronUp, Download, Settings 
} from 'lucide-react';

const BudgetTab: React.FC = () => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['personnel']);
  
  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter(c => c !== category));
    } else {
      setExpandedCategories([...expandedCategories, category]);
    }
  };
  
  // Sample budget data
  const budgetData = {
    totalBudget: 250000,
    allocated: 187500,
    remaining: 62500,
    categories: [
      {
        id: 'personnel',
        name: 'Personnel',
        amount: 85000,
        percentage: 34,
        items: [
          { name: 'Director', amount: 15000 },
          { name: 'Producers', amount: 20000 },
          { name: 'Cast', amount: 30000 },
          { name: 'Crew', amount: 20000 }
        ]
      },
      {
        id: 'production',
        name: 'Production',
        amount: 45000,
        percentage: 18,
        items: [
          { name: 'Equipment Rental', amount: 15000 },
          { name: 'Set Design', amount: 10000 },
          { name: 'Props', amount: 5000 },
          { name: 'Costumes', amount: 5000 },
          { name: 'Makeup', amount: 5000 },
          { name: 'Special Effects', amount: 5000 }
        ]
      },
      {
        id: 'postproduction',
        name: 'Post-Production',
        amount: 30000,
        percentage: 12,
        items: [
          { name: 'Editing', amount: 10000 },
          { name: 'Sound Design', amount: 5000 },
          { name: 'Music', amount: 5000 },
          { name: 'Visual Effects', amount: 10000 }
        ]
      },
      {
        id: 'location',
        name: 'Location',
        amount: 27500,
        percentage: 11,
        items: [
          { name: 'Location Fees', amount: 15000 },
          { name: 'Permits', amount: 5000 },
          { name: 'Security', amount: 2500 },
          { name: 'Cleaning', amount: 5000 }
        ]
      }
    ]
  };

  return (
    <div className="p-6 h-full overflow-y-auto animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-studio-text-primary">
            Production Budget
          </h2>
          
          <div className="flex space-x-2">
            <button className="flex items-center px-4 py-2 rounded-md bg-studio-blue hover:bg-studio-blue/70 text-studio-text-secondary">
              <Settings className="h-4 w-4 mr-2" />
              Budget Settings
            </button>
            <button className="flex items-center px-4 py-2 rounded-md bg-studio-blue hover:bg-studio-blue/70 text-studio-text-secondary">
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
        
        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="studio-section flex items-center">
            <div className="h-12 w-12 rounded-full bg-studio-highlight/20 flex items-center justify-center text-studio-highlight mr-4">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-studio-text-secondary text-sm">Total Budget</p>
              <p className="text-xl font-semibold text-studio-text-primary">
                ${budgetData.totalBudget.toLocaleString()}
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
                ${budgetData.allocated.toLocaleString()} 
                <span className="text-sm text-studio-text-secondary ml-1">
                  ({Math.round(budgetData.allocated / budgetData.totalBudget * 100)}%)
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
                ${budgetData.remaining.toLocaleString()}
                <span className="text-sm text-studio-text-secondary ml-1">
                  ({Math.round(budgetData.remaining / budgetData.totalBudget * 100)}%)
                </span>
              </p>
            </div>
          </div>
        </div>
        
        {/* Budget Chart */}
        <div className="studio-section mb-8">
          <h3 className="text-xl font-medium mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-studio-accent" />
            Budget Allocation
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-studio-blue/40 rounded-md flex items-center justify-center">
              <p className="text-studio-text-secondary">Budget Chart Visualization</p>
            </div>
            
            <div className="space-y-4">
              {budgetData.categories.map(category => (
                <div key={category.id} className="flex items-center">
                  <div className="w-2 h-12 bg-studio-accent rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-studio-text-primary">${category.amount.toLocaleString()}</div>
                    </div>
                    <div className="mt-1 flex justify-between text-sm text-studio-text-secondary">
                      <div className="flex-1">
                        <div className="w-full bg-studio-blue/50 rounded-full h-1.5">
                          <div 
                            className="bg-studio-accent h-1.5 rounded-full" 
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="ml-2">{category.percentage}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Detailed Budget */}
        <div className="studio-section">
          <h3 className="text-xl font-medium mb-4">Budget Details</h3>
          
          <div className="space-y-4">
            {budgetData.categories.map(category => (
              <div 
                key={category.id} 
                className="bg-studio-blue/40 border border-studio-border rounded-lg overflow-hidden"
              >
                <button 
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center">
                    <div className="w-1 h-8 bg-studio-accent rounded-full mr-3"></div>
                    <div>
                      <h4 className="font-medium">{category.name}</h4>
                      <p className="text-sm text-studio-text-secondary">
                        {category.percentage}% of total budget
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-4 text-right">
                      <p className="font-medium">${category.amount.toLocaleString()}</p>
                    </div>
                    {expandedCategories.includes(category.id) ? (
                      <ChevronUp className="h-5 w-5 text-studio-text-secondary" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-studio-text-secondary" />
                    )}
                  </div>
                </button>
                
                {expandedCategories.includes(category.id) && (
                  <div className="border-t border-studio-border">
                    <table className="w-full">
                      <tbody>
                        {category.items.map((item, i) => (
                          <tr key={i} className="border-b border-studio-border/30 last:border-b-0">
                            <td className="p-3 pl-8">{item.name}</td>
                            <td className="p-3 text-right">${item.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTab;
