// src/js/registro.js - Gerenciador de Registro de Plantão v1.0.0

class RegistroPlantao {
    constructor(configuracao, storage) {
        if (!configuracao || !storage) {
            throw new Error('Configuração e Storage são obrigatórios');
        }
        
        this.configuracao = configuracao;
        this.storage = storage;
        this.calculadora = new Calculadora();
        this.registroEditando = null;
        this.registros = [];
        
        // Inicializar
        this.init();
        console.log('📝 Gerenciador de registro iniciado');
    }

    init() {
        this.setupEventListeners();
        this.carregarRegistros();
    }

    setupEventListeners() {
        const form = document.getElementById('bancoHorasForm');
        const data = document.getElementById('data');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation(); // Prevenir propagação do evento
                
                try {
                    // Verificar autenticação
                    if (!window.auth.currentUser) {
                        throw new Error('Usuário não está autenticado. Por favor, faça login novamente.');
                    }

                    const btnRegistrar = document.getElementById('btnRegistrar');
                    if (btnRegistrar) {
                        btnRegistrar.disabled = true;
                        btnRegistrar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
                    }

                    await this.salvarRegistro();

                    // Atualizar totais após salvar
                    if (window.app) {
                        await window.app.atualizarTotais();
                    }
                } catch (error) {
                    console.error('❌ Erro ao salvar:', error);
                    this.mostrarErro(error.message);

                    // Se erro de autenticação, redirecionar para login
                    if (error.message.includes('autenticado')) {
                        window.location.reload();
                    }
                } finally {
                    const btnRegistrar = document.getElementById('btnRegistrar');
                    if (btnRegistrar) {
                        btnRegistrar.disabled = false;
                        btnRegistrar.innerHTML = '<i class="fas fa-plus-circle"></i> Registrar Plantão';
                    }
                }
            });
        }

        if (data) {
            data.addEventListener('change', (e) => {
                this.verificarFimDeSemana(e.target.value);
            });
        }
    }

    verificarFimDeSemana(data) {
        try {
            if (!data) return;
            
            const dia = new Date(data).getDay();
            const ehFimDeSemana = dia === 0 || dia === 6;
            
            const checkboxFimSemana = document.getElementById('fimSemana');
            if (checkboxFimSemana) {
                checkboxFimSemana.checked = ehFimDeSemana;
            }
            
            if (ehFimDeSemana) {
                this.mostrarInfo('⚠️ Data selecionada é fim de semana - bônus será aplicado automaticamente');
            }
        } catch (error) {
            console.error('❌ Erro ao verificar fim de semana:', error);
        }
    }

    async salvarRegistro() {
        try {
            // Verificar autenticação novamente
            if (!window.auth.currentUser) {
                throw new Error('Usuário não está autenticado. Por favor, faça login novamente.');
            }

            console.log('📝 Iniciando salvamento de registro...');
            
            // 1. Coletar dados do formulário
            const dados = this.coletarDadosFormulario();
            console.log('📝 Dados coletados:', dados);

            // 2. Obter valor da hora BASE (sem bônus) da configuração
            const valorHoraBase = this.configuracao.getValorHora();
            if (!valorHoraBase || valorHoraBase <= 0) {
                throw new Error('Configure o valor da hora antes de salvar o registro');
            }

            // 3. Validar horários
            this.validarHorarios(dados.entrada, dados.saida);

            // 4. Criar registro com valor BASE - a calculadora aplicará os bônus
            const registro = {
                id: this.registroEditando ? this.registroEditando.id : Date.now().toString(),
                uid: window.auth.currentUser.uid,
                data: dados.data,
                entrada: dados.entrada,
                saida: dados.saida,
                pausa: parseInt(dados.pausa || '60'),
                fimDeSemana: dados.fimDeSemana,
                feriado: dados.feriado,
                valorHora: valorHoraBase, // SEMPRE valor base - calculadora aplica bônus
                observacoes: dados.observacoes,
                criadoEm: this.registroEditando?.criadoEm || new Date().toISOString(),
                atualizadoEm: new Date().toISOString()
            };

            console.log('💰 Valor hora base usado:', valorHoraBase);
            console.log('📊 Registro criado:', registro);

            // 5. Salvar no storage
            await this.storage.salvarRegistro(registro);
            
            // 6. Atualizar lista local
            if (this.registroEditando) {
                const index = this.registros.findIndex(r => r.id === registro.id);
                if (index !== -1) this.registros[index] = registro;
            } else {
                this.registros.push(registro);
            }

            // 7. Atualizar interface
            this.limparFormulario();
            this.renderizarRegistros();
            this.mostrarSucesso('✅ Registro salvo com sucesso!');
            
            return registro;
        } catch (error) {
            console.error('❌ Erro ao salvar registro:', error);
            this.mostrarErro('Erro ao salvar registro: ' + error.message);
            throw error;
        }
    }

    validarHorarios(entrada, saida) {
        if (!entrada || !saida) {
            throw new Error('Horários de entrada e saída são obrigatórios');
        }

        const [horaEntrada, minutoEntrada] = entrada.split(':').map(Number);
        const [horaSaida, minutoSaida] = saida.split(':').map(Number);

        if (isNaN(horaEntrada) || isNaN(minutoEntrada) || isNaN(horaSaida) || isNaN(minutoSaida)) {
            throw new Error('Formato de horário inválido');
        }

        const totalMinutosEntrada = horaEntrada * 60 + minutoEntrada;
        const totalMinutosSaida = horaSaida * 60 + minutoSaida;

        if (totalMinutosSaida <= totalMinutosEntrada) {
            throw new Error('Horário de saída deve ser maior que o horário de entrada');
        }
    }

    coletarDadosFormulario() {
        const campos = {
            data: document.getElementById('data')?.value,
            entrada: document.getElementById('entrada')?.value,
            saida: document.getElementById('saida')?.value,
            pausa: document.getElementById('pausa')?.value,
            feriado: document.getElementById('feriado')?.checked,
            fimDeSemana: document.getElementById('fimSemana')?.checked,
            observacoes: document.getElementById('observacoes')?.value
        };

        // Validar campos obrigatórios
        if (!campos.data || !campos.entrada || !campos.saida) {
            throw new Error('Preencha todos os campos obrigatórios');
        }

        return campos;
    }

    async carregarRegistros() {
        try {
            console.log('📝 Carregando registros...');
            
            // Verificar autenticação
            if (!window.auth.currentUser) {
                throw new Error('Usuário não está autenticado');
            }

            // Carregar registros do storage
            this.registros = await this.storage.listarRegistros();
            
            // Atualizar interface
            this.renderizarRegistros();
            
            console.log(`✅ ${this.registros.length} registros carregados`);
            
        } catch (error) {
            console.error('❌ Erro ao carregar registros:', error);
            
            // Tratar erros específicos
            if (error.message.includes('autenticado')) {
                this.mostrarErro('Sessão expirada. Por favor, faça login novamente.');
                return;
            }
            
            if (error.message.includes('permissão')) {
                this.mostrarErro('Sem permissão para acessar registros. Por favor, faça login novamente.');
                return;
            }
            
            this.mostrarErro(`Erro ao carregar registros: ${error.message}`);
        }
    }

    atualizarListaRegistros() {
        this.renderizarRegistros();
    }

    renderizarRegistros() {
        const container = document.getElementById('tabelaBody');
        if (!container) return;

        if (this.registros.length === 0) {
            container.innerHTML = this.renderizarTabelaVazia();
            return;
        }

        container.innerHTML = this.registros
            .map(registro => this.renderizarLinhaRegistro(registro))
            .join('');
    }

    renderizarTabelaVazia() {
        return `
            <tr>
                <td colspan="8" class="p-8 text-center text-gray-500">
                    <i class="fas fa-info-circle text-4xl mb-3 block"></i>
                    <p class="text-lg font-medium">Nenhum registro encontrado</p>
                    <p class="text-sm">Adicione seu primeiro plantão usando o formulário acima</p>
                </td>
            </tr>
        `;
    }

    renderizarLinhaRegistro(registro) {
        // Garantir que sempre tenhamos um valor da hora válido
        const valorHoraRegistro = registro.valorHora || this.configuracao.getValorHora();
        
        if (!valorHoraRegistro || valorHoraRegistro <= 0) {
            console.warn('⚠️ Valor da hora inválido para registro:', registro.id);
            return this.renderizarLinhaErro(registro, 'Valor da hora não configurado');
        }

        try {
            // Usar a calculadora para todos os cálculos
            const calculo = this.calculadora.calcularValorRegistro(registro, valorHoraRegistro);
            const tipoPlantao = this.obterTipoPlantao(registro);

            return `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-4 text-gray-900">
                        ${this.formatarData(registro.data)}
                        <div class="text-xs text-gray-500 mt-1">
                            ${this.obterDiaSemana(registro.data)}
                        </div>
                    </td>
                    <td class="p-4">
                        <span class="${this.obterClasseTipo(tipoPlantao)}">${tipoPlantao}</span>
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
                        ${registro.pausa || 60}min
                        <div class="text-xs text-gray-500 mt-1">Pausa</div>
                    </td>
                    <td class="p-4 text-gray-900">
                        ${calculo.horasTrabalhadas.toFixed(1)}h
                        <div class="text-xs text-gray-500 mt-1">
                            ${calculo.saldoHoras > 0 ? `+${calculo.saldoHoras.toFixed(1)}h extra` : 
                              calculo.saldoHoras < 0 ? `${calculo.saldoHoras.toFixed(1)}h` : 'Jornada completa'}
                        </div>
                    </td>
                    <td class="p-4 text-gray-900">
                        R$ ${calculo.valorTotal.toFixed(2)}
                        <div class="text-xs text-gray-500 mt-1">
                            R$ ${calculo.valorHora.toFixed(2)}/h
                            ${calculo.temBonus ? `(+${((calculo.multiplicadorBonus - 1) * 100).toFixed(0)}%)` : ''}
                        </div>
                    </td>
                    <td class="p-4">
                        <div class="flex gap-2">
                            <button onclick="window.app.registroPlantao.editarRegistro('${registro.id}')"
                                    class="text-blue-600 hover:text-blue-800 p-1 rounded">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="window.app.registroPlantao.excluirRegistro('${registro.id}')"
                                    class="text-red-600 hover:text-red-800 p-1 rounded">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        } catch (error) {
            console.error('❌ Erro ao renderizar registro:', registro.id, error);
            return this.renderizarLinhaErro(registro, 'Erro no cálculo');
        }
    }

    renderizarLinhaErro(registro, mensagemErro) {
        return `
            <tr class="bg-red-50 hover:bg-red-100 transition-colors">
                <td class="p-4 text-gray-900">
                    ${this.formatarData(registro.data)}
                    <div class="text-xs text-red-500 mt-1">
                        ${mensagemErro}
                    </div>
                </td>
                <td class="p-4">
                    <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Erro
                    </span>
                </td>
                <td class="p-4 text-gray-500">${registro.entrada || '-'}</td>
                <td class="p-4 text-gray-500">${registro.saida || '-'}</td>
                <td class="p-4 text-gray-500">${registro.pausa || 60}min</td>
                <td class="p-4 text-red-500">-</td>
                <td class="p-4 text-red-500">-</td>
                <td class="p-4">
                    <div class="flex gap-2">
                        <button onclick="window.app.registroPlantao.editarRegistro('${registro.id}')"
                                class="text-blue-600 hover:text-blue-800 p-1 rounded">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="window.app.registroPlantao.excluirRegistro('${registro.id}')"
                                class="text-red-600 hover:text-red-800 p-1 rounded">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    calcularValores(registro, valorHora) {
        // Método obsoleto - usar calculadora diretamente
        return this.calculadora.calcularValorRegistro(registro, valorHora);
    }

    obterTipoPlantao(registro) {
        if (registro.feriado) return 'Feriado';
        if (registro.fimDeSemana || this.ehFimDeSemana(registro.data)) return 'Fim de Semana';
        return 'Normal';
    }

    obterClasseTipo(tipo) {
        switch (tipo) {
            case 'Feriado':
                return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800';
            case 'Fim de Semana':
                return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800';
            default:
                return 'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800';
        }
    }

    formatarData(data) {
        if (!data) return '-';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    obterDiaSemana(data) {
        if (!data) return '-';
        const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
        return dias[new Date(data).getDay()];
    }

    limparFormulario() {
        const campos = ['data', 'entrada', 'saida', 'pausa', 'observacoes'];
        const checkboxes = ['feriado', 'fimSemana'];

        campos.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.value = id === 'pausa' ? '60' : '';
        });

        checkboxes.forEach(id => {
            const elemento = document.getElementById(id);
            if (elemento) elemento.checked = false;
        });

        this.registroEditando = null;
    }

    editarRegistro(id) {
        const registro = this.registros.find(r => r.id === id);
        if (!registro) return;

        // Preencher formulário
        const campos = {
            data: registro.data,
            entrada: registro.entrada,
            saida: registro.saida,
            pausa: registro.pausa,
            feriado: registro.feriado,
            fimSemana: registro.fimDeSemana,
            observacoes: registro.observacoes
        };

        Object.entries(campos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                if (elemento.type === 'checkbox') {
                    elemento.checked = valor;
                } else {
                    elemento.value = valor;
                }
            }
        });

        this.registroEditando = registro;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.mostrarInfo('📝 Registro carregado para edição');
    }

    async excluirRegistro(id) {
        if (!id) return;

        if (confirm('❓ Tem certeza que deseja excluir este plantão? Esta ação não pode ser desfeita.')) {
            try {
                await this.storage.removerRegistro(id);
                this.registros = this.registros.filter(r => r.id !== id);
                this.renderizarRegistros();
                this.mostrarSucesso('✅ Plantão excluído com sucesso!');
            } catch (error) {
                console.error('❌ Erro ao excluir registro:', error);
                this.mostrarErro('Erro ao excluir registro');
            }
        }
    }

    mostrarSucesso(mensagem) {
        this.mostrarNotificacao(mensagem, 'success');
    }

    mostrarErro(mensagem) {
        const notificacao = document.createElement('div');
        notificacao.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notificacao.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas fa-exclamation-circle"></i>
                <span>${mensagem}</span>
            </div>
        `;
        document.body.appendChild(notificacao);
        setTimeout(() => notificacao.remove(), 5000);
    }

    mostrarInfo(mensagem) {
        const notificacao = document.createElement('div');
        notificacao.className = 'fixed top-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        notificacao.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas fa-info-circle"></i>
                <span>${mensagem}</span>
            </div>
        `;
        document.body.appendChild(notificacao);
        setTimeout(() => notificacao.remove(), 3000);
    }

    mostrarNotificacao(mensagem, tipo) {
        const notificacao = document.createElement('div');
        notificacao.className = `fixed top-4 right-4 ${this.obterCorNotificacao(tipo)} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full`;
        
        notificacao.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="${this.obterIconeNotificacao(tipo)}"></i>
                <span class="text-sm">${mensagem}</span>
            </div>
        `;
        
        document.body.appendChild(notificacao);
        
        setTimeout(() => notificacao.classList.remove('translate-x-full'), 100);
        setTimeout(() => {
            notificacao.classList.add('translate-x-full');
            setTimeout(() => notificacao.remove(), 300);
        }, 4000);
    }

    obterCorNotificacao(tipo) {
        const cores = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500'
        };
        return cores[tipo] || cores.info;
    }

    obterIconeNotificacao(tipo) {
        const icones = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            info: 'fas fa-info-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        return icones[tipo] || icones.info;
    }

    ehFimDeSemana(data) {
        try {
            if (!data) return false;
            const dia = new Date(data).getDay();
            return dia === 0 || dia === 6; // 0 = Domingo, 6 = Sábado
        } catch (error) {
            console.error('❌ Erro ao verificar fim de semana:', error);
            return false;
        }
    }
}

// Exportar a classe
window.RegistroPlantao = RegistroPlantao; 