
import React from 'react';
import type { RestorationResult } from '../types';
import { DownloadIcon } from './icons';

interface ResultsDisplayProps {
  results: RestorationResult[];
}

const ResultCard: React.FC<{ result: RestorationResult }> = ({ result }) => {
    
    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = result.restoredUrl;
        link.download = `restored-${result.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div>
                    <h3 className="text-center font-bold p-2 bg-gray-700 text-gray-300">Original</h3>
                    <img src={result.originalUrl} alt="Original" className="w-full h-auto object-contain" />
                </div>
                <div className="relative">
                    <h3 className="text-center font-bold p-2 bg-gray-700 text-gray-300">Restored</h3>
                    <img src={result.restoredUrl} alt="Restored" className="w-full h-auto object-contain" />
                    <button onClick={handleDownload} className="absolute top-12 right-2 bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700 transition-transform duration-200 hover:scale-110">
                        <DownloadIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="p-4 bg-gray-700/50">
                <p className="text-xs text-gray-400"><strong>Prompt:</strong> {result.prompt}</p>
                {result.modelText && <p className="text-xs text-gray-400 mt-1"><strong>Model Note:</strong> {result.modelText}</p>}
            </div>
        </div>
    );
};


export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-300">Restoration Results</h2>
      <div className="space-y-6">
        {results.map(result => (
          <ResultCard key={result.id} result={result} />
        ))}
      </div>
    </div>
  );
};
