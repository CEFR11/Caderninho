import { useEffect, useState } from 'react'
import { api } from '../api'
import { fmt, dataRelativa } from '../format'

export default function Inicio({ refreshKey }) {
  const [resumo, setResumo] = useState(null)
  const [devedores, setDevedores] = useState(0)
  const [atrasados, setAtrasados] = useState([])
  const [recentes, setRecentes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregar() {
      try {
        const [dadosResumo, dadosFila, dadosAtrasados, dadosClientes] = await Promise.all([
          api.resumo(),
          api.fila('prioridade'),
          api.fila('atrasados'),
          api.clientes(),
        ])
        setResumo(dadosResumo)
        setDevedores(dadosFila.length)
        setAtrasados(dadosAtrasados)

        const movimentos = dadosClientes
          .flatMap((c) => c.lancamentos.map((l) => ({ ...l, nome: c.nome })))
          .sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0))
          .slice(0, 6)
        setRecentes(movimentos)
      } catch (e) {
        setErro('Não foi possível carregar os dados. Confira se o backend está rodando em localhost:8080.')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [refreshKey])

  if (carregando) return <div className="estado">Carregando…</div>
  if (erro) return <div className="estado erro">{erro}</div>

  const total = Number(resumo.totalAReceber)
  const recebidoMes = Number(resumo.recebidoNoMes)
  const pct = (recebidoMes + total) > 0
    ? Math.round((recebidoMes / (recebidoMes + total)) * 100)
    : 0
  const somaAtrasados = atrasados.reduce((s, c) => s + Number(c.saldo), 0)

  return (
    <div className="screen">
      <div className="hero">
        <div className="lbl">Total a receber</div>
        <div className="big">{fmt(total)}</div>
        <div className="sub">{devedores} clientes com saldo em aberto</div>
        <div className="bar"><span style={{ width: `${pct}%` }} /></div>
        <div className="bar-legend">
          <span>Recebido no mês {fmt(recebidoMes)}</span>
          <span>{pct}%</span>
        </div>
      </div>

      <div className="quickgrid">
        <div className="qcard">
          <div className="t">Fiado hoje</div>
          <div className="v debt">{fmt(resumo.fiadoHoje)}</div>
        </div>
        <div className="qcard">
          <div className="t">Recebido hoje</div>
          <div className="v paid">{fmt(resumo.recebidoHoje)}</div>
        </div>
      </div>

      {atrasados.length > 0 && (
        <div className="alert">
          <div className="ic">!</div>
          <div className="tx">
            <b>{atrasados.length} cliente{atrasados.length > 1 ? 's' : ''}</b> {atrasados.length > 1 ? 'estão' : 'está'} há mais de 30 dias sem pagar nada.
            Juntos somam <b>{fmt(somaAtrasados)}</b>.
          </div>
        </div>
      )}

      <div className="eyebrow">Movimento recente</div>
      {recentes.length === 0
        ? <div className="empty">Nenhum lançamento ainda.</div>
        : recentes.map((r, idx) => {
          const ehFiado = r.tipo === 'FIADO'
          return (
            <div className="ext" key={idx}>
              <span className={`dot ${ehFiado ? 'debt' : 'paid'}`} />
              <div className="b">
                <div className="it">{r.nome}</div>
                <div className="dt">{r.item} · {dataRelativa(r.data)}</div>
              </div>
              <div className={`vl ${ehFiado ? 'debt' : 'paid'}`}>{ehFiado ? '+' : '−'}{fmt(r.valorTotal)}</div>
            </div>
          )
        })}
    </div>
  )
}
