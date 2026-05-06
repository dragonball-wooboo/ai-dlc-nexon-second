import { useState } from 'react';
import type { Order, OrderStatus } from '../api/client';

interface OrderDetailProps {
  order: Order;
  onStatusChange: (orderId: number, status: OrderStatus) => void;
  onDelete: (orderId: number) => void;
}

const STATUS_FLOW: Record<string, OrderStatus | null> = {
  pending: 'preparing',
  preparing: 'completed',
  completed: null,
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: '대기',
  preparing: '준비중',
  completed: '완료',
};

export function OrderDetail({ order, onStatusChange, onDelete }: OrderDetailProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const nextStatus = STATUS_FLOW[order.status];

  return (
    <div className="order-detail">
      <div className="order-detail__header">
        <span className={`order-detail__status order-detail__status--${order.status}`}>
          {STATUS_LABEL[order.status]}
        </span>
        <span className="order-detail__time">
          {new Date(order.createdAt).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {order.items && order.items.length > 0 && (
        <ul className="order-detail__items">
          {order.items.map((item) => (
            <li key={item.id} className="order-detail__item">
              <span className="order-detail__item-name">{item.menuName}</span>
              <span className="order-detail__item-qty">x{item.quantity}</span>
              <span className="order-detail__item-price">
                {(item.price * item.quantity).toLocaleString()}원
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="order-detail__total">
        합계: {order.totalAmount.toLocaleString()}원
      </div>

      <div className="order-detail__actions">
        {nextStatus && (
          <button
            className="btn btn--primary"
            onClick={() => onStatusChange(order.id, nextStatus)}
          >
            {nextStatus === 'preparing' && '준비 시작'}
            {nextStatus === 'completed' && '완료 처리'}
          </button>
        )}

        {!showDeleteConfirm ? (
          <button
            className="btn btn--danger"
            onClick={() => setShowDeleteConfirm(true)}
          >
            삭제
          </button>
        ) : (
          <div className="order-detail__confirm">
            <span>정말 삭제하시겠습니까?</span>
            <button
              className="btn btn--danger"
              onClick={() => {
                onDelete(order.id);
                setShowDeleteConfirm(false);
              }}
            >
              확인
            </button>
            <button
              className="btn btn--secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              취소
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
