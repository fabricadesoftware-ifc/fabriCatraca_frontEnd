import axios from 'axios'
const apiUrl = import.meta.env.VITE_API_URL

export const createApi = (basePrefix = '') => {
  const api = axios.create({
    baseURL: `${apiUrl}${basePrefix}`,
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 30_000,
  })

  return api
}

// API padrão sem prefixo
export const api = createApi()

// API com prefixo /control_id
export const controlIdApi = createApi('/control_id')
export const usersApi = createApi('/users')
export const getToken = createApi('/token')

const accessToken = localStorage.getItem('access_token')
if (accessToken) {
  usersApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
}
if (accessToken) {
  controlIdApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
}
