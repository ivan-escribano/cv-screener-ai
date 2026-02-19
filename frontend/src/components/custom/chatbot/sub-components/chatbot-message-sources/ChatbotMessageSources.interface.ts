import type { UIMessage } from "@ai-sdk/react";

export interface SourceMetadata {
  snippet?: string;
  similarity?: number;
}

export interface ChatbotMessageSourcesProps {
  sourceParts: UIMessage["parts"];
}
