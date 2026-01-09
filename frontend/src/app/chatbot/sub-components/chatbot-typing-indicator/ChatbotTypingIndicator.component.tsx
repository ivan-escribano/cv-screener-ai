"use client";

import styles from "./ChatbotTypingIndicator.module.css";

const ChatbotTypingIndicator = () => {
  return (
    <div className={styles.typingIndicator}>
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
      <span className={styles.typingDot} />
    </div>
  );
};

export default ChatbotTypingIndicator;
