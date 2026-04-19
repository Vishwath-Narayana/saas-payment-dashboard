import api from './axios'

export const analyticsAPI = {
  summary:    ()         => api.get('/analytics/summary'),
  daily:      (days=30)  => api.get('/analytics/daily', { params: { days } }),
  methods:    ()         => api.get('/analytics/methods'),
  monthly:    ()         => api.get('/analytics/monthly'),
  adminStats: ()         => api.get('/analytics/admin-stats'),
}
