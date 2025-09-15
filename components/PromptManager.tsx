import React from 'react';
import { DownloadIcon, TrashIcon } from './icons';

interface PromptManagerProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  savedPrompts: string[];
  onSavePrompt: () => void;
}

const PRESET_PROMPTS = [
  'increase contrast',
  'restore image',
  'restore color',
  'remove defects',
  'correct over exposure',
  'remove blemishes',
  'infill missing details',
];

const ALL_LIGHTING_PROMPTS = [
  'deep winter shadows',    // 0
  'crisp winter light',     // 1
  'cool morning light',     // 2
  'early morning light',    // 3
  'soft overcast light',    // 4
  'cloudy daylight',        // 5
  'diffused daylight',      // 6
  'neutral daylight',       // 7
  'clear daylight',         // 8
  'bright midday sun',      // 9
  '',                       // 10 (Neutral)
  'gentle afternoon light', // 11
  'warm afternoon sun',     // 12
  'warm summer light',      // 13
  'late afternoon light',   // 14
  'golden hour light',      // 15
  'magic hour light',       // 16
  'warm sunset glow',       // 17
  'vibrant sunset light',   // 18
  'dramatic sunset light',  // 19
  'dusk light'              // 20
];
const PRESET_COLORS = ['#000000', '#ffffff', '#cccccc', '#60a5fa', '#f87171', '#4ade80'];


