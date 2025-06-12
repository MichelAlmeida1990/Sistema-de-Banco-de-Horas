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
                                        title="Remover registro">
                
