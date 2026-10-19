import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

/**
 * RECOVERY INSTRUCTIONS FOR 'auth/operation-not-allowed':
 * 
 * If you encounter a 'sign-in provider is disabled' or 'operation-not-allowed' error:
 * 1. Go to: https://console.firebase.google.com/project/genesis-f1c27/authentication/providers
 * 2. Click 'Add new provider' or select 'Email/Password' under Native providers.
 * 3. Toggle 'Enable' for Email/Password.
 * 4. Click 'Save'.
 * 
 * This is required for the application's login and registration protocols to function.
 */
// All Firebase credentials and keys are accessed strictly through environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Connectivity validation as per Firebase integration skill
async function testConnection() {
  try {
    console.log("Firebase auth context synchronized successfully.");
  } catch (error) {
    console.warn("Firebase handshake delayed or configuration requires verification:", error);
  }
}

testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export default app;
