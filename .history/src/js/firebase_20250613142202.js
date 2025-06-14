// src/js/firebase.js - Using Firebase Compat SDK
const firebaseConfig = {
  apiKey: "AIzaSyAsYDPDgw1GO_yOB6prCxvxDfwI3kEfhvE",
  authDomain: "banco-de-horas-596ca.firebaseapp.com",
  projectId: "banco-de-horas-596ca",
  storageBucket: "banco-de-horas-596ca.appspot.com",
  messagingSenderId: "75423178670",
  appId: "1:75423178670:web:b62ce90d78292f8485f23f",
  measurementId: "G-9RBTXPJ3PQ"
};

// Initialize Firebase with compat version
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence({synchronizeTabs: true})
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn('⚠️ Persistência falhou: múltiplas abas abertas');
    } else if (err.code == 'unimplemented') {
      console.warn('⚠️ Navegador não suporta persistência');
    }
  });

// Configure Firestore settings
db.settings({
  cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

export { app, auth, db };
