import api from './axios'

export const transactionAPI = {
  create: (data, idempotencyKey) => api.post('/transactions', data, {
    headers: {
      'Idempotency-Key': idempotencyKey
    }
  }),
  getAll: (params)  => api.get('/transactions', { params }),
  getOne: (id)      => api.get(`/transactions/${id}`),
  adminAll: (params) => api.get('/transactions/admin/all', { params }),
}
