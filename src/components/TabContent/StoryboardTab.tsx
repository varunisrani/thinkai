
import React, { useState } from 'react';
import { Grid, Film, Settings, Download } from 'lucide-react';
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
      'flex items-center px-4 py-2 rounded-md mr-3 transition-colors',
      active ? 'tab-active' : 'tab-inactive'
    )}
  >
    <Icon className="h-4 w-4 mr-2" />
    {label}
  </button>
);

const StoryboardTab: React.FC = () => {
  const [activeSubtab, setActiveSubtab] = useState(0);
  
  const subtabs = [
    { icon: Grid, label: 'Grid View' },
    { icon: Film, label: 'Slideshow' },
    { icon: Settings, label: 'Settings' },
    { icon: Download, label: 'Export' }
  ];
  
  // Sample storyboard frames
  const storyboardFrames = [
    { id: 1, scene: '1', description: 'John walking down city street, checking watch', imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=300' },
    { id: 2, scene: '2', description: 'Sarah waiting at coffee shop table', imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=300' },
    { id: 3, scene: '3', description: 'John enters coffee shop, sees Sarah', imageUrl: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?auto=format&fit=crop&w=300' },
    { id: 4, scene: '4', description: 'John and Sarah walking in park', imageUrl: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=300' },
    { id: 5, scene: '5', description: 'John looking at photo in apartment', imageUrl: 'https://images.unsplash.com/photo-1493397212122-2b85dda8106b?auto=format&fit=crop&w=300' },
  ];
  
  const [currentSlide, setCurrentSlide] = useState(0);

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-studio-border p-4">
        <h2 className="text-2xl font-semibold mb-4 text-studio-text-primary">
          Storyboard
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
          <div className="p-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storyboardFrames.map((frame) => (
                <div key={frame.id} className="bg-studio-blue/40 border border-studio-border rounded-lg overflow-hidden">
                  <div className="relative aspect-video">
                    <img 
                      src={frame.imageUrl} 
                      alt={`Scene ${frame.scene}`} 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 left-2 bg-studio-blue/80 px-2 py-1 rounded text-sm">
                      Scene {frame.scene}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-studio-text-secondary">{frame.description}</p>
                    <div className="mt-3 flex space-x-2">
                      <button className="text-xs px-2 py-1 rounded bg-studio-blue hover:bg-studio-blue/70 text-studio-text-secondary">
                        Edit
                      </button>
                      <button className="text-xs px-2 py-1 rounded bg-studio-blue hover:bg-studio-blue/70 text-studio-text-secondary">
                        Regenerate
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeSubtab === 1 && (
          <div className="p-6 flex flex-col items-center animate-fade-in">
            <div className="w-full max-w-3xl bg-studio-blue/40 border border-studio-border rounded-lg overflow-hidden">
              <div className="relative aspect-video">
                <img 
                  src={storyboardFrames[currentSlide].imageUrl} 
                  alt={`Scene ${storyboardFrames[currentSlide].scene}`} 
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-4 left-4 bg-studio-blue/80 px-3 py-1 rounded-md">
                  Scene {storyboardFrames[currentSlide].scene}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium mb-2">
                  Scene {storyboardFrames[currentSlide].scene}
                </h3>
                <p className="text-studio-text-secondary mb-6">
                  {storyboardFrames[currentSlide].description}
                </p>
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev))}
                    disabled={currentSlide === 0}
                    className="px-4 py-2 rounded-md bg-studio-blue hover:bg-studio-blue/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <div className="text-studio-text-secondary">
                    {currentSlide + 1} / {storyboardFrames.length}
                  </div>
                  
                  <button 
                    onClick={() => setCurrentSlide(prev => (prev < storyboardFrames.length - 1 ? prev + 1 : prev))}
                    disabled={currentSlide === storyboardFrames.length - 1}
                    className="px-4 py-2 rounded-md bg-studio-blue hover:bg-studio-blue/70 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              {storyboardFrames.map((_, index) => (
                <button 
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`mx-1 h-2 w-2 rounded-full ${
                    currentSlide === index ? 'bg-studio-accent' : 'bg-studio-border'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
        
        {activeSubtab === 2 && (
          <div className="p-6 animate-fade-in">
            <div className="max-w-3xl mx-auto studio-section">
              <h3 className="text-xl font-medium mb-4">Storyboard Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-studio-text-secondary">
                    Visual Style
                  </label>
                  <select className="bg-studio-blue border border-studio-border rounded-md px-3 py-2 w-full">
                    <option value="realistic">Realistic</option>
                    <option value="comic">Comic Book</option>
                    <option value="noir">Film Noir</option>
                    <option value="futuristic">Futuristic</option>
                    <option value="minimalist">Minimalist</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-studio-text-secondary">
                    Default Shot Type
                  </label>
                  <select className="bg-studio-blue border border-studio-border rounded-md px-3 py-2 w-full">
                    <option value="MS">Medium Shot (MS)</option>
                    <option value="WS">Wide Shot (WS)</option>
                    <option value="CU">Close-Up (CU)</option>
                    <option value="ECU">Extreme Close-Up (ECU)</option>
                    <option value="LS">Long Shot (LS)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-studio-text-secondary">
                    Default Camera Angle
                  </label>
                  <select className="bg-studio-blue border border-studio-border rounded-md px-3 py-2 w-full">
                    <option value="eye_level">Eye Level</option>
                    <option value="high_angle">High Angle</option>
                    <option value="low_angle">Low Angle</option>
                    <option value="dutch">Dutch Angle</option>
                    <option value="overhead">Overhead</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-studio-text-secondary">
                    Image Resolution
                  </label>
                  <select className="bg-studio-blue border border-studio-border rounded-md px-3 py-2 w-full">
                    <option value="512x512">Standard (512x512)</option>
                    <option value="1024x1024">High (1024x1024)</option>
                    <option value="1024x512">Widescreen (1024x512)</option>
                  </select>
                </div>
                
                <div className="pt-4 border-t border-studio-border flex justify-end">
                  <button className="px-6 py-2 bg-studio-accent hover:bg-studio-accent-hover rounded-md text-white font-medium">
                    Apply Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeSubtab === 3 && (
          <div className="p-6 animate-fade-in">
            <div className="max-w-3xl mx-auto studio-section">
              <h3 className="text-xl font-medium mb-4">Export Storyboard</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-studio-text-secondary">
                    Export Format
                  </label>
                  <select className="bg-studio-blue border border-studio-border rounded-md px-3 py-2 w-full">
                    <option value="pdf">PDF Document</option>
                    <option value="png">PNG Images</option>
                    <option value="video">MP4 Slideshow</option>
                    <option value="pptx">PowerPoint</option>
                  </select>
                </div>
                
                <div>
                  <label className="block mb-2 text-studio-text-secondary">
                    Include
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2 bg-studio-blue border border-studio-border rounded" defaultChecked />
                      Scene numbers
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2 bg-studio-blue border border-studio-border rounded" defaultChecked />
                      Scene descriptions
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2 bg-studio-blue border border-studio-border rounded" defaultChecked />
                      Technical information
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2 bg-studio-blue border border-studio-border rounded" />
                      Character notes
                    </label>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-studio-border flex justify-end">
                  <button className="px-6 py-2 bg-studio-accent hover:bg-studio-accent-hover rounded-md text-white font-medium flex items-center">
                    <Download className="h-4 w-4 mr-2" />
                    Export Storyboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryboardTab;
