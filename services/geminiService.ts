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
  const parts: Part[] = [sourceImagePart];

  let fullPromptText = `You are an expert photo restoration AI. Do not add any watermarks, text, logos, or signatures to the output image.`;

  if (referenceImageFile) {
    const referenceImagePart = await fileToGenerativePart(referenceImageFile);
    parts.push(referenceImagePart);
    fullPromptText += ` You are an expert photo editor. Your task is to edit the first image using the second image as a reference for color and lighting style ONLY.

**Core Directive:** The first image is the subject of the edit. The second image is strictly a reference for color and light. Absolutely no physical details, objects, textures, or artifacts from the reference image are to be transferred to the first image.

Follow these instructions with extreme precision:

**Primary Goal:** Preserve the original structure, composition, and content of the first image. You will reimagine it with the color palette and lighting style inspired by the second image. The goal is to transfer the mood, tone, and atmosphere, not the content.

**Strict Rules:**
1.  **Image 1 is the Canvas:** The final output MUST be a modified version of the **first image**.
2.  **Image 2 is the Palette:** Use the second image ONLY to understand its color grading, lighting, contrast, and overall ambiance. Apply this aesthetic to the first image.
3.  **Content Integrity is Absolute:** DO NOT transfer, copy, blend, or otherwise introduce any objects, people, animals, shapes, or structural elements from the second image into the first. The content of the first image must remain completely intact.

**User's Request:** The user's specific request for this restoration is: "${prompt}". This request applies exclusively to the **first image**.`;
  } else {
    fullPromptText += ` Your task is to restore the provided image. Focus exclusively on correcting imperfections such as scratches, dust, and tears; adjusting color balance and vibrancy; and improving lighting and contrast. It is crucial that you preserve the original content, composition, and details of the image. Do not add, remove, or alter any objects or subjects unless explicitly instructed to do so by the user's prompt. The user's specific request is: "${prompt}".`;
  }
  
  parts.push({ text: fullPromptText });
  
  const modelRequestPayload = {
      model: model,
      contents: { parts: parts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
  };

  try {
    // Make two parallel API calls to get two distinct image options
    const [response1, response2] = await Promise.all([
      ai.models.generateContent(modelRequestPayload),
      ai.models.generateContent(modelRequestPayload)
    ]);

    const restoredUrls: string[] = [];
    let modelText = 'No text response from model.';

    const processResponse = (response: GenerateContentResponse): string | null => {
      let imageUrl: string | null = null;
      if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            const base64ImageBytes = part.inlineData.data;
            imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
          } else if (part.text && modelText === 'No text response from model.') {
            // Only capture the text response from the first successful call
            modelText = part.text;
          }
        }
      }
      return imageUrl;
    };

    const url1 = processResponse(response1);
    const url2 = processResponse(response2);

    if (url1) restoredUrls.push(url1);
    if (url2) restoredUrls.push(url2);

    if (restoredUrls.length < 2) {
      throw new Error(`API did not return two distinct images. Got ${restoredUrls.length}.`);
    }
    
    return {
      restoredUrls,
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