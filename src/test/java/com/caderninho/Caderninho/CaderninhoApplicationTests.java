package com.caderninho.Caderninho;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {"caderninho.senha=teste", "caderninho.segredo=teste"})
class CaderninhoApplicationTests {

	@Test
	void contextLoads() {
	}

}
