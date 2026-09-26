import { useEffect, useRef, useState } from 'react'
import { fmt, iniciais, corAvatar, dataHojeISO, dataHoraAgora, valorDigitado, paraDigitado } from '../format'
import { linkWhatsApp, mensagemRecibo } from '../whatsapp'
import { gerarEcompartilharImagem } from '../reciboImagem'
import ClienteModal from './ClienteModal'
import ReciboCard from './ReciboCard'
import MicButton from './MicButton'

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫']

export default function LancamentoModal({ aberto, clientes, clienteInicialId, tipoInicial, aoFechar, aoRegistrar, aoDesfazer, aoCadastrarCliente, aoMostrarToast }) {
  const [clienteId, setClienteId] = useState(null)
  const [tipo, setTipo] = useState('fiado')
  const [valor, setValor] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState(dataHojeISO())
  const [erroSalvar, setErroSalvar] = useState(null)
  const [confirmarExcedente, setConfirmarExcedente] = useState(false)
  const [pickerAberto, setPickerAberto] = useState(false)
  const [buscaPicker, setBuscaPicker] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [novoClienteAberto, setNovoClienteAberto] = useState(false)
  const [recemCriado, setRecemCriado] = useState(null)
  const [recibo, setRecibo] = useState(null)
  const [compartilhando, setCompartilhando] = useState(false)
  const [desfazendo, setDesfazendo] = useState(false)
  const reciboRef = useRef(null)
  const aoTeclarRef = useRef(null)

  useEffect(() => {
    if (!aberto) return
    // Sem cliente pré-escolhido: evita anotar na pessoa errada sem perceber.
    setClienteId(clienteInicialId ?? null)
    setTipo(tipoInicial || 'fiado')
    setValor('')
    setDescricao('')
    setData(dataHojeISO())
    setErroSalvar(null)
    setConfirmarExcedente(false)
    setPickerAberto(!clienteInicialId)
    setBuscaPicker('')
    setRecemCriado(null)
    setRecibo(null)
  }, [aberto, clienteInicialId, tipoInicial])

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

  async function salvar(valorForcado = null) {
    const numero = valorForcado ?? valorDigitado(valor)
    if (numero <= 0 || !clienteAtual || salvando) return
    // Pagamento maior que a dívida: pergunta antes, em vez de deixar o saldo negativo sem querer.
    if (tipo === 'pagamento' && numero > saldoAtual && valorForcado === null) {
      setConfirmarExcedente(true)
      return
    }
    setSalvando(true)
    setErroSalvar(null)
    try {
      const item = descricao || (tipo === 'fiado' ? 'Fiado' : 'Pagamento')
      const clienteAtualizado = await aoRegistrar(clienteAtual.id, {
        tipo: tipo === 'fiado' ? 'FIADO' : 'PAGAMENTO',
        item,
        valorTotal: numero,
        data,
      })
      const saldoDepois = Number(clienteAtualizado.saldoDevedor)
      // O lançamento recém-criado é o de maior id na lista devolvida pelo backend.
      const lancamentoId = Math.max(...clienteAtualizado.lancamentos.map((l) => l.id))
      setRecibo({
        lancamentoId,
        nome: clienteAtual.nome,
        telefone: clienteAtual.telefone,
        tipo,
        item,
        valor: numero,
        data,
        saldoDepois,
        emitidoEm: dataHoraAgora(),
      })
    } catch {
      setErroSalvar('Não salvou. Confira a internet e tente de novo.')
    } finally {
      setSalvando(false)
    }
  }

  async function compartilharImagemRecibo() {
    if (!reciboRef.current || compartilhando) return
    setCompartilhando(true)
    try {
      const resultado = await gerarEcompartilharImagem(reciboRef.current, `recibo-${recibo.nome}.png`, mensagemRecibo(recibo))
      if (resultado === 'baixado') aoMostrarToast('Imagem baixada — anexe no WhatsApp')
    } catch (e) {
      if (e.name !== 'AbortError') aoMostrarToast('Não foi possível gerar a imagem do recibo')
    } finally {
      setCompartilhando(false)
    }
  }

  aoTeclarRef.current = (e) => {
    if (novoClienteAberto) return
    if (e.key === 'Escape') { aoFechar(); return }
    if (recibo || pickerAberto) return
    const digitandoNoCampo = e.target instanceof HTMLInputElement
    if (e.key === 'Enter') { e.preventDefault(); if (!confirmarExcedente) salvar(); return }
    if (digitandoNoCampo) return
    if (/^[0-9]$/.test(e.key)) tecla(e.key)
    else if (e.key === ',' || e.key === '.') tecla(',')
    else if (e.key === 'Backspace') tecla('⌫')
  }

  async function desfazer() {
    if (desfazendo) return
    setDesfazendo(true)
    try {
      await aoDesfazer(recibo.lancamentoId)
      aoFechar()
    } catch {
      aoMostrarToast('Não foi possível desfazer. Tente pela ficha do cliente.')
    } finally {
      setDesfazendo(false)
    }
  }

  const listaPicker = clientesEfetivos
    .filter((c) => c.nome.toLowerCase().includes(buscaPicker.toLowerCase()))
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
                {recibo.nome} · {recibo.item} · {fmt(recibo.valor)}
              </div>
            </div>
            <button
              className="cf"
              style={{ background: 'var(--primary)', boxSizing: 'border-box' }}
              onClick={compartilharImagemRecibo}
              disabled={compartilhando}
            >
              {compartilhando ? 'Gerando imagem…' : 'Compartilhar recibo (imagem)'}
            </button>
            <a
              className="cf"
              style={{ background: 'var(--paid)', display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 8, boxSizing: 'border-box' }}
              href={linkWhatsApp(recibo.telefone, mensagemRecibo(recibo))}
              target="_blank"
              rel="noopener noreferrer"
            >
              Ou enviar só como texto
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

        {recibo && (
          <div style={{ position: 'fixed', top: 0, left: -9999, zIndex: -1 }}>
            <ReciboCard
              ref={reciboRef}
              dados={{
                modo: 'transacao',
                nome: recibo.nome,
                data: recibo.data,
                item: recibo.item,
                tipoLancamento: recibo.tipo,
                valor: recibo.valor,
                saldo: recibo.saldoDepois,
                emitidoEm: recibo.emitidoEm,
              }}
            />
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
                      <div className="sub">{Number(c.saldoDevedor) > 0 ? `deve ${fmt(c.saldoDevedor)}` : 'em dia'} · {c.telefone}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {!pickerAberto && (
          <div className="lanc-body">
            <div className="seg">
              <button className={tipo === 'fiado' ? 'on-d' : ''} onClick={() => { setTipo('fiado'); setConfirmarExcedente(false) }}>FIADO</button>
              <button className={tipo === 'pagamento' ? 'on-p' : ''} onClick={() => setTipo('pagamento')}>PAGAMENTO</button>
            </div>
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
            <div className="data-linha">
              <span>Quando foi?</span>
              <input type="date" value={data} max={dataHojeISO()} onChange={(e) => setData(e.target.value || dataHojeISO())} />
            </div>
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
              onClick={clienteAtual ? () => salvar() : () => setPickerAberto(true)}
              disabled={salvando || confirmarExcedente}
            >
              {salvando ? 'Salvando…' : !clienteAtual ? 'Escolha o cliente primeiro' : tipo === 'fiado' ? 'Anotar fiado' : 'Anotar pagamento'}
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
