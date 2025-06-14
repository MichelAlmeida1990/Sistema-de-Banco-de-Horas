// src/js/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAsYDPDgw1GO_yOB6prCxvxDfwI3kEfhvE",
  authDomain: "banco-de-horas-596ca.firebaseapp.com",
  projectId: "banco-de-horas-596ca",
  storageBucket: "banco-de-horas-596ca.appspot.com",
  messagingSenderId: "75423178670",
  appId: "1:75423178670:web:b62ce90d78292f8485f23f",
  measurementId: "G-9RBTXPJ3PQ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
