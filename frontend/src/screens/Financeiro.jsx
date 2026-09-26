import { useEffect, useState } from 'react'
import { api } from '../api'
import { fmt, dataCurta, chaveDoMes, chaveMesAtual, mesAnoLabel, deslocarMes } from '../format'

export default function Financeiro({ refreshKey }) {
  const [resumo, setResumo] = useState(null)
  const [devedores, setDevedores] = useState(0)
  const [meses, setMeses] = useState([])
  const [movimentos, setMovimentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [mesSelecionado, setMesSelecionado] = useState(chaveMesAtual())

  useEffect(() => {
    setCarregando(true)
    Promise.all([api.resumo(), api.fila('prioridade'), api.mensal(), api.movimentos()])
      .then(([dadosResumo, dadosFila, dadosMensal, dadosMovimentos]) => {
        setResumo(dadosResumo)
        setDevedores(dadosFila.length)
        setMeses(dadosMensal)
        setMovimentos(dadosMovimentos)
      })
      .catch(() => setErro('Não foi possível carregar o financeiro. Confira se o backend está rodando.'))
      .finally(() => setCarregando(false))
  }, [refreshKey])

  if (carregando) return <div className="screen"><div className="estado">Carregando…</div></div>
  if (erro) return <div className="screen"><div className="estado erro">{erro}</div></div>

  const mesAtual = chaveMesAtual()
  const max = Math.max(1, ...meses.map((m) => Number(m.recebido) + Number(m.fiado)))

  // `meses` vem do backend na ordem dos últimos 6 meses (mais antigo → atual).
  const chavesDosMeses = Array.from({ length: meses.length }, (_, i) => deslocarMes(mesAtual, i - (meses.length - 1)))

  const movimentosDoMes = movimentos
    .filter((m) => m.data.slice(0, 7) === mesSelecionado)
    .sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : 0))

  const recebidoDoMes = movimentosDoMes
    .filter((m) => m.tipo === 'PAGAMENTO')
    .reduce((soma, m) => soma + Number(m.valorTotal), 0)

  const fiadoDoMes = movimentosDoMes
    .filter((m) => m.tipo === 'FIADO')
    .reduce((soma, m) => soma + Number(m.valorTotal), 0)

  return (
    <div className="screen">
      <div className="eyebrow">Situação atual</div>
      <div className="fin-card rec">
        <div className="l">A receber</div>
        <div className="v">{fmt(resumo.totalAReceber)}</div>
        <div className="d">{devedores} cliente{devedores !== 1 ? 's' : ''} em aberto</div>
      </div>

      <div className="eyebrow">Fiado × recebido</div>
      <div className="chart">
        <div className="hd">
          <div className="t">Últimos 6 meses</div>
          <div className="s">em R$</div>
        </div>
        <div className="bars">
          {meses.map((m, idx) => (
            <button
              type="button"
              className={`bcol ${chavesDosMeses[idx] === mesSelecionado ? 'on' : ''}`}
              key={m.mes + idx}
              onClick={() => setMesSelecionado(chavesDosMeses[idx])}
            >
              <div className="bstack">
                <div className="bseg d" style={{ height: `${(Number(m.fiado) / max) * 100}%` }} />
                <div className="bseg p" style={{ height: `${(Number(m.recebido) / max) * 100}%` }} />
              </div>
              <div className="lb">{m.mes}</div>
            </button>
          ))}
        </div>
        <div className="legend">
          <span><i style={{ background: 'var(--paid)' }} />Recebido</span>
          <span><i style={{ background: '#CFE0FA' }} />Fiado</span>
        </div>
      </div>

      <div className="mes-nav">
        <button onClick={() => setMesSelecionado((m) => deslocarMes(m, -1))}>‹</button>
        <div className="mes-nav-label">{mesAnoLabel(mesSelecionado)}</div>
        <button onClick={() => setMesSelecionado((m) => deslocarMes(m, 1))} disabled={mesSelecionado >= mesAtual}>›</button>
      </div>

      <div className="fin-split">
        <div className="fin-card pag">
          <div className="l">Recebido</div>
          <div className="v">{fmt(recebidoDoMes)}</div>
        </div>
        <div className="fin-card rec">
          <div className="l">Fiado</div>
          <div className="v">{fmt(fiadoDoMes)}</div>
        </div>
      </div>

      <div className="eyebrow">Movimento de {mesAnoLabel(mesSelecionado)}</div>
      {movimentosDoMes.length === 0
        ? <div className="empty">Nenhum lançamento nesse mês.</div>
        : (
          <div className="flist">
            {movimentosDoMes.map((m, idx) => {
              const ehFiado = m.tipo === 'FIADO'
              return (
                <div className="frow" key={idx}>
                  <div className="b">
                    <div className="n">{m.nomeCliente}</div>
                    <div className="m">{m.item} · {dataCurta(m.data)}</div>
                  </div>
                  <div className={`v ${ehFiado ? 'debt' : ''}`}>{ehFiado ? '+' : '−'}{fmt(m.valorTotal)}</div>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
