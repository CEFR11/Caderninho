import { fmt, dataCurta, rotuloSaldo, valorSaldo, pecasEmAberto } from './format'

export function linkWhatsApp(telefone, mensagem) {
  const digitos = telefone.replace(/\D/g, '')
  const numero = digitos.startsWith('55') ? digitos : `55${digitos}`
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
}

// itens: as peças anotadas juntas (fiado com mais de uma peça). pecaPaga: a peça que o pagamento abateu.
export function mensagemRecibo({ nome, tipo, item, itens = [], valor, data, vencimento, pecaPaga, saldoDepois }) {
  const linhasItens = itens.length > 1
    ? [...itens.map((i) => `• ${i.item}: ${fmt(i.valor)}`), `Total: ${fmt(valor)}`]
    : [`Item: ${item}`, `${tipo === 'fiado' ? 'Fiado' : 'Pagou'}: ${fmt(valor)}`]
  return [
    `Olá, ${nome}! Aqui está o registro ${tipo === 'fiado' ? 'da sua compra' : 'do seu pagamento'} no Caderninho:`,
    '',
    `Data: ${dataCurta(data)}`,
    ...linhasItens,
    ...(pecaPaga ? [`Abateu: ${pecaPaga}`] : []),
    ...(vencimento ? [`Pagar até: ${dataCurta(vencimento)}`] : []),
    '',
    `${rotuloSaldo(saldoDepois)}: ${valorSaldo(saldoDepois)}`,
  ].join('\n')
}

function linhaPeca(p) {
  const parcial = p.valorTotal !== p.valorOriginal ? ` (falta, de ${fmt(p.valorOriginal)})` : ''
  const prazo = p.vencimento ? ` · pagar até ${dataCurta(p.vencimento)}` : ''
  return `${dataCurta(p.data)} - ${p.item} - ${fmt(p.valorTotal)}${parcial}${prazo}`
}

export function mensagemExtrato(cliente) {
  const pecas = pecasEmAberto(cliente.lancamentos)
  if (pecas.length === 0) {
    return `Olá, ${cliente.nome}! Sua conta no Caderninho está em dia. Obrigado!`
  }

  return [
    `Olá, ${cliente.nome}! Segue o que está em aberto na sua conta:`,
    '',
    ...pecas.map(linhaPeca),
    '',
    `${rotuloSaldo(cliente.saldoDevedor)}: ${valorSaldo(cliente.saldoDevedor)}`,
  ].join('\n')
}

export function mensagemCobranca(cliente) {
  const vencimento = !cliente.vencimento ? ''
    : Number(cliente.diasAtraso) > 0 ? `, que venceu em ${dataCurta(cliente.vencimento)}`
      : `, com vencimento em ${dataCurta(cliente.vencimento)}`
  const pecas = pecasEmAberto(cliente.lancamentos)
  return [
    `Oi, ${cliente.nome}! Tudo bem?`,
    `Passando para lembrar da sua conta aqui: ${fmt(cliente.saldoDevedor)}${vencimento}.`,
    ...(pecas.length > 1 ? [`Em aberto: ${pecas.map((p) => `${p.item} (${fmt(p.valorTotal)})`).join(', ')}.`] : []),
    'Quando puder, passa aqui para acertar. Obrigado!',
  ].join('\n')
}
