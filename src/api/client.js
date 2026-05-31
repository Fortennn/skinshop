const BASE = '';

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch(path, { method = 'GET', body, headers, signal } = {}) {
  const opts = {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    signal,
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const msg = data?.error || `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }
  return data;
}

export const api = {
  // Auth
  me: () => apiFetch('/api/auth/me'),
  register: (payload) => apiFetch('/api/auth/register', { method: 'POST', body: payload }),
  login: (payload) => apiFetch('/api/auth/login', { method: 'POST', body: payload }),
  loginGoogle: (credential) => apiFetch('/api/auth/google', { method: 'POST', body: { credential } }),
  logout: () => apiFetch('/api/auth/logout', { method: 'POST' }),
  updateProfile: (payload) => apiFetch('/api/auth/me', { method: 'PATCH', body: payload }),

  // Skins
  listSkins: (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    const q = qs.toString();
    return apiFetch(`/api/skins${q ? `?${q}` : ''}`);
  },

  // Cart
  getCart: () => apiFetch('/api/cart'),
  addToCart: (skinId, quantity = 1) =>
    apiFetch('/api/cart', { method: 'POST', body: { skinId, quantity } }),
  updateCartQty: (skinId, quantity) =>
    apiFetch(`/api/cart/${skinId}`, { method: 'PATCH', body: { quantity } }),
  removeFromCart: (skinId) => apiFetch(`/api/cart/${skinId}`, { method: 'DELETE' }),
  clearCart: () => apiFetch('/api/cart', { method: 'DELETE' }),
  checkoutCart: () => apiFetch('/api/cart/checkout', { method: 'POST' }),

  // Inventory
  getInventory: () => apiFetch('/api/inventory'),
  sellItems: (purchaseIds) =>
    apiFetch('/api/inventory/sell', { method: 'POST', body: { purchaseIds } }),
  upgradeItem: (payload) => apiFetch('/api/inventory/upgrade', { method: 'POST', body: payload }),

  // Wallet
  topUp: (amount) => apiFetch('/api/wallet/topup', { method: 'POST', body: { amount } }),

  // History
  getHistory: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/api/history${qs ? `?${qs}` : ''}`);
  },
};
