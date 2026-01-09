import { Request, Response } from 'express';

import { EnvironmentConfig } from '../../config/env-variables/env.config.js';
import { OpenAIService } from '../../services/openai/openai.service.js';
import { SUCCESS_MESSAGES } from './ingest.config.js';
import { IngestService } from './ingest.service.js';

//! Handle PDF ingestion request
const ingestPDFs = async (_: Request, res: Response) => {
  try {
    const pdfs = await IngestService.parseAllDocuments(EnvironmentConfig.PATHS.CVS);

    const allChunks = pdfs.flatMap((pdf) => pdf.chunks);
    const texts = allChunks.map((chunk) => chunk.text);

    const embeddings = await OpenAIService.createEmbeddings(texts);

    const chunksWithEmbeddings = allChunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index],
    }));

    await IngestService.insertIntoVectorStore(chunksWithEmbeddings);

    res.status(200).json({ success: true, message: SUCCESS_MESSAGES.PDFS_INGESTED });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
};

export const IngestController = {
  ingestPDFs,
};
