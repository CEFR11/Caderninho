# Caderninho

Backend de um app de controle de fiado, feito para digitalizar o "caderninho de papel" de um negócio local, substituindo o controle manual por um sistema que registra clientes, lançamentos (fiados e pagamentos) e calcula automaticamente o saldo devedor.

## Tecnologias

* Java 25
* Spring Boot 4.1.0
* Spring Data JPA
* H2 Database (arquivo local: `./data/caderninho`)
* Maven

## Funcionalidades

* Cadastro, listagem, busca e exclusão de clientes (com bloqueio de exclusão para clientes com histórico de lançamentos)
* Registro de lançamentos (fiado ou pagamento) vinculados a um cliente
* Cálculo automático do saldo devedor por cliente
* Validação de dados de entrada (`@Valid`) com mensagens de erro claras por campo
* Tratamento global de exceções (`@ControllerAdvice`)
* Endpoints financeiros: resumo (total a receber, recebido/fiado por período) e fila de clientes por prioridade de cobrança

## Como rodar

```bash
./mvnw spring-boot:run
```

A aplicação sobe, por padrão, em `http://localhost:8080`.

## Status

Projeto em desenvolvimento ativo, construído como projeto de aprendizado de Java e Spring Boot.

Próximos passos: mais endpoints financeiros, frontend (React/PWA) e deploy em produção.
