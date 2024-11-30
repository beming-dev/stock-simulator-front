import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import StockChart from "../components/StockChart";
import { MockStockData, StockData } from "../type/type";
import axios from "axios";
import { useWebSocket } from "../context/WebSocketContext";

const StockDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const stockSymbol: string = searchParams.get("id") || "AAPL"; // Query로 전달된 주식 ID
  const [stock, setStock] = useState<StockData | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const { socket, messages } = useWebSocket();

  // Mock 데이터
  // const mockStocks: MockStockData = {
  //   AAPL: {
  //     symbol: "AAPL",
  //     name: "Apple Inc.",
  //     price: 150.0,
  //     high: 152.5,
  //     low: 147.0,
  //     country: "NAS",
  //     type: "NAS",
  //   },
  //   GOOGL: {
  //     symbol: "GOOGL",
  //     name: "Tesla Inc.",
  //     price: 720.0,
  //     high: 740.0,
  //     low: 700.0,
  //     country: "NAS",
  //     type: "NAS",
  //   },
  //   AMZN: {
  //     symbol: "AMZN",
  //     name: "Amazon.com Inc.",
  //     price: 3400.0,
  //     high: 3425.0,
  //     low: 3380.0,
  //     country: "NAS",
  //     type: "NAS",
  //   },
  // };

  useEffect(() => {
    const backUrl = import.meta.env.VITE_BACK_BASE_URL;
    axios
      .get(`${backUrl}/stockApi/currentPrice?SYMB=${stockSymbol}`)
      .then(({ data }: { data: StockData }) => setStock(data));
  }, []);

  // // 주식 정보 로드
  // useEffect(() => {
  //   if (stockSymbol && mockStocks[stockSymbol]) {
  //     setStock(mockStocks[stockSymbol]);
  //   } else {
  //     setStock(null); // 유효하지 않은 ID 처리
  //   }
  // }, [stockSymbol]);

  useEffect(() => {
    if (socket && socket.readyState === WebSocket.OPEN && stock) {
      const socketOpenDate = JSON.stringify({
        type: "subscribe",
        tr_type: "1",
        rq_type: "current",
        symbol: stockSymbol,
      });

      socket.send(socketOpenDate);
    }
  }, [socket, stock]);

  // const sendMessage = (message) => {
  //   if (socket && socket.readyState === WebSocket.OPEN) {
  //     socket.send(message);
  //   }
  // };

  const handleBuy = () => {
    alert(`Successfully bought ${quantity} shares of ${stock?.symbol}`);
  };

  const handleSell = () => {
    alert(`Successfully sold ${quantity} shares of ${stock?.symbol}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {stock ? (
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6">
          {/* Stock Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{stock.name}</h1>
              <p className="text-gray-500">Symbol: {stock.symbol}</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-blue-500">
                Current Price: ${stock.price}
              </p>
            </div>
          </div>

          {/* Stock Chart (Mock Data) */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              Stock Chart
            </h2>
            <div className="h-64 bg-gray-100 flex items-center justify-center rounded-lg">
              <div className="text-gray-500">
                <StockChart />
              </div>
            </div>
          </div>

          {/* Stock Info */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Day Low</p>
              <p className="text-lg font-semibold text-gray-800">
                ${stock.low}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Day High</p>
              <p className="text-lg font-semibold text-gray-800">
                ${stock.high}
              </p>
            </div>
          </div>

          {/* Buy/Sell Section */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Trade</h2>
            <div className="flex items-center space-x-4">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Enter quantity"
                className="w-1/3 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                onClick={handleBuy}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
              >
                Buy
              </button>
              <button
                onClick={handleSell}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Sell
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700">Stock Not Found</h2>
          <p className="text-gray-500">
            Please provide a valid stock ID in the query.
          </p>
        </div>
      )}
    </div>
  );
};

export default StockDetail;
