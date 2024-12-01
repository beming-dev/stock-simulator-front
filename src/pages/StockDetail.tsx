import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import StockChart from "../components/StockChart";
import { StockData } from "../type/type";
import axios from "axios";
import { useWebSocket } from "../context/WebSocketContext";
import { useAuth } from "../context/AuthContext";

const StockDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const stockSymbol: string = searchParams.get("id") || "AAPL";
  const [stock, setStock] = useState<StockData | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const { socket } = useWebSocket();
  const { token } = useAuth();

  useEffect(() => {
    const backUrl = import.meta.env.VITE_BACK_BASE_URL;
    axios
      .get(`${backUrl}/stockApi/currentPrice?SYMB=${stockSymbol}`)
      .then(({ data }: { data: StockData }) => setStock(data));
  }, []);

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

  const handleBuy = async () => {
    if (!token) {
      alert("로그인 후 이용해주세요");
      return;
    }
    console.log(token);
    await axios.post(
      "http://localhost:3000/stock/buy",
      {
        symbol: stockSymbol,
        amount: quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    alert(`Successfully bought ${quantity} shares of ${stock?.symbol}`);
  };

  const handleSell = async () => {
    if (!token) {
      alert("로그인 후 이용해주세요");
      return;
    }
    await axios.post(
      "http://localhost:3000/stock/sell",
      {
        symbol: stockSymbol,
        amount: quantity,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    alert(`Successfully sold ${quantity} shares of ${stock?.symbol}`);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 pt-20 px-4 sm:px-8">
      {stock ? (
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-6 sm:p-8">
          {/* Stock Header */}
          <div className="flex flex-col items-start justify-between mb-6 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                {stock.name}
              </h1>
              <p className="text-sm sm:text-base text-gray-500">
                Symbol: {stock.symbol}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <p className="text-lg sm:text-xl font-semibold text-blue-500">
                Current Price: ${stock.price}
              </p>
            </div>
          </div>

          {/* Stock Chart */}
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">
              Stock Chart
            </h2>
            <div className="w-full h-48 sm:h-64 bg-gray-100 flex items-center justify-center rounded-lg">
              <div className="text-gray-500">
                <StockChart />
              </div>
            </div>
          </div>

          {/* Stock Info */}
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Day Low</p>
              <p className="text-base sm:text-lg font-semibold text-gray-800">
                ${stock.low}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Day High</p>
              <p className="text-base sm:text-lg font-semibold text-gray-800">
                ${stock.high}
              </p>
            </div>
          </div>

          {/* Buy/Sell Section */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">
              Trade
            </h2>
            <div className="flex flex-wrap items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Enter quantity"
                className="w-full sm:w-1/3 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="flex w-full sm:w-auto justify-between space-x-4">
                <button
                  onClick={handleBuy}
                  className="flex-1 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Buy
                </button>
                <button
                  onClick={handleSell}
                  className="flex-1 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Sell
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-700">
            Stock Not Found
          </h2>
          <p className="text-sm sm:text-base text-gray-500">
            Please provide a valid stock ID in the query.
          </p>
        </div>
      )}
    </div>
  );
};

export default StockDetail;
