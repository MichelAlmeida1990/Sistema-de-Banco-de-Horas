// src/js/firebase-config.js - Configuração Firebase v1.0.0

// ✅ CONFIGURAÇÃO FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyAsYDPDgw1GO_yOB6prCxvxDfwI3kEfhvE",
    authDomain: "banco-de-horas-596ca.firebaseapp.com",
    projectId: "banco-de-horas-596ca",
    storageBucket: "banco-de-horas-596ca.appspot.com",
    messagingSenderId: "75423178670",
    appId: "1:75423178670:web:b62ce90d78292f8485f23f",
    measurementId: "G-9RBTXPJ3PQ"
};

// ✅ INICIALIZAR FIREBASE
try {
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase inicializado com sucesso');
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
}

// ✅ CONFIGURAR SERVIÇOS
const auth = firebase.auth();
const db = firebase.firestore();

// ✅ CONFIGURAÇÕES DO FIRESTORE
db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED
});

// ✅ HABILITAR PERSISTÊNCIA OFFLINE
db.enablePersistence({ synchronizeTabs: true })
    .then(() => {
        console.log('💾 Persistência offline habilitada');
    })
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('⚠️ Persistência falhou: múltiplas abas abertas');
        } else if (err.code === 'unimplemented') {
            console.warn('⚠️ Navegador não suporta persistência');
        } else {
            console.error('❌ Erro na persistência:', err);
        }
    });

// ✅ EXPORTAR PARA USO GLOBAL
window.auth = auth;
window.db = db;

console.log('🔧 Firebase Config carregado - v1.0.0'); 