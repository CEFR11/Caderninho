import { useEffect, useState } from 'react'
import { formatarTelefone } from '../format'

export default function NovoClienteModal({ aberto, aoFechar, aoCadastrar }) {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setNome('')
    setTelefone('')
    setErro('')
  }, [aberto])

  if (!aberto) return null

  async function salvar() {
    if (!nome.trim() || !telefone.trim()) {
      setErro('Preencha nome e telefone.')
      return
    }
    setSalvando(true)
    setErro('')
    try {
      await aoCadastrar({ nome: nome.trim(), telefone: telefone.trim() })
    } catch (e) {
      setErro(e.message || 'Não foi possível cadastrar o cliente.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="ov open" onClick={(e) => { if (e.target === e.currentTarget) aoFechar() }}>
      <div className="sheet">
        <div className="grab" />
        <div className="sh">
          <div className="t">Novo cliente</div>
          <button className="x" onClick={aoFechar}>✕</button>
        </div>

        <div className="desc" style={{ margin: '0 0 10px' }}>
          <input placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} autoFocus />
        </div>
        <div className="desc">
          <input
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
            inputMode="tel"
          />
        </div>

        {erro && <div className="form-erro">{erro}</div>}

        <button className="cf" style={{ background: 'var(--primary)' }} onClick={salvar} disabled={salvando}>
          {salvando ? 'Salvando…' : 'Cadastrar cliente'}
        </button>
      </div>
    </div>
  )
}
