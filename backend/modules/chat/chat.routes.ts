import { Router } from 'express';

import { ChatController } from './chat.controller.js';

const router = Router();

router.post('/', ChatController.handleChat);

export default router;
