import dotenv from 'dotenv';

dotenv.config();

export const EnvironmentConfig = {
  SUPABASE: {
    URL: process.env.SUPABASE_URL || '',
    ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  },
  OPENAI: {
    API_KEY: process.env.OPENAI_API_KEY || '',
  },
  SERVER: {
    PORT: process.env.PORT || '3001',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  PATHS: {
    CVS: process.env.CVS_PATH || './data/cvs',
  },
  GOOGLE_GEN_AI: {
    API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY || '',
  },
};
