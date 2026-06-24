import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "gen-lang-client-0259963606",
  appId: "1:130317087973:web:d331b1cabc98b8b9ca900c",
  apiKey: "AIzaSyBhYDBPeF2Nma6Pv7PacqGaQ0dTKvms21c",
  authDomain: "gen-lang-client-0259963606.firebaseapp.com",
  storageBucket: "gen-lang-client-0259963606.firebasestorage.app",
  messagingSenderId: "130317087973"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {}, "ai-studio-653a63af-1467-40c0-9fc1-0a02db932757");
