import React, { useState } from 'react';
import { 
  Calendar, List, MapPin, Users, Calendar as CalendarIcon, 
  FileText, ChartGantt, FilePieChart, Database
} from 'lucide-react';
import { Tool } from '@/lib/icon-exports'; // Only import Tool from our custom exports
import { cn } from '@/lib/utils';

interface SubtabProps {
  active: boolean;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

const Subtab: React.FC<SubtabProps> = ({ active, icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center px-4 py-2 rounded-md mr-3 transition-colors whitespace-nowrap',
      active ? 'tab-active' : 'tab-inactive'
    )}
  >
    <Icon className="h-4 w-4 mr-2" />
    {label}
  </button>
);

const CalendarViewContent: React.FC = () => {
  // Generate dates for a month view
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Sample shooting days (hardcoded for demo)
  const shootingDays = [4, 5, 6, 10, 11, 12, 17, 18, 19];
  const prepDays = [3, 9, 16];
  
  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-xl font-medium">
          {new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} {currentYear}
        </h3>
        <div className="flex space-x-2">
          <button className="p-2 rounded-md hover:bg-studio-blue text-studio-text-secondary">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="p-2 rounded-md hover:bg-studio-blue text-studio-text-secondary">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-studio-text-secondary font-medium">
            {day}
          </div>
        ))}
        
        {/* Empty cells for days before the 1st of the month */}
        {Array.from({ length: new Date(currentYear, currentMonth, 1).getDay() }, (_, i) => (
          <div key={`empty-${i}`} className="p-2 border border-transparent"></div>
        ))}
        
        {days.map(day => {
          const isShootingDay = shootingDays.includes(day);
          const isPrepDay = prepDays.includes(day);
          const isToday = day === today.getDate();
          
          return (
            <div 
              key={day}
              className={cn(
                "p-2 h-24 border rounded-md relative",
                isShootingDay ? "border-studio-accent/50 bg-studio-accent/10" : 
                isPrepDay ? "border-studio-warning/50 bg-studio-warning/10" :
                "border-studio-border/30",
                isToday ? "ring-2 ring-studio-highlight" : ""
              )}
            >
              <div className="absolute top-1 right-1 text-sm">
                {day}
              </div>
              
              {isShootingDay && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="bg-studio-accent/20 border border-studio-accent/30 rounded px-1 py-0.5 text-xs text-studio-accent">
                    Shooting Day {shootingDays.indexOf(day) + 1}
                  </div>
                </div>
              )}
              
              {isPrepDay && (
                <div className="absolute bottom-1 left-1 right-1">
                  <div className="bg-studio-warning/20 border border-studio-warning/30 rounded px-1 py-0.5 text-xs text-studio-warning">
                    Prep Day
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Import necessary icons
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ScheduleTab: React.FC = () => {
  const [activeSubtab, setActiveSubtab] = useState(0);
  
  const subtabs = [
    { icon: Calendar, label: 'Calendar View' },
    { icon: List, label: 'Schedule List' },
    { icon: MapPin, label: 'Location Plan' },
    { icon: Users, label: 'Crew Allocation' },
    { icon: Tool, label: 'Equipment' },
    { icon: Users, label: 'Department' },
    { icon: FileText, label: 'Call Sheets' },
    { icon: ChartGantt, label: 'Gantt Chart' },
    { icon: FilePieChart, label: 'Summary' },
    { icon: Database, label: 'Raw Data' }
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-studio-border p-4">
        <h2 className="text-2xl font-semibold mb-4 text-studio-text-primary">
          Production Schedule
        </h2>
        
        <div className="flex overflow-x-auto pb-2">
          {subtabs.map((tab, index) => (
            <Subtab
              key={index}
              active={activeSubtab === index}
              icon={tab.icon}
              label={tab.label}
              onClick={() => setActiveSubtab(index)}
            />
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {activeSubtab === 0 && (
          <div className="animate-fade-in">
            <CalendarViewContent />
          </div>
        )}
        
        {activeSubtab === 1 && (
          <div className="p-6 animate-fade-in">
            <div className="studio-section">
              <h3 className="text-xl font-medium mb-4">Schedule List</h3>
              <div className="space-y-4">
                <div className="p-4 bg-studio-blue/40 border border-studio-border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-studio-accent" />
                      <span className="font-medium">Day 1 (June 4, 2025)</span>
                    </div>
                    <span className="text-sm text-studio-text-secondary">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 bg-studio-blue/30 rounded flex justify-between">
                      <div>
                        <span className="text-studio-accent">Scene 1</span>
                        <span className="mx-2 text-studio-text-secondary">|</span>
                        <span>EXT. CITY STREET - DAY</span>
                      </div>
                      <span className="text-sm text-studio-text-secondary">8:00 - 10:30 AM</span>
                    </div>
                    <div className="p-2 bg-studio-blue/30 rounded flex justify-between">
                      <div>
                        <span className="text-studio-accent">Scene 2</span>
                        <span className="mx-2 text-studio-text-secondary">|</span>
                        <span>INT. COFFEE SHOP - DAY</span>
                      </div>
                      <span className="text-sm text-studio-text-secondary">11:30 AM - 2:00 PM</span>
                    </div>
                    <div className="p-2 bg-studio-blue/30 rounded flex justify-between">
                      <div>
                        <span className="text-studio-accent">Scene 3</span>
                        <span className="mx-2 text-studio-text-secondary">|</span>
                        <span>INT. COFFEE SHOP - DAY</span>
                      </div>
                      <span className="text-sm text-studio-text-secondary">2:30 - 6:00 PM</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-studio-blue/40 border border-studio-border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-studio-accent" />
                      <span className="font-medium">Day 2 (June 5, 2025)</span>
                    </div>
                    <span className="text-sm text-studio-text-secondary">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 bg-studio-blue/30 rounded flex justify-between">
                      <div>
                        <span className="text-studio-accent">Scene 4</span>
                        <span className="mx-2 text-studio-text-secondary">|</span>
                        <span>EXT. PARK - DUSK</span>
                      </div>
                      <span className="text-sm text-studio-text-secondary">4:00 - 6:00 PM</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-studio-blue/40 border border-studio-border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-studio-accent" />
                      <span className="font-medium">Day 3 (June 6, 2025)</span>
                    </div>
                    <span className="text-sm text-studio-text-secondary">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 bg-studio-blue/30 rounded flex justify-between">
                      <div>
                        <span className="text-studio-accent">Scene 5</span>
                        <span className="mx-2 text-studio-text-secondary">|</span>
                        <span>INT. JOHN'S APARTMENT - NIGHT</span>
                      </div>
                      <span className="text-sm text-studio-text-secondary">10:00 AM - 2:00 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Placeholders for other tabs */}
        {activeSubtab > 1 && (
          <div className="p-6 animate-fade-in">
            <div className="studio-section">
              <h3 className="text-xl font-medium mb-4">{subtabs[activeSubtab].label}</h3>
              <div className="h-96 bg-studio-blue/40 rounded-md flex items-center justify-center">
                <p className="text-studio-text-secondary text-lg">
                  {subtabs[activeSubtab].label} content would be displayed here
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleTab;
