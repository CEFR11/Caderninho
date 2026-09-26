import { useState } from 'react'
import { entrar } from '../api'

// Senha única da loja. Depois de entrar, o aparelho fica logado por 30 dias.
export default function Login({ aoEntrar }) {
  const [senha, setSenha] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [entrando, setEntrando] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e) {
    e.preventDefault()
    if (!senha || entrando) return
    setEntrando(true)
    setErro('')
    try {
      await entrar(senha)
      aoEntrar()
    } catch (err) {
      // fetch sem resposta (servidor fora do ar ou sem internet) vem como TypeError.
      setErro(err instanceof TypeError ? 'Sem conexão com o servidor. Confira a internet e tente de novo.' : err.message)
      setSenha('')
    } finally {
      setEntrando(false)
    }
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={enviar}>
        <img className="login-logo" src="/icon-192.png" alt="" />
        <div className="login-nome">Caderninho</div>
        <div className="login-sub">Digite a senha da loja para entrar.</div>

        <div className="desc">
          <input
            type={mostrar ? 'text' : 'password'}
            placeholder="Senha"
            value={senha}
            onChange={(e) => { setSenha(e.target.value); setErro('') }}
            autoFocus
            autoComplete="current-password"
            aria-label="Senha"
          />
          <button type="button" className="login-ver" onClick={() => setMostrar((m) => !m)}>
            {mostrar ? 'Esconder' : 'Mostrar'}
          </button>
        </div>

        {erro && <div className="login-erro">{erro}</div>}

        <button className="btn login-entrar" type="submit" disabled={!senha || entrando}>
          {entrando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
