import type { UIMessage } from "@ai-sdk/react";

export interface SourceMetadata {
  snippet?: string;
  similarity?: number;
}

export interface ChatbotMessageProps {
  message: UIMessage;
  messageIndex: number;
  totalMessages: number;
  status: string;
}

export interface ChatbotMessageSourcesProps {
  sourceParts: UIMessage["parts"];
}
