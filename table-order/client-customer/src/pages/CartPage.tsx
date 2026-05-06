
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { CartItemComponent } from '../components/CartItem';

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalAmount } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="cart-page empty" data-testid="cart-page-empty">
        <h2>장바구니가 비어있습니다</h2>
        <button onClick={() => navigate('/menu')} data-testid="cart-go-menu-btn">
          메뉴 보기
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page" data-testid="cart-page">
      <h2>장바구니</h2>
      <div className="cart-items">
        {items.map(item => (
          <CartItemComponent
            key={item.menuId}
            item={item}
            onQuantityChange={updateQuantity}
            onRemove={removeItem}
          />
        ))}
      </div>
      <div className="cart-summary">
        <div className="cart-total" data-testid="cart-total">
          총 금액: {totalAmount.toLocaleString()}원
        </div>
        <div className="cart-actions">
          <button onClick={clearCart} className="clear-btn" data-testid="cart-clear-btn">
            비우기
          </button>
          <button onClick={() => navigate('/order')} className="order-btn" data-testid="cart-order-btn">
            주문하기
          </button>
        </div>
      </div>
    </div>
  );
}
