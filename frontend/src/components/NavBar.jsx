import Icone from './Icone'

const ESQUERDA = [
  { id: 'inicio', label: 'Início', icone: 'inicio' },
  { id: 'fiados', label: 'Cobrar', icone: 'cobrar' },
]
const DIREITA = [
  { id: 'clientes', label: 'Clientes', icone: 'clientes' },
  { id: 'financeiro', label: 'Financeiro', icone: 'financeiro' },
]

export const ITENS_NAV = [...ESQUERDA, ...DIREITA]

function Item({ item, telaAtual, aoTrocarTela }) {
  return (
    <button
      className={`nvi ${telaAtual === item.id ? 'on' : ''}`}
      onClick={() => aoTrocarTela(item.id)}
    >
      <span className="i"><Icone nome={item.icone} /></span>
      {item.label}
    </button>
  )
}

export default function NavBar({ telaAtual, aoTrocarTela }) {
  return (
    <nav className="nav">
      {ESQUERDA.map((item) => (
        <Item key={item.id} item={item} telaAtual={telaAtual} aoTrocarTela={aoTrocarTela} />
      ))}
      <div style={{ width: 68 }} />
      {DIREITA.map((item) => (
        <Item key={item.id} item={item} telaAtual={telaAtual} aoTrocarTela={aoTrocarTela} />
      ))}
    </nav>
  )
}
