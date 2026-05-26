const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const MAX_PAGE_SIZE = 200;

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

function withQuery(path, filters = {}) {
  const params = new URLSearchParams({ pageSize: String(MAX_PAGE_SIZE) });

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.set(key, value);
    }
  });

  return `${path}?${params.toString()}`;
}

async function requestAllPages(path, filters = {}) {
  const pageSize = MAX_PAGE_SIZE;
  const data = [];
  let page = 1;
  let meta = { page, pageSize, total: 0 };

  while (true) {
    const result = await request(withQuery(path, {
      ...filters,
      page,
      pageSize,
    }));
    const pageData = result.data || [];

    data.push(...pageData);
    meta = result.meta || {
      page,
      pageSize,
      total: data.length,
    };

    const total = Number(meta.total || data.length);
    const currentPageSize = Number(meta.pageSize || pageSize);

    if (!pageData.length || data.length >= total || pageData.length < currentPageSize) {
      break;
    }

    page += 1;
  }

  return {
    data,
    meta: {
      ...meta,
      page: 1,
      pageSize: data.length,
      total: Number(meta.total || data.length),
    },
  };
}

export const apiClient = {
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: { email, password },
  }),
  me: () => request('/auth/me'),
  listCatalog: (resource, filters = {}) => request(withQuery(`/catalog/${resource}`, filters)),
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
  listUsers: (filters = {}) => request(withQuery('/users', filters)),
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
  listDomains: (filters = {}) => request(withQuery('/domains', filters)),
  listAllDomains: (filters = {}) => requestAllPages('/domains', filters),
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
