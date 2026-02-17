const getStoredBase = () => {
  try {
    return localStorage.getItem('api_base_url') || null;
  } catch {
    return null;
  }
};
const envBase =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  (typeof window !== 'undefined' && (window.VITE_API_URL || window.API_BASE_URL)) ||
  null;
const originBase = (typeof window !== 'undefined' && window.location?.origin) ? window.location.origin : null;
const cloudBase = 'https://greenfarmiq-1.onrender.com/api';
let API_BASE_URL = '/api';

const tryCandidates = async (path, options = {}) => {
  const candidates = [];
  const stored = getStoredBase();
  if (stored) candidates.push(stored);
  candidates.push('/api');
  if (envBase) candidates.push(envBase);
  if (originBase) {
    candidates.push(`${originBase}/api`);
    candidates.push(originBase);
  }
  candidates.push(cloudBase);
  candidates.push('http://localhost:5000/api', 'http://localhost:5000', 'http://127.0.0.1:5000/api', 'http://127.0.0.1:5000');

  const unique = [...new Set(candidates.filter(Boolean))];
  let lastError;
  for (const base of unique) {
    try {
      // Test the connection with a simple health check first
      const healthCheck = await fetch(`${base}/health`).catch(() => null);
      if (healthCheck && healthCheck.ok) {
        const healthData = await healthCheck.json().catch(() => null);
        if (healthData && healthData.status === 'ok') {
          // Health check passed, now try the actual request
          const res = await fetch(`${base}${path}`, options);
          if (res && res.ok) {
            try {
              localStorage.setItem('api_base_url', base);
            } catch {
              // ignore storage errors
            }
            API_BASE_URL = base;
            return res;
          }
          // If 404, keep trying next candidate (path likely wrong for this base)
          if (res && res.status === 404) {
            lastError = new Error('404 from ' + base);
            continue;
          }
          // Non-OK but not 404 (e.g., 400/401) -> return to let caller surface message
          return res;
        }
      }
      
      // If health check failed, try the original request anyway
      const res = await fetch(`${base}${path}`, options);
      // Only accept and persist base if the response is OK (2xx)
      if (res && res.ok) {
        try {
          localStorage.setItem('api_base_url', base);
        } catch {
          // ignore storage errors
        }
        API_BASE_URL = base;
        return res;
      }
      // If 404, keep trying next candidate (path likely wrong for this base)
      if (res && res.status === 404) {
        lastError = new Error('404 from ' + base);
        continue;
      }
      // Non-OK but not 404 (e.g., 400/401) -> return to let caller surface message
      return res;
    } catch (e) {
      lastError = e;
      continue;
    }
  }
  throw lastError || new Error('Network error - backend may be unreachable. Ensure your backend server is running and accessible.');
};

// Get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Default headers
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = getToken();
  if (token) {
    headers['x-auth-token'] = token;
  }
  
  return headers;
};

// AUTHENTICATION
export const authService = {
  register: async (userData) => {
    try {
      // Attempt on current base
      let response = await fetch(`${API_BASE_URL}/users/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(userData),
      }).catch(() => null);
      // If network error or problematic status, try candidates
      if (!response || [404, 500, 502, 503, 504].includes(response.status)) {
        response = await tryCandidates('/users/register', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(userData),
        });
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = data.message || data.msg || data.error || `Registration failed (${response.status})`;
        return { success: false, message: msg };
      }
      return data;
    } catch {
      return { success: false, message: 'Network error connecting to API. Check server URL.' };
    }
  },

  login: async (credentials) => {
    try {
      // Attempt on current base
      let response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(credentials),
      }).catch(() => null);
      // If network error or problematic status, try candidates
      if (!response || [404, 500, 502, 503, 504].includes(response.status)) {
        response = await tryCandidates('/users/login', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(credentials),
        });
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const msg = data.message || data.msg || data.error || `Login failed (${response.status})`;
        return { success: false, message: msg };
      }
      return data;
    } catch {
      return { success: false, message: 'Network error connecting to API. Check server URL.' };
    }
  },

  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  }
};

// PRODUCT LISTINGS
export const productListingService = {
  createListing: async (listingData) => {
    const response = await fetch(`${API_BASE_URL}/product-listings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(listingData),
    });
    if (response.status === 401) {
      try {
        const data = await response.json();
        if ((data.message || data.msg || '').toLowerCase().includes('token')) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return { success: false, message: 'Session expired or token invalid. Please sign in again.' };
        }
        return data;
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return { success: false, message: 'Session expired. Please sign in again.' };
      }
    }
    return response.json();
  },

  getAllListings: async () => {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/product-listings`, {
        method: 'GET',
        headers: getHeaders(),
      });
    } catch {
      response = await tryCandidates('/product-listings', {
        method: 'GET',
        headers: getHeaders(),
      });
    }
    const data = await response.json();
    return Array.isArray(data) ? data : (data.productListings || []);
  },

  getListingById: async (id) => {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/product-listings/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
    } catch {
      response = await tryCandidates(`/product-listings/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
    }
    return response.json();
  },

  updateListing: async (id, updateData) => {
    const response = await fetch(`${API_BASE_URL}/product-listings/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });
    return response.json();
  },

  deleteListing: async (id) => {
    const response = await fetch(`${API_BASE_URL}/product-listings/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  }
};

