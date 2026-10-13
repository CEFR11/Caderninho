package com.caderninho.Caderninho;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// Endereço aberto (sem senha) só para um serviço de fora chamar de tempos em tempos.
// O plano grátis do Render desliga o servidor depois de 15 min parado, e religar leva quase 1 min.
// Não toca no banco nem devolve dado nenhum da loja.
@RestController
public class PingController {

    @GetMapping("/ping")
    public String ping() {
        return "ok";
    }
}
