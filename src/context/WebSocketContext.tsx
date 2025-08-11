import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";

export type StructuredDataType = {
  responseStatus: string;
  currentPrice: string;
  high: string;
  low: string;
  volume: string;
  time: string;
  symbol: string;
};

type MessagesType = Record<string, StructuredDataType[]>;

type WebSocketContextType = {
  messages: MessagesType;
  isConnected: boolean;
  sendMessage: (message: string) => void;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [messages, setMessages] = useState<MessagesType>({});
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const shouldReconnectRef = useRef(true);
  const reconnectAttemptRef = useRef(0);

  // 필요 시 토큰 사용 (쿠키가 아니라면)
  const token = undefined as string | undefined; // 필요하면 주입

  // 환경변수 또는 현재 origin 기준으로 안전한 URL 생성
  const buildSocketURL = () => {
    const envUrl = import.meta.env.VITE_SOCKET_URL as string | undefined;
    if (envUrl && /^wss?:\/\//i.test(envUrl)) return envUrl;

    // env가 상대경로거나 비어있을 때 기본으로 현재 호스트 사용
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.host;
    const path =
      envUrl && !/^https?:\/\//i.test(envUrl)
        ? envUrl.replace(/^\/*/, "")
        : "ws";
    let url = `${proto}://${host}/${path}`;

    // 토큰을 쿼리로 전달해야 한다면 (백엔드 합의 필요)
    if (token) {
      const sep = url.includes("?") ? "&" : "?";
      url = `${url}${sep}token=${encodeURIComponent(token)}`;
    }
    return url;
  };

  const clearTimers = () => {
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatTimerRef.current) {
      window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
  };

  const scheduleReconnect = () => {
    if (!shouldReconnectRef.current) return;
    clearTimers();
    const attempt = reconnectAttemptRef.current++;
    // 지수 백오프 + 지터 (최대 30s)
    const base = Math.min(30000, 1000 * Math.pow(2, attempt));
    const jitter = Math.floor(Math.random() * 1000);
    reconnectTimerRef.current = window.setTimeout(
      connectWebSocket,
      base + jitter
    );
  };

  const startHeartbeat = () => {
    // 25~30초 간격 권장 (LB idle-timeout보다 충분히 짧게)
    heartbeatTimerRef.current = window.setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        try {
          wsRef.current.send(JSON.stringify({ type: "ping" }));
        } catch (e) {
          // ignore
        }
      }
    }, 25000);
  };

  const safeParse = (raw: string): StructuredDataType | null => {
    try {
      const data = raw.split("^");
      if (!data || data.length < 3) return null;

      const meta = data[0] ?? "";
      const metas = meta.split("|");
      const type = metas[1] ?? "";
      const symbol = metas[3] ?? "";

      if (!symbol) return null;

      if (type === "H0STCNT0") {
        return {
          symbol,
          responseStatus: meta,
          currentPrice: data[2] ?? "",
          high: data[8] ?? "",
          low: data[9] ?? "",
          volume: data[12] ?? "",
          time: data[1] ?? "",
        };
      } else {
        return {
          symbol,
          responseStatus: data[0] ?? "",
          currentPrice: data[11] ?? "",
          high: data[9] ?? "",
          low: data[10] ?? "",
          volume: data[19] ?? "",
          time: data[7] ?? "",
        };
      }
    } catch {
      return null;
    }
  };

  const connectWebSocket = () => {
    try {
      const url = buildSocketURL();

      // subprotocol로 토큰을 보내야 하는 백엔드라면:
      // const protocols = token ? [token] : undefined;
      // const ws = new WebSocket(url, protocols);

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("websocket connected");
        setIsConnected(true);
        reconnectAttemptRef.current = 0; // 성공 시 카운터 초기화
        clearTimers();
        startHeartbeat();
        // 필요하면 here: ws.send(JSON.stringify({ type: 'SUBSCRIBE', ... }))
      };

      ws.onmessage = (event) => {
        const structured = safeParse(event.data);
        if (!structured) return;

        setMessages((prev) => {
          const list = prev[structured.symbol] || [];
          const next = [...list, structured].slice(-10);
          // 심한 리렌더가 우려되면 여기서 최소화/버퍼링 고려
          return { ...prev, [structured.symbol]: next };
        });
      };

      ws.onclose = () => {
        console.log("websocket closed");
        setIsConnected(false);
        clearTimers();
        if (shouldReconnectRef.current) {
          scheduleReconnect();
        }
      };

      ws.onerror = () => {
        // onclose가 이어질 가능성 높음
        // 여기서도 굳이 close 호출 X (이중 종료 방지)
      };
    } catch (e) {
      // 생성 단계에서 실패해도 재시도
      scheduleReconnect();
    }
  };

  useEffect(() => {
    shouldReconnectRef.current = true;
    connectWebSocket();

    // 탭이 백그라운드 갔다 돌아왔을때 죽은 소켓 복구
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          scheduleReconnect();
        }
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      shouldReconnectRef.current = false;
      document.removeEventListener("visibilitychange", onVisibility);
      clearTimers();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  const sendMessage = (message: string) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    } else {
      console.error("WebSocket is not connected");
    }
  };

  return (
    <WebSocketContext.Provider value={{ messages, isConnected, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx)
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  return ctx;
};
