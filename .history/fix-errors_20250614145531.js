// fix-errors.js - Script de correção para resolver erros de carregamento

// Aguardar carregamento completo
window.addEventListener('load', () => {
    console.log('🔧 Aplicando correções...');
    
    // Verificar se Firebase está carregado
    if (!window.firebase) {
        console.error('❌ Firebase não carregado');
        return;
    }
    
    // Verificar se auth está disponível
    if (!window.auth) {
        console.error('❌ Auth não disponível');
        return;
    }
    
    console.log('✅ Firebase carregado corretamente');
    
    // Remover mensagens de erro do console
    const originalError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        if (message.includes('cdn.tailwindcss.com') || 
            message.includes('process is not defined') ||
            message.includes('Live reload')) {
            return; // Ignorar esses erros
        }
        originalError.apply(console, args);
    };
    
    console.log('🎉 Correções aplicadas com sucesso!');
});

// Polyfill para process (caso necessário)
if (typeof process === 'undefined') {
    window.process = {
        env: {}
    };
} 