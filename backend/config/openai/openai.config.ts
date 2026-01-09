import OpenAI from 'openai';

import { EnvironmentConfig } from '../env-variables/env.config.js';

export const OpenAIConfig = new OpenAI({
  apiKey: EnvironmentConfig.OPENAI.API_KEY,
});
