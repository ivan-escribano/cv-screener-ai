import { createClient } from '@supabase/supabase-js';

import { EnvironmentConfig } from '../env-variables/env.config.js';

export const Supabase = createClient(
  EnvironmentConfig.SUPABASE.URL,
  EnvironmentConfig.SUPABASE.ANON_KEY
);
