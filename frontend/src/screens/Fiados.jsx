import {useEffect, useState} from 'react'
import {api} from '../api'
import {fmt} from '../format'

const FILTROS = [
    {id: 'prioridade', label: 'Prioridade'},
    {id: 'atrasados', label: 'Atrasados'},
    {id: 'valor', label: 'Maior valor'},
    {id: 'recentes', label: 'Mais recentes'},
]

export default function Fiados() {
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
    }, [filtro])

    const total = lista.reduce((s, c) => s + Number(c.saldo), 0)

    return (
        <div className="screen">
            <div className="total-strip">
                <div className="l">Na fila de pagamento</div>
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
                    : lista.map((c, idx) => {
                        const dias = Number(c.dias)
                        const urgencia = dias >= 30 ? 'u-hi' : dias >= 10 ? 'u-md' : 'u-lo'
                        const flagClasse = dias >= 30 ? 'late' : dias >= 10 ? 'soon' : 'ok'
                        const flagTexto = dias >= 30 ? 'atrasado' : dias >= 10 ? 'atenção' : 'recente'
                        const largura = Math.min(100, Math.round((dias / 45) * 100))

                        return (
                            <div className="queue-item" key={c.id}>
                                <div className="rank">{String(idx + 1).padStart(2, '0')}</div>
                                <div className="body">
                                    <div className="nm">{c.nome}</div>
                                    <div className="meta">
                                        <span className={`flag ${flagClasse}`}>{flagTexto}</span>
                                        {' '}
                                        {dias === 0 ? 'sem atraso' : `há ${dias} dias sem pagar`}
                                    </div>
                                    <div className={`urg ${urgencia}`}><span style={{width: `${largura}%`}}/></div>
                                </div>
                                <div className="amt">{fmt(c.saldo)}</div>
                            </div>
                        )
                    })
            )}
        </div>
    )
}
