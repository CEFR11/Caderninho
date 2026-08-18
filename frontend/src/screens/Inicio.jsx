import { useEffect, useState } from 'react'
import { api } from '../api'
import { fmt } from '../format'

export default function Inicio() {
  const [resumo, setResumo] = useState(null)
  const [devedores, setDevedores] = useState(0)
  const [atrasados, setAtrasados] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregar() {
      try {
        const [dadosResumo, dadosFila, dadosAtrasados] = await Promise.all([
          api.resumo(),
          api.fila('prioridade'),
          api.fila('atrasados'),
        ])
        setResumo(dadosResumo)
        setDevedores(dadosFila.length)
        setAtrasados(dadosAtrasados)
      } catch (e) {
        setErro('Não foi possível carregar os dados. Confira se o backend está rodando em localhost:8080.')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

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
    </div>
  )
}
