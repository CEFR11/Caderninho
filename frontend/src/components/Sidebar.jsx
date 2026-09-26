import { ITENS_NAV } from './NavBar'

// Navegação do layout desktop: substitui a barra de baixo e o botão flutuante (+).
export default function Sidebar({ telaAtual, aoTrocarTela, aoNovoLancamento }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img className="mark" src="/icon-192.png" alt="" />
        <div className="name">Caderninho</div>
      </div>

      <button className="side-cta" onClick={aoNovoLancamento}>
        <span className="side-cta-ic">+</span>
        Anotar
      </button>

      <nav className="side-nav">
        {ITENS_NAV.map((item) => (
          <button
            key={item.id}
            className={`side-item ${telaAtual === item.id ? 'on' : ''}`}
            onClick={() => aoTrocarTela(item.id)}
          >
            <span className="i">{item.icone}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  )
}
