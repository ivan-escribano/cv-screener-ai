export interface DocumentChunk {
  id: string;
  text: string;
  fileId: string;
  chunkIndex: number;
}

export interface EmbeddedChunk extends DocumentChunk {
  embedding: number[];
}

export interface ParsedDocument {
  fileId: string;
  chunks: DocumentChunk[];
}
