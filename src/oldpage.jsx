'use client';

import { useState, useCallback, useEffect } from 'react';
// Import custom components
import Box from './components/Box';
import Button from './components/Button';
import Typography from './components/Typography';
import Paper from './components/Paper';
import Alert from './components/Alert';
import Grid from './components/Grid';
import Card, { CardContent, CardHeader } from './components/Card';
import { Tabs, Tab, TabPanel } from './components/Tabs';
import ThemeProvider, { useTheme, createTheme } from './components/ThemeProvider';
import Container from './components/Container';
import { BudgetTab } from './components/budget';

// Import necessary components that don't have custom replacements yet
import {
  CssBaseline,
  CircularProgress,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Menu,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ListItemIcon
} from '@mui/material';

import { DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  UploadFile,
  Delete,
  Refresh,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Menu as MenuIcon,
  Movie as MovieIcon,
  CalendarMonth,
  ViewList,
  LocationOn,
  People,
  Settings,
  CameraAlt,
  Theaters,
  ExpandMore,
  Edit,
  Save,
  Add,
  Image,
  ViewModule,
  Slideshow,
  ArrowBack,
  ArrowForward,
  AttachMoney,
  BarChart,
  Timeline,
  Tune,
  Download,
  CloudUpload,
  Description,
  TextFields,
  ContentCopy,
  Code,
  Movie,
  VolumeUp,
  Lightbulb,
  Person,
  Build,
  Note,
  Warning,
} from '@mui/icons-material';

// Define custom theme settings - we'll use our ThemeProvider's createTheme
import { useDropzone } from 'react-dropzone';
import { format, addDays, parseISO } from 'date-fns';
import { ResponsivePie } from '@nivo/pie';

// Define custom theme settings - we'll use our ThemeProvider's createTheme
const lightThemeSettings = createTheme({
  mode: 'light'
});

const darkThemeSettings = createTheme({
  mode: 'dark'
});

// API endpoint
const API_URL = 'https://varun324242-sjuu.hf.space/api'; // Update this to the correct port where your API is running
const PLACEHOLDER_URL = '/placeholders/placeholder.svg';

// We're using the TabPanel from our custom components, so we don't need to define it here

// At the top of your file, import the storage utilities
import { saveToStorage, loadFromStorage, STORAGE_KEYS } from '../utils/storage';