// BIDS
export const bidService = {
  createBid: async (bidData) => {
    const response = await fetch(`${API_BASE_URL}/bids`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bidData),
    });
    return response.json();
  },

  getAllBids: async () => {
    const response = await fetch(`${API_BASE_URL}/bids`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await response.json();
    return Array.isArray(data) ? data : (data.bids || []);
  },

  getFarmerBids: async () => {
    const response = await fetch(`${API_BASE_URL}/bids`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await response.json();
    return Array.isArray(data) ? data : (data.bids || []);
  },

  getBidById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/bids/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  updateBid: async (id, updateData) => {
    const response = await fetch(`${API_BASE_URL}/bids/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });
    return response.json();
  },

  deleteBid: async (id) => {
    const response = await fetch(`${API_BASE_URL}/bids/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return response.json();
  }
};

// SMART MATCHING
export const matchingService = {
  getBestBids: async (listingId) => {
    const response = await fetch(`${API_BASE_URL}/matching/best-farmers/${listingId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  getSuitableListings: async () => {
    const response = await fetch(`${API_BASE_URL}/matching/suitable-listings`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  getRecommendations: async () => {
    const response = await fetch(`${API_BASE_URL}/matching/suitable-listings`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  checkCompatibility: async (productListingId, bidDetails) => {
    const response = await fetch(`${API_BASE_URL}/matching/check-compatibility`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productListingId, bidDetails }),
    });
    return response.json();
  }
};

// ORDERS
export const orderService = {
  createDirectOrder: async ({ productListingId, quantity, unitPrice, deliveryDate, qualityInfo, specialInstructions }) => {
    const response = await fetch(`${API_BASE_URL}/orders/direct`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ productListingId, quantity, unitPrice, deliveryDate, qualityInfo, specialInstructions }),
    });
    return response.json();
  },
  createOrder: async (bidId, specialInstructions) => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ bidId, specialInstructions }),
    });
    return response.json();
  },

  getAllOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await response.json();
    return Array.isArray(data) ? data : (data.orders || []);
  },

  getFarmerOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const data = await response.json();
    return Array.isArray(data) ? data : (data.orders || []);
  },

  getOrders: async (filters) => {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/orders?${queryParams}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  getOrderById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  updateOrderStatus: async (id, status, cancellationReason = null) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, cancellationReason }),
    });
    return response.json();
  },

  updatePaymentStatus: async (id, paymentStatus) => {
    const response = await fetch(`${API_BASE_URL}/orders/${id}/payment`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ paymentStatus }),
    });
    return response.json();
  }
};

// CHAT
export const chatService = {
  getChats: async () => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },
  getChatById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/chat/${id}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },
  sendMessage: async ({ receiverId, content, orderId = null }) => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ receiverId, content, orderId }),
    });
    return response.json();
  }
};

// PAYMENT
export const paymentService = {
  createPaymentOrder: async (orderId, amount) => {
    const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId, amount }),
    });
    return response.json();
  },

  verifyPayment: async (paymentData) => {
    const response = await fetch(`${API_BASE_URL}/payments/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(paymentData),
    });
    return response.json();
  },

  createStripePaymentIntent: async (orderId, amount) => {
    const response = await fetch(`${API_BASE_URL}/payments/stripe/create-payment-intent`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId, amount }),
    });
    return response.json();
  },

  payWithWallet: async (orderId, amount) => {
    const response = await fetch(`${API_BASE_URL}/payments/wallet`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ orderId, amount }),
    });
    return response.json();
  },

  getUserPayments: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/payments/user/${userId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  getOrderPayment: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/payments/order/${orderId}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  }
};

// ADMIN
export const adminService = {
  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  getUsers: async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    
    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  updateUserKYC: async (userId, kycData) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/kyc`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(kycData),
    });
    return response.json();
  },

  updateUserStatus: async (userId, isActive) => {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ isActive }),
    });
    return response.json();
  },

  getOrders: async (page = 1, limit = 10, filters = {}) => {
    const queryParams = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    
    const response = await fetch(`${API_BASE_URL}/admin/orders?${queryParams}`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  },

  getAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/admin/analytics`, {
      method: 'GET',
      headers: getHeaders(),
    });
    return response.json();
  }
};
