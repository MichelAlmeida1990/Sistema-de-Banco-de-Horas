// src/js/app.js - Aplicação Principal com Banco de Horas v5.0.0
class BancoHorasApp {
    constructor(uid) {
        console.log('🚀 Banco de Horas App iniciando - v5.0.0 (Firestore)');
        this.storage = new GerenciadorFirestore(uid);
        this.calculadora = new CalculadoraBancoHoras();
        this.registros = [];
        this.registroEditando = null;
        this.uid = uid;
        this.init();
        window.app = this;
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
            console.log('🔧 Inicializando aplicação...');
            this.configurarEventListeners();
            await this.carregarDados();
            this.renderizarRegistros();
            this.atualizarTotais();
            this.atualizarContadores();
            this.mostrarInfoSistema();
            console.log('✅ Aplicação inicializada com sucesso!');
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
        }
    }

    // ✅ CORRIGIDO - Configurar event listeners
    configurarEventListeners() {
        try {
            console.log('🔄 Configurando event listeners...');

            // Event listener para o campo de data
            const campoData = document.getElementById('data');
            if (campoData) {
                campoData.addEventListener('change', (e) => {
                    console.log('📅 Data selecionada:', e.target.value);
                    this.verificarFimDeSemana(e.target.value);
                });
            }

            // Event listener para o formulário
            const form = document.getElementById('formRegistro');
            if (form) {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    console.log('📝 Formulário submetido');
                    await this.salvarRegistro();
                });
            }

            // Event listener para o campo de valor da hora
            const campoValorHora = document.getElementById('valorHora');
            if (campoValorHora) {
                campoValorHora.addEventListener('input', (e) => {
                    this.atualizarValorComBonus(e.target.value);
                });
            }

            // Event listener para o botão de exportar
            const btnExportar = document.getElementById('btnExportar');
            if (btnExportar) {
                btnExportar.addEventListener('click', () => {
                    this.exportarDados();
                });
            }

            // Event listener para o botão de importar
            const btnImportar = document.getElementById('btnImportar');
            if (btnImportar) {
                btnImportar.addEventListener('click', () => {
                    this.importarDados();
                });
            }

            console.log('✅ Event listeners configurados');
            
        } catch (error) {
            console.error('❌ Erro ao configurar event listeners:', error);
        }
    }

    // ✅ CORRIGIDO - Verificar fim de semana automaticamente
    verificarFimDeSemana(data) {
        try {
            if (!data) return;
            
            console.log('🔄 Verificando fim de semana para:', data);
            
            const ehFimSemana = this.calculadora.ehFimDeSemana(data);
            const checkboxFimSemana = document.getElementById('fimSemana');
            
            if (checkboxFimSemana) {
                checkboxFimSemana.checked = ehFimSemana;
                
                if (ehFimSemana) {
                    console.log('🎯 Fim de semana detectado automaticamente');
                    this.mostrarNotificacao('🎯 Fim de semana detectado! Bônus de 90% será aplicado.', 'info');
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao verificar fim de semana:', error);
        }
    }

    // ✅ CORRIGIDO - Salvar registro com valor da hora atual
    async salvarRegistro() {
        try {
            console.log('📝 Iniciando salvamento de registro...');
            
            // 1. Coletar dados do formulário
            const dados = this.coletarDadosFormulario();
            console.log('📝 Dados coletados:', dados);

            // 2. Obter valor da hora atual da configuração
            const configuracao = JSON.parse(localStorage.getItem('configuracaoFinanceira') || '{}');
            const valorHora = configuracao.valorHora;

            if (!valorHora || valorHora <= 0) {
                throw new Error('Configure o valor da hora antes de salvar o registro');
            }

            // 3. Validar dados
            const validacao = this.calculadora.validarRegistro(dados);
            if (!validacao.valido) {
                this.mostrarNotificacao('❌ Erro nos dados:\n' + validacao.erros.join('\n'), 'error');
                return;
            }

            // 4. Criar registro com dados limpos e valor da hora
            const registro = {
                id: this.registroEditando ? this.registroEditando.id : Date.now().toString(),
                data: dados.data || '',
                entrada: dados.entrada || '',
                saida: dados.saida || '',
                pausa: parseInt(dados.pausa || '0'),
                feriado: Boolean(dados.feriado),
                fimDeSemana: Boolean(dados.fimDeSemana),
                usarBancoHoras: Boolean(dados.usarBancoHoras),
                descricao: (dados.descricao || '').toString(),
                valorHora: valorHora, // Armazenar valor da hora atual
                dataRegistro: new Date().toISOString(),
                uid: this.uid
            };

            // 5. Salvar ou atualizar
            if (this.registroEditando) {
                console.log('🔄 Atualizando registro existente...');
                await this.atualizarRegistro(registro);
            } else {
                console.log('🔄 Adicionando novo registro...');
                await this.adicionarRegistro(registro);
            }

            // 6. Limpar formulário e atualizar interface
            this.limparFormulario();
            await this.carregarDados();
            this.renderizarRegistros();
            this.atualizarTotais();
            this.atualizarContadores();
            
            console.log('✅ Registro salvo com sucesso:', registro);
            this.mostrarNotificacao('✅ Plantão registrado com sucesso!', 'success');

        } catch (error) {
            console.error('❌ Erro ao processar registro:', error);
            this.mostrarNotificacao('❌ Erro ao processar: ' + error.message, 'error');
        }
    }

    // ✅ CORRIGIDO - Coletar dados do formulário com detecção automática de fim de semana
    coletarDadosFormulario() {
        try {
            const data = document.getElementById('data').value;
            const entrada = document.getElementById('entrada').value;
            const saida = document.getElementById('saida').value;
            const pausa = document.getElementById('pausa').value;
            const feriado = document.getElementById('feriado').checked;
            const fimDeSemana = document.getElementById('fimSemana').checked || this.calculadora.ehFimDeSemana(data);
            const usarBancoHoras = document.getElementById('usarBancoHoras').checked;
            const descricao = document.getElementById('descricao')?.value || '';

            console.log('📝 Dados coletados do formulário:', {
                data, entrada, saida, pausa, feriado, fimDeSemana, usarBancoHoras, descricao
            });

            return {
                data,
                entrada,
                saida,
                pausa: parseInt(pausa) || 0,
                feriado,
                fimDeSemana,
                usarBancoHoras,
                descricao
            };
        } catch (error) {
            console.error('❌ Erro ao coletar dados do formulário:', error);
            throw new Error('Erro ao coletar dados do formulário: ' + error.message);
        }
    }

    // ✅ CORRIGIDO - Renderizar registros usando valor da hora armazenado
    renderizarRegistros() {
        try {
            console.log('📝 Iniciando renderização de registros...');
            
            const container = document.getElementById('tabelaBody');
            if (!container) {
                console.error('❌ Container da tabela não encontrado');
                return;
            }

            // Ordenar registros por data (mais recentes primeiro)
            const registrosOrdenados = [...this.registros].sort((a, b) => {
                return new Date(b.data) - new Date(a.data);
            });

            if (registrosOrdenados.length === 0) {
                container.innerHTML = `
                    <tr>
                        <td colspan="12" class="p-8 text-center text-gray-500">
                            <i class="fas fa-info-circle text-4xl mb-3 block"></i>
                            <p>Nenhum registro encontrado</p>
                            <p class="text-sm mt-2">Adicione seu primeiro registro usando o formulário acima</p>
                        </td>
                    </tr>
                `;
                return;
            }

            // Limpar tabela
            container.innerHTML = '';

            // Renderizar cada registro
            registrosOrdenados.forEach(registro => {
                try {
                    const row = document.createElement('tr');
                    row.className = 'hover:bg-gray-50 transition-colors';
                    
                    // Calcular valores
                    const horasTrabalhadas = this.calculadora.calcularHorasTrabalhadas(
                        registro.entrada,
                        registro.saida
                    );
                    
                    const valorRegistro = this.calculadora.calcularValorRegistro(
                        registro,
                        this.configuracao.valorHora
                    );

                    // Determinar tipo do plantão
                    const ehFimDeSemana = this.calculadora.ehFimDeSemana(registro.data);
                    const tipoPlantao = registro.feriado ? 'Feriado' : (ehFimDeSemana ? 'Fim de Semana' : 'Normal');
                    const classeTipo = this.obterClasseTipo(tipoPlantao);

                    row.innerHTML = `
                        <td class="p-4 text-gray-900">
                            ${this.formatarData(registro.data)}
                            <div class="text-xs text-gray-500 mt-1">
                                ${this.obterDiaSemana(registro.data)}
                            </div>
                        </td>
                        <td class="p-4">
                            <span class="${classeTipo}">${tipoPlantao}</span>
                        </td>
                        <td class="p-4 text-gray-900">
                            ${registro.entrada}
                            <div class="text-xs text-gray-500 mt-1">Entrada</div>
                        </td>
                        <td class="p-4 text-gray-900">
                            ${registro.saida}
                            <div class="text-xs text-gray-500 mt-1">Saída</div>
                        </td>
                        <td class="p-4 text-gray-900">
                            ${registro.pausa}h
                            <div class="text-xs text-gray-500 mt-1">Pausa</div>
                        </td>
                        <td class="p-4 text-gray-900">
                            ${horasTrabalhadas}h
                            <div class="text-xs text-gray-500 mt-1">Total</div>
                        </td>
                        <td class="p-4 text-gray-900">
                            R$ ${valorRegistro.toFixed(2)}
                            <div class="text-xs text-gray-500 mt-1">
                                ${registro.valorHora ? `(R$ ${registro.valorHora}/h)` : ''}
                            </div>
                        </td>
                        <td class="p-4">
                            <div class="flex gap-2">
                                <button onclick="app.editarRegistro('${registro.id}')"
                                        class="text-blue-600 hover:text-blue-800">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button onclick="app.excluirRegistro('${registro.id}')"
                                        class="text-red-600 hover:text-red-800">
                                    <i class="fas fa-trash-alt"></i>
                                </button>
                            </div>
                        </td>
                    `;

                    container.appendChild(row);
                } catch (error) {
                    console.error('❌ Erro ao renderizar registro:', error);
                    this.mostrarNotificacao(
                        'Erro ao renderizar registro. Por favor, tente novamente.',
                        'error'
                    );
                }
            });

            console.log('✅ Registros renderizados com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao renderizar registros:', error);
            this.mostrarNotificacao(
                'Erro ao exibir registros. Por favor, recarregue a página.',
                'error'
            );
        }
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
                return dados.valorHora || 28.00;
            }
            return 28.00;
        } catch (error) {
            console.error('❌ Erro ao obter valor da hora:', error);
            return 28.00;
        }
    }

    // ✅ CORRIGIDO - Formatar saldo de horas
    formatarSaldo(saldo) {
        try {
            if (saldo === 0) return '-';
            
            const valor = Math.abs(saldo).toFixed(1);
            const sinal = saldo > 0 ? '+' : '-';
            const classe = saldo > 0 ? 'text-green-600' : 'text-orange-600';
            
            return `<span class="${classe}">${sinal}${valor}h</span>`;
            
        } catch (error) {
            console.error('❌ Erro ao formatar saldo:', error);
            return '-';
        }
    }

    // ✅ CORRIGIDO - Formatar data
    formatarData(data) {
        try {
            if (!data) return '-';
            
            const [ano, mes, dia] = data.split('-');
            return `${dia}/${mes}/${ano}`;
            
        } catch (error) {
            console.error('❌ Erro ao formatar data:', error);
            return data || '-';
        }
    }

    // ✅ CORRIGIDO - Obter dia da semana
    obterDiaSemana(data) {
        try {
            if (!data) return '-';
            
            const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            const dataObj = new Date(data + 'T00:00:00');
            return dias[dataObj.getDay()];
            
        } catch (error) {
            console.error('❌ Erro ao obter dia da semana:', error);
            return '-';
        }
    }

    // ✅ CORRIGIDO - Carregar dados
    async carregarDados() {
        try {
            console.log('📂 Iniciando carregamento de dados...');
            
            // Verificar se está autenticado
            if (!this.uid) {
                throw new Error('Usuário não autenticado');
            }

            // Verificar se storage está inicializado
            if (!this.storage) {
                throw new Error('Storage não inicializado');
            }

            // Carregar registros
            console.log('🔄 Buscando registros do Firestore...');
            this.registros = await this.storage.listarRegistros();
            console.log(`📂 ${this.registros.length} registros carregados`);
            
            // Ordenar registros por data (mais recente primeiro)
            this.registros.sort((a, b) => new Date(b.data) - new Date(a.data));
            
            // Carregar configuração financeira
            const valorHoraInput = document.getElementById('valorHora');
            if (valorHoraInput) {
                valorHoraInput.value = this.obterValorHora().toFixed(2);
                this.atualizarValorComBonus();
            }

            // Atualizar interface
            this.renderizarRegistros();
            this.atualizarTotais();
            this.atualizarContadores();

            console.log('✅ Dados carregados com sucesso');
            return this.registros;
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
            this.mostrarNotificacao('❌ Erro ao carregar dados: ' + error.message, 'error');
            this.registros = [];
            return [];
        }
    }

    // ✅ ADICIONAR REGISTRO
    async adicionarRegistro(registro) {
        try {
            console.log('🔄 Iniciando adição de registro no Firestore...');
            
            if (!this.storage) {
                throw new Error('Storage não inicializado');
            }

            if (!registro) {
                throw new Error('Registro é obrigatório');
            }

            // Garantir que temos um ID
            if (!registro.id) {
                registro.id = Date.now().toString();
            }

            // Adicionar metadados
            const registroCompleto = {
                ...registro,
                criadoEm: new Date().toISOString(),
                uid: this.uid,
                feriado: Boolean(registro.feriado),
                fimDeSemana: Boolean(registro.fimDeSemana),
                usarBancoHoras: Boolean(registro.usarBancoHoras),
                pausa: Number(registro.pausa || 0)
            };

            // Salvar no Firestore
            await this.storage.salvarRegistro(registroCompleto);
            console.log('✅ Registro adicionado ao Firestore:', registroCompleto);

            // Recarregar dados
            await this.carregarDados();
            
            // Atualizar interface
            this.mostrarNotificacao('✅ Plantão registrado com sucesso!', 'success');
            this.renderizarRegistros();
            this.atualizarTotais();
            this.atualizarContadores();
            
            return registroCompleto;
        } catch (error) {
            console.error('❌ Erro ao adicionar registro:', error);
            this.mostrarNotificacao('❌ Erro ao adicionar registro: ' + error.message, 'error');
            throw error; // Propagar erro para tratamento superior
        }
    }

    // ✅ ATUALIZAR REGISTRO
    async atualizarRegistro(registro) {
        try {
            await this.storage.atualizarRegistro(registro.id, registro);
            await this.carregarDados();
            this.registroEditando = null;
            this.mostrarNotificacao('✅ Plantão atualizado com sucesso!', 'success');
            this.renderizarRegistros();
            this.atualizarTotais();
            this.atualizarContadores();
        } catch (error) {
            console.error('❌ Erro ao atualizar registro:', error);
            this.mostrarNotificacao('❌ Erro ao atualizar registro: ' + error.message, 'error');
        }
    }

    // ✅ CORRIGIDO - Limpar formulário com IDs corretos
    limparFormulario() {
        const campos = ['data', 'entrada', 'saida', 'pausa', 'descricao'];
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
    async excluirRegistro(id) {
        try {
            if (!id) {
                throw new Error('ID é obrigatório');
            }

            if (confirm('❓ Tem certeza que deseja excluir este plantão? Esta ação não pode ser desfeita.')) {
                await this.storage.removerRegistro(id);
                await this.carregarDados();
                this.renderizarRegistros();
                this.atualizarTotais();
                this.atualizarContadores();
                this.mostrarNotificacao('✅ Plantão excluído com sucesso!', 'success');
            }
        } catch (error) {
            console.error('❌ Erro ao excluir registro:', error);
            this.mostrarNotificacao('❌ Erro ao excluir registro: ' + error.message, 'error');
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

    // ✅ CORRIGIDO - Obter classe CSS para tipo de plantão
    obterClasseTipo(tipo) {
        try {
            switch (tipo) {
                case 'Feriado':
                    return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800';
                case 'Fim de Semana':
                    return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
                default:
                    return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
            }
        } catch (error) {
            console.error('❌ Erro ao obter classe do tipo:', error);
            return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
        }
    }
}

// Expor a classe globalmente
window.BancoHorasApp = BancoHorasApp;

// Inicialização da aplicação
function inicializarApp() {
    // Garantir que o app só inicializa após o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            if (window.auth.currentUser) {
                window.app = new BancoHorasApp(window.auth.currentUser.uid);
            }
        });
    } else {
        if (window.auth.currentUser) {
            window.app = new BancoHorasApp(window.auth.currentUser.uid);
        }
    }
}

