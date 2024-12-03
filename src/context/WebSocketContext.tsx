import React, { createContext, useContext, useEffect, useState } from "react";

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
  [symbol: string]: StructuredDataType[]; // 각 symbol별 데이터 배열
};

type WebSocketContextType = {
  socket: WebSocket | null;
  messages: MessagesType;
  isConnected: boolean;
};

const WebSocketContext = createContext<WebSocketContextType | undefined>(
  undefined
);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<MessagesType>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    const webSocket = new WebSocket("ws://localhost:3000/ws");

    webSocket.onopen = () => {
      setIsConnected(true);
      console.log("WebSocket connected");
    };

    webSocket.onmessage = (event) => {
      console.log(event.data);
      const getKStructuredData = (data: string[]): StructuredDataType => {
        const meta = data[0];
        const metas = meta.split("|");
        const symbol = metas[3];
        const type = metas[1];

        if (type == "H0STCNT0")
          //한국주식
          return {
            symbol: symbol,
            responseStatus: meta,
            currentPrice: data[2],
            high: data[8],
            low: data[9],
            volume: data[12],
            time: data[1],
          };
        //미국주식
        else
          return {
            symbol: "a",
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
        const symbol = structuredData.symbol;
        const updatedSymbolMessages = prev[symbol] || [];
        const updatedMessagesForSymbol = [
          ...updatedSymbolMessages,
          structuredData,
        ];

        // 배열 길이가 20 초과 시 앞의 데이터를 제거
        const limitedMessages = updatedMessagesForSymbol.slice(-20);

        return {
          ...prev,
          [symbol]: limitedMessages, // 해당 symbol의 메시지 업데이트
        };
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
    <WebSocketContext.Provider value={{ socket, messages, isConnected }}>
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
