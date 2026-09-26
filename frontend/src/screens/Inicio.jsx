import { useEffect, useState } from 'react'
import { api } from '../api'
import ValorAnotacao from '../components/ValorAnotacao'
import { fmt, dataRelativa, dataCurta, dataHojeISO } from '../format'

function fimDoMesCurto() {
  const [ano, mes] = dataHojeISO().split('-').map(Number)
  const ultimo = new Date(ano, mes, 0).getDate()
  return dataCurta(`${ano}-${String(mes).padStart(2, '0')}-${ultimo}`)
}

export default function Inicio({ refreshKey, aoVerVenceNoMes }) {
  const [resumo, setResumo] = useState(null)
  const [devedores, setDevedores] = useState(0)
  const [clientesAtrasados, setClientesAtrasados] = useState(0)
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
        setClientesAtrasados(dadosAtrasados.length)

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
  const venceNoMes = Number(resumo.venceNoMes)
  const clientesVenceNoMes = Number(resumo.clientesVenceNoMes)

  return (
    <div className="screen">
      <div className="dash-grid">
        <div className="col">
          <div className="hero">
            <div className="lbl">Total a receber</div>
            <div className="big">{fmt(total)}</div>
            <div className="sub">{devedores} cliente{devedores !== 1 ? 's' : ''} devendo</div>
            <div className="bar-legend">
              <span>Recebido este mês: {fmt(recebidoMes)}</span>
            </div>
          </div>

          <button className="vence-mes" onClick={aoVerVenceNoMes} disabled={clientesVenceNoMes === 0}>
            <div className="t">Vence este mês</div>
            <div className="v">{fmt(venceNoMes)}</div>
            <div className="s">
              {clientesVenceNoMes === 0
                ? 'Nada vence até o fim do mês'
                : `${clientesVenceNoMes} cliente${clientesVenceNoMes > 1 ? 's' : ''} até ${fimDoMesCurto()} · ver quem ›`}
            </div>
          </button>

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

          {clientesAtrasados > 0 && (
            <div className="alert">
              <div className="ic">!</div>
              <div className="tx">
                <b>{clientesAtrasados} cliente{clientesAtrasados > 1 ? 's' : ''}</b> {clientesAtrasados > 1 ? 'estão' : 'está'} com o pagamento atrasado.
                Já venceu <b>{fmt(resumo.atrasado)}</b>.
              </div>
            </div>
          )}
        </div>

        <div className="col">
          <div className="eyebrow">Últimas anotações</div>
          {recentes.length === 0
            ? <div className="empty">Nenhuma anotação ainda.</div>
            : recentes.map((r, idx) => {
              const ehFiado = r.tipo === 'FIADO'
              return (
                <div className="ext" key={idx}>
                  <span className={`dot ${ehFiado ? 'debt' : 'paid'}`} />
                  <div className="b">
                    <div className="it">{r.nome}</div>
                    <div className="dt">{r.item} · {dataRelativa(r.data)}</div>
                  </div>
                  <ValorAnotacao tipo={r.tipo} valor={r.valorTotal} />
                </div>
              )
            })}
        </div>
      </div>
    </div>
  )
}
