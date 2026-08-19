import { useEffect, useState } from 'react'
import { api } from '../api'
import { fmt, dataHojeISO, dataCurta } from '../format'

export default function Financeiro({ refreshKey }) {
  const [resumo, setResumo] = useState(null)
  const [devedores, setDevedores] = useState(0)
  const [meses, setMeses] = useState([])
  const [pagamentos, setPagamentos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    setCarregando(true)
    Promise.all([api.resumo(), api.fila('prioridade'), api.mensal(), api.pagamentos()])
      .then(([dadosResumo, dadosFila, dadosMensal, dadosPagamentos]) => {
        setResumo(dadosResumo)
        setDevedores(dadosFila.length)
        setMeses(dadosMensal)
        setPagamentos(dadosPagamentos)
      })
      .catch(() => setErro('Não foi possível carregar o financeiro. Confira se o backend está rodando.'))
      .finally(() => setCarregando(false))
  }, [refreshKey])

  if (carregando) return <div className="screen"><div className="estado">Carregando…</div></div>
  if (erro) return <div className="screen"><div className="estado erro">{erro}</div></div>

  const mesAtual = dataHojeISO().slice(0, 7)
  const pagamentosNoMes = pagamentos.filter((p) => p.data.slice(0, 7) === mesAtual)
  const max = Math.max(1, ...meses.map((m) => Number(m.recebido) + Number(m.fiado)))

  return (
    <div className="screen">
      <div className="eyebrow">Resumo do mês</div>
      <div className="fin-split">
        <div className="fin-card rec">
          <div className="l">A receber</div>
          <div className="v">{fmt(resumo.totalAReceber)}</div>
          <div className="d">{devedores} cliente{devedores !== 1 ? 's' : ''} em aberto</div>
        </div>
        <div className="fin-card pag">
          <div className="l">Já recebido</div>
          <div className="v">{fmt(resumo.recebidoNoMes)}</div>
          <div className="d">{pagamentosNoMes.length} pagamento{pagamentosNoMes.length !== 1 ? 's' : ''} no mês</div>
        </div>
      </div>

      <div className="eyebrow">Fiado × recebido</div>
      <div className="chart">
        <div className="hd">
          <div className="t">Últimos 6 meses</div>
          <div className="s">em R$</div>
        </div>
        <div className="bars">
          {meses.map((m) => (
            <div className="bcol" key={m.mes}>
              <div className="bstack">
                <div className="bseg d" style={{ height: `${(Number(m.fiado) / max) * 100}%` }} />
                <div className="bseg p" style={{ height: `${(Number(m.recebido) / max) * 100}%` }} />
              </div>
              <div className="lb">{m.mes}</div>
            </div>
          ))}
        </div>
        <div className="legend">
          <span><i style={{ background: 'var(--paid)' }} />Recebido</span>
          <span><i style={{ background: '#DAD8F5' }} />Fiado</span>
        </div>
      </div>

      <div className="eyebrow">Pagamentos recebidos</div>
      {pagamentos.length === 0
        ? <div className="empty">Nenhum pagamento ainda.</div>
        : (
          <div className="flist">
            {pagamentos.map((p, idx) => (
              <div className="frow" key={idx}>
                <div className="b">
                  <div className="n">{p.nomeCliente}</div>
                  <div className="m">{p.item} · {dataCurta(p.data)}</div>

                </div>
                <div className="v">+{fmt(p.valorTotal)}</div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
