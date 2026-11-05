const API_BASE = '/api';

/**
 * Helper to get auth header if JWT token is stored
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },
  register: async (userData) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },
  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  getRoles: async () => {
    const res = await fetch(`${API_BASE}/auth/roles`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  // Books & Copies
  getBooks: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/books?${query}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  getBookById: async (id) => {
    const res = await fetch(`${API_BASE}/books/${id}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  createBook: async (data) => {
    const res = await fetch(`${API_BASE}/books`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  getCopies: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/books/copies?${query}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  addCopies: async (bookId, data) => {
    const res = await fetch(`${API_BASE}/books/${bookId}/copies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  updateCopyStatus: async (copyId, data) => {
    const res = await fetch(`${API_BASE}/books/copies/${copyId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Categories
  getCategories: async () => {
    const res = await fetch(`${API_BASE}/categories`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  createCategory: async (data) => {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Feature 1: Donations
  getDonations: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/donations?${query}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  createDonation: async (data) => {
    const res = await fetch(`${API_BASE}/donations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  approveDonation: async (id, data = {}) => {
    const res = await fetch(`${API_BASE}/donations/${id}/approve`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  rejectDonation: async (id, data = {}) => {
    const res = await fetch(`${API_BASE}/donations/${id}/reject`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  deleteDonation: async (id) => {
    const res = await fetch(`${API_BASE}/donations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Feature 2: Purchasing & Suppliers
  getSuppliers: async () => {
    const res = await fetch(`${API_BASE}/suppliers`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  createSupplier: async (data) => {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  getPurchases: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/purchases?${query}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  createPurchase: async (data) => {
    const res = await fetch(`${API_BASE}/purchases`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  receivePurchase: async (id, data = {}) => {
    const res = await fetch(`${API_BASE}/purchases/${id}/receive`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Feature 3: Lending & Fines
  getLends: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/lends?${query}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  getOverdueLends: async () => {
    const res = await fetch(`${API_BASE}/lends/overdue`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  borrowBook: async (data) => {
    const res = await fetch(`${API_BASE}/lends/borrow`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  returnBook: async (id, data = {}) => {
    const res = await fetch(`${API_BASE}/lends/${id}/return`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  getFines: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/fines?${query}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  payFine: async (id, data = {}) => {
    const res = await fetch(`${API_BASE}/fines/${id}/pay`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  // Feature 4: In-Library Use
  getInLibrarySessions: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/in-library?${query}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  getOverdueInLibrarySessions: async () => {
    const res = await fetch(`${API_BASE}/in-library/overdue`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },
  startInLibrarySession: async (data) => {
    const res = await fetch(`${API_BASE}/in-library/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },
  returnInLibrarySession: async (id, data = {}) => {
    const res = await fetch(`${API_BASE}/in-library/${id}/return`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  }
};

