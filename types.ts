
export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  isOriginal: boolean;
}

export interface RestorationResult {
  id:string;
  originalUrl: string;
  restoredUrls: string[];
  prompt: string;
  modelText: string;
  timestamp: number;
}
