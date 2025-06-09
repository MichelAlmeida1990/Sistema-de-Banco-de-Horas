// src/js/app.js - Aplicação Principal Corrigida v3.2.0
class BancoHorasApp {
    constructor() {
        console.log('🚀 Banco de Horas App iniciando - v3.2.0');
        
        // Inicializar componentes
        this.storage = new GerenciadorStorage();
        this.calculadora = new CalculadoraBancoHoras();
        
        // Estado da aplicação
        this.registros = [];
        this.registroEditando = null;
        
        // Inicializar
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.inicializarApp());
        } else {
            this.inicializarApp();
        }
    }

    inicializarApp() {
        try {
            console.log('🔧 Inicializando aplicação...');
            
            // Configurar eventos
            this.configurarEventListeners();
            
            // Carregar dados
            this.carregarDados();
            
            // Renderizar interface
            this.renderizarRegistros();
            this.atualizarTotais();
            this.atualizarContadores();
            
            console.log('✅ Aplicação inicializada com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
        }
    }

    configurarEventListeners() {
        // Formulário de registro
        const formRegistro = document.getElementById('formRegistro');
        if (formRegistro) {
            formRegistro.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarRegistro();
            });
        }

        // Botão registrar plantão
        const btnRegistrar = document.querySelector('button[type="submit"]');
        if (btnRegistrar) {
            btnRegistrar.addEventListener('click', (e) => {
                e.preventDefault();
                this.salvarRegistro();
            });
        }

        // Checkbox fim de semana automático
        const dataInput = document.querySelector('input[type="date"]');
        if (dataInput) {
            dataInput.addEventListener('change', (e) => {
                this.verificarFimDeSemana(e.target.value);
            });
        }

        console.log('🎯 Event listeners configurados');
    }

    // ✅ VERIFICAR FIM DE SEMANA AUTOMATICAMENTE
    verificarFimDeSemana(data) {
        if (!data) return;
        
        const ehFimSemana = this.calculadora.ehFimDeSemana(data);
        const checkboxFimSemana = document.querySelector('input[type="checkbox"]:not([id])');
        
        if (checkboxFimSemana && ehFimSemana) {
            checkboxFimSemana.checked = true;
            console.log('🎯 Fim de semana detectado automaticamente');
        }
    }

    // ✅ SALVAR NOVO REGISTRO
    salvarRegistro() {
        try {
            const dados = this.coletarDadosFormulario();
            
            // Validar dados
            const validacao = this.calculadora.validarRegistro(dados);
            if (!validacao.valido) {
                alert('❌ Erro nos dados:\n' + validacao.erros.join('\n'));
                return;
            }

            // Criar registro
            const registro = {
                id: this.registroEditando ? this.registroEditando.id : Date.now(),
                ...dados,
                dataRegistro: new Date().toISOString()
            };

            // Calcular dados extras
            const calculo = this.calculadora.calcularValorRegistro(registro, this.obterValorHora());
            registro.calculado = calculo;

            // Salvar ou atualizar
            if (this.registroEditando) {
                this.atualizarRegistro(registro);
            } else {
                this.adicionarRegistro(registro);
            }

            // Limpar formulário
            this.limparFormulario();
            
            // Atualizar interface
            this.renderizarRegistros();
            this.atualizarTotais();
            this.atualizarContadores();

            console.log('✅ Registro salvo:', registro);

        } catch (error) {
            console.error('❌ Erro ao salvar registro:', error);
            alert('❌ Erro ao salvar registro: ' + error.message);
        }
    }

    // ✅ COLETAR DADOS DO FORMULÁRIO
    coletarDadosFormulario() {
        const dataInput = document.querySelector('input[type="date"]');
        const entradaInput = document.querySelectorAll('input[type="time"]')[0];
        const saidaInput = document.querySelectorAll('input[type="time"]')[1];
        const pausaInput = document.querySelector('input[placeholder="60"]');
        const horasExtrasInput = document.querySelector('input[placeholder="0"]');
        const feriadoCheck = document.querySelector('input[type="checkbox"]:first-of-type');
        const fimSemanaCheck = document.querySelector('input[type="checkbox"]:last-of-type');

        return {
            data: dataInput?.value || '',
            entrada: entradaInput?.value || '',
            saida: saidaInput?.value || '',
            pausa: parseInt(pausaInput?.value || '0'),
            horasExtras: parseFloat(horasExtrasInput?.value || '0'),
            feriado: feriadoCheck?.checked || false,
            fimDeSemana: fimSemanaCheck?.checked || false,
            descricao: ''
        };
    }

    // ✅ RENDERIZAR REGISTROS COM VALORES CORRETOS
    renderizarRegistros() {
        const container = document.querySelector('tbody');
        if (!container) {
            console.warn('⚠️ Container da tabela não encontrado');
            return;
        }

        if (this.registros.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="10" class="text-center text-muted py-4">
                        <i class="fas fa-info-circle me-2"></i>
                        Nenhum plantão registrado ainda.
                    </td>
                </tr>
            `;
            return;
        }

        // Obter valor da hora
        const valorHora = this.obterValorHora();

        const html = this.registros.map(registro => {
            const calculo = this.calculadora.calcularValorRegistro(registro, valorHora);
            
            // Determinar tipo de plantão
            let tipoPlantao = 'Normal';
            let badgeClass = 'bg-secondary';
            
            if (registro.feriado) {
                tipoPlantao = 'Feriado';
                badgeClass = 'bg-warning';
            } else if (registro.fimDeSemana || this.calculadora.ehFimDeSemana(registro.data)) {
                tipoPlantao = 'Fim de Semana';
                badgeClass = 'bg-success';
            }

            // Calcular horas extras
            const horasExtras = registro.horasExtras || 0;
            const saldo = calculo.horasTrabalhadas - 8; // Assumindo 8h como padrão

            return `
                <tr>
                    <td>
                        <strong>${this.formatarData(registro.data)}</strong>
                    </td>
                    <td>
                        <i class="fas fa-clock text-success me-1"></i>
                        ${registro.entrada}
                    </td>
                    <td>
                        <i class="fas fa-clock text-danger me-1"></i>
                        ${registro.saida}
                    </td>
                    <td class="text-center">
                        ${registro.pausa > 0 ? `${registro.pausa}min` : '-'}
                    </td>
                    <td>
                        <span class="badge ${badgeClass}">${tipoPlantao}</span>
                    </td>
                    <td class="text-center">
                        <strong>${calculo.horasTrabalhadas.toFixed(1)}h</strong>
                    </td>
                    <td class="text-center ${saldo > 0 ? 'text-success' : saldo < 0 ? 'text-danger' : ''}">
                        <strong>${saldo > 0 ? '+' : ''}${saldo.toFixed(1)}h</strong>
                    </td>
                    <td class="text-center">
                        ${horasExtras > 0 ? `<span class="text-warning">${horasExtras.toFixed(1)}h</span>` : '-'}
                    </td>
                    <td class="text-center">
                        ${calculo.temBonus ? `<span class="badge bg-success">+90%</span>` : '-'}
                    </td>
                    <td class="text-center">
                        <strong class="text-success">R$ ${calculo.valorTotal.toFixed(2)}</strong>
                        <br><small class="text-muted">R$ ${calculo.valorHora.toFixed(2)}/h</small>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="app.editarRegistro(${registro.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="app.excluirRegistro(${registro.id})" title="Excluir">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        container.innerHTML = html;
        console.log('📋 Registros renderizados:', this.registros.length);
    }

    // ✅ ATUALIZAR TOTAIS NO RESUMO
    atualizarTotais() {
        const valorHora = this.obterValorHora();
        const totais = this.calculadora.calcularTotais(this.registros, valorHora);

        // Calcular saldo total e horas extras
        let saldoTotal = 0;
        let horasExtrasTotal = 0;
        
        this.registros.forEach(registro => {
            const calculo = this.calculadora.calcularValorRegistro(registro, valorHora);
            saldoTotal += (calculo.horasTrabalhadas - 8); // Assumindo 8h padrão
            horasExtrasTotal += (registro.horasExtras || 0);
        });

        // Atualizar resumo total
        this.atualizarElementoTexto('.resumo-saldo', saldoTotal.toFixed(1) + 'h');
        this.atualizarElementoTexto('.resumo-bonus', totais.totalHorasFimSemana.toFixed(1) + 'h');
        this.atualizarElementoTexto('.resumo-valor', 'R$ ' + totais.totalValorGeral.toFixed(2));

        console.log('📊 Totais atualizados:', {
            saldoTotal,
            horasExtrasTotal,
            valorTotal: totais.totalValorGeral
        });
    }

    // ✅ ATUALIZAR CONTADORES DO TOPO
    atualizarContadores() {
        const valorHora = this.obterValorHora();
        const totais = this.calculadora.calcularTotais(this.registros, valorHora);
        
        // Calcular saldo
        let saldoTotal = 0;
        this.registros.forEach(registro => {
            const calculo = this.calculadora.calcularValorRegistro(registro, valorHora);
            saldoTotal += (calculo.horasTrabalhadas - 8);
        });

        // Atualizar cards do topo
        const elementos = {
            saldoTotal: saldoTotal.toFixed(1) + 'h',
            bonusHoras: totais.totalHorasFimSemana.toFixed(1) + 'h',
            totalPlantoes: this.registros.length,
            valorTotal: 'R$ ' + totais.totalValorGeral.toFixed(2)
        };

        // Tentar diferentes seletores para os cards
        this.atualizarCard('Saldo Total', elementos.saldoTotal);
        this.atualizarCard('Bônus 90%', elementos.bonusHoras);
        this.atualizarCard('Plantões', elementos.totalPlantoes);
        this.atualizarCard('Valor Total', elementos.valorTotal);

        console.log('🎯 Contadores atualizados:', elementos);
    }

    // ✅ UTILITÁRIOS
    atualizarCard(titulo, valor) {
        // Procurar por diferentes estruturas de card
        const cards = document.querySelectorAll('.card, [class*="card"], [class*="stat"]');
        
        cards.forEach(card => {
            const textoCard = card.textContent || card.innerText;
            if (textoCard.includes(titulo)) {
                const valorElement = card.querySelector('h1, h2, h3, .valor, [class*="valor"], strong');
                if (valorElement) {
                    valorElement.textContent = valor;
                }
            }
        });
    }

    atualizarElementoTexto(seletor, valor) {
        const elemento = document.querySelector(seletor);
        if (elemento) {
            elemento.textContent = valor;
        }
    }

    // ✅ OBTER VALOR DA HORA
    obterValorHora() {
        try {
            const config = localStorage.getItem('configuracaoFinanceira');
            if (config) {
                const dados = JSON.parse(config);
                return dados.valorHora || 25.00;
            }
            return 25.00;
        } catch (error) {
            console.error('❌ Erro ao obter valor da hora:', error);
            return 25.00;
        }
    }

    // ✅ CARREGAR DADOS
    carregarDados() {
        try {
            this.registros = this.storage.carregarRegistros();
            console.log(`📂 ${this.registros.length} registros carregados`);
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            this.registros = [];
        }
    }

    // ✅ ADICIONAR REGISTRO
    adicionarRegistro(registro) {
        this.registros.push(registro);
        this.storage.salvarRegistros(this.registros);
        this.mostrarSucesso('✅ Plantão registrado com sucesso!');
    }

    // ✅ ATUALIZAR REGISTRO
    atualizarRegistro(registro) {
        const index = this.registros.findIndex(r => r.id === registro.id);
        if (index !== -1) {
            this.registros[index] = registro;
            this.storage.salvarRegistros(this.registros);
            this.registroEditando = null;
            this.mostrarSucesso('✅ Plantão atualizado com sucesso!');
        }
    }

    formatarData(data) {
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    }

    limparFormulario() {
        const inputs = document.querySelectorAll('input[type="date"], input[type="time"], input[type="number"], input[type="checkbox"]');
        inputs.forEach(input => {
            if (input.type === 'checkbox') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
        this.registroEditando = null;
    }

    mostrarSucesso(mensagem) {
        console.log('✅', mensagem);
        
        // Tentar mostrar notificação visual
        if (typeof alert !== 'undefined') {
            setTimeout(() => alert(mensagem), 100);
        }
    }

    // ✅ EDITAR REGISTRO
    editarRegistro(id) {
        const registro = this.registros.find(r => r.id === id);
        if (registro) {
            const inputs = document.querySelectorAll('input');
            inputs.forEach(input => {
                switch(input.type) {
                    case 'date':
                        input.value = registro.data;
                        break;
                    case 'time':
                        if (input.previousElementSibling?.textContent?.includes('Entrada')) {
                            input.value = registro.entrada;
                        } else if (input.previousElementSibling?.textContent?.includes('Saída')) {
                            input.value = registro.saida;
                        }
                        break;
                    case 'number':
                        if (input.placeholder === '60') {
                            input.value = registro.pausa || 0;
                        } else if (input.placeholder === '0') {
                            input.value = registro.horasExtras || 0;
                        }
                        break;
                    case 'checkbox':
                        if (input.nextElementSibling?.textContent?.includes('Feriado')) {
                            input.checked = registro.feriado || false;
                        } else if (input.nextElementSibling?.textContent?.includes('Fim de Semana')) {
                            input.checked = registro.fimDeSemana || false;
                        }
                        break;
                }
            });
            
            this.registroEditando = registro;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // ✅ EXCLUIR REGISTRO
    excluirRegistro(id) {
        if (confirm('❓ Tem certeza que deseja excluir este plantão?')) {
            this.registros = this.registros.filter(r => r.id !== id);
            this.storage.salvarRegistros(this.registros);
            this.renderizarRegistros();
            this.atualizarTotais();
            this.atualizarContadores();
            this.mostrarSucesso('✅ Plantão excluído com sucesso!');
        }
    }
}

// ✅ INICIALIZAR APLICAÇÃO
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new BancoHorasApp();
});

// Fallback para inicialização
if (document.readyState !== 'loading') {
    app = new BancoHorasApp();
}

console.log('🚀 App principal corrigido carregado - v3.2.0');
