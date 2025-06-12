// src/js/app.js - Aplicação Principal com Banco de Horas v4.1.0
class BancoHorasApp {
    constructor() {
        console.log('🚀 Banco de Horas App iniciando - v4.1.0');
        
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
            salvarBtn: () => this.salvarDados()
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
        
        if (checkboxFimSemana && ehFimSemana) {
            checkboxFimSemana.checked = true;
            console.log('🎯 Fim de semana detectado automaticamente');
        }
    }

    // ✅ CORRIGIDO - Salvar registro com banco de horas
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

    // ✅ CORRIGIDO - Coletar dados do formulário com IDs corretos
    coletarDadosFormulario() {
        return {
            data: document.getElementById('data')?.value || '',
            entrada: document.getElementById('entrada')?.value || '',
            saida: document.getElementById('saida')?.value || '',
            pausa: parseInt(document.getElementById('pausa')?.value || '0'),
            horasExtras: parseFloat(document.getElementById('horasExtras')?.value || '0'),
            feriado: document.getElementById('feriado')?.checked || false,
            fimDeSemana: document.getElementById('fimSemana')?.checked || false,
            usarBancoHoras: document.getElementById('usarBancoHoras')?.checked || false,
            descricao: ''
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
                                <i class="fas fa-gift mr-1"></i>Bônus
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
                            <button onclick="app.excluirRegistro(${registro.id})" 
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

        // Atualizar cards do topo
        const elementos = {
            'saldoTotalCard': `${saldoBanco.saldoTotal.toFixed(1)}h`,
            'bonusTotalCard': `${totais.totalHorasFimSemana.toFixed(1)}h`,
            'totalPlantoes': this.registros.length.toString(),
            'valorTotalCard': `R$ ${totais.totalValorGeral.toFixed(2)}`
        };

        Object.entries(elementos).forEach(([id, valor]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                elemento.textContent = valor;
            }
        });

        console.log('🎯 Contadores atualizados:', elementos);
    }

    // ✅ CORRIGIDO - Atualizar valor com bônus (valor base + 90%)
    atualizarValorComBonus() {
        const valorBase = parseFloat(document.getElementById('valorHora')?.value || '25');
        
        // ✅ CORREÇÃO: valor base + 90% do valor base = valor base * 1.9
        const valorComBonus = valorBase + (valorBase * 0.9);
        
        const elemento = document.getElementById('valorComBonus');
        if (elemento) {
            elemento.textContent = `R$ ${valorComBonus.toFixed(2)}`;
        }
    }

    // ✅ NOVO - Salvar configuração financeira
    salvarConfiguracaoFinanceira() {
        try {
            const valorHora = parseFloat(document.getElementById('valorHora')?.value || '25');
            
            if (valorHora < 1 || valorHora > 1000) {
                alert('❌ Valor da hora deve estar entre R$ 1,00 e R$ 1.000,00');
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

            this.mostrarSucesso('✅ Configuração financeira salva!');

        } catch (error) {
            console.error('❌ Erro ao salvar configuração:', error);
            alert('❌ Erro ao salvar configuração');
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

    // ✅ CORRIGIDO - Limpar formulário com IDs corretos
    limparFormulario() {
        const campos = ['data', 'entrada', 'saida', 'pausa', 'horasExtras'];
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

        this.registroEditando = registro;
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        this.mostrarSucesso('📝 Registro carregado para edição');
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

    // ✅ NOVOS MÉTODOS - Ações dos botões
    limparTodosDados() {
        if (confirm('❓ Tem certeza que deseja limpar TODOS os dados? Esta ação não pode ser desfeita.')) {
            this.registros = [];
            this.storage.salvarRegistros(this.registros);
            this.renderizarRegistros();
            this.atualizarTotais();
            this.atualizarContadores();
            this.mostrarSucesso('✅ Todos os dados foram limpos!');
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
            
            this.mostrarSucesso('✅ Arquivo CSV exportado!');
        } catch (error) {
            console.error('❌ Erro ao exportar CSV:', error);
            alert('❌ Erro ao exportar CSV');
        }
    }

    exportarPDF() {
        alert('📄 Funcionalidade de exportar PDF será implementada em breve!');
    }

    salvarDados() {
        try {
            this.storage.salvarRegistros(this.registros);
            this.mostrarSucesso('✅ Dados salvos com sucesso!');
        } catch (error) {
            console.error('❌ Erro ao salvar dados:', error);
            alert('❌ Erro ao salvar dados');
        }
    }

    mostrarSucesso(mensagem) {
        console.log('✅', mensagem);
        
        // Criar notificação visual moderna
        const notificacao = document.createElement('div');
        notificacao.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300 translate-x-full';
        notificacao.innerHTML = `
            <div class="flex items-center gap-2">
                <i class="fas fa-check-circle"></i>
                <span>${mensagem}</span>
            </div>
        `;
        
        document.body.appendChild(notificacao);
        
        // Animar entrada
        setTimeout(() => {
            notificacao.classList.remove('translate-x-full');
        }, 100);
        
        // Remover após 3 segundos
        setTimeout(() => {
            notificacao.classList.add('translate-x-full');
            setTimeout(() => {
                document.body.removeChild(notificacao);
            }, 300);
        }, 300);
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

console.log('🚀 App principal com banco de horas carregado - v4.1.0');
