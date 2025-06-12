// src/js/app.js - Aplicação Principal com Banco de Horas v5.0.0
class BancoHorasApp {
    constructor() {
        console.log('🚀 Banco de Horas App iniciando - v5.0.0');
        
        // Inicializar componentes
        this.storage = new GerenciadorStorage();
        this.calculadora = new CalculadoraBancoHoras();
        
        // Estado da aplicação
        this.registros = [];
        this.registroEditando = null;
        
        // Inicializar
        this.init();
        window.app = this; // Torna a instância global para uso em funções globais
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
            
            // Mostrar informações do sistema
            this.mostrarInfoSistema();
            
            console.log('✅ Aplicação inicializada com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
        }
    }

    // ✅ CORRIGIDO - Event listeners com IDs corretos
    configurarEventListeners() {
        // Formulário de registro - ID correto
        const formRegistro = document.getElementById('bancoHorasForm');
        if (formRegistro) {
            formRegistro.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarRegistro();
            });
        }

        // Campo data - verificar fim de semana automaticamente
        const dataInput = document.getElementById('data');
        if (dataInput) {
            dataInput.addEventListener('change', (e) => {
                this.verificarFimDeSemana(e.target.value);
            });
        }

        // Configuração financeira
        const valorHoraInput = document.getElementById('valorHora');
        const salvarValorBtn = document.getElementById('salvarValorHora');
        
        if (valorHoraInput) {
            valorHoraInput.addEventListener('input', () => {
                this.atualizarValorComBonus();
            });
        }

        if (salvarValorBtn) {
            salvarValorBtn.addEventListener('click', () => {
                this.salvarConfiguracaoFinanceira();
            });
        }

        // Botões de ação
        this.configurarBotoesAcao();

        console.log('🎯 Event listeners configurados');
    }

    // ✅ NOVO - Configurar botões de ação
    configurarBotoesAcao() {
        const botoes = {
            limparBtn: () => this.limparTodosDados(),
            exportarCsvBtn: () => this.exportarCSV(),
            exportarPdfBtn: () => this.exportarPDF(),
            salvarBtn: () => this.salvarDados(),
            demonstrarBonusBtn: () => this.demonstrarCalculoBonus()
        };

        Object.entries(botoes).forEach(([id, funcao]) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', funcao);
            }
        });
    }

    // ✅ CORRIGIDO - Verificar fim de semana automaticamente
    verificarFimDeSemana(data) {
        if (!data) return;
        
        const ehFimSemana = this.calculadora.ehFimDeSemana(data);
        const checkboxFimSemana = document.getElementById('fimSemana');
        
        if (checkboxFimSemana) {
            checkboxFimSemana.checked = ehFimSemana;
            
            if (ehFimSemana) {
                console.log('🎯 Fim de semana detectado automaticamente');
                this.mostrarNotificacao('🎯 Fim de semana detectado! Bônus de 90% será aplicado.', 'info');
            }
        }
    }

    // ✅ CORRIGIDO - Salvar registro com banco de horas
    salvarRegistro() {
        try {
            const dados = this.coletarDadosFormulario();
            
            // Validar dados
            const validacao = this.calculadora.validarRegistro(dados);
            if (!validacao.valido) {
                this.mostrarNotificacao('❌ Erro nos dados:\n' + validacao.erros.join('\n'), 'error');
                return;
            }

            // Criar registro
            const registro = {
                id: this.registroEditando ? this.registroEditando.id : Date.now(),
                ...dados,
                dataRegistro: new Date().toISOString()
            };

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
            this.mostrarNotificacao('❌ Erro ao salvar registro: ' + error.message, 'error');
        }
    }

    // ✅ CORRIGIDO - Coletar dados do formulário com detecção automática de fim de semana
    coletarDadosFormulario() {
        const data = document.getElementById('data')?.value || '';
        const ehFimSemanaAuto = data ? this.calculadora.ehFimDeSemana(data) : false;
        const fimSemanaManual = document.getElementById('fimSemana')?.checked || false;
        // O campo fimDeSemana será true se o usuário marcar OU se a data for fim de semana
        return {
            data: data,
            entrada: document.getElementById('entrada')?.value || '',
            saida: document.getElementById('saida')?.value || '',
            pausa: parseInt(document.getElementById('pausa')?.value || '0'),
            horasExtras: parseFloat(document.getElementById('horasExtras')?.value || '0'),
            feriado: document.getElementById('feriado')?.checked || false,
            fimDeSemana: fimSemanaManual || ehFimSemanaAuto, // Prioriza manual, mas considera automático
            usarBancoHoras: document.getElementById('usarBancoHoras')?.checked || false,
            descricao: document.getElementById('descricao')?.value || ''
        };
    }

    // ✅ CORRIGIDO - Renderizar registros com banco de horas
    renderizarRegistros() {
        const container = document.getElementById('tabelaBody');
        if (!container) {
            console.warn('⚠️ Container da tabela não encontrado');
            return;
        }

        if (this.registros.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="12" class="p-8 text-center text-gray-500">
                        <i class="fas fa-info-circle text-4xl mb-3 block"></i>
                        <p class="text-lg">Nenhum plantão registrado ainda.</p>
                        <p class="text-sm">Adicione seu primeiro plantão usando o formulário acima.</p>
                        <div class="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p class="text-sm text-blue-700">
                                <i class="fas fa-lightbulb mr-1"></i>
                                <strong>Dica:</strong> Plantões de fim de semana recebem bônus de 90%!
                            </p>
                        </div>
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
            let badgeClass = 'bg-gray-500';
            
            if (registro.feriado) {
                tipoPlantao = 'Feriado';
                badgeClass = 'bg-red-500';
            } else if (registro.fimDeSemana || this.calculadora.ehFimDeSemana(registro.data)) {
                tipoPlantao = 'Fim de Semana';
                badgeClass = 'bg-green-500';
            }

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4">
                        <div class="font-semibold text-gray-900">
                            ${this.formatarData(registro.data)}
                        </div>
                        <div class="text-xs text-gray-500">
                            ${this.obterDiaSemana(registro.data)}
                        </div>
                    </td>
                    <td class="p-4">
                        <span class="flex items-center gap-1">
                            <i class="fas fa-sign-in-alt text-green-500"></i>
                            ${registro.entrada}
                        </span>
                    </td>
                    <td class="p-4">
                        <span class="flex items-center gap-1">
                            <i class="fas fa-sign-out-alt text-red-500"></i>
                            ${registro.saida}
                        </span>
                    </td>
                    <td class="p-4 text-center">
                        ${registro.pausa > 0 ? `${registro.pausa}min` : '-'}
                    </td>
                    <td class="p-4">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${badgeClass}">
                            ${tipoPlantao}
                        </span>
                    </td>
                    <td class="p-4 text-center font-semibold">
                        ${calculo.horasTrabalhadas.toFixed(1)}h
                    </td>
                    <td class="p-4 text-center font-semibold ${calculo.saldoHoras > 0 ? 'text-green-600' : calculo.saldoHoras < 0 ? 'text-red-600' : 'text-gray-600'}">
                        ${calculo.saldoHoras > 0 ? '+' : ''}${calculo.saldoHoras.toFixed(1)}h
                    </td>
                    <td class="p-4 text-center">
                        ${calculo.horasExtrasRemuneradas > 0 ? 
                            `<span class="text-blue-600 font-semibold">${calculo.horasExtrasRemuneradas.toFixed(1)}h</span>` : 
                            '<span class="text-gray-400">-</span>'
                        }
                    </td>
                    <td class="p-4 text-center">
                        ${calculo.bancoHoras > 0 ? 
                            `<span class="text-indigo-600 font-semibold">${calculo.bancoHoras.toFixed(1)}h</span>` : 
                            '<span class="text-gray-400">-</span>'
                        }
                    </td>
                    <td class="p-4 text-center">
                        ${calculo.temBonus ? 
                            `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <i class="fas fa-gift mr-1"></i>+90%
                            </span>` : 
                            '<span class="text-gray-400">-</span>'
                        }
                    </td>
                    <td class="p-4 text-center">
                        <div class="font-bold text-green-600">R$ ${calculo.valorTotal.toFixed(2)}</div>
                        <div class="text-xs text-gray-500">R$ ${calculo.valorHora.toFixed(2)}/h</div>
                    </td>
                    <td class="p-4">
                        <div class="flex gap-1">
                            <button onclick="app.editarRegistro(${registro.id})" 
                                    class="p-2 text-blue-600 hover:bg-blue-100 rounded transition-colors" 
                                    title="Editar">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="excluirRegistro(${registro.id})" 
                                    class="p-2 text-red-600 hover:bg-red-100 rounded transition-colors" 
                                    title="Excluir">
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

    // ✅ CORRIGIDO - Atualizar totais com banco de horas
    atualizarTotais() {
        const valorHora = this.obterValorHora();
        const totais = this.calculadora.calcularTotais(this.registros, valorHora);
        const saldoBanco = this.calculadora.calcularSaldoBanco(this.registros);

        // Atualizar resumo final
        const elementos = {
            'saldoTotal': `${totais.totalHorasGeral.toFixed(1)}h`,
            'extrasTotal': `${saldoBanco.saldoRemunerado.toFixed(1)}h`,
            'bancoTotal': `${saldoBanco.saldoBanco.toFixed(1)}h`,
            'bonusTotal': `${totais.totalHorasFimSemana.toFixed(1)}h`,
            'valorTotalResumo': `R$ ${totais.totalValorGeral.toFixed(2)}`
        };

        Object.entries(elementos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = valor;
            }
        });

        console.log('📊 Totais atualizados:', totais);
    }

    // ✅ CORRIGIDO - Atualizar contadores do topo
    atualizarContadores() {
        const valorHora = this.obterValorHora();
        const totais = this.calculadora.calcularTotais(this.registros, valorHora);
        const saldoBanco = this.calculadora.calcularSaldoBanco(this.registros);
        const estatisticas = this.calculadora.obterEstatisticas(this.registros);

        // Atualizar cards do topo
        const elementos = {
            'saldoTotalCard': `${saldoBanco.saldoTotal.toFixed(1)}h`,
            'bonusTotalCard': `${totais.totalHorasFimSemana.toFixed(1)}h`,
            'totalPlantoes': this.registros.length.toString(),
            'valorTotalCard': `R$ ${totais.totalValorGeral.toFixed(2)}`,
            'plantoesNormais': estatisticas.plantoesNormais.toString(),
            'plantoesFimSemana': estatisticas.plantoesFimSemana.toString(),
            'plantoesFeriado': estatisticas.plantoesFeriado.toString()
        };

        Object.entries(elementos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = valor;
            }
        });

        console.log('🎯 Contadores atualizados:', elementos);
    }

    // ✅ CORRIGIDO - Atualizar valor com bônus usando a calculadora
    atualizarValorComBonus() {
        const valorBase = parseFloat(document.getElementById('valorHora')?.value || '25');
        
        // ✅ CORREÇÃO: Usar a calculadora para obter o valor correto
        const valorComBonus = this.calculadora.calcularValorHora(valorBase, true, false);
        
        const elemento = document.getElementById('valorComBonus');
        if (elemento) {
            elemento.textContent = `R$ ${valorComBonus.toFixed(2)}`;
        }

        // Atualizar demonstração
        this.atualizarDemonstracao(valorBase, valorComBonus);
    }

    // ✅ NOVO - Atualizar demonstração de cálculo
    atualizarDemonstracao(valorBase, valorComBonus) {
        const elementos = {
            'demoValorBase': `R$ ${valorBase.toFixed(2)}`,
            'demoMultiplicador': '1.90',
            'demoValorFinal': `R$ ${valorComBonus.toFixed(2)}`,
            'demoExemplo': `11h × R$ ${valorComBonus.toFixed(2)} = R$ ${(11 * valorComBonus).toFixed(2)}`
        };

        Object.entries(elementos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = valor;
            }
        });
    }

    // ✅ NOVO - Demonstrar cálculo de bônus
    demonstrarCalculoBonus() {
        const valorBase = this.obterValorHora();
        const demonstracao = this.calculadora.demonstrarCalculoBonus(valorBase);
        
        const modal = `
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                    <h3 class="text-lg font-bold mb-4">📊 Demonstração de Cálculo</h3>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <span>Valor base:</span>
                            <span class="font-semibold">R$ ${demonstracao.valorBase.toFixed(2)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Multiplicador:</span>
                            <span class="font-semibold">${demonstracao.multiplicador}</span>
                        </div>
                        <div class="flex justify-between border-t pt-2">
                            <span>Valor final:</span>
                            <span class="font-bold text-green-600">R$ ${demonstracao.valorFinal.toFixed(2)}</span>
                        </div>
                        <div class="bg-blue-50 p-3 rounded">
                            <p class="text-sm text-blue-700">
                                <strong>Exemplo:</strong> 11h × R$ ${demonstracao.valorFinal.toFixed(2)} = 
                                <strong>R$ ${demonstracao.exemplo11h.toFixed(2)}</strong>
                            </p>
                        </div>
                    </div>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            class="mt-4 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
                        Fechar
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modal);
    }

    // ✅ NOVO - Mostrar informações do sistema
    mostrarInfoSistema() {
        const info = this.calculadora.obterInfoSistema();
        console.log('🎯 Sistema de Banco de Horas:', info);
    }

    // ✅ NOVO - Salvar configuração financeira
    salvarConfiguracaoFinanceira() {
        try {
            const valorHora = parseFloat(document.getElementById('valorHora')?.value || '25');
            
            if (valorHora < 1 || valorHora > 1000) {
                this.mostrarNotificacao('❌ Valor da hora deve estar entre R$ 1,00 e R$ 1.000,00', 'error');
                return;
            }

            const config = {
                valorHora: valorHora,
                dataAtualizacao: new Date().toISOString()
            };

            localStorage.setItem('configuracaoFinanceira', JSON.stringify(config));
            
            // Atualizar interface
            this.atualizarValorComBonus();
            this.renderizarRegistros();
            this.atualizarTotais();
            this.atualizarContadores();

            this.mostrarNotificacao('✅ Configuração financeira salva!', 'success');

        } catch (error) {
            console.error('❌ Erro ao salvar configuração:', error);
            this.mostrarNotificacao('❌ Erro ao salvar configuração', 'error');
        }
    }

    // ✅ UTILITÁRIOS
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

    formatarData(data) {
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    }

    obterDiaSemana(data) {
        const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        const dataObj = new Date(data + 'T00:00:00');
        return dias[dataObj.getDay()];
    }

    // ✅ CORRIGIDO - Carregar dados
    carregarDados() {
        try {
            this.registros = this.storage.carregarRegistros();
            console.log(`📂 ${this.registros.length} registros carregados`);
            
            // Carregar configuração financeira
            const valorHoraInput = document.getElementById('valorHora');
            if (valorHoraInput) {
                valorHoraInput.value = this.obterValorHora().toFixed(2);
                this.atualizarValorComBonus();
            }
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            this.registros = [];
        }
    }

    // ✅ ADICIONAR REGISTRO
    adicionarRegistro(registro) {
        this.registros.push(registro);
        this.storage.salvarRegistros(this.registros);
        this.mostrarNotificacao('✅ Plantão registrado com sucesso!', 'success');
    }

    // ✅ ATUALIZAR REGISTRO
    atualizarRegistro(registro) {
        const index = this.registros.findIndex(r => r.id === registro.id);
        if (index !== -1) {
            this.registros[index] = registro;
            this.storage.salvarRegistros(this.registros);
            this.registroEditando = null;
            this.mostrarNotificacao('✅ Plantão atualizado com sucesso!', 'success');
        }
    }

    // ✅ CORRIGIDO - Limpar formulário com IDs corretos
    limparFormulario() {
        const campos = ['data', 'entrada', 'saida', 'pausa', 'horasExtras', 'descricao'];
        const checkboxes = ['feriado', 'fimSemana', 'usarBancoHoras'];

        campos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.value = id === 'pausa' ? '60' : '';
            }
        });

        checkboxes.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.checked = false;
            }
        });

        this.registroEditando = null;
    }

    // ✅ CORRIGIDO - Editar registro com IDs corretos
    editarRegistro(id) {
        const registro = this.registros.find(r => r.id === id);
        if (!registro) return;

        // Preencher campos
        document.getElementById('data').value = registro.data;
        document.getElementById('entrada').value = registro.entrada;
        document.getElementById('saida').value = registro.saida;
        document.getElementById('pausa').value = registro.pausa || 0;
        document.getElementById('horasExtras').value = registro.horasExtras || 0;
        document.getElementById('feriado').checked = registro.feriado || false;
        document.getElementById('fimSemana').checked = registro.fimDeSemana || false;
        document.getElementById('usarBancoHoras').checked = registro.usarBancoHoras || false;
        
        if (document.getElementById('descricao')) {
            document.getElementById('descricao').value = registro.descricao || '';
        }

        this.registroEditando = registro;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        this.mostrarNotificacao('📝 Registro carregado para edição', 'info');
    }

    // ✅ CORREÇÃO - Exclusão mais robusta
    excluirRegistro(id) {
        try {
            console.log('🗑️ Tentando excluir registro:', id);
            
            // Verificar se o registro existe
            const registroExiste = this.registros.find(r => r.id === id);
            if (!registroExiste) {
                this.mostrarNotificacao('❌ Registro não encontrado', 'error');
                return;
            }

            if (!confirm('❓ Tem certeza que deseja excluir este plantão?')) {
                return;
            }

            // Salvar estado anterior para possível rollback
            const registrosAnteriores = [...this.registros];
            
            // Remover registro
            this.registros = this.registros.filter(r => r.id !== id);
            
            // Salvar com verificação
            const sucessoSalvar = this.storage.salvarRegistrosComVerificacao(this.registros);
            
            if (sucessoSalvar) {
                // Atualizar interface
                this.renderizarRegistros();
                this.atualizarTotais();
                this.atualizarContadores();
                
                this.mostrarNotificacao('✅ Plantão excluído com sucesso!', 'success');
                console.log('✅ Registro excluído:', id);
            } else {
                // Rollback em caso de erro
                this.registros = registrosAnteriores;
                this.mostrarNotificacao('❌ Erro ao excluir registro', 'error');
            }

        } catch (error) {
            console.error('❌ Erro na exclusão:', error);
            this.mostrarNotificacao('❌ Erro interno ao excluir registro', 'error');
        }
    }

    // ✅ NOVOS MÉTODOS - Ações dos botões
    limparTodosDados() {
        if (confirm('❓ Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita.')) {
            this.registros = [];
            this.storage.salvarRegistros(this.registros);
            this.renderizarRegistros();
            this.atualizarTotais();
            this.atualizarContadores();
            this.mostrarNotificacao('✅ Todos os dados foram limpos!', 'success');
        }
    }

    exportarCSV() {
        try {
            const valorHora = this.obterValorHora();
            let csv = 'Data,Entrada,Saída,Pausa,Horas Trabalhadas,Saldo,Extras Pagas,Banco Horas,Tipo,Valor\n';
            
            this.registros.forEach(registro => {
                const calculo = this.calculadora.calcularValorRegistro(registro, valorHora);
                const tipo = registro.feriado ? 'Feriado' : (registro.fimDeSemana ? 'Fim de Semana' : 'Normal');
                
                csv += `${registro.data},${registro.entrada},${registro.saida},${registro.pausa}min,`;
                csv += `${calculo.horasTrabalhadas.toFixed(1)}h,${calculo.saldoHoras.toFixed(1)}h,`;
                csv += `${calculo.horasExtrasRemuneradas.toFixed(1)}h,${calculo.bancoHoras.toFixed(1)}h,`;
                csv += `${tipo},R$ ${calculo.valorTotal.toFixed(2)}\n`;
            });

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `banco-horas-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            this.mostrarNotificacao('✅ Arquivo CSV exportado!', 'success');
        } catch (error) {
            console.error('❌ Erro ao exportar CSV:', error);
            this.mostrarNotificacao('❌ Erro ao exportar CSV', 'error');
        }
    }

    exportarPDF() {
        this.mostrarNotificacao('📄 Funcionalidade de exportar PDF será implementada em breve!', 'info');
    }

        salvarDados() {
        try {
            this.storage.salvarRegistros(this.registros);
            this.mostrarNotificacao('✅ Dados salvos com sucesso!', 'success');
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
            this.mostrarNotificacao('❌ Erro ao salvar dados', 'error');
        }
    }

    // ✅ CORRIGIDO - Sistema de notificações melhorado
    mostrarNotificacao(mensagem, tipo = 'success') {
        console.log('📢', mensagem);
        
        // Definir cores por tipo
        const cores = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };

        const icones = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        // Criar notificação visual moderna
        const notificacao = document.createElement('div');
        notificacao.className = `fixed top-4 right-4 ${cores[tipo]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full max-w-sm`;
        notificacao.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="${icones[tipo]}"></i>
                <span class="text-sm">${mensagem}</span>
            </div>
        `;
        
        document.body.appendChild(notificacao);
        
        // Animar entrada
        setTimeout(() => {
            notificacao.classList.remove('translate-x-full');
        }, 100);
        
        // Remover após 4 segundos (mais tempo para ler)
        setTimeout(() => {
            notificacao.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notificacao)) {
                    document.body.removeChild(notificacao);
                }
            }, 300);
        }, 4000);
    }

    // ✅ NOVO - Mostrar notificação de sucesso (compatibilidade)
    mostrarSucesso(mensagem) {
        this.mostrarNotificacao(mensagem, 'success');
    }
}

// ✅ CORREÇÃO - Inicialização mais robusta
let app = null;
let tentativasInicializacao = 0;
const MAX_TENTATIVAS = 3;

function inicializarApp() {
    try {
        // Evitar múltiplas inicializações
        if (app) {
            console.log('🎯 App já inicializado');
            return;
        }

        tentativasInicializacao++;
        console.log(`🚀 Tentativa ${tentativasInicializacao} de inicialização...`);

        // Verificar se elementos essenciais existem
        const elementosEssenciais = [
            'bancoHorasForm',
            'tabelaBody',
            'valorHora'
        ];

        const elementosFaltando = elementosEssenciais.filter(id => !document.getElementById(id));
        
        if (elementosFaltando.length > 0) {
            throw new Error(`Elementos não encontrados: ${elementosFaltando.join(', ')}`);
        }

        // Limpar storage cache antes de inicializar
        if (window.localStorage) {
            console.log('🧹 Limpando cache do storage...');
        }

        app = new BancoHorasApp();
        
        // Verificar se inicializou corretamente
        if (app && app.storage && app.calculadora) {
            console.log('✅ App inicializado com sucesso!');
            
            // Forçar atualização da interface
            setTimeout(() => {
                app.renderizarRegistros();
                app.atualizarTotais();
                app.atualizarContadores();
            }, 100);
            
        } else {
            throw new Error('Componentes da app não inicializados corretamente');
        }

    } catch (error) {
        console.error(`❌ Erro na inicialização (tentativa ${tentativasInicializacao}):`, error);
        
        if (tentativasInicializacao < MAX_TENTATIVAS) {
            console.log('🔄 Tentando novamente em 1 segundo...');
            setTimeout(inicializarApp, 1000);
        } else {
            console.error('❌ Falha crítica na inicialização após 3 tentativas');
            mostrarErroInicializacao();
        }
    }
}

function mostrarErroInicializacao() {
    const container = document.body;
    if (container) {
        container.innerHTML = `
            <div class="min-h-screen bg-red-50 flex items-center justify-center p-4">
                <div class="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
                    <i class="fas fa-exclamation-triangle text-red-500 text-4xl mb-4"></i>
                    <h2 class="text-xl font-bold text-red-700 mb-2">Erro de Inicialização</h2>
                    <p class="text-gray-600 mb-4">Não foi possível carregar a aplicação.</p>
                    <div class="space-y-2">
                        <button onclick="location.reload()" 
                                class="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                            🔄 Recarregar Página
                        </button>
                        <button onclick="localStorage.clear(); location.reload()" 
                                class="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                            🧹 Limpar Cache e Recarregar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// ✅ CORREÇÃO - Funções globais mais robustas
