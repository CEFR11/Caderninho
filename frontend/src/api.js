// Endereço do backend Spring Boot. Ajuste aqui se rodar em outra porta/host.
const BASE_URL = 'http://localhost:8080'

async function get(path) {
  const resposta = await fetch(`${BASE_URL}${path}`)
  if (!resposta.ok) {
    throw new Error(`Erro ao buscar ${path}: ${resposta.status}`)
  }
  return resposta.json()
}

export const api = {
  resumo: () => get('/financeiro/resumo'),
  fila: (filtro = 'prioridade') => get(`/financeiro/fila?filtro=${filtro}`),
  pagamentos: () => get('/financeiro/pagamentos'),
  mensal: () => get('/financeiro/mensal'),
  clientes: () => get('/clientes'),
  buscarClientes: (nome) => get(`/clientes/busca?nome=${encodeURIComponent(nome)}`),
  cliente: (id) => get(`/clientes/${id}`),
}
