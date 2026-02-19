// Creado
import { PDFParse } from 'pdf-parse';

import { EnvironmentConfig } from '../../config/env-variables/env.config.js';
import { Supabase } from '../../config/supabase/supabase.config.js';
import { OpenAIService } from '../../services/openai/openai.service.js';
import { IngestService } from '../ingest/ingest.service.js';
import { CVS_CONFIG, ERROR_CODES } from './cvs.config.js';
import { CvItem } from './cvs.interface.js';

const uploadCV = async (file: Express.Multer.File): Promise<{ fileId: string; chunks: number }> => {
  if (file.mimetype !== 'application/pdf') throw new Error(ERROR_CODES.INVALID_PDF);

  if (file.size > CVS_CONFIG.MAX_FILE_SIZE) throw new Error(ERROR_CODES.FILE_TOO_LARGE);

  if (file.size === 0) throw new Error(ERROR_CODES.INVALID_PDF);

  const isDuplicate = await __checkDuplicate(file.originalname);

  if (isDuplicate) throw new Error(ERROR_CODES.DUPLICATE_FILE);

  const text = await __extractText(file.buffer);

  if (!text.trim()) throw new Error(ERROR_CODES.NO_TEXT_EXTRACTED);

  const parsedChunks = IngestService.splitIntoChunks(text, file.originalname);

  const embeddings = await OpenAIService.createEmbeddings(parsedChunks.map((c) => c.text));

  const chunksWithEmbeddings = parsedChunks.map((chunk, index) => ({
    ...chunk,
    embedding: embeddings[index],
  }));

  await IngestService.insertIntoVectorStore(chunksWithEmbeddings);

  return { fileId: file.originalname, chunks: parsedChunks.length };
};

// Actualizado
const listCVs = async (): Promise<{ cvs: CvItem[]; total: number }> => {
  const { data, error } = await Supabase.from(EnvironmentConfig.SUPABASE.VECTOR_TABLE_NAME).select(
    'file_id, created_at'
  );

  if (error) throw new Error(error.message);

  const grouped = (data ?? []).reduce<Record<string, { chunks: number; createdAt: string }>>(
    (acc, row) => {
      if (!acc[row.file_id]) acc[row.file_id] = { chunks: 0, createdAt: row.created_at };

      acc[row.file_id].chunks++;

      return acc;
    },
    {}
  );

  const cvs: CvItem[] = Object.entries(grouped)
    .map(([fileId, { chunks, createdAt }]) => ({ fileId, chunks, createdAt }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return { cvs, total: cvs.length };
};

const deleteCV = async (fileId: string): Promise<{ fileId: string; deletedChunks: number }> => {
  const { data: existing } = await Supabase.from(EnvironmentConfig.SUPABASE.VECTOR_TABLE_NAME)
    .select('file_id')
    .eq('file_id', fileId)
    .limit(1);

  if (!existing?.length) throw new Error(ERROR_CODES.CV_NOT_FOUND);

  const { data, error } = await Supabase.from(EnvironmentConfig.SUPABASE.VECTOR_TABLE_NAME)
    .delete()
    .eq('file_id', fileId)
    .select('file_id');

  if (error) throw new Error(error.message);

  return { fileId, deletedChunks: data?.length ?? 0 };
};

const __extractText = async (buffer: Buffer): Promise<string> => {
  const pdfParser = new PDFParse({ data: buffer });
  try {
    const { text } = await pdfParser.getText();

    return text;
  } finally {
    await pdfParser.destroy();
  }
};

const __checkDuplicate = async (fileId: string): Promise<boolean> => {
  const { data } = await Supabase.from(EnvironmentConfig.SUPABASE.VECTOR_TABLE_NAME)
    .select('file_id')
    .eq('file_id', fileId)
    .limit(1);

  return (data?.length ?? 0) > 0;
};

export const CvsService = {
  uploadCV,
  listCVs,
  deleteCV,
};
