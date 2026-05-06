import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getTableOrders,
  updateOrderStatus,
  deleteOrder,
  completeTable,
  getTableHistory,
} from '../api/client';
import { OrderDetail } from '../components/OrderDetail';
import type { Order, OrderStatus, OrderHistory } from '../api/client';

export function TableDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tableId = Number(id);

  const [orders, setOrders] = useState<Order[]>([]);
  const [history, setHistory] = useState<OrderHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getTableOrders(tableId);
      setOrders(data);
    } catch {
      // handle error
    } finally {
      setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  async function handleStatusChange(orderId: number, status: OrderStatus) {
    try {
      const updated = await updateOrderStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    } catch {
      alert('상태 변경에 실패했습니다.');
    }
  }

  async function handleDelete(orderId: number) {
    try {
      await deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch {
      alert('주문 삭제에 실패했습니다.');
    }
  }

  async function handleComplete() {
    if (!confirm('이용 완료 처리하시겠습니까? 모든 주문이 이력으로 이동됩니다.')) return;

    setCompleting(true);
    try {
      await completeTable(tableId);
      navigate('/dashboard');
    } catch {
      alert('이용 완료 처리에 실패했습니다.');
    } finally {
      setCompleting(false);
    }
  }

  async function handleShowHistory() {
    if (showHistory) {
      setShowHistory(false);
      return;
    }
    try {
      const data = await getTableHistory(tableId);
      setHistory(data);
      setShowHistory(true);
    } catch {
      alert('이력 조회에 실패했습니다.');
    }
  }

  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  if (loading) {
    return <div className="table-detail__loading">로딩 중...</div>;
  }

  return (
    <div className="table-detail">
      <div className="table-detail__header">
        <button className="btn btn--secondary" onClick={() => navigate('/dashboard')}>
          ← 돌아가기
        </button>
        <h1 className="table-detail__title">테이블 {id} 상세</h1>
      </div>

      <div className="table-detail__summary">
        <span>주문 {orders.length}건</span>
        <span className="table-detail__total">합계: {totalAmount.toLocaleString()}원</span>
      </div>

      <div className="table-detail__actions">
        <button
          className="btn btn--primary"
          onClick={handleComplete}
          disabled={completing || orders.length === 0}
        >
          {completing ? '처리 중...' : '이용 완료'}
        </button>
        <button className="btn btn--secondary" onClick={handleShowHistory}>
          {showHistory ? '이력 닫기' : '과거 이력'}
        </button>
      </div>

      {orders.length === 0 && !showHistory && (
        <p className="table-detail__empty">현재 주문이 없습니다.</p>
      )}

      <div className="table-detail__orders">
        {orders.map((order) => (
          <OrderDetail
            key={order.id}
            order={order}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {showHistory && (
        <div className="table-detail__history">
          <h2>과거 이력</h2>
          {history.length === 0 ? (
            <p>이력이 없습니다.</p>
          ) : (
            <ul className="table-detail__history-list">
              {history.map((h) => (
                <li key={h.id} className="table-detail__history-item">
                  <span className="table-detail__history-date">
                    {new Date(h.completedAt).toLocaleString('ko-KR')}
                  </span>
                  <span className="table-detail__history-amount">
                    {h.totalAmount.toLocaleString()}원
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
