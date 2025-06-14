// src/js/firebase-config.js - Configuração Firebase v2.1.0

// ✅ CONFIGURAÇÃO FIREBASE - DADOS SENSÍVEIS REMOVIDOS
// Para usar em produção, configure as variáveis de ambiente
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456789012345678",
    measurementId: "G-XXXXXXXXXX"
};

// ✅ DETECTAR AMBIENTE DE DESENVOLVIMENTO
const isDevelopment = window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('localhost') ||
                     window.location.port !== '';

// ✅ CONFIGURAÇÃO PARA DESENVOLVIMENTO LOCAL
if (isDevelopment) {
    console.log('🔧 Modo desenvolvimento detectado:', window.location.hostname);
    
    // Configuração para desenvolvimento local
    firebaseConfig.apiKey = "AIzaSyAsYDPDgw1GO_yOB6prCxvxDfwI3kEfhvE";
    firebaseConfig.authDomain = "banco-de-horas-596ca.firebaseapp.com";
    firebaseConfig.projectId = "banco-de-horas-596ca";
    firebaseConfig.storageBucket = "banco-de-horas-596ca.appspot.com";
    firebaseConfig.messagingSenderId = "75423178670";
    firebaseConfig.appId = "1:75423178670:web:b62ce90d78292f8485f23f";
    firebaseConfig.measurementId = "G-9RBTXPJ3PQ";
}

// ✅ INICIALIZAR FIREBASE COM TRATAMENTO DE ERRO
let firebaseInitialized = false;
let authAvailable = false;

try {
    firebase.initializeApp(firebaseConfig);
    firebaseInitialized = true;
    console.log('🔥 Firebase inicializado com sucesso');
    
    if (isDevelopment) {
        console.log('🔧 Modo desenvolvimento ativo');
        console.log('🌐 Domínio atual:', window.location.hostname + ':' + window.location.port);
    }
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
    firebaseInitialized = false;
}

// ✅ CONFIGURAR SERVIÇOS APENAS SE FIREBASE INICIALIZADO
let auth = null;
let db = null;

if (firebaseInitialized) {
    try {
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
        console.error('❌ Erro ao configurar serviços Firebase:', error);
        authAvailable = false;
    }
}

// ✅ FUNÇÃO PARA VERIFICAR SE FIREBASE ESTÁ DISPONÍVEL
function isFirebaseAvailable() {
    return firebaseInitialized && authAvailable && auth && db;
}

// ✅ FUNÇÃO PARA VERIFICAR DOMÍNIO AUTORIZADO
function isDomainAuthorized() {
    const currentDomain = window.location.hostname;
    const authorizedDomains = [
        'localhost',
        '127.0.0.1',
        'banco-de-horas-596ca.firebaseapp.com',
        'banco-de-horas-596ca.web.app'
    ];
    
    return authorizedDomains.some(domain => 
        currentDomain === domain || currentDomain.includes(domain)
    );
}

// ✅ EXPORTAR PARA USO GLOBAL
window.auth = auth;
window.db = db;
window.isFirebaseAvailable = isFirebaseAvailable;
window.isDomainAuthorized = isDomainAuthorized;
window.firebaseInitialized = firebaseInitialized;

console.log('🔧 Firebase Config carregado - v2.1.0');
console.log('🔥 Firebase disponível:', isFirebaseAvailable());
console.log('🌐 Domínio autorizado:', isDomainAuthorized()); 