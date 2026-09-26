// Endereço do backend Spring Boot. Em dev usa localhost; em outro dispositivo
// (celular, outra máquina), defina VITE_API_URL no arquivo .env do frontend.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function get(path) {
  const resposta = await fetch(`${BASE_URL}${path}`)
  if (!resposta.ok) {
    throw new Error(`Erro ao buscar ${path}: ${resposta.status}`)
  }
  return resposta.json()
}

async function post(path, corpo) {
  const resposta = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(corpo),
  })
  if (!resposta.ok) {
    const texto = await resposta.text().catch(() => '')
    throw new Error(texto || `Erro ao enviar ${path}: ${resposta.status}`)
  }
  return resposta.json()
}

export const api = {
  resumo: () => get('/financeiro/resumo'),
  fila: (filtro = 'prioridade') => get(`/financeiro/fila?filtro=${filtro}`),
  pagamentos: () => get('/financeiro/pagamentos'),
  mensal: () => get('/financeiro/mensal'),
  movimentos: () => get('/financeiro/movimentos'),
  clientes: () => get('/clientes'),
  buscarClientes: (nome) => get(`/clientes/busca?nome=${encodeURIComponent(nome)}`),
  cliente: (id) => get(`/clientes/${id}`),
  cadastrarCliente: (dados) => post('/clientes', dados),
  registrarLancamento: (id, dados) => post(`/clientes/${id}/lancamentos`, dados),
}
