import axios from 'axios'

const apiClient = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ??
    (import.meta.env.DEV ? '/api' : 'http://localhost:8000'),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function getDashboard() {
  const response = await apiClient.get('/dashboard')
  return response.data
}

export async function getAuditHistory() {
  const response = await apiClient.get('/audit/history')
  return response.data
}

export async function getAuditResults() {
  const response = await apiClient.get('/audit/results')
  return response.data
}

export async function runAudit() {
  const response = await apiClient.post('/audit/run')
  return response.data
}
