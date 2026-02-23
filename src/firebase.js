/**
 * firebase.js
 *
 * Firebase app initialisation.  All Firebase config is read from Vite env
 * variables (VITE_FIREBASE_*) so the API key is never hard-coded.
 *
 * If the env vars are absent (e.g. a fresh clone with no .env file) the module
 * exports `firebaseConfigured = false` and null values for `auth` / `provider`.
 * Components check this flag and show a graceful "not configured" state.
 *
 * HOW TO CONFIGURE
 * ────────────────
 * 1. Go to https://console.firebase.google.com → create / open a project
 * 2. Project settings → "Your apps" → Add web app → copy the config
 * 3. Authentication → Sign-in method → enable Google
 * 4. Authentication → Settings → Authorized domains → add "localhost"
 * 5. Create irb-wizard/.env and add:
 *
 *    VITE_FIREBASE_API_KEY=AIza…
 *    VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 *    VITE_FIREBASE_PROJECT_ID=your-project-id
 *    VITE_FIREBASE_APP_ID=1:…:web:…
 */

import { initializeApp }                   from 'firebase/app';
import { getAuth, GoogleAuthProvider }     from 'firebase/auth';

const firebaseConfig = {
  apiKey:    import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:  import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId:      import.meta.env.VITE_FIREBASE_APP_ID,
};

/** True when all required env vars are present. */
export const firebaseConfigured = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

export const app      = firebaseConfigured ? initializeApp(firebaseConfig) : null;
export const auth     = firebaseConfigured ? getAuth(app)                  : null;
export const provider = new GoogleAuthProvider();
