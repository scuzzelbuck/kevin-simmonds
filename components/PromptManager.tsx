
import React from 'react';

interface PromptManagerProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  savedPrompts: string[];
  onSavePrompt: () => void;
}

export const PromptManager: React.FC<PromptManagerProps> = ({ prompt, setPrompt, savedPrompts, onSavePrompt }) => {
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
      <div className="flex justify-between items-center">
        <div className="flex-grow mr-2">
          {savedPrompts.length > 0 && (
            <select
              onChange={(e) => e.target.value && setPrompt(e.target.value)}
              className="w-full h-10 block rounded-md border-gray-600 bg-gray-800 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 text-gray-400"
            >
              <option value="">Use a saved prompt...</option>
              {savedPrompts.map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>
          )}
        </div>
        <button
          type="button"
          onClick={onSavePrompt}
          disabled={!prompt || savedPrompts.includes(prompt)}
          className="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          Save Prompt
        </button>
      </div>
    </div>
  );
};
