import { fmt } from '../format'

// Valor de uma anotação com a palavra do tipo embaixo ("fiado" / "pagou"), em vez de sinal +/−,
// que confundia: pagamento recebido aparecia como "−R$ 50".
export default function ValorAnotacao({ tipo, valor }) {
  const ehFiado = tipo === 'FIADO'
  return (
    <div className={`valor-anot ${ehFiado ? 'debt' : 'paid'}`}>
      <div className="vv">{fmt(valor)}</div>
      <div className="vt">{ehFiado ? 'fiado' : 'pagou'}</div>
    </div>
  )
}
