"use client";

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
import { Suggestion, Suggestions } from "@/components/ai-elements/suggestion";
import { CHATBOT_CONFIG } from "./Chatbot.config";
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

  const { suggestions, placeholder, messages: configMessages } = CHATBOT_CONFIG;

  return (
    <div className={styles.container}>
      <div className={styles.chatWrapper}>
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <div className={styles.emptyStateContainer}>
                <Suggestions className="flex-wrap justify-center gap-2">
                  {suggestions.map((suggestion) => (
                    <Suggestion
                      key={suggestion}
                      suggestion={suggestion}
                      onClick={handleSuggestionClick}
                    />
                  ))}
                </Suggestions>
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

            {status === "submitted" && (
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
              disabled={status !== "ready"}
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
