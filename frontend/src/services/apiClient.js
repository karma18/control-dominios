const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let tokenProvider = () => null;

export function setAuthTokenProvider(provider) {
  tokenProvider = provider;
}

async function request(path, options = {}) {
  const token = tokenProvider();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body && typeof options.body !== 'string'
      ? JSON.stringify(options.body)
      : options.body,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.message || 'Request failed.');
    error.details = data?.details || null;
    throw error;
  }

  return data;
}

function withSearch(path, search) {
  const params = new URLSearchParams({ pageSize: '200' });

  if (search) {
    params.set('search', search);
  }

  return `${path}?${params.toString()}`;
}

export const apiClient = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: { email, password },
  }),
  me: () => request('/auth/me'),
  listCatalog: (resource, search = '') => request(withSearch(`/catalog/${resource}`, search)),
  createCatalog: (resource, payload) => request(`/catalog/${resource}`, {
    method: 'POST',
    body: payload,
  }),
  updateCatalog: (resource, id, payload) => request(`/catalog/${resource}/${id}`, {
    method: 'PUT',
    body: payload,
  }),
  deleteCatalog: (resource, id) => request(`/catalog/${resource}/${id}`, {
    method: 'DELETE',
  }),
  listUsers: (search = '') => request(withSearch('/users', search)),
  createUser: (payload) => request('/users', {
    method: 'POST',
    body: payload,
  }),
  updateUser: (id, payload) => request(`/users/${id}`, {
    method: 'PUT',
    body: payload,
  }),
  deleteUser: (id) => request(`/users/${id}`, {
    method: 'DELETE',
  }),
  listDomains: (search = '') => request(withSearch('/domains', search)),
  createDomain: (payload) => request('/domains', {
    method: 'POST',
    body: payload,
  }),
  updateDomain: (id, payload) => request(`/domains/${id}`, {
    method: 'PUT',
    body: payload,
  }),
  deleteDomain: (id) => request(`/domains/${id}`, {
    method: 'DELETE',
  }),
};
