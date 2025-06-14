// src/js/firebase-config-v3.js - Configuração Firebase v3.0.0 - CACHE CLEARED

// ✅ CONFIGURAÇÃO FIREBASE - VERSÃO ATUALIZADA
const firebaseConfig = {
    apiKey: "AIzaSyAsYDPDgw1GO_yOB6prCxvxDfwI3kEfhvE",
    authDomain: "banco-de-horas-596ca.firebaseapp.com",
    projectId: "banco-de-horas-596ca",
    storageBucket: "banco-de-horas-596ca.firebasestorage.app",
    messagingSenderId: "75423178670",
    appId: "1:75423178670:web:b62ce90d78292f8485f23f",
    measurementId: "G-9RBTXPJ3PQ"
};

// ✅ VERIFICAR SE FIREBASE SDK ESTÁ CARREGADO
if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK não carregado!');
    throw new Error('Firebase SDK não encontrado');
}

// ✅ INICIALIZAR FIREBASE COM TRATAMENTO DE ERRO
let firebaseInitialized = false;
let authAvailable = false;
let auth = null;
let db = null;

console.log('🔧 Iniciando Firebase v3.0.0...');
console.log('🔑 API Key:', firebaseConfig.apiKey.substring(0, 10) + '...');

try {
    // Verificar se já foi inicializado
    if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
        console.log('🔥 Firebase inicializado com sucesso');
    } else {
        console.log('🔥 Firebase já estava inicializado');
    }
    
    firebaseInitialized = true;
    
    // Configurar serviços
    auth = firebase.auth();
    db = firebase.firestore();
    authAvailable = true;
    
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
        
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    firebaseInitialized = false;
    authAvailable = false;
}

// ✅ FUNÇÃO PARA VERIFICAR SE FIREBASE ESTÁ DISPONÍVEL
function isFirebaseAvailable() {
    return firebaseInitialized && authAvailable && auth && db;
}

// ✅ FUNÇÃO PARA VERIFICAR DOMÍNIO AUTORIZADO
function isDomainAuthorized() {
    const currentDomain = window.location.hostname;
    const currentPort = window.location.port;
    const currentDomainWithPort = currentPort ? `${currentDomain}:${currentPort}` : currentDomain;
    
    const authorizedDomains = [
        'localhost',
        '127.0.0.1',
        'localhost:8000',
        '127.0.0.1:8000',
        'localhost:3000',
        '127.0.0.1:3000',
        'banco-de-horas-596ca.firebaseapp.com',
        'banco-de-horas-596ca.web.app'
    ];
    
    return authorizedDomains.some(domain => 
        currentDomain === domain || 
        currentDomainWithPort === domain ||
        currentDomain.includes(domain.split(':')[0])
    );
}

// ✅ EXPORTAR PARA USO GLOBAL
window.auth = auth;
window.db = db;
window.isFirebaseAvailable = isFirebaseAvailable;
window.isDomainAuthorized = isDomainAuthorized;
window.firebaseInitialized = firebaseInitialized;

console.log('✅ Firebase Config v3.0.0 carregado');
console.log('🔥 Firebase disponível:', isFirebaseAvailable());
console.log('🌐 Domínio autorizado:', isDomainAuthorized());
console.log('🕐 Timestamp:', new Date().toISOString()); 