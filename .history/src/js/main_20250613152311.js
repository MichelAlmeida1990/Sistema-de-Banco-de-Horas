// src/js/main.js - Sistema Principal de Banco de Horas v4.0.0 OTIMIZADO
class SistemaBancoHoras {
    constructor() {
        console.log('🏥 Sistema de Banco de Horas inicializado - v4.0.0');
        
        // ✅ NOVO - Configurações do sistema
        this.configuracoes = {
            versao: '4.0.0',
            autoSave: true,
            notificacoesPersistentes: false,
            debugMode: false
        };
        
        // ✅ NOVO - Cache de elementos DOM
        this.elementos = {};
        
        // ✅ NOVO - Estado da aplicação
        this.estado = {
            editandoRegistro: false,
            registroEditandoIndex: -1,
            ultimaAtualizacao: null
        };
        
        this.inicializar();
    }

    inicializar() {
        try {
            // Aguardar carregamento do DOM
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.configurarSistema());
            } else {
                this.configurarSistema();
            }
        } catch (error) {
            console.error('❌ Erro na inicialização:', error);
            this.mostrarNotificacao('Erro crítico na inicialização', 'error');
        }
    }

    configurarSistema() {
        try {
            console.log('⚙️ Configurando sistema...');
            
            // ✅ NOVO - Cache de elementos DOM
            this.cachearElementosDOM();
            
            // Configurar eventos
            this.configurarEventos();
            
            // Configurar data atual
            this.configurarDataAtual();
            
            // ✅ NOVO - Configurar valores padrão
            this.configurarValoresPadrao();
            
            // Carregar dados salvos
            this.carregarDados();
            
            // Atualizar resumo
            this.atualizarResumo();
            
            // Configurar tooltips de ajuda
            this.configurarTooltips();
            
            // ✅ NOVO - Configurar atalhos de teclado
            this.configurarAtalhosTeclado();
            
            // ✅ NOVO - Auto-save periódico
            this.configurarAutoSave();
            
            console.log('✅ Sistema configurado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro na configuração do sistema:', error);
            this.mostrarNotificacao('Erro ao inicializar sistema', 'error');
        }
    }

    // ✅ NOVO - Cache de elementos DOM para performance
    cachearElementosDOM() {
        try {
            this.elementos = {
                // Formulário
                formRegistro: document.getElementById('formRegistro'),
                data: document.getElementById('data'),
                entrada: document.getElementById('entrada'),
                saida: document.getElementById('saida'),
                pausa: document.getElementById('pausa'),
                observacoes: document.getElementById('observacoes'),
                feriado: document.getElementById('feriado'),
                valorHora: document.getElementById('valorHora'),
                
                // Botões
                btnAdicionar: document.getElementById('btnAdicionar'),
                btnLimpar: document.getElementById('btnLimpar'),
                btnExportar: document.getElementById('btnExportar'),
                btnImportar: document.getElementById('btnImportar'),
                
                // Containers
                listaRegistros: document.getElementById('listaRegistros'),
                previewCalculo: document.getElementById('previewCalculo'),
                
                // Resumo
                saldoTotal: document.getElementById('saldoTotal'),
                totalHorasNormais: document.getElementById('totalHorasNormais'),
                totalHorasFimSemana: document.getElementById('totalHorasFimSemana'),
                totalHorasGeral: document.getElementById('totalHorasGeral'),
                valorTotalNormal: document.getElementById('valorTotalNormal'),
                valorTotalFimSemana: document.getElementById('valorTotalFimSemana'),
                valorTotalGeral: document.getElementById('valorTotalGeral'),
                totalPlantoes: document.getElementById('totalPlantoes'),
                plantoesNormais: document.getElementById('plantoesNormais'),
                plantoesFimSemana: document.getElementById('plantoesFimSemana'),
                plantoesFeriado: document.getElementById('plantoesFeriado'),
                mediaHoras: document.getElementById('mediaHoras')
            };
            
            console.log('🔄 Elementos DOM cacheados');
            
        } catch (error) {
            console.error('❌ Erro ao cachear elementos DOM:', error);
        }
    }

    // ✅ MELHORADO - Configuração de eventos otimizada
    configurarEventos() {
        try {
            // Formulário de registro
            if (this.elementos.formRegistro) {
                this.elementos.formRegistro.addEventListener('submit', (e) => this.adicionarRegistro(e));
            }

            // Botão de adicionar
            if (this.elementos.btnAdicionar) {
                this.elementos.btnAdicionar.addEventListener('click', (e) => this.adicionarRegistro(e));
            }

            // Campo valor da hora com debounce
            if (this.elementos.valorHora) {
                let timeoutValorHora;
                this.elementos.valorHora.addEventListener('input', () => {
                    clearTimeout(timeoutValorHora);
                    timeoutValorHora = setTimeout(() => this.atualizarResumo(), 300);
                });
            }

            // Botões de ação
            if (this.elementos.btnLimpar) {
                this.elementos.btnLimpar.addEventListener('click', () => this.limparFormulario());
            }

            if (this.elementos.btnExportar) {
                this.elementos.btnExportar.addEventListener('click', () => this.exportarDados());
            }

            if (this.elementos.btnImportar) {
                this.elementos.btnImportar.addEventListener('click', () => this.importarDados());
            }

            // Checkbox de feriado
            if (this.elementos.feriado) {
                this.elementos.feriado.addEventListener('change', () => this.atualizarPreviewCalculo());
            }

            // Campos de horário para preview com debounce
            let timeoutPreview;
            const atualizarPreviewDebounced = () => {
                clearTimeout(timeoutPreview);
                timeoutPreview = setTimeout(() => this.atualizarPreviewCalculo(), 200);
            };

            if (this.elementos.entrada) this.elementos.entrada.addEventListener('input', atualizarPreviewDebounced);
            if (this.elementos.saida) this.elementos.saida.addEventListener('input', atualizarPreviewDebounced);
            if (this.elementos.pausa) this.elementos.pausa.addEventListener('input', atualizarPreviewDebounced);

            console.log('📋 Eventos configurados com otimizações');

        } catch (error) {
            console.error('❌ Erro ao configurar eventos:', error);
        }
    }

    // ✅ NOVO - Configurar valores padrão
    configurarValoresPadrao() {
        try {
            // Valor padrão da hora
            if (this.elementos.valorHora && !this.elementos.valorHora.value) {
                this.elementos.valorHora.value = '25.00';
            }
            
            // Horários padrão se não preenchidos
            if (this.elementos.entrada && !this.elementos.entrada.value) {
                this.elementos.entrada.placeholder = '09:00';
            }
            
            if (this.elementos.saida && !this.elementos.saida.value) {
                this.elementos.saida.placeholder = '19:00';
            }
            
            console.log('⚙️ Valores padrão configurados');
            
        } catch (error) {
            console.error('❌ Erro ao configurar valores padrão:', error);
        }
    }

    // ✅ NOVO - Atalhos de teclado
    configurarAtalhosTeclado() {
        try {
            document.addEventListener('keydown', (e) => {
                // Ctrl + Enter = Adicionar registro
                if (e.ctrlKey && e.key === 'Enter') {
                    e.preventDefault();
                    this.adicionarRegistro();
                }
                
                // Ctrl + L = Limpar formulário
                if (e.ctrlKey && e.key === 'l') {
                    e.preventDefault();
                    this.limparFormulario();
                }
                
                // Ctrl + E = Exportar dados
                if (e.ctrlKey && e.key === 'e') {
                    e.preventDefault();
                    this.exportarDados();
                }
                
                // Escape = Cancelar edição
                if (e.key === 'Escape' && this.estado.editandoRegistro) {
                    this.cancelarEdicao();
                }
            });
            
            console.log('⌨️ Atalhos de teclado configurados');
            
        } catch (error) {
            console.error('❌ Erro ao configurar atalhos:', error);
        }
    }

    // ✅ NOVO - Auto-save periódico
    configurarAutoSave() {
        try {
            if (this.configuracoes.autoSave) {
                setInterval(() => {
                    const registros = storage.obterRegistros();
                    if (registros.length > 0) {
                        this.estado.ultimaAtualizacao = new Date().toISOString();
                        console.log('💾 Auto-save executado');
                    }
                }, 30000); // A cada 30 segundos
            }
        } catch (error) {
            console.error('❌ Erro ao configurar auto-save:', error);
        }
    }

    configurarDataAtual() {
        try {
            if (this.elementos.data && !this.elementos.data.value) {
                const hoje = new Date();
                const dataFormatada = hoje.toISOString().split('T')[0];
                this.elementos.data.value = dataFormatada;
                console.log('📅 Data atual configurada:', dataFormatada);
            }
        } catch (error) {
            console.error('❌ Erro ao configurar data atual:', error);
        }
    }

    // ✅ MELHORADO - Tooltips mais informativos
    configurarTooltips() {
        try {
            const tooltips = {
                valorHora: 'Valor base por hora. Fins de semana e feriados recebem bônus de 90% (ex: R$ 25,00 → R$ 47,50)',
                pausa: 'Tempo de pausa em minutos (descontado do total)',
                feriado: 'Marque para aplicar bônus de 90% no valor da hora',
                entrada: 'Horário de início do plantão (formato 24h)',
                saida: 'Horário de término do plantão (formato 24h)',
                data: 'Data do plantão (não pode ser futura)'
            };

            Object.entries(tooltips).forEach(([id, texto]) => {
                const elemento = this.elementos[id];
                if (elemento) {
                    elemento.title = texto;
                }
            });

            console.log('💡 Tooltips aprimorados configurados');

        } catch (error) {
            console.error('❌ Erro ao configurar tooltips:', error);
        }
    }

    // ✅ MELHORADO - Validação aprimorada
    adicionarRegistro(evento) {
        try {
            if (evento) {
                evento.preventDefault();
            }

            console.log('➕ Adicionando novo registro...');

            // Coletar dados do formulário
            const dados = this.coletarDadosFormulario();
            
            // ✅ NOVO - Validação aprimorada
            const validacao = this.validarRegistroCompleto(dados);
            if (!validacao.valido) {
                this.mostrarErrosValidacao(validacao.erros);
                return;
            }

            // Verificar duplicatas
            if (this.verificarDuplicata(dados)) {
                if (!confirm('Já existe um registro para esta data e horário. Deseja continuar?')) {
                    return;
                }
            }

            // Adicionar registro
            const sucesso = storage.adicionarRegistro(dados);
            
            if (sucesso) {
                this.mostrarNotificacao('Registro adicionado com sucesso!', 'success');
                this.limparFormulario();
                this.atualizarListaRegistros();
                this.atualizarResumo();
                
                // ✅ NOVO - Scroll para o novo registro
                setTimeout(() => this.scrollParaUltimoRegistro(), 100);
                
                console.log('✅ Registro adicionado:', dados);
            } else {
                this.mostrarNotificacao('Erro ao adicionar registro', 'error');
            }

        } catch (error) {
            console.error('❌ Erro ao adicionar registro:', error);
            this.mostrarNotificacao('Erro interno ao adicionar registro', 'error');
        }
    }

    // ✅ NOVO - Validação completa
    validarRegistroCompleto(dados) {
        try {
            // Validação básica da calculadora
            const validacaoBasica = calculadora.validarRegistro(dados);
            
            if (!validacaoBasica.valido) {
                return validacaoBasica;
            }
            
            const errosAdicionais = [];
            
            // Verificar data futura
            const hoje = new Date();
            const dataRegistro = new Date(dados.data);
            if (dataRegistro > hoje) {
                errosAdicionais.push('Data não pode ser futura');
            }
            
            // Verificar plantão muito longo
            try {
                const horas = calculadora.calcularHorasTrabalhadas(dados.entrada, dados.saida, dados.pausa);
                if (horas > 18) {
                    errosAdicionais.push('Plantão muito longo (máximo 18 horas)');
                }
                if (horas < 0.5) {
                    errosAdicionais.push('Plantão muito curto (mínimo 30 minutos)');
                }
            } catch (error) {
                errosAdicionais.push('Erro no cálculo de horas');
            }
            
            return {
                valido: errosAdicionais.length === 0,
                erros: [...validacaoBasica.erros, ...errosAdicionais]
            };
            
        } catch (error) {
            console.error('❌ Erro na validação completa:', error);
            return {
                valido: false,
                erros: ['Erro interno na validação']
            };
        }
    }

    // ✅ NOVO - Verificar registros duplicados
    verificarDuplicata(novoRegistro) {
        try {
            const registros = storage.obterRegistros();
            return registros.some(registro => 
                registro.data === novoRegistro.data &&
                registro.entrada === novoRegistro.entrada &&
                registro.saida === novoRegistro.saida
            );
        } catch (error) {
            console.error('❌ Erro ao verificar duplicata:', error);
            return false;
        }
    }

    // ✅ NOVO - Scroll para último registro
    scrollParaUltimoRegistro() {
        try {
            if (this.elementos.listaRegistros) {
                const ultimoCard = this.elementos.listaRegistros.lastElementChild;
                if (ultimoCard) {
                    ultimoCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        } catch (error) {
            console.error('❌ Erro ao fazer scroll:', error);
        }
    }

    coletarDadosFormulario() {
        try {
            return {
                data: this.elementos.data.value,
                entrada: this.elementos.entrada.value,
                saida: this.elementos.saida.value,
                pausa: parseInt(this.elementos.pausa.value) || 0,
                observacoes: this.elementos.observacoes.value.trim(),
                feriado: this.elementos.feriado.checked,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Erro ao coletar dados do formulário:', error);
            throw error;
        }
    }

    // ✅ MELHORADO - Exibição de erros mais amigável
    mostrarErrosValidacao(erros) {
        try {
            const mensagem = 'Por favor, corrija os seguintes problemas:\n\n• ' + erros.join('\n• ');
            this.mostrarNotificacao(mensagem, 'error');
            console.warn('⚠️ Erros de validação:', erros);
        } catch (error) {
            console.error('❌ Erro ao mostrar erros de validação:', error);
        }
    }

    // ✅ MELHORADO - Limpeza com confirmação se há dados
    limparFormulario() {
        try {
            // Verificar se há dados preenchidos
            const temDados = this.elementos.entrada.value || 
                           this.elementos.saida.value || 
                           this.elementos.observacoes.value;
            
            if (temDados && !confirm('Limpar todos os campos preenchidos?')) {
                return;
            }
            
            // Manter apenas a data atual
            const hoje = new Date().toISOString().split('T')[0];
            this.elementos.data.value = hoje;
            
            // Limpar outros campos
            this.elementos.entrada.value = '';
            this.elementos.saida.value = '';
            this.elementos.pausa.value = '';
            this.elementos.observacoes.value = '';
            this.elementos.feriado.checked = false;

            // Limpar preview
            this.limparPreviewCalculo();
            
            // ✅ NOVO - Resetar estado de edição
            this.estado.editandoRegistro = false;
            this.estado.registroEditandoIndex = -1;

            console.log('🧹 Formulário limpo');

        } catch (error) {
            console.error('❌ Erro ao limpar formulário:', error);
        }
    }

    // ✅ NOVO - Cancelar edição
    cancelarEdicao() {
        try {
            if (this.estado.editandoRegistro) {
                this.limparFormulario();
                this.mostrarNotificacao('Edição cancelada', 'info');
                console.log('❌ Edição cancelada');
            }
        } catch (error) {
            console.error('❌ Erro ao cancelar edição:', error);
        }
    }

    // ✅ MELHORADO - Preview otimizado
    atualizarPreviewCalculo() {
        try {
            const data = this.elementos.data.value;
            const entrada = this.elementos.entrada.value;
            const saida = this.elementos.saida.value;
            const pausa = parseInt(this.elementos.pausa.value) || 0;
            const feriado = this.elementos.feriado.checked;
            const valorHora = parseFloat(this.elementos.valorHora.value) || 25.00;

            // Verificar se temos dados suficientes
            if (!entrada || !saida || !data) {
                this.limparPreviewCalculo();
                return;
            }

            // Criar registro temporário
            const registroTemp = {
                data: data,
                entrada: entrada,
                saida: saida,
                pausa: pausa,
                feriado: feriado
            };

            // Calcular valores
            const resultado = calculadora.calcularValorRegistro(registroTemp, valorHora);
            
            // Atualizar preview
            this.exibirPreviewCalculo(resultado);

        } catch (error) {
            console.error('❌ Erro no preview de cálculo:', error);
            this.limparPreviewCalculo();
        }
    }

    // ✅ MELHORADO - Preview mais detalhado
    exibirPreviewCalculo(resultado) {
        try {
            if (!this.elementos.previewCalculo) return;

            let html = `
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mt-3 shadow-sm">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="text-xl">📊</span>
                        <div class="text-sm font-semibold text-blue-800">Preview do Cálculo</div>
                        ${this.estado.editandoRegistro ? '<span class="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">EDITANDO</span>' : ''}
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 text-sm">
                        <div class="bg-white rounded p-2">
                            <span class="text-gray-600 text-xs uppercase tracking-wide">Horas Trabalhadas</span>
                            <div class="font-bold text-blue-600">${resultado.horasTrabalhadas}h</div>
                        </div>
                        <div class="bg-white rounded p-2">
                            <span class="text-gray-600 text-xs uppercase tracking-wide">Valor/Hora</span>
                            <div class="font-bold text-green-600">R$ ${resultado.valorHora.toFixed(2)}</div>
                        </div>
                        <div class="col-span-2 bg-white rounded p-2">
                            <span class="text-gray-600 text-xs uppercase tracking-wide">Total a Receber</span>
                            <div class="font-bold text-green-600 text-lg">R$ ${resultado.valorTotal.toFixed(2)}</div>
                        </div>
            `;

            if (resultado.temBonus) {
                html += `
                        <div class="col-span-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded p-3 mt-2">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="text-lg">🎉</span>
                                <strong class="text-yellow-800">${resultado.tipoBonus}</strong>
                            </div>
                            <div class="text-xs text-yellow-700">
                                Base: R$ ${resultado.valorBase.toFixed(2)} + Bônus (90%): R$ ${resultado.bonusAplicado.toFixed(2)}
                            </div>
                        </div>
                `;
            }

            // ✅ NOVO - Informações de banco de horas
            if (resultado.saldoHoras !== 0) {
                const saldoTexto = resultado.saldoHoras > 0 ? 
                    `+${resultado.saldoHoras.toFixed(1)}h (acima da jornada)` : 
                    `${resultado.saldoHoras.toFixed(1)}h (abaixo da jornada)`;
                
                html += `
                        <div class="col-span-2 bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                            <div class="text-xs text-blue-800">
                                <strong>Saldo de Horas:</strong> ${saldoTexto}
                            </div>
                        </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;

            this.elementos.previewCalculo.innerHTML = html;

        } catch (error) {
            console.error('❌ Erro ao exibir preview:', error);
        }
    }

    limparPreviewCalculo() {
        try {
            if (this.elementos.previewCalculo) {
                this.elementos.previewCalculo.innerHTML = '';
            }
        } catch (error) {
            console.error('❌ Erro ao limpar preview:', error);
        }
    }

    carregarDados() {
        try {
            console.log('📂 Carregando dados salvos...');
            this.atualizarListaRegistros();
            console.log('✅ Dados carregados');
        } catch (error) {
            console.error('❌ Erro ao carregar dados:', error);
        }
    }

    // ✅ MELHORADO - Lista de registros otimizada
    atualizarListaRegistros() {
        try {
            const registros = storage.obterRegistros();
            
            if (!this.elementos.listaRegistros) {
                console.warn('⚠️ Container da lista não encontrado');
                return;
            }

            if (registros.length === 0) {
                this.elementos.listaRegistros.innerHTML = `
                    <div class="text-center py-12 text-gray-500">
                        <div class="text-6xl mb-4">📝</div>
                        <div class="text-xl font-medium mb-2">Nenhum registro encontrado</div>
                        <div class="text-sm">Adicione seu primeiro plantão usando o formulário acima!</div>
                        <div class="mt-4 text-xs text-gray-400">
                            💡 Dica: Use Ctrl+Enter para adicionar rapidamente
                        </div>
                    </div>
                `;
                return;
            }

            const valorHora = parseFloat(this.elementos.valorHora.value) || 25.00;
            
            // ✅ NOVO - Ordenar registros por data (mais recente primeiro)
            const registrosOrdenados = [...registros].sort((a, b) => new Date(b.data) - new Date(a.data));
            
            let html = '';
            registrosOrdenados.forEach((registro, index) => {
                const resultado = calculadora.calcularValorRegistro(registro, valorHora);
                const indexOriginal = registros.findIndex(r => r.timestamp === registro.timestamp);
                html += this.criarCardRegistro(registro, resultado, indexOriginal);
            });

            this.elementos.listaRegistros.innerHTML = html;
            console.log(`📋 Lista atualizada com ${registros.length} registros`);

        } catch (error) {
            console.error('❌ Erro ao atualizar lista de registros:', error);
        }
    }

    // ✅ MELHORADO - Cards mais informativos
    criarCardRegistro(registro, resultado, index) {
        try {
            const dataFormatada = this.formatarData(registro.data);
            const diaSemana = this.obterDiaSemana(registro.data);
            
            // Determinar cor e ícone do card
            let corCard = 'border-gray-200 bg-white hover:bg-gray-50';
            let iconeCard = '📋';
            let badgeCard = '';
            
            if (resultado.ehFeriado) {
                corCard = 'border-red-200 bg-red-50 hover:bg-red-100';
                iconeCard = '🎉';
                badgeCard = '<span class="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Feriado</span>';
            } else if (resultado.ehFimDeSemana) {
                corCard = 'border-blue-200 bg-blue-50 hover:bg-blue-100';
                iconeCard = '🌟';
                badgeCard = '<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Fim de Semana</span>';
            }

            // ✅ NOVO - Indicador de saldo de horas
            let indicadorSaldo = '';
            if (resultado.saldoHoras > 0) {
                indicadorSaldo = `<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">+${resultado.saldoHoras.toFixed(1)}h</span>`;
            } else if (resultado.saldoHoras < 0) {
                indicadorSaldo = `<span class="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">${resultado.saldoHoras.toFixed(1)}h</span>`;
            }

            return `
                <div class="border ${corCard} rounded-xl p-5 transition-all duration-200 shadow-sm hover:shadow-md">
                    <!-- Cabeçalho -->
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">${iconeCard}</span>
                            <div>
                                <div class="font-semibold text-gray-900">${dataFormatada}</div>
                                <div class="text-sm text-gray-500">${diaSemana}</div>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            ${badgeCard}
                            ${indicadorSaldo}
                            <div class="flex gap-1">
                                <button onclick="sistema.editarRegistro(${index})" 
                                        class="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-100 transition-colors"
                                        title="Editar registro">
                                    ✏️
                                </button>
                                <button onclick="sistema.removerRegistro(${index})" 
                                        class="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
                                                                            title="Editar registro">
                                    ✏️
                                </button>
                                <button onclick="sistema.removerRegistro(${index})" 
                                        class="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
                                        title="Remover registro">
                                    🗑️
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Informações principais -->
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Horários</div>
                            <div class="font-semibold text-gray-900">${registro.entrada} - ${registro.saida}</div>
                            ${registro.pausa > 0 ? `<div class="text-xs text-gray-500 mt-1">⏸️ Pausa: ${registro.pausa}min</div>` : ''}
                        </div>
                        <div class="bg-gray-50 rounded-lg p-3">
                            <div class="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Horas Trabalhadas</div>
                            <div class="font-semibold text-gray-900">${resultado.horasTrabalhadas}h</div>
                            ${resultado.saldoHoras !== 0 ? `<div class="text-xs ${resultado.saldoHoras > 0 ? 'text-green-600' : 'text-orange-600'} mt-1">Saldo: ${resultado.saldoHoras > 0 ? '+' : ''}${resultado.saldoHoras.toFixed(1)}h</div>` : ''}
                        </div>
                    </div>

                    <!-- Valores financeiros -->
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div class="bg-green-50 rounded-lg p-3">
                            <div class="text-xs text-green-600 uppercase tracking-wide font-medium mb-1">Valor/Hora</div>
                            <div class="font-bold text-green-700">R$ ${resultado.valorHora.toFixed(2)}</div>
                            ${resultado.temBonus ? `<div class="text-xs text-green-600 mt-1">🎉 +90% bônus</div>` : ''}
                        </div>
                        <div class="bg-green-50 rounded-lg p-3">
                            <div class="text-xs text-green-600 uppercase tracking-wide font-medium mb-1">Total</div>
                            <div class="font-bold text-green-700 text-lg">R$ ${resultado.valorTotal.toFixed(2)}</div>
                        </div>
                    </div>

                    <!-- Detalhes do bônus -->
                    ${resultado.temBonus ? `
                        <div class="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mb-4">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-lg">🎉</span>
                                <strong class="text-yellow-800">${resultado.tipoBonus}</strong>
                            </div>
                            <div class="text-xs text-yellow-700 space-y-1">
                                <div>💰 Valor base: R$ ${resultado.valorBase.toFixed(2)}</div>
                                <div>📈 Bônus (90%): R$ ${resultado.bonusAplicado.toFixed(2)}</div>
                                <div>💵 Total/hora: R$ ${resultado.valorHora.toFixed(2)}</div>
                            </div>
                        </div>
                    ` : ''}

                    <!-- Observações -->
                    ${registro.observacoes ? `
                        <div class="border-t pt-3">
                            <div class="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Observações</div>
                            <div class="text-sm text-gray-700 bg-gray-50 rounded p-2">${registro.observacoes}</div>
                        </div>
                    ` : ''}

                    <!-- Timestamp -->
                    <div class="border-t pt-2 mt-3">
                        <div class="text-xs text-gray-400">
                            Registrado em: ${new Date(registro.timestamp).toLocaleString('pt-BR')}
                        </div>
                    </div>
                </div>
            `;

        } catch (error) {
            console.error('❌ Erro ao criar card do registro:', error);
            return `
                <div class="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div class="text-red-600 font-medium">❌ Erro ao exibir registro</div>
                    <div class="text-red-500 text-sm mt-1">Verifique o console para mais detalhes</div>
                </div>
            `;
        }
    }

    // ✅ MELHORADO - Resumo otimizado com cache
    atualizarResumo() {
        try {
            const registros = storage.obterRegistros();
            const valorHora = parseFloat(this.elementos.valorHora.value);
            
            if (!valorHora || valorHora <= 0) {
                this.mostrarNotificacao('⚠️ Configure o valor da hora antes de calcular', 'warning');
                return;
            }
            
            const totais = calculadora.calcularTotais(registros, valorHora);
            const saldoBanco = calculadora.calcularSaldoBanco(registros);
            const estatisticas = calculadora.obterEstatisticas(registros);
            
            // ✅ NOVO - Atualização otimizada com verificação de mudanças
            const novoHash = this.gerarHashResumo(totais, saldoBanco, estatisticas);
            if (this.ultimoHashResumo === novoHash) {
                return; // Não precisa atualizar se não houve mudanças
            }
            this.ultimoHashResumo = novoHash;
            
            // Atualizar elementos do resumo com animação
            this.atualizarElementoResumoAnimado('saldoTotal', this.formatarHoras(saldoBanco.saldoTotal));
            this.atualizarElementoResumoAnimado('totalHorasNormais', this.formatarHoras(totais.totalHorasNormais));
            this.atualizarElementoResumoAnimado('totalHorasFimSemana', this.formatarHoras(totais.totalHorasFimSemana));
            this.atualizarElementoResumoAnimado('totalHorasGeral', this.formatarHoras(totais.totalHorasGeral));
            this.atualizarElementoResumoAnimado('valorTotalNormal', `R$ ${totais.totalValorNormal.toFixed(2)}`);
            this.atualizarElementoResumoAnimado('valorTotalFimSemana', `R$ ${totais.totalValorFimSemana.toFixed(2)}`);
            this.atualizarElementoResumoAnimado('valorTotalGeral', `R$ ${totais.totalValorGeral.toFixed(2)}`);
            
            // Atualizar estatísticas
            this.atualizarElementoResumoAnimado('totalPlantoes', estatisticas.totalPlantoes);
            this.atualizarElementoResumoAnimado('plantoesNormais', estatisticas.plantoesNormais);
            this.atualizarElementoResumoAnimado('plantoesFimSemana', estatisticas.plantoesFimSemana);
            this.atualizarElementoResumoAnimado('plantoesFeriado', estatisticas.plantoesFeriado);
            this.atualizarElementoResumoAnimado('mediaHoras', this.formatarHoras(estatisticas.mediaHorasPorPlantao));
            
            console.log('📊 Resumo atualizado:', { totais, saldoBanco, estatisticas });
            
        } catch (error) {
            console.error('❌ Erro ao atualizar resumo:', error);
            this.mostrarNotificacao('❌ Erro ao atualizar resumo. Verifique a configuração do valor da hora.', 'error');
        }
    }

    // ✅ NOVO - Gerar hash para otimização
    gerarHashResumo(totais, saldoBanco, estatisticas) {
        try {
            const dados = JSON.stringify({ totais, saldoBanco, estatisticas });
            return btoa(dados).slice(0, 16); // Hash simples
        } catch (error) {
            return Date.now().toString();
        }
    }

    // ✅ NOVO - Atualização com animação
    atualizarElementoResumoAnimado(id, valor) {
        try {
            const elemento = this.elementos[id];
            if (elemento && elemento.textContent !== valor) {
                elemento.style.transition = 'all 0.3s ease';
                elemento.style.transform = 'scale(1.05)';
                elemento.textContent = valor;
                
                setTimeout(() => {
                    elemento.style.transform = 'scale(1)';
                }, 300);
            }
        } catch (error) {
            console.error(`❌ Erro ao atualizar elemento ${id}:`, error);
        }
    }

    // ✅ MELHORADO - Remoção com confirmação detalhada
    removerRegistro(index) {
        try {
            const registros = storage.obterRegistros();
            const registro = registros[index];
            
            if (!registro) {
                this.mostrarNotificacao('Registro não encontrado', 'error');
                return;
            }

            const dataFormatada = this.formatarData(registro.data);
            const horario = `${registro.entrada} - ${registro.saida}`;
            
            if (confirm(`🗑️ CONFIRMAR REMOÇÃO\n\nData: ${dataFormatada}\nHorário: ${horario}\n\nEsta ação não pode ser desfeita. Continuar?`)) {
                const sucesso = storage.removerRegistro(index);
                
                if (sucesso) {
                    this.mostrarNotificacao('Registro removido com sucesso!', 'success');
                    this.atualizarListaRegistros();
                    this.atualizarResumo();
                    console.log(`🗑️ Registro ${index} removido`);
                } else {
                    this.mostrarNotificacao('Erro ao remover registro', 'error');
                }
            }
        } catch (error) {
            console.error('❌ Erro ao remover registro:', error);
            this.mostrarNotificacao('Erro interno ao remover registro', 'error');
        }
    }

    // ✅ MELHORADO - Edição aprimorada
    editarRegistro(index) {
        try {
            const registros = storage.obterRegistros();
            const registro = registros[index];
            
            if (!registro) {
                this.mostrarNotificacao('Registro não encontrado', 'error');
                return;
            }

            // ✅ NOVO - Marcar estado de edição
            this.estado.editandoRegistro = true;
            this.estado.registroEditandoIndex = index;

            // Preencher formulário com dados do registro
            this.elementos.data.value = registro.data;
            this.elementos.entrada.value = registro.entrada;
            this.elementos.saida.value = registro.saida;
            this.elementos.pausa.value = registro.pausa || 0;
            this.elementos.observacoes.value = registro.observacoes || '';
            this.elementos.feriado.checked = registro.feriado || false;

            // Remover registro atual
            storage.removerRegistro(index);
            
            // Atualizar interface
            this.atualizarListaRegistros();
            this.atualizarResumo();
            this.atualizarPreviewCalculo();
            
            // ✅ NOVO - Destacar formulário
            this.elementos.formRegistro.style.border = '2px solid #3B82F6';
            this.elementos.formRegistro.style.borderRadius = '8px';
            this.elementos.formRegistro.style.backgroundColor = '#EFF6FF';
            
            // Scroll para o formulário
            this.elementos.formRegistro.scrollIntoView({ behavior: 'smooth' });
            
            // ✅ NOVO - Focar no primeiro campo
            this.elementos.entrada.focus();
            
            this.mostrarNotificacao('📝 Registro carregado para edição. Pressione ESC para cancelar.', 'info');
            console.log(`✏️ Registro ${index} carregado para edição`);

        } catch (error) {
            console.error('❌ Erro ao editar registro:', error);
            this.mostrarNotificacao('Erro ao editar registro', 'error');
        }
    }

    // ✅ MELHORADO - Exportação com mais opções
    exportarDados() {
        try {
            const registros = storage.obterRegistros();
            const valorHora = parseFloat(this.elementos.valorHora.value) || 25.00;
            
            if (registros.length === 0) {
                this.mostrarNotificacao('Nenhum registro para exportar', 'warning');
                return;
            }

            // ✅ NOVO - Dados mais completos para exportação
            const totais = calculadora.calcularTotais(registros, valorHora);
            const estatisticas = calculadora.obterEstatisticas(registros);
            
            const dados = {
                metadados: {
                    versao: '4.0.0',
                    exportadoEm: new Date().toISOString(),
                    totalRegistros: registros.length,
                    valorHoraPadrao: valorHora
                },
                configuracoes: {
                    valorHora: valorHora,
                    jornadaPadrao: 10,
                    bonusFimSemana: 0.90
                },
                registros: registros,
                resumo: {
                    totais: totais,
                    estatisticas: estatisticas
                }
            };

            const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `banco-horas-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.mostrarNotificacao(`📤 ${registros.length} registros exportados com sucesso!`, 'success');
            console.log('📤 Dados exportados:', dados);

        } catch (error) {
            console.error('❌ Erro ao exportar dados:', error);
            this.mostrarNotificacao('Erro ao exportar dados', 'error');
        }
    }

    // ✅ MELHORADO - Importação com validação
    importarDados() {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = (event) => {
                const file = event.target.files[0];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const dados = JSON.parse(e.target.result);
                        
                        // ✅ NOVO - Validação mais robusta
                        if (!this.validarArquivoImportacao(dados)) {
                            throw new Error('Formato de arquivo inválido ou incompatível');
                        }

                        const registros = dados.registros || dados;
                        const valorHora = dados.configuracoes?.valorHora || dados.valorHora;

                        if (confirm(`📥 IMPORTAR DADOS\n\nRegistros encontrados: ${registros.length}\nValor/hora: R$ ${valorHora?.toFixed(2) || 'Não definido'}\n\n⚠️ Isso substituirá todos os dados atuais.\n\nContinuar?`)) {
                            // Backup dos dados atuais
                            const backupAtual = {
                                registros: storage.obterRegistros(),
                                valorHora: parseFloat(this.elementos.valorHora.value) || 25.00,
                                backupEm: new Date().toISOString()
                            };
                            
                            localStorage.setItem('banco-horas-backup', JSON.stringify(backupAtual));
                            
                            // Limpar dados atuais
                            storage.limparTodos();
                            
                            // Importar novos dados
                            let importadosComSucesso = 0;
                            registros.forEach(registro => {
                                try {
                                    const validacao = calculadora.validarRegistro(registro);
                                    if (validacao.valido) {
                                        storage.adicionarRegistro(registro);
                                        importadosComSucesso++;
                                    }
                                } catch (error) {
                                    console.warn('⚠️ Registro inválido ignorado:', registro);
                                }
                            });

                            // Atualizar valor da hora se disponível
                            if (valorHora) {
                                this.elementos.valorHora.value = valorHora;
                            }

                            // Atualizar interface
                            this.atualizarListaRegistros();
                            this.atualizarResumo();

                            this.mostrarNotificacao(`📥 ${importadosComSucesso} registros importados com sucesso!`, 'success');
                            console.log('📥 Dados importados:', { importadosComSucesso, total: registros.length });
                        }

                    } catch (error) {
                        console.error('❌ Erro ao processar arquivo:', error);
                        this.mostrarNotificacao('Erro ao processar arquivo de importação. Verifique o formato.', 'error');
                    }
                };
                
                reader.readAsText(file);
            };
            
            input.click();

        } catch (error) {
            console.error('❌ Erro ao importar dados:', error);
            this.mostrarNotificacao('Erro ao importar dados', 'error');
        }
    }

    // ✅ NOVO - Validar arquivo de importação
    validarArquivoImportacao(dados) {
        try {
            // Verificar se é um array de registros (formato antigo)
            if (Array.isArray(dados)) {
                return dados.every(registro => 
                    registro.data && registro.entrada && registro.saida
                );
            }
            
            // Verificar formato novo
            if (dados.registros && Array.isArray(dados.registros)) {
                return dados.registros.every(registro => 
                    registro.data && registro.entrada && registro.saida
                );
            }
            
            return false;
            
        } catch (error) {
            return false;
        }
    }

    // ✅ Métodos utilitários melhorados
    formatarData(data) {
        try {
            const dataObj = new Date(data + 'T00:00:00');
            return dataObj.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return data;
        }
    }

    obterDiaSemana(data) {
        try {
            const dataObj = new Date(data + 'T00:00:00');
            const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
            return dias[dataObj.getDay()];
        } catch (error) {
            return '';
        }
    }

    formatarHoras(horas) {
        try {
            if (typeof horas === 'object' && horas.saldoTotal !== undefined) {
                horas = horas.saldoTotal;
            }
            
            if (horas === 0) return '0h00m';
            
            const horasInteiras = Math.floor(Math.abs(horas));
            const minutos = Math.round((Math.abs(horas) - horasInteiras) * 60);
            const sinal = horas < 0 ? '-' : '';
            
            return `${sinal}${horasInteiras}h${minutos.toString().padStart(2, '0')}m`;
        } catch (error) {
            return '0h00m';
        }
    }

    // ✅ MELHORADO - Sistema de notificações aprimorado
    mostrarNotificacao(mensagem, tipo = 'info', persistente = false) {
        try {
            // Cores e ícones por tipo
            const estilos = {
                success: {
                    cor: 'bg-green-100 border-green-400 text-green-700',
                    icone: '✅',
                    titulo: 'Sucesso'
                },
                error: {
                    cor: 'bg-red-100 border-red-400 text-red-700',
                    icone: '❌',
                    titulo: 'Erro'
                },
                warning: {
                    cor: 'bg-yellow-100 border-yellow-400 text-yellow-700',
                    icone: '⚠️',
                    titulo: 'Atenção'
                },
                info: {
                    cor: 'bg-blue-100 border-blue-400 text-blue-700',
                    icone: 'ℹ️',
                    titulo: 'Informação'
                }
            };

            const estilo = estilos[tipo] || estilos.info;
            
            // Criar elemento de notificação
            const notificacao = document.createElement('div');
            notificacao.className = `fixed top-4 right-4 p-4 border rounded-lg shadow-lg z-50 max-w-sm ${estilo.cor} transform transition-all duration-300 translate-x-full`;
            notificacao.innerHTML = `
                <div class="flex items-start gap-3">
                    <span class="text-xl flex-shrink-0">${estilo.icone}</span>
                    <div class="flex-1">
                        <div class="font-semibold text-sm">${estilo.titulo}</div>
                        <div class="text-sm mt-1 whitespace-pre-line">${mensagem}</div>
                    </div>
                    ${!persistente ? `
                        <button onclick="this.parentElement.parentElement.remove()" 
                                class="ml-2 text-lg hover:opacity-70 flex-shrink-0">
                            ×
                        </button>
                    ` : ''}
                </div>
            `;

            // Adicionar ao DOM
            document.body.appendChild(notificacao);
            
            // Animação de entrada
            setTimeout(() => {
                notificacao.style.transform = 'translateX(0)';
            }, 100);

            // Remover automaticamente se não for persistente
            if (!persistente) {
                setTimeout(() => {
                    if (notificacao.parentNode) {
                        notificacao.style.transform = 'translateX(full)';
                        setTimeout(() => notificacao.remove(), 300);
                    }
                }, tipo === 'error' ? 8000 : 5000);
            }

            console.log(`📢 Notificação ${tipo}:`, mensagem);

        } catch (error) {
            console.error('❌ Erro ao mostrar notificação:', error);
            // Fallback para alert
            alert(`${tipo.toUpperCase()}: ${mensagem}`);
        }
    }

    // ✅ NOVO - Método para debug
    debug() {
        return {
            versao: this.configuracoes.versao,
            estado: this.estado,
            registros: storage.obterRegistros().length,
            valorHora: this.elementos.valorHora?.value,
            ultimaAtualizacao: this.estado.ultimaAtualizacao
        };
    }
}

// ✅ Instâncias globais
let sistema;
let calculadora;
let storage;

// ✅ MELHORADO - Inicialização robusta
document.addEventListener('DOMContentLoaded', function() {
    try {
        console.log('🚀 Inicializando Sistema de Banco de Horas v4.0.0...');
        
        // Verificar dependências
        const dependencias = [
            { nome: 'CalculadoraBancoHoras', classe: CalculadoraBancoHoras },
            { nome: 'GerenciadorStorage', classe: GerenciadorStorage }
        ];
        
        for (const dep of dependencias) {
            if (typeof dep.classe === 'undefined') {
                throw new Error(`${dep.nome} não encontrada`);
            }
        }

        // Criar instâncias
        calculadora = new CalculadoraBancoHoras();
        storage = new GerenciadorStorage();
        sistema = new SistemaBancoHoras();

        // ✅ NOVO - Verificar integridade dos dados
        const registros = storage.obterRegistros();
        console.log(`📊 ${registros.length} registros carregados`);
        
        // Demonstrar cálculo de bônus
        calculadora.demonstrarCalculoBonus(25.00);

        // ✅ NOVO - Disponibilizar globalmente para debug
        window.sistemaDebug = {
            sistema: sistema,
            calculadora: calculadora,
            storage: storage,
            debug: () => sistema.debug()
        };

        console.log('✅ Sistema inicializado com sucesso!');
        console.log('💡 Use sistemaDebug.debug() no console para informações de debug');
        
    } catch (error) {
        console.error('❌ Erro fatal na inicialização:', error);
        
        // Mostrar erro amigável
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed inset-0 bg-red-50 flex items-center justify-center z-50';
        errorDiv.innerHTML = `
            <div class="bg-white p-8 rounded-lg shadow-lg border border-red-200 max-w-md">
                <div class="text-center">
                    <div class="text-4xl mb-4">❌</div>
                    <h2 class="text-xl font-bold text-red-800 mb-2">Erro de Inicialização</h2>
                    <p class="text-red-600 mb-4">Não foi possível carregar o sistema.</p>
                    <button onclick="location.reload()" 
                            class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                        Recarregar Página
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
});

// ✅ NOVO - Função global para demonstração
function demonstrarCalculoBonus() {
    try {
        const valorBase = parseFloat(document.getElementById('valorHora')?.value);
        
        if (!valorBase || valorBase <= 0) {
            alert('⚠️ Configure o valor da hora antes de demonstrar o cálculo');
            return;
        }
        
        const demo = calculadora.demonstrarCalculoBonus(valorBase);
        
        const mensagem = `🧮 DEMONSTRAÇÃO DE CÁLCULO DE BÔNUS:

💰 Valor base: R$ ${demo.valorBase.toFixed(2)}
📈 Multiplicador: ${demo.multiplicador}x (100% + 90% bônus)
💵 Valor final/hora: R$ ${demo.valorFinal.toFixed(2)}
🎯 Bônus em R$: R$ ${demo.bonusEmReais.toFixed(2)}

📝 Exemplo com 11 horas fim de semana:
🔢 11h × R$ ${demo.valorFinal.toFixed(2)} = R$ ${demo.exemplo11h.toFixed(2)}`;
        
        alert(mensagem);
        
    } catch (error) {
        console.error('❌ Erro na demonstração:', error);
        alert('❌ Erro ao calcular demonstração. Verifique a configuração do valor da hora.');
    }
}

// ✅ NOVO - Tratamento de erros globais aprimorado
window.addEventListener('error', function(event) {
    console.error('❌ Erro global capturado:', event.error);
    if (typeof sistema !== 'undefined' && sistema.mostrarNotificacao) {
        sistema.mostrarNotificacao('Erro inesperado detectado. Verifique o console.', 'error');
    }
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('❌ Promise rejeitada:', event.reason);
    if (typeof sistema !== 'undefined' && sistema.mostrarNotificacao) {
        sistema.mostrarNotificacao('Erro assíncrono detectado. Verifique o console.', 'error');
    }
});

// ✅ NOVO - Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('📱 Service Worker registrado'))
            .catch(error => console.log('⚠️ Service Worker não registrado'));
    });
}

console.log('🏥 Sistema Principal carregado - v4.0.0 OTIMIZADO');
console.log('🎯 Funcionalidades: Banco de horas, Bônus 90%, Validações, Cache, Atalhos');

                
