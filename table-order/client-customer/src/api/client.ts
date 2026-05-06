const API_BASE = '/api';

function getToken(): string | null {
  const auth = localStorage.getItem('table-order-auth');
  if (!auth) return null;
  return JSON.parse(auth).token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  tableLogin(storeId: string, tableNumber: number, password: string) {
    return request<{ token: string; sessionId: string; tableId: number }>(
      '/auth/table/login',
      { method: 'POST', body: JSON.stringify({ storeId, tableNumber, password }) }
    );
  },

  // Menu
  getMenus(storeId: string) {
    return request<{ categories: Array<{ id: number; name: string; menus: Array<Menu> }> }>(
      `/menus?storeId=${storeId}`
    );
  },

  // Orders
  createOrder(data: CreateOrderRequest) {
    return request<{ order: Order }>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getOrders(sessionId: string) {
    return request<{ orders: Order[] }>(`/orders?sessionId=${sessionId}`);
  },
};

// Types
export interface Menu {
  id: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  categoryId: number;
  sortOrder: number;
}

export interface CreateOrderRequest {
  storeId: string;
  tableId: number;
  sessionId: string;
  items: Array<{ menuId: number; menuName: string; quantity: number; price: number }>;
  totalAmount: number;
}

export interface Order {
  id: number;
  storeId: string;
  tableId: number;
  sessionId: string;
  status: 'pending' | 'preparing' | 'completed';
  totalAmount: number;
  createdAt: string;
  items?: Array<{ menuName: string; quantity: number; price: number }>;
}
