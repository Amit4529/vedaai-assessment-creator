'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useAssignmentStore } from '@/store/useAssignmentStore';

const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const WS_URL =
  process.env.NEXT_PUBLIC_WS_URL ||
  (API_BASE ? `${API_BASE.replace(/^http/i, 'ws')}/ws` : 'ws://localhost:5000/ws');

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const { updateCurrentAssignment, setCurrentAssignment } = useAssignmentStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 WebSocket connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === 'status') {
            if (message.status === 'processing') {
              updateCurrentAssignment({ status: 'processing' });
            } else if (message.status === 'completed' && message.result) {
              setCurrentAssignment(message.result);
            } else if (message.status === 'failed') {
              updateCurrentAssignment({ status: 'failed' });
            }
          }
        } catch (err) {
          console.error('WebSocket message parse error:', err);
        }
      };

      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        setIsConnected(false);
        if (reconnectAttemptsRef.current < 5) {
          // Auto-reconnect with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else {
          console.warn('🔌 WebSocket reconnection limit reached (5 attempts). Stop trying.');
        }
      };

      ws.onerror = (err) => {
        console.debug('WebSocket error (likely offline):', err);
        ws.close();
      };
    } catch (err) {
      console.debug('WebSocket connection failed:', err);
    }
  }, [updateCurrentAssignment, setCurrentAssignment]);

  const subscribe = useCallback((assignmentId: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'subscribe', assignmentId }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { isConnected, connect, subscribe, disconnect };
}
