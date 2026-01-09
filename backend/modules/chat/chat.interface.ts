export interface SimilarityMatch {
  id: number;
  content: string;
  fileId: string;
  similarity: number;
}

export interface DocumentChunk {
  fileId: string;
  content: string;
}

export interface DocumentSource {
  fileId: string;
  snippet: string;
  similarity: number;
}

export interface RetrievalContext {
  context: string;
  sources: DocumentSource[];
}

export interface SupabaseChunkRow {
  id: number;
  content: string;
  file_id: string;
  similarity: number;
}
