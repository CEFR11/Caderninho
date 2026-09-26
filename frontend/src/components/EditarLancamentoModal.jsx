import { useEffect, useState } from 'react'
import { dataHojeISO } from '../format'

// Corrige ou apaga um lançamento já salvo (aberto ao tocar num item do extrato da Ficha).
export default function EditarLancamentoModal({ lancamento, aoFechar, aoSalvar, aoApagar }) {
  const [tipo, setTipo] = useState('FIADO')
  const [valor, setValor] = useState('')
  const [item, setItem] = useState('')
  const [data, setData] = useState('')
  const [vencimento, setVencimento] = useState('')
  const [erro, setErro] = useState(null)
  const [ocupado, setOcupado] = useState(false)
  const [confirmandoApagar, setConfirmandoApagar] = useState(false)

  useEffect(() => {
    if (!lancamento) return
    setTipo(lancamento.tipo)
    setValor(String(lancamento.valorTotal).replace('.', ','))
    setItem(lancamento.item)
    setData(lancamento.data)
    setVencimento(lancamento.vencimento ?? '')
    setErro(null)
    setConfirmandoApagar(false)
  }, [lancamento])

  if (!lancamento) return null

  async function salvar() {
    // Com vírgula, o ponto é separador de milhar (1.500,00); sem vírgula, o ponto é o decimal (12.50).
    const numero = parseFloat(valor.includes(',') ? valor.replace(/\./g, '').replace(',', '.') : valor)
    if (!numero || numero <= 0) { setErro('Digite um valor maior que zero.'); return }
    if (!item.trim()) { setErro('Escreva o que foi.'); return }
    if (!data) { setErro('Escolha a data.'); return }

    setOcupado(true)
    try {
      await aoSalvar(lancamento.id, { tipo, item: item.trim(), valorTotal: numero, data, vencimento: tipo === 'FIADO' && vencimento ? vencimento : null })
    } catch {
      setErro('Não foi possível salvar. Confira a conexão e tente de novo.')
    } finally {
      setOcupado(false)
    }
  }

  async function apagar() {
    if (!confirmandoApagar) { setConfirmandoApagar(true); return }
    setOcupado(true)
    try {
      await aoApagar(lancamento.id)
    } catch {
      setErro('Não foi possível apagar. Confira a conexão e tente de novo.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div className="ov open" onClick={(e) => { if (e.target === e.currentTarget) aoFechar() }}>
      <div className="sheet">
        <div className="grab" />
        <div className="sh">
          <div className="t">Corrigir anotação</div>
          <button className="x" onClick={aoFechar}>✕</button>
        </div>

        <div className="seg">
          <button className={tipo === 'FIADO' ? 'on-d' : ''} onClick={() => setTipo('FIADO')}>FIADO</button>
          <button className={tipo === 'PAGAMENTO' ? 'on-p' : ''} onClick={() => setTipo('PAGAMENTO')}>PAGAMENTO</button>
        </div>

        <div className="campo-label">Valor</div>
        <div className="desc campo">
          <span className="campo-prefixo">R$</span>
          <input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value.replace(/[^0-9,.]/g, ''))} />
        </div>

        <div className="campo-label">{tipo === 'FIADO' ? 'O que levou' : 'Como pagou'}</div>
        <div className="desc campo">
          <input value={item} onChange={(e) => setItem(e.target.value)} />
        </div>

        <div className="campo-label">Data</div>
        <div className="desc campo">
          <input type="date" value={data} max={dataHojeISO()} onChange={(e) => setData(e.target.value)} />
        </div>

        {tipo === 'FIADO' && (
          <>
            <div className="campo-label">Vai pagar quando? (opcional)</div>
            <div className="desc campo">
              <input type="date" value={vencimento} min={data} onChange={(e) => setVencimento(e.target.value)} />
              {vencimento && <button className="limpar-data" onClick={() => setVencimento('')} aria-label="Tirar data">✕</button>}
            </div>
          </>
        )}

        {erro && <div className="form-erro">{erro}</div>}

        <button className="cf" style={{ background: 'var(--primary)' }} onClick={salvar} disabled={ocupado}>
          {ocupado ? 'Salvando…' : 'Salvar correção'}
        </button>
        <button className={`apagar ${confirmandoApagar ? 'confirmar' : ''}`} onClick={apagar} disabled={ocupado}>
          {confirmandoApagar ? 'Toque de novo para apagar de vez' : 'Apagar esta anotação'}
        </button>
      </div>
    </div>
  )
}
