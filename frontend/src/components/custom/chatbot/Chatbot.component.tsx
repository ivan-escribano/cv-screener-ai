"use client";

import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { CvsApi } from "@/api/cvs/cvs.api";
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Suggestion } from "@/components/ai-elements/suggestion";
import { CHATBOT_CONFIG, CHATBOT_STATUS } from "./Chatbot.config";
import { useChatbot } from "./Chatbot.hooks";
import styles from "./Chatbot.module.css";
import ChatbotMessage from "./sub-components/chatbot-message/ChatbotMessage.component";

const Chatbot = () => {
  const {
    text,
    messages,
    status,
    error,
    handleSubmit,
    handleSuggestionClick,
    handleTextChange,
  } = useChatbot();

  const {
    suggestions,
    placeholder,
    title,
    messages: configMessages,
  } = CHATBOT_CONFIG;

  const [candidateCount, setCandidateCount] = useState<number | null>(null);

  useEffect(() => {
    CvsApi.listCVs()
      .then((res) => setCandidateCount(res.data.total))
      .catch(() => setCandidateCount(null));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.chatWrapper}>
        <Conversation
          className={messages.length === 0 ? styles.noScroll : "min-h-0"}
        >
          <ConversationContent>
            {messages.length === 0 ? (
              <div className={styles.emptyStateContainer}>
                <div className={styles.emptyStateHero}>
                  <Sparkles size={40} className={styles.emptyStateIcon} />

                  <h2 className={styles.emptyStateTitle}>{title}</h2>

                  {candidateCount !== null && (
                    <p className={styles.emptyStateSubtitle}>
                      {candidateCount}{" "}
                      {candidateCount === 1
                        ? configMessages.candidate
                        : configMessages.candidates}{" "}
                      {configMessages.available}
                    </p>
                  )}
                </div>

                <div className={styles.emptyStateSuggestions}>
                  {suggestions.map((suggestion) => (
                    <Suggestion
                      key={suggestion}
                      suggestion={suggestion}
                      onClick={handleSuggestionClick}
                    />
                  ))}
                </div>
              </div>
            ) : (
              messages.map((message, messageIndex) => (
                <ChatbotMessage
                  key={message.id}
                  message={message}
                  messageIndex={messageIndex}
                  totalMessages={messages.length}
                  status={status}
                />
              ))
            )}

            {status === CHATBOT_STATUS.SUBMITTED && (
              <div className={styles.loadingIndicator}>
                {configMessages.loading}
              </div>
            )}

            {error && (
              <div className={styles.errorContainer}>
                <p className={styles.errorText}>{configMessages.error}</p>
              </div>
            )}
          </ConversationContent>
        </Conversation>

        <PromptInput onSubmit={handleSubmit} className="mx-auto">
          <PromptInputBody>
            <PromptInputTextarea
              name="message"
              value={text}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={placeholder}
              disabled={status !== CHATBOT_STATUS.READY}
            />
          </PromptInputBody>

          <PromptInputFooter>
            <PromptInputSubmit status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
};

export default Chatbot;
