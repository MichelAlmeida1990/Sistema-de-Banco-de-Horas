// src/js/exportar.js - Sistema de Exportação de Dados
// Compatível com o sistema de banco de horas corrigido

class ExportadorDados {
    constructor() {
        this.calculadora = new CalculadoraBancoHoras();
        this.versao = '2.1.0';
        
        console.log('📤 Exportador de Dados iniciado');
    }

    // ✅ EXPORTAR CSV - Função principal
    async exportarCSV(registros) {
        try {
            if (!registros || registros.length === 0) {
                throw new Error('Nenhum registro para exportar');
            }
            
            console.log(`📊 Exportando ${registros.length} registros para CSV`);
            
            const csvContent = this.gerarCSV(registros);
            const nomeArquivo = this.gerarNomeArquivo('csv');
            
            this.downloadFile(csvContent, nomeArquivo, 'text/csv;charset=utf-8;');
            
            console.log('✅ CSV exportado com sucesso:', nomeArquivo);
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao exportar CSV:', error);
            throw new Error(`Falha na exportação CSV: ${error.message}`);
        }
    }

    // ✅ GERAR CONTEÚDO CSV
    gerarCSV(registros) {
        try {
            // Cabeçalhos do CSV
            const headers = [
                'Data',
                'Dia da Semana',
                'Entrada',
                'Saída',
                'Pausa (min)',
                'Horas Trabalhadas',
                'Saldo Banco',
                'Horas Extras Declaradas',
                'Tipo de Plantão',
                'Valor Hora (R$)',
                'Valor Base (R$)',
                'Valor Extras (R$)',
                'Bônus 90% (R$)',
                'Valor Total (R$)',
                'Observações'
            ];

            // Adicionar BOM para UTF-8 (corrige acentos no Excel)
            let csvContent = '\uFEFF';
            
            // Adicionar cabeçalhos
            csvContent += headers.join(',') + '\n';

            // Processar cada registro
            registros.forEach(registro => {
                const linha = this.processarLinhaCSV(registro);
                csvContent += linha + '\n';
            });

            // Adicionar resumo no final
            csvContent += this.gerarResumoCSV(registros);

            return csvContent;
            
        } catch (error) {
            console.error('❌ Erro ao gerar CSV:', error);
            throw error;
        }
    }

    // ✅ PROCESSAR LINHA INDIVIDUAL DO CSV
    processarLinhaCSV(registro) {
        try {
            const campos = [
                this.formatarDataBR(registro.data),
                this.obterDiaSemana(registro.data),
                registro.entrada || '',
                registro.saida || '',
                registro.pausa || 0,
                this.formatarHorasCSV(registro.horasTrabalhadas),
                this.formatarHorasCSV(registro.saldoBanco),
                this.formatarHorasCSV(registro.horasExtras),
                this.limparTipoPlantao(registro.tipoPlantao || this.obterTipoTexto(registro)),
                this.formatarNumeroCSV(registro.valorHora),
                this.formatarNumeroCSV(registro.valorBase),
                this.formatarNumeroCSV(registro.valorExtras),
                this.formatarNumeroCSV(registro.valorBonus),
                this.formatarNumeroCSV(registro.valorTotal),
                this.escaparTextoCSV(registro.observacoes || '')
            ];

            return campos.join(',');
            
        } catch (error) {
            console.error('❌ Erro ao processar linha CSV:', error);
            return 'ERRO,ERRO,ERRO,ERRO,ERRO,ERRO,ERRO,ERRO,ERRO,ERRO,ERRO,ERRO,ERRO,ERRO,ERRO';
        }
    }

    // ✅ GERAR RESUMO NO FINAL DO CSV
    gerarResumoCSV(registros) {
        try {
            const totais = this.calculadora.calcularTotais(registros);
            
            let resumo = '\n';
            resumo += '=== RESUMO GERAL ===\n';
            resumo += `Total de Plantões,${totais.totalRegistros}\n`;
            resumo += `Saldo Total do Banco,${totais.saldoBanco}\n`;
            resumo += `Total Horas Extras,${totais.horasExtrasTotal}\n`;
            resumo += `Total Bônus 90%,${totais.horasBonus}\n`;
            resumo += `Valor Total a Receber,${this.formatarNumeroCSV(totais.valorTotal)}\n`;
            resumo += '\n';
            resumo += `Relatório gerado em,${new Date().toLocaleString('pt-BR')}\n`;
            resumo += `Sistema,Banco de Horas - Enfermagem v${this.versao}\n`;

            return resumo;
            
        } catch (error) {
            console.error('❌ Erro ao gerar resumo CSV:', error);
            return '\nERRO AO GERAR RESUMO\n';
        }
    }

