package com.caderninho.Caderninho;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

// Sobe o Postgres do compose.yaml também no teste (por padrão o Spring pula isso em testes): precisa do Docker aberto.
@SpringBootTest(properties = {"caderninho.senha=teste", "caderninho.segredo=teste", "spring.docker.compose.skip.in-tests=false"})
class CaderninhoApplicationTests {

	@Test
	void contextLoads() {
	}

}
