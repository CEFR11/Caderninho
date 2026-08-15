package com.caderninho.Caderninho;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/financeiro")
public class FinanceiroController {

    private final FinanceiroService financeiroService;

    public FinanceiroController(FinanceiroService financeiroService) {
        this.financeiroService = financeiroService;
    }

    @GetMapping("/resumo")
    public ResponseEntity<FinanceiroResumoDTO> getResumo() {
        return ResponseEntity.ok(financeiroService.gerarResumo());
    }

    @GetMapping("/fila")
    public ResponseEntity<List<FilaClienteDTO>> gerarFila() {
        return ResponseEntity.ok(financeiroService.gerarFila());
    }

}
