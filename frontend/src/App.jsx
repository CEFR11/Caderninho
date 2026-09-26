import { useEffect, useState } from 'react'
import NavBar, { ITENS_NAV } from './components/NavBar'
import Sidebar from './components/Sidebar'
import LancamentoModal from './components/LancamentoModal'
import NovoClienteModal from './components/NovoClienteModal'
import Inicio from './screens/Inicio'
import Fiados from './screens/Fiados'
import Clientes from './screens/Clientes'
import Financeiro from './screens/Financeiro'
import Ficha from './screens/Ficha'
import { api } from './api'
import { mesEAnoAtual } from './format'
import { useEhDesktop } from './useEhDesktop'
import './App.css'

export default function App() {
  const [tela, setTela] = useState('inicio')
  const [clienteFichaId, setClienteFichaId] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [clientes, setClientes] = useState([])
  const [modal, setModal] = useState({ aberto: false, clienteId: null, tipo: 'fiado' })
  const [novoClienteAberto, setNovoClienteAberto] = useState(false)
  const [toast, setToast] = useState('')
  const ehDesktop = useEhDesktop()

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
    const clienteAtualizado = await api.registrarLancamento(clienteId, dados)
    setRefreshKey((k) => k + 1)
    mostrarToast(dados.tipo === 'FIADO' ? 'Fiado registrado' : 'Pagamento registrado')
    return clienteAtualizado
  }

  async function editarLancamento(id, dados) {
    await api.editarLancamento(id, dados)
    setRefreshKey((k) => k + 1)
    mostrarToast('Anotação corrigida')
  }

  async function apagarLancamento(id, mensagem = 'Anotação apagada') {
    await api.apagarLancamento(id)
    setRefreshKey((k) => k + 1)
    mostrarToast(mensagem)
  }

  async function cadastrarCliente(dados) {
    const novoCliente = await api.cadastrarCliente(dados)
    setRefreshKey((k) => k + 1)
    mostrarToast('Cliente cadastrado')
    return novoCliente
  }

  async function cadastrarClienteDaTelaClientes(dados) {
    const novoCliente = await cadastrarCliente(dados)
    setNovoClienteAberto(false)
    abrirFicha(novoCliente.id)
  }

  const TELAS = {
    inicio: <Inicio refreshKey={refreshKey} />,
    fiados: <Fiados refreshKey={refreshKey} aoAbrirFicha={abrirFicha} />,
    clientes: <Clientes refreshKey={refreshKey} aoAbrirFicha={abrirFicha} aoAbrirNovoCliente={() => setNovoClienteAberto(true)} />,
    financeiro: <Financeiro refreshKey={refreshKey} />,
    ficha: (
      <Ficha
        clienteId={clienteFichaId}
        refreshKey={refreshKey}
        aoVoltar={() => setTela('clientes')}
        aoAbrirLancamento={abrirLancamento}
        aoEditarLancamento={editarLancamento}
        aoApagarLancamento={apagarLancamento}
        aoMostrarToast={mostrarToast}
      />
    ),
  }

  const navAtiva = tela === 'ficha' ? 'clientes' : tela

  // No desktop, Clientes e Ficha viram uma tela só: lista à esquerda, ficha à direita.
  const conteudo = ehDesktop && navAtiva === 'clientes'
    ? (
      <div className="split">
        <Clientes
          refreshKey={refreshKey}
          aoAbrirFicha={abrirFicha}
          aoAbrirNovoCliente={() => setNovoClienteAberto(true)}
          clienteSelecionadoId={clienteFichaId}
        />
        <div className="split-detalhe">
          {clienteFichaId
            ? (
              <Ficha
                embutida
                clienteId={clienteFichaId}
                refreshKey={refreshKey}
                aoAbrirLancamento={abrirLancamento}
                aoEditarLancamento={editarLancamento}
                aoApagarLancamento={apagarLancamento}
                aoMostrarToast={mostrarToast}
              />
            )
            : <div className="split-vazio">Selecione um cliente para ver a ficha.</div>}
        </div>
      </div>
    )
    : TELAS[tela]

  const tituloDaTela = ITENS_NAV.find((item) => item.id === navAtiva)?.label

  return (
    <div className={`app-shell ${ehDesktop ? 'desktop' : ''}`}>
      {ehDesktop && (
        <Sidebar telaAtual={navAtiva} aoTrocarTela={setTela} aoNovoLancamento={() => abrirLancamento('fiado')} />
      )}

      <div className="main">
        <div className="topbar">
          {ehDesktop
            ? <div className="page-title">{tituloDaTela}</div>
            : (
              <div className="brand">
                <img className="mark" src="/icon-192.png" alt="" />
                <div className="name">Caderninho</div>
              </div>
            )}
          <div className="month-chip">{mesEAnoAtual()}</div>
        </div>

        {conteudo}
      </div>

      {!ehDesktop && (
        <>
          <button className="fab" onClick={() => abrirLancamento('fiado')}>+</button>
          <NavBar telaAtual={navAtiva} aoTrocarTela={setTela} />
        </>
      )}

      {toast && <div className="toast show">{toast}</div>}

      <LancamentoModal
        aberto={modal.aberto}
        clientes={clientes}
        clienteInicialId={modal.clienteId}
        tipoInicial={modal.tipo}
        aoFechar={fecharLancamento}
        aoRegistrar={registrarLancamento}
        aoDesfazer={(id) => apagarLancamento(id, 'Anotação desfeita')}
        aoCadastrarCliente={cadastrarCliente}
        aoMostrarToast={mostrarToast}
      />

      <NovoClienteModal
        aberto={novoClienteAberto}
        aoFechar={() => setNovoClienteAberto(false)}
        aoCadastrar={cadastrarClienteDaTelaClientes}
      />
    </div>
  )
}