    // ✅ EXPORTAR PDF
    async exportarPDF(registros) {
        try {
            if (!registros || registros.length === 0) {
                throw new Error('Nenhum registro para exportar');
            }

            console.log(`📄 Exportando ${registros.length} registros para PDF`);
            
            // Verificar se jsPDF está disponível
            if (!window.jsPDF) {
                await this.carregarJsPDF();
            }

            const pdfContent = await this.gerarPDF(registros);
            const nomeArquivo = this.gerarNomeArquivo('pdf');
            
            pdfContent.save(nomeArquivo);
            
            console.log('✅ PDF exportado com sucesso:', nomeArquivo);
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao exportar PDF:', error);
            throw new Error(`Falha na exportação PDF: ${error.message}`);
        }
    }

    // ✅ GERAR CONTEÚDO PDF
    async gerarPDF(registros) {
        try {
            const { jsPDF } = window;
            const doc = new jsPDF('landscape', 'mm', 'a4'); // Paisagem para mais colunas
            
            // Configurações
            const margemEsquerda = 10;
            const margemTopo = 20;
            let yAtual = margemTopo;
            
            // Cabeçalho do documento
            yAtual = this.adicionarCabecalhoPDF(doc, yAtual, registros.length);
            
            // Resumo executivo
            yAtual = this.adicionarResumoPDF(doc, yAtual, registros);
            
            // Tabela de registros
            yAtual = this.adicionarTabelaPDF(doc, yAtual, registros);
            
            // Rodapé
            this.adicionarRodapePDF(doc);
            
            return doc;
            
        } catch (error) {
            console.error('❌ Erro ao gerar PDF:', error);
            throw error;
        }
    }

    // ✅ ADICIONAR CABEÇALHO DO PDF
    adicionarCabecalhoPDF(doc, yInicial, totalRegistros) {
        try {
            let y = yInicial;
            
            // Título principal
            doc.setFontSize(20);
            doc.setTextColor(40, 116, 166);
            doc.text('🏥 Sistema de Banco de Horas - Enfermagem', 15, y);
            
            y += 10;
            
            // Subtítulo
            doc.setFontSize(14);
            doc.setTextColor(100, 100, 100);
            doc.text('Relatório Detalhado de Jornadas', 15, y);
            
            y += 8;
            
            // Informações do relatório
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(`Data de geração: ${new Date().toLocaleString('pt-BR')}`, 15, y);
            doc.text(`Total de registros: ${totalRegistros}`, 150, y);
            
            y += 8;
            
            // Linha separadora
            doc.setLineWidth(0.5);
            doc.setDrawColor(200, 200, 200);
            doc.line(15, y, 285, y);
            
            return y + 10;
            
        } catch (error) {
            console.error('❌ Erro no cabeçalho PDF:', error);
            return yInicial + 30;
        }
    }

    // ✅ ADICIONAR RESUMO EXECUTIVO NO PDF
    adicionarResumoPDF(doc, yInicial, registros) {
        try {
            let y = yInicial;
            const totais = this.calculadora.calcularTotais(registros);
            
            // Título da seção
            doc.setFontSize(14);
            doc.setTextColor(40, 116, 166);
            doc.text('📊 Resumo Executivo', 15, y);
            
            y += 10;
            
            // Caixa de resumo
            doc.setFillColor(245, 245, 245);
            doc.rect(15, y - 5, 270, 25, 'F');
            
            // Dados do resumo em colunas
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            
            const coluna1X = 20;
            const coluna2X = 100;
            const coluna3X = 180;
            const coluna4X = 240;
            
            // Linha 1
            doc.text(`Total de Plantões: ${totais.totalRegistros}`, coluna1X, y + 5);
            doc.text(`Saldo Banco: ${totais.saldoBanco}`, coluna2X, y + 5);
            doc.text(`Horas Extras: ${totais.horasExtrasTotal}`, coluna3X, y + 5);
            doc.text(`Bônus 90%: ${totais.horasBonus}`, coluna4X, y + 5);
            
            // Linha 2
            doc.setFontSize(12);
            doc.setTextColor(0, 150, 0);
            doc.text(`Valor Total: ${this.calculadora.formatarMoeda(totais.valorTotal)}`, coluna1X, y + 15);
            
            return y + 30;
            
        } catch (error) {
            console.error('❌ Erro no resumo PDF:', error);
            return yInicial + 40;
        }
    }

