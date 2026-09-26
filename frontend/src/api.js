// Endereço do backend Spring Boot. Em dev usa localhost; em outro dispositivo
// (celular, outra máquina), defina VITE_API_URL no arquivo .env do frontend.
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

// Login: o token fica guardado no aparelho até vencer (30 dias) ou até sair.
// localStorage pode falhar (aba anônima, dados bloqueados); aí o login só dura até fechar o app.
const CHAVE_SESSAO = 'caderninho.sessao'
let sessaoEmMemoria = null

function lerSessao() {
  try {
    const salva = localStorage.getItem(CHAVE_SESSAO)
    if (salva) sessaoEmMemoria = JSON.parse(salva)
  } catch { /* fica a da memória */ }
  if (sessaoEmMemoria && new Date(sessaoEmMemoria.expiraEm) <= new Date()) sessaoEmMemoria = null
  return sessaoEmMemoria
}

function guardarSessao(sessao) {
  sessaoEmMemoria = sessao
  try {
    if (sessao) localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao))
    else localStorage.removeItem(CHAVE_SESSAO)
  } catch { /* só na memória */ }
}

export const estaLogado = () => lerSessao() !== null

// Avisa o App para voltar à tela de login (saiu, ou o backend recusou o token).
export const EVENTO_SAIU = 'caderninho:saiu'

export function sair() {
  guardarSessao(null)
  window.dispatchEvent(new Event(EVENTO_SAIU))
}

async function enviar(metodo, path, corpo) {
  const token = lerSessao()?.token
  const headers = {}
  if (corpo) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`
  const resposta = await fetch(`${BASE_URL}${path}`, {
    method: metodo,
    headers,
    body: corpo ? JSON.stringify(corpo) : undefined,
  })
  if (resposta.status === 401 && path !== '/auth/login') {
    sair()
    throw new Error('Entre com a senha para continuar.')
  }
  if (!resposta.ok) {
    const texto = await resposta.text().catch(() => '')
    throw new Error(texto || `Erro em ${path}: ${resposta.status}`)
  }
  if (resposta.status === 204) return null
  return resposta.json()
}

const get = (path) => enviar('GET', path)

export async function entrar(senha) {
  guardarSessao(await enviar('POST', '/auth/login', { senha }))
}

const post = (path, corpo) => enviar('POST', path, corpo)

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
  editarCliente: (id, dados) => enviar('PUT', `/clientes/${id}`, dados),
  excluirCliente: (id) => enviar('DELETE', `/clientes/${id}`),
  registrarLancamento: (id, dados) => post(`/clientes/${id}/lancamentos`, dados),
  registrarVarios: (id, lancamentos) => post(`/clientes/${id}/lancamentos/varios`, { lancamentos }),
  editarLancamento: (id, dados) => enviar('PUT', `/lancamentos/${id}`, dados),
  apagarLancamento: (id) => enviar('DELETE', `/lancamentos/${id}`),
}
