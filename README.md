# Caderninho

App de controle de fiado, feito para digitalizar o "caderninho de papel" de uma loja: registra clientes, o que cada um levou fiado e o que pagou, calcula o saldo devedor e ajuda a cobrar pelo WhatsApp.

Está em uso de verdade na loja, com dados reais.

## O que dá para fazer

* **Clientes:** cadastro (inclusive direto na hora de anotar), busca que ignora acentos, edição e exclusão (bloqueada para quem tem histórico), aviso de cadastro duplicado
* **Anotações:** fiado ou pagamento, com data, peças e valor; fiado parcelado; data de pagamento opcional em cada fiado e dia combinado para pagar; pagamento que abate a peça escolhida
* **Corrigir, apagar e desfazer** anotações, com proteção contra anotar no cliente errado
* **Cobrar:** fila de clientes por prioridade de cobrança, idade da dívida e quanto vence no mês
* **WhatsApp:** mensagem de cobrança e extrato por compra, com a chave Pix da loja; recibo em imagem
* **Financeiro:** total a receber, recebido e fiado por mês, com navegação entre meses
* **Login com a senha da loja**, com bloqueio de 5 minutos após 5 senhas erradas seguidas
* **PWA:** instala no celular como app; versão desktop a partir de 1024px

## Tecnologias

**Backend**

* Java 25 e Spring Boot 4.1 (Web, Data JPA, Validation)
* PostgreSQL
* Maven

**Frontend** (pasta `frontend`)

* React 18 e Vite 5
* vite-plugin-pwa

## Como rodar

### Backend

Precisa do Docker Desktop aberto: ao rodar o backend (ou os testes), o Spring sobe sozinho o Postgres do `compose.yaml`.

A senha da loja e o segredo que assina os logins ficam fora do git. Defina as variáveis `CADERNINHO_SENHA` e `CADERNINHO_SEGREDO`, ou crie o arquivo `config/application.properties` (já está no `.gitignore`):

```properties
caderninho.senha=sua-senha
caderninho.segredo=um-texto-longo-e-aleatorio
```

Depois:

```bash
./mvnw spring-boot:run
```

A API sobe em `http://localhost:8080`.

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

O app abre em `http://localhost:5173`. As variáveis do `.env`:

| Variável | Para que serve |
| --- | --- |
| `VITE_API_URL` | Endereço do backend (use o IP da máquina para abrir de outro aparelho na mesma rede) |
| `VITE_NOME_LOJA` | Nome que assina as mensagens do WhatsApp |
| `VITE_PIX_CHAVE`, `VITE_PIX_NOME`, `VITE_PIX_BANCO` | Dados do Pix nas mensagens (sem a chave, saem sem Pix) |

## API

Tudo exige login, menos `POST /auth/login` e `GET /ping`.

| Método | Endereço | O que faz |
| --- | --- | --- |
| `POST` | `/auth/login` | Entra com a senha da loja e devolve o token |
| `GET` | `/clientes` | Lista os clientes com saldo |
| `GET` | `/clientes/busca` | Busca cliente por nome |
| `GET` | `/clientes/{id}` | Ficha do cliente com os lançamentos |
| `POST` | `/clientes` | Cadastra cliente |
| `PUT` | `/clientes/{id}` | Edita cliente |
| `DELETE` | `/clientes/{id}` | Apaga cliente (só sem histórico) |
| `POST` | `/clientes/{id}/lancamentos` | Anota um fiado ou pagamento |
| `POST` | `/clientes/{id}/lancamentos/varios` | Anota vários de uma vez (fiado parcelado) |
| `PUT` | `/lancamentos/{id}` | Corrige um lançamento |
| `DELETE` | `/lancamentos/{id}` | Apaga um lançamento |
| `GET` | `/financeiro/resumo` | Total a receber, recebido e fiado |
| `GET` | `/financeiro/fila` | Fila de cobrança (`?filtro=` `prioridade`, `mes`, `atrasados`, `valor` ou `recentes`) |
| `GET` | `/financeiro/pagamentos` | Pagamentos recebidos |
| `GET` | `/financeiro/mensal` | Resumo mês a mês |
| `GET` | `/financeiro/movimentos` | Movimento de fiados e pagamentos |
| `GET` | `/ping` | Responde "ok" (mantém o servidor acordado) |

## Produção

* **Frontend:** Vercel, com a pasta `frontend` como raiz e as variáveis `VITE_*` configuradas lá
* **Backend:** Render (plano grátis), pelo `Dockerfile`, com o perfil `prod` ligado
* **Banco:** Neon (Postgres 17)

Variáveis do backend em produção: `CADERNINHO_BANCO` (`jdbc:postgresql://<host>/<banco>?sslmode=require`), `CADERNINHO_BANCO_USUARIO`, `CADERNINHO_BANCO_SENHA`, `CADERNINHO_SENHA`, `CADERNINHO_SEGREDO` e `CADERNINHO_ORIGENS` (endereço do site, para o CORS).

O plano grátis do Render dorme depois de 15 minutos parado; um serviço de cron chama `/ping` a cada 5 minutos para mantê-lo acordado.

## Status

Em uso na loja e em desenvolvimento contínuo. Começou como projeto de aprendizado de Java e Spring Boot.
