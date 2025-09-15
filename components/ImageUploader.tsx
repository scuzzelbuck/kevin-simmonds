import React, { useRef } from 'react';
import type { ImageFile } from '../types';
import { UploadIcon, TrashIcon, ReferenceIcon } from './icons';

interface ImageUploaderProps {
  id: string;
  label: string;
  files: ImageFile[];
  onFilesChange: (files: ImageFile[]) => void;
  multiple: boolean;
  maxFiles?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, files, onFilesChange, multiple, maxFiles = 10 }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFilesArray = Array.from(event.target.files)
        .slice(0, multiple ? maxFiles - files.length : 1)
        // FIX: Explicitly type `file` as `File` to resolve type inference issues.
        .map((file: File) => ({
            id: `${file.name}-${Date.now()}`,
            file,
            previewUrl: URL.createObjectURL(file)
        }));
      
      if (multiple) {
        onFilesChange([...files, ...newFilesArray]);
      } else {
        onFilesChange(newFilesArray);
      }
    }
  };

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId);
    onFilesChange(updatedFiles);
    // Reset file input value to allow re-uploading the same file
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const Icon = multiple ? UploadIcon : ReferenceIcon;

  return (
    <div className="w-full">
      <label htmlFor={id} className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-800 hover:bg-gray-700 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Icon className="w-8 h-8 mb-4 text-gray-500" />
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">{multiple ? `Up to ${maxFiles} images` : 'A single reference image'}</p>
          </div>
          <input ref={fileInputRef} id={id} type="file" className="hidden" multiple={multiple} accept="image/*" onChange={handleFileChange} />
        </label>
      </div>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {files.map((imageFile) => (
            <div key={imageFile.id} className="relative group">
              <img src={imageFile.previewUrl} alt="Preview" className="w-full h-24 object-cover rounded-md" />
              <button
                onClick={() => removeFile(imageFile.id)}
                className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full p-1 transition-opacity opacity-0 group-hover:opacity-100"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
