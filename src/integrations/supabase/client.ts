// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xgyvfzuvyetfoxorgtia.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneXZmenV2eWV0Zm94b3JndGlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyODYzNDksImV4cCI6MjA2Mjg2MjM0OX0.bHYlYs-CrkxBUw0cBo5jh2SwjOhf0f5g8H2sA8fSUN0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);