    // ✅ ADICIONAR TABELA DE REGISTROS NO PDF
    adicionarTabelaPDF(doc, yInicial, registros) {
        try {
            let y = yInicial;
            
            // Título da seção
            doc.setFontSize(14);
            doc.setTextColor(40, 116, 166);
            doc.text('📋 Detalhamento por Plantão', 15, y);
            
            y += 10;
            
            // Cabeçalho da tabela
            doc.setFontSize(8);
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(40, 116, 166);
            doc.rect(15, y - 3, 270, 8, 'F');
            
            const colunas = [
                { x: 18, texto: 'Data' },
                { x: 40, texto: 'Entrada' },
                { x: 60, texto: 'Saída' },
                { x: 80, texto: 'Tipo' },
                { x: 110, texto: 'Trabalhadas' },
                { x: 140, texto: 'Saldo' },
                { x: 165, texto: 'Extras' },
                { x: 190, texto: 'Valor Base' },
                { x: 225, texto: 'Bônus' },
                { x: 255, texto: 'Total' }
            ];
            
            colunas.forEach(col => {
                doc.text(col.texto, col.x, y + 2);
            });
            
            y += 10;
            
            // Dados da tabela
            doc.setTextColor(0, 0, 0);
            const registrosLimitados = registros.slice(0, 25); // Máximo 25 registros por página
            
            registrosLimitados.forEach((registro, index) => {
                if (y > 180) { // Nova página se necessário
                    doc.addPage('landscape');
                    y = 20;
                }
                
                // Linha alternada
                if (index % 2 === 0) {
                    doc.setFillColor(250, 250, 250);
                    doc.rect(15, y - 3, 270, 8, 'F');
                }
                
                // Dados
                doc.text(this.formatarDataBR(registro.data), 18, y + 2);
                doc.text(registro.entrada || '', 40, y + 2);
                doc.text(registro.saida || '', 60, y + 2);
                doc.text(this.limparTipoPlantao(registro.tipoPlantao || 'Normal'), 80, y + 2);
                doc.text(this.formatarHorasCSV(registro.horasTrabalhadas), 110, y + 2);
                doc.text(this.formatarHorasCSV(registro.saldoBanco), 140, y + 2);
                doc.text(this.formatarHorasCSV(registro.horasExtras), 165, y + 2);
                doc.text(this.formatarMoedaSimples(registro.valorBase), 190, y + 2);
                doc.text(this.formatarMoedaSimples(registro.valorBonus), 225, y + 2);
                doc.text(this.formatarMoedaSimples(registro.valorTotal), 255, y + 2);
                
                y += 8;
            });
            
            // Aviso se há mais registros
            if (registros.length > 25) {
                y += 5;
                doc.setFontSize(10);
                doc.setTextColor(150, 150, 150);
                doc.text(`* Mostrando primeiros 25 de ${registros.length} registros`, 15, y);
            }
            
            return y + 10;
            
        } catch (error) {
            console.error('❌ Erro na tabela PDF:', error);
            return yInicial + 50;
        }
    }