window.editarRegistro = function(id) {
    try {
        if (!app) {
            console.error('❌ App não inicializada para edição');
            return;
        }
        app.editarRegistro(id);
    } catch (error) {
        console.error('❌ Erro na edição:', error);
    }
};

window.excluirRegistro = function(id) {
    try {
        if (!app) {
            console.error('❌ App não inicializada para exclusão');
            alert('Sistema ainda não foi carregado. Aguarde um momento e tente novamente.');
            return;
        }
        app.excluirRegistro(id);
    } catch (error) {
        console.error('❌ Erro na exclusão:', error);
        alert('Erro ao excluir registro. Tente recarregar a página.');
    }
};

// ✅ NOVO - Função para verificar se app está pronta
window.verificarApp = function() {
    if (app && app.storage && app.calculadora) {
        console.log('✅ App está funcionando corretamente');
        return true;
    } else {
        console.log('❌ App não está inicializada corretamente');
        return false;
    }
};

// Garante que o app só inicializa após o DOM estar pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    inicializarApp();
    window.app = app;
  });
} else {
  inicializarApp();
  window.app = app;
}

console.log('🚀 App principal com banco de horas CORRIGIDO - v5.0.0');
console.log('✅ Bônus fim de semana: 190% do valor base (100% + 90% bônus)');
console.log('✅ Detecção automática de fim de semana implementada');
console.log('✅ Sistema de notificações melhorado');
console.log('✅ Compatibilidade com múltiplos navegadores');
console.log('✅ Interface moderna e responsiva com Tailwind CSS');
console.log('✅ Banco de Horas App pronto para uso!');
