import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

import { OpenAIConfig } from '../../config/openai/openai.config.js';
import { ChatConfig, EmbeddingConfig } from './openai.config.js';

async function createEmbedding(text: string): Promise<number[]> {
  const response = await OpenAIConfig.embeddings.create({
    model: EmbeddingConfig.model,
    dimensions: EmbeddingConfig.dimensions,
    input: text,
  });

  return response.data[0].embedding;
}

async function createEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const response = await OpenAIConfig.embeddings.create({
    model: EmbeddingConfig.model,
    dimensions: EmbeddingConfig.dimensions,
    input: texts,
  });

  return response.data.map((item) => item.embedding);
}

async function generateObject<T extends z.ZodType>(
  schema: T,
  prompt: string,
  schemaName: string
): Promise<z.infer<T>> {
  const response = await OpenAIConfig.chat.completions.create({
    model: ChatConfig.model,
    messages: [{ role: 'user', content: prompt }],
    response_format: zodResponseFormat(schema, schemaName),
  });

  const content = response.choices[0].message.content;

  if (!content) throw new Error('No se pudo generar el objeto estructurado');

  return schema.parse(JSON.parse(content));
}

export const OpenAIService = {
  createEmbedding,
  createEmbeddings,
  generateObject,
};
