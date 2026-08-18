export function fmt(valor) {
  const numero = Number(valor ?? 0)
  return 'R$ ' + numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

const MESES_COMPLETOS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export function mesEAnoAtual() {
  const hoje = new Date()
  return `${MESES_COMPLETOS[hoje.getMonth()]} ${hoje.getFullYear()}`
}
