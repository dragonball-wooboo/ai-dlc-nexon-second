import { useState, useEffect, useCallback } from 'react';
import {
  getMenus,
  getCategories,
  createMenu,
  updateMenu,
  deleteMenu,
} from '../api/client';
import { MenuForm } from '../components/MenuForm';
import type { Menu, Category, MenuInput } from '../api/client';

export function MenuManagePage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingMenu, setEditingMenu] = useState<Menu | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [menusData, categoriesData] = await Promise.all([
        getMenus(),
        getCategories(),
      ]);
      setMenus(menusData);
      setCategories(categoriesData);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleSubmit(data: MenuInput) {
    try {
      if (editingMenu) {
        const updated = await updateMenu(editingMenu.id, data);
        setMenus((prev) => prev.map((m) => (m.id === editingMenu.id ? updated : m)));
      } else {
        const created = await createMenu(data);
        setMenus((prev) => [...prev, created]);
      }
      setShowForm(false);
      setEditingMenu(undefined);
    } catch {
      alert('메뉴 저장에 실패했습니다.');
    }
  }

  async function handleDelete(menuId: number) {
    if (!confirm('이 메뉴를 삭제하시겠습니까?')) return;
    try {
      await deleteMenu(menuId);
      setMenus((prev) => prev.filter((m) => m.id !== menuId));
    } catch {
      alert('메뉴 삭제에 실패했습니다.');
    }
  }

  function handleEdit(menu: Menu) {
    setEditingMenu(menu);
    setShowForm(true);
  }

  function handleCancel() {
    setShowForm(false);
    setEditingMenu(undefined);
  }

  const filteredMenus = selectedCategory
    ? menus.filter((m) => m.categoryId === selectedCategory)
    : menus;

  if (loading) {
    return <div className="menu-manage__loading">로딩 중...</div>;
  }

  return (
    <div className="menu-manage">
      <div className="menu-manage__header">
        <h1 className="menu-manage__title">메뉴 관리</h1>
        {!showForm && (
          <button
            className="btn btn--primary"
            onClick={() => {
              setEditingMenu(undefined);
              setShowForm(true);
            }}
          >
            + 메뉴 추가
          </button>
        )}
      </div>

      {showForm && (
        <MenuForm
          menu={editingMenu}
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      {!showForm && (
        <>
          <div className="menu-manage__filter">
            <button
              className={`btn ${selectedCategory === null ? 'btn--primary' : 'btn--secondary'}`}
              onClick={() => setSelectedCategory(null)}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`btn ${selectedCategory === cat.id ? 'btn--primary' : 'btn--secondary'}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="menu-manage__list">
            {filteredMenus.length === 0 && (
              <p className="menu-manage__empty">등록된 메뉴가 없습니다.</p>
            )}
            {filteredMenus.map((menu) => (
              <div key={menu.id} className="menu-manage__item">
                {menu.imageUrl && (
                  <img
                    src={menu.imageUrl}
                    alt={menu.name}
                    className="menu-manage__item-image"
                  />
                )}
                <div className="menu-manage__item-info">
                  <h3 className="menu-manage__item-name">{menu.name}</h3>
                  <p className="menu-manage__item-price">
                    {menu.price.toLocaleString()}원
                  </p>
                  {menu.description && (
                    <p className="menu-manage__item-desc">{menu.description}</p>
                  )}
                </div>
                <div className="menu-manage__item-actions">
                  <button className="btn btn--secondary" onClick={() => handleEdit(menu)}>
                    수정
                  </button>
                  <button className="btn btn--danger" onClick={() => handleDelete(menu.id)}>
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
