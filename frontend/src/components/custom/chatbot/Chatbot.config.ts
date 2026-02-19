// Actualizado
export const CHATBOT_STATUS = {
  READY: "ready",
  SUBMITTED: "submitted",
} as const;

export const CHATBOT_CONFIG = {
  api: "http://localhost:3001/api/chat",
  title: "CV Screener AI",
  placeholder: "Ask something about the CVs...",
  suggestions: [
    "Who has experience with React and TypeScript?",
    "Find candidates with more than 5 years of experience",
    "Which candidate is the best fit for a backend role?",
    "Compare the top 3 candidates by technical skills",
  ],
  messages: {
    loading: "Thinking...",
    error: "Something went wrong. Please refresh the page.",
    candidate: "candidate",
    candidates: "candidates",
    available: "available",
  },
};
