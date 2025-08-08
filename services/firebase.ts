import firebase from "firebase/compat/app";
import "firebase/compat/database";
import { firebaseConfig } from "./firebaseConfig";

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}


// Get a reference to the database service
export const database = firebase.database();