export const PromptManager: React.FC<PromptManagerProps> = ({ prompt, setPrompt, savedPrompts, onSavePrompt }) => {

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      setPrompt(e.target.value);
    }
  };
  
  const handleClearPrompt = () => {
    setPrompt('');
  };

  const handleExportPrompts = () => {
    if (savedPrompts.length === 0) {
      return;
    }
    const promptsText = savedPrompts.join('\n\n---\n\n');
    const blob = new Blob([promptsText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'saved-prompts.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  const updatePrompt = (add: string[] = [], remove: (string | RegExp)[] = []) => {
    let currentParts = prompt.split(', ').map(p => p.trim()).filter(Boolean);
    
    // Remove specified parts
    remove.forEach(partToRemove => {
      currentParts = currentParts.filter(p => {
        if (typeof partToRemove === 'string') {
          return p !== partToRemove;
        }
        return !partToRemove.test(p);
      });
    });

    // Add new parts, ensuring no duplicates
    const newParts = new Set([...currentParts, ...add.filter(Boolean)]);
    
    // Maintain a consistent order for presets
    const orderedPrompt = [
        ...PRESET_PROMPTS.filter(p => newParts.has(p)),
        ...Array.from(newParts).filter(p => !PRESET_PROMPTS.includes(p))
    ];

    setPrompt(Array.from(new Set(orderedPrompt)).join(', '));
  };


  // --- Restoration Presets Logic ---
  const currentPromptsSet = new Set(prompt.split(', ').map(p => p.trim()).filter(Boolean));
  const areAllPresetsSelected = PRESET_PROMPTS.every(p => currentPromptsSet.has(p));

  const handlePresetChange = (preset: string) => {
    if (currentPromptsSet.has(preset)) {
      updatePrompt([], [preset]);
    } else {
      updatePrompt([preset], []);
    }
  };

  const handleToggleSelectAll = () => {
    if (areAllPresetsSelected) {
      updatePrompt([], PRESET_PROMPTS);
    } else {
       updatePrompt(PRESET_PROMPTS, []);
    }
  };

  // --- Background & Lighting Logic ---
  
  // Derived state from prompt string for UI sync
  const currentPrompts = Array.from(currentPromptsSet);
  const backdropRegex = /with a (plain|gradient) (.*?) backdrop/;
  const backdropPrompt = currentPrompts.find(p => backdropRegex.test(p));
  const backdropMatch = backdropPrompt ? backdropPrompt.match(backdropRegex) : null;
  const derivedBackdropStyle = backdropMatch ? backdropMatch[1] : 'none';
  const derivedBackdropColor = backdropMatch ? backdropMatch[2] : '#cccccc';
  
  const derivedLightingPrompt = currentPrompts.find(p => ALL_LIGHTING_PROMPTS.includes(p));
  const derivedSliderValue = derivedLightingPrompt ? ALL_LIGHTING_PROMPTS.indexOf(derivedLightingPrompt) : 10;

  const handleRemoveBackgroundToggle = () => {
    if (currentPromptsSet.has('remove background')) {
      updatePrompt([], ['remove background']);
    } else {
      updatePrompt(['remove background'], []);
    }
  };

  const handleBackdropStyleChange = (style: 'none' | 'plain' | 'gradient') => {
    const newPrompt = style !== 'none' ? [`with a ${style} ${derivedBackdropColor} backdrop`] : [];
    updatePrompt(newPrompt, [backdropRegex]);
  };

  const handleBackdropColorChange = (color: string) => {
    if (derivedBackdropStyle !== 'none') {
        updatePrompt([`with a ${derivedBackdropStyle} ${color} backdrop`], [backdropRegex]);
    }
  };
  
  const handleLightingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const lightingText = ALL_LIGHTING_PROMPTS[value];
    updatePrompt(lightingText ? [lightingText] : [], ALL_LIGHTING_PROMPTS);
  };


  return (
    <div className="w-full flex flex-col space-y-4">
      
      {/* Preset Actions Section */}
      <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-white">Preset Actions</h4>
            <div className="flex items-center space-x-2">
                <input 
                  id="select-all-presets" 
                  type="checkbox" 
                  checked={areAllPresetsSelected}
                  onChange={handleToggleSelectAll}
                  className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="select-all-presets" className="text-sm font-medium text-gray-200 cursor-pointer">Select All</label>
            </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
          {PRESET_PROMPTS.map(preset => (
            <div key={preset} className="flex items-center">
              <input
                id={`preset-${preset.replace(/\s+/g, '-')}`}
                type="checkbox"
                checked={currentPromptsSet.has(preset)}
                onChange={() => handlePresetChange(preset)}
                className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor={`preset-${preset.replace(/\s+/g, '-')}`} className="ml-2 block text-sm text-gray-200 capitalize cursor-pointer">
                {preset}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Background & Lighting Section */}
      <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-white mb-3">Background & Lighting</h4>
        <div className="space-y-4">
          <div className="flex items-center">
             <input
                id="remove-background"
                type="checkbox"
                checked={currentPromptsSet.has('remove background')}
                onChange={handleRemoveBackgroundToggle}
                className="h-4 w-4 rounded border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="remove-background" className="ml-2 block text-sm text-gray-200 capitalize cursor-pointer">
                Remove Background
              </label>
          </div>
          
          {/* Backdrop Style */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="text-sm text-gray-200">Backdrop:</span>
              {(['none', 'plain', 'gradient'] as const).map(style => (
                  <div key={style} className="flex items-center">
                    <input
                      id={`backdrop-${style}`}
                      type="radio"
                      name="backdrop-style"
                      checked={derivedBackdropStyle === style}
                      onChange={() => handleBackdropStyleChange(style)}
                      className="h-4 w-4 border-gray-500 bg-gray-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor={`backdrop-${style}`} className="ml-1.5 block text-sm text-gray-200 capitalize cursor-pointer">{style}</label>
                  </div>
              ))}
          </div>

          {/* Color Picker */}
          {derivedBackdropStyle !== 'none' && (
            <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm text-gray-200">Color:</span>
                {PRESET_COLORS.map(color => (
                    <button
                        key={color}
                        type="button"
                        onClick={() => handleBackdropColorChange(color)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${derivedBackdropColor === color ? 'border-white' : 'border-gray-500'}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Set background color to ${color}`}
                    />
                ))}
                <label htmlFor="custom-color-picker" className="relative cursor-pointer group">
                    <div className="w-10 h-8 rounded-md border-2 border-gray-500 group-hover:border-gray-400 transition-colors" style={{ backgroundColor: derivedBackdropColor }} />
                    <input
                        id="custom-color-picker"
                        type="color"
                        value={derivedBackdropColor}
                        onChange={(e) => handleBackdropColorChange(e.target.value)}
                        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                        aria-label="Custom background color"
                    />
                </label>
            </div>
          )}
          
          {/* Lighting Slider */}
          <div>
            <label htmlFor="lighting-slider" className="block text-sm text-gray-200 mb-1">Lighting Condition</label>
            <div className="relative pt-2">
                <div className="relative">
                    <input
                        id="lighting-slider"
                        type="range"
                        min="0"
                        max="20"
                        step="1"
                        value={derivedSliderValue}
                        onChange={handleLightingChange}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer relative z-10"
                    />
                    <div className="absolute top-1/2 left-0 right-0 h-0 flex justify-between items-center -translate-y-1/2 px-1 z-0 pointer-events-none">
                        {Array.from({ length: 21 }).map((_, i) => (
                            <div key={i} className={`h-1 w-px ${i % 5 === 0 ? 'h-2 bg-gray-400' : 'bg-gray-600'}`}></div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                    <span>Winter</span>
                    <span>Overcast</span>
                    <span>Neutral</span>
                    <span>Summer</span>
                    <span>Sunset</span>
                </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Textarea and Saved Prompts Section */}
      <div>
        <div className="flex justify-between items-center mb-1">
            <label htmlFor="prompt" className="block text-sm font-medium text-gray-200">
                Custom Prompt
            </label>
             <button
              type="button"
              onClick={handleClearPrompt}
              disabled={!prompt}
              className="text-gray-400 hover:text-red-400 disabled:text-gray-600 disabled:cursor-not-allowed transition-colors"
              aria-label="Clear prompt"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
        </div>
        <textarea
          id="prompt"
          rows={3}
          className="block w-full rounded-md border-gray-600 bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 text-white"
          placeholder="Your prompt will be built here, or you can add your own text."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <div className="flex justify-between items-center space-x-2">
        <div className="flex-grow">
            <select
              value=""
              onChange={handleSelectChange}
              className="w-full h-10 block rounded-md border-gray-600 bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 text-gray-200"
              aria-label="Select a saved prompt"
            >
              <option value="">{savedPrompts.length > 0 ? 'Use a saved prompt...' : 'No saved prompts yet'}</option>
              {savedPrompts.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>
        </div>
        <button
          type="button"
          onClick={onSavePrompt}
          disabled={!prompt || savedPrompts.includes(prompt)}
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Save Prompt
        </button>
        <button
          type="button"
          onClick={handleExportPrompts}
          disabled={savedPrompts.length === 0}
          className="inline-flex items-center gap-2 rounded-md border border-gray-600 bg-gray-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed"
          aria-label="Export saved prompts"
        >
          <DownloadIcon className="w-4 h-4" />
          Export
        </button>
      </div>
    </div>
  );
};