
import React, { useState } from 'react';
import type { RestorationResult } from '../types';
import { DownloadIcon } from './icons';
import { WandIcon } from './icons';


interface ResultsDisplayProps {
  results: RestorationResult[];
  onUseAsSource: (imageUrl: string) => void;
}

const ResultCard: React.FC<{ result: RestorationResult, onUseAsSource: (imageUrl: string) => void }> = ({ result, onUseAsSource }) => {
    const [activeTab, setActiveTab] = useState(0);

    const handleDownload = async (url: string, index: number) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const filename = `restored-${result.id}-output${index + 1}.png`;
            const file = new File([blob], filename, { type: blob.type });

            // Use Web Share API if available (great for mobile)
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: 'Restored Image',
                    text: 'Here is the photo I restored with KevBuy AI.',
                });
                return; // Exit after successful share
            }
            
            // Fallback for desktop or browsers that don't support Web Share
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);

        } catch (error) {
            console.error('Download/Share failed:', error);
            // Don't alert for share cancellation errors, which throws an AbortError
            if ((error as Error).name !== 'AbortError') {
              alert('Could not save the image. Please try right-clicking the image and selecting "Save Image As...".');
            }
        }
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div>
                    <h3 className="text-center font-bold p-2 bg-gray-700 text-gray-300">Original</h3>
                    <img src={result.originalUrl} alt="Original" className="w-full h-auto object-contain" />
                </div>
                <div className="relative flex flex-col">
                    <div className="flex border-b border-gray-700">
                       {result.restoredUrls.map((_, index) => (
                           <button 
                             key={index}
                             onClick={() => setActiveTab(index)}
                             className={`flex-1 font-bold p-2 text-center transition-colors ${activeTab === index ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                           >
                            Output {index + 1}
                           </button>
                       ))}
                    </div>
                    <div className="relative grow">
                        {result.restoredUrls.map((url, index) => (
                            <div key={index} className={activeTab === index ? 'block' : 'hidden'}>
                                <img src={url} alt={`Restored Output ${index + 1}`} className="w-full h-auto object-contain" />
                            </div>
                        ))}
                         <button onClick={() => handleDownload(result.restoredUrls[activeTab], activeTab)} className="absolute top-2 right-2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-transform duration-200 hover:scale-110" aria-label="Download Image">
                            <DownloadIcon className="w-5 h-5" />
                        </button>
                        <button onClick={() => onUseAsSource(result.restoredUrls[activeTab])} className="absolute bottom-2 right-2 flex items-center gap-2 bg-teal-600 text-white py-1 px-3 rounded-md hover:bg-teal-700 transition-transform duration-200 hover:scale-105 text-sm" aria-label="Use as new source image">
                            <WandIcon className="w-4 h-4" />
                            Use as Source
                        </button>
                    </div>
                </div>
            </div>
            <div className="p-4 bg-gray-700/50">
                <p className="text-xs text-gray-400"><strong>Prompt:</strong> {result.prompt}</p>
                {result.modelText && <p className="text-xs text-gray-400 mt-1"><strong>Model Note:</strong> {result.modelText}</p>}
            </div>
        </div>
    );
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, onUseAsSource }) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-300">Restoration Results</h2>
      <div className="space-y-6">
        {results.map(result => (
          <ResultCard key={result.id} result={result} onUseAsSource={onUseAsSource} />
        ))}
      </div>
    </div>
  );
};