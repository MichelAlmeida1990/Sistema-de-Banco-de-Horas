// src/js/configuracao.js - Gerenciador de Configuração Financeira v2.0.0

class ConfiguracaoFinanceira {
    constructor() {
        this.valorHoraPadrao = 25.00;
        this.storage = localStorage;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.carregarConfiguracao();
        console.log('⚙️ Configuração financeira iniciada');
    }

    setupEventListeners() {
        const campoValorHora = document.getElementById('valorHora');
        const botaoSalvar = document.getElementById('salvarConfiguracao');

        if (campoValorHora) {
            // Apenas atualizar preview quando digitar
            campoValorHora.addEventListener('input', () => this.atualizarPreviewBonus());
            campoValorHora.addEventListener('blur', () => {
                this.validarValorHora();
                this.atualizarPreviewBonus();
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

    getValorHora() {
        try {
            const config = this.storage.getItem('configuracaoFinanceira');
            if (config) {
                const dados = JSON.parse(config);
                return dados.valorHora || this.valorHoraPadrao;
            }
            return this.valorHoraPadrao;
        } catch (error) {
            console.error('❌ Erro ao obter valor da hora:', error);
            return this.valorHoraPadrao;
        }
    }

    setValorHora(valor) {
        if (!this.validarValorHora(valor)) {
            throw new Error('Valor da hora inválido');
        }

        const config = {
            valorHora: valor,
            dataAtualizacao: new Date().toISOString()
        };

        this.storage.setItem('configuracaoFinanceira', JSON.stringify(config));
        return true;
    }

    validarValorHora(valor = null) {
        const valorParaValidar = valor || document.getElementById('valorHora')?.value;
        if (!valorParaValidar) return false;

        const valorNumerico = parseFloat(String(valorParaValidar).replace(',', '.'));
        
        if (isNaN(valorNumerico) || valorNumerico < 1 || valorNumerico > 1000) {
            this.mostrarErro('Valor da hora deve estar entre R$ 1,00 e R$ 1.000,00');
            return false;
        }

        return true;
    }

    // Apenas para mostrar preview na interface - NÃO usado nos cálculos
    atualizarPreviewBonus() {
        const valorBase = parseFloat(document.getElementById('valorHora')?.value || '0');
        if (!valorBase) {
            const elementoBonus = document.getElementById('valorComBonus');
            if (elementoBonus) {
                elementoBonus.textContent = 'R$ 0,00';
            }
            return;
        }

        // Usar a calculadora para mostrar o preview correto
        if (window.Calculadora) {
            const calculadora = new Calculadora();
            const valorComBonus = calculadora.calcularValorHora(valorBase, true, false);
            
            const elementoBonus = document.getElementById('valorComBonus');
            if (elementoBonus) {
                elementoBonus.textContent = `R$ ${valorComBonus.toFixed(2)}`;
            }
        } else {
            // Fallback se calculadora não estiver disponível
            const valorComBonus = valorBase * 1.9; // 90% adicional
            const elementoBonus = document.getElementById('valorComBonus');
            if (elementoBonus) {
                elementoBonus.textContent = `R$ ${valorComBonus.toFixed(2)}`;
            }
        }
    }

    salvarConfiguracao() {
        try {
            const valorHora = parseFloat(document.getElementById('valorHora')?.value.replace(',', '.'));
            
            if (this.setValorHora(valorHora)) {
                this.mostrarSucesso('✅ Configuração salva com sucesso!');
                
                // Atualizar preview após salvar
                this.atualizarPreviewBonus();
                
                // Notificar outros componentes sobre a mudança
                if (window.app && window.app.registroPlantao) {
                    window.app.registroPlantao.carregarRegistros();
                }
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Erro ao salvar configuração:', error);
            this.mostrarErro('Erro ao salvar configuração');
            return false;
        }
    }

    carregarConfiguracao() {
        try {
            const valorHora = this.getValorHora();
            const campoValorHora = document.getElementById('valorHora');
            
            if (campoValorHora) {
                campoValorHora.value = valorHora.toFixed(2);
                this.atualizarPreviewBonus();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar configuração:', error);
        }
    }

    mostrarSucesso(mensagem) {
        this.mostrarNotificacao(mensagem, 'success');
    }

    mostrarErro(mensagem) {
        this.mostrarNotificacao(mensagem, 'error');
    }

    mostrarNotificacao(mensagem, tipo) {
        // Usar o sistema de notificação do app se disponível
        if (window.app && window.app.mostrarNotificacao) {
            window.app.mostrarNotificacao(mensagem, tipo);
        } else {
            console.log(`${tipo.toUpperCase()}: ${mensagem}`);
            alert(mensagem);
        }
    }

    resetarConfiguracao() {
        this.setValorHora(this.valorHoraPadrao);
        this.carregarConfiguracao();
        this.mostrarSucesso('✅ Configuração resetada com sucesso!');
    }
}

// Exportar a classe
window.ConfiguracaoFinanceira = ConfiguracaoFinanceira;
