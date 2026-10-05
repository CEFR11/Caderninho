import { fmt, dataCurta, dataCompleta, digitosNacionais, comprasEmAberto, diasAte } from './format'

// Nome da loja que assina as mensagens (VITE_NOME_LOJA no .env do frontend, fora do git).
// Sem ele, as mensagens saem sem assinatura.
const NOME_LOJA = import.meta.env.VITE_NOME_LOJA?.trim() || ''

// No computador, o link wa.me abre uma aba nova do WhatsApp Web a cada envio (o WhatsApp Web não deixa
// outro site reaproveitar a aba dele). Então lá a mensagem vai direto para o WhatsApp Desktop (whatsapp://),
// que precisa estar instalado. No celular o wa.me já abre o app.
const NO_CELULAR = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)

export function linkWhatsApp(telefone, mensagem) {
  const numero = `55${digitosNacionais(telefone)}`
  const texto = encodeURIComponent(mensagem)
  return NO_CELULAR
    ? `https://wa.me/${numero}?text=${texto}`
    : `whatsapp://send?phone=${numero}&text=${texto}`
}

// O whatsapp:// abre o app sem aba; com _blank o navegador deixaria uma aba vazia para trás.
export const ALVO_WHATSAPP = NO_CELULAR ? '_blank' : undefined

// No WhatsApp, *texto* sai em negrito.
function linhaSaldo(saldo) {
  const valor = Number(saldo)
  if (valor > 0) return `Saldo em aberto: *${fmt(valor)}*`
  if (valor < 0) return `Crédito a seu favor: *${fmt(-valor)}*`
  return 'Sua conta está quitada.'
}

// Assinatura no fim de toda mensagem.
function comAssinatura(linhas) {
  return [...linhas, ...(NOME_LOJA ? ['', `*${NOME_LOJA}*`] : [])].join('\n')
}

function saudacao(nome) {
  return `Olá, ${nome}! Tudo bem?`
}

// Comprovante enviado logo depois de anotar um fiado ou um pagamento.
// itens: as peças do fiado. parcelas: quando o fiado foi parcelado, cada parcela com valor e vencimento.
// pecaPaga: a peça que o pagamento abateu.
export function mensagemRecibo({ nome, tipo, item, itens = [], parcelas, valor, data, vencimento, pecaPaga, saldoDepois }) {
  if (tipo === 'pagamento') {
    const forma = item && item !== 'Pagamento' ? ` (${item})` : ''
    return comAssinatura([
      saudacao(nome),
      '',
      `Confirmamos o recebimento do seu pagamento de *${fmt(valor)}* em ${dataCompleta(data)}${forma}.`,
      ...(pecaPaga ? [`Referente a: ${pecaPaga}.`] : []),
      '',
      linhaSaldo(saldoDepois),
      '',
      'Obrigado pela preferência!',
    ])
  }

  const linhasItens = itens.length > 1
    ? [...itens.map((i) => `• ${i.item} — ${fmt(i.valor)}`), `*Total: ${fmt(valor)}*`]
    : [`• ${item} — *${fmt(valor)}*`]
  const linhasPrazo = parcelas?.length > 1
    ? [
      `Parcelado em ${parcelas.length}x:`,
      ...parcelas.map((p, idx) => `${idx + 1}ª parcela — ${fmt(p.valor)} — vence em ${dataCompleta(p.vencimento)}`),
    ]
    : vencimento ? [`Vencimento: ${dataCompleta(vencimento)}`] : []

  return comAssinatura([
    saudacao(nome),
    '',
    `Segue o comprovante da sua compra de ${dataCompleta(data)}:`,
    '',
    ...linhasItens,
    ...(linhasPrazo.length ? ['', ...linhasPrazo] : []),
    '',
    linhaSaldo(saldoDepois),
    '',
    'Qualquer dúvida, estamos à disposição. Obrigado pela preferência!',
  ])
}

