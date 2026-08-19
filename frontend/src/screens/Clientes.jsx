import { useEffect, useState } from 'react'
import { api } from '../api'
import { fmt, iniciais, corAvatar } from '../format'

const FILTROS = [
  { id: 'todos', label: 'Todos' },
  { id: 'devendo', label: 'Devendo' },
  { id: 'quites', label: 'Em dia' },
]

export default function Clientes({ refreshKey, aoAbrirFicha }) {
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('todos')
  const [clientes, setClientes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    setCarregando(true)
    api.clientes()
      .then(setClientes)
      .catch(() => setErro('Não foi possível carregar os clientes. Confira se o backend está rodando.'))
      .finally(() => setCarregando(false))
  }, [refreshKey])

  if (carregando) return <div className="screen"><div className="estado">Carregando…</div></div>
  if (erro) return <div className="screen"><div className="estado erro">{erro}</div></div>

  let lista = clientes.filter((c) => c.nome.toLowerCase().includes(busca.toLowerCase()))
  if (filtro === 'devendo') lista = lista.filter((c) => Number(c.saldoDevedor) > 0)
  if (filtro === 'quites') lista = lista.filter((c) => Number(c.saldoDevedor) === 0)
  lista = [...lista].sort((a, b) => a.nome.localeCompare(b.nome))

  let letraAtual = ''

  return (
    <div className="screen">
      <div className="search">
        <input placeholder="Buscar por nome..." value={busca} onChange={(e) => setBusca(e.target.value)} />
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

      {lista.length === 0
        ? <div className="empty">Nenhum cliente encontrado.</div>
        : lista.map((c) => {
          const saldo = Number(c.saldoDevedor)
          const letra = c.nome[0].toUpperCase()
          const novaLetra = letra !== letraAtual
          if (novaLetra) letraAtual = letra
          return (
            <div key={c.id}>
              {novaLetra && <div className="letter">{letra}</div>}
              <div className="crow" onClick={() => aoAbrirFicha(c.id)}>
                <div className="av" style={{ background: corAvatar(c.id) }}>{iniciais(c.nome)}</div>
                <div className="info">
                  <div className="nm">{c.nome}</div>
                  <div className="sub">{saldo > 0 ? `deve ${fmt(saldo)}` : 'em dia'}</div>
                </div>
                <div className="right">
                  <div className={`sal ${saldo > 0 ? 'dev' : 'zero'}`}>{saldo > 0 ? fmt(saldo) : 'quite'}</div>
                </div>
              </div>
            </div>
          )
        })}
    </div>
  )
}
