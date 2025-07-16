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

type MessagesType = {
  [symbol: string]: StructuredDataType[];
};

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
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const webSocket = useRef<WebSocket | null>(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const socketURL = import.meta.env.VITE_SOCKET_URL;
      console.log(socketUrl)
      webSocket.current = new WebSocket(socketURL);

      webSocket.current.onopen = () => {
        setIsConnected(true);
        console.log("WebSocket connected yeah");
      };

      webSocket.current.onmessage = (event) => {
        const splitData = event.data.split("^");
        const getKStructuredData = (data: string[]): StructuredDataType => {
          const meta = data[0];
          const metas = meta.split("|");
          const symbol = metas[3];
          const type = metas[1];

          //국내주식 실시간체결가 parsing
          if (type === "H0STCNT0") {
            return {
              symbol,
              responseStatus: meta,
              //현재가
              currentPrice: data[2],
              //최고가
              high: data[8],
              //최저가
              low: data[9],
              //거래량
              volume: data[12],
              //체결 시간
              time: data[1],
            };
          } else {
            return {
              symbol,
              responseStatus: data[0],
              //현재가
              currentPrice: data[11],
              //최고가
              high: data[9],
              //최저가
              low: data[10],
              //거래량
              volume: data[20],
              //체결 한국시간
              time: data[7],
            };
          }
        };

        const structuredData = getKStructuredData(splitData);

        setMessages((prev) => {
          const symbol = structuredData.symbol;
          const updatedSymbolMessages = prev[symbol] || [];
          const updatedMessagesForSymbol = [
            ...updatedSymbolMessages,
            structuredData,
          ];
          const limitedMessages = updatedMessagesForSymbol.slice(-20);

          return {
            ...prev,
            [symbol]: limitedMessages,
          };
        });
      };

      webSocket.current.onclose = () => {
        setIsConnected(false);
        console.log("WebSocket disconnected. Reconnecting...");
        setTimeout(connectWebSocket, 5000);
      };

      webSocket.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    };

    connectWebSocket();

    return () => {
      webSocket.current?.close();
    };
  }, []);

  const sendMessage = (message: string) => {
    if (webSocket.current?.readyState === WebSocket.OPEN) {
      webSocket.current.send(message);
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
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
