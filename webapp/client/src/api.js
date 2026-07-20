const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function authHeaders() {
  const token = localStorage.getItem('ask_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const url = `${API_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || 'درخواست ناکام');
  }
  return data;
}

export const api = {
  health: () => request('/api/health'),
  meta: () => request('/api/meta/site'),
  login: (body) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/api/auth/me'),
  properties: (params = {}) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') q.set(k, v);
    });
    return request(`/api/properties?${q}`);
  },
  property: (id) => request(`/api/properties/${id}`),
  submitListing: (body) =>
    request('/api/submissions', { method: 'POST', body: JSON.stringify(body) }),
  mySubmissions: () => request('/api/submissions/mine'),
  inquiry: (body) => request('/api/inquiries', { method: 'POST', body: JSON.stringify(body) }),
  wishlist: () => request('/api/wishlist'),
  addWishlist: (id) => request(`/api/wishlist/${id}`, { method: 'POST' }),
  removeWishlist: (id) => request(`/api/wishlist/${id}`, { method: 'DELETE' }),
};

export function saveSession(token, user) {
  localStorage.setItem('ask_token', token);
  localStorage.setItem('ask_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('ask_token');
  localStorage.removeItem('ask_user');
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('ask_user') || 'null');
  } catch {
    return null;
  }
}
