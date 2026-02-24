/**
 * supabase.js
 *
 * Initialises the Supabase client.
 * Requires two Next.js env vars in irb-wizard/.env.local:
 *
 *   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 *
 * How to get these:
 *   1. Supabase dashboard → your project → Settings → API
 *   2. Copy "Project URL" and "anon public" key
 *   3. Authentication → Providers → Google → enable, add Client ID + Secret
 *      (get credentials from Google Cloud Console → OAuth 2.0)
 *   4. Authentication → URL Configuration → add both to "Redirect URLs":
 *        http://localhost:3000
 *        https://irbwiz.help
 *
 * The app detects missing config and shows a graceful warning instead of crashing.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
