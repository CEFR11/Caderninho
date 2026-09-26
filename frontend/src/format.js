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

export function chaveDoMes(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`
}

export function chaveMesAtual() {
  return chaveDoMes(new Date())
}

export function mesAnoLabel(chaveAnoMes) {
  const [ano, mes] = chaveAnoMes.split('-').map(Number)
  return `${MESES_COMPLETOS[mes - 1]} ${ano}`
}

export function deslocarMes(chaveAnoMes, delta) {
  const [ano, mes] = chaveAnoMes.split('-').map(Number)
  return chaveDoMes(new Date(ano, mes - 1 + delta, 1))
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

const CORES_AVATAR = ['#1A7EF5', '#0E9F6E', '#E5484D', '#F5A524', '#2E7BE8', '#8B3EE8']

export function corAvatar(id) {
  return CORES_AVATAR[id % CORES_AVATAR.length]
}

export function dataCurta(dataISO) {
  const [, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}`
}

export function formatarTelefone(valor) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11)
  if (digitos.length === 0) return ''

  const ddd = digitos.slice(0, 2)
  if (digitos.length <= 2) return `(${ddd}`

  const numero = digitos.slice(2)
  const meio = numero.length > 4 ? numero.slice(0, -4) : numero
  const fim = numero.length > 4 ? numero.slice(-4) : ''

  return fim ? `(${ddd}) ${meio}-${fim}` : `(${ddd}) ${meio}`
}

export function dataHoraAgora() {
  const agora = new Date()
  const data = `${String(agora.getDate()).padStart(2, '0')}/${String(agora.getMonth() + 1).padStart(2, '0')}/${agora.getFullYear()}`
  const hora = `${String(agora.getHours()).padStart(2, '0')}:${String(agora.getMinutes()).padStart(2, '0')}`
  return `${data} às ${hora}`
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

// Para comparar nomes sem ligar para maiúsculas, acentos e espaços sobrando.
export function normalizarNome(nome) {
  return nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
}

export function soDigitos(valor) {
  return (valor || '').replace(/\D/g, '')
}

// Saldo negativo acontece quando o cliente paga a mais: vira crédito, não "dívida negativa".
export function rotuloSaldo(saldo) {
  return Number(saldo) < 0 ? 'Crédito do cliente' : 'Saldo devedor'
}

export function valorSaldo(saldo) {
  return fmt(Math.abs(Number(saldo)))
}

// Valor digitado no teclado do modal ("12,5") para número.
export function valorDigitado(texto) {
  return parseFloat((texto || '0').replace(',', '.')) || 0
}

// Número para o formato do teclado do modal (255.5 -> "255,50").
export function paraDigitado(numero) {
  return Number(numero).toFixed(2).replace('.', ',')
}
