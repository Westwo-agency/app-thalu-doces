import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDMlwOjBTpb_BEwmupjzarIvfyj5wbdsX4",
  authDomain: "thalu-doces-gestao.firebaseapp.com",
  projectId: "thalu-doces-gestao",
  storageBucket: "thalu-doces-gestao.firebasestorage.app",
  messagingSenderId: "77638526181",
  appId: "1:77638526181:web:3fba5a656221a51867e00c"
};


// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta a instância do banco de dados para ser usada em outros lugares
export const db = getFirestore(app);
