import { pipeUIMessageStreamToResponse, UIMessage } from 'ai';
import { Request, Response } from 'express';

import { ERROR_MESSAGES } from './chat.config.js';
import { ChatService } from './chat.service.js';

const handleChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { messages }: { messages: UIMessage[] } = req.body;

    if (!messages?.length) throw new Error(ERROR_MESSAGES.NO_MESSAGES);

    const userQuery = ChatService.extractUserQuery(messages);

    if (!userQuery) throw new Error(ERROR_MESSAGES.NO_USER_MESSAGE);

    const retrievalContext = await ChatService.buildRetrievalContext(userQuery);

    const stream = await ChatService.createChatStream(messages, retrievalContext);

    pipeUIMessageStreamToResponse({ stream, response: res });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    res.status(500).json({
      error: errorMessage,
    });
  }
};

export const ChatController = {
  handleChat,
};