// "vence em 30/10" ou, se já passou, "venceu em 17/09".
function textoPrazo(venceEm) {
  return diasAte(venceEm) < 0 ? `venceu em ${dataCurta(venceEm)}` : `vence em ${dataCurta(venceEm)}`
}

// Uma compra em aberto: o nome uma vez só e, embaixo, cada parcela (ou o valor, se não for parcelada).
function linhasCompra(compra) {
  const cabecalho = `*${compra.nome}* — compra de ${dataCurta(compra.data)}${compra.parcelas ? `, em ${compra.parcelas}x` : ''}`
  const linhas = compra.itens.map((i) => {
    const parcial = i.restante < i.valorOriginal ? ` (restante de ${fmt(i.valorOriginal)})` : ''
    const rotulo = i.numero ? `${i.numero}ª parcela — ` : ''
    return `${rotulo}${fmt(i.restante)}${parcial} — ${textoPrazo(i.venceEm)}`
  })
  return [cabecalho, ...linhas]
}

// Extrato com tudo o que está em aberto na conta.
export function mensagemExtrato(cliente) {
  const compras = comprasEmAberto(cliente.lancamentos, cliente.diaPagamento)
  if (compras.length === 0) {
    return comAssinatura([
      saudacao(cliente.nome),
      '',
      'Passando para informar que sua conta está quitada. Obrigado pela preferência!',
    ])
  }

  return comAssinatura([
    saudacao(cliente.nome),
    '',
    'Segue o extrato atualizado da sua conta:',
    ...compras.flatMap((c) => ['', ...linhasCompra(c)]),
    '',
    `*Total em aberto: ${fmt(cliente.saldoDevedor)}*`,
    '',
    'Qualquer dúvida, estamos à disposição.',
  ])
}

// O que cobrar agora: as parcelas já vencidas; se nada venceu, só as do próximo vencimento.
// As parcelas que vencem depois ficam de fora — cobrar o total assusta quem parcelou.
function parcelasACobrar(compras) {
  const itens = compras.flatMap((c) => c.itens.map((i) => ({ ...i, compra: c })))
  const vencidas = itens.filter((i) => diasAte(i.venceEm) < 0)
  if (vencidas.length) return { vencidas: true, itens: vencidas }
  const proximo = itens.reduce((min, i) => (i.venceEm < min ? i.venceEm : min), itens[0].venceEm)
  return { vencidas: false, itens: itens.filter((i) => i.venceEm === proximo) }
}

// "Tênis — 2ª parcela — R$ 50,00 — venceu em 17/09"
function linhaCobranca(i) {
  const parcela = i.numero ? ` — ${i.numero}ª parcela` : ''
  return `• ${i.compra.nome}${parcela} — ${fmt(i.restante)} — ${textoPrazo(i.venceEm)}`
}

// Lembrete de pagamento: cobra o que venceu (ou o próximo vencimento), não a conta toda.
export function mensagemCobranca(cliente) {
  const compras = comprasEmAberto(cliente.lancamentos, cliente.diaPagamento)
  if (compras.length === 0) return mensagemExtrato(cliente)

  const { vencidas, itens } = parcelasACobrar(compras)
  const valor = itens.reduce((soma, i) => soma + i.restante, 0)
  const sobra = compras.reduce((n, c) => n + c.itens.length, 0) > itens.length
  const chamada = vencidas
    ? `Passando para lembrar que há um valor vencido na sua conta: *${fmt(valor)}*.`
    : `Passando para lembrar do seu próximo vencimento, em ${dataCompleta(itens[0].venceEm)}: *${fmt(valor)}*.`

  return comAssinatura([
    saudacao(cliente.nome),
    '',
    chamada,
    '',
    ...itens.map(linhaCobranca),
    ...(sobra ? ['', 'As demais parcelas seguem nas datas combinadas.'] : []),
    '',
    'Quando puder, é só passar aqui ou nos avisar como prefere pagar.',
    'Se o pagamento já foi feito, por favor desconsidere esta mensagem.',
    '',
    'Obrigado!',
  ])
}
