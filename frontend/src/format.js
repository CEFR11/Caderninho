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

export function dataHojeISO() {
  const hoje = new Date()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${hoje.getFullYear()}-${mes}-${dia}`
}

export function iniciais(nome) {
  return nome
    .split(' ')
    .filter((palavra) => palavra.length > 2)
    .slice(0, 2)
    .map((palavra) => palavra[0])
    .join('')
    .toUpperCase()
}

const CORES_AVATAR = ['#4B2EE8', '#0E9F6E', '#E5484D', '#F5A524', '#2E7BE8', '#8B3EE8']

export function corAvatar(id) {
  return CORES_AVATAR[id % CORES_AVATAR.length]
}

export function dataCurta(dataISO) {
  const [, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}`
}

export function dataRelativa(dataISO) {
  const hoje = dataHojeISO()
  if (dataISO === hoje) return 'hoje'
  const ontem = new Date()
  ontem.setDate(ontem.getDate() - 1)
  const ontemISO = `${ontem.getFullYear()}-${String(ontem.getMonth() + 1).padStart(2, '0')}-${String(ontem.getDate()).padStart(2, '0')}`
  if (dataISO === ontemISO) return 'ontem'
  const [, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}`
}
