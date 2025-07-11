/**
 * Firebase initialization is commented out because it was causing build errors
 * and was not being used within the application. To re-enable, uncomment the code
 * below and ensure your environment is correctly configured.
 */
export const database = {};

/*

import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// This expects Firebase config keys to be available on process.env in the execution environment.
const firebaseConfig = {
  // @ts-ignore
  apiKey: process.env.FIREBASE_API_KEY,
  // @ts-ignore
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  // @ts-ignore
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  // @ts-ignore
  projectId: process.env.FIREBASE_PROJECT_ID,
  // @ts-ignore
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  // @ts-ignore
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  // @ts-ignore
  appId: process.env.FIREBASE_APP_ID,
  // @ts-ignore
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
export const database = getDatabase(app);
*/