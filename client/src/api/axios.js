import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api',
  withCredentials: true,
})

let isRefreshing = false
let failedQueue  = []

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve()
  )
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    const isSessionCheck = original?.url?.includes('/auth/me')
    const isRefreshCall  = original?.url?.includes('/auth/refresh')
    const isTokenExpired = err.response?.data?.code === 'TOKEN_EXPIRED'

    // Auto-refresh on TOKEN_EXPIRED (not on /me or /refresh calls)
    if (isTokenExpired && !isSessionCheck && !isRefreshCall && !original._retry) {
      original._retry = true

      if (isRefreshing) {
        // Queue requests while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => api(original))
          .catch(e => Promise.reject(e))
      }

      isRefreshing = true

      try {
        await api.post('/auth/refresh')
        processQueue(null)
        return api(original)   // retry original request
      } catch (refreshErr) {
        processQueue(refreshErr)
        window.location.href = '/login'
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    // Non-expired 401 on non-session-check = redirect to login
    if (
      err.response?.status === 401 &&
      !isSessionCheck &&
      !isRefreshCall &&
      !isTokenExpired
    ) {
      window.location.href = '/login'
    }

    return Promise.reject(err)
  }
)

export default api
