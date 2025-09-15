
import { GoogleGenAI, Modality, GenerateContentResponse, Part } from "@google/genai";
import type { RestorationResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

export const restoreImage = async (
  sourceImageFile: File,
  prompt: string,
  referenceImageFile: File | null
): Promise<Omit<RestorationResult, 'id' | 'originalUrl' | 'timestamp'>> => {
  const model = 'gemini-2.5-flash-image-preview';

  const sourceImagePart = await fileToGenerativePart(sourceImageFile);
  
  let finalPrompt = `This is a photo restoration task. The user wants to restore the first image. Do not add any watermarks, text, logos, or signatures to the output image.`;

  const parts: Part[] = [sourceImagePart];

  if (referenceImageFile) {
    const referenceImagePart = await fileToGenerativePart(referenceImageFile);
    parts.push(referenceImagePart);
    finalPrompt += ` Use the second image provided as a reference for color palette, tonality, contrast, and overall style. The user's specific instruction is: "${prompt}". If the user's instruction directly contradicts the reference image (e.g., 'make it black and white'), the user's instruction takes priority.`;
  } else {
    finalPrompt += ` The user's specific instruction is: "${prompt}".`;
  }

  parts.push({ text: finalPrompt });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: { parts: parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    let restoredUrl = '';
    let modelText = 'No text response from model.';

    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes = part.inlineData.data;
          restoredUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        } else if (part.text) {
          modelText = part.text;
        }
      }
    }

    if (!restoredUrl) {
      throw new Error("API did not return an image.");
    }
    
    return {
      restoredUrl,
      prompt,
      modelText,
    };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the Gemini API.");
  }
};
