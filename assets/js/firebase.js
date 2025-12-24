// assets/js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// TODO: substitua pelas suas credenciais do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDTkNeOJE00krUMS-QLuNmKWbyDC533PJU",

  authDomain: "diario-espiritual-112d7.firebaseapp.com",

  projectId: "diario-espiritual-112d7",

  storageBucket: "diario-espiritual-112d7.firebasestorage.app",

  messagingSenderId: "130307045196",

  appId: "1:130307045196:web:65441acb42281f857641e9",

  measurementId: "G-XX2XSJMYB0"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
