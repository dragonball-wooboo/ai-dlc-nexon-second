import { useState, useRef, useCallback, useEffect } from 'react';

export interface SSEEvent {
  type: 'new-order' | 'order-updated' | 'order-deleted' | 'table-completed';
  data: unknown;
}

export function useSSE() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const storeIdRef = useRef<string | null>(null);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    clearReconnectTimer();
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    storeIdRef.current = null;
  }, [clearReconnectTimer]);

  const connect = useCallback(
    (storeId: string) => {
      disconnect();
      storeIdRef.current = storeId;

      const stored = localStorage.getItem('admin-auth');
      if (!stored) return;
      const { token } = JSON.parse(stored);

      const url = `/api/sse/orders?storeId=${storeId}&token=${token}`;
      const es = new EventSource(url);
      eventSourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
        clearReconnectTimer();
      };

      es.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as SSEEvent;
          setLastEvent(parsed);
        } catch {
          // ignore malformed events
        }
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        setIsConnected(false);

        // auto-reconnect after 3 seconds
        if (storeIdRef.current) {
          reconnectTimerRef.current = setTimeout(() => {
            if (storeIdRef.current) {
              connect(storeIdRef.current);
            }
          }, 3000);
        }
      };
    },
    [disconnect, clearReconnectTimer]
  );

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
    lastEvent,
  };
}
