import { useEffect, useRef, useState } from 'react'
import { api } from '../api'
import { fmt, iniciais, corAvatar, dataRelativa, dataHoraAgora, dataCurta, rotuloSaldo, valorSaldo } from '../format'
import { linkWhatsApp, mensagemExtrato } from '../whatsapp'
import { gerarEcompartilharImagem } from '../reciboImagem'
import ReciboCard from '../components/ReciboCard'
import EditarLancamentoModal from '../components/EditarLancamentoModal'
import ClienteModal from '../components/ClienteModal'

export default function Ficha({ clienteId, refreshKey, embutida = false, aoVoltar, aoAbrirLancamento, aoEditarLancamento, aoApagarLancamento, clientes, aoEditarCliente, aoExcluirCliente, aoMostrarToast }) {
  const [cliente, setCliente] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [compartilhando, setCompartilhando] = useState(false)
  const [editando, setEditando] = useState(null)
  const [editandoCliente, setEditandoCliente] = useState(false)
  const reciboRef = useRef(null)

  useEffect(() => {
    setCarregando(true)
    api.cliente(clienteId)
      .then(setCliente)
      .catch(() => setErro('Não foi possível carregar o cliente. Confira se o backend está rodando.'))
      .finally(() => setCarregando(false))
  }, [clienteId, refreshKey])

  if (carregando) return <div className="screen"><div className="estado">Carregando…</div></div>
  if (erro) return <div className="screen"><div className="estado erro">{erro}</div></div>

  const saldo = Number(cliente.saldoDevedor)
  const extrato = [...cliente.lancamentos].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0))

  async function compartilharImagemExtrato() {
    if (!reciboRef.current || compartilhando) return
    setCompartilhando(true)
    try {
      const resultado = await gerarEcompartilharImagem(reciboRef.current, `extrato-${cliente.nome}.png`, mensagemExtrato(cliente))
      if (resultado === 'baixado') aoMostrarToast('Imagem baixada — anexe no WhatsApp')
    } catch (e) {
      if (e.name !== 'AbortError') aoMostrarToast('Não foi possível gerar a imagem do extrato')
    } finally {
      setCompartilhando(false)
    }
  }

  return (
    <div className="screen">
      {!embutida && <button className="back" onClick={aoVoltar}>← Clientes</button>}

      <div className="ficha-head">
        <button className="editar-cliente" onClick={() => setEditandoCliente(true)}>Editar</button>
        <div className="av" style={{ background: corAvatar(cliente.id) }}>{iniciais(cliente.nome)}</div>
        <div className="nm">{cliente.nome}</div>
        <div className="tel">{cliente.telefone}</div>
        <div className={`ficha-sal ${saldo > 0 ? '' : 'ok'}`}>
          <div className="l">{rotuloSaldo(saldo)}</div>
          <div className="v">{valorSaldo(saldo)}</div>
          {cliente.devendoDesde && <div className="desde">deve desde {dataCurta(cliente.devendoDesde)}</div>}
        </div>
        <div className="acts">
          <button className="btn debt" onClick={() => aoAbrirLancamento('fiado', cliente.id)}>+ Fiado</button>
          <button className="btn paid" onClick={() => aoAbrirLancamento('pagamento', cliente.id)}>+ Pagamento</button>
        </div>
        <button
          className="btn"
          style={{ background: 'var(--primary)', display: 'block', width: '100%', marginTop: 9, boxSizing: 'border-box' }}
          onClick={compartilharImagemExtrato}
          disabled={compartilhando}
        >
          {compartilhando ? 'Gerando imagem…' : 'Compartilhar extrato (imagem)'}
        </button>
        <a
          className="back"
          style={{ display: 'block', textAlign: 'center', padding: '10px 0 0' }}
          href={linkWhatsApp(cliente.telefone, mensagemExtrato(cliente))}
          target="_blank"
          rel="noopener noreferrer"
        >
          Ou enviar só como texto
        </a>
      </div>

      <div style={{ position: 'fixed', top: 0, left: -9999, zIndex: -1 }}>
        <ReciboCard
          ref={reciboRef}
          dados={{ modo: 'extrato', nome: cliente.nome, itens: extrato, saldo, emitidoEm: dataHoraAgora() }}
        />
      </div>

      <div className="eyebrow">Extrato completo</div>
      {extrato.length > 0 && <div className="dica">Anotou errado? Toque no item para corrigir ou apagar.</div>}
      {extrato.length === 0
        ? <div className="empty">Sem lançamentos ainda.</div>
        : extrato.map((l, idx) => {
          const ehFiado = l.tipo === 'FIADO'
          return (
            <div className="ext clicavel" key={l.id ?? idx} onClick={() => setEditando(l)}>
              <span className={`dot ${ehFiado ? 'debt' : 'paid'}`} />
              <div className="b">
                <div className="it">{l.item}</div>
                <div className="dt">{dataRelativa(l.data)}</div>
              </div>
              <div className={`vl ${ehFiado ? 'debt' : 'paid'}`}>{ehFiado ? '+' : '−'}{fmt(l.valorTotal)}</div>
            </div>
          )
        })}

      <EditarLancamentoModal
        lancamento={editando}
        aoFechar={() => setEditando(null)}
        aoSalvar={async (id, dados) => { await aoEditarLancamento(id, dados); setEditando(null) }}
        aoApagar={async (id) => { await aoApagarLancamento(id); setEditando(null) }}
      />

      <ClienteModal
        aberto={editandoCliente}
        clienteInicial={cliente}
        clientes={clientes}
        aoFechar={() => setEditandoCliente(false)}
        aoSalvar={async (dados) => { await aoEditarCliente(cliente.id, dados); setEditandoCliente(false) }}
        aoExcluir={async (id) => { await aoExcluirCliente(id); setEditandoCliente(false) }}
      />
    </div>
  )
}
