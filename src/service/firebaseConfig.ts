import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBxZBVwm2vQoIeeC2hPbdJ0EI_MLqVa9W4",
  authDomain: "base-sabiamente.firebaseapp.com",
  projectId: "base-sabiamente",
  storageBucket: "base-sabiamente.firebasestorage.app",
  messagingSenderId: "705088946010",
  appId: "1:705088946010:web:1d500ba3c225f3181d7d63"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);



