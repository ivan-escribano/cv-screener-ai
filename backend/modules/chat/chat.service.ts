import { openai } from '@ai-sdk/openai';
import {
  convertToModelMessages,
  createUIMessageStream,
  streamText,
  UIMessage,
  UIMessageStreamWriter,
} from 'ai';
import path from 'path';
import { fileURLToPath } from 'url';

import { EnvironmentConfig } from '../../config/env-variables/env.config.js';
import { OpenAIConfig } from '../../config/openai/openai.config.js';
import { Supabase } from '../../config/supabase/supabase.config.js';
import { ChatConfig, EmbeddingConfig } from '../../services/openai/openai.config.js';
import { loadPrompt } from '../../utils/load-prompt.util.js';
import { CHAT_PATHS, ERROR_MESSAGES, VECTOR_CONFIG } from './chat.config.js';
import {
  DocumentChunk,
  DocumentSource,
  RetrievalContext,
  SimilarityMatch,
  SupabaseChunkRow,
} from './chat.interface.js';

const PROMPTS_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  CHAT_PATHS.PROMPTS_DIRECTORY
);

//!Search for similar vectors in the vector DB
const searchBySimilarity = async (
  query: string,
  limit = VECTOR_CONFIG.DEFAULT_LIMIT,
  minSimilarity = VECTOR_CONFIG.MIN_SIMILARITY
): Promise<SimilarityMatch[]> => {
  const openAiConfig = {
    model: EmbeddingConfig.model,
    dimensions: EmbeddingConfig.dimensions,
    input: query,
  };

  const response = await OpenAIConfig.embeddings.create(openAiConfig);

  const searchVector = response.data[0].embedding;

  const { data, error } = await Supabase.rpc(VECTOR_CONFIG.SUPABASE_RPC, {
    query_embedding: `[${searchVector.join(',')}]`,
    match_count: limit,
    match_threshold: minSimilarity,
  });

  if (error) throw new Error(ERROR_MESSAGES.ERROR_QUERYING_VECTORS);

  const formattedData: SimilarityMatch[] = data.map((row: SupabaseChunkRow) => ({
    id: row.id,
    content: row.content,
    fileId: row.file_id,
    similarity: row.similarity,
  }));

  return formattedData;
};

//! Get the other chunks of the chunk marked as relevant/important for full context
const getFullDocumentContext = async (fileIds: string[]): Promise<DocumentChunk[]> => {
  const { data, error } = await Supabase.from(EnvironmentConfig.SUPABASE.VECTOR_TABLE_NAME)
    .select('file_id, content, chunk_index')
    .in('file_id', fileIds)
    .order('file_id')
    .order('chunk_index');

  if (error) throw new Error(ERROR_MESSAGES.ERROR_GETTING_CHUNKS);

  const formattedData: DocumentChunk[] = data.map((row) => ({
    fileId: row.file_id,
    content: row.content,
  }));

  return formattedData;
};

//! Build context for LLM from relevant chunks and sources
const buildRetrievalContext = async (userQuery: string): Promise<RetrievalContext> => {
  const relevantChunks = await searchBySimilarity(userQuery);

  const sources: DocumentSource[] = relevantChunks.map((chunk) => ({
    fileId: chunk.fileId,
    snippet: chunk.content.slice(0, 200),
    similarity: chunk.similarity,
  }));

  const uniqueFileIds = [...new Set(relevantChunks.map((c) => c.fileId))];

  const fullDocuments = await getFullDocumentContext(uniqueFileIds);

  const documentContentMap = __groupChunksByDocument(fullDocuments);

  const context = __formatContextForLLM(documentContentMap);

  return { context, sources };
};

//! Extract the last user message from the conversation
const extractUserQuery = (messages: UIMessage[]): string | null => {
  const lastMessage = messages[messages.length - 1];

  return lastMessage.parts?.find((p) => p.type === 'text')?.text || null;
};

//! Create chat stream with context and sources
const createChatStream = (messages: UIMessage[], { context, sources }: RetrievalContext) => {
  const systemPrompt = loadPrompt(path.join(PROMPTS_DIR, CHAT_PATHS.SYSTEM_PROMPT), {
    CONTEXT: context,
  });

  return createUIMessageStream({
    execute: async ({ writer }) => {
      const result = streamText({
        model: openai(ChatConfig.model),
        system: systemPrompt,
        messages: await convertToModelMessages(messages),
        onFinish: () => __writeSourcesToStream(writer, sources),
      });

      writer.merge(result.toUIMessageStream());
    },
  });
};

//! Private helpers

const __writeSourcesToStream = (writer: UIMessageStreamWriter, sources: DocumentSource[]): void => {
  sources.forEach((source, index) => {
    writer.write({
      type: 'source-url',
      sourceId: `source-${index}`,
      url: source.fileId,
      title: source.fileId,
      providerMetadata: {
        custom: {
          snippet: source.snippet,
          similarity: source.similarity,
        },
      },
    });
  });
};

const __groupChunksByDocument = (chunks: DocumentChunk[]): Map<string, string[]> => {
  const grouped = new Map<string, string[]>();

  chunks.forEach((chunk) => {
    if (!grouped.has(chunk.fileId)) grouped.set(chunk.fileId, []);

    grouped.get(chunk.fileId)!.push(chunk.content);
  });

  return grouped;
};

const __formatContextForLLM = (documentMap: Map<string, string[]>): string => {
  return Array.from(documentMap.entries())
    .map(([docId, contents]) => `=== ${docId} ===\n${contents.join('\n')}`)
    .join('\n\n');
};

export const ChatService = {
  searchBySimilarity,
  getFullDocumentContext,
  buildRetrievalContext,
  createChatStream,
  extractUserQuery,
};
