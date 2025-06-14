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
        this.exportador = new ExportadorDados();

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
            
            // Configurar event listeners dos botões
            this.configurarEventListeners();
            
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

    configurarEventListeners() {
        try {
            // Botão Limpar Dados
            const btnLimpar = document.getElementById('limparBtn');
            if (btnLimpar) {
                btnLimpar.addEventListener('click', () => this.resetarDados());
            }

            // Botão Exportar CSV
            const btnExportarCSV = document.getElementById('exportarCsvBtn');
            if (btnExportarCSV) {
                btnExportarCSV.addEventListener('click', () => this.exportarCSV());
            }

            // Botão Exportar PDF
            const btnExportarPDF = document.getElementById('exportarPdfBtn');
            if (btnExportarPDF) {
                btnExportarPDF.addEventListener('click', () => this.exportarPDF());
            }

            // Botão Salvar Dados (JSON)
            const btnSalvar = document.getElementById('salvarBtn');
            if (btnSalvar) {
                btnSalvar.addEventListener('click', () => this.exportarJSON());
            }

            console.log('🔗 Event listeners configurados');
        } catch (error) {
            console.error('❌ Erro ao configurar event listeners:', error);
        }
    }

    async exportarCSV() {
        try {
            if (this.registroPlantao.registros.length === 0) {
                this.mostrarNotificacao('Nenhum registro para exportar', 'warning');
                return;
            }

            this.mostrarNotificacao('📊 Exportando CSV...', 'info');
            await this.exportador.exportarCSV(this.registroPlantao.registros);
            this.mostrarNotificacao('✅ CSV exportado com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao exportar CSV:', error);
            this.mostrarNotificacao('Erro ao exportar CSV: ' + error.message, 'error');
        }
    }

    async exportarPDF() {
        try {
            if (this.registroPlantao.registros.length === 0) {
                this.mostrarNotificacao('Nenhum registro para exportar', 'warning');
                return;
            }

            this.mostrarNotificacao('📄 Exportando PDF...', 'info');
            await this.exportador.exportarPDF(this.registroPlantao.registros);
            this.mostrarNotificacao('✅ PDF exportado com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao exportar PDF:', error);
            this.mostrarNotificacao('Erro ao exportar PDF: ' + error.message, 'error');
        }
    }

    async exportarJSON() {
        try {
            if (this.registroPlantao.registros.length === 0) {
                this.mostrarNotificacao('Nenhum registro para exportar', 'warning');
                return;
            }

            this.mostrarNotificacao('💾 Salvando dados...', 'info');
            const configuracoes = {
                valorHora: this.configuracao.getValorHora()
            };
            await this.exportador.exportarJSON(this.registroPlantao.registros, configuracoes);
            this.mostrarNotificacao('✅ Dados salvos com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
            this.mostrarNotificacao('Erro ao salvar dados: ' + error.message, 'error');
        }
    }

    async atualizarTotais() {
        try {
            const registros = this.registroPlantao.registros;
            const valorHora = this.configuracao.getValorHora();
            
            if (registros.length === 0) {
                this.zerarTotais();
                return;
            }

            const totais = this.calculadora.calcularTotais(registros, valorHora);
            
            // Atualizar cards de estatísticas
            this.atualizarCard('saldoTotalCard', this.formatarHoras(totais.totalBancoHoras));
            this.atualizarCard('bonusTotalCard', this.formatarHoras(totais.totalHorasBonus));
            this.atualizarCard('totalPlantoes', totais.totalRegistros);
            this.atualizarCard('valorTotalCard', this.formatarMoeda(totais.totalValorGeral));

            // Atualizar resumo total
            this.atualizarCard('saldoTotal', this.formatarHoras(totais.totalBancoHoras));
            this.atualizarCard('extrasTotal', this.formatarHoras(totais.totalHorasExtras));
            this.atualizarCard('bancoTotal', this.formatarHoras(totais.totalBancoHoras));
            this.atualizarCard('bonusTotal', this.formatarHoras(totais.totalHorasBonus));
            this.atualizarCard('valorTotalResumo', this.formatarMoeda(totais.totalValorGeral));
            
            console.log('📊 Totais atualizados:', totais);
        } catch (error) {
            console.error('❌ Erro ao atualizar totais:', error);
        }
    }

    zerarTotais() {
        const elementos = [
            'saldoTotalCard', 'bonusTotalCard', 'totalPlantoes', 'valorTotalCard',
            'saldoTotal', 'extrasTotal', 'bancoTotal', 'bonusTotal', 'valorTotalResumo'
        ];
        
        elementos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                if (id.includes('valor') || id.includes('Total')) {
                    elemento.textContent = 'R$ 0,00';
                } else if (id === 'totalPlantoes') {
                    elemento.textContent = '0';
                } else {
                    elemento.textContent = '0h';
                }
            }
        });
    }

    atualizarCard(id, valor) {
        const elemento = document.getElementById(id);
        if (elemento) {
            elemento.textContent = valor;
        }
    }

    formatarHoras(horas) {
        if (!horas || horas === 0) return '0h';
        return `${Math.abs(horas).toFixed(1)}h${horas < 0 ? ' (débito)' : ''}`;
    }

    formatarMoeda(valor) {
        if (!valor || valor === 0) return 'R$ 0,00';
        return `R$ ${valor.toFixed(2).replace('.', ',')}`;
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
                this.mostrarNotificacao('🧹 Limpando todos os dados...', 'info');
                
                // 1. Limpar Firebase (se conectado)
                try {
                    await this.storage.limparRegistros();
                    console.log('✅ Dados do Firebase limpos');
                } catch (error) {
                    console.warn('⚠️ Erro ao limpar Firebase (pode estar offline):', error.message);
                }
                
                // 2. Limpar localStorage (modo offline)
                try {
                    localStorage.removeItem('banco-horas-registros');
                    localStorage.removeItem('banco-horas-registros-offline');
                    localStorage.removeItem('registrosBancoHoras'); // Chave antiga
                    localStorage.removeItem('backup_registros_antigos');
                    console.log('✅ localStorage limpo');
                } catch (error) {
                    console.warn('⚠️ Erro ao limpar localStorage:', error.message);
                }
                
                // 3. Limpar sessionStorage
                try {
                    sessionStorage.clear();
                    console.log('✅ sessionStorage limpo');
                } catch (error) {
                    console.warn('⚠️ Erro ao limpar sessionStorage:', error.message);
                }
                
                // 4. Resetar configurações
                this.configuracao.resetarConfiguracao();
                
                // 5. Limpar array local
                this.registroPlantao.registros = [];
                
                // 6. Recarregar dados (deve estar vazio agora)
                await this.registroPlantao.carregarRegistros();
                await this.atualizarTotais();
                
                this.mostrarNotificacao('✅ Todos os dados foram resetados com sucesso!', 'success');
                console.log('🧹 Reset completo realizado');
                
            } catch (error) {
                console.error('❌ Erro ao resetar dados:', error);
                this.mostrarNotificacao('Erro ao resetar dados: ' + error.message, 'error');
            }
        }
    }
}

// Exportar a classe
window.BancoHorasApp = BancoHorasApp;
