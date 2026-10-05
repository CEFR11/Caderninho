import { useEffect, useState } from 'react'
import { api } from '../api'
import { iniciais, corAvatar, dataRelativa, dataCurta, rotuloSaldo, valorSaldo, situacaoVencimento, fmt, telefoneComPais, comprasEmAberto, prazoDaParcela } from '../format'
import { linkWhatsApp, mensagemExtrato, mensagemCobranca, ALVO_WHATSAPP } from '../whatsapp'
import EditarLancamentoModal from '../components/EditarLancamentoModal'
import ClienteModal from '../components/ClienteModal'
import ValorAnotacao from '../components/ValorAnotacao'

export default function Ficha({ clienteId, refreshKey, embutida = false, aoVoltar, aoAbrirLancamento, aoEditarLancamento, aoApagarLancamento, clientes, aoEditarCliente, aoExcluirCliente, aoMostrarToast }) {
  const [cliente, setCliente] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [editando, setEditando] = useState(null)
  const [editandoCliente, setEditandoCliente] = useState(false)

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
  const situacao = situacaoVencimento(cliente)
  // Em aberto: o que falta pagar, por compra. Histórico: pagamentos e peças já pagas, do mais novo ao mais antigo.
  const compras = comprasEmAberto(cliente.lancamentos, cliente.diaPagamento)
  const historico = cliente.lancamentos
    .filter((l) => l.tipo === 'PAGAMENTO' || Number(l.restante) === 0)
    .sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : (b.id ?? 0) - (a.id ?? 0)))

  return (
    <div className="screen">
      {!embutida && <button className="back" onClick={aoVoltar}>← Clientes</button>}

      <div className="ficha-head">
        <button className="editar-cliente" onClick={() => setEditandoCliente(true)}>Editar</button>
        <div className="av" style={{ background: corAvatar(cliente.id) }}>{iniciais(cliente.nome)}</div>
        <div className="nm">{cliente.nome}</div>
        <div className="tel">{telefoneComPais(cliente.telefone)}</div>
        <div className="tel">{cliente.diaPagamento ? `Paga todo dia ${cliente.diaPagamento}` : 'Sem dia combinado (prazo de 30 dias)'}</div>
        <div className={`ficha-sal ${saldo > 0 ? '' : 'ok'}`}>
          <div className="l">{rotuloSaldo(saldo)}</div>
          <div className="v">{valorSaldo(saldo)}</div>
          {cliente.devendoDesde && <div className="desde">deve desde {dataCurta(cliente.devendoDesde)}</div>}
          {situacao && <div className={`desde situacao ${situacao.classe}`}>{situacao.texto}</div>}
        </div>
        <div className="acts">
          <button className="btn debt" onClick={() => aoAbrirLancamento('fiado', cliente.id)}>+ Fiado</button>
          <button className="btn paid" onClick={() => aoAbrirLancamento('pagamento', cliente.id)}>+ Pagamento</button>
        </div>
        {saldo > 0 && (
          <a
            className="btn cobrar"
            href={linkWhatsApp(cliente.telefone, mensagemCobranca(cliente))}
            target={ALVO_WHATSAPP}
            rel="noopener noreferrer"
          >
            Cobrar pelo WhatsApp
          </a>
        )}
        <a
          className="btn"
          style={{ background: 'var(--primary)', color: '#fff', display: 'block', width: '100%', marginTop: 9, boxSizing: 'border-box', textAlign: 'center', textDecoration: 'none' }}
          href={linkWhatsApp(cliente.telefone, mensagemExtrato(cliente))}
          target={ALVO_WHATSAPP}
          rel="noopener noreferrer"
        >
          Enviar extrato pelo WhatsApp
        </a>
      </div>

      {cliente.lancamentos.length === 0
        ? <div className="empty">Nenhuma anotação ainda.</div>
        : <div className="dica">Anotou errado? Toque no item para corrigir ou apagar.</div>}

      {compras.length > 0 && (
        <>
          <div className="secao-titulo">
            <span>Em aberto</span>
            <b>{fmt(saldo)}</b>
          </div>
          {compras.map((compra) => (
            <div className="compra" key={compra.chave}>
              <div className="compra-cab">
                <div className="compra-nome">{compra.nome}</div>
                <div className="compra-info">
                  compra de {dataCurta(compra.data)}{compra.parcelas ? ` · em ${compra.parcelas}x` : ''}
                </div>
              </div>
              {compra.itens.map((i) => {
                const prazo = prazoDaParcela(i.venceEm)
                return (
                  <div className="compra-linha clicavel" key={i.lancamento.id} onClick={() => setEditando(i.lancamento)}>
                    {i.numero && <div className="parcela-n" title={`${i.numero}ª parcela`}>{i.numero}ª</div>}
                    <div className="b">
                      <div className={`prazo ${prazo.classe}`}>{prazo.texto}</div>
                      {i.restante < i.valorOriginal && <div className="falta">falta {fmt(i.restante)} de {fmt(i.valorOriginal)}</div>}
                    </div>
                    <div className="compra-valor">{fmt(i.restante)}</div>
                    <button
                      className="pagou-esta"
                      onClick={(e) => { e.stopPropagation(); aoAbrirLancamento('pagamento', cliente.id, { id: i.lancamento.id, item: i.lancamento.item, restante: i.restante }) }}
                    >
                      Pagou esta
                    </button>
                  </div>
                )
              })}
            </div>
          ))}
        </>
      )}

      {historico.length > 0 && (
        <>
          <div className="secao-titulo"><span>Histórico</span></div>
          {historico.map((l) => {
            const ehFiado = l.tipo === 'FIADO'
            const pecaAbatida = !ehFiado && l.fiadoPagoId && cliente.lancamentos.find((f) => f.id === l.fiadoPagoId)
            const detalhes = [
              dataRelativa(l.data),
              ehFiado && '✓ paga',
              pecaAbatida && `abateu ${pecaAbatida.item}`,
            ].filter(Boolean).join(' · ')
            return (
              <div className="ext clicavel" key={l.id} onClick={() => setEditando(l)}>
                <span className={`dot ${ehFiado ? 'debt' : 'paid'}`} />
                <div className="b">
                  <div className="it">{l.item}</div>
                  <div className="dt">{detalhes}</div>
                </div>
                <ValorAnotacao tipo={l.tipo} valor={l.valorTotal} />
              </div>
            )
          })}
        </>
      )}

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
