import { fmt, dataCurta } from './format'

export function linkWhatsApp(telefone, mensagem) {
  const digitos = telefone.replace(/\D/g, '')
  const numero = digitos.startsWith('55') ? digitos : `55${digitos}`
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`
}

export function mensagemRecibo({ nome, tipo, item, valor, data, saldoDepois }) {
  return [
    `Olá, ${nome}! Aqui está o registro da sua compra no Caderninho:`,
    '',
    `Data: ${dataCurta(data)}`,
    `Item: ${item}`,
    `${tipo === 'fiado' ? 'Fiado' : 'Pagamento'}: ${fmt(valor)}`,
    '',
    `Saldo devedor atual: ${fmt(saldoDepois)}`,
  ].join('\n')
}

export function mensagemExtrato(cliente) {
  const linhas = [`Olá, ${cliente.nome}! Segue seu extrato no Caderninho:`, '']

  if (cliente.lancamentos.length === 0) {
    linhas.push('Nenhum lançamento registrado ainda.')
  } else {
    const ordenados = [...cliente.lancamentos].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0))
    ordenados.forEach((l) => {
      const rotulo = l.tipo === 'FIADO' ? 'Fiado' : 'Pagamento'
      linhas.push(`${dataCurta(l.data)} - ${l.item} (${rotulo}) - ${fmt(l.valorTotal)}`)
    })
  }

  linhas.push('', `Saldo devedor atual: ${fmt(cliente.saldoDevedor)}`)
  return linhas.join('\n')
}
