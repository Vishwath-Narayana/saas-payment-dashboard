import api from './axios'

export const analyticsAPI = {
  summary:    ()         => api.get('/analytics/summary'),
  daily:      (days=30)  => api.get('/analytics/daily', { params: { days } }),
  methods:    ()         => api.get('/analytics/methods'),
  monthly:    ()         => api.get('/analytics/monthly'),
  adminStats: ()         => api.get('/analytics/admin-stats'),
}

export const exportAPI = {
  transactionsCSV: (params = {}) => {
    const query = new URLSearchParams(params).toString()
    // Open in new tab → browser triggers download
    window.open(
      `${import.meta.env.VITE_API_URL}/api/export/transactions/csv?${query}`,
      '_blank'
    )
  }
}
