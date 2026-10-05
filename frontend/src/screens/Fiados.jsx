import {useEffect, useState} from 'react'
import {api} from '../api'
import {fmt, situacaoVencimento} from '../format'

const FILTROS = [
    {id: 'prioridade', label: 'Prioridade'},
    {id: 'mes', label: 'Este mês'},
    {id: 'atrasados', label: 'Atrasados'},
    {id: 'valor', label: 'Maior valor'},
    {id: 'recentes', label: 'Mais recentes'},
]

const TITULOS = {atrasados: 'Já venceu', mes: 'Vence este mês'}
const VAZIO = {atrasados: 'Ninguém atrasado 🎉', mes: 'Nada vence até o fim do mês.'}

// Valor que interessa em cada filtro: o que já venceu, o que vence no mês ou a dívida toda.
function valorDoFiltro(c, filtro) {
    if (filtro === 'atrasados') return Number(c.atrasado)
    if (filtro === 'mes') return Number(c.venceNoMes)
    return Number(c.saldo)
}

export default function Fiados({ refreshKey, aoAbrirFicha, filtroInicial = 'prioridade' }) {
    const [filtro, setFiltro] = useState(filtroInicial)
    // A lista guarda de qual filtro ela veio: logo depois de trocar o filtro, a lista antiga ainda está aqui
    // e não pode ser desenhada com as regras do filtro novo (ex.: no "Este mês" quem não vence no mês não tem data).
    const [carregada, setCarregada] = useState({filtro: null, lista: []})
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        // Trocou de filtro antes da resposta chegar: a resposta velha é descartada.
        let ignorar = false
        setCarregando(true)
        setErro(null)
        api.fila(filtro)
            .then((lista) => { if (!ignorar) setCarregada({filtro, lista}) })
            .catch(() => { if (!ignorar) setErro('Não foi possível carregar a fila. Confira se o backend está rodando.') })
            .finally(() => { if (!ignorar) setCarregando(false) })
        return () => { ignorar = true }
    }, [filtro, refreshKey])

    const lista = carregada.filtro === filtro ? carregada.lista : []

    const total = lista.reduce((s, c) => s + valorDoFiltro(c, filtro), 0)

    return (
        <div className="screen">
            <div className="total-strip">
                <div className="l">
                    {TITULOS[filtro] ?? 'Para cobrar'}
                    {' · '}{lista.length} cliente{lista.length !== 1 ? 's' : ''}
                </div>
                <div className="r">{fmt(total)}</div>
            </div>

            <div className="chips">
                {FILTROS.map((f) => (
                    <button
                        key={f.id}
                        className={`chip ${filtro === f.id ? 'on' : ''}`}
                        onClick={() => setFiltro(f.id)}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {(carregando || carregada.filtro !== filtro) && !erro && <div className="estado">Carregando…</div>}
            {erro && <div className="estado erro">{erro}</div>}

            {!carregando && !erro && carregada.filtro === filtro && (
                lista.length === 0
                    ? <div className="empty">{VAZIO[filtro] ?? 'Ninguém devendo. Tudo quitado 🎉'}</div>
                    : <div className="fila-lista">{lista.map((c, idx) => {
                        // Sem data de vencimento, situacaoVencimento devolve null: mostra sem selo em vez de quebrar a tela.
                        const situacao = (filtro === 'mes'
                            ? situacaoVencimento({vencimento: c.proximoVencimentoNoMes, diasAtraso: 0})
                            : situacaoVencimento(c)) ?? {classe: 'ok', rotulo: 'sem data', texto: ''}
                        const valor = valorDoFiltro(c, filtro)
                        const urgencia = { late: 'u-hi', soon: 'u-md', ok: 'u-lo' }[situacao.classe]
                        const largura = situacao.classe === 'late' ? Math.min(100, 40 + Number(c.diasAtraso) * 2) : situacao.classe === 'soon' ? 30 : 10

                        return (
                            <div className="queue-item" key={c.id} onClick={() => aoAbrirFicha(c.id)}>
                                <div className="rank">{String(idx + 1).padStart(2, '0')}</div>
                                <div className="body">
                                    <div className="nm">{c.nome}</div>
                                    <div className="meta">
                                        <span className={`flag ${situacao.classe}`}>{situacao.rotulo}</span>
                                        {' '}
                                        {situacao.texto}
                                    </div>
                                    <div className={`urg ${urgencia}`}><span style={{width: `${largura}%`}}/></div>
                                </div>
                                <div className="amt">
                                    {fmt(valor)}
                                    {valor < Number(c.saldo) && <div className="amt-sub">deve {fmt(c.saldo)}</div>}
                                </div>
                            </div>
                        )
                    })}</div>
            )}
        </div>
    )
}
