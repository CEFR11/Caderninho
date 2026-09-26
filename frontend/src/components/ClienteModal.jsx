import { useEffect, useState } from 'react'
import { formatarTelefone, normalizarNome, soDigitos } from '../format'

// Cadastro e edição de cliente. Antes de salvar, avisa se já existe alguém com o mesmo
// nome ou telefone — no balcão é fácil cadastrar a mesma pessoa duas vezes.
export default function ClienteModal({ aberto, clienteInicial = null, clientes = [], aoFechar, aoSalvar, aoUsarExistente, aoExcluir }) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [parecido, setParecido] = useState(null)
  const [confirmandoExcluir, setConfirmandoExcluir] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setNome(clienteInicial?.nome ?? '')
    setTelefone(clienteInicial ? formatarTelefone(clienteInicial.telefone) : '')
    setErro('')
    setParecido(null)
    setConfirmandoExcluir(false)
  }, [aberto, clienteInicial])

  if (!aberto) return null

  const editando = Boolean(clienteInicial)
  const podeExcluir = editando && aoExcluir && clienteInicial.lancamentos.length === 0

  function acharParecido() {
    const nomeNormal = normalizarNome(nome)
    const digitos = soDigitos(telefone)
    return clientes.find((c) => c.id !== clienteInicial?.id && (
      normalizarNome(c.nome) === nomeNormal
      || (digitos.length >= 8 && soDigitos(c.telefone) === digitos)
    ))
  }

  async function salvar(ignorarParecido = false) {
    if (!nome.trim() || !telefone.trim()) {
      setErro('Preencha nome e telefone.')
      return
    }
    if (!ignorarParecido) {
      const outro = acharParecido()
      if (outro) { setParecido(outro); return }
    }
    setSalvando(true)
    setErro('')
    try {
      await aoSalvar({ nome: nome.trim(), telefone: telefone.trim() })
    } catch (e) {
      setErro(e.message || 'Não foi possível salvar o cliente.')
    } finally {
      setSalvando(false)
    }
  }

  async function excluir() {
    if (!confirmandoExcluir) { setConfirmandoExcluir(true); return }
    setSalvando(true)
    try {
      await aoExcluir(clienteInicial.id)
    } catch (e) {
      setErro(e.message || 'Não foi possível excluir o cliente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="ov open" onClick={(e) => { if (e.target === e.currentTarget) aoFechar() }}>
      <div className="sheet">
        <div className="grab" />
        <div className="sh">
          <div className="t">{editando ? 'Editar cliente' : 'Novo cliente'}</div>
          <button className="x" onClick={aoFechar}>✕</button>
        </div>

        <div className="desc" style={{ margin: '0 0 10px' }}>
          <input
            placeholder="Nome"
            value={nome}
            onChange={(e) => { setNome(e.target.value); setParecido(null) }}
            autoFocus
          />
        </div>
        <div className="desc">
          <input
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => { setTelefone(formatarTelefone(e.target.value)); setParecido(null) }}
            inputMode="tel"
          />
        </div>

        {erro && <div className="form-erro">{erro}</div>}

        {parecido
          ? (
            <div className="aviso-duplicado">
              <div className="tx">
                Já existe <b>{parecido.nome}</b> · {parecido.telefone}. É a mesma pessoa?
              </div>
              {!editando && aoUsarExistente && (
                <button className="cf" style={{ background: 'var(--primary)' }} onClick={() => aoUsarExistente(parecido)}>
                  É sim — usar {parecido.nome}
                </button>
              )}
              <button className="cf secundario" onClick={() => salvar(true)} disabled={salvando}>
                {editando ? 'Salvar mesmo assim' : 'Não, é outra pessoa — cadastrar'}
              </button>
            </div>
          )
          : (
            <button className="cf" style={{ background: 'var(--primary)' }} onClick={() => salvar()} disabled={salvando}>
              {salvando ? 'Salvando…' : editando ? 'Salvar alterações' : 'Cadastrar cliente'}
            </button>
          )}

        {podeExcluir && (
          <button className={`apagar ${confirmandoExcluir ? 'confirmar' : ''}`} onClick={excluir} disabled={salvando}>
            {confirmandoExcluir ? 'Toque de novo para excluir de vez' : 'Excluir cliente'}
          </button>
        )}
      </div>
    </div>
  )
}
