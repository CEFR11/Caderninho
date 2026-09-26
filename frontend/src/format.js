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
  return Number(saldo) < 0 ? 'Crédito do cliente' : 'Total que deve'
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

// Peças (fiados) que ainda falta pagar, da mais antiga para a mais nova. O backend calcula o
// "restante" de cada fiado: pagamento ligado a uma peça abate dela; o resto abate das mais antigas.
export function pecasEmAberto(lancamentos) {
  return lancamentos
    .filter((l) => l.tipo === 'FIADO' && Number(l.restante) > 0)
    .sort((a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : (a.id ?? 0) - (b.id ?? 0)))
    .map((l) => ({ ...l, valorTotal: Number(l.restante), valorOriginal: Number(l.valorTotal) }))
}

// Dias de hoje até a data (negativo se já passou).
export function diasAte(dataISO) {
  const [ano, mes, dia] = dataISO.split('-').map(Number)
  const hoje = new Date()
  const inicioDeHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  return Math.round((new Date(ano, mes - 1, dia) - inicioDeHoje) / 86400000)
}

// Situação da conta pelo vencimento (dia combinado ou prazo padrão de 30 dias).
export function situacaoVencimento({ vencimento, diasAtraso }) {
  if (!vencimento) return null
  const atraso = Number(diasAtraso)
  if (atraso > 0) {
    return { classe: 'late', rotulo: 'atrasado', texto: `venceu ${dataCurta(vencimento)} · ${atraso} dia${atraso > 1 ? 's' : ''} de atraso` }
  }
  const faltam = diasAte(vencimento)
  if (faltam <= 5) {
    return { classe: 'soon', rotulo: 'vence logo', texto: faltam === 0 ? 'vence hoje' : `vence ${dataCurta(vencimento)} · faltam ${faltam} dia${faltam > 1 ? 's' : ''}` }
  }
  return { classe: 'ok', rotulo: 'em dia', texto: `vence ${dataCurta(vencimento)}` }
}

// Mesmo cálculo do backend (Cliente.vencimentoDoFiado) para um fiado sem data marcada:
// o primeiro dia combinado depois da compra, ou a compra + 30 dias.
export function vencimentoPadrao(dataCompraISO, diaPagamento) {
  const [ano, mes, dia] = dataCompraISO.split('-').map(Number)
  const paraISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  if (!diaPagamento) return paraISO(new Date(ano, mes - 1, dia + 30))
  const diaNoMes = (a, m) => new Date(a, m, Math.min(diaPagamento, new Date(a, m + 1, 0).getDate()))
  let candidato = diaNoMes(ano, mes - 1)
  if (candidato <= new Date(ano, mes - 1, dia)) candidato = diaNoMes(ano, mes)
  return paraISO(candidato)
}