    // ✅ ADICIONAR RODAPÉ DO PDF
    adicionarRodapePDF(doc) {
        try {
            const totalPages = doc.internal.getNumberOfPages();
            
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                
                // Linha do rodapé
                doc.setLineWidth(0.3);
                doc.setDrawColor(200, 200, 200);
                doc.line(15, 200, 285, 200);
                
                // Texto do rodapé
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(`Sistema de Banco de Horas - Enfermagem v${this.versao}`, 15, 205);
                doc.text(`Página ${i} de ${totalPages}`, 260, 205);
                doc.text(`Gerado em ${new Date().toLocaleDateString('pt-BR')}`, 15, 210);
            }
            
        } catch (error) {
            console.error('❌ Erro no rodapé PDF:', error);
        }
    }

    // ✅ CARREGAR JSPDF DINAMICAMENTE
    async carregarJsPDF() {
        try {
            return new Promise((resolve, reject) => {
                if (window.jsPDF) {
                    resolve();
                    return;
                }
                
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
                script.onload = () => {
                    console.log('📦 jsPDF carregado com sucesso');
                    resolve();
                };
                script.onerror = () => {
                    reject(new Error('Falha ao carregar jsPDF'));
                };
                document.head.appendChild(script);
            });
            
        } catch (error) {
            console.error('❌ Erro ao carregar jsPDF:', error);
            throw error;
        }
    }

    // ✅ FUNÇÕES UTILITÁRIAS

    // Gerar nome do arquivo
    gerarNomeArquivo(extensao) {
        const agora = new Date();
        const dataFormatada = agora.toISOString().split('T')[0];
        const horaFormatada = agora.toTimeString().split(' ')[0].replace(/:/g, '-');
        
        return `banco-horas-enfermagem_${dataFormatada}_${horaFormatada}.${extensao}`;
    }

    // Formatar data para padrão brasileiro
    formatarDataBR(dataString) {
        try {
            if (!dataString) return '';
            const data = new Date(dataString + 'T00:00:00');
            return data.toLocaleDateString('pt-BR');
        } catch (error) {
            return dataString;
        }
    }

    // Obter dia da semana
    obterDiaSemana(dataString) {
        try {
            const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
            const data = new Date(dataString + 'T00:00:00');
            return dias[data.getDay()];
        } catch (error) {
            return 'Inválido';
        }
    }

    // Formatar horas para CSV
    formatarHorasCSV(horas) {
        if (typeof horas !== 'number' || isNaN(horas)) return '0h00m';
        
        const sinal = horas < 0 ? '-' : '';
        const horasAbs = Math.abs(horas);
        const h = Math.floor(horasAbs);
        const m = Math.round((horasAbs - h) * 60);
        
        return `${sinal}${h}h${m.toString().padStart(2, '0')}m`;
    }

    // Formatar número para CSV
    formatarNumeroCSV(numero) {
        if (typeof numero !== 'number' || isNaN(numero)) return '0,00';
        return numero.toFixed(2).replace('.', ',');
    }

    // Formatar moeda simples
    formatarMoedaSimples(valor) {
        if (typeof valor !== 'number' || isNaN(valor)) return 'R$ 0,00';
        return `R$ ${valor.toFixed(2).replace('.', ',')}`;
    }

    // Escapar texto para CSV
    escaparTextoCSV(texto) {
        if (!texto) return '';
        
        // Se contém vírgula, aspas ou quebra de linha, envolver em aspas
        if (texto.includes(',') || texto.includes('"') || texto.includes('\n')) {
            // Duplicar aspas internas e envolver em aspas
            return `"${texto.replace(/"/g, '""')}"`;
        }
        
        return texto;
    }

    // Limpar tipo de plantão (remover emojis)
    limparTipoPlantao(tipo) {
        if (!tipo) return 'Normal';
        return tipo.replace(/[🎁📅💼]/g, '').trim();
    }

    // Obter tipo de texto
    obterTipoTexto(registro) {
        if (registro.isFeriado || registro.feriado) return '🎁 Feriado';
        if (registro.isFimSemana || registro.fimSemana) return '📅 Fim de Semana';
        return '💼 Normal';
    }

    // Download de arquivo
    downloadFile(content, filename, contentType) {
        try {
            const blob = new Blob([content], { type: contentType });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Limpar URL após download
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            
            console.log('📥 Download iniciado:', filename);
            
        } catch (error) {
            console.error('❌ Erro no download:', error);
            throw new Error('Falha ao fazer download do arquivo');
        }
    }

    // ✅ EXPORTAR DADOS JSON (BACKUP)
    async exportarJSON(registros, configuracoes = null) {
        try {
            const dadosExportacao = {
                metadata: {
                    versao: this.versao,
                    exportadoEm: new Date().toISOString(),
                    totalRegistros: registros.length,
                    sistema: 'Banco de Horas - Enfermagem'
                },
                registros: registros,
                configuracoes: configuracoes
            };
            
            const jsonContent = JSON.stringify(dadosExportacao, null, 2);
            const nomeArquivo = this.gerarNomeArquivo('json');
            
            this.downloadFile(jsonContent, nomeArquivo, 'application/json');
            
            console.log('✅ JSON exportado com sucesso:', nomeArquivo);
            return true;
            
        } catch (error) {
            console.error('❌ Erro ao exportar JSON:', error);
            throw new Error(`Falha na exportação JSON: ${error.message}`);
        }
    }

    // ✅ DEBUG
    debug() {
        console.log('🔧 DEBUG - Exportador de Dados');
        console.log(`📊 Versão: ${this.versao}`);
        console.log('📤 Formatos suportados: CSV, PDF, JSON');
        console.log('🔗 jsPDF disponível:', !!window.jsPDF);
    }
}

// ✅ Exportar para uso global
if (typeof window !== 'undefined') {
    window.ExportadorDados = ExportadorDados;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportadorDados;
}

console.log('📤 Exportador de Dados carregado - v2.1.0');
