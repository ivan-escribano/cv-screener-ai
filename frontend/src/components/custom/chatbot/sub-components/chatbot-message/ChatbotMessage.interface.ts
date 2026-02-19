import type { UIMessage } from "@ai-sdk/react";

export interface ChatbotMessageProps {
  message: UIMessage;
  messageIndex: number;
  totalMessages: number;
  status: string;
}
