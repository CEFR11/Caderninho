import { forwardRef } from 'react'
import { fmt, dataCurta, rotuloSaldo, valorSaldo } from '../format'

function LinhaRotulo({ rotulo, valor, destaque }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', fontSize: destaque ? 14 : 13 }}>
      <span style={{ color: '#7B819A', fontWeight: 500 }}>{rotulo}</span>
      <span style={{ fontWeight: destaque ? 700 : 600, fontFamily: destaque ? "'JetBrains Mono'" : 'inherit' }}>{valor}</span>
    </div>
  )
}

const ReciboCard = forwardRef(function ReciboCard({ dados }, ref) {
  if (!dados) return null

  const corSaldo = dados.saldo > 0 ? '#E5484D' : '#0E9F6E'

  return (
    <div
      ref={ref}
      style={{
        width: 380,
        fontFamily: "'Inter', sans-serif",
        color: '#14151D',
        background: '#FFFFFF',
        borderRadius: 24,
        overflow: 'hidden',
        border: '1px solid #E7E9F0',
      }}
    >
      <div style={{ background: 'linear-gradient(150deg, #0F4FC4, #1A7EF5 55%, #5CA8FF)', padding: '24px 26px 20px', color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 17,
          }}>C</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 18, letterSpacing: -0.3 }}>Caderninho</div>
        </div>
        <div style={{ fontSize: 11.5, color: '#CFE4FF', marginTop: 14, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>
          {dados.modo === 'extrato' ? 'Conta em aberto' : 'Recibo'}
        </div>
        <div style={{ fontFamily: "'Plus Jakarta Sans'", fontWeight: 800, fontSize: 22, marginTop: 4 }}>{dados.nome}</div>
      </div>

      <div style={{ padding: '22px 26px 26px' }}>
        {dados.modo === 'transacao' ? (
          <>
            <LinhaRotulo rotulo="Data" valor={dataCurta(dados.data)} />
            {dados.itens?.length > 1
              ? (
                <>
                  {dados.itens.map((i, idx) => <LinhaRotulo key={idx} rotulo={i.item} valor={fmt(i.valor)} />)}
                  <LinhaRotulo rotulo="Total fiado" valor={fmt(dados.valor)} destaque />
                </>
              )
              : (
                <>
                  <LinhaRotulo rotulo="Item" valor={dados.item} />
                  <LinhaRotulo rotulo={dados.tipoLancamento === 'fiado' ? 'Fiado' : 'Pagamento'} valor={fmt(dados.valor)} destaque />
                </>
              )}
            {dados.pecaPaga && <LinhaRotulo rotulo="Abateu" valor={dados.pecaPaga} />}
            {dados.vencimento && <LinhaRotulo rotulo="Pagar até" valor={dataCurta(dados.vencimento)} />}
          </>
        ) : (
          dados.itens.length === 0
            ? <div style={{ fontSize: 12.5, color: '#7B819A', textAlign: 'center', padding: '10px 0' }}>Nada em aberto. Conta em dia!</div>
            : dados.itens.map((l, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', justifyContent: 'space-between', gap: 10, padding: '9px 0',
                  borderBottom: idx < dados.itens.length - 1 ? '1px solid #E7E9F0' : 'none',
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{l.item}</div>
                  <div style={{ fontSize: 11, color: '#7B819A', marginTop: 1 }}>
                    {dataCurta(l.data)}{l.valorOriginal && l.valorOriginal !== l.valorTotal ? ` · falta, de ${fmt(l.valorOriginal)}` : ''}{l.vencimento ? ` · pagar até ${dataCurta(l.vencimento)}` : ''}
                  </div>
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 13.5, flex: '0 0 auto',
                  color: l.tipo === 'FIADO' ? '#E5484D' : '#0E9F6E',
                }}>
                  {fmt(l.valorTotal)}
                </div>
              </div>
            ))
        )}

        <div style={{ height: 1, background: '#E7E9F0', margin: '18px 0' }} />
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: '#7B819A' }}>
          {rotuloSaldo(dados.saldo)}
        </div>
        <div style={{ fontFamily: "'JetBrains Mono'", fontWeight: 700, fontSize: 26, color: corSaldo, marginTop: 3 }}>
          {valorSaldo(dados.saldo)}
        </div>

        <div style={{ fontSize: 10.5, color: '#A9AEC2', marginTop: 20, textAlign: 'center' }}>
          Emitido em {dados.emitidoEm}
        </div>
      </div>
    </div>
  )
})

export default ReciboCard
