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
                this.atualizarValorBonus();
            });

            // Atualizar quando pressionar tecla
            campoValorHora.addEventListener('keyup', () => {
                this.atualizarValorBonus();
            });
        }

        if (botaoSalvar) {
            botaoSalvar.addEventListener('click', () => {
                this.salvarConfiguracao();
            });
        }
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

    // Formatar valor em moeda brasileira
    formatarMoeda(valor) {
        if (typeof valor !== 'number' || isNaN(valor) || valor === 0) {
            return 'R$ 0,00';
        }
        
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // Salvar configuração
    salvarConfiguracao() {
        try {
            const campoValorHora = document.getElementById('valorHora');
            
            if (!campoValorHora) {
                throw new Error('Campo valor da hora não encontrado');
            }

            const valorDigitado = campoValorHora.value.replace(',', '.');
            const valorHora = parseFloat(valorDigitado);

            if (isNaN(valorHora) || valorHora <= 0) {
                alert('⚠️ Por favor, insira um valor válido para a hora.');
                campoValorHora.focus();
                return;
            }

            // Salvar no localStorage
            const configuracao = {
                valorHora: valorHora,
                dataAtualizacao: new Date().toISOString()
            };

            localStorage.setItem('configuracaoFinanceira', JSON.stringify(configuracao));

            // Feedback visual
            this.mostrarSucesso('✅ Configuração salva com sucesso!');

            console.log('💾 Configuração salva:', configuracao);

        } catch (error) {
            console.error('❌ Erro ao salvar configuração:', error);
            alert('❌ Erro ao salvar configuração. Tente novamente.');
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

    // Mostrar mensagem de sucesso
    mostrarSucesso(mensagem) {
        // Criar elemento de notificação
        const notificacao = document.createElement('div');
        notificacao.className = 'alert alert-success alert-dismissible fade show';
        notificacao.style.position = 'fixed';
        notificacao.style.top = '20px';
        notificacao.style.right = '20px';
        notificacao.style.zIndex = '9999';
        notificacao.innerHTML = `
            ${mensagem}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notificacao);

        // Remover após 3 segundos
        setTimeout(() => {
            if (notificacao.parentNode) {
                notificacao.parentNode.removeChild(notificacao);
            }
        }, 3000);
    }

    // Obter valor da hora atual
    obterValorHora() {
        try {
            const configuracaoSalva = localStorage.getItem('configuracaoFinanceira');
            
            if (configuracaoSalva) {
                const configuracao = JSON.parse(configuracaoSalva);
                return configuracao.valorHora || 25.00;
            }
            
            return 25.00; // Valor padrão
        } catch (error) {
            console.error('❌ Erro ao obter valor da hora:', error);
            return 25.00;
        }
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.configuracaoFinanceira = new ConfiguracaoFinanceira();
});
