// src/firebase/firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase ayarların
const firebaseConfig = {
  apiKey: "AIzaSyBSyJAXjXdem2X3Et8nxIENRNH5qMgE6uI",
  authDomain: "cavidismayilov-17126.firebaseapp.com",
  projectId: "cavidismayilov-17126",
  storageBucket: "cavidismayilov-17126.firebasestorage.app",
  messagingSenderId: "910134301119",
  appId: "1:910134301119:web:6294b13a78accfc0dc910a",
};

// Uygulamayı başlat
const app = initializeApp(firebaseConfig);

// Firestore'u dışa aktar
export const db = getFirestore(app);