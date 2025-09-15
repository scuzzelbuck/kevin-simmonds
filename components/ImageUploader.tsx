
import React, { useRef, useState } from 'react';
import type { ImageFile } from '../types';
import { UploadIcon, TrashIcon, ReferenceIcon, CameraIcon } from './icons';
import { CameraCapture } from './CameraCapture';

interface ImageUploaderProps {
  id: string;
  label: string;
  files: ImageFile[];
  onFilesChange: (files: ImageFile[]) => void;
  multiple: boolean;
  maxFiles?: number;
  activeImageId?: string | null;
  setActiveImageId?: (id: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, files, onFilesChange, multiple, maxFiles = 10, activeImageId, setActiveImageId }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFilesArray = Array.from(event.target.files)
        .slice(0, multiple ? maxFiles - files.length : 1)
        .map((file: File, index: number) => ({
            id: `${file.name}-${Date.now()}`,
            file,
            previewUrl: URL.createObjectURL(file),
            isOriginal: true,
        }));
      
      const updatedFiles = multiple ? [...files, ...newFilesArray] : newFilesArray;
      onFilesChange(updatedFiles);
      if (multiple && updatedFiles.length > 0 && !activeImageId) {
        setActiveImageId?.(updatedFiles.find(f => f.isOriginal)?.id || updatedFiles[0].id);
      }
    }
  };
  
  const handleCameraCapture = (file: File) => {
    const newImageFile = {
      id: `${file.name}-${Date.now()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isOriginal: true,
    };
    
    const updatedFiles = multiple ? [...files, newImageFile].slice(0, maxFiles) : [newImageFile];
    onFilesChange(updatedFiles);

    if (multiple && updatedFiles.length > 0 && !activeImageId) {
      setActiveImageId?.(updatedFiles.find(f => f.isOriginal)?.id || updatedFiles[0].id);
    } else if (!multiple) {
        setActiveImageId?.(newImageFile.id);
    }
    
    setIsCameraOpen(false);
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);

    if (activeImageId === fileId) {
        const original = updatedFiles.find(f => f.isOriginal);
        if(original) {
            setActiveImageId?.(original.id);
        } else if (updatedFiles.length > 0) {
            setActiveImageId?.(updatedFiles[0].id);
        } else {
            setActiveImageId?.('');
        }
    }

    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const Icon = multiple ? UploadIcon : ReferenceIcon;

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <div className="flex flex-col sm:flex-row items-stretch justify-center w-full gap-2">
        <label
          htmlFor={id}
          className="flex flex-1 flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 px-2 text-center">
            <Icon className="w-8 h-8 mb-4 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">{multiple ? `Up to ${maxFiles} images` : 'A single reference image'}</p>
          </div>
          <input ref={fileInputRef} id={id} type="file" className="hidden" multiple={multiple} accept="image/*" onChange={handleFileChange} />
        </label>
         <button
          type="button"
          onClick={() => setIsCameraOpen(true)}
          className="flex flex-col items-center justify-center w-full sm:w-auto h-32 px-6 border-2 border-gray-600 border-dashed rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          aria-label="Use camera to take a photo"
        >
            <CameraIcon className="w-8 h-8 mb-2 text-gray-500" />
            <span className="text-sm text-gray-500 font-semibold">Use Camera</span>
        </button>
      </div>

      {isCameraOpen && <CameraCapture onCapture={handleCameraCapture} onClose={() => setIsCameraOpen(false)} />}


      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((imageFile) => (
            <div key={imageFile.id} className="relative group">
              <img src={imageFile.previewUrl} alt="Preview" className={`w-full h-24 object-cover rounded-md ${activeImageId === imageFile.id ? 'ring-2 ring-indigo-500' : ''}`} />
              {multiple && setActiveImageId && (
                 <div className="absolute top-1 left-1 bg-gray-900/50 rounded-full">
                    <input 
                        type="radio" 
                        name="active-image" 
                        id={`radio-${imageFile.id}`}
                        checked={activeImageId === imageFile.id}
                        onChange={() => setActiveImageId(imageFile.id)}
                        className="m-1.5 focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                 </div>
              )}
              <button
                onClick={() => removeFile(imageFile.id)}
                className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full p-1 transition-opacity opacity-0 group-hover:opacity-100"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
               <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center p-1 rounded-b-md">
                {imageFile.isOriginal ? 'Original' : 'Generated'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};