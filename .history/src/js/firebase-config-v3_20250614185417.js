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

// ✅ FUNÇÃO PARA VERIFICAR DOMÍNIO AUTORIZADO - UNIVERSAL
function isDomainAuthorized() {
    const currentDomain = window.location.hostname;
    const currentPort = window.location.port;
    const currentProtocol = window.location.protocol;
    const fullUrl = window.location.href;
    
    console.log('🔍 Verificando domínio:', {
        hostname: currentDomain,
        port: currentPort,
        protocol: currentProtocol,
        fullUrl: fullUrl
    });
    
    // ✅ SEMPRE AUTORIZAR DESENVOLVIMENTO LOCAL
    const isLocalDevelopment = 
        currentDomain === 'localhost' ||
        currentDomain === '127.0.0.1' ||
        currentDomain === '0.0.0.0' ||
        currentDomain.startsWith('192.168.') ||
        currentDomain.startsWith('10.') ||
        currentDomain.startsWith('172.') ||
        currentProtocol === 'file:' ||
        currentPort !== '' ||  // Qualquer porta indica desenvolvimento
        fullUrl.includes('localhost') ||
        fullUrl.includes('127.0.0.1');
    
    if (isLocalDevelopment) {
        console.log('✅ DESENVOLVIMENTO LOCAL - Domínio autorizado automaticamente:', currentDomain + ':' + currentPort);
        return true;
    }
    
    // ✅ DOMÍNIOS OFICIAIS DO FIREBASE
    const firebaseDomains = [
        'banco-de-horas-596ca.firebaseapp.com',
        'banco-de-horas-596ca.web.app'
    ];
    
    const isFirebaseDomain = firebaseDomains.some(domain => 
        currentDomain === domain || currentDomain.endsWith('.' + domain)
    );
    
    if (isFirebaseDomain) {
        console.log('✅ Domínio oficial Firebase:', currentDomain);
        return true;
    }
    
    // ✅ OUTROS SERVIÇOS DE HOSPEDAGEM
    const hostingServices = [
        'netlify.app',
        'vercel.app', 
        'github.io',
        'surge.sh',
        'herokuapp.com',
        'ngrok.io',
        'ngrok.app'
    ];
    
    const isHostingService = hostingServices.some(service => 
        currentDomain.includes(service)
    );
    
    if (isHostingService) {
        console.log('✅ Serviço de hospedagem reconhecido:', currentDomain);
        return true;
    }
    
    // ✅ VERIFICAR IPs DE REDE LOCAL (MÓVEIS/TABLETS)
    const isLocalIP = 
        /^192\.168\.\d{1,3}\.\d{1,3}$/.test(currentDomain) ||
        /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(currentDomain) ||
        /^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(currentDomain);
    
    if (isLocalIP) {
        console.log('✅ IP de rede local (móvel/tablet):', currentDomain);
        return true;
    }
    
    // ✅ MODO PERMISSIVO: ACEITAR QUALQUER DOMÍNIO HTTPS
    if (currentProtocol === 'https:') {
        console.log('✅ Domínio HTTPS aceito:', currentDomain);
        return true;
    }
    
    // ✅ ÚLTIMO RECURSO: ACEITAR TUDO EM DESENVOLVIMENTO
    console.log('⚠️ Domínio não reconhecido, mas permitindo acesso:', currentDomain + ':' + currentPort);
    return true; // SEMPRE PERMITIR - modo ultra permissivo
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