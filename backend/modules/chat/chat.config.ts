export const ERROR_MESSAGES = {
  NO_MESSAGES: 'No messages provided. At least one message is required to process the chat.',
  NO_USER_MESSAGE: 'No user message found in the conversation. Please provide a user message.',
  CHAT_ERROR: 'An error occurred while processing your chat request. Please try again later.',
  ERROR_QUERYING_VECTORS: 'Error querying vector database for similar chunks.',
  ERROR_GETTING_CHUNKS: 'Error getting document chunks from the database.',
};

export const VECTOR_CONFIG = {
  SUPABASE_RPC: 'match_cv_chunks',
  DEFAULT_LIMIT: 3,
  MIN_SIMILARITY: 0.3,
};

export const CHAT_PATHS = {
  PROMPTS_DIRECTORY: 'prompts',
  SYSTEM_PROMPT: 'system.prompt.md',
};
