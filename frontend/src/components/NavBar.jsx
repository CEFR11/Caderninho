const ITENS = [
  { id: 'inicio', label: 'Início', icone: '◈' },
  { id: 'fiados', label: 'Fiados', icone: '≡' },
  { id: 'clientes', label: 'Clientes', icone: '◎' },
  { id: 'financeiro', label: 'Financeiro', icone: '◔' },
]

export default function NavBar({ telaAtual, aoTrocarTela }) {
  return (
    <nav className="nav">
      {ITENS.map((item) => (
        <button
          key={item.id}
          className={`nvi ${telaAtual === item.id ? 'on' : ''}`}
          onClick={() => aoTrocarTela(item.id)}
        >
          <span className="i">{item.icone}</span>
          {item.label}
        </button>
      ))}
    </nav>
  )
}
