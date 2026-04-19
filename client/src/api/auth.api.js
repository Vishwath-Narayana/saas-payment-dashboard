import api from './axios'

export const authAPI = {
  signup: (data)  => api.post('/auth/signup', data),
  login:  (data)  => api.post('/auth/login', data),
  logout: ()      => api.post('/auth/logout'),
  getMe:  ()      => api.get('/auth/me'),
}
