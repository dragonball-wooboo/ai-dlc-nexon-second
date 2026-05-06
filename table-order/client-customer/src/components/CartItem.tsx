
import { CartItem as CartItemType } from '../hooks/useCart';

interface Props {
  item: CartItemType;
  onQuantityChange: (menuId: number, quantity: number) => void;
  onRemove: (menuId: number) => void;
}

export function CartItemComponent({ item, onQuantityChange, onRemove }: Props) {
  return (
    <div className="cart-item" data-testid={`cart-item-${item.menuId}`}>
      <div className="cart-item-info">
        <span className="cart-item-name">{item.name}</span>
        <span className="cart-item-price">{(item.price * item.quantity).toLocaleString()}원</span>
      </div>
      <div className="cart-item-controls">
        <button
          className="qty-btn"
          onClick={() => onQuantityChange(item.menuId, item.quantity - 1)}
          data-testid={`cart-qty-minus-${item.menuId}`}
        >
          -
        </button>
        <span className="qty-value" data-testid={`cart-qty-value-${item.menuId}`}>
          {item.quantity}
        </span>
        <button
          className="qty-btn"
          onClick={() => onQuantityChange(item.menuId, item.quantity + 1)}
          data-testid={`cart-qty-plus-${item.menuId}`}
        >
          +
        </button>
        <button
          className="remove-btn"
          onClick={() => onRemove(item.menuId)}
          data-testid={`cart-remove-${item.menuId}`}
        >
          삭제
        </button>
      </div>
    </div>
  );
}
