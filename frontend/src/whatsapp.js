import { fmt, dataCurta, rotuloSaldo, valorSaldo, anotacoesEmAberto } from './format'

export function linkWhatsApp(telefone, mensagem) {
  const digitos = telefone.replace(/\D/g, '')
  const numero = digitos.startsWith('55') ? digitos : `55${digitos}`
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
}

export function mensagemRecibo({ nome, tipo, item, valor, data, saldoDepois }) {
  return [
    `Olá, ${nome}! Aqui está o registro ${tipo === 'fiado' ? 'da sua compra' : 'do seu pagamento'} no Caderninho:`,
    '',
    `Data: ${dataCurta(data)}`,
    `Item: ${item}`,
    `${tipo === 'fiado' ? 'Fiado' : 'Pagou'}: ${fmt(valor)}`,
    '',
    `${rotuloSaldo(saldoDepois)}: ${valorSaldo(saldoDepois)}`,
  ].join('\n')
}

export function mensagemExtrato(cliente) {
  const abertas = anotacoesEmAberto(cliente.lancamentos)
  if (abertas.length === 0) {
    return `Olá, ${cliente.nome}! Sua conta no Caderninho está em dia. Obrigado!`
  }

  const linhas = [`Olá, ${cliente.nome}! Segue o que está em aberto na sua conta:`, '']
  abertas.forEach((l) => {
    const rotulo = l.tipo === 'FIADO' ? 'Fiado' : 'Pagou'
    linhas.push(`${dataCurta(l.data)} - ${l.item} (${rotulo}) - ${fmt(l.valorTotal)}`)
  })
  linhas.push('', `${rotuloSaldo(cliente.saldoDevedor)}: ${valorSaldo(cliente.saldoDevedor)}`)
  return linhas.join('\n')
}

export function mensagemCobranca(cliente) {
  const desde = cliente.devendoDesde ? ` (desde ${dataCurta(cliente.devendoDesde)})` : ''
  return [
    `Oi, ${cliente.nome}! Tudo bem?`,
    `Passando para lembrar da sua conta aqui: ${fmt(cliente.saldoDevedor)}${desde}.`,
    'Quando puder, passa aqui para acertar. Obrigado!',
  ].join('\n')
}
