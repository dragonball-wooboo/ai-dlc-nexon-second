const BASE_URL = '/api';

function getToken(): string | null {
  const stored = localStorage.getItem('admin-auth');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed.token ?? null;
  } catch {
    return null;
  }
}

function getStoreId(): string | null {
  const stored = localStorage.getItem('admin-auth');
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored);
    return parsed.storeId ?? null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('admin-auth');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth
export function loginAdmin(storeId: string, username: string, password: string) {
  return request<{ token: string; expiresIn: string; store: { id: string; name: string } }>('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ storeId, username, password }),
  });
}

// Tables
export function getTables() {
  return request<Table[]>('/tables');
}

export function getTableOrders(tableId: number) {
  // 서버는 { table: {...}, orders: [...] } 반환
  return request<{ table: Table; orders: Order[] }>(`/orders/table/${tableId}`);
}

export function completeTable(tableId: number) {
  return request<{ message: string }>(`/tables/${tableId}/complete`, {
    method: 'POST',
  });
}

export function getTableHistory(tableId: number, date?: string) {
  const query = date ? `?date=${date}` : '';
  return request<OrderHistory[]>(`/tables/${tableId}/history${query}`);
}

// Orders — 서버는 PUT 메서드 사용
export function updateOrderStatus(orderId: number, status: OrderStatus) {
  return request<{ orderId: number; status: OrderStatus }>(`/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}

export function deleteOrder(orderId: number) {
  return request<{ message: string }>(`/orders/${orderId}`, {
    method: 'DELETE',
  });
}

// Menus — 서버는 storeId 쿼리 파라미터 필수
export function getMenus() {
  const storeId = getStoreId();
  return request<{ categories: Category[]; menus: Menu[] }>(`/menus?storeId=${storeId}`);
}

// Categories — 서버 엔드포인트: /api/menus/categories/list
export function getCategories() {
  const storeId = getStoreId();
  return request<Category[]>(`/menus/categories/list?storeId=${storeId}`);
}

export function createCategory(name: string, sortOrder?: number) {
  return request<Category>('/menus/categories', {
    method: 'POST',
    body: JSON.stringify({ name, sortOrder: sortOrder || 0 }),
  });
}

export function createMenu(data: MenuInput) {
  return request<Menu>('/menus', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateMenu(id: number, data: MenuInput) {
  return request<Menu>(`/menus/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteMenu(id: number) {
  return request<{ message: string }>(`/menus/${id}`, {
    method: 'DELETE',
  });
}

// Upload — 서버는 { imageUrl: "..." } 반환
export function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  return request<{ imageUrl: string }>('/upload/image', {
    method: 'POST',
    body: formData,
  });
}

// Types
export type OrderStatus = 'pending' | 'preparing' | 'completed';

export interface Table {
  id: number;
  store_id: string;
  table_number: number;
  current_session_id: string | null;
  created_at: string;
  totalAmount?: number;
}

export interface Order {
  id: number;
  store_id: string;
  table_id: number;
  session_id: string;
  status: OrderStatus;
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

export interface OrderHistory {
  id: number;
  store_id: string;
  table_id: number;
  table_number: number;
  session_id: string;
  orderData: any;
  total_amount: number;
  completed_at: string;
}

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

export interface MenuInput {
  name: string;
  price: number;
  description?: string;
  categoryId: number;
  imageUrl?: string;
  sortOrder?: number;
}