export default function Home() {
  // State management
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadFromStorage(STORAGE_KEYS.THEME_MODE) ?? false;
    }
    return false;
  });
  const theme = darkMode ? darkThemeSettings : lightThemeSettings;
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const [isOffline, setIsOffline] = useState(false);

  // DOM content loaded check
  useEffect(() => {
    // Ensure DOM is fully loaded before any scripts run
    const handleDOMContentLoaded = () => {
      // Add a global utility function that safely accesses DOM properties
      // This helps prevent errors from third-party scripts like liner-core.be.js
      window.safeDOM = {
        // Safely access classList
        classList: (element, operation, ...args) => {
          if (element && element.classList && typeof element.classList[operation] === 'function') {
            return element.classList[operation](...args);
          }
          return null;
        },
        // Safely add class
        addClass: (element, ...classes) => {
          return window.safeDOM.classList(element, 'add', ...classes);
        },
        // Safely remove class
        removeClass: (element, ...classes) => {
          return window.safeDOM.classList(element, 'remove', ...classes);
        },
        // Safely toggle class
        toggleClass: (element, className, force) => {
          return window.safeDOM.classList(element, 'toggle', className, force);
        }
      };

      // Patch Element.prototype.classList to handle null safely
      const originalClassListGetter = Object.getOwnPropertyDescriptor(Element.prototype, 'classList')?.get;
      if (originalClassListGetter) {
        Object.defineProperty(Element.prototype, 'classList', {
          get() {
            try {
              return originalClassListGetter.call(this);
            } catch (e) {
              console.warn('classList access error prevented', e);
              // Return a dummy object that doesn't throw on common operations
              return {
                add: () => {},
                remove: () => {},
                toggle: () => false,
                contains: () => false
              };
            }
          },
          configurable: true
        });
      }

      console.log('DOM fully loaded and safeguards applied');
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);
    } else {
      handleDOMContentLoaded();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
    };
  }, []);

  // Add this useEffect
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Data states
  const [scriptData, setScriptData] = useState(() => {
    if (typeof window !== 'undefined') {
      return loadFromStorage(STORAGE_KEYS.SCRIPT_DATA) ?? null;
    }
    return null;
  });
  const [oneLinerData, setOneLinerData] = useState(() => loadFromStorage(STORAGE_KEYS.ONE_LINER_DATA) ?? null);
  const [characterData, setCharacterData] = useState(() => loadFromStorage(STORAGE_KEYS.CHARACTER_DATA) ?? null);
  const [scheduleData, setScheduleData] = useState(() => loadFromStorage(STORAGE_KEYS.SCHEDULE_DATA) ?? null);
  const [budgetData, setBudgetData] = useState(() => loadFromStorage(STORAGE_KEYS.BUDGET_DATA) ?? null);
  const [storyboardData, setStoryboardData] = useState(() => loadFromStorage(STORAGE_KEYS.STORYBOARD_DATA) ?? null);

  // Form states
  const [startDate, setStartDate] = useState(null); // Initialize as null
  const [locationConstraints, setLocationConstraints] = useState({
    preferred_locations: [],
    avoid_weather: ["Rain", "Snow", "High Winds"]
  });
  const [scheduleConstraints, setScheduleConstraints] = useState({
    max_hours_per_day: 12,
    meal_break_duration: 60,
    company_moves_per_day: 2
  });

  // Script input states
  const [scriptText, setScriptText] = useState('');
  const [inputMethod, setInputMethod] = useState('file');

  // Script analysis states
  const [scriptAnalysisView, setScriptAnalysisView] = useState('timeline'); // Similar to scheduleView

  // Character breakdown states
  const [selectedCharacter, setSelectedCharacter] = useState('');
  const [characterProfileTab, setCharacterProfileTab] = useState(0);
  const [characterBreakdownView, setCharacterBreakdownView] = useState('profiles');

  // Schedule states
  const [scheduleView, setScheduleView] = useState('calendar');

  // Note: handleDateChange and clearAllData are defined later in the file

  // Budget states
  const [budgetView, setBudgetView] = useState('overview');
  const [budgetQualityLevel, setBudgetQualityLevel] = useState('Medium');
  const [equipmentPreference, setEquipmentPreference] = useState('Standard');
  const [crewSize, setCrewSize] = useState('Medium');
  const [targetBudget, setTargetBudget] = useState(0);

  // Storyboard states
  const [storyboardView, setStoryboardView] = useState('grid');
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [storyboardSettings, setStoryboardSettings] = useState({
    shot_settings: {
      default_shot_type: 'MS',
      style: 'realistic',
      mood: 'neutral',
      camera_angle: 'eye_level',
      scene_settings: {}
    },
    layout: {
      panels_per_row: 3,
      panel_size: 'medium',
      show_captions: true,
      show_technical: true
    },
    image: {
      quality: 'standard',
      aspect_ratio: '16:9',
      color_mode: 'color',
      border: 'thin'
    }
  });

  // Theme toggle
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // File upload handling
  const onDrop = useCallback(async (acceptedFiles) => {
    setLoading(true);
    setError(null);

    try {
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('validation_level', 'lenient');

      try {
        const response = await fetch(`${API_URL}/script/upload`, {
          method: 'POST',
          body: formData,
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error);
        }

        setScriptData(result.data);
        saveToStorage(STORAGE_KEYS.SCRIPT_DATA, result.data);
        setSuccess('Script uploaded and analyzed successfully!');
        setCurrentTab(1);
      } catch (apiError) {
        console.warn('API call failed, using local storage:', apiError);
        // Process the file locally if API fails
        const reader = new FileReader();
        reader.onload = async (e) => {
          const text = e.target.result;
          // Basic script parsing logic here
          const basicData = {
            content: text,
            timestamp: new Date().toISOString(),
            // Add other basic metadata
          };
          setScriptData(basicData);
          saveToStorage(STORAGE_KEYS.SCRIPT_DATA, basicData);
          setSuccess('Script saved locally (offline mode)');
          setCurrentTab(1);
        };
        reader.readAsText(file);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt'],
    },
    multiple: false,
  });

  // API calls
  const generateOneLiner = async () => {
    if (!scriptData) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/one-liner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scriptData),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      setOneLinerData(result.data);
      setSuccess('One-liner generated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeCharacters = async () => {
    if (!scriptData) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/characters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script_data: scriptData
          // Removed focus_characters parameter as it's not supported by the coordinator
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      console.log('Character data received:', result.data);
      setCharacterData(result.data);
      setSuccess('Character analysis completed!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect for client-side initialization
  useEffect(() => {
    setStartDate(new Date()); // Set the date only on the client side
  }, []);

  // Update createSchedule function to handle null startDate
  const createSchedule = async () => {
    if (!scriptData || !characterData || !startDate) return;

    setLoading(true);
    try {
      // Format date as string in YYYY-MM-DD format, with null check
      const formattedDate = startDate ? format(startDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

      const response = await fetch(`${API_URL}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script_results: scriptData,
          character_results: characterData,
          start_date: formattedDate,
          location_constraints: locationConstraints,
          schedule_constraints: scheduleConstraints,
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      setScheduleData(result.data);
      setSuccess('Schedule created successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const createBudget = async () => {
    if (!scriptData || !scheduleData) return;

    setLoading(true);
    try {
      // Prepare production data
      const productionData = {
        script_metadata: scriptData.metadata || {},
        scene_count: scriptData.parsed_data?.scenes?.length || 0,
        character_count: characterData?.characters ? Object.keys(characterData.characters).length : 0,
        schedule_days: scheduleData?.schedule?.length || 0,
        quality_level: budgetQualityLevel
      };

      // Prepare location data
      const locationData = {
        locations: scheduleData?.schedule?.flatMap((day) =>
          day.scenes.map((scene) => scene.location_id)
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
        total_characters: characterData?.characters ? Object.keys(characterData.characters).length : 0
      };

      const response = await fetch(`${API_URL}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script_results: scriptData,
          schedule_results: scheduleData,
          production_data: productionData,
          location_data: locationData,
          crew_data: crewData,
          target_budget: targetBudget > 0 ? targetBudget : undefined,
          constraints: constraints
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      setBudgetData(result.data);
      setSuccess('Budget created successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const optimizeBudget = async (scenario) => {
    if (!budgetData) return;

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

      const response = await fetch(`${API_URL}/budget/optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario_constraints: scenarioConstraints,
          scenario: scenario
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      // Update budget data with scenario results
      setBudgetData({
        ...budgetData,
        scenario_results: result.data
      });

      setSuccess('Budget scenario analysis completed!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateStoryboard = async (sceneId, description, stylePrompt) => {
    setLoading(true);
    try {
      console.log(`Generating storyboard for scene ${sceneId}`);
      const response = await fetch(`${API_URL}/storyboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scene_id: sceneId,
          scene_description: description,
          style_prompt: stylePrompt,
          shot_type: storyboardSettings.shot_settings.default_shot_type,
          mood: storyboardSettings.shot_settings.mood,
          camera_angle: storyboardSettings.shot_settings.camera_angle
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      console.log('Storyboard API response:', result.data);

      // Ensure the image URL is properly set
      const sceneData = result.data;

      // If image_url is not set but image_path is, create a URL from it
      if (!sceneData.image_url && sceneData.image_path) {
        sceneData.image_url = `${API_URL}/storyboard/image/${sceneId}`;
      }

      // If neither is set, set a default URL
      if (!sceneData.image_url && !sceneData.image_path) {
        sceneData.image_url = `${API_URL}/storyboard/image/${sceneId}`;
      }

      // If we already have storyboard data, update it
      if (storyboardData && storyboardData.scenes) {
        const updatedScenes = [...storyboardData.scenes];
        const sceneIndex = updatedScenes.findIndex(scene => scene.scene_id === sceneId);

        if (sceneIndex >= 0) {
          updatedScenes[sceneIndex] = sceneData;
        } else {
          updatedScenes.push(sceneData);
        }

        setStoryboardData({
          ...storyboardData,
          scenes: updatedScenes
        });
      } else {
        // Otherwise create new storyboard data
        setStoryboardData({
          scenes: [sceneData]
        });
      }

      setSuccess('Storyboard generated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateFullStoryboard = async () => {
    if (!scriptData) return;

    setLoading(true);
    try {
      console.log('Generating full storyboard');
      const response = await fetch(`${API_URL}/storyboard/batch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script_results: scriptData,
          shot_settings: storyboardSettings.shot_settings
        }),
      });

      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      console.log('Full storyboard API response:', result.data);

      // Process the storyboard data to ensure image URLs are set
      const processedData = { ...result.data };

      if (processedData.scenes && Array.isArray(processedData.scenes)) {
        processedData.scenes = processedData.scenes.map(scene => {
          // If image_url is not set but image_path is, create a URL from it
          if (!scene.image_url && scene.image_path) {
            scene.image_url = `${API_URL}/storyboard/image/${scene.scene_id}`;
          }

          // If neither is set, set a default URL
          if (!scene.image_url && !scene.image_path) {
            scene.image_url = `${API_URL}/storyboard/image/${scene.scene_id}`;
          }

          return scene;
        });
      }

      setStoryboardData(processedData);
      setSuccess('Full storyboard generated successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    if (window.confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      setLoading(true);
      try {
        // Clear API storage
        try {
          const response = await fetch(`${API_URL}/storage`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          if (!response.ok) {
            throw new Error(`Failed to clear API storage: ${response.status}`);
          }
        } catch (apiError) {
          console.warn('API storage clear failed:', apiError);
          // Continue with local storage clear even if API fails
        }

        // Clear all items from local storage
        Object.values(STORAGE_KEYS).forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch (err) {
            console.warn(`Failed to remove ${key} from localStorage:`, err);
          }
        });

        // Reset all state variables
        setScriptData(null);
        setOneLinerData(null);
        setCharacterData(null);
        setScheduleData(null);
        setBudgetData(null);
        setStoryboardData(null);

        // Reset form states
        setStartDate(null);
        setLocationConstraints({
          preferred_locations: [],
          avoid_weather: ["Rain", "Snow", "High Winds"]
        });
        setScheduleConstraints({
          max_hours_per_day: 12,
          meal_break_duration: 60,
          company_moves_per_day: 2
        });
        setScriptText('');
        setInputMethod('file');

        // Reset to upload tab
        setCurrentTab(0);

        setSuccess('All data has been cleared successfully!');
      } catch (err) {
        setError(`Failed to clear data: ${err.message}`);
        console.error('Error clearing data:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  // DatePicker handler
  const handleDateChange = (newValue) => {
    setStartDate(newValue);
  };

  // Add new function to handle text submission
  const handleTextSubmit = async () => {
    if (!scriptText.trim()) {
      setError('Please enter your script text');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/script/text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          script: scriptText,
          validation_level: 'lenient'
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setScriptData(result.data);
      setSuccess('Script analyzed successfully!');
      setCurrentTab(1); // Move to Script Analysis tab
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to load data from storage
  const loadStoredData = async () => {
    try {
      setLoading(true);
      console.log("Loading stored data from API...");

      // Function to safely fetch and parse JSON with error handling
      const fetchJson = async (endpoint, defaultValue = {}) => {
        try {
          console.log(`Fetching from: ${API_URL}${endpoint}`);
          const response = await fetch(`${API_URL}${endpoint}`);

          if (!response.ok) {
            console.warn(`API call failed: ${endpoint} returned ${response.status}`);
            return defaultValue;
          }

          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            console.warn(`API returned non-JSON response: ${contentType}`);
            return defaultValue;
          }

          const result = await response.json();

          // Handle ApiResponse format from backend
          if (result && typeof result === 'object') {
            if ('success' in result && result.success === true && 'data' in result) {
              return result.data;
            } else if ('success' in result && result.success === false) {
              console.warn(`API returned error: ${result.error || 'Unknown error'}`);
              return defaultValue;
            }
          }

          // If response is not wrapped in ApiResponse format, return as-is
          return result;
        } catch (error) {
          console.error(`Error fetching ${endpoint}:`, error);
          return defaultValue;
        }
      };

      // Fetch data in parallel
      const [scriptData, oneLinerData, characterData, scheduleData, budgetData, storyboardData] = await Promise.all([
        fetchJson('/storage/script_ingestion_results.json'),
        fetchJson('/storage/one_liner_results.json'),
        fetchJson('/storage/character_breakdown_results.json'),
        fetchJson('/storage/schedule_results.json'),
        fetchJson('/storage/budget_results.json'),
        fetchJson('/storage/storyboard_results.json', { scenes: [] }),
      ]);

      console.log("Successfully loaded stored data");

      // Update states
      setScriptData(scriptData);
      setOneLinerData(oneLinerData);
      setCharacterData(characterData);
      setScheduleData(scheduleData);
      setBudgetData(budgetData);
      setStoryboardData(storyboardData);

      // Set appropriate tab based on loaded data
      if (Object.keys(scriptData).length > 0) {
        setCurrentTab(1); // Script Analysis
        if (Object.keys(characterData).length > 0) {
          setCurrentTab(2); // Character Breakdown
          if (Object.keys(scheduleData).length > 0) {
            setCurrentTab(3); // Schedule
            if (Object.keys(budgetData).length > 0) {
              setCurrentTab(4); // Budget
              if (storyboardData?.scenes?.length > 0) {
                setCurrentTab(5); // Storyboard
              }
            }
          }
        }
      }

    } catch (error) {
      console.error("Error loading stored data:", error);
      setError("Failed to load stored data. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // Load stored data on component mount
  useEffect(() => {
    loadStoredData();
  }, []);

  const fetchStoryboardImage = async (sceneId) => {
    try {
      setImageLoading(prev => ({...prev, [sceneId]: true}));

      const response = await fetch(`${API_URL}/storyboard/image/${sceneId}`);

      if (!response.ok) {
        throw new Error(`Failed to load image (status ${response.status})`);
      }

      // Check if it's an image response and not an error JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Unknown error');
      }

      // Image loaded successfully
      setError(null);
      return `${API_URL}/storyboard/image/${sceneId}?t=${Date.now()}`; // Add cache buster
    } catch (err) {
      console.error(`Error loading storyboard image for scene ${sceneId}:`, err);
      setError(`Failed to load storyboard image for scene ${sceneId}: ${err.message}`);
      return null;
    } finally {
      setImageLoading(prev => ({...prev, [sceneId]: false}));
    }
  };

  // Then use it in the useEffect
  useEffect(() => {
    if (storyboardData?.scenes && storyboardData.scenes.length > 0) {
      // Load all storyboard images
      const loadImages = async () => {
        const loadingStates = {};
        storyboardData.scenes.forEach(scene => {
          loadingStates[scene.scene_id] = true;
        });
        setImageLoading(loadingStates);

        // Fetch all images in parallel
        await Promise.all(storyboardData.scenes.map(scene =>
          fetchStoryboardImage(scene.scene_id)
        ));
      };

      loadImages();
    }
  }, [storyboardData]);

  // Add this handler function
  const handleScriptAnalysisViewChange = (_, newValue) => {
    setScriptAnalysisView(newValue);
  };

  const sidebarButtonStyle = (isSelected, darkMode) => ({
    borderRadius: '2px',
    marginBottom: '8px',
    transition: 'all 0.2s ease',
    '&.Mui-selected': {
      backgroundColor: darkMode
        ? 'rgba(115, 139, 255, 0.15)'
        : 'rgba(67, 97, 238, 0.08)',
      '&:hover': {
        backgroundColor: darkMode
          ? 'rgba(115, 139, 255, 0.2)'
          : 'rgba(67, 97, 238, 0.12)',
      },
    },
  });

  // Add these useEffect hooks after your state declarations
  useEffect(() => {
    if (darkMode !== undefined) {
      saveToStorage(STORAGE_KEYS.THEME_MODE, darkMode);
    }
  }, [darkMode]);

  useEffect(() => {
    if (scriptData) {
      saveToStorage(STORAGE_KEYS.SCRIPT_DATA, scriptData);
    }
  }, [scriptData]);

  useEffect(() => {
    if (oneLinerData) {
      saveToStorage(STORAGE_KEYS.ONE_LINER_DATA, oneLinerData);
    }
  }, [oneLinerData]);

  useEffect(() => {
    if (characterData) {
      saveToStorage(STORAGE_KEYS.CHARACTER_DATA, characterData);
    }
  }, [characterData]);

  useEffect(() => {
    if (scheduleData) {
      saveToStorage(STORAGE_KEYS.SCHEDULE_DATA, scheduleData);
    }
  }, [scheduleData]);

  useEffect(() => {
    if (budgetData) {
      saveToStorage(STORAGE_KEYS.BUDGET_DATA, budgetData);
    }
  }, [budgetData]);

  useEffect(() => {
    if (storyboardData) {
      saveToStorage(STORAGE_KEYS.STORYBOARD_DATA, storyboardData);
    }
  }, [storyboardData]);

  return (
    <ThemeProvider initialTheme={darkMode ? 'dark' : 'light'}>
      <CssBaseline />
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* App Bar */}
        <AppBar
          position="fixed"
          elevation={0}
          style={{
            zIndex: 1201, // drawer + 1
            backdropFilter: 'blur(8px)',
            backgroundColor: darkMode
              ? 'rgba(19, 47, 76, 0.9)'
              : 'rgba(255, 255, 255, 0.9)',
            borderBottom: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
          }}
        >
          <Toolbar>
            <Box
              style={{
                display: 'flex',

                alignItems: 'center',
                background: darkMode
                  ? 'linear-gradient(90deg, #738bff, #ff5eb1)'
                  : 'linear-gradient(90deg, #4361ee, #f72585)',
                borderRadius: '50%',
                padding: '8px',
                marginRight: '16px',
              }}
            >
              <MovieIcon style={{ color: '#fff' }} />
            </Box>
            <Typography
              variant="h6"
              noWrap
              component="div"
              style={{
                flexGrow: 1,
                fontWeight: 700,
                background: darkMode
                  ? 'linear-gradient(90deg, #a4b8ff, #ff90d1)'
                  : 'linear-gradient(90deg, #4361ee, #f72585)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Think AI
            </Typography>
            <IconButton color="inherit" onClick={toggleTheme}>
              {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>

        {/* Sidebar */}
        <Box
          component="nav"
          style={{
            width: 280,
            flexShrink: 0,
            backgroundColor: darkMode
              ? 'rgba(19, 47, 76, 0.95)'
              : 'rgba(255, 255, 255, 0.95)',
            borderRight: `1px solid ${darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'}`,
            backdropFilter: 'blur(8px)',
            paddingTop: '64px',
            height: '100vh',
            position: 'sticky',
            top: 0,
            display: 'block', // Responsive display will need to be handled differently
          }}
        >
          <List style={{ padding: '16px' }}>
            {/* Navigation items with icons */}
            <ListItemButton
              selected={currentTab === 0}
              onClick={() => setCurrentTab(0)}
              sx={sidebarButtonStyle(currentTab === 0, darkMode)}
            >
              <CloudUpload style={{ marginRight: '16px', color: '#4361ee' }} />
              <ListItemText
                primary="Upload Script"
                primaryTypographyProps={{
                  fontWeight: currentTab === 0 ? 600 : 400,
                }}
              />
            </ListItemButton>

            <ListItemButton
              selected={currentTab === 1}
              onClick={() => setCurrentTab(1)}
              disabled={!scriptData}
              sx={sidebarButtonStyle(currentTab === 1, darkMode)}
            >
              <Description style={{ marginRight: 2, color: darkMode ? '#738bff' : '#4361ee' }} />
              <ListItemText
                primary="Script Analysis"
                primaryTypographyProps={{
                  fontWeight: currentTab === 1 ? 600 : 400,
                }}
              />
              {scriptData && <Chip
                size="small"
                label="✓"
                color="success"
                variant="outlined"
                style={{ marginLeft: 1, height: 20, minWidth: 20 }}
              />}
            </ListItemButton>

            <ListItemButton
              selected={currentTab === 2}
              onClick={() => setCurrentTab(2)}
              disabled={!scriptData}
              sx={sidebarButtonStyle(currentTab === 2, darkMode)}
            >
              <TextFields style={{ marginRight: 2, color: darkMode ? '#738bff' : '#4361ee' }} />
              <ListItemText
                primary="One-Liner"
                primaryTypographyProps={{
                  fontWeight: currentTab === 2 ? 600 : 400,
                }}
              />
              {oneLinerData && <Chip
                size="small"
                label="✓"
                color="success"
                variant="outlined"
                style={{ marginLeft: 1, height: 20, minWidth: 20 }}
              />}
            </ListItemButton>

            <ListItemButton
              selected={currentTab === 3}
              onClick={() => setCurrentTab(3)}
              disabled={!scriptData}
              sx={sidebarButtonStyle(currentTab === 3, darkMode)}
            >
              <People style={{ marginRight: 2, color: darkMode ? '#738bff' : '#4361ee' }} />
              <ListItemText
                primary="Character Breakdown"
                primaryTypographyProps={{
                  fontWeight: currentTab === 3 ? 600 : 400,
                }}
              />
              {characterData && <Chip
                size="small"
                label="✓"
                color="success"
                variant="outlined"
                style={{ marginLeft: 1, height: 20, minWidth: 20 }}
              />}
            </ListItemButton>

            <ListItemButton
              selected={currentTab === 4}
              onClick={() => setCurrentTab(4)}
              disabled={!scriptData || !characterData}
              sx={sidebarButtonStyle(currentTab === 4, darkMode)}
            >
              <CalendarMonth style={{ marginRight: '8px', color: darkMode ? '#738bff' : '#4361ee' }} />
              <ListItemText
                primary="Schedule"
                primaryTypographyProps={{
                  fontWeight: currentTab === 4 ? 600 : 400,
                }}
              />
              {scheduleData && <Chip
                size="small"
                label="✓"
                color="success"
                variant="outlined"
                style={{ marginLeft: 1, height: 20, minWidth: 20 }}
              />}
            </ListItemButton>

            <ListItemButton
              selected={currentTab === 5}
              onClick={() => setCurrentTab(5)}
              disabled={!scheduleData}
              sx={sidebarButtonStyle(currentTab === 5, darkMode)}
            >
              <AttachMoney style={{ marginRight: 2, color: darkMode ? '#738bff' : '#4361ee' }} />
              <ListItemText
                primary="Budget"
                primaryTypographyProps={{
                  fontWeight: currentTab === 5 ? 600 : 400,
                }}
              />
              {budgetData && <Chip
                size="small"
                label="✓"
                color="success"
                variant="outlined"
                style={{ marginLeft: 1, height: 20, minWidth: 20 }}
              />}
            </ListItemButton>

            <ListItemButton
              selected={currentTab === 6}
              onClick={() => setCurrentTab(6)}
              disabled={!scriptData}
              sx={sidebarButtonStyle(currentTab === 6, darkMode)}
            >
              <Image style={{ marginRight: 2, color: darkMode ? '#738bff' : '#4361ee' }} />
              <ListItemText
                primary="Storyboard"
                primaryTypographyProps={{
                  fontWeight: currentTab === 6 ? 600 : 400,
                }}
              />
              {storyboardData && <Chip
                size="small"
                label="✓"
                color="success"
                variant="outlined"
                style={{ marginLeft: 1, height: 20, minWidth: 20 }}
              />}
            </ListItemButton>

            <Divider style={{ marginTop: '8px', marginBottom: '8px' }} />

            <ListItemButton
              selected={currentTab === 7}
              onClick={() => setCurrentTab(7)}
              sx={sidebarButtonStyle(currentTab === 7, darkMode)}
            >
              <BarChart style={{ marginRight: 2, color: darkMode ? '#738bff' : '#4361ee' }} />
              <ListItemText
                primary="Project Overview"
                primaryTypographyProps={{
                  fontWeight: currentTab === 7 ? 600 : 400,
                }}
              />
            </ListItemButton>

            <ListItemButton
              onClick={() => window.open(`${API_URL}/logs`, '_blank')}
              sx={sidebarButtonStyle(currentTab === 8, darkMode)}
            >
              <Timeline style={{ marginRight: 2, color: darkMode ? '#738bff' : '#4361ee' }} />
              <ListItemText
                primary="API Logs"
                primaryTypographyProps={{
                  fontWeight: 400,
                }}
              />
            </ListItemButton>
          </List>

          <Box style={{ p: 2, mt: 'auto' }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={clearAllData}
              fullWidth
              style={{
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              Reset All Data
            </Button>
          </Box>
        </Box>

        {/* Main content */}
        <Box
          component="main"
          style={{
            flexGrow: 1,
            padding: '24px',
            paddingTop: '80px',
            background: darkMode
              ? 'linear-gradient(135deg, #0a1929 0%, #132f4c 100%)'
              : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
            minHeight: '100vh',
          }}
        >
          {/* Status messages */}
          {error && (
            <Alert
              severity="error"
              onClose={() => setError(null)}
              style={{
                marginBottom: 2,
                borderRadius: '2px',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                },
              }}
            >
              {error}
            </Alert>
          )}
          {success && (
            <Alert
              severity="success"
              onClose={() => setSuccess(null)}
              style={{
                marginBottom: 2,
                borderRadius: '2px',
                '& .MuiAlert-icon': {
                  fontSize: '1.5rem',
                },
              }}
            >
              {success}
            </Alert>
          )}
          {loading && (
            <Box style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
              <CircularProgress />
            </Box>
          )}
          {isOffline && (
            <Alert severity="warning" style={{ marginBottom: 16 }}>
              You are currently offline. Changes will be saved locally and synced when you're back online.
            </Alert>
          )}

          {/* Tab Panels */}
          <TabPanel value={currentTab} index={0}>
            {/* Upload Script Tab - Premium UI */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                maxWidth: 1200,
                mx: 'auto',
                position: 'relative',
                pb: 6
              }}
            >
              {/* Ultra-Premium Hero Section with Enhanced Visual Effects */}
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 8,
                  overflow: 'hidden',
                  mb: 4,
                  boxShadow: darkMode
                    ? '0 20px 80px rgba(115, 139, 255, 0.3), 0 0 120px rgba(115, 139, 255, 0.1)'
                    : '0 20px 80px rgba(67, 97, 238, 0.2), 0 0 120px rgba(67, 97, 238, 0.05)',
                }}
              >
                {/* Luxury Animated Background with 3D effect */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: darkMode
                      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(23, 15, 49, 0.9))'
                      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(240, 242, 255, 0.9))',
                    zIndex: 0,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '-50%',
                      left: '-50%',
                      width: '200%',
                      height: '200%',
                      background: darkMode
                        ? 'radial-gradient(circle, rgba(115, 139, 255, 0.15) 0%, transparent 50%)'
                        : 'radial-gradient(circle, rgba(67, 97, 238, 0.1) 0%, transparent 50%)',
                      animation: 'pulse 20s infinite linear',
                      transform: 'rotate(0deg) scale(1)',
                      transformOrigin: 'center',
                    },
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '-50%',
                      right: '-50%',
                      width: '200%',
                      height: '200%',
                      background: darkMode
                        ? 'radial-gradient(circle, rgba(255, 94, 177, 0.15) 0%, transparent 50%)'
                        : 'radial-gradient(circle, rgba(247, 37, 133, 0.1) 0%, transparent 50%)',
                      animation: 'pulse 25s infinite linear reverse',
                      transform: 'rotate(0deg) scale(1.1)',
                      transformOrigin: 'center',
                    },
                    backdropFilter: 'blur(16px)',
                  }}
                />

                {/* Floating particles effect */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    overflow: 'hidden',
                    zIndex: 0,
                    opacity: 0.6,
                    '&::before, &::after': {
                      content: '""',
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      backgroundImage: darkMode
                        ? 'radial-gradient(circle at 10% 20%, rgba(115, 139, 255, 0.2) 0%, transparent 8%), radial-gradient(circle at 80% 30%, rgba(255, 94, 177, 0.2) 0%, transparent 8%), radial-gradient(circle at 30% 70%, rgba(101, 208, 255, 0.2) 0%, transparent 8%), radial-gradient(circle at 70% 90%, rgba(255, 145, 238, 0.2) 0%, transparent 8%), radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.2) 0%, transparent 8%)'
                        : 'radial-gradient(circle at 10% 20%, rgba(67, 97, 238, 0.1) 0%, transparent 8%), radial-gradient(circle at 80% 30%, rgba(247, 37, 133, 0.1) 0%, transparent 8%), radial-gradient(circle at 30% 70%, rgba(0, 155, 255, 0.1) 0%, transparent 8%), radial-gradient(circle at 70% 90%, rgba(247, 76, 177, 0.1) 0%, transparent 8%), radial-gradient(circle at 50% 50%, rgba(67, 97, 238, 0.1) 0%, transparent 8%)',
                      backgroundSize: '3000% 3000%',
                    },
                    '&::before': {
                      animation: 'particleDrift 120s infinite linear',
                    },
                    '&::after': {
                      animation: 'particleDrift 180s infinite linear reverse',
                      opacity: 0.7,
                    },
                  }}
                />

                {/* Hero Content */}
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    p: { xs: 4, md: 6 },
                    textAlign: 'center',
                  }}
                >
                  {/* Ultra-Premium Title with 3D gradient and animated highlight effect */}
                  <Box sx={{ position: 'relative', mb: 4 }}>
                    {/* Animated highlight effect */}
                    <Box
                      sx={{
                        position: 'absolute',
                        width: '120%',
                        height: '120%',
                        top: '-10%',
                        left: '-10%',
                        background: darkMode
                          ? 'radial-gradient(ellipse at center, rgba(115, 139, 255, 0.15) 0%, transparent 70%)'
                          : 'radial-gradient(ellipse at center, rgba(67, 97, 238, 0.1) 0%, transparent 70%)',
                        filter: 'blur(40px)',
                        opacity: 0.8,
                        animation: 'pulseGlow 6s infinite ease-in-out alternate',
                        zIndex: 0,
                      }}
                    />

                    <Typography
                      variant="h1"
                      component="h1"
                      sx={{
                        fontWeight: 900,
                        fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                        mb: 2,
                        background: darkMode
                          ? 'linear-gradient(90deg, #738BFF, #A483FF, #FF90D1, #738BFF)'
                          : 'linear-gradient(90deg, #4361ee, #7B4AE2, #f72585, #4361ee)',
                        backgroundSize: '300% 300%',
                        animation: 'gradientShift 8s ease infinite',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: darkMode
                          ? '0 8px 40px rgba(164, 184, 255, 0.6)'
                          : '0 8px 40px rgba(67, 97, 238, 0.4)',
                        letterSpacing: '-0.03em',
                        transform: 'translateZ(0)',
                        position: 'relative',
                        zIndex: 1,
                        textAlign: 'center',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          bottom: '-10px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '80px',
                          height: '4px',
                          borderRadius: '2px',
                          background: darkMode
                            ? 'linear-gradient(90deg, #738BFF, #FF90D1)'
                            : 'linear-gradient(90deg, #4361ee, #f72585)',
                        }
                      }}
                    >
                      Transform Your Vision Into Cinema
                    </Typography>
                  </Box>

                  {/* Ultra-Premium Subtitle with enhanced typography and effects */}
                  <Box sx={{ position: 'relative', mb: 7 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        maxWidth: 900,
                        mx: 'auto',
                        color: darkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)',
                        fontWeight: 500,
                        lineHeight: 1.6,
                        position: 'relative',
                        textShadow: darkMode
                          ? '0 4px 30px rgba(115, 139, 255, 0.3)'
                          : '0 4px 30px rgba(67, 97, 238, 0.2)',
                        fontSize: { xs: '1.2rem', sm: '1.4rem', md: '1.6rem' },
                        letterSpacing: '0.01em',
                        textAlign: 'center',
                        '& strong': {
                          fontWeight: 700,
                          color: darkMode ? '#a4b8ff' : '#4361ee',
                        }
                      }}
                    >
                      Upload your screenplay and watch as our AI transforms it into a <strong>complete pre-production package</strong> with <strong>character analysis</strong>, <strong>budget estimation</strong>, and <strong>stunning storyboards</strong>.
                    </Typography>
                  </Box>

                  {/* Ultra-Premium Input Method Selector */}
                  <Box sx={{ position: 'relative', mb: 6 }}>
                    {/* Glowing background effect */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '100%',
                        maxWidth: '400px',
                        height: '100px',
                        borderRadius: '20px',
                        background: darkMode
                          ? 'radial-gradient(ellipse at center, rgba(115, 139, 255, 0.15) 0%, transparent 70%)'
                          : 'radial-gradient(ellipse at center, rgba(67, 97, 238, 0.1) 0%, transparent 70%)',
                        filter: 'blur(20px)',
                        opacity: 0.7,
                        zIndex: 0,
                      }}
                    />

                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 0.8,
                        borderRadius: 16,
                        position: 'relative',
                        zIndex: 1,
                        backgroundColor: darkMode
                          ? 'rgba(15, 23, 42, 0.6)'
                          : 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(10px)',
                        boxShadow: darkMode
                          ? '0 10px 30px rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
                          : '0 10px 30px rgba(67, 97, 238, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.9)',
                        border: darkMode
                          ? '1px solid rgba(115, 139, 255, 0.2)'
                          : '1px solid rgba(67, 97, 238, 0.1)',
                      }}
                    >
                      <Button
                        variant="text"
                        onClick={() => setInputMethod('file')}
                        sx={{
                          px: 4,
                          py: 2,
                          borderRadius: 12,
                          fontWeight: 700,
                          fontSize: '1rem',
                          letterSpacing: '0.02em',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          backgroundColor: inputMethod === 'file'
                            ? (darkMode ? 'rgba(115, 139, 255, 0.25)' : 'rgba(67, 97, 238, 0.15)')
                            : 'transparent',
                          color: inputMethod === 'file'
                            ? (darkMode ? '#a4b8ff' : '#4361ee')
                            : (darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)'),
                          boxShadow: inputMethod === 'file'
                            ? (darkMode
                                ? 'inset 0 0 0 1px rgba(115, 139, 255, 0.4), 0 10px 20px rgba(115, 139, 255, 0.2)'
                                : 'inset 0 0 0 1px rgba(67, 97, 238, 0.3), 0 10px 20px rgba(67, 97, 238, 0.1)')
                            : 'none',
                          '&:hover': {
                            backgroundColor: inputMethod === 'file'
                              ? (darkMode ? 'rgba(115, 139, 255, 0.3)' : 'rgba(67, 97, 238, 0.2)')
                              : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'),
                            transform: 'translateY(-2px)',
                          }
                        }}
                        startIcon={
                          <UploadFile sx={{
                            fontSize: 24,
                            filter: inputMethod === 'file'
                              ? (darkMode ? 'drop-shadow(0 0 8px rgba(115, 139, 255, 0.6))' : 'drop-shadow(0 0 8px rgba(67, 97, 238, 0.4))')
                              : 'none'
                          }} />
                        }
                      >
                        Upload File
                      </Button>
                      <Button
                        variant="text"
                        onClick={() => setInputMethod('text')}
                        sx={{
                          px: 4,
                          py: 2,
                          borderRadius: 12,
                          fontWeight: 700,
                          fontSize: '1rem',
                          letterSpacing: '0.02em',
                          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                          backgroundColor: inputMethod === 'text'
                            ? (darkMode ? 'rgba(255, 94, 177, 0.25)' : 'rgba(247, 37, 133, 0.15)')
                            : 'transparent',
                          color: inputMethod === 'text'
                            ? (darkMode ? '#ff90d1' : '#f72585')
                            : (darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(30, 41, 59, 0.7)'),
                          boxShadow: inputMethod === 'text'
                            ? (darkMode
                                ? 'inset 0 0 0 1px rgba(255, 94, 177, 0.4), 0 10px 20px rgba(255, 94, 177, 0.2)'
                                : 'inset 0 0 0 1px rgba(247, 37, 133, 0.3), 0 10px 20px rgba(247, 37, 133, 0.1)')
                            : 'none',
                          '&:hover': {
                            backgroundColor: inputMethod === 'text'
                              ? (darkMode ? 'rgba(255, 94, 177, 0.3)' : 'rgba(247, 37, 133, 0.2)')
                              : (darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'),
                            transform: 'translateY(-2px)',
                          }
                        }}
                        startIcon={
                          <TextFields sx={{
                            fontSize: 24,
                            filter: inputMethod === 'text'
                              ? (darkMode ? 'drop-shadow(0 0 8px rgba(255, 94, 177, 0.6))' : 'drop-shadow(0 0 8px rgba(247, 37, 133, 0.4))')
                              : 'none'
                          }} />
                        }
                      >
                        Enter Text
                      </Button>
                    </Box>
                  </Box>

                  {/* Ultra-Premium File Upload Dropzone */}
                  {inputMethod === 'file' ? (
                    <Box
                      {...getRootProps()}
                      sx={{
                        position: 'relative',
                        maxWidth: 900,
                        mx: 'auto',
                        p: { xs: 5, md: 8 },
                        borderRadius: 8,
                        border: '2px dashed',
                        borderColor: darkMode ? 'rgba(115, 139, 255, 0.4)' : 'rgba(67, 97, 238, 0.4)',
                        backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.7)',
                        cursor: 'pointer',
                        transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                        overflow: 'hidden',
                        backdropFilter: 'blur(30px)',
                        boxShadow: darkMode
                          ? '0 20px 50px rgba(0, 0, 0, 0.3), inset 0 0 30px rgba(115, 139, 255, 0.05)'
                          : '0 20px 50px rgba(67, 97, 238, 0.15), inset 0 0 30px rgba(67, 97, 238, 0.03)',
                        '&:hover': {
                          transform: 'translateY(-15px) scale(1.02)',
                          borderColor: darkMode ? 'rgba(115, 139, 255, 0.8)' : 'rgba(67, 97, 238, 0.8)',
                          boxShadow: darkMode
                            ? '0 40px 80px rgba(115, 139, 255, 0.3), inset 0 0 30px rgba(115, 139, 255, 0.1)'
                            : '0 40px 80px rgba(67, 97, 238, 0.25), inset 0 0 30px rgba(67, 97, 238, 0.05)',
                          '& .upload-icon-container': {
                            transform: 'scale(1.2) translateY(-8px)',
                            backgroundColor: darkMode ? 'rgba(115, 139, 255, 0.3)' : 'rgba(67, 97, 238, 0.2)',
                            boxShadow: darkMode
                              ? '0 20px 50px rgba(115, 139, 255, 0.4)'
                              : '0 20px 50px rgba(67, 97, 238, 0.3)',
                          },
                          '& .upload-icon': {
                            transform: 'translateY(-5px) scale(1.15) rotate(-5deg)',
                            color: darkMode ? '#a4b8ff' : '#4361ee',
                          },
                          '& .upload-glow': {
                            opacity: 1,
                            transform: 'translate(-50%, -50%) scale(1.1)',
                          },
                          '& .upload-button': {
                            transform: 'translateY(-5px) scale(1.05)',
                            boxShadow: darkMode
                              ? '0 20px 50px rgba(115, 139, 255, 0.6)'
                              : '0 20px 50px rgba(67, 97, 238, 0.4)',
                          }
                        }
                      }}
                    >
                      <input {...getInputProps()} />

                      {/* Enhanced background glow effect */}
                      <Box
                        className="upload-glow"
                        sx={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '200%',
                          height: '200%',
                          background: darkMode
                            ? 'radial-gradient(ellipse, rgba(115, 139, 255, 0.25) 0%, rgba(255, 94, 177, 0.15) 25%, transparent 70%)'
                            : 'radial-gradient(ellipse, rgba(67, 97, 238, 0.2) 0%, rgba(247, 37, 133, 0.1) 25%, transparent 70%)',
                          opacity: 0.7,
                          transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                          zIndex: 0,
                          filter: 'blur(60px)',
                          animation: 'pulseGlow 4s infinite ease-in-out alternate',
                        }}
                      />

                      {/* Animated particles */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          overflow: 'hidden',
                          zIndex: 0,
                          opacity: 0.4,
                          '&::before, &::after': {
                            content: '""',
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backgroundImage: darkMode
                              ? 'radial-gradient(circle at 10% 20%, rgba(115, 139, 255, 0.3) 0%, transparent 8%), radial-gradient(circle at 80% 30%, rgba(255, 94, 177, 0.3) 0%, transparent 8%)'
                              : 'radial-gradient(circle at 10% 20%, rgba(67, 97, 238, 0.2) 0%, transparent 8%), radial-gradient(circle at 80% 30%, rgba(247, 37, 133, 0.2) 0%, transparent 8%)',
                            backgroundSize: '3000% 3000%',
                            animation: 'particleDrift 100s infinite linear',
                          }
                        }}
                      />

                      {/* Content */}
                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        {/* Ultra-Premium icon container */}
                        <Box
                          className="upload-icon-container"
                          sx={{
                            width: 160,
                            height: 160,
                            borderRadius: '50%',
                            backgroundColor: darkMode ? 'rgba(115, 139, 255, 0.2)' : 'rgba(67, 97, 238, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 5,
                            transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: darkMode
                              ? '0 15px 40px rgba(115, 139, 255, 0.25), 0 0 0 1px rgba(115, 139, 255, 0.2)'
                              : '0 15px 40px rgba(67, 97, 238, 0.15), 0 0 0 1px rgba(67, 97, 238, 0.1)',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '200%',
                              height: '100%',
                              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                              animation: 'shimmer 3s infinite ease-in-out',
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              inset: '1px',
                              borderRadius: '50%',
                              background: darkMode
                                ? 'linear-gradient(135deg, rgba(115, 139, 255, 0.3), rgba(255, 94, 177, 0.15))'
                                : 'linear-gradient(135deg, rgba(67, 97, 238, 0.15), rgba(247, 37, 133, 0.08))',
                              zIndex: 0,
                            }
                          }}
                        >
                          <CloudUpload
                            className="upload-icon"
                            sx={{
                              fontSize: 80,
                              color: darkMode ? 'rgba(164, 184, 255, 0.95)' : 'rgba(67, 97, 238, 0.95)',
                              transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                              position: 'relative',
                              zIndex: 1,
                              filter: darkMode
                                ? 'drop-shadow(0 0 15px rgba(115, 139, 255, 0.6))'
                                : 'drop-shadow(0 0 15px rgba(67, 97, 238, 0.4))',
                            }}
                          />
                        </Box>

                        {/* Heading with enhanced typography */}
                        <Typography
                          variant="h3"
                          sx={{
                            fontWeight: 800,
                            mb: 3,
                            color: darkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)',
                            textShadow: darkMode
                              ? '0 4px 30px rgba(115, 139, 255, 0.3)'
                              : '0 4px 30px rgba(67, 97, 238, 0.2)',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          Drag & Drop Your Screenplay
                        </Typography>

                        {/* Enhanced subtext */}
                        <Typography
                          variant="h5"
                          sx={{
                            mb: 6,
                            fontWeight: 500,
                            color: darkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
                            maxWidth: 600,
                            mx: 'auto',
                            lineHeight: 1.5,
                            letterSpacing: '0.01em',
                          }}
                        >
                          or click to browse your files
                        </Typography>

                        {/* Ultra-Premium button */}
                        <Button
                          variant="contained"
                          className="upload-button"
                          startIcon={<UploadFile sx={{ fontSize: 26 }} />}
                          sx={{
                            px: 6,
                            py: 2,
                            borderRadius: 16,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            background: darkMode
                              ? 'linear-gradient(90deg, #738bff, #a483ff, #ff5eb1, #738bff)'
                              : 'linear-gradient(90deg, #4361ee, #7B4AE2, #f72585, #4361ee)',
                            backgroundSize: '300% 300%',
                            animation: 'gradientShift 8s ease infinite',
                            boxShadow: darkMode
                              ? '0 15px 40px rgba(115, 139, 255, 0.4)'
                              : '0 15px 40px rgba(67, 97, 238, 0.3)',
                            transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                            textTransform: 'none',
                            letterSpacing: '0.02em',
                            '&:hover': {
                              transform: 'translateY(-5px) scale(1.05)',
                              boxShadow: darkMode
                                ? '0 20px 50px rgba(115, 139, 255, 0.6)'
                                : '0 20px 50px rgba(67, 97, 238, 0.4)',
                            },
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              inset: '-4px',
                              background: darkMode
                                ? 'linear-gradient(90deg, #738bff, #ff5eb1, #738bff)'
                                : 'linear-gradient(90deg, #4361ee, #f72585, #4361ee)',
                              backgroundSize: '300% 300%',
                              animation: 'gradientShift 4s ease infinite',
                              borderRadius: 18,
                              zIndex: -1,
                              filter: 'blur(10px)',
                              opacity: 0.8,
                              transition: 'opacity 0.4s ease',
                            },
                            '&:hover::before': {
                              opacity: 1,
                            }
                          }}
                        >
                          Select Your Screenplay
                        </Button>

                        {/* Enhanced file info */}
                        <Typography
                          variant="subtitle1"
                          sx={{
                            display: 'block',
                            mt: 5,
                            color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 41, 59, 0.6)',
                            fontWeight: 500,
                            letterSpacing: '0.01em',
                            textShadow: darkMode ? '0 2px 10px rgba(0, 0, 0, 0.2)' : 'none',
                          }}
                        >
                          Supported format: .txt | Maximum file size: 10MB
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        maxWidth: 900,
                        mx: 'auto',
                        position: 'relative',
                        perspective: '1000px',
                      }}
                    >
                      {/* Enhanced animated background effects */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -20,
                          left: -20,
                          right: -20,
                          bottom: -20,
                          borderRadius: 8,
                          background: darkMode
                            ? 'linear-gradient(135deg, #738bff, #a483ff, #ff5eb1, #738bff)'
                            : 'linear-gradient(135deg, #4361ee, #7B4AE2, #f72585, #4361ee)',
                          backgroundSize: '400% 400%',
                          animation: 'gradientShift 10s linear infinite',
                          opacity: 0.8,
                          filter: 'blur(25px)',
                          zIndex: 0,
                          transform: 'translateZ(-10px) rotateX(5deg)',
                        }}
                      />

                      {/* Floating particles */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -10,
                          left: -10,
                          right: -10,
                          bottom: -10,
                          overflow: 'hidden',
                          zIndex: 0,
                          opacity: 0.4,
                          borderRadius: 8,
                          '&::before, &::after': {
                            content: '""',
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            backgroundImage: darkMode
                              ? 'radial-gradient(circle at 10% 20%, rgba(115, 139, 255, 0.3) 0%, transparent 8%), radial-gradient(circle at 80% 30%, rgba(255, 94, 177, 0.3) 0%, transparent 8%)'
                              : 'radial-gradient(circle at 10% 20%, rgba(67, 97, 238, 0.2) 0%, transparent 8%), radial-gradient(circle at 80% 30%, rgba(247, 37, 133, 0.2) 0%, transparent 8%)',
                            backgroundSize: '3000% 3000%',
                            animation: 'particleDrift 100s infinite linear',
                          }
                        }}
                      />

                      {/* Text area container with 3D effect */}
                      <Box
                        sx={{
                          position: 'relative',
                          zIndex: 1,
                          transform: 'translateZ(0)',
                          borderRadius: 6,
                          overflow: 'hidden',
                          boxShadow: darkMode
                            ? '0 25px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(115, 139, 255, 0.2)'
                            : '0 25px 80px rgba(67, 97, 238, 0.2), 0 0 0 1px rgba(67, 97, 238, 0.1)',
                          transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                          '&:hover': {
                            transform: 'translateY(-10px) translateZ(10px)',
                            boxShadow: darkMode
                              ? '0 40px 100px rgba(115, 139, 255, 0.3), 0 0 0 1px rgba(115, 139, 255, 0.3)'
                              : '0 40px 100px rgba(67, 97, 238, 0.25), 0 0 0 1px rgba(67, 97, 238, 0.2)',
                          }
                        }}
                      >
                        {/* Ultra-Premium text area with enhanced styling */}
                        <TextField
                          multiline
                          rows={16}
                          fullWidth
                          value={scriptText}
                          onChange={(e) => setScriptText(e.target.value)}
                          placeholder="Paste or type your screenplay here..."
                          sx={{
                            position: 'relative',
                            zIndex: 1,
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: darkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                              backdropFilter: 'blur(30px)',
                              borderRadius: 6,
                              fontFamily: '"Courier New", monospace',
                              fontSize: '1rem',
                              lineHeight: 1.8,
                              letterSpacing: '0.01em',
                              transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                              border: 'none',
                              boxShadow: darkMode
                                ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)'
                                : 'inset 0 2px 4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.02)',
                              overflow: 'hidden',
                              '&:hover': {
                                boxShadow: darkMode
                                  ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(115, 139, 255, 0.2)'
                                  : 'inset 0 2px 4px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(67, 97, 238, 0.1)',
                              },
                              '&.Mui-focused': {
                                boxShadow: darkMode
                                  ? 'inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 2px rgba(115, 139, 255, 0.3)'
                                  : 'inset 0 2px 4px rgba(0, 0, 0, 0.04), 0 0 0 2px rgba(67, 97, 238, 0.2)',
                              },
                              '& textarea': {
                                padding: '24px 28px',
                                color: darkMode ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)',
                              }
                            },
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: 'none',
                            },
                            '& .MuiInputBase-input::placeholder': {
                              color: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(30, 41, 59, 0.4)',
                              opacity: 1,
                              fontStyle: 'italic',
                              fontSize: '1.1rem',
                            }
                          }}
                        />
                      </Box>

                      {/* Button container with floating effect */}
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          mt: 6,
                          mb: 2,
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        {/* Glowing effect behind button */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '250px',
                            height: '100px',
                            borderRadius: '30px',
                            background: darkMode
                              ? 'radial-gradient(ellipse, rgba(115, 139, 255, 0.3) 0%, rgba(255, 94, 177, 0.2) 50%, transparent 80%)'
                              : 'radial-gradient(ellipse, rgba(67, 97, 238, 0.2) 0%, rgba(247, 37, 133, 0.1) 50%, transparent 80%)',
                            filter: 'blur(20px)',
                            opacity: 0.8,
                            zIndex: 0,
                          }}
                        />

                        {/* Ultra-Premium button for text input */}
                        <Button
                          variant="contained"
                          onClick={handleTextSubmit}
                          disabled={loading || !scriptText.trim()}
                          startIcon={<Movie sx={{ fontSize: 26 }} />}
                          sx={{
                            px: 6,
                            py: 2.5,
                            borderRadius: 16,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            background: darkMode
                              ? 'linear-gradient(90deg, #738bff, #a483ff, #ff5eb1, #738bff)'
                              : 'linear-gradient(90deg, #4361ee, #7B4AE2, #f72585, #4361ee)',
                            backgroundSize: '300% 300%',
                            animation: 'gradientShift 8s ease infinite',
                            boxShadow: darkMode
                              ? '0 15px 40px rgba(115, 139, 255, 0.4)'
                              : '0 15px 40px rgba(67, 97, 238, 0.3)',
                            transition: 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
                            textTransform: 'none',
                            letterSpacing: '0.02em',
                            zIndex: 1,
                            '&:hover': {
                              transform: 'translateY(-8px) scale(1.05)',
                              boxShadow: darkMode
                                ? '0 25px 50px rgba(115, 139, 255, 0.6)'
                                : '0 25px 50px rgba(67, 97, 238, 0.4)',
                            },
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              inset: '-4px',
                              background: darkMode
                                ? 'linear-gradient(90deg, #738bff, #ff5eb1, #738bff)'
                                : 'linear-gradient(90deg, #4361ee, #f72585, #4361ee)',
                              backgroundSize: '300% 300%',
                              animation: 'gradientShift 4s ease infinite',
                              borderRadius: 18,
                              zIndex: -1,
                              filter: 'blur(10px)',
                              opacity: 0.8,
                              transition: 'opacity 0.4s ease',
                            },
                            '&:hover::before': {
                              opacity: 1,
                            },
                            '&.Mui-disabled': {
                              background: darkMode
                                ? 'linear-gradient(90deg, rgba(115, 139, 255, 0.3), rgba(255, 94, 177, 0.3))'
                                : 'linear-gradient(90deg, rgba(67, 97, 238, 0.3), rgba(247, 37, 133, 0.3))',
                              color: darkMode ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.6)',
                              boxShadow: 'none',
                              '&::before': {
                                opacity: 0,
                              }
                            }
                          }}
                        >
                          Analyze Screenplay
                        </Button>
                      </Box>

                      {/* Helpful text */}
                      <Typography
                        variant="subtitle1"
                        sx={{
                          textAlign: 'center',
                          color: darkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(30, 41, 59, 0.6)',
                          fontWeight: 500,
                          mt: 2,
                          letterSpacing: '0.01em',
                        }}
                      >
                        Paste your screenplay in any format - our AI will analyze and structure it
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* Ultra-Premium Features Section */}
              <Box sx={{ mt: 8 }}>


                {/* Features section removed as requested */}
              </Box>

              {/* Add enhanced keyframes for animations */}
              <style jsx global>{`
                @keyframes pulse {
                  0% {
                    transform: rotate(0deg);
                  }
                  100% {
                    transform: rotate(360deg);
                  }
                }

                @keyframes pulseGlow {
                  0% {
                    opacity: 0.4;
                    transform: translate(-50%, -50%) scale(0.95);
                  }
                  100% {
                    opacity: 0.7;
                    transform: translate(-50%, -50%) scale(1.05);
                  }
                }

                @keyframes gradientShift {
                  0% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                  100% {
                    background-position: 0% 50%;
                  }
                }

                @keyframes shimmer {
                  0% {
                    transform: translateX(-100%);
                  }
                  100% {
                    transform: translateX(100%);
                  }
                }

                @keyframes particleDrift {
                  0% {
                    background-position: 0% 0%;
                  }
                  100% {
                    background-position: 100% 100%;
                  }
                }

                @keyframes floatUp {
                  0% {
                    transform: translateY(0);
                  }
                  50% {
                    transform: translateY(-15px);
                  }
                  100% {
                    transform: translateY(0);
                  }
                }
              `}</style>
            </Box>
          </TabPanel>

          <TabPanel value={currentTab} index={1}>
            {/* Script Analysis Tab */}
            <Paper style={{ padding: '16px', borderRadius: 4, backdropFilter: 'blur(10px)' }}>
              <Typography variant="h4" gutterBottom fontWeight={700} style={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, #a4b8ff, #ff90d1)'
                  : 'linear-gradient(90deg, #4361ee, #f72585)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Script Analysis
              </Typography>
              {scriptData ? (
                <Box>
                  {/* Tabs for different analysis views */}
                  <Tabs
                    value={scriptAnalysisView}
                    onChange={handleScriptAnalysisViewChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      marginBottom: 3,
                      borderBottom: 1,
                      borderColor: 'divider',
                      '& .MuiTabs-scrollButtons.Mui-disabled': {
                        opacity: 0.3
                      }
                    }}
                  >
                    <Tab
                      value="timeline"
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Timeline fontSize="small" />
                          <span>Timeline</span>
                        </Box>
                      }
                    />
                    <Tab
                      value="scene-analysis"
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <ViewList fontSize="small" />
                          <span>Scene Analysis</span>
                        </Box>
                      }
                    />
                    <Tab
                      value="technical"
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Tune fontSize="small" />
                          <span>Technical Requirements</span>
                        </Box>
                      }
                    />
                    <Tab
                      value="department"
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BarChart fontSize="small" />
                          <span>Department Analysis</span>
                        </Box>
                      }
                    />
                    <Tab
                      value="raw"
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Code fontSize="small" />
                          <span>Raw Data</span>
                        </Box>
                      }
                    />
                  </Tabs>

                  {/* Timeline Tab Panel */}
                  {scriptAnalysisView === 'timeline' && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Script Timeline Overview</Typography>
                      {scriptData?.parsed_data?.timeline && (
                        <Box>
                          {/* Summary Cards */}
                          <Grid container spacing={3} sx={{ mb: 4 }}>
                            <Grid item xs={12} md={3}>
                              <Card>
                                <CardContent>
                                  <Typography color="textSecondary" gutterBottom>Total Duration</Typography>
                                  <Typography variant="h4">{scriptData.parsed_data.timeline.total_duration}</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Card>
                                <CardContent>
                                  <Typography color="textSecondary" gutterBottom>Average Scene Duration</Typography>
                                  <Typography variant="h4">{scriptData.parsed_data.timeline.average_scene_duration} min</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Card>
                                <CardContent>
                                  <Typography color="textSecondary" gutterBottom>Total Scenes</Typography>
                                  <Typography variant="h4">{scriptData.parsed_data.timeline.scene_breakdown.length}</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                            <Grid item xs={12} md={3}>
                              <Card>
                                <CardContent>
                                  <Typography color="textSecondary" gutterBottom>Total Pages</Typography>
                                  <Typography variant="h4">{scriptData.parsed_data.timeline.total_pages || 'N/A'}</Typography>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>

                          {/* Scene Breakdown Table */}
                          <Typography variant="h6" gutterBottom>Scene Breakdown</Typography>
                          <TableContainer component={Paper}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Scene</TableCell>
                                  <TableCell>Start Time</TableCell>
                                  <TableCell>End Time</TableCell>
                                  <TableCell>Location</TableCell>
                                  <TableCell>Characters</TableCell>
                                  <TableCell>Technical Complexity</TableCell>
                                  <TableCell>Setup Time</TableCell>
                                </Tabl
                                </Tabl
                                          {scriptData.parsed_data.timeline.scene_breakdown.map((scene) => (
                                    <TableCell>{scene.end_time}</TableCell>
                                    <TableCell>{scene.location}</TableCell>
                                    <TableCell>{scene.characters.join(', ')}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={scene.technical_complexity}
                                        color={
                                          scene.technical_complexity > 7 ? 'error' :
                                          scene.technical_complexity > 4 ? 'warning' : 'success'
                                        }
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell>{scene.setup_time} minutes</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    </Box>
                  )}

                  {scriptAnalysisView === 'scene-analysis' && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Scene Analysis</Typography>
                      {scriptData?.parsed_data?.scenes && (
                        <Box>
                          {/* Scene Cards */}
                          <Grid container spacing={3}>
                            {scriptData.parsed_data.scenes.map((scene) => (
                              <Grid item xs={12} key={scene.scene_number}>
                                <Card>
                                  <CardContent>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                      <Typography variant="h6">Scene {scene.scene_number}</Typography>
                                      <Chip
                                        label={`Complexity: ${
                                          (scene.technical_cues?.length || 0) +
                                          (scene.main_characters?.length || 0) +
                                          Object.values(scene.department_notes || {}).reduce((sum, notes) =>
                                            sum + (notes?.length || 0), 0)
                                        }`}
                                        color={scene.complexity_score > 10 ? 'error' : scene.complexity_score > 5 ? 'warning' : 'success'}
                                      />
                                    </Box>

                                    <Grid container spacing={2}>
                                      <Grid item xs={12} md={6}>
                                        <Typography variant="body1" gutterBottom>
                                          <strong>Location:</strong> {scene.location?.place || 'N/A'}
                                        </Typography>
                                        <Typography variant="body1" gutterBottom>
                                          <strong>Time:</strong> {scene.time || 'N/A'}
                                        </Typography>
                                        <Typography variant="body1" gutterBottom>
                                          <strong>Description:</strong> {scene.description || 'N/A'}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12} md={6}>
                                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                          <Chip
                                            label={`${scene.main_characters?.length || 0} Characters`}
                                            color="primary"
                                            variant="outlined"
                                          />
                                          <Chip
                                            label={`${scene.technical_cues?.length || 0} Technical Cues`}
                                            color="secondary"
                                            variant="outlined"
                                          />
                                          <Chip
                                            label={`${Object.keys(scene.department_notes || {}).length} Departments`}
                                            color="info"
                                            variant="outlined"
                                          />
                                        </Box>
                                      </Grid>
                                    </Grid>

                                    {/* Technical Cues */}
                                    {scene.technical_cues && scene.technical_cues.length > 0 && (
                                      <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Technical Cues:</Typography>
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                          {scene.technical_cues.map((cue, index) => (
                                            <Chip key={index} label={cue} size="small" />
                                          ))}
                                        </Box>
                                      </Box>
                                    )}

                                    {/* Department Notes */}
                                    {Object.entries(scene.department_notes || {}).length > 0 && (
                                      <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" gutterBottom>Department Notes:</Typography>
                                        <Grid container spacing={2}>
                                          {Object.entries(scene.department_notes).map(([dept, notes]) => (
                                            <Grid item xs={12} md={6} key={dept}>
                                              <Typography variant="body2" fontWeight="bold">{dept}:</Typography>
                                              <List dense>
                                                {notes.map((note, index) => (
                                                  <ListItem key={index}>
                                                    <ListItemText primary={note} />
                                                  </ListItem>
                                                ))}
                                              </List>
                                            </Grid>
                                          ))}
                                        </Grid>
                                      </Box>
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}
                    </Box>
                  )}

                  {scriptAnalysisView === 'technical' && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Technical Requirements</Typography>
                      {scriptData?.metadata && (
                        <Box>
                          {/* Global Requirements */}
                          <Card sx={{ mb: 4 }}>
                            <CardHeader title="Global Requirements" />
                            <CardContent>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                  <Typography variant="subtitle1" gutterBottom>Equipment</Typography>
                                  <List dense>
                                    {scriptData.metadata.global_requirements?.equipment.map((item, index) => (
                                      <ListItem key={index}>
                                        <ListItemIcon>
                                          <Movie />
                                        </ListItemIcon>
                                        <ListItemText primary={item} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Typography variant="subtitle1" gutterBottom>Props</Typography>
                                  <List dense>
                                    {scriptData.metadata.global_requirements?.props.map((item, index) => (
                                      <ListItem key={index}>
                                        <ListItemIcon>
                                          <Theaters />
                                        </ListItemIcon>
                                        <ListItemText primary={item} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Typography variant="subtitle1" gutterBottom>Special Effects</Typography>
                                  <List dense>
                                    {scriptData.metadata.global_requirements?.special_effects.map((item, index) => (
                                      <ListItem key={index}>
                                        <ListItemIcon>
                                          <Movie />
                                        </ListItemIcon>
                                        <ListItemText primary={item} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>

                          {/* Scene-specific Requirements */}
                          <Typography variant="h6" gutterBottom>Scene-specific Requirements</Typography>
                          {scriptData.metadata.scene_metadata.map((scene) => (
                            <Accordion key={scene.scene_number}>
                              <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography>Scene {scene.scene_number} Technical Details</Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Grid container spacing={3}>
                                  {/* Lighting */}
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1" gutterBottom>Lighting</Typography>
                                    <Typography variant="body2">Type: {scene.lighting?.type || 'N/A'}</Typography>
                                    <List dense>
                                      {scene.lighting?.requirements?.map((req, index) => (
                                        <ListItem key={index}>
                                          <ListItemText primary={req} />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Grid>

                                  {/* Props */}
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1" gutterBottom>Props</Typography>
                                    {Object.entries(scene.props || {}).map(([category, items]) => (
                                      <Box key={category} sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2">{category}</Typography>
                                        <List dense>
                                          {items.map((item, index) => (
                                            <ListItem key={index}>
                                              <ListItemText primary={item} />
                                            </ListItem>
                                          ))}
                                        </List>
                                      </Box>
                                    ))}
                                  </Grid>

                                  {/* Technical */}
                                  <Grid item xs={12} md={4}>
                                    <Typography variant="subtitle1" gutterBottom>Technical</Typography>
                                    {Object.entries(scene.technical || {}).map(([category, items]) => (
                                      <Box key={category} sx={{ mb: 2 }}>
                                        <Typography variant="subtitle2">{category}</Typography>
                                        <List dense>
                                          {items.map((item, index) => (
                                            <ListItem key={index}>
                                              <ListItemText primary={item} />
                                            </ListItem>
                                          ))}
                                        </List>
                                      </Box>
                                    ))}
                                  </Grid>
                                </Grid>
                              </AccordionDetails>
                            </Accordion>
                          ))}
                        </Box>
                      )}
                    </Box>
                  )}

                  {scriptAnalysisView === 'department' && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Department Analysis</Typography>
                      {scriptData && (
                        <Box>
                          {/* Department Overview */}
                          <Grid container spacing={3} sx={{ mb: 4 }}>
                            {/* Camera Department */}
                            <Grid item xs={12} md={6} lg={4}>
                              <Card>
                                <CardHeader
                                  title="Camera Department"
                                  subheader={`${scriptData.metadata.scene_metadata.reduce((total, scene) =>
                                    total + (scene.department_notes.camera?.length || 0), 0)} Requirements`}
                                />
                                <CardContent>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="textSecondary">
                                      Equipment Required:
                                    </Typography>
                                    <List dense>
                                      {scriptData.metadata.scene_metadata.map((scene, index) => (
                                        scene.department_notes.camera?.map((req, reqIndex) => (
                                          <ListItem key={`${index}-${reqIndex}`}>
                                            <ListItemIcon>
                                              <CameraAlt />
                                            </ListItemIcon>
                                            <ListItemText
                                              primary={req}
                                              secondary={`Scene ${scene.scene_number}`}
                                            />
                                          </ListItem>
                                        ))
                                      ))}
                                    </List>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>

                            {/* Sound Department */}
                            <Grid item xs={12} md={6} lg={4}>
                              <Card>
                                <CardHeader
                                  title="Sound Department"
                                  subheader={`${scriptData.metadata.scene_metadata.reduce((total, scene) =>
                                    total + (scene.department_notes.sound?.length || 0), 0)} Requirements`}
                                />
                                <CardContent>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="textSecondary">
                                      Equipment Required:
                                    </Typography>
                                    <List dense>
                                      {scriptData.metadata.scene_metadata.map((scene, index) => (
                                        scene.department_notes.sound?.map((req, reqIndex) => (
                                          <ListItem key={`${index}-${reqIndex}`}>
                                            <ListItemIcon>
                                              <VolumeUp />
                                            </ListItemIcon>
                                            <ListItemText
                                              primary={req}
                                              secondary={`Scene ${scene.scene_number}`}
                                            />
                                          </ListItem>
                                        ))
                                      ))}
                                    </List>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>

                            {/* Lighting Department */}
                            <Grid item xs={12} md={6} lg={4}>
                              <Card>
                                <CardHeader
                                  title="Lighting Department"
                                  subheader={`${scriptData.metadata.scene_metadata.reduce((total, scene) =>
                                    total + (scene.department_notes.lighting?.length || 0), 0)} Requirements`}
                                />
                                <CardContent>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="textSecondary">
                                      Equipment Required:
                                    </Typography>
                                    <List dense>
                                      {scriptData.metadata.scene_metadata.map((scene, index) => (
                                        scene.department_notes.lighting?.map((req, reqIndex) => (
                                          <ListItem key={`${index}-${reqIndex}`}>
                                            <ListItemIcon>
                                              <Lightbulb />
                                            </ListItemIcon>
                                            <ListItemText
                                              primary={req}
                                              secondary={`Scene ${scene.scene_number}`}
                                            />
                                          </ListItem>
                                        ))
                                      ))}
                                    </List>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>

                            {/* Props Department */}
                            <Grid item xs={12} md={6} lg={4}>
                              <Card>
                                <CardHeader
                                  title="Props Department"
                                  subheader={`${scriptData.metadata.scene_metadata.reduce((total, scene) =>
                                    total + (scene.department_notes.props?.length || 0), 0)} Requirements`}
                                />
                                <CardContent>
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="body2" color="textSecondary">
                                      Equipment Required:
                                    </Typography>
                                    <List dense>
                                      {scriptData.metadata.scene_metadata.map((scene, index) => (
                                        scene.department_notes.props?.map((req, reqIndex) => (
                                          <ListItem key={`${index}-${reqIndex}`}>
                                            <ListItemIcon>
                                              <Theaters />
                                            </ListItemIcon>
                                            <ListItemText
                                              primary={req}
                                              secondary={`Scene ${scene.scene_number}`}
                                            />
                                          </ListItem>
                                        ))
                                      ))}
                                    </List>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          </Grid>

                          {/* Scene-by-Scene Department Requirements */}
                          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Scene-by-Scene Department Requirements</Typography>
                          {scriptData.metadata.scene_metadata.map((scene) => (
                            <Accordion key={scene.scene_number}>
                              <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography>Scene {scene.scene_number} - Department Requirements</Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Grid container spacing={2}>
                                  {Object.entries(scene.department_notes).map(([dept, requirements]) => (
                                    <Grid item xs={12} md={6} key={dept}>
                                      <Typography variant="subtitle2" gutterBottom>
                                        {dept.charAt(0).toUpperCase() + dept.slice(1)}:
                                      </Typography>
                                      <List dense>
                                        {requirements.map((req, index) => (
                                          <ListItem key={index}>
                                            <ListItemIcon>
                                              {dept === 'camera' && <CameraAlt />}
                                              {dept === 'sound' && <VolumeUp />}
                                              {dept === 'lighting' && <Lightbulb />}
                                              {dept === 'props' && <Theaters />}
                                            </ListItemIcon>
                                            <ListItemText primary={req} />
                                          </ListItem>
                                        ))}
                                      </List>
                                    </Grid>
                                  ))}
                                </Grid>
                              </AccordionDetails>
                            </Accordion>
                          ))}

                          {/* Global Requirements */}
                          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Global Requirements</Typography>
                          <Card>
                            <CardContent>
                              <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                  <Typography variant="subtitle1" gutterBottom>Equipment:</Typography>
                                  <List dense>
                                    {scriptData.metadata.global_requirements.equipment.map((item, index) => (
                                      <ListItem key={index}>
                                        <ListItemIcon>
                                          <Build />
                                        </ListItemIcon>
                                        <ListItemText primary={item} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Typography variant="subtitle1" gutterBottom>Props:</Typography>
                                  <List dense>
                                    {scriptData.metadata.global_requirements.props.map((item, index) => (
                                      <ListItem key={index}>
                                        <ListItemIcon>
                                          <Theaters />
                                        </ListItemIcon>
                                        <ListItemText primary={item} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                  <Typography variant="subtitle1" gutterBottom>Special Effects:</Typography>
                                  <List dense>
                                    {scriptData.metadata.global_requirements.special_effects.map((item, index) => (
                                      <ListItem key={index}>
                                        <ListItemIcon>
                                          <Movie />
                                        </ListItemIcon>
                                        <ListItemText primary={item} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </Grid>
                              </Grid>
                            </CardContent>
                          </Card>

                          {/* Technical Validation */}
                          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Technical Validation</Typography>
                          <Card>
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom>Department Conflicts:</Typography>
                              <List dense>
                                {scriptData.validation.validation_report.technical_validation.department_conflicts.map((conflict, index) => (
                                  <ListItem key={index}>
                                    <ListItemIcon>
                                      <Warning color="warning" />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={`Scene ${conflict.scene_number}`}
                                      secondary={conflict.conflict}
                                    />
                                  </ListItem>
                                ))}
                              </List>
                            </CardContent>
                          </Card>
                        </Box>
                      )}
                    </Box>
                  )}

                  {scriptAnalysisView === 'raw' && (
                    <Box>
                      <Typography variant="h6" gutterBottom>Raw Data</Typography>
                      <Box sx={{ mb: 3 }}>
                        <Button
                          variant="outlined"
                          startIcon={<Download />}
                          onClick={() => {
                            const jsonStr = JSON.stringify(scriptData, null, 2);
                            const blob = new Blob([jsonStr], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'script_analysis.json';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                          }}
                        >
                          Download Full Analysis
                        </Button>
                      </Box>
                      <Paper sx={{ p: 2, maxHeight: '500px', overflow: 'auto' }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                          {JSON.stringify(scriptData, null, 2)}
                        </pre>
                      </Paper>
                    </Box>
                  )}

                  {/* Navigation buttons */}
                  <Box style={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={() => setCurrentTab(0)}
                    >
                      Back to Upload
                    </Button>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForward />}
                      onClick={() => {
                        if (!oneLinerData) {
                          generateOneLiner();
                        }
                        setCurrentTab(2);
                      }}
                    >
                      Continue to One-Liner
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    Please upload or enter a script first to see the analysis.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<ArrowBack />}
                    onClick={() => setCurrentTab(0)}
                  >
                    Go to Upload
                  </Button>
                </Box>
              )}
            </Paper>
          </TabPanel>

          <TabPanel value={currentTab} index={2}>
            {/* One-Liner Tab */}
            <Paper
              elevation={0}
              sx={{
                p: 4,
                borderRadius: 4,
                backdropFilter: 'blur(10px)',
                background: theme.palette.mode === 'dark'
                  ? 'rgba(19, 47, 76, 0.5)'
                  : 'rgba(255, 255, 255, 0.5)',
                border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                transition: 'all 0.3s ease'
              }}
            >
              <Typography
                variant="h4"
                gutterBottom
                fontWeight={700}
                sx={{
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(90deg, #a4b8ff, #ff90d1)'
                    : 'linear-gradient(90deg, #4361ee, #f72585)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <TextFields sx={{
                  fontSize: 32,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(90deg, #a4b8ff, #ff90d1)'
                    : 'linear-gradient(90deg, #4361ee, #f72585)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }} />
                One-Liner Creation Module
              </Typography>
              {scriptData ? (
                <Box>
                  {!oneLinerData ? (
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        my: 8,
                        gap: 3
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          textAlign: 'center',
                          maxWidth: 600,
                          mb: 2,
                          color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'
                        }}
                      >
                        Transform your script into concise, impactful one-liners that capture the essence of each scene
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={generateOneLiner}
                        disabled={loading}
                        startIcon={<TextFields />}
                        size="large"
                        sx={{
                          background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(90deg, #738bff, #ff5eb1)'
                            : 'linear-gradient(90deg, #4361ee, #f72585)',
                          px: 6,
                          py: 2,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          borderRadius: 3,
                          boxShadow: theme.palette.mode === 'dark'
                            ? '0 0 20px rgba(115,139,255,0.3)'
                            : '0 0 20px rgba(67,97,238,0.2)',
                          '&:hover': {
                            background: theme.palette.mode === 'dark'
                              ? 'linear-gradient(90deg, #8599ff, #ff6eb8)'
                              : 'linear-gradient(90deg, #5472ff, #f83a91)',
                            transform: 'translateY(-2px)',
                            boxShadow: theme.palette.mode === 'dark'
                              ? '0 0 25px rgba(115,139,255,0.4)'
                              : '0 0 25px rgba(67,97,238,0.3)',
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Generate One-Liners
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        gap: 4
                      }}>
                        <Box sx={{ flex: '1 1 66%' }}>
                          <Typography
                            variant="h6"
                            gutterBottom
                            sx={{
                              fontWeight: 600,
                              mb: 3,
                              color: theme.palette.mode === 'dark' ? '#a4b8ff' : '#4361ee'
                            }}
                          >
                            Scene Summaries
                          </Typography>

                          {oneLinerData && oneLinerData.scenes && oneLinerData.scenes.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {oneLinerData.scenes
                                .sort((a, b) => (a.scene_number || 0) - (b.scene_number || 0))
                                .map((scene, index) => (
                                  <Card
                                    key={scene.scene_number}
                                    sx={{
                                      borderLeft: '4px solid',
                                      borderColor: theme.palette.mode === 'dark' ? '#738bff' : '#4361ee',
                                      background: theme.palette.mode === 'dark'
                                        ? 'rgba(19, 47, 76, 0.5)'
                                        : 'rgba(255, 255, 255, 0.5)',
                                      backdropFilter: 'blur(10px)',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        transform: 'translateX(4px)',
                                        boxShadow: theme.palette.mode === 'dark'
                                          ? '0 4px 20px rgba(115,139,255,0.2)'
                                          : '0 4px 20px rgba(67,97,238,0.1)',
                                      }
                                    }}
                                  >
                                    <CardContent>
                                      <Typography
                                        variant="subtitle1"
                                        fontWeight="bold"
                                        gutterBottom
                                        sx={{
                                          color: theme.palette.mode === 'dark' ? '#a4b8ff' : '#4361ee'
                                        }}
                                      >
                                        Scene {scene.scene_number || '?'}
                                      </Typography>
                                      <Typography variant="body1">
                                        {scene.one_liner || 'No summary available'}
                                      </Typography>
                                    </CardContent>
                                  </Card>
                                ))}
                            </Box>
                          ) : (
                            <Typography variant="body1" color="textSecondary">
                              No scene summaries available.
                            </Typography>
                          )}
                        </Box>

                        <Box sx={{ flex: '1 1 33%' }}>
                          <Card sx={{
                            mb: 3,
                            background: theme.palette.mode === 'dark'
                              ? 'rgba(19, 47, 76, 0.5)'
                              : 'rgba(255, 255, 255, 0.5)',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          }}>
                            <CardContent>
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.mode === 'dark' ? '#a4b8ff' : '#4361ee',
                                  mb: 3
                                }}
                              >
                                Export Options
                              </Typography>

                              <Button
                                variant="contained"
                                startIcon={<Refresh />}
                                fullWidth
                                onClick={generateOneLiner}
                                disabled={loading}
                                sx={{
                                  mb: 2,
                                  background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(90deg, #738bff, #ff5eb1)'
                                    : 'linear-gradient(90deg, #4361ee, #f72585)',
                                  '&:hover': {
                                    background: theme.palette.mode === 'dark'
                                      ? 'linear-gradient(90deg, #8599ff, #ff6eb8)'
                                      : 'linear-gradient(90deg, #5472ff, #f83a91)',
                                  }
                                }}
                              >
                                Regenerate One-Liners
                              </Button>

                              <Divider sx={{ my: 2 }} />

                              <Button
                                variant="outlined"
                                startIcon={<Download />}
                                fullWidth
                                sx={{
                                  mb: 2,
                                  borderColor: theme.palette.mode === 'dark' ? '#738bff' : '#4361ee',
                                  color: theme.palette.mode === 'dark' ? '#738bff' : '#4361ee',
                                  '&:hover': {
                                    borderColor: theme.palette.mode === 'dark' ? '#8599ff' : '#5472ff',
                                    backgroundColor: theme.palette.mode === 'dark'
                                      ? 'rgba(115,139,255,0.1)'
                                      : 'rgba(67,97,238,0.1)',
                                  }
                                }}
                                onClick={() => {
                                  const jsonStr = JSON.stringify(oneLinerData, null, 2);
                                  const blob = new Blob([jsonStr], { type: 'application/json' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = 'one_liners.json';
                                  document.body.appendChild(a);
                                  a.click();
                                  document.body.removeChild(a);
                                  URL.revokeObjectURL(url);
                                }}
                              >
                                Download One-Liners (JSON)
                              </Button>
                            </CardContent>
                          </Card>

                          <Card sx={{
                            background: theme.palette.mode === 'dark'
                              ? 'rgba(19, 47, 76, 0.5)'
                              : 'rgba(255, 255, 255, 0.5)',
                            backdropFilter: 'blur(10px)',
                            border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                          }}>
                            <CardContent>
                              <Typography
                                variant="h6"
                                gutterBottom
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.mode === 'dark' ? '#a4b8ff' : '#4361ee',
                                  mb: 2
                                }}
                              >
                                Overall Summary
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{
                                  color: theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.9)'
                                    : 'rgba(0,0,0,0.9)',
                                  lineHeight: 1.6
                                }}
                              >
                                {oneLinerData && (oneLinerData.overall_summary || oneLinerData.one_liner || 'No overall summary available.')}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Box>
                      </Box>

                      {/* Navigation buttons */}
                      <Box sx={{
                        mt: 4,
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 2
                      }}>
                        <Button
                          variant="outlined"
                          startIcon={<ArrowBack />}
                          onClick={() => setCurrentTab(1)}
                          sx={{
                            borderColor: theme.palette.mode === 'dark' ? '#738bff' : '#4361ee',
                            color: theme.palette.mode === 'dark' ? '#738bff' : '#4361ee',
                            '&:hover': {
                              borderColor: theme.palette.mode === 'dark' ? '#8599ff' : '#5472ff',
                              backgroundColor: theme.palette.mode === 'dark'
                                ? 'rgba(115,139,255,0.1)'
                                : 'rgba(67,97,238,0.1)',
                            }
                          }}
                        >
                          Back to Script Analysis
                        </Button>
                        <Button
                          variant="contained"
                          endIcon={<ArrowForward />}
                          onClick={() => {
                            if (!characterData) {
                              analyzeCharacters();
                            }
                            setCurrentTab(3);
                          }}
                          sx={{
                            background: theme.palette.mode === 'dark'
                              ? 'linear-gradient(90deg, #738bff, #ff5eb1)'
                              : 'linear-gradient(90deg, #4361ee, #f72585)',
                            '&:hover': {
                              background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(90deg, #8599ff, #ff6eb8)'
                                : 'linear-gradient(90deg, #5472ff, #f83a91)',
                            }
                          }}
                        >
                          Continue to Character Breakdown
                        </Button>
                      </Box>

                      {/* Success/Error messages */}
                      {success && (
                        <Alert
                          severity="success"
                          sx={{
                            mt: 2,
                            borderRadius: 2,
                            backgroundColor: theme.palette.mode === 'dark'
                              ? 'rgba(46, 125, 50, 0.2)'
                              : 'rgba(237, 247, 237, 0.9)',
                            backdropFilter: 'blur(10px)',
                            '& .MuiAlert-icon': {
                              color: theme.palette.mode === 'dark'
                                ? '#66bb6a'
                                : '#2e7d32'
                            }
                          }}
                          onClose={() => setSuccess(null)}
                        >
                          {success}
                        </Alert>
                      )}

                      {error && (
                        <Alert
                          severity="error"
                          sx={{
                            mt: 2,
                            borderRadius: 2,
                            backgroundColor: theme.palette.mode === 'dark'
                              ? 'rgba(211, 47, 47, 0.2)'
                              : 'rgba(253, 237, 237, 0.9)',
                            backdropFilter: 'blur(10px)',
                            '& .MuiAlert-icon': {
                              color: theme.palette.mode === 'dark'
                                ? '#ef5350'
                                : '#d32f2f'
                            }
                          }}
                          onClose={() => setError(null)}
                        >
                          {error}
                        </Alert>
                      )}
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  py: 4
                }}>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{
                      textAlign: 'center',
                      maxWidth: 500
                    }}
                  >
                    Please upload or enter a script first to generate one-liners.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<ArrowBack />}
                    onClick={() => setCurrentTab(0)}
                    sx={{
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(90deg, #738bff, #ff5eb1)'
                        : 'linear-gradient(90deg, #4361ee, #f72585)',
                      '&:hover': {
                        background: theme.palette.mode === 'dark'
                          ? 'linear-gradient(90deg, #8599ff, #ff6eb8)'
                          : 'linear-gradient(90deg, #5472ff, #f83a91)',
                      }
                    }}
                  >
                    Go to Upload
                  </Button>
                </Box>
              )}
            </Paper>
          </TabPanel>

          <TabPanel value={currentTab} index={3}>
            {/* Character Breakdown Tab */}
            <Paper style={{ padding: '16px', borderRadius: 4, backdropFilter: 'blur(10px)' }}>
              <Typography variant="h4" gutterBottom fontWeight={700} style={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, #a4b8ff, #ff90d1)'
                  : 'linear-gradient(90deg, #4361ee, #f72585)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Character Breakdown
              </Typography>
              {scriptData ? (
                <Box>
                  {!characterData ? (
                    <Button
                      variant="contained"
                      onClick={analyzeCharacters}
                      disabled={loading}
                      style={{
                        background: theme.palette.mode === 'dark'
                          ? 'linear-gradient(90deg, #738bff, #ff5eb1)'
                          : 'linear-gradient(90deg, #4361ee, #f72585)',
                      }}
                    >
                      Analyze Characters
                    </Button>
                  ) : (
                    <Box>
                      {/* Character Breakdown Tabs */}
                      <Tabs
                        value={characterBreakdownView}
                        onChange={(_, newValue) => setCharacterBreakdownView(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        sx={{
                          marginBottom: 3,
                          borderBottom: 1,
                          borderColor: 'divider',
                          '& .MuiTabs-scrollButtons.Mui-disabled': {
                            opacity: 0.3
                          }
                        }}
                      >
                        <Tab
                          value="profiles"
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Person fontSize="small" />
                              <span>Character Profiles</span>
                            </Box>
                          }
                        />
                        <Tab
                          value="relationships"
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <People fontSize="small" />
                              <span>Arc & Relationships</span>
                            </Box>
                          }
                        />
                        <Tab
                          value="matrix"
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ViewModule fontSize="small" />
                              <span>Scene Matrix</span>
                            </Box>
                          }
                        />
                        <Tab
                          value="statistics"
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <BarChart fontSize="small" />
                              <span>Statistics</span>
                            </Box>
                          }
                        />
                        <Tab
                          value="raw"
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Code fontSize="small" />
                              <span>Raw Data</span>
                            </Box>
                          }
                        />
                      </Tabs>

                      {/* Character Profiles View */}
                      {characterBreakdownView === 'profiles' && (
                        // Existing Character Profiles content
                        <Box>
                          {/* Add regenerate button at the top */}
                          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              variant="contained"
                              onClick={analyzeCharacters}
                              disabled={loading}
                              startIcon={<Refresh />}
                              sx={{
                                background: theme.palette.mode === 'dark'
                                  ? 'linear-gradient(90deg, #738bff, #ff5eb1)'
                                  : 'linear-gradient(90deg, #4361ee, #f72585)',
                                '&:hover': {
                                  background: theme.palette.mode === 'dark'
                                    ? 'linear-gradient(90deg, #8599ff, #ff6eb8)'
                                    : 'linear-gradient(90deg, #5472ff, #f83a91)',
                                }
                              }}
                            >
                              Regenerate Character Breakdown
                            </Button>
                          </Box>
                          {selectedCharacter ? (
                            // Detailed Character Profile View content
                            <Box>
                              <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                <Typography variant="h5" fontWeight="bold">
                                  {selectedCharacter}
                                </Typography>
                                <Button
                                  variant="outlined"
                                  startIcon={<ArrowBack />}
                                  onClick={() => setSelectedCharacter('')}
                                >
                                  Back to Characters
                                </Button>
                          </Box>

                              {/* Character Profile Tabs */}
                              <Tabs
                                value={0}
                                onChange={(e, newValue) => {}}
                                style={{ marginBottom: 3 }}
                              >
                                <Tab label="Overview" />
                                <Tab label="Dialogue & Actions" />
                                <Tab label="Emotional Journey" />
                                <Tab label="Technical Details" />
                              </Tabs>

                              {/* Character Overview */}
                            <Box>
                                <Box style={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, marginBottom: 3 }}>
                                  <Box style={{ flex: 1 }}>
                                    <Card>
                                <CardContent>
                                        <Typography variant="h6" gutterBottom>Character Overview</Typography>
                                        {characterData.characters[selectedCharacter].objectives && (
                                          <Typography variant="body1">
                                            <strong>Main Objective:</strong> {characterData.characters[selectedCharacter].objectives.main_objective || 'N/A'}
                                          </Typography>
                                        )}
                                </CardContent>
                              </Card>
                                  </Box>
                                  <Box style={{ flex: 1 }}>
                                    <Card>
                                <CardContent>
                                        <Typography variant="h6" gutterBottom>Dialogue Stats</Typography>
                                        {characterData.characters[selectedCharacter].dialogue_analysis && (
                                          <Box>
                                            <Typography variant="body1">
                                              <strong>Total Lines:</strong> {characterData.characters[selectedCharacter].dialogue_analysis.total_lines || 0}
                                            </Typography>
                                            <Typography variant="body1">
                                              <strong>Total Words:</strong> {characterData.characters[selectedCharacter].dialogue_analysis.total_words || 0}
                                            </Typography>
                                            <Typography variant="body1">
                                              <strong>Avg. Line Length:</strong> {characterData.characters[selectedCharacter].dialogue_analysis.average_line_length?.toFixed(1) || '0.0'}
                                            </Typography>
                                            <Typography variant="body1">
                                              <strong>Vocabulary Complexity:</strong> {characterData.characters[selectedCharacter].dialogue_analysis.vocabulary_complexity?.toFixed(2) || '0.00'}
                                            </Typography>
                                            </Box>
                                        )}
                                          </CardContent>
                                        </Card>
                                  </Box>
                                </Box>

                                {/* Scene Objectives */}
                                {characterData.characters[selectedCharacter].objectives &&
                                 characterData.characters[selectedCharacter].objectives.scene_objectives && (
                                  <Box style={{ marginBottom: 3 }}>
                                    <Typography variant="h6" gutterBottom>Scene Objectives</Typography>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                      {characterData.characters[selectedCharacter].objectives.scene_objectives.map((obj, index) => (
                                        <Card key={index} style={{ borderLeft: '4px solid', borderColor: 'primary.main' }}>
                                          <CardContent>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                              Scene {obj.scene || 'N/A'}
                                            </Typography>
                                            <Typography variant="body1">
                                              <strong>Objective:</strong> {obj.objective || 'N/A'}
                                            </Typography>
                                            <Typography variant="body1">
                                              <strong>Obstacles:</strong>
                                            </Typography>
                                            <List dense>
                                              {obj.obstacles?.map((obstacle, i) => (
                                                <ListItem key={i}>
                                                  <ListItemText primary={obstacle} />
                                                </ListItem>
                                              ))}
                                            </List>
                                            <Typography variant="body1">
                                              <strong>Outcome:</strong> {obj.outcome || 'N/A'}
                                            </Typography>
                                </CardContent>
                              </Card>
                                      ))}
                                    </Box>
                                  </Box>
                                )}

                              {/* Emotional Range */}
                                {characterData.characters[selectedCharacter].emotional_range && (
                                  <Box style={{ marginBottom: 3 }}>
                                    <Typography variant="h6" gutterBottom>Emotional Profile</Typography>
                                    <Card>
                                <CardContent>
                                        <Typography variant="body1">
                                          <strong>Primary Emotion:</strong> {characterData.characters[selectedCharacter].emotional_range.primary_emotion || 'N/A'}
                                  </Typography>
                                        <Typography variant="body1">
                                          <strong>Emotional Spectrum:</strong>
                                          </Typography>
                                        <List dense>
                                          {characterData.characters[selectedCharacter].emotional_range.emotional_spectrum?.map((emotion, i) => (
                                            <ListItem key={i}>
                                              <ListItemText primary={emotion} />
                                            </ListItem>
                                          ))}
                                        </List>
                                </CardContent>
                              </Card>
                                  </Box>
                                )}

                                {/* Technical Details */}
                                <Box style={{ marginBottom: 3 }}>
                                  <Typography variant="h6" gutterBottom>Technical Details</Typography>
                                  <Tabs value={0} onChange={(e, newValue) => {}}>
                                    <Tab label="Props" />
                                    <Tab label="Costumes" />
                                    <Tab label="Makeup" />
                                  </Tabs>
                                  <Box style={{ mt: 2 }}>
                                    {/* Props */}
                                    {characterData.characters[selectedCharacter].props && (
                                      <Box>
                                        <Typography variant="subtitle1" fontWeight="bold">Base Props:</Typography>
                                      <List dense>
                                          {characterData.characters[selectedCharacter].props.base?.map((prop, i) => (
                                            <ListItem key={i}>
                                            <ListItemText primary={prop} />
                                          </ListItem>
                                        ))}
                                      </List>
                                      </Box>
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                          ) : (
                            // Character List View
                            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                              {Object.entries(characterData.characters || {}).map(([name, data]) => (
                                <Box key={name} style={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%' } }}>
                                  <Card>
                                    <CardContent>
                                      <Typography variant="h6" gutterBottom>
                                        {name}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        Scenes: {data.scene_presence ? data.scene_presence.length : 0}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        Lines: {data.dialogue_analysis?.total_lines || 0}
                                      </Typography>
                                      {data.emotional_range && (
                                        <Typography variant="body2" color="textSecondary">
                                          Primary Emotion: {data.emotional_range.primary_emotion || 'N/A'}
                                            </Typography>
                                          )}
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => setSelectedCharacter(name)}
                                        style={{ marginTop: '8px' }}
                                      >
                                        View Profile
                                      </Button>
                                    </CardContent>
                                  </Card>
                                        </Box>
                                      ))}
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Arc & Relationships View */}
                      {characterBreakdownView === 'relationships' && (
                        // Existing Arc & Relationships content
                        <Box>
                          {characterData.relationships && (
                            <Box>
                              <Typography variant="h6" gutterBottom>Character Relationships</Typography>
                              <Box style={{ marginBottom: 3 }}>
                                {Object.entries(characterData.relationships || {}).map(([relKey, relData]) => (
                                  <Accordion key={relKey}>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                      <Typography>Relationship: {relKey}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      <Typography variant="body1">
                                        <strong>Type:</strong> {relData.type || 'N/A'}
                                      </Typography>

                                      <Typography variant="body1" style={{ marginTop: '8px' }}>
                                        <strong>Dynamics:</strong>
                                      </Typography>
                                      <List dense>
                                        {relData.dynamics?.map((dynamic, i) => (
                                          <ListItem key={i}>
                                            <ListItemText primary={dynamic} />
                                          </ListItem>
                                        ))}
                                      </List>

                                      <Typography variant="body1" style={{ marginTop: '8px' }}>
                                        <strong>Evolution:</strong>
                                      </Typography>
                                      <Box style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: '4px' }}>
                                        {relData.evolution?.map((evolution, i) => (
                                          <Card key={i} variant="outlined">
                                            <CardContent>
                                              <Typography variant="subtitle2">
                                                Scene {evolution.scene || 'N/A'}
                                              </Typography>
                                          <Typography variant="body2">
                                                <strong>Change:</strong> {evolution.dynamic_change || 'N/A'}
                                          </Typography>
                                            <Typography variant="body2">
                                                <strong>Trigger:</strong> {evolution.trigger || 'N/A'}
                                            </Typography>
                                </CardContent>
                              </Card>
                                        ))}
                                      </Box>
                                    </AccordionDetails>
                                  </Accordion>
                                ))}
                              </Box>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Scene Matrix View */}
                      {characterBreakdownView === 'matrix' && (
                        // Existing Scene Matrix content
                        <Box>
                          {characterData.scene_matrix && Object.keys(characterData.scene_matrix).length > 0 ? (
                            <Box>
                              <Typography variant="h6" gutterBottom>Scene Matrix</Typography>

                              {/* Scene Selector */}
                              <Box style={{ marginBottom: 3 }}>
                                <FormControl fullWidth>
                                  <InputLabel id="scene-select-label">Select Scene</InputLabel>
                                  <Select
                                    labelId="scene-select-label"
                                    value={Object.keys(characterData.scene_matrix)[0] || ''}
                                    label="Select Scene"
                                    onChange={(e) => {}}
                                  >
                                    {Object.keys(characterData.scene_matrix)
                                      .sort((a, b) => parseInt(a) - parseInt(b))
                                      .map((scene) => (
                                        <MenuItem key={scene} value={scene}>Scene {scene}</MenuItem>
                                      ))}
                                  </Select>
                                </FormControl>
                              </Box>

                              {/* Scene Details */}
                              <Box style={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                                <Box style={{ flex: 1 }}>
                                <Card>
                                  <CardContent>
                                      <Typography variant="subtitle1" fontWeight="bold">Present Characters:</Typography>
                                      <List dense>
                                        {characterData.scene_matrix[Object.keys(characterData.scene_matrix)[0]]?.present_characters?.map((char, i) => (
                                          <ListItem key={i}>
                                            <ListItemText primary={char} />
                                          </ListItem>
                                        ))}
                                      </List>
                                      <Typography variant="body1" style={{ marginTop: '8px' }}>
                                        <strong>Emotional Atmosphere:</strong> {characterData.scene_matrix[Object.keys(characterData.scene_matrix)[0]]?.emotional_atmosphere || 'N/A'}
                                    </Typography>
                                    </CardContent>
                                  </Card>
                                </Box>
                                <Box style={{ flex: 1 }}>
                                  <Card>
                                    <CardContent>
                                      <Typography variant="subtitle1" fontWeight="bold">Key Developments:</Typography>
                                    <List dense>
                                        {characterData.scene_matrix[Object.keys(characterData.scene_matrix)[0]]?.key_developments?.map((dev, i) => (
                                          <ListItem key={i}>
                                            <ListItemText primary={dev} />
                                          </ListItem>
                                        ))}
                                      </List>
                                    </CardContent>
                                  </Card>
                                </Box>
                              </Box>

                              {/* Interactions */}
                              <Box style={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>Interactions</Typography>
                                <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  {characterData.scene_matrix[Object.keys(characterData.scene_matrix)[0]]?.interactions?.map((interaction, index) => (
                                    <Card key={index} variant="outlined">
                                      <CardContent>
                                        <Typography variant="subtitle1">
                                          <strong>Characters:</strong> {interaction.characters ? interaction.characters.join(', ') : 'N/A'}
                                        </Typography>
                                        <Typography variant="body1">
                                          <strong>Type:</strong> {interaction.type || 'N/A'}
                                        </Typography>
                                        <Typography variant="body1">
                                          <strong>Significance:</strong> {interaction.significance ? interaction.significance.toFixed(2) : '0.00'}
                                        </Typography>
                                      </CardContent>
                                    </Card>
                                  ))}
                                </Box>
                              </Box>
                            </Box>
                          ) : (
                            <Box>
                              <Typography variant="body1" color="textSecondary">
                                No scene matrix data available. This could be because:
                              </Typography>
                              <List>
                                        <ListItem>
                                  <ListItemText primary="The character analysis is still in progress" />
                                        </ListItem>
                                <ListItem>
                                  <ListItemText primary="The script doesn't have enough scene information" />
                                          </ListItem>
                                        <ListItem>
                                  <ListItemText primary="There was an error during scene matrix generation" />
                                        </ListItem>
                                    </List>
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  console.log('Character Data:', characterData);
                                  setSuccess('Character data logged to console. Press F12 to view.');
                                }}
                                style={{ marginTop: '8px' }}
                              >
                                Debug Character Data
                              </Button>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Statistics View */}
                      {characterBreakdownView === 'statistics' && (
                        // Existing Statistics content
                        <Box>
                          {characterData.statistics ? (
                            <Box>
                              <Typography variant="h6" gutterBottom>Overall Statistics</Typography>

                              {/* Scene Statistics */}
                              {characterData.statistics.scene_stats && (
                                <Box>
                                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Scene Statistics</Typography>
                                  <Box style={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, marginBottom: 3 }}>
                                    <Box style={{ flex: 1 }}>
                                <Card>
                                  <CardContent>
                                          <Typography variant="h6">Total Scenes</Typography>
                                          <Typography variant="h4">{characterData.statistics.scene_stats.total_scenes || 0}</Typography>
                                        </CardContent>
                                      </Card>
                                    </Box>
                                    <Box style={{ flex: 1 }}>
                                      <Card>
                                        <CardContent>
                                          <Typography variant="h6">Avg Characters/Scene</Typography>
                                          <Typography variant="h4">{characterData.statistics.scene_stats.average_characters_per_scene?.toFixed(1) || '0.0'}</Typography>
                                  </CardContent>
                                </Card>
                                    </Box>
                                    <Box style={{ flex: 1 }}>
                                      <Card>
                                        <CardContent>
                                          <Typography variant="h6">Total Interactions</Typography>
                                          <Typography variant="h4">{characterData.statistics.scene_stats.total_interactions || 0}</Typography>
                                        </CardContent>
                                      </Card>
                                    </Box>
                                  </Box>
                        </Box>
                      )}

                          {/* Dialogue Statistics */}
                              {characterData.statistics.dialogue_stats && Object.keys(characterData.statistics.dialogue_stats).length > 0 ? (
                                <Box style={{ marginBottom: 3 }}>
                                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Dialogue Statistics</Typography>
                                  <TableContainer component={Paper}>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Character</TableCell>
                                      <TableCell>Total Lines</TableCell>
                                      <TableCell>Total Words</TableCell>
                                      <TableCell>Avg Line Length</TableCell>
                                      <TableCell>Vocabulary Complexity</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                        {Object.entries(characterData.statistics.dialogue_stats).map(([char, stats]) => (
                                          <TableRow key={char}>
                                            <TableCell>{char}</TableCell>
                                            <TableCell>{stats.total_lines || 0}</TableCell>
                                            <TableCell>{stats.total_words || 0}</TableCell>
                                            <TableCell>{stats.average_line_length?.toFixed(1) || '0.0'}</TableCell>
                                            <TableCell>{stats.vocabulary_complexity?.toFixed(2) || '0.00'}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                                </Box>
                              ) : (
                                <Box style={{ marginBottom: 3 }}>
                                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Dialogue Statistics</Typography>
                                  <Typography variant="body1" color="textSecondary">No dialogue statistics available.</Typography>
                                </Box>
                              )}

                          {/* Emotional Statistics */}
                              {characterData.statistics.emotional_stats && Object.keys(characterData.statistics.emotional_stats).length > 0 ? (
                                <Box style={{ marginBottom: 3 }}>
                                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Emotional Statistics</Typography>
                                  <TableContainer component={Paper}>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Character</TableCell>
                                      <TableCell>Primary Emotion</TableCell>
                                      <TableCell>Emotional Variety</TableCell>
                                      <TableCell>Average Intensity</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                        {Object.entries(characterData.statistics.emotional_stats).map(([char, stats]) => (
                                          <TableRow key={char}>
                                            <TableCell>{char}</TableCell>
                                            <TableCell>{stats.primary_emotion || 'N/A'}</TableCell>
                                            <TableCell>{stats.emotional_variety || 0}</TableCell>
                                            <TableCell>{stats.average_intensity?.toFixed(2) || '0.00'}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                                </Box>
                              ) : (
                                <Box style={{ marginBottom: 3 }}>
                                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Emotional Statistics</Typography>
                                  <Typography variant="body1" color="textSecondary">No emotional statistics available.</Typography>
                                </Box>
                              )}

                              {/* Technical Statistics */}
                              {characterData.statistics.technical_stats && Object.keys(characterData.statistics.technical_stats).length > 0 ? (
                                <Box style={{ marginBottom: 3 }}>
                                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Technical Statistics</Typography>

                                {/* Costume Changes */}
                                  {characterData.statistics.technical_stats.costume_changes && Object.keys(characterData.statistics.technical_stats.costume_changes).length > 0 && (
                                    <Box style={{ marginBottom: 3 }}>
                                      <Typography variant="body1" fontWeight="bold" gutterBottom>Costume Changes</Typography>
                                      <TableContainer component={Paper}>
                                        <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Character</TableCell>
                                          <TableCell>Total Changes</TableCell>
                                          <TableCell>Unique Costumes</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                            {Object.entries(characterData.statistics.technical_stats.costume_changes).map(([char, stats]) => (
                                              <TableRow key={char}>
                                                <TableCell>{char}</TableCell>
                                                <TableCell>{stats.total_changes || 0}</TableCell>
                                                <TableCell>{stats.unique_costumes || 0}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                    </Box>
                                  )}

                                {/* Prop Usage */}
                                  {characterData.statistics.technical_stats.prop_usage && Object.keys(characterData.statistics.technical_stats.prop_usage).length > 0 && (
                                    <Box style={{ marginBottom: 3 }}>
                                      <Typography variant="body1" fontWeight="bold" gutterBottom>Prop Usage</Typography>
                                      <TableContainer component={Paper}>
                                        <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Character</TableCell>
                                          <TableCell>Total Props</TableCell>
                                          <TableCell>Unique Props</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                            {Object.entries(characterData.statistics.technical_stats.prop_usage).map(([char, stats]) => (
                                              <TableRow key={char}>
                                                <TableCell>{char}</TableCell>
                                                <TableCell>{stats.total_props || 0}</TableCell>
                                                <TableCell>{stats.unique_props || 0}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                    </Box>
                                  )}

                                {/* Makeup Changes */}
                                  {characterData.statistics.technical_stats.makeup_changes && Object.keys(characterData.statistics.technical_stats.makeup_changes).length > 0 && (
                                    <Box>
                                      <Typography variant="body1" fontWeight="bold" gutterBottom>Makeup Changes</Typography>
                                      <TableContainer component={Paper}>
                                        <Table>
                                      <TableHead>
                                        <TableRow>
                                          <TableCell>Character</TableCell>
                                          <TableCell>Total Changes</TableCell>
                                          <TableCell>Unique Looks</TableCell>
                                        </TableRow>
                                      </TableHead>
                                      <TableBody>
                                            {Object.entries(characterData.statistics.technical_stats.makeup_changes).map(([char, stats]) => (
                                              <TableRow key={char}>
                                                <TableCell>{char}</TableCell>
                                                <TableCell>{stats.total_changes || 0}</TableCell>
                                                <TableCell>{stats.unique_looks || 0}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </TableContainer>
                                    </Box>
                                  )}
                                </Box>
                              ) : (
                                <Box style={{ marginBottom: 3 }}>
                                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Technical Statistics</Typography>
                                  <Typography variant="body1" color="textSecondary">No technical statistics available.</Typography>
                                </Box>
                              )}
                            </Box>
                          ) : (
                            <Box>
                              <Typography variant="body1" color="textSecondary">
                                No statistics data available. This could be because:
                              </Typography>
                              <List>
                                <ListItem>
                                  <ListItemText primary="The character analysis is still in progress" />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary="The script doesn't have enough information for statistics" />
                                </ListItem>
                                <ListItem>
                                  <ListItemText primary="There was an error during statistics generation" />
                                </ListItem>
                              </List>
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  console.log('Character Data:', characterData);
                                  setSuccess('Character data logged to console. Press F12 to view.');
                                }}
                                style={{ marginTop: '8px' }}
                              >
                                Debug Character Data
                              </Button>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Raw Data View */}
                      {characterBreakdownView === 'raw' && (
                        // Existing Raw Data content
                        <Box>
                          <Typography variant="h6" gutterBottom>Raw Character Data</Typography>
                          <Box style={{ marginBottom: 3, display: 'flex', gap: 2 }}>
                            <Button
                              variant="outlined"
                              startIcon={<Download />}
                              onClick={() => {
                                const jsonStr = JSON.stringify(characterData, null, 2);
                                const blob = new Blob([jsonStr], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'character_breakdown.json';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                            >
                              Download Full Analysis
                            </Button>
                            <Button
                              variant="outlined"
                              color="secondary"
                              onClick={() => {
                                console.log('Character Data Structure:', characterData);
                                if (characterData.characters) {
                                  const firstCharacter = Object.keys(characterData.characters)[0];
                                  console.log('First Character Data:', characterData.characters[firstCharacter]);
                                }
                                if (characterData.relationships) {
                                  console.log('Relationships Data:', characterData.relationships);
                                }
                                if (characterData.scene_matrix) {
                                  console.log('Scene Matrix Data:', characterData.scene_matrix);
                                }
                                if (characterData.statistics) {
                                  console.log('Statistics Data:', characterData.statistics);
                                }
                                setSuccess('Data structure logged to console. Press F12 to view.');
                              }}
                            >
                              Debug Data Structure
                            </Button>
                          </Box>
                          <Paper style={{ padding: '8px', maxHeight: '500px', overflow: 'auto' }}>
                            <pre style={{ whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(characterData, null, 2)}
                            </pre>
                          </Paper>
                        </Box>
                      )}

                      {/* Navigation buttons */}
                      <Box style={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                          variant="outlined"
                          startIcon={<ArrowBack />}
                          onClick={() => setCurrentTab(2)}
                        >
                          Back to One-Liner
                        </Button>
                        <Button
                          variant="contained"
                          endIcon={<ArrowForward />}
                          onClick={() => {
                            if (!scheduleData && characterData) {
                              createSchedule();
                            }
                            setCurrentTab(4);
                          }}
                        >
                          Continue to Schedule
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    Please upload or enter a script first to analyze characters.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<ArrowBack />}
                    onClick={() => setCurrentTab(0)}
                  >
                    Go to Upload
                  </Button>
                </Box>
              )}
            </Paper>
          </TabPanel>

          <TabPanel value={currentTab} index={4}>
            {/* Schedule Tab */}
            <Paper style={{ padding: '16px', borderRadius: 4, backdropFilter: 'blur(10px)' }}>
              <Typography variant="h4" gutterBottom fontWeight={700} style={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, #a4b8ff, #ff90d1)'
                  : 'linear-gradient(90deg, #4361ee, #f72585)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Schedule Creation
              </Typography>
              {scriptData && characterData ? (
                <Box>
                  {!scheduleData ? (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Configure Schedule Parameters
                      </Typography>

                      <Grid container spacing={3} style={{ marginBottom: 4 }}>
                        <Grid item xs={12} md={6}>
                          <Paper style={{ padding: '12px', height: '100%' }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              Basic Settings
                            </Typography>
                            <LocalizationProvider dateAdapter={AdapterDateFns}>
                              <DatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={handleDateChange}
                                style={{ marginBottom: 3, width: '100%' }}
                              />
                            </LocalizationProvider>

                            <FormControl fullWidth style={{ marginBottom: 2 }}>
                              <InputLabel>Max Hours Per Day</InputLabel>
                              <Select
                                value={scheduleConstraints.max_hours_per_day}
                                label="Max Hours Per Day"
                                onChange={(e) => setScheduleConstraints({
                                  ...scheduleConstraints,
                                  max_hours_per_day: Number(e.target.value)
                                })}
                              >
                                <MenuItem value={8}>8 Hours</MenuItem>
                                <MenuItem value={10}>10 Hours</MenuItem>
                                <MenuItem value={12}>12 Hours</MenuItem>
                                <MenuItem value={14}>14 Hours</MenuItem>
                              </Select>
                            </FormControl>

                            <FormControl fullWidth style={{ marginBottom: 2 }}>
                              <InputLabel>Meal Break Duration (minutes)</InputLabel>
                              <Select
                                value={scheduleConstraints.meal_break_duration}
                                label="Meal Break Duration (minutes)"
                                onChange={(e) => setScheduleConstraints({
                                  ...scheduleConstraints,
                                  meal_break_duration: Number(e.target.value)
                                })}
                              >
                                <MenuItem value={30}>30 Minutes</MenuItem>
                                <MenuItem value={45}>45 Minutes</MenuItem>
                                <MenuItem value={60}>60 Minutes</MenuItem>
                                <MenuItem value={90}>90 Minutes</MenuItem>
                              </Select>
                            </FormControl>

                            <FormControl fullWidth>
                              <InputLabel>Company Moves Per Day</InputLabel>
                              <Select
                                value={scheduleConstraints.company_moves_per_day}
                                label="Company Moves Per Day"
                                onChange={(e) => setScheduleConstraints({
                                  ...scheduleConstraints,
                                  company_moves_per_day: Number(e.target.value)
                                })}
                              >
                                <MenuItem value={1}>1 Move</MenuItem>
                                <MenuItem value={2}>2 Moves</MenuItem>
                                <MenuItem value={3}>3 Moves</MenuItem>
                                <MenuItem value={4}>4 Moves</MenuItem>
                              </Select>
                            </FormControl>
                          </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Paper style={{ padding: '12px', height: '100%' }}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              Weather Constraints
                            </Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                              Select weather conditions to avoid during shooting
                            </Typography>

                            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginBottom: 3 }}>
                              {["Rain", "Snow", "High Winds", "Extreme Heat", "Fog", "Thunderstorms"].map((weather) => (
                                <Chip
                                  key={weather}
                                  label={weather}
                                  color={locationConstraints.avoid_weather.includes(weather) ? "primary" : "default"}
                                  onClick={() => {
                                    const newAvoidWeather = locationConstraints.avoid_weather.includes(weather)
                                      ? locationConstraints.avoid_weather.filter(w => w !== weather)
                                      : [...locationConstraints.avoid_weather, weather];

                                    setLocationConstraints({
                                      ...locationConstraints,
                                      avoid_weather: newAvoidWeather
                                    });
                                  }}
                                  style={{ margin: '2px' }}
                                />
                              ))}
                            </Box>

                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                              Preferred Locations
                            </Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                              Add any preferred locations for shooting
                            </Typography>

                            <Box style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                              <TextField
                                label="Add Location"
                                variant="outlined"
                                size="small"
                                fullWidth
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && e.currentTarget.value) {
                                    setLocationConstraints({
                                      ...locationConstraints,
                                      preferred_locations: [
                                        ...locationConstraints.preferred_locations,
                                        e.currentTarget.value
                                      ]
                                    });
                                    e.target.value = '';
                                  }
                                }}
                              />
                              <IconButton
                                color="primary"
                                onClick={(e) => {
                                  const input = e.currentTarget.previousSibling;
                                  if (input && input.value) {
                                    const newLocation = input.value;
                                    setLocationConstraints({
                                      ...locationConstraints,
                                      preferred_locations: [
                                        ...locationConstraints.preferred_locations,
                                        newLocation
                                      ]
                                    });
                                    input.value = '';
                                  }
                                }}
                              >
                                <Add />
                              </IconButton>
                            </Box>

                            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {locationConstraints.preferred_locations.map((location, index) => (
                                <Chip
                                  key={index}
                                  label={location}
                                  onDelete={() => {
                                    setLocationConstraints({
                                      ...locationConstraints,
                                      preferred_locations: locationConstraints.preferred_locations.filter((_, i) => i !== index)
                                    });
                                  }}
                                  style={{ margin: '2px' }}
                                />
                              ))}
                            </Box>
                          </Paper>
                        </Grid>
                      </Grid>

                      <Button
                        variant="contained"
                        onClick={createSchedule}
                        disabled={loading}
                        size="large"
                        startIcon={<CalendarMonth />}
                        color="primary"
                        style={{
                          paddingTop: '6px',
                          paddingBottom: '6px',
                          paddingLeft: '16px',
                          paddingRight: '16px'
                        }}
                      >
                        Generate Production Schedule
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      {/* Add regenerate button at the top */}
                      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6">Calendar View</Typography>
                        <Button
                          variant="contained"
                          onClick={createSchedule}
                          disabled={loading}
                          startIcon={<Refresh />}
                          sx={{
                            background: theme.palette.mode === 'dark'
                              ? 'linear-gradient(90deg, #738bff, #ff5eb1)'
                              : 'linear-gradient(90deg, #4361ee, #f72585)',
                            '&:hover': {
                              background: theme.palette.mode === 'dark'
                                ? 'linear-gradient(90deg, #8599ff, #ff6eb8)'
                                : 'linear-gradient(90deg, #5472ff, #f83a91)',
                            }
                          }}
                        >
                          Regenerate Schedule
                        </Button>
                      </Box>
                      {/* Schedule View Tabs */}
                      <Tabs
                        value={scheduleView}
                        onChange={(e, newValue) => setScheduleView(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        style={{ marginBottom: 3, borderBottom: 1, borderColor: 'divider' }}
                      >
                        <Tab label="Calendar View" value="calendar" icon={<CalendarMonth />} iconPosition="start" />
                        <Tab label="Schedule List" value="list" icon={<ViewList />} iconPosition="start" />
                        <Tab label="Location Plan" value="location" icon={<LocationOn />} iconPosition="start" />
                        <Tab label="Crew Allocation" value="crew" icon={<People />} iconPosition="start" />
                        <Tab label="Equipment" value="equipment" icon={<CameraAlt />} iconPosition="start" />
                        <Tab label="Department" value="department" icon={<Settings />} iconPosition="start" />
                        <Tab label="Call Sheets" value="callsheet" icon={<Description />} iconPosition="start" />
                        <Tab label="Gantt Chart" value="gantt" icon={<Timeline />} iconPosition="start" />
                        <Tab label="Summary" value="summary" icon={<BarChart />} iconPosition="start" />
                        <Tab label="Raw Data" value="raw" icon={<Code />} iconPosition="start" />
                      </Tabs>

                      {/* Calendar View */}
                      {scheduleView === 'calendar' && (
                        <Box>
                          <Typography variant="h6" gutterBottom>Calendar View</Typography>
                          <Grid container spacing={3}>
                            {scheduleData.schedule?.map((day, index) => (
                              <Grid item xs={12} key={index}>
                                <Card style={{ marginBottom: 2 }}>
                                  <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                      Day {day.day} - {format(new Date(day.date), 'MMMM d, yyyy')}
                                    </Typography>

                                    {day.scenes.map((scene, sceneIndex) => (
                                      <Paper
                                        key={sceneIndex}
                                        style={{
                                          padding: '8px',
                                          marginBottom: '8px',
                                          borderLeft: '4px solid',
                                          borderColor: 'primary.main'
                                        }}
                                      >
                                        <Grid container spacing={2}>
                                          <Grid xs={12} md={4}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                              Scene {scene.scene_id}
                                            </Typography>
                                            <Typography variant="body2">
                                              Location: {scene.location_id}
                                            </Typography>
                                            <Typography variant="body2">
                                              Time: {scene.start_time} - {scene.end_time}
                                            </Typography>
                                          </Grid>
                                          <Grid xs={12} md={4}>
                                            <Typography variant="body2">
                                              Setup: {scene.setup_time}
                                            </Typography>
                                            <Typography variant="body2">
                                              Wrap: {scene.wrap_time}
                                            </Typography>
                                            {scene.breaks && scene.breaks.length > 0 && (
                                              <Typography variant="body2">
                                                Breaks: {scene.breaks.map((b) => b.type).join(', ')}
                                              </Typography>
                                            )}
                                          </Grid>
                                          <Grid xs={12} md={4}>
                                            <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                              {scene.crew_ids?.slice(0, 3).map((crew, i) => (
                                                <Chip key={i} label={crew} size="small" variant="outlined" />
                                              ))}
                                              {scene.crew_ids?.length > 3 && (
                                                <Chip
                                                  label={`+${scene.crew_ids.length - 3} more`}
                                                  size="small"
                                                  variant="outlined"
                                                />
                                              )}
                                            </Box>
                                          </Grid>
                                        </Grid>
                                      </Paper>
                                    ))}
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {/* Schedule List */}
                      {scheduleView === 'list' && (
                        <Box>
                          <Typography variant="h6" gutterBottom>Schedule List</Typography>
                          <TableContainer component={Paper}>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Day</TableCell>
                                  <TableCell>Date</TableCell>
                                  <TableCell>Scene</TableCell>
                                  <TableCell>Location</TableCell>
                                  <TableCell>Start Time</TableCell>
                                  <TableCell>End Time</TableCell>
                                  <TableCell>Duration</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {scheduleData.schedule?.map((day) => (
                                  day.scenes.map((scene, sceneIndex) => (
                                    <TableRow key={`${day.day}-${sceneIndex}`}>
                                      <TableCell>{day.day}</TableCell>
                                      <TableCell>{format(new Date(day.date), 'MM/dd/yyyy')}</TableCell>
                                      <TableCell>Scene {scene.scene_id}</TableCell>
                                      <TableCell>{scene.location_id}</TableCell>
                                      <TableCell>{scene.start_time}</TableCell>
                                      <TableCell>{scene.end_time}</TableCell>
                                      <TableCell>
                                        {scene.duration_minutes ? `${scene.duration_minutes} min` : 'N/A'}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}

                      {/* Location Plan */}
                      {scheduleView === 'location' && (
                        <Box>
                          <Typography variant="h6" gutterBottom>Location Plan</Typography>
                          {scheduleData.location_plan?.locations ? (
                            <Box>
                              {/* Existing Locations Grid */}
                              <Grid container spacing={3}>
                                {scheduleData.location_plan.locations.map((location, index) => (
                                  <Grid item xs={12} md={6} key={index}>
                                    <Accordion>
                                      <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography variant="subtitle1" fontWeight="bold">
                                          {location.name} ({location.id})
                                        </Typography>
                                      </AccordionSummary>
                                      <AccordionDetails>
                                        {/* Existing location details */}
                                        <Typography variant="body2" paragraph>
                                          <strong>Address:</strong> {location.address}
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                          <strong>Scenes:</strong> {location.scenes.join(', ')}
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                          <strong>Setup Time:</strong> {location.setup_time_minutes} minutes
                                        </Typography>
                                        <Typography variant="body2" paragraph>
                                          <strong>Wrap Time:</strong> {location.wrap_time_minutes} minutes
                                        </Typography>

                                        {/* Requirements */}
                                        <Typography variant="subtitle2" gutterBottom>Requirements:</Typography>
                                        <List dense>
                                          {location.requirements.map((req, i) => (
                                            <ListItem key={i}>
                                              <ListItemText primary={req} />
                                            </ListItem>
                                          ))}
                                        </List>

                                        {/* Weather Dependencies */}
                                        {scheduleData.location_plan.weather_dependencies[location.id] && (
                                          <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>Weather Requirements:</Typography>
                                            <Grid container spacing={2}>
                                              <Grid item xs={6}>
                                                <Typography variant="body2" gutterBottom>Preferred Conditions:</Typography>
                                                <List dense>
                                                  {scheduleData.location_plan.weather_dependencies[location.id].preferred_conditions.map((cond, i) => (
                                                    <ListItem key={i}>
                                                      <ListItemText primary={cond} />
                                                    </ListItem>
                                                  ))}
                                                </List>
                                              </Grid>
                                              <Grid item xs={6}>
                                                <Typography variant="body2" gutterBottom>Avoid Conditions:</Typography>
                                                <List dense>
                                                  {scheduleData.location_plan.weather_dependencies[location.id].avoid_conditions.map((cond, i) => (
                                                    <ListItem key={i}>
                                                      <ListItemText primary={cond} />
                                                    </ListItem>
                                                  ))}
                                                </List>
                                              </Grid>
                                            </Grid>

                                            {/* Seasonal Notes */}
                                            <Typography variant="body2" gutterBottom>Seasonal Notes:</Typography>
                                            <List dense>
                                              {scheduleData.location_plan.weather_dependencies[location.id].seasonal_notes.map((note, i) => (
                                                <ListItem key={i}>
                                                  <ListItemText primary={note} />
                                                </ListItem>
                                              ))}
                                            </List>
                                          </Box>
                                        )}

                                        {/* Daylight Requirements */}
                                        {scheduleData.location_plan.daylight_requirements[location.scenes[0]] && (
                                          <Box sx={{ mt: 2 }}>
                                            <Typography variant="subtitle2" gutterBottom>Daylight Requirements:</Typography>
                                            <Typography variant="body2">
                                              <strong>Needs Daylight:</strong> {scheduleData.location_plan.daylight_requirements[location.scenes[0]].needs_daylight ? 'Yes' : 'No'}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Golden Hour:</strong> {scheduleData.location_plan.daylight_requirements[location.scenes[0]].golden_hour ? 'Yes' : 'No'}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Time Window:</strong> {scheduleData.location_plan.daylight_requirements[location.scenes[0]].time_window.start} - {scheduleData.location_plan.daylight_requirements[location.scenes[0]].time_window.end}
                                            </Typography>
                                          </Box>
                                        )}
                                      </AccordionDetails>
                                    </Accordion>
                                  </Grid>
                                ))}
                              </Grid>

                              {/* Location Groups */}
                              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Location Groups</Typography>
                              <Grid container spacing={3}>
                                {scheduleData.location_plan.location_groups.map((group, index) => (
                                  <Grid item xs={12} md={6} key={index}>
                                    <Card>
                                      <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>Group {group.group_id}</Typography>
                                        <Typography variant="body2">
                                          <strong>Locations:</strong> {group.locations.join(', ')}
                                        </Typography>
                                        <Typography variant="body2">
                                          <strong>Reason:</strong> {group.reason}
                                        </Typography>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                ))}
                              </Grid>

                              {/* Shooting Sequence */}
                              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Shooting Sequence</Typography>
                              <Card>
                                <CardContent>
                                  <List>
                                    {scheduleData.location_plan.shooting_sequence.map((locationId, index) => (
                                      <ListItem key={index}>
                                        <ListItemText
                                          primary={`${index + 1}. ${locationId}`}
                                          secondary={scheduleData.location_plan.locations.find(l => l.id === locationId)?.name}
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                </CardContent>
                              </Card>

                              {/* Optimization Notes */}
                              <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Optimization Notes</Typography>
                              <Card>
                                <CardContent>
                                  <List>
                                    {scheduleData.location_plan.optimization_notes.map((note, index) => (
                                      <ListItem key={index}>
                                        <ListItemText primary={note} />
                                      </ListItem>
                                    ))}
                                  </List>
                                </CardContent>
                              </Card>
                            </Box>
                          ) : (
                            <Typography variant="body1" color="textSecondary">
                              No location plan data available.
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Crew Allocation */}
                      {scheduleView === 'crew' && (
                        <Box>
                          <Typography variant="h6" gutterBottom>Crew Allocation</Typography>
                          {scheduleData.crew_allocation?.crew_assignments ? (
                            <Grid container spacing={3}>
                              {scheduleData.crew_allocation.crew_assignments.map((crew, index) => (
                                <Grid item xs={12} md={6} lg={4} key={index}>
                                  <Card>
                                    <CardContent>
                                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                        {crew.crew_member}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary" gutterBottom>
                                        {crew.role}
                                      </Typography>
                                      <Divider style={{ marginTop: '4px', marginBottom: '4px' }} />
                                      <Typography variant="body2">
                                        <strong>Assigned Scenes:</strong> {crew.assigned_scenes.join(', ')}
                                      </Typography>
                                      <Typography variant="body2">
                                        <strong>Work Hours:</strong> {crew.work_hours}
                                      </Typography>
                                      <Typography variant="body2">
                                        <strong>Turnaround Hours:</strong> {crew.turnaround_hours}
                                      </Typography>
                                      <Typography variant="body2">
                                        <strong>Meal Break Interval:</strong> {crew.meal_break_interval} hours
                                      </Typography>

                                      {crew.equipment_assigned && crew.equipment_assigned.length > 0 && (
                                        <Box style={{ mt: 1 }}>
                                          <Typography variant="body2" gutterBottom>
                                            <strong>Equipment Assigned:</strong>
                                          </Typography>
                                          <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {crew.equipment_assigned.map((equip, i) => (
                                              <Chip key={i} label={equip} size="small" />
                                            ))}
                                          </Box>
                                        </Box>
                                      )}
                                    </CardContent>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Typography variant="body1" color="textSecondary">
                              No crew allocation data available.
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Equipment */}
                      {scheduleView === 'equipment' && (
                        <Box>
                          <Typography variant="h6" gutterBottom>Equipment</Typography>
                          {scheduleData.crew_allocation?.equipment_assignments ? (
                            <TableContainer component={Paper}>
                              <Table>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Equipment ID</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell>Setup Time</TableCell>
                                    <TableCell>Assigned Scenes</TableCell>
                                    <TableCell>Assigned Crew</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {scheduleData.crew_allocation.equipment_assignments.map((equipment, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{equipment.equipment_id}</TableCell>
                                      <TableCell>{equipment.type}</TableCell>
                                      <TableCell>{equipment.setup_time_minutes} minutes</TableCell>
                                      <TableCell>{equipment.assigned_scenes.join(', ')}</TableCell>
                                      <TableCell>{equipment.assigned_crew.join(', ')}</TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          ) : (
                            <Typography variant="body1" color="textSecondary">
                              No equipment data available.
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Department Schedules */}
                      {scheduleView === 'department' && (
                        <Box>
                          <Typography variant="h6" gutterBottom>Department Schedules</Typography>
                          {scheduleData.crew_allocation?.department_schedules ? (
                            <Grid container spacing={3}>
                              {Object.entries(scheduleData.crew_allocation.department_schedules).map(([deptName, deptInfo], index) => (
                                <Grid item xs={12} md={6} key={index}>
                                  <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMore />}>
                                      <Typography variant="subtitle1" fontWeight="bold">
                                        {deptName.charAt(0).toUpperCase() + deptName.slice(1)}
                                      </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                      <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                          <Typography variant="subtitle2" gutterBottom>Crew:</Typography>
                                          <List dense>
                                            {deptInfo.crew.map((crew, i) => (
                                              <ListItem key={i}>
                                                <ListItemText primary={crew} />
                                              </ListItem>
                                            ))}
                                          </List>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                          <Typography variant="subtitle2" gutterBottom>Equipment:</Typography>
                                          <List dense>
                                            {deptInfo.equipment.map((equip, i) => (
                                              <ListItem key={i}>
                                                <ListItemText primary={equip} />
                                              </ListItem>
                                            ))}
                                          </List>
                                        </Grid>
                                      </Grid>

                                      <Typography variant="subtitle2" gutterBottom style={{ marginTop: '8px' }}>Notes:</Typography>
                                      <List dense>
                                        {deptInfo.notes.map((note, i) => (
                                          <ListItem key={i}>
                                            <ListItemText primary={note} />
                                          </ListItem>
                                        ))}
                                      </List>
                                    </AccordionDetails>
                                  </Accordion>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Typography variant="body1" color="textSecondary">
                              No department schedule data available.
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Call Sheets */}
                      {scheduleView === 'callsheet' && (
                        <Box>
                          <Typography variant="h6" gutterBottom>Call Sheets</Typography>
                          {scheduleData.schedule ? (
                            <Accordion>
                              {scheduleData.schedule.map((day, dayIndex) => (
                                <Accordion key={dayIndex}>
                                  <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                      Day {day.day} - {format(new Date(day.date), 'MMMM d, yyyy')}
                                    </Typography>
                                  </AccordionSummary>
                                  <AccordionDetails>
                                    {day.scenes.map((scene, sceneIndex) => (
                                      <Paper key={sceneIndex} style={{ padding: '8px', marginBottom: '8px' }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                          Scene {scene.scene_id}
                                        </Typography>
                                        <Grid container spacing={2}>
                                          <Grid xs={12} md={4}>
                                            <Typography variant="body2">
                                              <strong>Location:</strong> {scene.location_id}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Time:</strong> {scene.start_time} - {scene.end_time}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Setup:</strong> {scene.setup_time}
                                            </Typography>
                                            <Typography variant="body2">
                                              <strong>Wrap:</strong> {scene.wrap_time}
                                            </Typography>
                                          </Grid>
                                          <Grid xs={12} md={4}>
                                            <Typography variant="body2" gutterBottom>
                                              <strong>Crew:</strong>
                                            </Typography>
                                            <List dense>
                                              {scene.crew_ids?.map((crew, i) => (
                                                <ListItem key={i} disablePadding>
                                                  <ListItemText primary={crew} />
                                                </ListItem>
                                              ))}
                                            </List>
                                          </Grid>
                                          <Grid xs={12} md={4}>
                                            <Typography variant="body2" gutterBottom>
                                              <strong>Equipment:</strong>
                                            </Typography>
                                            <List dense>
                                              {scene.equipment_ids?.map((equip, i) => (
                                                <ListItem key={i} disablePadding>
                                                  <ListItemText primary={equip} />
                                                </ListItem>
                                              ))}
                                            </List>
                                          </Grid>
                                        </Grid>
                                      </Paper>
                                    ))}
                                  </AccordionDetails>
                                </Accordion>
                              ))}
                            </Accordion>
                          ) : (
                            <Typography variant="body1" color="textSecondary">
                              No call sheet data available.
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Gantt Chart */}
                      {scheduleView === 'gantt' && (
                        <Box>
                          <Typography variant="h6" gutterBottom>Gantt Chart</Typography>
                          {scheduleData.gantt_data ? (
                            <Box>
                              {/* Tasks */}
                              <Typography variant="subtitle1" gutterBottom>Tasks</Typography>
                              <TableContainer component={Paper}>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>ID</TableCell>
                                      <TableCell>Task</TableCell>
                                      <TableCell>Start Date</TableCell>
                                      <TableCell>End Date</TableCell>
                                      <TableCell>Type</TableCell>
                                      <TableCell>Dependencies</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {scheduleData.gantt_data.tasks.map((task) => (
                                      <TableRow key={task.id}>
                                        <TableCell>{task.id}</TableCell>
                                        <TableCell>{task.text}</TableCell>
                                        <TableCell>{task.start_date}</TableCell>
                                        <TableCell>{task.end_date}</TableCell>
                                        <TableCell>{task.type}</TableCell>
                                        <TableCell>{task.dependencies.join(', ')}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>

                              {/* Resources */}
                              <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>Resources</Typography>
                              <TableContainer component={Paper}>
                                <Table>
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>ID</TableCell>
                                      <TableCell>Name</TableCell>
                                      <TableCell>Type</TableCell>
                                      <TableCell>Calendar ID</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {scheduleData.gantt_data.resources.map((resource) => (
                                      <TableRow key={resource.id}>
                                        <TableCell>{resource.id}</TableCell>
                                        <TableCell>{resource.name}</TableCell>
                                        <TableCell>{resource.type}</TableCell>
                                        <TableCell>{resource.calendar_id}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </Box>
                          ) : (
                            <Typography variant="body1" color="textSecondary">
                              No Gantt chart data available.
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Summary */}
                      {scheduleView === 'summary' && (
                        <Box>
                          <Typography variant="h6" gutterBottom>Schedule Summary</Typography>
                          {scheduleData.summary ? (
                            <Grid container spacing={3}>
                              <Grid item xs={12} md={4}>
                                <Card>
                                  <CardContent>
                                    <Typography variant="h6">Total Days</Typography>
                                    <Typography variant="h4">{scheduleData.summary.total_days}</Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Card>
                                  <CardContent>
                                    <Typography variant="h6">Total Scenes</Typography>
                                    <Typography variant="h4">{scheduleData.summary.total_scenes}</Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                              <Grid item xs={12} md={4}>
                                <Card>
                                  <CardContent>
                                    <Typography variant="h6">Total Pages</Typography>
                                    <Typography variant="h4">{scheduleData.summary.total_pages}</Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Card>
                                  <CardContent>
                                    <Typography variant="h6">Date Range</Typography>
                                    <Typography variant="body1">
                                      <strong>Start:</strong> {scheduleData.summary.start_date}
                                    </Typography>
                                    <Typography variant="body1">
                                      <strong>End:</strong> {scheduleData.summary.end_date}
                                    </Typography>
                                  </CardContent>
                                </Card>
                              </Grid>
                              <Grid item xs={12} md={6}>
                                <Card>
                                  <CardContent>
                                    <Typography variant="h6">Runtime</Typography>
                                    <Typography variant="h4">{scheduleData.summary.total_runtime_minutes} minutes</Typography>
                                  </CardContent>
                                </Card>
                              </Grid>

                              {/* Optimization Notes */}
                              <Grid item xs={12}>
                                <Card>
                                  <CardContent>
                                    <Typography variant="h6" gutterBottom>Optimization Notes</Typography>
                                    <List>
                                      {scheduleData.optimization_notes.map((note, index) => (
                                        <ListItem key={index}>
                                          <ListItemIcon>
                                            <Note />
                                          </ListItemIcon>
                                          <ListItemText primary={note} />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </CardContent>
                                </Card>
                              </Grid>
                            </Grid>
                          ) : (
                            <Typography variant="body1" color="textSecondary">
                              No summary data available.
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* Raw Data */}
                      {scheduleView === 'raw' && (
                        <Box>
                          <Typography variant="h6" gutterBottom>Raw Schedule Data</Typography>
                          <Box style={{ marginBottom: 2, display: 'flex', gap: 2 }}>
                            <Button
                              variant="outlined"
                              startIcon={<Download />}
                              onClick={() => {
                                const jsonStr = JSON.stringify(scheduleData, null, 2);
                                const blob = new Blob([jsonStr], { type: 'application/json' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'schedule_data.json';
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);
                              }}
                            >
                              Download Schedule Data
                            </Button>
                          </Box>
                          <Paper style={{ padding: '8px', maxHeight: '500px', overflow: 'auto' }}>
                            <pre style={{ whiteSpace: 'pre-wrap' }}>
                              {JSON.stringify(scheduleData, null, 2)}
                            </pre>
                          </Paper>
                        </Box>
                      )}

                      {/* Generate Budget Button */}
                      <Box style={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="large"
                          startIcon={<AttachMoney />}
                          onClick={() => setCurrentTab(5)}
                          style={{
                            paddingTop: '6px',
                            paddingBottom: '6px',
                            paddingLeft: '16px',
                            paddingRight: '16px'
                          }}
                        >
                          Continue to Budget Creation
                        </Button>
                      </Box>
                    </Box>
                  )}

                  {/* Navigation buttons */}
                  <Box style={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={() => setCurrentTab(2)}
                    >
                      Back to Character Breakdown
                    </Button>
                    {scheduleData && (
                      <Button
                        variant="contained"
                        endIcon={<ArrowForward />}
                        onClick={() => setCurrentTab(5)}
                      >
                        Continue to Budget
                      </Button>
                    )}
                  </Box>
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" color="textSecondary" paragraph>
                    Please complete script analysis and character breakdown first.
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<ArrowBack />}
                    onClick={() => setCurrentTab(0)}
                  >
                    Go to Upload
                  </Button>
                </Box>
              )}
            </Paper>
          </TabPanel>

          <TabPanel value={currentTab} index={5}>
            {scheduleData ? (
              <BudgetTab
                scriptData={scriptData}
                scheduleData={scheduleData}
                darkMode={darkMode}
                apiUrl={API_URL}
                createBudget={createBudget}
              />
            ) : (
              <Box>
                <Typography variant="body1" color="textSecondary" paragraph>
                  Please complete script analysis and schedule generation first.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<ArrowBack />}
                  onClick={() => setCurrentTab(0)}
                >
                  Go to Upload
                </Button>
              </Box>
            )}
          </TabPanel>

          <TabPanel value={currentTab} index={6}>
            {/* Storyboard Tab */}
            <Paper style={{ padding: '16px', borderRadius: 4, backdropFilter: 'blur(10px)' }}>
              <Typography variant="h4" gutterBottom fontWeight={700} style={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, #a4b8ff, #ff90d1)'
                  : 'linear-gradient(90deg, #4361ee, #f72585)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Storyboard Generation
              </Typography>

              {error && (
                <Alert severity="error" style={{ marginBottom: 16 }} onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" style={{ marginBottom: 16 }} onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              )}

              {!storyboardData ? (
                <Box>
                  <Box style={{ marginBottom: 32 }}>
                    <Typography variant="h6" gutterBottom>
                      Generate a complete storyboard for your script
                    </Typography>
                    <Typography variant="body1" paragraph>
                      The storyboard generator will create visual representations for each scene in your script.
                      You can customize the shot types, visual style, and other parameters below.
                    </Typography>

                    <Grid container spacing={3} style={{ marginBottom: 24 }}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Default Shot Type</InputLabel>
                          <Select
                            value={storyboardSettings.shot_settings.default_shot_type}
                            onChange={(e) => setStoryboardSettings({
                              ...storyboardSettings,
                              shot_settings: {
                                ...storyboardSettings.shot_settings,
                                default_shot_type: e.target.value
                              }
                            })}
                            label="Default Shot Type"
                          >
                            <MenuItem value="MS">Medium Shot (MS)</MenuItem>
                            <MenuItem value="WS">Wide Shot (WS)</MenuItem>
                            <MenuItem value="CU">Close-Up (CU)</MenuItem>
                            <MenuItem value="ECU">Extreme Close-Up (ECU)</MenuItem>
                            <MenuItem value="OTS">Over The Shoulder (OTS)</MenuItem>
                            <MenuItem value="POV">Point of View (POV)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Visual Style</InputLabel>
                          <Select
                            value={storyboardSettings.shot_settings.style}
                            onChange={(e) => setStoryboardSettings({
                              ...storyboardSettings,
                              shot_settings: {
                                ...storyboardSettings.shot_settings,
                                style: e.target.value
                              }
                            })}
                            label="Visual Style"
                          >
                            <MenuItem value="realistic">Realistic</MenuItem>
                            <MenuItem value="scribble">Scribble/Sketch</MenuItem>
                            <MenuItem value="noir">Film Noir</MenuItem>
                            <MenuItem value="anime">Anime</MenuItem>
                            <MenuItem value="watercolor">Watercolor</MenuItem>
                            <MenuItem value="storyboard">Classic Storyboard</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Button
                      variant="contained"
                      onClick={generateFullStoryboard}
                      disabled={loading || !scriptData}
                      style={{
                        background: theme.palette.mode === 'dark'
                          ? 'linear-gradient(90deg, #738bff, #ff5eb1)'
                          : 'linear-gradient(90deg, #4361ee, #f72585)',
                        padding: '8px 16px',
                      }}
                      startIcon={<CameraAlt />}
                      fullWidth
                    >
                      {loading ? (
                        <Box style={{ display: 'flex', alignItems: 'center' }}>
                          <CircularProgress size={24} style={{ marginRight: 8 }} />
                          Generating Storyboard...
                        </Box>
                      ) : (
                        'Generate Complete Storyboard'
                      )}
                    </Button>
                  </Box>

                  <Divider style={{ margin: '24px 0' }} />

                  <Typography variant="h6" gutterBottom>
                    Or generate storyboards for individual scenes
                  </Typography>

                  {scriptData && scriptData.parsed_data && scriptData.parsed_data.scenes ? (
                    <Box>
                      {scriptData.parsed_data.scenes.map((scene, index) => (
                        <Card key={index} style={{ marginBottom: 16 }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              Scene {scene.scene_number} - {scene.location?.place || 'Unknown Location'}
                            </Typography>
                            <Typography variant="body1" gutterBottom>
                              {scene.description}
                            </Typography>
                            <Button
                              variant="contained"
                              onClick={() => generateStoryboard(
                                scene.scene_id || scene.scene_number.toString(),
                                scene.description
                              )}
                              disabled={loading}
                              style={{
                                marginTop: '8px',
                                background: theme.palette.mode === 'dark'
                                  ? 'linear-gradient(90deg, #738bff, #ff5eb1)'
                                  : 'linear-gradient(90deg, #4361ee, #f72585)',
                              }}
                              startIcon={<CameraAlt />}
                            >
                              Generate Storyboard
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body1" color="textSecondary">
                      Please complete script analysis first to generate storyboards.
                    </Typography>
                  )}
                </Box>
              ) : (
                <Box>
                  {/* Storyboard Tabs */}
                  <Tabs
                    value={storyboardView}
                    onChange={(_, newValue) => setStoryboardView(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                    style={{ marginBottom: 24 }}
                  >
                    <Tab value="grid" label="Grid View" icon={<ViewModule />} iconPosition="start" />
                    <Tab value="slideshow" label="Slideshow" icon={<Slideshow />} iconPosition="start" />
                    <Tab value="settings" label="Settings" icon={<Tune />} iconPosition="start" />
                    <Tab value="export" label="Export" icon={<Download />} iconPosition="start" />
                  </Tabs>

                  {storyboardView === 'grid' && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Storyboard Sequence
                      </Typography>

                      <Box style={{ marginBottom: 16 }}>
                        <FormControl style={{ minWidth: 200 }}>
                          <InputLabel>Panels per row</InputLabel>
                          <Select
                            value={storyboardSettings.layout.panels_per_row}
                            onChange={(e) => setStoryboardSettings({
                              ...storyboardSettings,
                              layout: {
                                ...storyboardSettings.layout,
                                panels_per_row: e.target.value
                              }
                            })}
                            label="Panels per row"
                          >
                            <MenuItem value={2}>2 panels</MenuItem>
                            <MenuItem value={3}>3 panels</MenuItem>
                            <MenuItem value={4}>4 panels</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>

                      {storyboardData.scenes && storyboardData.scenes.length > 0 ? (
                        <Box>
                          {/* Grid layout for storyboard images */}
                          <Grid container spacing={2}>
                            {storyboardData.scenes.map((scene, index) => (
                              <Grid item xs={12} sm={6} md={12 / storyboardSettings.layout.panels_per_row} key={index}>
                                <Card>
                                  <CardContent>
                                    <Typography variant="subtitle1" gutterBottom>
                                      Scene {scene.scene_id} - {scene.technical_params?.shot_type || 'MS'}
                                    </Typography>

                                    {/* Storyboard Image Component */}
                                    <div style={{
                                      position: 'relative',
                                      width: '100%',
                                      paddingBottom: '56.25%', // 16:9 aspect ratio
                                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(19, 47, 76, 0.5)' : 'rgba(0, 0, 0, 0.05)',
                                      borderRadius: '8px',
                                      overflow: 'hidden',
                                      marginBottom: '8px'
                                    }}>
                                      {imageLoading[scene.scene_id] && (
                                        <div style={{
                                          position: 'absolute',
                                          top: '50%',
                                          left: '50%',
                                          transform: 'translate(-50%, -50%)',
                                          zIndex: 2
                                        }}>
                                          <CircularProgress size={40} />
                                        </div>
                                      )}

                                      <img
                                        src={`${API_URL}/storyboard/image/${scene.scene_id}?t=${Date.now()}`} // Add cache buster
                                        alt={`Storyboard for Scene ${scene.scene_id}`}
                                        style={{
                                          position: 'absolute',
                                          top: 0,
                                          left: 0,
                                          width: '100%',
                                          height: '100%',
                                          objectFit: 'contain',
                                          transition: 'opacity 0.3s ease',
                                          opacity: imageLoading[scene.scene_id] ? 0.5 : 1
                                        }}
                                        onError={(e) => {
                                          console.error(`Failed to load image for scene ${scene.scene_id}`);
                                          setError(`Storyboard image for scene ${scene.scene_id} not found.`);
                                          e.target.style.display = 'none'; // Hide the broken image
                                        }}
                                      />

                                      {error && error.includes(`scene ${scene.scene_id}`) && (
                                        <Alert
                                          severity="error"
                                          onClose={() => setError(null)}
                                          sx={{
                                            position: 'absolute',
                                            bottom: 8,
                                            left: 8,
                                            right: 8,
                                            zIndex: 1
                                          }}
                                        >
                                          {error}
                                        </Alert>
                                      )}
                                    </div>

                                    {/* Scene details */}
                                    {storyboardSettings?.layout?.show_captions && (
                                      <Typography variant="body2" color="textSecondary">
                                        {scene?.description || 'No description available'}
                                      </Typography>
                                    )}

                                    {/* Technical details */}
                                    {storyboardSettings?.layout?.show_technical && (
                                      <Box style={{ marginTop: 8 }}>
                                        <Chip
                                          size="small"
                                          label={scene?.technical_params?.shot_type || 'MS'}
                                          style={{ marginRight: 4, marginBottom: 4 }}
                                        />
                                        <Chip
                                          size="small"
                                          label={scene?.technical_params?.camera_angle || 'eye_level'}
                                          style={{ marginRight: 4, marginBottom: 4 }}
                                        />
                                        <Chip
                                          size="small"
                                          label={scene?.technical_params?.mood || 'neutral'}
                                          style={{ marginRight: 4, marginBottom: 4 }}
                                        />
                                      </Box>
                                    )}

                                    {/* Prompt details in expandable section */}
                                    <Accordion style={{ marginTop: 8 }}>
                                      <AccordionSummary expandIcon={<ExpandMore />}>
                                        <Typography variant="body2">View Prompt</Typography>
                                      </AccordionSummary>
                                      <AccordionDetails>
                                        <Typography variant="body2" gutterBottom>
                                          <strong>Original Prompt:</strong>
                                        </Typography>
                                        <Typography variant="body2" paragraph style={{ whiteSpace: 'pre-wrap' }}>
                                          {scene.prompt || 'No prompt available'}
                                        </Typography>

                                        {scene.enhanced_prompt && (
                                          <>
                                            <Typography variant="body2" gutterBottom>
                                              <strong>Enhanced Prompt:</strong>
                                            </Typography>
                                            <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                                              {scene.enhanced_prompt}
                                            </Typography>
                                          </>
                                        )}
                                      </AccordionDetails>
                                    </Accordion>

                                    {/* Regenerate button */}
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() => generateStoryboard(
                                        scene.scene_id,
                                        scene.description || '',
                                        scene.prompt
                                      )}
                                      style={{ marginTop: 8 }}
                                      startIcon={<Refresh />}
                                    >
                                      Regenerate
                                    </Button>
                                  </CardContent>
                                </Card>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      ) : (
                        <Typography variant="body1" color="textSecondary">
                          No storyboard scenes available. Try generating the storyboard first.
                        </Typography>
                      )}
                    </Box>
                  )}

                  {storyboardView === 'slideshow' && (
                    <Box>
                      {storyboardData.scenes && storyboardData.scenes.length > 0 ? (
                        <Box>
                          {/* Navigation controls */}
                          <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                            <Button
                              onClick={() => {
                                if (currentSceneIndex > 0) {
                                  setCurrentSceneIndex(currentSceneIndex - 1);
                                }
                              }}
                              disabled={currentSceneIndex === 0}
                              startIcon={<ArrowBack />}
                            >
                              Previous
                            </Button>

                            <Typography variant="body1" style={{ margin: '0 16px' }}>
                              Scene {currentSceneIndex + 1} of {storyboardData.scenes.length}
                            </Typography>

                            <Button
                              onClick={() => {
                                if (currentSceneIndex < storyboardData.scenes.length - 1) {
                                  setCurrentSceneIndex(currentSceneIndex + 1);
                                }
                              }}
                              disabled={currentSceneIndex === storyboardData.scenes.length - 1}
                              endIcon={<ArrowForward />}
                            >
                              Next
                            </Button>
                          </Box>

                          {/* Current scene display */}
                          <Card style={{ maxWidth: 800, margin: '0 auto' }}>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Scene {storyboardData.scenes[currentSceneIndex].scene_id}
                              </Typography>

                              {/* Image */}
                              <div style={{ position: 'relative', width: '100%', minHeight: '400px', marginBottom: 16 }}>
                                {storyboardData.scenes[currentSceneIndex].image_url ? (
                                  <img
                                    src={storyboardData.scenes[currentSceneIndex].image_url}
                                    alt={`Storyboard for Scene ${storyboardData.scenes[currentSceneIndex].scene_id}`}
                                    style={{ width: '100%', borderRadius: 4 }}
                                          onError={(e) => {
                                      console.log('Slideshow image load error, trying alternative source');
                                      if (!e.target.src.includes('placeholder')) {
                                        // Try direct API endpoint
                                        e.target.src = `${API_URL}/storyboard/image/${storyboardData.scenes[currentSceneIndex].scene_id}`;
                                        // Add a second error handler for the API endpoint
                                        e.target.onerror = () => {
                                          console.log('API endpoint failed, using placeholder');
                                          e.target.src = 'https://via.placeholder.com/800x450?text=Image+Not+Available';
                                          e.target.onerror = null; // Prevent infinite loop
                                        };
                                      }
                                    }}
                                  />
                                ) : storyboardData.scenes[currentSceneIndex].image_path ? (
                                  <img
                                    src={
                                      storyboardData.scenes[currentSceneIndex].image_path.startsWith('http')
                                        ? storyboardData.scenes[currentSceneIndex].image_path
                                        : `${API_URL}/storage/${storyboardData.scenes[currentSceneIndex].image_path}`
                                    }
                                    alt={`Storyboard for Scene ${storyboardData.scenes[currentSceneIndex].scene_id}`}
                                    style={{ width: '100%', borderRadius: 4 }}
                                    onError={(e) => {
                                      console.log('Image path load error, trying API endpoint');
                                      if (!e.target.src.includes('placeholder')) {
                                        e.target.src = `${API_URL}/storyboard/image/${storyboardData.scenes[currentSceneIndex].scene_id}`;
                                        e.target.onerror = () => {
                                          console.log('API endpoint failed, using placeholder');
                                          e.target.src = 'https://via.placeholder.com/800x450?text=Image+Not+Available';
                                          e.target.onerror = null;
                                        };
                                      }
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={`${API_URL}/storyboard/image/${storyboardData.scenes[currentSceneIndex].scene_id}`}
                                    alt={`Storyboard for Scene ${storyboardData.scenes[currentSceneIndex].scene_id}`}
                                    style={{ width: '100%', borderRadius: 4 }}
                                    onError={(e) => {
                                      console.log('API endpoint load error, using placeholder');
                                      e.target.src = 'https://via.placeholder.com/800x450?text=Image+Not+Available';
                                    }}
                                  />
                                )}
                              </div>

                              {/* Scene details */}
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    Scene Description:
                                  </Typography>
                                  <Typography variant="body1" paragraph>
                                    {storyboardData.scenes[currentSceneIndex].description || 'No description available'}
                                  </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Typography variant="subtitle1" gutterBottom>
                                    Technical Notes:
                                  </Typography>
                                  <Typography variant="body1" paragraph>
                                    Shot Type: {storyboardData.scenes[currentSceneIndex].technical_params?.shot_type || 'MS'}<br />
                                    Camera Angle: {storyboardData.scenes[currentSceneIndex].technical_params?.camera_angle || 'eye_level'}<br />
                                    Mood: {storyboardData.scenes[currentSceneIndex].technical_params?.mood || 'neutral'}
                                  </Typography>
                                </Grid>
                              </Grid>

                              {/* Prompt details */}
                              <Accordion>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                  <Typography>View Prompt</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Typography variant="body2" gutterBottom>
                                    <strong>Original Prompt:</strong>
                                  </Typography>
                                  <Typography variant="body2" paragraph style={{ whiteSpace: 'pre-wrap' }}>
                                    {storyboardData.scenes[currentSceneIndex].prompt || 'No prompt available'}
                                  </Typography>

                                  {storyboardData.scenes[currentSceneIndex].enhanced_prompt && (
                                    <>
                                      <Typography variant="body2" gutterBottom>
                                        <strong>Enhanced Prompt:</strong>
                                      </Typography>
                                      <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                                        {storyboardData.scenes[currentSceneIndex].enhanced_prompt}
                                      </Typography>
                                    </>
                                  )}
                                </AccordionDetails>
                              </Accordion>
                            </CardContent>
                          </Card>

                          {/* Progress indicator */}
                          <Box style={{ margin: '16px auto', maxWidth: 800 }}>
                            <Slider
                              value={currentSceneIndex}
                              min={0}
                              max={storyboardData.scenes.length - 1}
                              step={1}
                              onChange={(_, value) => setCurrentSceneIndex(value)}
                              valueLabelDisplay="auto"
                              valueLabelFormat={(value) => `Scene ${value + 1}`}
                            />
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body1" color="textSecondary">
                          No storyboard scenes available. Try generating the storyboard first.
                        </Typography>
                      )}
                    </Box>
                  )}

                  {storyboardView === 'settings' && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Storyboard Settings
                      </Typography>

                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardHeader title="Shot Settings" />
                            <CardContent>
                              <FormControl fullWidth style={{ marginBottom: 16 }}>
                                <InputLabel>Default Shot Type</InputLabel>
                                <Select
                                  value={storyboardSettings.shot_settings.default_shot_type}
                                  onChange={(e) => setStoryboardSettings({
                                    ...storyboardSettings,
                                    shot_settings: {
                                      ...storyboardSettings.shot_settings,
                                      default_shot_type: e.target.value
                                    }
                                  })}
                                  label="Default Shot Type"
                                >
                                  <MenuItem value="MS">Medium Shot (MS)</MenuItem>
                                  <MenuItem value="WS">Wide Shot (WS)</MenuItem>
                                  <MenuItem value="CU">Close-Up (CU)</MenuItem>
                                  <MenuItem value="ECU">Extreme Close-Up (ECU)</MenuItem>
                                  <MenuItem value="OTS">Over The Shoulder (OTS)</MenuItem>
                                  <MenuItem value="POV">Point of View (POV)</MenuItem>
                                </Select>
                              </FormControl>

                              <FormControl fullWidth style={{ marginBottom: 16 }}>
                                <InputLabel>Visual Style</InputLabel>
                                <Select
                                  value={storyboardSettings.shot_settings.style}
                                  onChange={(e) => setStoryboardSettings({
                                    ...storyboardSettings,
                                    shot_settings: {
                                      ...storyboardSettings.shot_settings,
                                      style: e.target.value
                                    }
                                  })}
                                  label="Visual Style"
                                >
                                  <MenuItem value="realistic">Realistic</MenuItem>
                                  <MenuItem value="scribble">Scribble/Sketch</MenuItem>
                                  <MenuItem value="noir">Film Noir</MenuItem>
                                  <MenuItem value="anime">Anime</MenuItem>
                                  <MenuItem value="watercolor">Watercolor</MenuItem>
                                  <MenuItem value="storyboard">Classic Storyboard</MenuItem>
                                </Select>
                              </FormControl>

                              <FormControl fullWidth style={{ marginBottom: 16 }}>
                                <InputLabel>Default Mood</InputLabel>
                                <Select
                                  value={storyboardSettings.shot_settings.mood}
                                  onChange={(e) => setStoryboardSettings({
                                    ...storyboardSettings,
                                    shot_settings: {
                                      ...storyboardSettings.shot_settings,
                                      mood: e.target.value
                                    }
                                  })}
                                  label="Default Mood"
                                >
                                  <MenuItem value="neutral">Neutral</MenuItem>
                                  <MenuItem value="dramatic">Dramatic</MenuItem>
                                  <MenuItem value="tense">Tense</MenuItem>
                                  <MenuItem value="joyful">Joyful</MenuItem>
                                  <MenuItem value="mysterious">Mysterious</MenuItem>
                                  <MenuItem value="melancholic">Melancholic</MenuItem>
                                </Select>
                              </FormControl>

                              <FormControl fullWidth>
                                <InputLabel>Default Camera Angle</InputLabel>
                                <Select
                                  value={storyboardSettings.shot_settings.camera_angle}
                                  onChange={(e) => setStoryboardSettings({
                                    ...storyboardSettings,
                                    shot_settings: {
                                      ...storyboardSettings.shot_settings,
                                      camera_angle: e.target.value
                                    }
                                  })}
                                  label="Default Camera Angle"
                                >
                                  <MenuItem value="eye_level">Eye Level</MenuItem>
                                  <MenuItem value="low_angle">Low Angle</MenuItem>
                                  <MenuItem value="high_angle">High Angle</MenuItem>
                                  <MenuItem value="dutch_angle">Dutch Angle</MenuItem>
                                </Select>
                              </FormControl>
                            </CardContent>
                          </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardHeader title="Layout Settings" />
                            <CardContent>
                              <FormControl fullWidth style={{ marginBottom: 16 }}>
                                <InputLabel>Panels per Row</InputLabel>
                                <Select
                                  value={storyboardSettings.layout.panels_per_row}
                                  onChange={(e) => setStoryboardSettings({
                                    ...storyboardSettings,
                                    layout: {
                                      ...storyboardSettings.layout,
                                      panels_per_row: e.target.value
                                    }
                                  })}
                                  label="Panels per Row"
                                >
                                  <MenuItem value={2}>2 panels</MenuItem>
                                  <MenuItem value={3}>3 panels</MenuItem>
                                  <MenuItem value={4}>4 panels</MenuItem>
                                </Select>
                              </FormControl>

                              <FormControl fullWidth style={{ marginBottom: 16 }}>
                                <InputLabel>Panel Size</InputLabel>
                                <Select
                                  value={storyboardSettings.layout.panel_size}
                                  onChange={(e) => setStoryboardSettings({
                                    ...storyboardSettings,
                                    layout: {
                                      ...storyboardSettings.layout,
                                      panel_size: e.target.value
                                    }
                                  })}
                                  label="Panel Size"
                                >
                                  <MenuItem value="small">Small</MenuItem>
                                  <MenuItem value="medium">Medium</MenuItem>
                                  <MenuItem value="large">Large</MenuItem>
                                </Select>
                              </FormControl>

                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={storyboardSettings.layout.show_captions}
                                    onChange={(e) => setStoryboardSettings({
                                      ...storyboardSettings,
                                      layout: {
                                        ...storyboardSettings.layout,
                                        show_captions: e.target.checked
                                      }
                                    })}
                                  />
                                }
                                label="Show Captions"
                                style={{ marginBottom: 8, display: 'block' }}
                              />

                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={storyboardSettings.layout.show_technical}
                                    onChange={(e) => setStoryboardSettings({
                                      ...storyboardSettings,
                                      layout: {
                                        ...storyboardSettings.layout,
                                        show_technical: e.target.checked
                                      }
                                    })}
                                  />
                                }
                                label="Show Technical Info"
                                style={{ display: 'block' }}
                              />
                            </CardContent>
                          </Card>

                          <Card style={{ marginTop: 16 }}>
                            <CardHeader title="Image Settings" />
                            <CardContent>
                              <FormControl fullWidth style={{ marginBottom: 16 }}>
                                <InputLabel>Image Quality</InputLabel>
                                <Select
                                  value={storyboardSettings.image.quality}
                                  onChange={(e) => setStoryboardSettings({
                                    ...storyboardSettings,
                                    image: {
                                      ...storyboardSettings.image,
                                      quality: e.target.value
                                    }
                                  })}
                                  label="Image Quality"
                                >
                                  <MenuItem value="standard">Standard</MenuItem>
                                  <MenuItem value="hd">High Definition</MenuItem>
                                </Select>
                              </FormControl>

                              <FormControl fullWidth style={{ marginBottom: 16 }}>
                                <InputLabel>Aspect Ratio</InputLabel>
                                <Select
                                  value={storyboardSettings.image.aspect_ratio}
                                  onChange={(e) => setStoryboardSettings({
                                    ...storyboardSettings,
                                    image: {
                                      ...storyboardSettings.image,
                                      aspect_ratio: e.target.value
                                    }
                                  })}
                                  label="Aspect Ratio"
                                >
                                  <MenuItem value="1:1">1:1 (Square)</MenuItem>
                                  <MenuItem value="16:9">16:9 (Widescreen)</MenuItem>
                                  <MenuItem value="4:3">4:3 (Standard)</MenuItem>
                                  <MenuItem value="2.35:1">2.35:1 (Cinemascope)</MenuItem>
                                </Select>
                              </FormControl>

                              <FormControl fullWidth>
                                <InputLabel>Color Mode</InputLabel>
                                <Select
                                  value={storyboardSettings.image.color_mode}
                                  onChange={(e) => setStoryboardSettings({
                                    ...storyboardSettings,
                                    image: {
                                      ...storyboardSettings.image,
                                      color_mode: e.target.value
                                    }
                                  })}
                                  label="Color Mode"
                                >
                                  <MenuItem value="color">Color</MenuItem>
                                  <MenuItem value="grayscale">Grayscale</MenuItem>
                                  <MenuItem value="sepia">Sepia</MenuItem>
                                </Select>
                              </FormControl>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>

                      <Button
                        variant="contained"
                        onClick={generateFullStoryboard}
                        style={{
                          marginTop: 24,
                          background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(90deg, #738bff, #ff5eb1)'
                            : 'linear-gradient(90deg, #4361ee, #f72585)',
                        }}
                        startIcon={<Refresh />}
                      >
                        Regenerate Storyboard with New Settings
                      </Button>
                    </Box>
                  )}

                  {storyboardView === 'export' && (
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        Export Options
                      </Typography>

                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            Export Format
                          </Typography>

                          <ToggleButtonGroup
                            value="PDF"
                            exclusive
                            style={{ marginBottom: 24 }}
                          >
                            <ToggleButton value="PDF">
                              PDF Document
                            </ToggleButton>
                            <ToggleButton value="Slideshow">
                              Slideshow
                            </ToggleButton>
                          </ToggleButtonGroup>

                          <Typography variant="subtitle1" gutterBottom>
                            Export Options
                          </Typography>

                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <FormControlLabel
                                control={<Checkbox defaultChecked />}
                                label="Include Annotations"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControlLabel
                                control={<Checkbox defaultChecked />}
                                label="Include Technical Notes"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControlLabel
                                control={<Checkbox defaultChecked />}
                                label="Include Scene Descriptions"
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControlLabel
                                control={<Checkbox defaultChecked />}
                                label="High Quality Export"
                              />
                            </Grid>
                          </Grid>

                          <Button
                            variant="contained"
                            style={{ marginTop: 24 }}
                            startIcon={<Download />}
                          >
                            Export Storyboard
                          </Button>
                        </CardContent>
                      </Card>
                    </Box>
                  )}

                  {/* Regenerate button at the bottom */}
                  {storyboardView !== 'settings' && (
                    <Box style={{ marginTop: 24, display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        onClick={generateFullStoryboard}
                        disabled={loading}
                        startIcon={<Refresh />}
                      >
                        Regenerate Complete Storyboard
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </TabPanel>

          <TabPanel value={currentTab} index={7}>
            {/* Overview Tab */}
            <Paper style={{ padding: '16px', borderRadius: 4, backdropFilter: 'blur(10px)' }}>
              <Typography variant="h4" gutterBottom fontWeight={700} style={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(90deg, #a4b8ff, #ff90d1)'
                  : 'linear-gradient(90deg, #4361ee, #f72585)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Project Overview
              </Typography>
              <Grid container spacing={3}>
                <Grid xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Script Status
                      </Typography>
                      <Box style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip
                          label={scriptData ? 'Uploaded' : 'Not Started'}
                          color={scriptData ? 'success' : 'default'}
                        />
                        <Chip
                          label={oneLinerData ? 'One-Liner Generated' : 'One-Liner Pending'}
                          color={oneLinerData ? 'success' : 'default'}
                        />
                        <Chip
                          label={characterData ? 'Characters Analyzed' : 'Character Analysis Pending'}
                          color={characterData ? 'success' : 'default'}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Production Status
                      </Typography>
                      <Box style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Chip
                          label={scheduleData ? 'Schedule Created' : 'Schedule Pending'}
                          color={scheduleData ? 'success' : 'default'}
                        />
                        <Chip
                          label={budgetData ? 'Budget Created' : 'Budget Pending'}
                          color={budgetData ? 'success' : 'default'}
                        />
                        <Chip
                          label={storyboardData ? 'Storyboards Generated' : 'Storyboards Pending'}
                          color={storyboardData ? 'success' : 'default'}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid xs={12} md={4}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Quick Actions
                      </Typography>
                      <Box style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => setCurrentTab(0)}
                          startIcon={<UploadFile />}
                        >
                          Upload New Script
                        </Button>
                        <Button
                          variant="outlined"
                          onClick={clearAllData}
                          startIcon={<Refresh />}
                          color="error"
                        >
                          Reset Project
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Paper>
          </TabPanel>
        </Box>
      </div>
    </ThemeProvider>
  );
}