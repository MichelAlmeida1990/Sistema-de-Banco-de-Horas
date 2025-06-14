// src/js/calculadora.js
class CalculadoraBancoHoras {
    constructor() {
        console.log('🧮 Calculadora de Banco de Horas iniciada');
    }

    calcularValorHora(valorBase, comBonus = false, feriado = false) {
        let multiplicador = 1;
        
        if (comBonus) multiplicador = 1.9; // 90% de bônus
        if (feriado) multiplicador = 2; // 100% de bônus
        
        return valorBase * multiplicador;
    }

    calcularValorRegistro(registro, valorHora) {
        const horasTrabalhadas = this.calcularHorasTrabalhadas(registro);
        const temBonus = registro.fimDeSemana || registro.feriado || this.ehFimDeSemana(registro.data);
        const valorHoraCalculado = this.calcularValorHora(valorHora, temBonus, registro.feriado);
        
        const saldoHoras = this.calcularSaldoHoras(registro);
        const { horasExtrasRemuneradas, bancoHoras } = this.distribuirHorasExtras(saldoHoras, registro.usarBancoHoras);
        
        return {
            horasTrabalhadas,
            saldoHoras,
            horasExtrasRemuneradas,
            bancoHoras,
            temBonus,
            valorHora: valorHoraCalculado,
            valorTotal: horasTrabalhadas * valorHoraCalculado
        };
    }

    calcularHorasTrabalhadas(registro) {
        const entrada = this.converterParaMinutos(registro.entrada);
        const saida = this.converterParaMinutos(registro.saida);
        const pausa = registro.pausa || 0;
        
        let minutosTrabalhados = saida - entrada - pausa;
        if (minutosTrabalhados < 0) minutosTrabalhados += 24 * 60; // Caso vire o dia
        
        return minutosTrabalhados / 60;
    }

    calcularSaldoHoras(registro) {
        const horasTrabalhadas = this.calcularHorasTrabalhadas(registro);
        return horasTrabalhadas - 6; // Considerando jornada de 6h
    }

    distribuirHorasExtras(saldoHoras, usarBancoHoras) {
        if (saldoHoras <= 0) {
            return { horasExtrasRemuneradas: 0, bancoHoras: saldoHoras };
        }
        
        if (usarBancoHoras) {
            return { horasExtrasRemuneradas: 0, bancoHoras: saldoHoras };
        }
        
        return { horasExtrasRemuneradas: saldoHoras, bancoHoras: 0 };
    }

    calcularSaldoBanco(registros) {
        let saldoTotal = 0;
        let saldoRemunerado = 0;
        let saldoBanco = 0;
        
        registros.forEach(registro => {
            const saldo = this.calcularSaldoHoras(registro);
            saldoTotal += saldo;
            
            if (registro.usarBancoHoras) {
                saldoBanco += saldo;
            } else if (saldo > 0) {
                saldoRemunerado += saldo;
            }
        });
        
        return { saldoTotal, saldoRemunerado, saldoBanco };
    }

    calcularTotais(registros, valorHora) {
        let totalHorasGeral = 0;
        let totalHorasFimSemana = 0;
        let totalValorGeral = 0;
        
        registros.forEach(registro => {
            const calculo = this.calcularValorRegistro(registro, valorHora);
            totalHorasGeral += calculo.horasTrabalhadas;
            totalValorGeral += calculo.valorTotal;
            
            if (registro.fimDeSemana || registro.feriado || this.ehFimDeSemana(registro.data)) {
                totalHorasFimSemana += calculo.horasTrabalhadas;
            }
        });
        
        return { totalHorasGeral, totalHorasFimSemana, totalValorGeral };
    }

    ehFimDeSemana(data) {
        const dia = new Date(data + 'T00:00:00').getDay();
        return dia === 0 || dia === 6; // 0 = Domingo, 6 = Sábado
    }

    converterParaMinutos(horario) {
        const [horas, minutos] = horario.split(':').map(Number);
        return horas * 60 + minutos;
    }

    validarRegistro(dados) {
        const erros = [];
        
        if (!dados.data) erros.push('Data é obrigatória');
        if (!dados.entrada) erros.push('Hora de entrada é obrigatória');
        if (!dados.saida) erros.push('Hora de saída é obrigatória');
        
        // Validar formato das horas
        const regexHora = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (dados.entrada && !regexHora.test(dados.entrada)) erros.push('Hora de entrada inválida');
        if (dados.saida && !regexHora.test(dados.saida)) erros.push('Hora de saída inválida');
        
        return {
            valido: erros.length === 0,
            erros
        };
    }

    obterEstatisticas(registros) {
        return {
            plantoesNormais: registros.filter(r => !r.fimDeSemana && !r.feriado && !this.ehFimDeSemana(r.data)).length,
            plantoesFimSemana: registros.filter(r => r.fimDeSemana || this.ehFimDeSemana(r.data)).length,
            plantoesFeriado: registros.filter(r => r.feriado).length
        };
    }

    obterInfoSistema() {
        return {
            versao: '5.0.0',
            bonusFimSemana: '90%',
            bonusFeriado: '100%',
            jornadaPadrao: '6h'
        };
    }

    demonstrarCalculoBonus(valorBase) {
        return {
            valorBase: valorBase,
            multiplicador: '1.90',
            valorFinal: this.calcularValorHora(valorBase, true),
            exemplo11h: this.calcularValorHora(valorBase, true) * 11
        };
    }
}

// Exportar para uso global
window.CalculadoraBancoHoras = CalculadoraBancoHoras; 