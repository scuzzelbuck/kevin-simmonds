
import React from 'react';
import type { RestorationResult } from '../types';
import { CloseIcon, TrashIcon } from './icons';

interface HistoryGalleryProps {
  history: RestorationResult[];
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const HistoryGallery: React.FC<HistoryGalleryProps> = ({ history, isOpen, onClose, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-gray-200">Restoration History</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        {history.length > 0 ? (
          <div className="overflow-y-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.sort((a,b) => b.timestamp - a.timestamp).map(item => (
                <div key={item.id} className="group relative bg-gray-900 rounded-lg overflow-hidden">
                  <img src={item.restoredUrls[0]} alt="Restored" className="w-full h-48 object-cover" />
                  <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                    <p className="text-white text-xs line-clamp-3">{item.prompt}</p>
                  </div>
                   <button
                    onClick={() => onDelete(item.id)}
                    className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full p-1 transition-opacity opacity-0 group-hover:opacity-100"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
            <div className="flex-grow flex flex-col justify-center items-center text-gray-500">
                <p>No restorations saved yet.</p>
                <p className="text-sm">Your saved results will appear here.</p>
            </div>
        )}

      </div>
    </div>
  );
};
