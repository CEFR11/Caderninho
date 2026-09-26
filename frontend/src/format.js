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

// "2026-09-26" -> "26/09/2026"
export function dataCompleta(dataISO) {
  const [ano, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}/${ano}`
}

export function dataCurta(dataISO) {
  const [, mes, dia] = dataISO.split('-')
  return `${dia}/${mes}`
}

// DDD + número, sem o +55: tira o 55 de quem colou com código do país e o 0 da frente
// (nenhum DDD começa com 0). Fica com no máximo 11 dígitos.
export function digitosNacionais(valor) {
  let digitos = soDigitos(valor)
  if (digitos.length >= 12 && digitos.startsWith('55')) digitos = digitos.slice(2)
  return digitos.replace(/^0+/, '').slice(0, 11)
}

// Telefone completo (DDD + 8 ou 9 dígitos)?
export function telefoneValido(valor) {
  const tamanho = digitosNacionais(valor).length
  return tamanho === 10 || tamanho === 11
}

// Como o telefone é salvo e mostrado: "+55 (85) 99999-0000". Número incompleto fica como está.
export function telefoneComPais(valor) {
  return telefoneValido(valor) ? `+55 ${formatarTelefone(valor)}` : (valor || '')
}

// Máscara do campo (o +55 fica fixo do lado de fora): "(85) 99999-0000".
export function formatarTelefone(valor) {
  const digitos = digitosNacionais(valor)
  if (digitos.length === 0) return ''

  const ddd = digitos.slice(0, 2)
  if (digitos.length <= 2) return `(${ddd}`

  const numero = digitos.slice(2)
  const meio = numero.length > 4 ? numero.slice(0, -4) : numero
  const fim = numero.length > 4 ? numero.slice(-4) : ''

  return fim ? `(${ddd}) ${meio}-${fim}` : `(${ddd}) ${meio}`
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

// Nome gravado nas parcelas: "Parcela 1/3 · Camisa, Tênis" (várias peças) ou "Tênis (1/3)" (uma peça).
function lerParcela(item) {
  const varias = item.match(/^Parcela (\d+)\/(\d+) · (.+)$/)
  if (varias) return { numero: Number(varias[1]), total: Number(varias[2]), nome: varias[3] }
  const uma = item.match(/^(.+) \((\d+)\/(\d+)\)$/)
  if (uma) return { numero: Number(uma[2]), total: Number(uma[3]), nome: uma[1] }
  return null
}

// O que falta pagar, em compras: as parcelas da mesma compra ficam juntas, e as compras vêm na ordem
// de quem vence primeiro. O backend calcula o "restante" de cada fiado; o vencimento sem data marcada
// segue a mesma regra do backend (dia combinado ou 30 dias).
// Cada compra: { chave, nome, data, parcelas (nº de vezes, ou null), total, itens: [{ lancamento, numero, restante, valorOriginal, venceEm }] }
export function comprasEmAberto(lancamentos, diaPagamento) {
  const compras = new Map()
  lancamentos
    .filter((l) => l.tipo === 'FIADO' && Number(l.restante) > 0)
    .forEach((l) => {
      const parcela = lerParcela(l.item)
      const chave = parcela ? `${l.data}|${parcela.nome}|${parcela.total}` : `id:${l.id}`
      if (!compras.has(chave)) {
        compras.set(chave, { chave, nome: parcela ? parcela.nome : l.item, data: l.data, parcelas: parcela?.total ?? null, total: 0, itens: [] })
      }
      const compra = compras.get(chave)
      compra.total += Number(l.restante)
      compra.itens.push({
        lancamento: l,
        numero: parcela?.numero ?? null,
        restante: Number(l.restante),
        valorOriginal: Number(l.valorTotal),
        venceEm: l.vencimento || vencimentoPadrao(l.data, diaPagamento),
      })
    })
  const lista = [...compras.values()]
  lista.forEach((c) => c.itens.sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0) || (a.venceEm < b.venceEm ? -1 : 1)))
  const primeiroVencimento = (c) => c.itens.reduce((min, i) => (i.venceEm < min ? i.venceEm : min), c.itens[0].venceEm)
  return lista.sort((a, b) => (primeiroVencimento(a) < primeiroVencimento(b) ? -1 : primeiroVencimento(a) > primeiroVencimento(b) ? 1 : 0))
}

// "venceu 17/09" (atrasado), "vence hoje", "vence 30/10 · faltam 3 dias" ou "vence 30/10".
export function prazoDaParcela(venceEm) {
  const faltam = diasAte(venceEm)
  if (faltam < 0) return { classe: 'late', texto: `venceu ${dataCurta(venceEm)}` }
  if (faltam === 0) return { classe: 'soon', texto: 'vence hoje' }
  if (faltam <= 5) return { classe: 'soon', texto: `vence ${dataCurta(venceEm)} · faltam ${faltam} dia${faltam > 1 ? 's' : ''}` }
  return { classe: 'ok', texto: `vence ${dataCurta(venceEm)}` }
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

// Mesmo dia `meses` meses depois; dia 31 em mês mais curto vira o último dia do mês.
export function somarMeses(dataISO, meses) {
  const [ano, mes, dia] = dataISO.split('-').map(Number)
  const ultimoDia = new Date(ano, mes - 1 + meses + 1, 0).getDate()
  const d = new Date(ano, mes - 1 + meses, Math.min(dia, ultimoDia))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Divide o total em `n` parcelas iguais, em centavos; o que sobra da divisão vai na primeira.
export function dividirEmParcelas(total, n) {
  const centavos = Math.round(total * 100)
  const base = Math.floor(centavos / n)
  return Array.from({ length: n }, (_, i) => (base + (i === 0 ? centavos - base * n : 0)) / 100)
}

// Nome de cada parcela: "Tênis (1/3)" com uma peça; "Parcela 1/3 · Camisa, Bermuda e mais 3" com várias.
export function nomeDaParcela(itens, numero, total) {
  if (itens.length === 1) return `${itens[0].item} (${numero}/${total})`
  const nomes = itens.length <= 3
    ? itens.map((i) => i.item).join(', ')
    : `${itens[0].item}, ${itens[1].item} e mais ${itens.length - 2}`
  return `Parcela ${numero}/${total} · ${nomes}`
}
