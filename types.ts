
export interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
}

export interface RestorationResult {
  id: string;
  originalUrl: string;
  restoredUrl: string;
  prompt: string;
  modelText: string;
  timestamp: number;
}
