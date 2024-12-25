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

          if (type === "H0STCNT0") {
            return {
              symbol: symbol,
              responseStatus: meta,
              currentPrice: data[2],
              high: data[8],
              low: data[9],
              volume: data[12],
              time: data[1],
            };
          } else {
            return {
              symbol: "a",
              responseStatus: data[0],
              currentPrice: data[12],
              high: data[9],
              low: data[10],
              volume: data[20],
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
