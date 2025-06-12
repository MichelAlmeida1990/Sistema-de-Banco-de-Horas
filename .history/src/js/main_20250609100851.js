// src/js/main.js - Sistema Principal de Banco de Horas v3.1.0
class SistemaBancoHoras {
    constructor() {
        console.log('🏥 Sistema de Banco de Horas inicializado - v3.1.0');
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
        }
    }

    configurarSistema() {
        try {
            console.log('⚙️ Configurando sistema...');
            
            // Configurar eventos
            this.configurarEventos();
            
            // Configurar data atual
            this.configurarDataAtual();
            
            // Carregar dados salvos
            this.carregarDados();
            
            // Atualizar resumo
            this.atualizarResumo();
            
            // Configurar tooltips de ajuda
            this.configurarTooltips();
            
            console.log('✅ Sistema configurado com sucesso!');
            
        } catch (error) {
            console.error('❌ Erro na configuração do sistema:', error);
            this.mostrarNotificacao('Erro ao inicializar sistema', 'error');
        }
    }

    configurarEventos() {
        try {
            // Formulário de registro
            const formRegistro = document.getElementById('formRegistro');
            if (formRegistro) {
                formRegistro.addEventListener('submit', (e) => this.adicionarRegistro(e));
            }

            // Botão de adicionar
            const btnAdicionar = document.getElementById('btnAdicionar');
            if (btnAdicionar) {
                btnAdicionar.addEventListener('click', (e) => this.adicionarRegistro(e));
            }

            // Campo valor da hora
            const valorHora = document.getElementById('valorHora');
            if (valorHora) {
                valorHora.addEventListener('input', () => this.atualizarResumo());
                valorHora.addEventListener('change', () => this.atualizarResumo());
            }

            // Botões de ação
            const btnLimpar = document.getElementById('btnLimpar');
            if (btnLimpar) {
                btnLimpar.addEventListener('click', () => this.limparFormulario());
            }

            const btnExportar = document.getElementById('btnExportar');
            if (btnExportar) {
                btnExportar.addEventListener('click', () => this.exportarDados());
            }

            const btnImportar = document.getElementById('btnImportar');
            if (btnImportar) {
                btnImportar.addEventListener('click', () => this.importarDados());
            }

            // Checkbox de feriado
            const feriado = document.getElementById('feriado');
            if (feriado) {
                feriado.addEventListener('change', () => this.atualizarPreviewCalculo());
            }

            // Campos de horário para preview
            const entrada = document.getElementById('entrada');
            const saida = document.getElementById('saida');
            const pausa = document.getElementById('pausa');

            if (entrada) entrada.addEventListener('input', () => this.atualizarPreviewCalculo());
            if (saida) saida.addEventListener('input', () => this.atualizarPreviewCalculo());
            if (pausa) pausa.addEventListener('input', () => this.atualizarPreviewCalculo());

            console.log('📋 Eventos configurados');

        } catch (error) {
            console.error('❌ Erro ao configurar eventos:', error);
        }
    }

    configurarDataAtual() {
        try {
            const campoData = document.getElementById('data');
            if (campoData && !campoData.value) {
                const hoje = new Date();
                const dataFormatada = hoje.toISOString().split('T')[0];
                campoData.value = dataFormatada;
                console.log('📅 Data atual configurada:', dataFormatada);
            }
        } catch (error) {
            console.error('❌ Erro ao configurar data atual:', error);
        }
    }

    configurarTooltips() {
        try {
            // Tooltip para valor da hora
            const valorHoraInput = document.getElementById('valorHora');
            if (valorHoraInput) {
                valorHoraInput.title = 'O valor da hora será aplicado a todos os cálculos. Fins de semana e feriados recebem bônus de 90% sobre o valor base (ex: R$ 50,00 + R$ 45,00 = R$ 95,00/hora).';
            }

            // Tooltip para pausa
            const pausaInput = document.getElementById('pausa');
            if (pausaInput) {
                pausaInput.title = 'Tempo de pausa em minutos (será descontado do total de horas trabalhadas)';
            }

            // Tooltip para feriado
            const feriadoInput = document.getElementById('feriado');
            if (feriadoInput) {
                feriadoInput.title = 'Marque se o plantão foi em feriado para aplicar bônus de 90%';
            }

            console.log('💡 Tooltips configurados');

        } catch (error) {
            console.error('❌ Erro ao configurar tooltips:', error);
        }
    }

    adicionarRegistro(evento) {
        try {
            if (evento) {
                evento.preventDefault();
            }

            console.log('➕ Adicionando novo registro...');

            // Coletar dados do formulário
            const dados = this.coletarDadosFormulario();
            
            // Validar dados
            const validacao = calculadora.validarRegistro(dados);
            if (!validacao.valido) {
                this.mostrarErrosValidacao(validacao.erros);
                return;
            }

            // Adicionar registro
            const sucesso = storage.adicionarRegistro(dados);
            
            if (sucesso) {
                this.mostrarNotificacao('Registro adicionado com sucesso!', 'success');
                this.limparFormulario();
                this.atualizarListaRegistros();
                this.atualizarResumo();
                console.log('✅ Registro adicionado:', dados);
            } else {
                this.mostrarNotificacao('Erro ao adicionar registro', 'error');
            }

        } catch (error) {
            console.error('❌ Erro ao adicionar registro:', error);
            this.mostrarNotificacao('Erro interno ao adicionar registro', 'error');
        }
    }

    coletarDadosFormulario() {
        try {
            const data = document.getElementById('data').value;
            const entrada = document.getElementById('entrada').value;
            const saida = document.getElementById('saida').value;
            const pausa = parseInt(document.getElementById('pausa').value) || 0;
            const observacoes = document.getElementById('observacoes').value.trim();
            const feriado = document.getElementById('feriado').checked;

            return {
                data: data,
                entrada: entrada,
                saida: saida,
                pausa: pausa,
                observacoes: observacoes,
                feriado: feriado,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('❌ Erro ao coletar dados do formulário:', error);
            throw error;
        }
    }

    mostrarErrosValidacao(erros) {
        try {
            const mensagem = 'Corrija os seguintes erros:\n\n' + erros.join('\n');
            this.mostrarNotificacao(mensagem, 'error');
            console.warn('⚠️ Erros de validação:', erros);
        } catch (error) {
            console.error('❌ Erro ao mostrar erros de validação:', error);
        }
    }

    limparFormulario() {
        try {
            // Manter apenas a data atual
            const hoje = new Date().toISOString().split('T')[0];
            document.getElementById('data').value = hoje;
            
            // Limpar outros campos
            document.getElementById('entrada').value = '';
            document.getElementById('saida').value = '';
            document.getElementById('pausa').value = '';
            document.getElementById('observacoes').value = '';
            document.getElementById('feriado').checked = false;

            // Limpar preview
            this.limparPreviewCalculo();

            console.log('🧹 Formulário limpo');

        } catch (error) {
            console.error('❌ Erro ao limpar formulário:', error);
        }
    }

    atualizarPreviewCalculo() {
        try {
            const data = document.getElementById('data').value;
            const entrada = document.getElementById('entrada').value;
            const saida = document.getElementById('saida').value;
            const pausa = parseInt(document.getElementById('pausa').value) || 0;
            const feriado = document.getElementById('feriado').checked;
            const valorHora = parseFloat(document.getElementById('valorHora').value) || 25.00;

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

    exibirPreviewCalculo(resultado) {
        try {
            const previewElement = document.getElementById('previewCalculo');
            if (!previewElement) return;

            let html = `
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <div class="text-sm font-medium text-blue-800 mb-2">📊 Preview do Cálculo</div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span class="text-gray-600">Horas:</span>
                            <span class="font-medium">${resultado.horasTrabalhadas}h</span>
                        </div>
                        <div>
                            <span class="text-gray-600">Valor/hora:</span>
                            <span class="font-medium">R$ ${resultado.valorHora.toFixed(2)}</span>
                        </div>
                        <div class="col-span-2">
                            <span class="text-gray-600">Total:</span>
                            <span class="font-bold text-green-600">R$ ${resultado.valorTotal.toFixed(2)}</span>
                        </div>
            `;

            if (resultado.temBonus) {
                html += `
                        <div class="col-span-2 mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                            <div class="text-xs text-yellow-800">
                                🎉 <strong>${resultado.tipoBonus}</strong> - Bônus de 90% aplicado!<br>
                                Base: R$ ${resultado.valorBase.toFixed(2)} + Bônus: R$ ${resultado.bonusAplicado.toFixed(2)}
                            </div>
                        </div>
                `;
            }

            html += `
                    </div>
                </div>
            `;

            previewElement.innerHTML = html;

        } catch (error) {
            console.error('❌ Erro ao exibir preview:', error);
        }
    }

    limparPreviewCalculo() {
        try {
            const previewElement = document.getElementById('previewCalculo');
            if (previewElement) {
                previewElement.innerHTML = '';
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

    atualizarListaRegistros() {
        try {
            const registros = storage.obterRegistros();
            const container = document.getElementById('listaRegistros');
            
            if (!container) {
                console.warn('⚠️ Container da lista não encontrado');
                return;
            }

            if (registros.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-500">
                        <div class="text-4xl mb-2">📝</div>
                        <div>Nenhum registro encontrado</div>
                        <div class="text-sm">Adicione seu primeiro plantão!</div>
                    </div>
                `;
                return;
            }

            const valorHora = parseFloat(document.getElementById('valorHora').value) || 25.00;
            
            let html = '';
            registros.forEach((registro, index) => {
                const resultado = calculadora.calcularValorRegistro(registro, valorHora);
                html += this.criarCardRegistro(registro, resultado, index);
            });

            container.innerHTML = html;
            console.log(`📋 Lista atualizada com ${registros.length} registros`);

        } catch (error) {
            console.error('❌ Erro ao atualizar lista de registros:', error);
        }
    }

    criarCardRegistro(registro, resultado, index) {
        try {
            const dataFormatada = this.formatarData(registro.data);
            const diaSemana = this.obterDiaSemana(registro.data);
            
            // Determinar cor do card baseado no tipo
            let corCard = 'border-gray-200 bg-white';
            let iconeCard = '📋';
            
            if (resultado.ehFeriado) {
                corCard = 'border-red-200 bg-red-50';
                iconeCard = '🎉';
            } else if (resultado.ehFimDeSemana) {
                corCard = 'border-blue-200 bg-blue-50';
                iconeCard = '🌟';
            }

            return `
                <div class="border ${corCard} rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="text-lg">${iconeCard}</span>
                                <div>
                                    <div class="font-medium text-gray-900">${dataFormatada}</div>
                                    <div class="text-sm text-gray-500">${diaSemana}</div>
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="sistema.editarRegistro(${index})" 
                                    class="text-blue-600 hover:text-blue-800 text-sm">
                                ✏️ Editar
                            </button>
                            <button onclick="sistema.removerRegistro(${index})" 
                                    class="text-red-600 hover:text-red-800 text-sm">
                                🗑️ Remover
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-3">
                        <div>
                            <div class="text-xs text-gray-500 uppercase tracking-wide">Horários</div>
                            <div class="font-medium">${registro.entrada} - ${registro.saida}</div>
                            ${registro.pausa > 0 ? `<div class="text-xs text-gray-500">Pausa: ${registro.pausa}min</div>` : ''}
                        </div>
                        <div>
                            <div class="text-xs text-gray-500 uppercase tracking-wide">Horas</div>
                            <div class="font-medium">${resultado.horasTrabalhadas}h</div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-3">
                        <div>
                            <div class="text-xs text-gray-500 uppercase tracking-wide">Valor/Hora</div>
                            <div class="font-medium">R$ ${resultado.valorHora.toFixed(2)}</div>
                            ${resultado.temBonus ? `<div class="text-xs text-green-600">+ Bônus 90%</div>` : ''}
                        </div>
                        <div>
                            <div class="text-xs text-gray-500 uppercase tracking-wide">Total</div>
                            <div class="font-bold text-green-600">R$ ${resultado.valorTotal.toFixed(2)}</div>
                        </div>
                    </div>

                    ${resultado.temBonus ? `
                        <div class="bg-yellow-50 border border-yellow-200 rounded p-2 mb-3">
                            <div class="text-xs text-yellow-800">
                                <strong>🎉 ${resultado.tipoBonus}</strong><br>
                                Base: R$ ${resultado.valorBase.toFixed(2)} + Bônus: R$ ${resultado.bonusAplicado.toFixed(2)}
                            </div>
                        </div>
                    ` : ''}

                    ${registro.observacoes ? `
                        <div class="border-t pt-2">
                            <div class="text-xs text-gray-500 uppercase tracking-wide">Observações</div>
                            <div class="text-sm text-gray-700">${registro.observacoes}</div>
                        </div>
                    ` : ''}
                </div>
            `;

        } catch (error) {
            console.error('❌ Erro ao criar card do registro:', error);
            return '<div class="p-4 border border-red-200 rounded-lg text-red-600">Erro ao exibir registro</div>';
        }
    }

    atualizarResumo() {
        try {
            const registros = storage.obterRegistros();
            const valorHora = parseFloat(document.getElementById('valorHora').value) || 25.00;
            
            const totais = calculadora.calcularTotais(registros, valorHora);
            const saldoBanco = calculadora.calcularSaldoBanco(registros);
            const estatisticas = calculadora.obterEstatisticas(registros);
            
            // Atualizar elementos do resumo
            this.atualizarElementoResumo('saldoTotal', this.formatarHoras(saldoBanco));
            this.atualizarElementoResumo('totalHorasNormais', this.formatarHoras(totais.totalHorasNormais));
            this.atualizarElementoResumo('totalHorasFimSemana', this.formatarHoras(totais.totalHorasFimSemana));
            this.atualizarElementoResumo('totalHorasGeral', this.formatarHoras(totais.totalHorasGeral));
            this.atualizarElementoResumo('valorTotalNormal', `R$ ${totais.totalValorNormal.toFixed(2)}`);
            this.atualizarElementoResumo('valorTotalFimSemana', `R$ ${totais.totalValorFimSemana.toFixed(2)}`);
            this.atualizarElementoResumo('valorTotalGeral', `R$ ${totais.totalValorGeral.toFixed(2)}`);
            
            // Atualizar estatísticas
            this.atualizarElementoResumo('totalPlantoes', estatisticas.totalPlantoes);
            this.atualizarElementoResumo('plantoesNormais', estatisticas.plantoesNormais);
            this.atualizarElementoResumo('plantoesFimSemana', estatisticas.plantoesFimSemana);
            this.atualizarElementoResumo('plantoesFeriado', estatisticas.plantoesFeriado);
            this.atualizarElementoResumo('mediaHoras', this.formatarHoras(estatisticas.mediaHorasPorPlantao));
            
            console.log('📊 Resumo atualizado:', { totais, saldoBanco, estatisticas });
            
        } catch (error) {
            console.error('❌ Erro ao atualizar resumo:', error);
            this.mostrarNotificacao('Erro ao atualizar resumo', 'error');
        }
    }

    atualizarElementoResumo(id, valor) {
        try {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = valor;
            }
        } catch (error) {
            console.error(`❌ Erro ao atualizar elemento ${id}:`, error);
        }
    }

    removerRegistro(index) {
        try {
            if (confirm('Tem certeza que deseja remover este registro?')) {
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

    editarRegistro(index) {
        try {
            const registros = storage.obterRegistros();
            const registro = registros[index];
            
            if (!registro) {
                this.mostrarNotificacao('Registro não encontrado', 'error');
                return;
            }

            // Preencher formulário com dados do registro
            document.getElementById('data').value = registro.data;
            document.getElementById('entrada').value = registro.entrada;
            document.getElementById('saida').value = registro.saida;
            document.getElementById('pausa').value = registro.pausa || 0;
            document.getElementById('observacoes').value = registro.observacoes || '';
            document.getElementById('feriado').checked = registro.feriado || false;

            // Remover registro atual
            storage.removerRegistro(index);
            
            // Atualizar interface
            this.atualizarListaRegistros();
            this.atualizarResumo();
            this.atualizarPreviewCalculo();
            
            // Scroll para o formulário
            document.getElementById('formRegistro').scrollIntoView({ behavior: 'smooth' });
            
            this.mostrarNotificacao('Registro carregado para edição', 'info');
            console.log(`✏️ Registro ${index} carregado para edição`);

        } catch (error) {
            console.error('❌ Erro ao editar registro:', error);
            this.mostrarNotificacao('Erro ao editar registro', 'error');
        }
    }

    exportarDados() {
        try {
            const registros = storage.obterRegistros();
            const valorHora = parseFloat(document.getElementById('valorHora').value) || 25.00;
            
            if (registros.length === 0) {
                this.mostrarNotificacao('Nenhum registro para exportar', 'warning');
                return;
            }

            const dados = {
                registros: registros,
                valorHora: valorHora,
                exportadoEm: new Date().toISOString(),
                versao: '3.1.0'
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

            this.mostrarNotificacao('Dados exportados com sucesso!', 'success');
            console.log('📤 Dados exportados:', dados);

        } catch (error) {
            console.error('❌ Erro ao exportar dados:', error);
            this.mostrarNotificacao('Erro ao exportar dados', 'error');
        }
    }

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
                        
                        if (!dados.registros || !Array.isArray(dados.registros)) {
                            throw new Error('Formato de arquivo inválido');
                        }

                        if (confirm(`Importar ${dados.registros.length} registros? Isso substituirá todos os dados atuais.`)) {
                            // Limpar dados atuais
                            storage.limparTodos();
                            
                            // Importar novos dados
                            dados.registros.forEach(registro => {
                                storage.adicionarRegistro(registro);
                            });

                            // Atualizar valor da hora se disponível
                            if (dados.valorHora) {
                                document.getElementById('valorHora').value = dados.valorHora;
                            }

                            // Atualizar interface
                            this.atualizarListaRegistros();
                            this.atualizarResumo();

                            this.mostrarNotificacao(`${dados.registros.length} registros importados com sucesso!`, 'success');
                            console.log('📥 Dados importados:', dados);
                        }

                    } catch (error) {
                        console.error('❌ Erro ao processar arquivo:', error);
                        this.mostrarNotificacao('Erro ao processar arquivo de importação', 'error');
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

    // Métodos utilitários
    formatarData(data) {
        try {
            const dataObj = new Date(data + 'T00:00:00');
            return dataObj.toLocaleDateString('pt-BR');
        } catch (error) {
            return data;
        }
    }

    obterDiaSemana(data) {
        try {
            const dataObj = new Date(data + 'T00:00:00');
            const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            return dias[dataObj.getDay()];
        } catch (error) {
            return '';
        }
    }

    formatarHoras(horas) {
        try {
            if (horas === 0) return '0h00m';
            
            const horasInteiras = Math.floor(Math.abs(horas));
            const minutos = Math.round((Math.abs(horas) - horasInteiras) * 60);
            const sinal = horas < 0 ? '-' : '';
            
            return `${sinal}${horasInteiras}h${minutos.toString().padStart(2, '0')}m`;
        } catch (error) {
            return '0h00m';
        }
    }

    mostrarNotificacao(mensagem, tipo = 'info') {
        try {
            // Cores por tipo
            const cores = {
                success: 'bg-green-100 border-green-400 text-green-700',
                error: 'bg-red-100 border-red-400 text-red-700',
                warning: 'bg-yellow-100 border-yellow-400 text-yellow-700',
                info: 'bg-blue-100 border-blue-400 text-blue-700'
            };

            // Ícones por tipo
            const icones = {
                success: '✅',
                error: '❌',
                warning: '⚠️',
                info: 'ℹ️'
            };

                        // Criar elemento de notificação
                        const notificacao = document.createElement('div');
                        notificacao.className = `fixed top-4 right-4 p-4 border rounded-lg shadow-lg z-50 max-w-sm ${cores[tipo] || cores.info}`;
                        notificacao.innerHTML = `
                            <div class="flex items-center gap-2">
                                <span class="text-lg">${icones[tipo] || icones.info}</span>
                                <div class="flex-1">
                                    <div class="font-medium">${mensagem}</div>
                                </div>
                                <button onclick="this.parentElement.parentElement.remove()" class="ml-2 text-lg hover:opacity-70">
                                    ×
                                </button>
                            </div>
                        `;
            
                        // Adicionar ao DOM
                        document.body.appendChild(notificacao);
            
                        // Remover automaticamente após 5 segundos
                        setTimeout(() => {
                            if (notificacao.parentNode) {
                                notificacao.remove();
                            }
                        }, 5000);
            
                        console.log(`📢 Notificação ${tipo}:`, mensagem);
            
                    } catch (error) {
                        console.error('❌ Erro ao mostrar notificação:', error);
                        // Fallback para alert
                        alert(mensagem);
                    }
                }
            }
            
            // ✅ Instâncias globais
            let sistema;
            let calculadora;
            let storage;
            
            // ✅ Inicialização quando DOM estiver pronto
            document.addEventListener('DOMContentLoaded', function() {
                try {
                    console.log('🚀 Inicializando aplicação...');
                    
                    // Verificar se as dependências estão carregadas
                    if (typeof CalculadoraBancoHoras === 'undefined') {
                        throw new Error('CalculadoraBancoHoras não encontrada');
                    }
                    
                    if (typeof GerenciadorStorage === 'undefined') {
                        throw new Error('GerenciadorStorage não encontrado');
                    }
            
                    // Criar instâncias
                    calculadora = new CalculadoraBancoHoras();
                    storage = new GerenciadorStorage();
                    sistema = new SistemaBancoHoras();
            
                    // Demonstrar cálculo de bônus no console
                    calculadora.demonstrarCalculoBonus(50.00);
            
                    console.log('✅ Aplicação inicializada com sucesso!');
                    
                } catch (error) {
                    console.error('❌ Erro fatal na inicialização:', error);
                    alert('Erro ao carregar aplicação. Verifique o console para mais detalhes.');
                }
            });
            
            // ✅ Função global para demonstração
            function demonstrarCalculoBonus() {
                try {
                    const valorBase = parseFloat(document.getElementById('valorHora').value) || 50.00;
                    const demo = calculadora.demonstrarCalculoBonus(valorBase);
                    
                    alert(`🧮 DEMONSTRAÇÃO DE CÁLCULO:
            
            💰 Valor base: R$ ${demo.valorBase.toFixed(2)}
            📈 Bônus (90%): R$ ${demo.bonus.toFixed(2)}
            💵 Valor final/hora: R$ ${demo.valorFinal.toFixed(2)}
            
            📝 Exemplo com 11 horas fim de semana:
            🔢 11h × R$ ${demo.valorFinal.toFixed(2)} = R$ ${demo.exemplo11h.toFixed(2)}`);
                    
                } catch (error) {
                    console.error('❌ Erro na demonstração:', error);
                    alert('Erro ao calcular demonstração');
                }
            }
            
            // ✅ Tratamento de erros globais
            window.addEventListener('error', function(event) {
                console.error('❌ Erro global capturado:', event.error);
            });
            
            window.addEventListener('unhandledrejection', function(event) {
                console.error('❌ Promise rejeitada:', event.reason);
            });
            
            console.log('📱 Sistema Principal carregado - v3.1.0');
            

            // Adicionar
