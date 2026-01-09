import { Part } from '@google/generative-ai';

import { GoogleGenAI } from '../../config/google-gen-ai/google-gen-ai.config.js';
import { GoogleGenAIConfig } from './google-gen-ai.config.js';

async function generateImage(prompt: string): Promise<string> {
  const model = GoogleGenAI.getGenerativeModel({
    model: GoogleGenAIConfig.imageModel,
    generationConfig: {
      candidateCount: 1,
    },
  });

  const result = await model.generateContent(prompt);

  const imagePart = result.response.candidates?.[0]?.content?.parts?.find(
    (part: Part) => 'inlineData' in part
  );

  if (!imagePart || !('inlineData' in imagePart) || !imagePart.inlineData)
    throw new Error('No se pudo generar la imagen');

  return imagePart.inlineData.data!;
}

export const GoogleGenAIService = {
  generateImage,
};
