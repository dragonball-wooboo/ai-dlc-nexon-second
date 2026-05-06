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
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Auth
export function loginAdmin(storeId: string, username: string, password: string) {
  return request<{ token: string; expiresIn: string }>('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify({ storeId, username, password }),
  });
}

// Tables
export function getTables() {
  return request<Table[]>('/tables');
}

export function getTableOrders(tableId: number) {
  return request<Order[]>(`/orders/table/${tableId}`);
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

// Orders
export function updateOrderStatus(orderId: number, status: OrderStatus) {
  return request<Order>(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteOrder(orderId: number) {
  return request<{ message: string }>(`/orders/${orderId}`, {
    method: 'DELETE',
  });
}

// Menus
export function getMenus() {
  return request<Menu[]>('/menus');
}

export function getCategories() {
  return request<Category[]>('/categories');
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

// Upload
export function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);
  return request<{ url: string }>('/upload/image', {
    method: 'POST',
    body: formData,
  });
}

// Types
export type OrderStatus = 'pending' | 'preparing' | 'completed';

export interface Table {
  id: number;
  storeId: string;
  tableNumber: number;
  currentSessionId: string | null;
  createdAt: string;
}

export interface Order {
  id: number;
  storeId: string;
  tableId: number;
  sessionId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  menuId: number;
  menuName: string;
  quantity: number;
  price: number;
}

export interface OrderHistory {
  id: number;
  storeId: string;
  tableId: number;
  tableNumber: number;
  sessionId: string;
  orderData: string;
  totalAmount: number;
  completedAt: string;
}

export interface Category {
  id: number;
  storeId: string;
  name: string;
  sortOrder: number;
}

export interface Menu {
  id: number;
  storeId: string;
  categoryId: number;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

export interface MenuInput {
  name: string;
  price: number;
  description?: string;
  categoryId: number;
  imageUrl?: string;
  sortOrder?: number;
}
