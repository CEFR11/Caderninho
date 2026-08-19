const ESQUERDA = [
  { id: 'inicio', label: 'Início', icone: '◈' },
  { id: 'fiados', label: 'Fiados', icone: '≡' },
]
const DIREITA = [
  { id: 'clientes', label: 'Clientes', icone: '◎' },
  { id: 'financeiro', label: 'Financeiro', icone: '◔' },
]

function Item({ item, telaAtual, aoTrocarTela }) {
  return (
    <button
      className={`nvi ${telaAtual === item.id ? 'on' : ''}`}
      onClick={() => aoTrocarTela(item.id)}
    >
      <span className="i">{item.icone}</span>
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
      <div style={{ width: 60 }} />
      {DIREITA.map((item) => (
        <Item key={item.id} item={item} telaAtual={telaAtual} aoTrocarTela={aoTrocarTela} />
      ))}
    </nav>
  )
}
