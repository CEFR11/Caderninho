import { useEffect, useRef, useState } from 'react'
import { fmt, iniciais, corAvatar, dataHojeISO, valorDigitado, paraDigitado, vencimentoPadrao, dataCurta, somarMeses, dividirEmParcelas, nomeDaParcela, telefoneComPais, normalizarNome } from '../format'
import { linkWhatsApp, mensagemRecibo, ALVO_WHATSAPP } from '../whatsapp'
import ClienteModal from './ClienteModal'
import MicButton from './MicButton'

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫']
const OPCOES_PARCELAS = [1, 2, 3, 4, 5, 6]

export default function LancamentoModal({ aberto, clientes, clienteInicialId, tipoInicial, fiadoAlvo, aoFechar, aoRegistrar, aoDesfazer, aoCadastrarCliente, aoMostrarToast }) {
  const [clienteId, setClienteId] = useState(null)
  const [tipo, setTipo] = useState('fiado')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(dataHojeISO())
  const [vencimento, setVencimento] = useState('')
  // Peças já adicionadas neste fiado ("+ outra peça"); a que está sendo digitada entra no fim.
  const [pecas, setPecas] = useState([])
  // Em quantas vezes o total do fiado vai ser pago (1 = à vista, sem parcelar).
  const [parcelas, setParcelas] = useState(1)
  // Fiado em dois passos: 'pecas' (digitar as peças) e 'fechar' (total, datas e parcelas).
  const [etapa, setEtapa] = useState('pecas')
  // Peça que o pagamento vai abater (vem do "Pagou esta" da ficha; pode ser desligada).
  const [alvo, setAlvo] = useState(null)
  const [erroSalvar, setErroSalvar] = useState(null)
  const [confirmarExcedente, setConfirmarExcedente] = useState(false)
  const [pickerAberto, setPickerAberto] = useState(false)
  const [buscaPicker, setBuscaPicker] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [novoClienteAberto, setNovoClienteAberto] = useState(false)
  const [recemCriado, setRecemCriado] = useState(null)
  const [recibo, setRecibo] = useState(null)
  const [desfazendo, setDesfazendo] = useState(false)
  const aoTeclarRef = useRef(null)

  useEffect(() => {
    if (!aberto) return
    // Sem cliente pré-escolhido: evita anotar na pessoa errada sem perceber.
    setClienteId(clienteInicialId ?? null)
    setTipo(tipoInicial || 'fiado')
    setValor(fiadoAlvo ? paraDigitado(fiadoAlvo.restante) : '')
    setAlvo(fiadoAlvo ?? null)
    setPecas([])
    setParcelas(1)
    setEtapa('pecas')
    setDescricao('')
    setData(dataHojeISO())
    setVencimento('')
    setErroSalvar(null)
    setConfirmarExcedente(false)
    setPickerAberto(!clienteInicialId)
    setBuscaPicker('')
    setRecemCriado(null)
    setRecibo(null)
  }, [aberto, clienteInicialId, tipoInicial, fiadoAlvo])

  // Teclado físico (útil no computador): a função muda a cada render, então o listener
  // chama sempre a versão mais recente pela ref.
  useEffect(() => {
    if (!aberto) return
    const ouvir = (e) => aoTeclarRef.current?.(e)
    window.addEventListener('keydown', ouvir)
    return () => window.removeEventListener('keydown', ouvir)
  }, [aberto])

  if (!aberto) return null

  // clienteInicialId acabou de ser criado no fluxo abaixo e pode ainda não ter chegado
  // na lista `clientes` (refetch do App é assíncrono) — cobre esse intervalo.
  const clientesEfetivos = recemCriado && !clientes.some((c) => c.id === recemCriado.id)
    ? [...clientes, recemCriado]
    : clientes

  const clienteAtual = clientesEfetivos.find((c) => c.id === clienteId)

  async function cadastrarClienteInline(dados) {
    const cliente = await aoCadastrarCliente(dados)
    setRecemCriado(cliente)
    setClienteId(cliente.id)
    setPickerAberto(false)
    setNovoClienteAberto(false)
  }

  function tecla(k) {
    setConfirmarExcedente(false)
    if (k === '⌫') setValor((v) => v.slice(0, -1))
    else if (k === ',') setValor((v) => (v.includes(',') ? v : v + ','))
    else setValor((v) => (v.replace(',', '').length < 7 ? v + k : v))
  }

  const saldoAtual = clienteAtual ? Number(clienteAtual.saldoDevedor) : 0
  const totalPecas = pecas.reduce((soma, p) => soma + p.valor, 0)

  const totalDoFiado = totalPecas + valorDigitado(valor)

  // "3x de R$ 60,00 · 26/10, 26/11 e 26/12" (ou "1ª de R$ 33,34 e 2 de R$ 33,33 · …" quando não divide certinho).
  function resumoParcelas() {
    const valores = dividirEmParcelas(totalPecas, parcelas)
    const primeiro = vencimento || vencimentoPadrao(data, clienteAtual.diaPagamento)
    const datas = valores.map((_, k) => dataCurta(somarMeses(primeiro, k)))
    const quanto = valores[0] === valores[1]
      ? `${parcelas}x de ${fmt(valores[0])}`
      : `1ª de ${fmt(valores[0])} e ${parcelas - 1} de ${fmt(valores[1])}`
    return `${quanto} · ${datas.slice(0, -1).join(', ')} e ${datas[datas.length - 1]}`
  }

  const fechandoFiado = tipo === 'fiado' && etapa === 'fechar' && clienteAtual

  // OK do primeiro passo: a peça que está sendo digitada entra na lista e abre o fechamento.
  function irParaFechar() {
    if (totalDoFiado <= 0) return
    const numero = valorDigitado(valor)
    if (numero > 0) {
      setPecas((lista) => [...lista, { item: descricao.trim() || (lista.length ? `Peça ${lista.length + 1}` : 'Fiado'), valor: numero }])
      setValor('')
      setDescricao('')
    }
    setEtapa('fechar')
  }

  // Sem nenhuma peça, não há o que fechar: volta para o primeiro passo.
  function tirarPeca(idx) {
    const restantes = pecas.filter((_, i) => i !== idx)
    setPecas(restantes)
    if (restantes.length === 0) setEtapa('pecas')
  }

  function adicionarPeca() {
    const numero = valorDigitado(valor)
    if (numero <= 0) return
    setPecas((lista) => [...lista, { item: descricao.trim() || `Peça ${lista.length + 1}`, valor: numero }])
    setValor('')
    setDescricao('')
  }

  async function salvar(valorForcado = null) {
    const digitado = valorForcado ?? valorDigitado(valor)
    // No fiado, junta as peças já adicionadas com a que está digitada agora.
    const itens = tipo === 'fiado'
      ? [...pecas, ...(digitado > 0 ? [{ item: descricao.trim() || (pecas.length ? `Peça ${pecas.length + 1}` : 'Fiado'), valor: digitado }] : [])]
      : [{ item: descricao.trim() || 'Pagamento', valor: digitado }]
    const numero = itens.reduce((soma, i) => soma + i.valor, 0)
    if (numero <= 0 || !clienteAtual || salvando) return
    // Pagamento maior que a dívida: pergunta antes, em vez de deixar o saldo negativo sem querer.
    if (tipo === 'pagamento' && numero > saldoAtual && valorForcado === null) {
      setConfirmarExcedente(true)
      return
    }
    const parcelado = tipo === 'fiado' && parcelas > 1
    // Parcelado: o total vira uma anotação por parcela, uma por mês a partir do primeiro vencimento.
    const primeiroVencimento = vencimento || vencimentoPadrao(data, clienteAtual.diaPagamento)
    const listaParcelas = parcelado
      ? dividirEmParcelas(numero, parcelas).map((v, k) => ({
        item: nomeDaParcela(itens, k + 1, parcelas),
        valor: v,
        vencimento: somarMeses(primeiroVencimento, k),
      }))
      : null
    const anotacoes = parcelado
      ? listaParcelas.map((p) => ({ tipo: 'FIADO', item: p.item, valorTotal: p.valor, data, vencimento: p.vencimento, fiadoPagoId: null }))
      : itens.map((i) => ({
        tipo: tipo === 'fiado' ? 'FIADO' : 'PAGAMENTO',
        item: i.item,
        valorTotal: i.valor,
        data,
        vencimento: tipo === 'fiado' && vencimento ? vencimento : null,
        fiadoPagoId: tipo === 'pagamento' && alvo ? alvo.id : null,
      }))
    setSalvando(true)
    setErroSalvar(null)
    try {
      const clienteAtualizado = await aoRegistrar(clienteAtual.id, anotacoes, parcelado ? parcelas : 1)
      const saldoDepois = Number(clienteAtualizado.saldoDevedor)
      // As anotações recém-criadas são as de maior id na lista devolvida pelo backend.
      const lancamentoIds = clienteAtualizado.lancamentos.map((l) => l.id).sort((a, b) => b - a).slice(0, anotacoes.length)
      setRecibo({
        lancamentoIds,
        nome: clienteAtual.nome,
        telefone: clienteAtual.telefone,
        tipo,
        item: itens.map((i) => i.item).join(' + '),
        itens,
        parcelas: listaParcelas,
        pecaPaga: tipo === 'pagamento' && alvo ? alvo.item : null,
        valor: numero,
        data,
        vencimento: tipo === 'fiado' && !parcelado ? primeiroVencimento : null,
        saldoDepois,
      })
    } catch {
      setErroSalvar('Não salvou. Confira a internet e tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  aoTeclarRef.current = (e) => {
    if (novoClienteAberto) return
    if (e.key === 'Escape') { aoFechar(); return }
    if (recibo || pickerAberto) return
    const digitandoNoCampo = e.target instanceof HTMLInputElement
    if (e.key === 'Enter') {
      e.preventDefault()
      if (confirmarExcedente) return
      if (tipo === 'fiado' && !fechandoFiado) irParaFechar()
      else salvar()
      return
    }
    if (fechandoFiado) return
    if (digitandoNoCampo) return
    if (/^[0-9]$/.test(e.key)) tecla(e.key)
    else if (e.key === ',' || e.key === '.') tecla(',')
    else if (e.key === 'Backspace') tecla('⌫')
  }

  async function desfazer() {
    if (desfazendo) return
    setDesfazendo(true)
    try {
      await aoDesfazer(recibo.lancamentoIds)
      aoFechar()
    } catch {
      aoMostrarToast('Não foi possível desfazer. Tente pela ficha do cliente.')
    } finally {
      setDesfazendo(false)
    }
  }

  const listaPicker = clientesEfetivos
    .filter((c) => normalizarNome(c.nome).includes(normalizarNome(buscaPicker)))
    .sort((a, b) => a.nome.localeCompare(b.nome))

  return (
    <div className="ov open" onClick={(e) => { if (e.target === e.currentTarget) aoFechar() }}>
      <div className="sheet">
        <div className="grab" />
        <div className="sh">
          <div className="t">{recibo ? 'Anotado!' : 'Nova anotação'}</div>
          <button className="x" onClick={aoFechar}>✕</button>
        </div>

        {recibo && (
          <div className="lanc-body">
            <div style={{ textAlign: 'center', padding: '6px 0 16px' }}>
              <div style={{ fontSize: 38, lineHeight: 1 }}>✅</div>
              <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 16, marginTop: 10 }}>
                {recibo.tipo === 'fiado' ? 'Fiado anotado' : 'Pagamento anotado'}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4 }}>
                {recibo.nome} · {recibo.item} · {fmt(recibo.valor)}{recibo.parcelas ? ` em ${recibo.parcelas.length}x` : ''}
              </div>
            </div>
            <a
              className="cf"
              style={{ background: 'var(--paid)', display: 'block', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
              href={linkWhatsApp(recibo.telefone, mensagemRecibo(recibo))}
              target={ALVO_WHATSAPP}
              rel="noopener noreferrer"
            >
              Enviar comprovante pelo WhatsApp
            </a>
            <button
              className="cf"
              style={{ background: 'var(--line)', color: 'var(--ink)', marginTop: 8 }}
              onClick={aoFechar}
            >
              Fechar
            </button>
            <button className="apagar" onClick={desfazer} disabled={desfazendo}>
              {desfazendo ? 'Desfazendo…' : 'Anotei errado — desfazer'}
            </button>
          </div>
        )}

        {!recibo && (
        <>
        <button className="who-btn" onClick={() => setPickerAberto((v) => !v)}>
          <span
            className="av"
            style={{ width: 30, height: 30, borderRadius: 9, fontSize: 11, background: clienteAtual ? corAvatar(clienteAtual.id) : '#B9BFD2' }}
          >
            {clienteAtual ? iniciais(clienteAtual.nome) : '--'}
          </span>
          <span className="who-tx">Cliente<b>{clienteAtual ? clienteAtual.nome : 'Escolha o cliente'}</b></span>
          <span className="chev">trocar ⌄</span>
        </button>

        {pickerAberto && (
          <div className="picker open">
            <div className="search" style={{ marginBottom: 9 }}>
              <input
                placeholder="Buscar cliente..."
                value={buscaPicker}
                onChange={(e) => setBuscaPicker(e.target.value)}
                autoFocus
              />
              <MicButton aoOuvir={setBuscaPicker} />
            </div>

            <button className="add-cliente" onClick={() => setNovoClienteAberto(true)}>
              <span className="add-cliente-ic">+</span>
              Cadastrar novo cliente
            </button>

            <div>
              {listaPicker.length === 0
                ? <div className="empty">Ninguém encontrado.</div>
                : listaPicker.map((c) => (
                  <div className="prow" key={c.id} onClick={() => { setClienteId(c.id); setPickerAberto(false) }}>
                    <span className="av" style={{ width: 32, height: 32, borderRadius: 10, fontSize: 11, background: corAvatar(c.id) }}>
                      {iniciais(c.nome)}
                    </span>
                    <div className="info">
                      <div className="nm">{c.nome}</div>
                      <div className="sub">{Number(c.saldoDevedor) > 0 ? `deve ${fmt(c.saldoDevedor)}` : 'em dia'} · {telefoneComPais(c.telefone)}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {!pickerAberto && !fechandoFiado && (
          <div className="lanc-body">
            <div className="seg">
              <button className={tipo === 'fiado' ? 'on-d' : ''} onClick={() => { setTipo('fiado'); setConfirmarExcedente(false); setAlvo(null) }}>FIADO</button>
              <button
                className={tipo === 'pagamento' ? 'on-p' : ''}
                onClick={() => setTipo('pagamento')}
                disabled={pecas.length > 0}
                title={pecas.length > 0 ? 'Termine ou tire as peças do fiado antes' : undefined}
              >
                PAGAMENTO
              </button>
            </div>
            {tipo === 'fiado' && pecas.length > 0 && (
              <div className="pecas">
                {pecas.map((p, idx) => (
                  <div className="peca" key={idx}>
                    <span className="n">{p.item}</span>
                    <span className="v">{fmt(p.valor)}</span>
                    <button className="limpar-data" onClick={() => tirarPeca(idx)} aria-label="Tirar peça">✕</button>
                  </div>
                ))}
                <div className="peca-total">Até agora: {fmt(totalPecas)} · digite a próxima peça ou toque em OK</div>
              </div>
            )}
            {tipo === 'pagamento' && alvo && (
              <div className="alvo-peca">
                <span>Abatendo <b>{alvo.item}</b> · falta {fmt(alvo.restante)}</span>
                <button className="limpar-data" onClick={() => setAlvo(null)} aria-label="Não ligar a uma peça">✕</button>
              </div>
            )}
            <div className="amt-d">{valor ? `R$ ${valor}` : 'R$ 0,00'}</div>
            {tipo === 'pagamento' && saldoAtual > 0 && (
              <button className="pagou-tudo" onClick={() => { setValor(paraDigitado(saldoAtual)); setConfirmarExcedente(false) }}>
                Pagou tudo · {fmt(saldoAtual)}
              </button>
            )}
            <div className="desc">
              <input
                placeholder={tipo === 'fiado' ? 'O que levou? (ex: pão, leite e café)' : 'Como pagou? (Pix, dinheiro…)'}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
              <MicButton aoOuvir={(texto) => setDescricao(texto.charAt(0).toUpperCase() + texto.slice(1))} />
            </div>
            {tipo === 'fiado' && (
              <button className="outra-peca" onClick={adicionarPeca} disabled={valorDigitado(valor) <= 0}>
                + outra peça
              </button>
            )}
            {tipo === 'pagamento' && (
              <div className="data-linha">
                <span>Quando foi?</span>
                <input type="date" value={data} max={dataHojeISO()} onChange={(e) => setData(e.target.value || dataHojeISO())} />
              </div>
            )}
            <div className="pad">
              {TECLAS.map((k) => <button key={k} onClick={() => tecla(k)}>{k}</button>)}
            </div>
            {confirmarExcedente && (
              <div className="aviso-excedente">
                <div>
                  {clienteAtual.nome} deve só <b>{fmt(Math.max(0, saldoAtual))}</b> e você digitou <b>{fmt(valorDigitado(valor))}</b>.
                </div>
                {saldoAtual > 0 && (
                  <button className="cf" style={{ background: 'var(--paid)' }} onClick={() => { setValor(paraDigitado(saldoAtual)); salvar(saldoAtual) }}>
                    Anotar só {fmt(saldoAtual)} (quita a conta)
                  </button>
                )}
                <button className="cf secundario" onClick={() => salvar(valorDigitado(valor))}>
                  Anotar {fmt(valorDigitado(valor))} e deixar {fmt(valorDigitado(valor) - Math.max(0, saldoAtual))} de crédito
                </button>
              </div>
            )}
            {erroSalvar && <div className="form-erro" style={{ margin: '0 3px 10px' }}>{erroSalvar}</div>}
            <button
              className="cf"
              style={{ background: !clienteAtual ? 'var(--muted)' : tipo === 'fiado' ? 'var(--debt)' : 'var(--paid)' }}
              onClick={!clienteAtual ? () => setPickerAberto(true) : tipo === 'fiado' ? irParaFechar : () => salvar()}
              disabled={salvando || confirmarExcedente || (clienteAtual && tipo === 'fiado' && totalDoFiado <= 0)}
            >
              {salvando ? 'Salvando…'
                : !clienteAtual ? 'Escolha o cliente primeiro'
                  : tipo === 'pagamento' ? 'Anotar pagamento'
                    : `OK · ${fmt(totalDoFiado)}`}
            </button>
          </div>
        )}

        {!pickerAberto && fechandoFiado && (
          <div className="lanc-body">
            <button className="voltar-pecas" onClick={() => setEtapa('pecas')}>‹ Voltar e mexer nas peças</button>
            <div className="fechar-resumo">
              {pecas.map((p, idx) => (
                <div className="peca" key={idx}>
                  <span className="n">{p.item}</span>
                  <span className="v">{fmt(p.valor)}</span>
                  <button className="limpar-data" onClick={() => tirarPeca(idx)} aria-label="Tirar peça">✕</button>
                </div>
              ))}
              <div className="fechar-total">
                <span>Total</span>
                <b>{fmt(totalPecas)}</b>
              </div>
            </div>
            <div className="data-linha">
              <span>Quando foi?</span>
              <input type="date" value={data} max={dataHojeISO()} onChange={(e) => setData(e.target.value || dataHojeISO())} />
            </div>
            <div className="data-linha">
              <span>{parcelas > 1 ? '1ª parcela quando?' : 'Vai pagar quando?'} <i>(opcional)</i></span>
              <span className="data-com-limpar">
                <input type="date" value={vencimento} min={data} onChange={(e) => setVencimento(e.target.value)} />
                {vencimento && <button className="limpar-data" onClick={() => setVencimento('')} aria-label="Tirar data">✕</button>}
              </span>
            </div>
            {!vencimento && (
              <div className="dica-venc">
                Sem data marcada: {parcelas > 1 ? 'a 1ª vence' : 'vence'} {dataCurta(vencimentoPadrao(data, clienteAtual.diaPagamento))}
                {clienteAtual.diaPagamento ? ` (dia ${clienteAtual.diaPagamento} combinado)` : ' (30 dias)'}
              </div>
            )}
            <div className="parcelar">
              <div className="parcelar-t">Parcelar em</div>
              <div className="parcelas-opcoes">
                {OPCOES_PARCELAS.map((n) => (
                  <button key={n} className={parcelas === n ? 'on' : ''} onClick={() => setParcelas(n)}>
                    {n === 1 ? 'À vista' : `${n}x`}
                  </button>
                ))}
              </div>
              {parcelas > 1 && <div className="parcelar-resumo">{resumoParcelas()}</div>}
            </div>
            {erroSalvar && <div className="form-erro" style={{ margin: '0 3px 10px' }}>{erroSalvar}</div>}
            <button className="cf" style={{ background: 'var(--debt)' }} onClick={() => salvar()} disabled={salvando}>
              {salvando ? 'Salvando…' : `Anotar fiado · ${fmt(totalPecas)}${parcelas > 1 ? ` em ${parcelas}x` : ''}`}
            </button>
          </div>
        )}
        </>
        )}
      </div>

      <ClienteModal
        aberto={novoClienteAberto}
        clientes={clientesEfetivos}
        aoFechar={() => setNovoClienteAberto(false)}
        aoSalvar={cadastrarClienteInline}
        aoUsarExistente={(c) => { setClienteId(c.id); setPickerAberto(false); setNovoClienteAberto(false) }}
      />
    </div>
  )
}
