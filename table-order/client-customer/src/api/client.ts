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
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  tableLogin(storeId: string, tableNumber: number, password: string) {
    return request<{ token: string; sessionId: string | null; tableId: number; tableNumber: number }>(
      '/auth/table/login',
      { method: 'POST', body: JSON.stringify({ storeId, tableNumber, password }) }
    );
  },

  // Menu — 서버는 { categories: [...], menus: [...] } 분리 반환
  getMenus(storeId: string) {
    return request<{ categories: Category[]; menus: Menu[] }>(
      `/menus?storeId=${storeId}`
    );
  },

  // Orders — 서버는 body에 items만 필요 (storeId, tableId, sessionId는 JWT에서 추출)
  createOrder(items: OrderItemInput[]) {
    return request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  // Orders — 서버는 배열 직접 반환
  getOrders(sessionId: string) {
    return request<Order[]>(`/orders?sessionId=${sessionId}`);
  },
};

// Types
export interface Category {
  id: number;
  store_id: string;
  name: string;
  sort_order: number;
}

export interface Menu {
  id: number;
  store_id: string;
  category_id: number;
  name: string;
  price: number;
  description: string;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface OrderItemInput {
  menuId: number;
  menuName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  store_id: string;
  table_id: number;
  session_id: string;
  status: 'pending' | 'preparing' | 'completed';
  total_amount: number;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_id: number;
  menu_name: string;
  quantity: number;
  price: number;
}
