import { GoogleGenerativeAI } from '@google/generative-ai';

import { EnvironmentConfig } from '../env-variables/env.config.js';

export const GoogleGenAI = new GoogleGenerativeAI(EnvironmentConfig.GOOGLE_GEN_AI.API_KEY);
