// client/src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Import the functions you need from the SDKs you need

const firebaseConfig = {
  apiKey: "AIzaSyDOv3k5PMRUrjWrXVcIQoOr-HGr7rkav_c",
  authDomain: "yogyatha-7acfa.firebaseapp.com",
  projectId: "yogyatha-7acfa",
  storageBucket: "yogyatha-7acfa.firebasestorage.app",
  messagingSenderId: "949630262660",
  appId: "1:949630262660:web:54a347504e818bdfb0d1d1",
  measurementId: "G-1N71EXSVN0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);