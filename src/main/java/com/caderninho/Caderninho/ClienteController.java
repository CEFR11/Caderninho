package com.caderninho.Caderninho;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;


    @RestController
    @RequestMapping("/clientes") // Esse é o endereço de URL desse controller
    public class ClienteController {

        @GetMapping
        public Cliente BuscarCLiente() {

            Cliente donaMaria = new Cliente("1", "Dona Maria", "9999-9999");

            Lancamento fiado = new Lancamento(TipoLancamento.FIADO, "CAMISA AZUL E BERMUDA SARJA", 120.0, LocalDate.now());
            Lancamento pagamento = new Lancamento(TipoLancamento.PAGAMENTO, "Abatimento", 20.0, LocalDate.now());

            donaMaria.adicionarLancamentos(fiado);
            donaMaria.adicionarLancamentos(pagamento);

            return donaMaria;

        }
    }



