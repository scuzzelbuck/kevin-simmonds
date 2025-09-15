import React from 'react';
import { DownloadIcon } from './icons';

interface PromptManagerProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  savedPrompts: string[];
  onSavePrompt: () => void;
}

export const PromptManager: React.FC<PromptManagerProps> = ({ prompt, setPrompt, savedPrompts, onSavePrompt }) => {
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      setPrompt(e.target.value);
    }
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
  
  return (
    <div className="w-full flex flex-col space-y-2">
      <label htmlFor="prompt" className="block text-sm font-medium text-gray-400">
        Restoration Prompt
      </label>
      <textarea
        id="prompt"
        rows={3}
        className="block w-full rounded-md border-gray-600 bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 text-gray-200"
        placeholder="e.g., Fix scratches, enhance colors, and improve sharpness."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="flex justify-between items-center space-x-2">
        <div className="flex-grow">
            <select
              // By controlling the value and resetting it, we allow the same prompt to be selected again.
              value=""
              onChange={handleSelectChange}
              className="w-full h-10 block rounded-md border-gray-600 bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 text-gray-400"
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