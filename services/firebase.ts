

import * as firebaseApp from "firebase/app";
import { getDatabase } from "firebase/database";
import { firebaseConfig } from "./firebaseConfig";

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);

// Get a reference to the database service
export const database = getDatabase(app);