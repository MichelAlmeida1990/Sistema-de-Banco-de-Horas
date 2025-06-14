// src/js/registro.js - Gerenciador de Registro de Plantão v1.0.0

class RegistroPlantao {
    constructor(configuracao, storage) {
        this.configuracao = configuracao;
        this.storage = storage;
        this.registroEditando = null;
        this.registros = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.carregarRegistros();
        console.log('📝 Gerenciador de registro iniciado');
    }

    setupEventListeners() {
        const form = document.getElementById('bancoHorasForm');
        const data = document.getElementById('data');

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.salvarRegistro();
            });
        }

        if (data) {
            data.addEventListener('change', (e) => {
                this.verificarFimDeSemana(e.target.value);
            });
        }
    }

    async salvarRegistro() {
        try {
            console.log('📝 Iniciando salvamento de registro...');
            
            // 1. Coletar dados do formulário
            const dados = this.coletarDadosFormulario();
            console.log('📝 Dados coletados:', dados);

            // 2. Obter valor da hora atual
            const valorHora = this.configuracao.getValorHora();
            if (!valorHora || valorHora <= 0) {
                throw new Error('Configure o valor da hora antes de salvar o registro');
            }

            // 3. Criar registro
            const registro = {
                id: this.registroEditando ? this.registroEditando.id : Date.now().toString(),
                data: dados.data,
                entrada: dados.entrada,
                saida: dados.saida,
                pausa: parseInt(dados.pausa || '0'),
                fimDeSemana: dados.fimDeSemana,
                feriado: dados.feriado,
                valorHora: valorHora,
                observacoes: dados.observacoes,
                criadoEm: new Date().toISOString(),
                atualizadoEm: new Date().toISOString()
            };

            // 4. Salvar no storage
            await this.storage.salvarRegistro(registro);
            
            // 5. Atualizar lista local
            if (this.registroEditando) {
                const index = this.registros.findIndex(r => r.id === registro.id);
                if (index !== -1) this.registros[index] = registro;
            } else {
                this.registros.push(registro);
            }

            // 6. Atualizar interface
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

    verificarFimDeSemana(data) {
        if (!data) return;
        
        const ehFimSemana = this.ehFimDeSemana(data);
        const checkboxFimSemana = document.getElementById('fimSemana');
        
        if (checkboxFimSemana) {
            checkboxFimSemana.checked = ehFimSemana;
            
            if (ehFimSemana) {
                this.mostrarInfo('🎯 Fim de semana detectado! Bônus de 90% será aplicado.');
            }
        }
    }

    ehFimDeSemana(data) {
        const dia = new Date(data).getDay();
        return dia === 0 || dia === 6; // 0 = Domingo, 6 = Sábado
    }

    async carregarRegistros() {
        try {
            this.registros = await this.storage.listarRegistros();
            this.registros.sort((a, b) => new Date(b.data) - new Date(a.data));
            this.renderizarRegistros();
        } catch (error) {
            console.error('❌ Erro ao carregar registros:', error);
            this.mostrarErro('Erro ao carregar registros');
        }
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
    }

    renderizarLinhaRegistro(registro) {
        const valorHora = registro.valorHora || this.configuracao.getValorHora();
        const calculo = this.calcularValores(registro, valorHora);
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
                    ${registro.pausa}h
                    <div class="text-xs text-gray-500 mt-1">Pausa</div>
                </td>
                <td class="p-4 text-gray-900">
                    ${calculo.horasTrabalhadas}h
                    <div class="text-xs text-gray-500 mt-1">Total</div>
                </td>
                <td class="p-4 text-gray-900">
                    R$ ${calculo.valorTotal.toFixed(2)}
                    <div class="text-xs text-gray-500 mt-1">
                        ${registro.valorHora ? `(R$ ${registro.valorHora}/h)` : ''}
                    </div>
                </td>
                <td class="p-4">
                    <div class="flex gap-2">
                        <button onclick="registroPlantao.editarRegistro('${registro.id}')"
                                class="text-blue-600 hover:text-blue-800">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="registroPlantao.excluirRegistro('${registro.id}')"
                                class="text-red-600 hover:text-red-800">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    calcularValores(registro, valorHora) {
        // Implementar cálculos aqui
        return {
            horasTrabalhadas: 8, // Placeholder
            valorTotal: valorHora * 8 // Placeholder
        };
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
        this.mostrarNotificacao(mensagem, 'error');
    }

    mostrarInfo(mensagem) {
        this.mostrarNotificacao(mensagem, 'info');
    }

    mostrarNotificacao(mensagem, tipo) {
        // Implementar sistema de notificação visual aqui
        console.log(`${tipo.toUpperCase()}: ${mensagem}`);
        if (tipo === 'error') {
            alert(mensagem);
        }
    }
}

// Exportar a classe
window.RegistroPlantao = RegistroPlantao; 