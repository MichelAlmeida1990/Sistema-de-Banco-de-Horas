// src/js/configuracao.js - Gerenciador de Configuração Financeira v1.0.0

class ConfiguracaoFinanceira {
    constructor() {
        this.BONUS_FIM_SEMANA = 0.90; // 90% adicional
        this.valorHoraPadrao = 38.00;
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
            campoValorHora.addEventListener('input', () => this.atualizarValorBonus());
            campoValorHora.addEventListener('blur', () => {
                this.validarValorHora();
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
        this.atualizarValorBonus();
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

    calcularValorComBonus(valorBase) {
        return valorBase * (1 + this.BONUS_FIM_SEMANA);
    }

    atualizarValorBonus() {
        const valorBase = parseFloat(document.getElementById('valorHora')?.value || '0');
        if (!valorBase) return;

        const valorComBonus = this.calcularValorComBonus(valorBase);
        
        const elementoBonus = document.getElementById('valorComBonus');
        if (elementoBonus) {
            elementoBonus.textContent = `R$ ${valorComBonus.toFixed(2)}`;
        }

        this.atualizarDemonstracao(valorBase, valorComBonus);
    }

    atualizarDemonstracao(valorBase, valorComBonus) {
        const elementos = {
            'demoValorBase': `R$ ${valorBase.toFixed(2)}`,
            'demoMultiplicador': '1.90',
            'demoValorFinal': `R$ ${valorComBonus.toFixed(2)}`,
            'demoExemplo': `11h × R$ ${valorComBonus.toFixed(2)} = R$ ${(11 * valorComBonus).toFixed(2)}`
        };

        Object.entries(elementos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.textContent = valor;
        });
    }

    salvarConfiguracao() {
        try {
            const valorHora = parseFloat(document.getElementById('valorHora')?.value.replace(',', '.'));
            
            if (this.setValorHora(valorHora)) {
                this.mostrarSucesso('✅ Configuração salva com sucesso!');
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
                campoValorHora.value = valorHora.toFixed(2).replace('.', ',');
                this.atualizarValorBonus();
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
        // Implementar sistema de notificação visual aqui
        console.log(`${tipo.toUpperCase()}: ${mensagem}`);
        alert(mensagem);
    }

    resetarConfiguracao() {
        this.setValorHora(this.valorHoraPadrao);
        this.carregarConfiguracao();
        this.mostrarSucesso('✅ Configuração resetada com sucesso!');
    }
}

// Exportar a classe
window.ConfiguracaoFinanceira = ConfiguracaoFinanceira;
