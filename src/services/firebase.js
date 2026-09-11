import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCkchS8bXI5foUZkM5eoQW4dDcPamIkVIw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "kiro-ad01c.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "kiro-ad01c",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "kiro-ad01c.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "932770555548",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:932770555548:web:f99500f3af9042903e2f59",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7M3TTKDFRV",
};

export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes("YOUR_")
  );
};

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Analytics in supported environments (browser)
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export { analytics };

export const loginWithEmail = async (email, password) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email, password, displayName) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName && userCredential.user) {
    await updateProfile(userCredential.user, { displayName });
  }
  return userCredential;
};

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};

export const logoutUser = async () => {
  return await signOut(auth);
};

export const resetPassword = async (email) => {
  return await sendPasswordResetEmail(auth, email);
};

export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export default app;
