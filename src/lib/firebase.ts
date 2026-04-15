import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBtidUxVxZeTpBJg90aWL8VEC5XQndJZCM",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hades-f3f3e.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://hades-f3f3e-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hades-f3f3e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hades-f3f3e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "697437888110",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:697437888110:web:afa06960754c4ee088d07f"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export { app };
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};
