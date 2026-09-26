import {useEffect, useState} from 'react'
import {api} from '../api'
import {fmt, situacaoVencimento} from '../format'

const FILTROS = [
    {id: 'prioridade', label: 'Prioridade'},
    {id: 'atrasados', label: 'Atrasados'},
    {id: 'valor', label: 'Maior valor'},
    {id: 'recentes', label: 'Mais recentes'},
]

export default function Fiados({ refreshKey, aoAbrirFicha }) {
    const [filtro, setFiltro] = useState('prioridade')
    const [lista, setLista] = useState([])
    const [carregando, setCarregando] = useState(true)
    const [erro, setErro] = useState(null)

    useEffect(() => {
        setCarregando(true)
        api.fila(filtro)
            .then(setLista)
            .catch(() => setErro('Não foi possível carregar a fila. Confira se o backend está rodando.'))
            .finally(() => setCarregando(false))
    }, [filtro, refreshKey])

    const total = lista.reduce((s, c) => s + Number(c.saldo), 0)

    return (
        <div className="screen">
            <div className="total-strip">
                <div className="l">
                    {filtro === 'atrasados' ? 'Com pagamento atrasado' : 'Para cobrar'}
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

            {carregando && <div className="estado">Carregando…</div>}
            {erro && <div className="estado erro">{erro}</div>}

            {!carregando && !erro && (
                lista.length === 0
                    ? <div className="empty">Ninguém devendo. Tudo quitado 🎉</div>
                    : <div className="fila-lista">{lista.map((c, idx) => {
                        const situacao = situacaoVencimento(c)
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
                                <div className="amt">{fmt(c.saldo)}</div>
                            </div>
                        )
                    })}</div>
            )}
        </div>
    )
}
