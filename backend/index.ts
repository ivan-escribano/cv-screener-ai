import cors from 'cors';
import express from 'express';

import { EnvironmentConfig } from './config/env-variables/env.config.js';
import chatRouter from './modules/chat/chat.routes.js';
import ingestRouter from './modules/ingest/ingest.routes.js';

const app = express();

// Middleware
app.use(cors({ origin: EnvironmentConfig.SERVER.FRONTEND_URL }));
app.use(express.json());

// Routes
app.use('/api/ingest', ingestRouter);
app.use('/api/chat', chatRouter);

// Start server
app.listen(EnvironmentConfig.SERVER.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${EnvironmentConfig.SERVER.PORT}`);
});
