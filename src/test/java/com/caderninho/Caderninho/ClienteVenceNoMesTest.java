package com.caderninho.Caderninho;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ClienteVenceNoMesTest {

    private final LocalDate hoje = LocalDate.of(2026, 9, 26);
    private final LocalDate fimDoMes = LocalDate.of(2026, 9, 30);

    private Lancamento fiado(String item, String valor, LocalDate vencimento) {
        Lancamento f = new Lancamento(TipoLancamento.FIADO, item, new BigDecimal(valor), LocalDate.of(2026, 9, 1));
        f.setVencimento(vencimento);
        return f;
    }

    private Lancamento pagamento(String valor, Lancamento pecaPaga) {
        Lancamento p = new Lancamento(TipoLancamento.PAGAMENTO, "pix", new BigDecimal(valor), LocalDate.of(2026, 9, 10));
        p.setFiadoPago(pecaPaga);
        return p;
    }

    private Cliente cliente(Lancamento... lancamentos) {
        Cliente c = new Cliente("Teste", "85999990000");
        for (Lancamento l : lancamentos) {
            c.adicionarLancamentos(l);
        }
        return c;
    }

    @Test
    void separaAtrasadoDoQueVenceNoMesEDoQueVenceDepois() {
        Cliente c = cliente(
                fiado("Camisa", "50", LocalDate.of(2026, 9, 20)),  // atrasada
                fiado("Bermuda", "30", hoje),                      // vence hoje: conta no mês
                fiado("Tênis", "100", fimDoMes),                   // último dia do mês
                fiado("Boné", "20", LocalDate.of(2026, 10, 1)));   // mês que vem

        assertEquals(new BigDecimal("130"), c.getAReceberEntre(hoje, fimDoMes));
        assertEquals(new BigDecimal("50"), c.getValorAtrasado(hoje));
        assertEquals(Optional.of(hoje), c.getProximoVencimentoEntre(hoje, fimDoMes));
    }

    @Test
    void contaSoOQueFaltaDaPecaParcialmentePaga() {
        Lancamento tenis = fiado("Tênis", "100", LocalDate.of(2026, 9, 28));
        Cliente c = cliente(tenis, pagamento("40", tenis));

        assertEquals(new BigDecimal("60"), c.getAReceberEntre(hoje, fimDoMes));
    }

    @Test
    void pecaPagaNaoEntraNemTemVencimentoNoMes() {
        Lancamento tenis = fiado("Tênis", "100", LocalDate.of(2026, 9, 28));
        Cliente c = cliente(tenis, pagamento("100", tenis));

        assertEquals(0, c.getAReceberEntre(hoje, fimDoMes).signum());
        assertEquals(Optional.empty(), c.getProximoVencimentoEntre(hoje, fimDoMes));
    }
}
