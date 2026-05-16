const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request(url, options = {}) {
  const token = localStorage.getItem('certchain_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // If FormData, remove Content-Type to let browser set it
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
}

// Auth
export const authAPI = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request('/auth/me')
};

// Events
export const eventsAPI = {
  list: () => request('/events'),
  get: (id) => request(`/events/${id}`),
  create: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/events/${id}`, { method: 'DELETE' })
};

// Participants
export const participantsAPI = {
  list: (eventId) => request(`/participants?eventId=${eventId || ''}`),
  add: (data) => request('/participants', { method: 'POST', body: JSON.stringify(data) }),
  uploadCSV: (eventId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('eventId', eventId);
    const token = localStorage.getItem('certchain_token');
    return fetch(`${API_BASE}/participants/upload-csv`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    }).then(r => r.json());
  },
  delete: (id) => request(`/participants/${id}`, { method: 'DELETE' })
};

// Certificates
export const certificatesAPI = {
  generate: (eventId, participantIds) => request('/certificates/generate', { method: 'POST', body: JSON.stringify({ eventId, participantIds }) }),
  list: (eventId, search) => request(`/certificates?eventId=${eventId || ''}&search=${search || ''}`),
  download: (certId) => `${API_BASE}/certificates/download/${certId}`
};

// Verification (public)
export const verifyAPI = {
  verify: (certId) => request(`/verify/${certId}`)
};

// Stats
export const statsAPI = {
  get: () => request('/stats')
};
