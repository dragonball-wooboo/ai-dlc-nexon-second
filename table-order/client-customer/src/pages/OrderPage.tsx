import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

export function OrderPage() {
  const { items, totalAmount, clearCart } = useCart();
  const { storeId, tableId } = useAuth();
  const navigate = useNavigate();
  const [orderResult, setOrderResult] = useState<{ id: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !orderResult) {
      navigate('/menu');
    }
  }, [items, orderResult, navigate]);

  useEffect(() => {
    if (orderResult) {
      const timer = setTimeout(() => {
        navigate('/menu');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [orderResult, navigate]);

  const handleConfirm = async () => {
    if (!storeId || !tableId) return;
    setLoading(true);
    setError('');

    try {
      // 서버는 JWT 토큰에서 storeId, tableId, sessionId 추출. body에는 items만 전송
      const result = await api.createOrder(
        items.map(item => ({
          menuId: item.menuId,
          menuName: item.name,
          quantity: item.quantity,
          price: item.price,
        }))
      );
      setOrderResult({ id: result.id });
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : '주문에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (orderResult) {
    return (
      <div className="order-page success" data-testid="order-success">
        <h2>주문 완료!</h2>
        <p className="order-number">주문번호: #{orderResult.id}</p>
        <p className="redirect-msg">5초 후 메뉴 화면으로 이동합니다...</p>
      </div>
    );
  }

  return (
    <div className="order-page" data-testid="order-page">
      <h2>주문 확인</h2>
      <div className="order-items">
        {items.map(item => (
          <div key={item.menuId} className="order-item">
            <span>{item.name} x {item.quantity}</span>
            <span>{(item.price * item.quantity).toLocaleString()}원</span>
          </div>
        ))}
      </div>
      <div className="order-total" data-testid="order-total">
        총 금액: {totalAmount.toLocaleString()}원
      </div>
      {error && <p className="error-message" data-testid="order-error">{error}</p>}
      <div className="order-actions">
        <button onClick={() => navigate('/cart')} data-testid="order-back-btn">
          돌아가기
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="confirm-btn"
          data-testid="order-confirm-btn"
        >
          {loading ? '주문 중...' : '주문 확정'}
        </button>
      </div>
    </div>
  );
}
