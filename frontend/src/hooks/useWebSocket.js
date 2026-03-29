import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(onMessage) {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const reconnectTimerRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  // Keep the ref updated
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const connect = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
     const backendHost = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('https://', '').replace('http://', '')
  : window.location.host;
const wsUrl = `${protocol}//${backendHost}/ws`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setConnected(true);
        // Start ping interval
        const pingInterval = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send('ping');
          }
        }, 30000);
        ws._pingInterval = pingInterval;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== 'pong' && onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (e) {
          console.error('WebSocket parse error:', e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        if (ws._pingInterval) clearInterval(ws._pingInterval);
        // Reconnect after 3s
        reconnectTimerRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch (e) {
      console.error('WebSocket connection error:', e);
      reconnectTimerRef.current = setTimeout(connect, 3000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
    };
  }, [connect]);

  return { connected };
}
