import { useState, useEffect, useCallback, useMemo } from 'react';

export interface CartItem {
  menuId: number;
  name: string;
  price: number;
  quantity: number;
}

const STORAGE_KEY = 'table-order-cart';

function loadCart(): CartItem[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((menu: { id: number; name: string; price: number }) => {
    setItems(prev => {
      const existing = prev.find(item => item.menuId === menu.id);
      if (existing) {
        return prev.map(item =>
          item.menuId === menu.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { menuId: menu.id, name: menu.name, price: menu.price, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((menuId: number) => {
    setItems(prev => prev.filter(item => item.menuId !== menuId));
  }, []);

  const updateQuantity = useCallback((menuId: number, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.menuId !== menuId));
      return;
    }
    setItems(prev =>
      prev.map(item => (item.menuId === menuId ? { ...item, quantity } : item))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  return { items, addItem, removeItem, updateQuantity, clearCart, totalAmount, itemCount };
}
