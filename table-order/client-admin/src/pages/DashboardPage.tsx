import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSSE } from '../hooks/useSSE';
import { getTables, getTableOrders } from '../api/client';
import { TableCard } from '../components/TableCard';
import type { Table, Order } from '../api/client';

export function DashboardPage() {
  const { storeId } = useAuth();
  const { isConnected, connect, lastEvent } = useSSE();

  const [tables, setTables] = useState<Table[]>([]);
  const [ordersByTable, setOrdersByTable] = useState<Record<number, Order[]>>({});
  const [newOrderTableIds, setNewOrderTableIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const tablesData = await getTables();
      setTables(tablesData);

      const ordersMap: Record<number, Order[]> = {};
      await Promise.all(
        tablesData
          .filter((t) => t.currentSessionId)
          .map(async (t) => {
            try {
              ordersMap[t.id] = await getTableOrders(t.id);
            } catch {
              ordersMap[t.id] = [];
            }
          })
      );
      setOrdersByTable(ordersMap);
    } catch {
      // handle error silently
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (storeId) {
      connect(storeId);
    }
  }, [storeId, connect]);

  useEffect(() => {
    if (!lastEvent) return;

    if (lastEvent.type === 'new-order') {
      const order = lastEvent.data as Order;
      setOrdersByTable((prev) => ({
        ...prev,
        [order.tableId]: [...(prev[order.tableId] || []), order],
      }));
      setNewOrderTableIds((prev) => new Set(prev).add(order.tableId));
      setTimeout(() => {
        setNewOrderTableIds((prev) => {
          const next = new Set(prev);
          next.delete(order.tableId);
          return next;
        });
      }, 5000);
    } else if (lastEvent.type === 'order-updated') {
      const updated = lastEvent.data as Order;
      setOrdersByTable((prev) => ({
        ...prev,
        [updated.tableId]: (prev[updated.tableId] || []).map((o) =>
          o.id === updated.id ? updated : o
        ),
      }));
    } else if (lastEvent.type === 'order-deleted') {
      const deleted = lastEvent.data as { orderId: number; tableId: number };
      setOrdersByTable((prev) => ({
        ...prev,
        [deleted.tableId]: (prev[deleted.tableId] || []).filter(
          (o) => o.id !== deleted.orderId
        ),
      }));
    } else if (lastEvent.type === 'table-completed') {
      fetchData();
    }
  }, [lastEvent, fetchData]);

  if (loading) {
    return <div className="dashboard-page__loading">로딩 중...</div>;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-page__header">
        <h1 className="dashboard-page__title">주문 현황</h1>
        <span className={`dashboard-page__sse-status ${isConnected ? 'connected' : 'disconnected'}`}>
          {isConnected ? '● 실시간 연결됨' : '○ 연결 끊김'}
        </span>
      </div>

      <div className="dashboard-page__grid">
        {tables.map((table) => {
          const orders = ordersByTable[table.id] || [];
          const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
          return (
            <TableCard
              key={table.id}
              table={table}
              orders={orders}
              totalAmount={totalAmount}
              hasNewOrder={newOrderTableIds.has(table.id)}
            />
          );
        })}
      </div>

      {tables.length === 0 && (
        <p className="dashboard-page__empty">등록된 테이블이 없습니다.</p>
      )}
    </div>
  );
}
