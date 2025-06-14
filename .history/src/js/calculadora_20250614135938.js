// src/js/calculadora.js - Calculadora Unificada do Banco de Horas v1.0.0

class Calculadora {
    constructor() {
        this.HORAS_PADRAO = 8;
        this.MINUTOS_HORA = 60;
        this.BONUS_FIM_SEMANA = 0.90; // 90% adicional
    }

    calcularHorasTrabalhadas(entrada, saida, pausa = 60) {
        try {
            if (!entrada || !saida) return 0;

            const [horaEntrada, minutoEntrada] = entrada.split(':').map(Number);
            const [horaSaida, minutoSaida] = saida.split(':').map(Number);

            const totalMinutosEntrada = horaEntrada * this.MINUTOS_HORA + minutoEntrada;
            const totalMinutosSaida = horaSaida * this.MINUTOS_HORA + minutoSaida;
            
            let diferencaMinutos = totalMinutosSaida - totalMinutosEntrada - pausa;
            
            // Se passou da meia-noite
            if (diferencaMinutos < 0) {
                diferencaMinutos += 24 * this.MINUTOS_HORA;
            }

            return Math.round((diferencaMinutos / this.MINUTOS_HORA) * 100) / 100;
        } catch (error) {
            console.error('❌ Erro ao calcular horas trabalhadas:', error);
            return 0;
        }
    }

    calcularValorHora(valorBase, temBonus) {
        try {
            if (!valorBase || valorBase <= 0) return 0;
            return temBonus ? valorBase * (1 + this.BONUS_FIM_SEMANA) : valorBase;
        } catch (error) {
            console.error('❌ Erro ao calcular valor hora:', error);
            return 0;
        }
    }

    calcularValorRegistro(registro, valorHora) {
        try {
            if (!registro || !valorHora) return { horasTrabalhadas: 0, valorTotal: 0 };

            const horasTrabalhadas = this.calcularHorasTrabalhadas(
                registro.entrada,
                registro.saida,
                registro.pausa
            );

            const temBonus = registro.fimDeSemana || registro.feriado || this.ehFimDeSemana(registro.data);
            const valorHoraCalculado = this.calcularValorHora(valorHora, temBonus);
            const valorTotal = horasTrabalhadas * valorHoraCalculado;

            return {
                horasTrabalhadas,
                valorHora: valorHoraCalculado,
                valorTotal,
                temBonus,
                valorBase: valorHora,
                bonusAplicado: temBonus ? (valorHoraCalculado - valorHora) : 0
            };
        } catch (error) {
            console.error('❌ Erro ao calcular valor do registro:', error);
            return { horasTrabalhadas: 0, valorTotal: 0 };
        }
    }

    calcularTotais(registros, valorHora) {
        try {
            if (!registros || !registros.length) {
                return {
                    totalHorasNormais: 0,
                    totalHorasBonus: 0,
                    totalHorasGeral: 0,
                    totalValorNormal: 0,
                    totalValorBonus: 0,
                    totalValorGeral: 0,
                    totalRegistros: 0
                };
            }

            return registros.reduce((acc, registro) => {
                const calculo = this.calcularValorRegistro(registro, valorHora);
                
                if (calculo.temBonus) {
                    acc.totalHorasBonus += calculo.horasTrabalhadas;
                    acc.totalValorBonus += calculo.valorTotal;
                } else {
                    acc.totalHorasNormais += calculo.horasTrabalhadas;
                    acc.totalValorNormal += calculo.valorTotal;
                }

                acc.totalHorasGeral += calculo.horasTrabalhadas;
                acc.totalValorGeral += calculo.valorTotal;
                acc.totalRegistros++;

                return acc;
            }, {
                totalHorasNormais: 0,
                totalHorasBonus: 0,
                totalHorasGeral: 0,
                totalValorNormal: 0,
                totalValorBonus: 0,
                totalValorGeral: 0,
                totalRegistros: 0
            });
        } catch (error) {
            console.error('❌ Erro ao calcular totais:', error);
            return {
                totalHorasNormais: 0,
                totalHorasBonus: 0,
                totalHorasGeral: 0,
                totalValorNormal: 0,
                totalValorBonus: 0,
                totalValorGeral: 0,
                totalRegistros: 0
            };
        }
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

    obterEstatisticas(registros) {
        try {
            if (!registros || !registros.length) {
                return {
                    plantoesNormais: 0,
                    plantoesFimSemana: 0,
                    plantoesFeriado: 0,
                    mediaHorasPorPlantao: 0
                };
            }

            const stats = registros.reduce((acc, registro) => {
                if (registro.feriado) {
                    acc.plantoesFeriado++;
                } else if (registro.fimDeSemana || this.ehFimDeSemana(registro.data)) {
                    acc.plantoesFimSemana++;
                } else {
                    acc.plantoesNormais++;
                }

                const horas = this.calcularHorasTrabalhadas(
                    registro.entrada,
                    registro.saida,
                    registro.pausa
                );
                acc.totalHoras += horas;

                return acc;
            }, {
                plantoesNormais: 0,
                plantoesFimSemana: 0,
                plantoesFeriado: 0,
                totalHoras: 0
            });

            return {
                ...stats,
                mediaHorasPorPlantao: stats.totalHoras / registros.length
            };
        } catch (error) {
            console.error('❌ Erro ao obter estatísticas:', error);
            return {
                plantoesNormais: 0,
                plantoesFimSemana: 0,
                plantoesFeriado: 0,
                mediaHorasPorPlantao: 0
            };
        }
    }

    demonstrarCalculoBonus(valorBase) {
        try {
            const valorComBonus = this.calcularValorHora(valorBase, true);
            return {
                valorBase,
                multiplicador: '1.90',
                valorFinal: valorComBonus,
                exemplo11h: 11 * valorComBonus
            };
        } catch (error) {
            console.error('❌ Erro ao demonstrar cálculo:', error);
            return {
                valorBase: 0,
                multiplicador: '1.90',
                valorFinal: 0,
                exemplo11h: 0
            };
        }
    }
}

// Exportar a classe
window.Calculadora = Calculadora; 