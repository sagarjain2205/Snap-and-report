import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000
})

API.interceptors.request.use(config => {
  const token = localStorage.getItem('snr_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('snr_token')
      localStorage.removeItem('snr_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  registerCitizen: d => API.post('/auth/register/citizen', d),
  login:           d => API.post('/auth/login', d),
  getMe:           ()  => API.get('/auth/me'),
}

export const reportAPI = {
  submit:      fd => API.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getMyReports: p => API.get('/reports/my', { params: p }),
  getAll:       p => API.get('/reports', { params: p }),
  getById:      id => API.get(`/reports/${id}`),
  review:    (id,d) => API.put(`/reports/${id}/review`, d),
}

export const challanAPI = {
  issue:       d  => API.post('/challans', d),
  getAll:      p  => API.get('/challans', { params: p }),
  getById:     id => API.get(`/challans/${id}`),
  updatePayment:(id,d) => API.put(`/challans/${id}/payment`, d),
  downloadPDF: id => API.get(`/challans/${id}/pdf`, { responseType: 'blob' }),
}

export const statsAPI = {
  dashboard: () => API.get('/stats/dashboard'),
  citizen:   () => API.get('/stats/citizen'),
}

export default API
