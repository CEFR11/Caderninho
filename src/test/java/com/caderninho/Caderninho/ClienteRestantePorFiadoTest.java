package com.caderninho.Caderninho;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ClienteRestantePorFiadoTest {

    private final LocalDate dia = LocalDate.of(2026, 9, 1);

    private Lancamento fiado(String item, String valor, LocalDate data) {
        return new Lancamento(TipoLancamento.FIADO, item, new BigDecimal(valor), data);
    }

    private Lancamento pagamento(String valor, Lancamento pecaPaga) {
        Lancamento p = new Lancamento(TipoLancamento.PAGAMENTO, "pix", new BigDecimal(valor), dia.plusDays(5));
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
    void pagamentoLigadoAbateAPecaEscolhida() {
        Lancamento camisa = fiado("Camisa", "50", dia);
        Lancamento bermuda = fiado("Bermuda", "30", dia);
        Cliente c = cliente(camisa, bermuda, pagamento("30", bermuda));

        Map<Lancamento, BigDecimal> restante = c.getRestantePorFiado();
        assertEquals(0, restante.get(bermuda).signum());
        assertEquals(new BigDecimal("50"), restante.get(camisa));
    }

    @Test
    void pagamentoSemPecaAbateDoMaisAntigo() {
        Lancamento antigo = fiado("Arroz", "40", dia);
        Lancamento novo = fiado("Feijao", "20", dia.plusDays(3));
        Map<Lancamento, BigDecimal> restante = cliente(antigo, novo, pagamento("50", null)).getRestantePorFiado();

        assertEquals(0, restante.get(antigo).signum());
        assertEquals(new BigDecimal("10"), restante.get(novo));
    }

    @Test
    void sobraDoPagamentoLigadoVaiParaOsMaisAntigos() {
        Lancamento antigo = fiado("Arroz", "40", dia);
        Lancamento bermuda = fiado("Bermuda", "30", dia.plusDays(2));
        Map<Lancamento, BigDecimal> restante = cliente(antigo, bermuda, pagamento("50", bermuda)).getRestantePorFiado();

        assertEquals(0, restante.get(bermuda).signum());
        assertEquals(new BigDecimal("20"), restante.get(antigo));
    }

    @Test
    void vencimentoPassaASerODaPecaQueFaltou() {
        Lancamento camisa = fiado("Camisa", "50", dia);
        camisa.setVencimento(dia.plusDays(20));
        Lancamento bermuda = fiado("Bermuda", "30", dia);
        bermuda.setVencimento(dia.plusDays(5));
        Cliente c = cliente(camisa, bermuda, pagamento("30", bermuda));

        assertEquals(Optional.of(dia.plusDays(20)), c.getVencimento());
    }
}
