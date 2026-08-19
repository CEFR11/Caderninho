import { useEffect, useState } from 'react'
import NavBar from './components/NavBar'
import LancamentoModal from './components/LancamentoModal'
import Inicio from './screens/Inicio'
import Fiados from './screens/Fiados'
import Clientes from './screens/Clientes'
import Financeiro from './screens/Financeiro'
import Ficha from './screens/Ficha'
import { api } from './api'
import { mesEAnoAtual } from './format'
import './App.css'

export default function App() {
  const [tela, setTela] = useState('inicio')
  const [clienteFichaId, setClienteFichaId] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [clientes, setClientes] = useState([])
  const [modal, setModal] = useState({ aberto: false, clienteId: null, tipo: 'fiado' })
  const [toast, setToast] = useState('')

  useEffect(() => {
    api.clientes().then(setClientes).catch(() => {})
  }, [refreshKey])

  function abrirFicha(id) {
    setClienteFichaId(id)
    setTela('ficha')
  }

  function abrirLancamento(tipo, clienteId = null) {
    setModal({ aberto: true, clienteId, tipo })
  }

  function fecharLancamento() {
    setModal((m) => ({ ...m, aberto: false }))
  }

  function mostrarToast(mensagem) {
    setToast(mensagem)
    setTimeout(() => setToast(''), 1700)
  }

  async function registrarLancamento(clienteId, dados) {
    await api.registrarLancamento(clienteId, dados)
    setRefreshKey((k) => k + 1)
    fecharLancamento()
    mostrarToast(dados.tipo === 'FIADO' ? 'Fiado registrado' : 'Pagamento registrado')
  }

  const TELAS = {
    inicio: <Inicio refreshKey={refreshKey} />,
    fiados: <Fiados refreshKey={refreshKey} aoAbrirFicha={abrirFicha} />,
    clientes: <Clientes refreshKey={refreshKey} aoAbrirFicha={abrirFicha} />,
    financeiro: <Financeiro refreshKey={refreshKey} />,
    ficha: (
      <Ficha
        clienteId={clienteFichaId}
        refreshKey={refreshKey}
        aoVoltar={() => setTela('clientes')}
        aoAbrirLancamento={abrirLancamento}
      />
    ),
  }

  const navAtiva = tela === 'ficha' ? 'clientes' : tela

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <div className="mark">C</div>
          <div className="name">Caderninho</div>
        </div>
        <div className="month-chip">{mesEAnoAtual()}</div>
      </div>

      {TELAS[tela]}

      <button className="fab" onClick={() => abrirLancamento('fiado')}>+</button>
      <NavBar telaAtual={navAtiva} aoTrocarTela={setTela} />

      {toast && <div className="toast show">{toast}</div>}

      <LancamentoModal
        aberto={modal.aberto}
        clientes={clientes}
        clienteInicialId={modal.clienteId}
        tipoInicial={modal.tipo}
        aoFechar={fecharLancamento}
        aoRegistrar={registrarLancamento}
      />
    </div>
  )
}
