// src/js/configuracao.js - Configuração Financeira com Atualização em Tempo Real

class ConfiguracaoFinanceira {
    constructor() {
        this.BONUS_FIM_SEMANA = 0.90; // 90% adicional
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.carregarConfiguracao();
        this.atualizarValorBonus(); // Atualizar na inicialização
        
        console.log('⚙️ Configuração financeira iniciada');
    }

    setupEventListeners() {
        // ✅ EVENTO PARA ATUALIZAR EM TEMPO REAL
        const campoValorHora = document.getElementById('valorHora');
        const botaoSalvar = document.getElementById('salvarConfiguracao');

        if (campoValorHora) {
            // Atualizar enquanto digita
            campoValorHora.addEventListener('input', () => {
                this.atualizarValorBonus();
            });

            // Atualizar quando sair do campo
            campoValorHora.addEventListener('blur', () => {
                this.validarValorHora();
                this.atualizarValorBonus();
            });

            // Atualizar quando pressionar tecla
            campoValorHora.addEventListener('keyup', () => {
                this.atualizarValorBonus();
            });
        }

        if (botaoSalvar) {
            botaoSalvar.addEventListener('click', () => {
                if (this.validarValorHora()) {
                    this.salvarConfiguracao();
                }
            });
        }
    }

    // ✅ NOVO - Validar valor da hora
    validarValorHora() {
        const campoValorHora = document.getElementById('valorHora');
        if (!campoValorHora) return false;

        const valorDigitado = campoValorHora.value.replace(',', '.');
        const valorHora = parseFloat(valorDigitado);

        if (!valorHora || valorHora <= 0) {
            alert('⚠️ O valor da hora deve ser maior que zero');
            campoValorHora.focus();
            return false;
        }

        if (valorHora > 1000) {
            alert('⚠️ O valor da hora não pode ser maior que R$ 1.000,00');
            campoValorHora.focus();
            return false;
        }

        return true;
    }

    // ✅ FUNÇÃO PARA ATUALIZAR VALOR COM BÔNUS EM TEMPO REAL
    atualizarValorBonus() {
        try {
            const campoValorHora = document.getElementById('valorHora');
            const campoValorBonus = document.getElementById('valorComBonus');

            if (!campoValorHora || !campoValorBonus) {
                console.warn('⚠️ Campos não encontrados para atualizar bônus');
                return;
            }

            // Obter valor digitado
            const valorDigitado = campoValorHora.value.replace(',', '.');
            const valorHora = parseFloat(valorDigitado) || 0;

            // ✅ CÁLCULO CORRETO DO BÔNUS
            const valorBonus90Pct = valorHora * this.BONUS_FIM_SEMANA; // 90% adicional
            const valorComBonus = valorHora + valorBonus90Pct; // Base + bônus

            // Formatar valor
            const valorFormatado = this.formatarMoeda(valorComBonus);

            // Atualizar campo
            campoValorBonus.textContent = valorFormatado;

            console.log('💰 Valor bônus atualizado:', {
                valorHora: valorHora.toFixed(2),
                bonus90Pct: valorBonus90Pct.toFixed(2),
                valorComBonus: valorComBonus.toFixed(2),
                valorFormatado
            });

        } catch (error) {
            console.error('❌ Erro ao atualizar valor bônus:', error);
        }
    }

    // Formatar valor em moeda
    formatarMoeda(valor) {
        return `R$ ${valor.toFixed(2)}`;
    }

    // Salvar configuração
    salvarConfiguracao() {
        try {
            const campoValorHora = document.getElementById('valorHora');
            if (!campoValorHora) return;

            const valorDigitado = campoValorHora.value.replace(',', '.');
            const valorHora = parseFloat(valorDigitado);

            if (!this.validarValorHora()) {
                return;
            }

            const configuracao = {
                valorHora: valorHora,
                dataAtualizacao: new Date().toISOString()
            };

            localStorage.setItem('configuracaoFinanceira', JSON.stringify(configuracao));
            
            // Atualizar interface
            this.atualizarValorBonus();
            
            // Notificar sucesso
            alert('✅ Configuração salva com sucesso!');
            
            console.log('💾 Configuração salva:', configuracao);

        } catch (error) {
            console.error('❌ Erro ao salvar configuração:', error);
            alert('❌ Erro ao salvar configuração');
        }
    }

    // Carregar configuração salva
    carregarConfiguracao() {
        try {
            const configuracaoSalva = localStorage.getItem('configuracaoFinanceira');
            
            if (configuracaoSalva) {
                const configuracao = JSON.parse(configuracaoSalva);
                
                const campoValorHora = document.getElementById('valorHora');
                if (campoValorHora && configuracao.valorHora) {
                    campoValorHora.value = configuracao.valorHora.toFixed(2).replace('.', ',');
                    this.atualizarValorBonus(); // Atualizar bônus após carregar
                }

                console.log('📂 Configuração carregada:', configuracao);
            }
        } catch (error) {
            console.error('❌ Erro ao carregar configuração:', error);
        }
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.configuracaoFinanceira = new ConfiguracaoFinanceira();
});
