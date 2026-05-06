import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Menu } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { CategoryNav } from '../components/CategoryNav';
import { MenuCard } from '../components/MenuCard';

interface Category {
  id: number;
  name: string;
  menus: Menu[];
}

export function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { storeId } = useAuth();
  const { addItem, itemCount } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!storeId) return;
    setLoading(true);
    api.getMenus(storeId)
      .then(data => {
        setCategories(data.categories);
        if (data.categories.length > 0) {
          setSelectedCategory(data.categories[0].id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [storeId]);

  const currentMenus = categories.find(c => c.id === selectedCategory)?.menus || [];

  if (loading) return <div className="loading">메뉴를 불러오는 중...</div>;

  return (
    <div className="menu-page" data-testid="menu-page">
      <CategoryNav
        categories={categories.map(c => ({ id: c.id, name: c.name }))}
        selectedId={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <div className="menu-grid">
        {currentMenus.map(menu => (
          <MenuCard key={menu.id} menu={menu} onAdd={addItem} />
        ))}
      </div>
      {itemCount > 0 && (
        <button
          className="cart-floating-btn"
          onClick={() => navigate('/cart')}
          data-testid="cart-floating-btn"
        >
          장바구니 ({itemCount})
        </button>
      )}
    </div>
  );
}