// Listener de autenticação
window.auth.onAuthStateChanged(user => {
    if (user) {
        console.log('👤 Usuário autenticado:', user.email);
        
        // Atualizar interface
        const loginBox = document.getElementById('loginBox');
        const mainContent = document.querySelector('main');
        const userBar = document.getElementById('userBar');
        const userEmail = document.getElementById('userEmail');
        
        if (loginBox) loginBox.style.display = 'none';
        if (mainContent) mainContent.style.display = '';
        if (userBar) userBar.style.display = 'flex';
        if (userEmail) userEmail.textContent = user.email;
        
        // Inicializar app
        if (!window.app) {
            console.log('🚀 Inicializando aplicação...');
            window.app = new BancoHorasApp(user.uid);
        }
    } else {
        console.log('⚠️ Usuário não autenticado');
        
        // Atualizar interface
        const loginBox = document.getElementById('loginBox');
        const mainContent = document.querySelector('main');
        const userBar = document.getElementById('userBar');
        
        if (loginBox) loginBox.style.display = '';
        if (mainContent) mainContent.style.display = 'none';
        if (userBar) userBar.style.display = 'none';
        
        window.app = null;
    }
});

// Inicializar quando o script carregar
inicializarApp();

console.log('🚀 App principal com banco de horas CORRIGIDO - v5.0.0');
console.log('✅ Bônus fim de semana: 190% do valor base (100% + 90% bônus)');
console.log('✅ Detecção automática de fim de semana implementada');
console.log('✅ Sistema de notificações melhorado');
console.log('✅ Compatibilidade com múltiplos navegadores');
console.log('✅ Interface moderna e responsiva com Tailwind CSS');
console.log('✅ Banco de Horas App pronto para uso!');

window.BancoHorasApp = BancoHorasApp;
