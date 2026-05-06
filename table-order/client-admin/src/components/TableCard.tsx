import { useNavigate } from 'react-router-dom';
import type { Table, Order } from '../api/client';

interface TableCardProps {
  table: Table;
  orders: Order[];
  totalAmount: number;
  hasNewOrder: boolean;
}

export function TableCard({ table, orders, totalAmount, hasNewOrder }: TableCardProps) {
  const navigate = useNavigate();

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const recentOrders = orders.slice(-3);

  return (
    <div
      className={`table-card ${hasNewOrder ? 'table-card--highlight' : ''} ${
        table.currentSessionId ? 'table-card--active' : 'table-card--empty'
      }`}
      onClick={() => navigate(`/tables/${table.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') navigate(`/tables/${table.id}`);
      }}
      aria-label={`테이블 ${table.tableNumber} 상세 보기`}
    >
      <div className="table-card__header">
        <span className="table-card__number">테이블 {table.tableNumber}</span>
        {pendingCount > 0 && (
          <span className="table-card__badge">{pendingCount}</span>
        )}
      </div>

      {table.currentSessionId ? (
        <>
          <div className="table-card__amount">
            {totalAmount.toLocaleString()}원
          </div>
          <ul className="table-card__orders">
            {recentOrders.map((order) => (
              <li key={order.id} className={`table-card__order table-card__order--${order.status}`}>
                <span className="table-card__order-status">
                  {order.status === 'pending' && '대기'}
                  {order.status === 'preparing' && '준비중'}
                  {order.status === 'completed' && '완료'}
                </span>
                <span className="table-card__order-amount">
                  {order.totalAmount.toLocaleString()}원
                </span>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="table-card__empty-label">비어있음</div>
      )}
    </div>
  );
}
