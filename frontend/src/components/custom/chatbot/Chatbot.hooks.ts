"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback, useState } from "react";

import { DefaultChatTransport } from "ai";

import { CHATBOT_CONFIG } from "./Chatbot.config";

import type { PromptInputMessage } from "@/components/ai-elements/prompt-input";

export const useChatbot = () => {
  const [text, setText] = useState("");

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: CHATBOT_CONFIG.api,
    }),
  });

  const handleSubmit = useCallback(
    (message: PromptInputMessage) => {
      if (!message.text?.trim()) return;
      sendMessage({ text: message.text });
      setText("");
    },
    [sendMessage]
  );

  const handleSuggestionClick = useCallback(
    (suggestion: string) => {
      sendMessage({ text: suggestion });
    },
    [sendMessage]
  );

  const handleTextChange = useCallback((value: string) => {
    setText(value);
  }, []);

  return {
    text,
    messages,
    status,
    error,
    handleSubmit,
    handleSuggestionClick,
    handleTextChange,
  };
};
