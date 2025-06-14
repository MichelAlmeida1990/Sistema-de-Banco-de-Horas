// src/js/firebase-config.js - Configuração Firebase v2.0.0

// ✅ CONFIGURAÇÃO FIREBASE - DADOS SENSÍVEIS REMOVIDOS
// Para usar em produção, configure as variáveis de ambiente
const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "YOUR_API_KEY_HERE",
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
    projectId: process.env.FIREBASE_PROJECT_ID || "your-project-id",
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789012",
    appId: process.env.FIREBASE_APP_ID || "1:123456789012:web:abcdef123456789012345678",
    measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// ✅ CONFIGURAÇÃO DE DESENVOLVIMENTO (remover em produção)
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

if (isDevelopment) {
    // Configuração para desenvolvimento local
    firebaseConfig.apiKey = "AIzaSyAsYDPDgw1GO_yOB6prCxvxDfwI3kEfhvE";
    firebaseConfig.authDomain = "banco-de-horas-596ca.firebaseapp.com";
    firebaseConfig.projectId = "banco-de-horas-596ca";
    firebaseConfig.storageBucket = "banco-de-horas-596ca.appspot.com";
    firebaseConfig.messagingSenderId = "75423178670";
    firebaseConfig.appId = "1:75423178670:web:b62ce90d78292f8485f23f";
    firebaseConfig.measurementId = "G-9RBTXPJ3PQ";
}

// ✅ INICIALIZAR FIREBASE
try {
    firebase.initializeApp(firebaseConfig);
    console.log('🔥 Firebase inicializado com sucesso');
    
    if (isDevelopment) {
        console.log('🔧 Modo desenvolvimento ativo');
    }
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    alert('Erro ao conectar com o Firebase. Verifique a configuração.');
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

console.log('🔧 Firebase Config carregado - v2.0.0'); 