/**
 * supabase.js
 *
 * Initialises the Supabase client.
 * Requires two Vite env vars in irb-wizard/.env:
 *
 *   VITE_SUPABASE_URL=https://your-project.supabase.co
 *   VITE_SUPABASE_ANON_KEY=eyJ...
 *
 * How to get these:
 *   1. Supabase dashboard → your project → Settings → API
 *   2. Copy "Project URL" and "anon public" key
 *   3. Authentication → Providers → Google → enable, add Client ID + Secret
 *      (get credentials from Google Cloud Console → OAuth 2.0)
 *   4. Authentication → URL Configuration → add http://localhost:5173 to
 *      "Redirect URLs" (and your production domain when deploying)
 *
 * The app detects missing config and shows a graceful warning instead of crashing.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
