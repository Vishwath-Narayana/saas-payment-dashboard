import api from './axios'

export const adminAPI = {
  overview:  ()       => api.get('/admin/overview'),
  users:     (params) => api.get('/admin/users', { params }),
  userDetail:(id)     => api.get(`/admin/users/${id}`),
  logs:      (params) => api.get('/admin/logs', { params }),
}
