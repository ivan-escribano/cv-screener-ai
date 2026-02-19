import fs from 'fs/promises';
import path from 'path';
import { PDFParse } from 'pdf-parse';

import { EnvironmentConfig } from '../../config/env-variables/env.config.js';
import { Supabase } from '../../config/supabase/supabase.config.js';
import { ERROR_MESSAGES, INGEST_CONFIG } from './ingest.config.js';
import { DocumentChunk, EmbeddedChunk, ParsedDocument } from './ingest.interface.js';

//! Scans a folder and parses all PDF files into chunks
const parseAllDocuments = async (folderPath: string): Promise<ParsedDocument[]> => {
  const files = await fs.readdir(folderPath);

  const pdfFiles = files.filter((file) => file.endsWith('.pdf'));

  const pdfPaths = pdfFiles.map((file) => path.join(folderPath, file));

  const results = await Promise.allSettled(pdfPaths.map(__parsePDF));

  return results.filter((result) => result.status === 'fulfilled').map((result) => result.value);
};

//! Store chunks with their embeddings to the vector database
const insertIntoVectorStore = async (chunks: EmbeddedChunk[]): Promise<void> => {
  const records = chunks.map((chunk) => ({
    content: chunk.text,
    embedding: `[${chunk.embedding.join(',')}]`,
    file_id: chunk.fileId,
    chunk_index: chunk.chunkIndex,
  }));

  const { error } = await Supabase.from(EnvironmentConfig.SUPABASE.VECTOR_TABLE_NAME).insert(
    records
  );

  if (error) throw new Error(`${ERROR_MESSAGES.STORE_VECTORS_FAILED}: ${error.message}`);
};

//!Extracts text from a PDF and splits it into chunks
const __parsePDF = async (pdfPath: string): Promise<ParsedDocument> => {
  if (!pdfPath.endsWith('.pdf')) throw new Error(ERROR_MESSAGES.FILE_NOT_PDF);

  const fileBuffer = await fs.readFile(pdfPath);
  const pdfParser = new PDFParse({ data: fileBuffer });

  try {
    const { text: extractedText } = await pdfParser.getText();

    const fileId = path.basename(pdfPath);

    const chunks = __splitIntoChunks(extractedText, fileId);

    return { fileId, chunks };
  } finally {
    await pdfParser.destroy();
  }
};

//! Splits text into overlapping chunks for better semantic search
const __splitIntoChunks = (text: string, fileId: string): DocumentChunk[] => {
  const chunks: DocumentChunk[] = [];
  const step = INGEST_CONFIG.CHUNK_SIZE - INGEST_CONFIG.CHUNK_OVERLAP;

  let position = 0;
  let index = 0;

  while (position < text.length) {
    const end = Math.min(position + INGEST_CONFIG.CHUNK_SIZE, text.length);
    const content = text.slice(position, end).trim();

    if (content) {
      chunks.push({
        id: `${fileId}_chunk_${index}`,
        text: content,
        fileId,
        chunkIndex: index,
      });
      index++;
    }

    position += step;
  }

  return chunks;
};

export const IngestService = {
  parseAllDocuments,
  insertIntoVectorStore,
  splitIntoChunks: __splitIntoChunks, // Actualizado: expuesto para reutilizar en cvs
};
