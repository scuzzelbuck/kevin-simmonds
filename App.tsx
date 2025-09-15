
import React, { useState, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { ImageFile, RestorationResult } from './types';
import { restoreImage } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { PromptManager } from './components/PromptManager';
import { ResultsDisplay } from './components/ResultsDisplay';
import { HistoryGallery } from './components/HistoryGallery';
import { WandIcon, HistoryIcon } from './components/icons';

const App: React.FC = () => {
  const [sourceImages, setSourceImages] = useState<ImageFile[]>([]);
  const [referenceImage, setReferenceImage] = useState<ImageFile[]>([]);
  const [prompt, setPrompt] = useState<string>('');
  const [savedPrompts, setSavedPrompts] = useLocalStorage<string[]>('saved-prompts', []);
  const [history, setHistory] = useLocalStorage<RestorationResult[]>('restoration-history', []);
  
  const [currentResults, setCurrentResults] = useState<RestorationResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const handleSavePrompt = () => {
    if (prompt && !savedPrompts.includes(prompt)) {
      setSavedPrompts([...savedPrompts, prompt]);
    }
  };

  const deleteFromHistory = (id: string) => {
    setHistory(history.filter(item => item.id !== id));
  };
  
  const handleRestore = useCallback(async () => {
    if (sourceImages.length === 0 || !prompt) {
      setError("Please upload at least one image and provide a prompt.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentResults([]);
    setProgress(0);

    const newResults: RestorationResult[] = [];
    const totalImages = sourceImages.length;

    for (let i = 0; i < totalImages; i++) {
        const imageFile = sourceImages[i];
        try {
            const resultData = await restoreImage(imageFile.file, prompt, referenceImage[0]?.file || null);
            const newResult: RestorationResult = {
                ...resultData,
                id: `result-${Date.now()}-${i}`,
                originalUrl: imageFile.previewUrl,
                timestamp: Date.now(),
            };
            newResults.push(newResult);
            setCurrentResults([...newResults]);
        } catch (e) {
            console.error(`Failed to process image ${imageFile.file.name}:`, e);
            const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
            setError(`Failed on image ${i + 1}/${totalImages}: ${errorMessage}`);
            setIsLoading(false);
            return;
        }
        setProgress(((i + 1) / totalImages) * 100);
    }
    
    setHistory(prev => [...newResults, ...prev]);
    setIsLoading(false);
  }, [sourceImages, prompt, referenceImage, setHistory]);


  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
        <HistoryGallery isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} history={history} onDelete={deleteFromHistory} />
        
        <header className="w-full max-w-4xl mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <WandIcon className="w-8 h-8 text-indigo-400"/>
                <h1 className="text-3xl font-bold tracking-tight text-white">Nano Banana Photo Restorer</h1>
            </div>
            <button
                onClick={() => setIsHistoryOpen(true)}
                className="inline-flex items-center gap-2 rounded-md bg-gray-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
            >
                <HistoryIcon className="w-5 h-5" />
                History
            </button>
        </header>

      <main className="w-full max-w-4xl bg-gray-800/50 p-6 rounded-xl shadow-2xl border border-gray-700">
        <div className="space-y-6">
          <ImageUploader 
            id="source-images" 
            label="1. Upload Images to Restore (up to 10)" 
            files={sourceImages}
            onFilesChange={setSourceImages}
            multiple={true}
            maxFiles={10}
          />
          <ImageUploader
            id="reference-image"
            label="2. (Optional) Upload a Reference Image for Style"
            files={referenceImage}
            onFilesChange={setReferenceImage}
            multiple={false}
          />
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">3. Describe the Restoration</label>
            <PromptManager
                prompt={prompt}
                setPrompt={setPrompt}
                savedPrompts={savedPrompts}
                onSavePrompt={handleSavePrompt}
            />
          </div>

          <div className="pt-4">
            <button
              onClick={handleRestore}
              disabled={isLoading || sourceImages.length === 0 || !prompt}
              className="w-full flex justify-center items-center gap-3 rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? 'Restoring...' : 'Start Restoration'}
              <WandIcon className="w-5 h-5"/>
            </button>
          </div>
          
          {error && <div className="mt-4 text-center text-red-400 bg-red-900/50 p-3 rounded-md">{error}</div>}

          {isLoading && (
            <div className="w-full mt-4">
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                      In Progress
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-indigo-300">
                      {Math.round(progress)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-900">
                  <div style={{ width: `${progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <ResultsDisplay results={currentResults} />
      </main>

      <footer className="w-full max-w-4xl mt-8 text-center text-gray-500 text-sm">
        <p>Powered by Google's Gemini API. All data is stored locally in your browser.</p>
      </footer>
    </div>
  );
};

export default App;
