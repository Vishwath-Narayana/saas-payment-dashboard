import api from './axios'

export const transactionAPI = {
  create: (data)    => api.post('/transactions', data),
  getAll: (params)  => api.get('/transactions', { params }),
  getOne: (id)      => api.get(`/transactions/${id}`),
  adminAll: (params) => api.get('/transactions/admin/all', { params }),
}
