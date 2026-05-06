import { useEffect, useState } from 'react';
import { api, Order } from '../api/client';
import { useAuth } from '../hooks/useAuth';

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { sessionId } = useAuth();

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    api.getOrders(sessionId)
      .then(data => setOrders(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  const statusLabel = (status: string) => {
    switch (status) {
      case 'pending': return '대기중';
      case 'preparing': return '준비중';
      case 'completed': return '완료';
      default: return status;
    }
  };

  const statusClass = (status: string) => `status-badge status-${status}`;

  if (loading) return <div className="loading">주문 내역을 불러오는 중...</div>;

  if (orders.length === 0) {
    return (
      <div className="order-history-page empty" data-testid="order-history-empty">
        <h2>주문 내역</h2>
        <p>아직 주문 내역이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="order-history-page" data-testid="order-history-page">
      <h2>주문 내역</h2>
      <div className="order-list">
        {orders.map(order => (
          <div key={order.id} className="order-history-card" data-testid={`order-card-${order.id}`}>
            <div className="order-header">
              <span className="order-id">#{order.id}</span>
              <span className={statusClass(order.status)}>{statusLabel(order.status)}</span>
            </div>
            <div className="order-time">
              {new Date(order.created_at).toLocaleTimeString('ko-KR')}
            </div>
            {order.items && (
              <div className="order-menu-list">
                {order.items.map((item, idx) => (
                  <span key={idx}>{item.menu_name} x{item.quantity}</span>
                ))}
              </div>
            )}
            <div className="order-amount">
              {order.total_amount.toLocaleString()}원
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
