// src/js/app.js - Aplicação Principal com Banco de Horas v6.0.0

class BancoHorasApp {
    constructor(uid) {
        if (!uid) {
            throw new Error('UID é obrigatório para inicializar a aplicação');
        }

        // Inicializar componentes
        this.uid = uid;
        this.storage = new Storage(uid);
        this.calculadora = new Calculadora();
        this.configuracao = new ConfiguracaoFinanceira();
        this.registroPlantao = new RegistroPlantao(this.configuracao, this.storage);

        // Inicializar aplicação
        this.init();
        console.log('✅ Aplicação inicializada com sucesso!');
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.inicializarApp());
        } else {
            this.inicializarApp();
        }
    }

    async inicializarApp() {
        try {
            console.log('🔧 Iniciando inicialização da aplicação...');
            
            // Verificar autenticação
            if (!this.uid) {
                throw new Error('Usuário não autenticado');
            }

            // Carregar dados
            await this.registroPlantao.carregarRegistros();
            
            // Atualizar totais
            await this.atualizarTotais();
            
            console.log('✅ Aplicação inicializada com sucesso');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.mostrarNotificacao(
                'Erro ao inicializar a aplicação. Por favor, recarregue a página.',
                'error'
            );
        }
    }

    async atualizarTotais() {
        try {
            // Implementar lógica de atualização de totais se necessário
            console.log('📊 Totais atualizados');
        } catch (error) {
            console.error('❌ Erro ao atualizar totais:', error);
        }
    }

    mostrarNotificacao(mensagem, tipo = 'info') {
        const notificacao = document.createElement('div');
        notificacao.className = `fixed top-4 right-4 ${this.obterCorNotificacao(tipo)} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
        
        notificacao.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="${this.obterIconeNotificacao(tipo)}"></i>
                <span class="text-sm">${mensagem}</span>
            </div>
        `;
        
        document.body.appendChild(notificacao);
        
        setTimeout(() => notificacao.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
            notificacao.classList.add('translate-x-full');
            setTimeout(() => notificacao.remove(), 300);
        }, 4000);
    }

    obterCorNotificacao(tipo) {
        const cores = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };
        return cores[tipo] || cores.info;
    }

    obterIconeNotificacao(tipo) {
        const icones = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        return icones[tipo] || icones.info;
    }

    async resetarDados() {
        if (confirm('❓ Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.')) {
            try {
                await this.storage.limparRegistros();
                this.configuracao.resetarConfiguracao();
                await this.registroPlantao.carregarRegistros();
                this.mostrarNotificacao('✅ Dados resetados com sucesso!', 'success');
            } catch (error) {
                console.error('❌ Erro ao resetar dados:', error);
                this.mostrarNotificacao('Erro ao resetar dados: ' + error.message, 'error');
            }
        }
    }
}

// Exportar a classe
window.BancoHorasApp = BancoHorasApp;
