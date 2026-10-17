const API_BASE = 'http://localhost:5000/api';

const authHeaders = (token) => {
  if (!token || token === 'null' || token === 'undefined') return {};
  return { Authorization: `Bearer ${token}` };
};

export const api = {
  // Auth
  getQuickAccounts: async () => {
    const res = await fetch(`${API_BASE}/auth/quick-accounts`);
    return res.json();
  },
  login: async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  register: async (data) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  // Crops
  getCrops: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/crops${query ? `?${query}` : ''}`);
    return res.json();
  },
  getCropById: async (id) => {
    const res = await fetch(`${API_BASE}/crops/${id}`);
    return res.json();
  },
  createCrop: async (cropData, token) => {
    const res = await fetch(`${API_BASE}/crops`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token)
      },
      body: JSON.stringify(cropData)
    });
    return res.json();
  },

  // Bookings (Pre-harvest)
  getBookings: async (token) => {
    const res = await fetch(`${API_BASE}/bookings`, {
      headers: { ...authHeaders(token) }
    });
    return res.json();
  },
  createBooking: async (bookingData, token) => {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token)
      },
      body: JSON.stringify(bookingData)
    });
    return res.json();
  },
  confirmBooking: async (bookingId, token) => {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/confirm`, {
      method: 'PATCH',
      headers: { ...authHeaders(token) }
    });
    return res.json();
  },

  // Orders
  getOrders: async (token) => {
    const res = await fetch(`${API_BASE}/orders`, {
      headers: { ...authHeaders(token) }
    });
    return res.json();
  },
  instantBuy: async (orderData, token) => {
    const res = await fetch(`${API_BASE}/orders/instant-buy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token)
      },
      body: JSON.stringify(orderData)
    });
    return res.json();
  },
  updateOrderStatus: async (orderId, statusData, token) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token)
      },
      body: JSON.stringify(statusData)
    });
    return res.json();
  },

  // AI Decision Engine & Traceability
  matchCrops: async (criteria) => {
    const res = await fetch(`${API_BASE}/ai/match-crops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(criteria)
    });
    return res.json();
  },
  getDemandForecast: async (cropName = 'Tomato', region = 'Kolhapur') => {
    const res = await fetch(`${API_BASE}/ai/demand-forecast?cropName=${encodeURIComponent(cropName)}&region=${encodeURIComponent(region)}`);
    return res.json();
  },
  getWastageAlerts: async () => {
    const res = await fetch(`${API_BASE}/ai/wastage-alerts`);
    return res.json();
  },
  optimizeTransport: async (pickups, vehicleCapacityKg = 10000) => {
    const res = await fetch(`${API_BASE}/ai/optimize-transport`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pickups, vehicleCapacityKg })
    });
    return res.json();
  },
  getBlockchainLedger: async () => {
    const res = await fetch(`${API_BASE}/ai/blockchain/ledger`);
    return res.json();
  },
  getAdminStats: async (token) => {
    const res = await fetch(`${API_BASE}/ai/admin-dashboard`, {
      headers: { ...authHeaders(token) }
    });
    return res.json();
  },

  // Mandi Market Prices (data.gov.in proxy)
  getMarketPrices: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/market-prices${query ? `?${query}` : ''}`);
    return res.json();
  }
};
