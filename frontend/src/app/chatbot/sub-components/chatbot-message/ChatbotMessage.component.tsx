"use client";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import ChatbotMessageSources from "../chatbot-message-sources/ChatbotMessageSources.component";
import ChatbotTypingIndicator from "../chatbot-typing-indicator/ChatbotTypingIndicator.component";

import type { ChatbotMessageProps } from "./ChatbotMessage.interface";

const ChatbotMessage = ({
  message,
  messageIndex,
  totalMessages,
  status,
}: ChatbotMessageProps) => {
  const textParts = message.parts.filter((part) => part.type === "text");
  const sourceParts = message.parts.filter(
    (part) => part.type === "source-url"
  );

  const isAssistant = message.role === "assistant";
  const hasText = textParts.some((part) => part.text.trim());

  const isLastMessage = messageIndex === totalMessages - 1;
  const isStreaming = status === "streaming";
  const showSources =
    sourceParts.length > 0 && hasText && !(isLastMessage && isStreaming);

  if (isAssistant && !hasText) {
    return (
      <Message from={message.role}>
        <MessageContent className="bg-lime-50 rounded-lg p-3">
          <ChatbotTypingIndicator />
        </MessageContent>
      </Message>
    );
  }

  return (
    <Message from={message.role}>
      <MessageContent className={"bg-lime-50 rounded-lg p-3"}>
        {textParts.map((part, index) => (
          <MessageResponse key={`${message.id}-${index}`}>
            {part.text}
          </MessageResponse>
        ))}
      </MessageContent>

      {isAssistant && showSources && (
        <ChatbotMessageSources sourceParts={sourceParts} />
      )}
    </Message>
  );
};

export default ChatbotMessage;
