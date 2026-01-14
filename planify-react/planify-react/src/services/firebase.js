// src/services/firebase.js
import { initializeApp } from "firebase/app";
// 👇 AQUI ESTAVA O ERRO: Adicionei o 'signInWithPopup' na lista
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC_3_0I53wPsUx99OjIx1UvkIwOWBrW5pA",
  authDomain: "planify-aluizi0.firebaseapp.com",
  projectId: "planify-aluizi0",
  storageBucket: "planify-aluizi0.firebasestorage.app",
  messagingSenderId: "1011202181166",
  appId: "1:1011202181166:web:33ad0bc03bc293821e77bf",
  measurementId: "G-XSYCSGREDZ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Erro ao logar com Google:", error);
    throw error;
  }
};