import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: true,   // sends cookies automatically
})

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only redirect on 401 if NOT the session check
    const isSessionCheck = err.config?.url?.includes('/auth/me')
    if (err.response?.status === 401 && !isSessionCheck) {
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
