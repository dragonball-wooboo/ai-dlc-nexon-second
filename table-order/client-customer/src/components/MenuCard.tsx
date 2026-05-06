import React from 'react';
import { Menu } from '../api/client';

interface Props {
  menu: Menu;
  onAdd: (menu: Menu) => void;
}

export function MenuCard({ menu, onAdd }: Props) {
  return (
    <div className="menu-card" data-testid={`menu-card-${menu.id}`}>
      {menu.imageUrl && (
        <img src={menu.imageUrl} alt={menu.name} className="menu-card-image" />
      )}
      <div className="menu-card-body">
        <h3 className="menu-card-name">{menu.name}</h3>
        <p className="menu-card-desc">{menu.description}</p>
        <div className="menu-card-footer">
          <span className="menu-card-price">{menu.price.toLocaleString()}원</span>
          <button
            className="menu-card-add-btn"
            onClick={() => onAdd(menu)}
            data-testid={`menu-add-btn-${menu.id}`}
          >
            담기
          </button>
        </div>
      </div>
    </div>
  );
}
