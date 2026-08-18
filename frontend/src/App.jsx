import { useState } from 'react'
import NavBar from './components/NavBar'
import Inicio from './screens/Inicio'
import Fiados from './screens/Fiados'
import Clientes from './screens/Clientes'
import Financeiro from './screens/Financeiro'
import { mesEAnoAtual } from './format'
import './App.css'

const TELAS = {
  inicio: Inicio,
  fiados: Fiados,
  clientes: Clientes,
  financeiro: Financeiro,
}

export default function App() {
  const [telaAtual, setTelaAtual] = useState('inicio')
  const Tela = TELAS[telaAtual]

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <div className="mark">C</div>
          <div className="name">Caderninho</div>
        </div>
        <div className="month-chip">{mesEAnoAtual()}</div>
      </div>

      <Tela />

      <NavBar telaAtual={telaAtual} aoTrocarTela={setTelaAtual} />
    </div>
  )
}
