import React, { createContext, useContext, useEffect, useState } from "react";

export type StructuredDataType = {
  responseStatus: string;
  currentPrice: string;
  high: string;
  low: string;
  volume: string;
  time: string;
};

type WebSocketContextType = {
  socket: WebSocket | null;
  messages: StructuredDataType[];
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<StructuredDataType[]>([]);

  useEffect(() => {
    const webSocket = new WebSocket("ws://localhost:3000/ws");

    webSocket.onopen = () => {
      console.log("WebSocket connected");
    };

    webSocket.onmessage = (event) => {
      const getKStructuredData = (data: string[]): StructuredDataType => {
        return {
          responseStatus: data[0],
          currentPrice: data[2],
          high: data[8],
          low: data[9],
          volume: data[12],
          time: data[1],
        };
      };
      const getAStructuredData = (data: string[]): StructuredDataType => {
        return {
          responseStatus: data[0],
          currentPrice: data[12],
          high: data[9],
          low: data[10],
          volume: data[20],
          time: data[7],
        };
      };

      const splitData = event.data.split("^");
      const structuredData = getKStructuredData(splitData);

      setMessages((prev) => {
        const updatedMessages = [...prev, structuredData];
        // 배열 길이가 30 초과 시 앞의 데이터를 제거
        return updatedMessages.length > 20
          ? updatedMessages.slice(-20) // 마지막 30개만 남김
          : updatedMessages;
      });
    };

    webSocket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    webSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    setSocket(webSocket);

    return () => {
      webSocket.close();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ socket, messages }}>
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
