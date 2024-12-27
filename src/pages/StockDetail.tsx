import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import StockChart from "../components/StockChart";
import { StockData } from "../type/type";
import axios from "axios";
import { StructuredDataType, useWebSocket } from "../context/WebSocketContext";
import { useAuth } from "../context/AuthContext";

const StockDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const stockSymbol: string = searchParams.get("id") || "AAPL";

  const [stock, setStock] = useState<StockData | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [currentSymbol, setCurrentSymbol] = useState("$");
  const [realtimeData, setRealtimeData] = useState<StructuredDataType[]>([]);

  const { sendMessage, messages, isConnected } = useWebSocket();
  const { token } = useAuth();
  const location = useLocation();

  //parsing recieved data from websocket
  useEffect(() => {
    if (stock) {
      let symbolMessage;
      if (/^[A-Za-z]/.test(stockSymbol)) {
        symbolMessage = messages["DNAS" + stockSymbol];
      } else {
        symbolMessage = messages[stockSymbol];
      }
      setRealtimeData(symbolMessage);

      const lastMessage: StructuredDataType =
        symbolMessage[symbolMessage?.length - 1 || 0];

      const newStockData: StockData = {
        ...stock,
        price: parseInt(lastMessage.currentPrice),
        high: parseInt(lastMessage.high),
        low: parseInt(lastMessage.low),
      };

      setStock(newStockData);
    }
  }, [messages]);

  //get current stock price when user enter this page
  useEffect(() => {
    const backUrl = import.meta.env.VITE_BACK_BASE_URL;
    axios
      .get(`${backUrl}/stockApi/currentPrice?SYMB=${stockSymbol}`)
      .then(({ data }: { data: StockData }) => setStock(data));
  }, []);

  //select current symbol after stock data is fetched
  useEffect(() => {
    if (stock && (stock.country == "KSP" || stock.country == "KSD")) {
      setCurrentSymbol("\\");
    }
  }, [stock]);

  //open websocket connection
  useEffect(() => {
    if (isConnected) {
      const socketOpenData = JSON.stringify({
        type: "subscribe",
        tr_type: "1",
        rq_type: "current",
        symbol: stockSymbol,
      });

      sendMessage(socketOpenData);
    }

    const handleBeforeUnload = () => {
      const unsubscribeMessage = JSON.stringify({
        type: "unsubscribe",
        tr_type: "2",
        rq_type: "current",
        symbol: stockSymbol,
      });
      sendMessage(unsubscribeMessage);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      handleBeforeUnload();
      window.addEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isConnected, stockSymbol, location.pathname]);

  const handleBuy = async () => {
    if (!token) {
      alert("로그인 후 이용해주세요");
      return;
    }
    await axios.post(
      `${import.meta.env.VITE_BACK_BASE_URL}/stock/buy`,
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
    alert(`Successfully bought ${quantity} shares of ${stock?.symbol}`);
  };

  const handleSell = async () => {
    if (!token) {
      alert("로그인 후 이용해주세요");
      return;
    }
    await axios.post(
      `${import.meta.env.VITE_BACK_BASE_URL}/stock/sell`,
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
                {stock.name || ""}
              </h1>
              <p className="text-sm sm:text-base text-gray-500">
                Symbol: {stock.symbol || ""}
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <p className="text-lg sm:text-xl font-semibold text-blue-500">
                Current Price: {currentSymbol}
                {stock.price || ""}
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
                {currentSymbol}
                {stock.low || ""}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg shadow">
              <p className="text-sm text-gray-500">Day High</p>
              <p className="text-base sm:text-lg font-semibold text-gray-800">
                {currentSymbol}
                {stock.high || ""}
              </p>
            </div>
          </div>

          {/* Buy/Sell Section */}
          <div className="border-t pt-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">
              Trade
            </h2>
            <div className="flex justify-center items-center mb-4">
              <span className="shrink-0 mr-4">Current price: </span>
              <span className="m-0 w-full sm:w-1/3">
                {currentSymbol}
                {stock.price || ""}
              </span>
            </div>
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
          {/* Volume Section */}
          <div className="mt-20">
            <h2 className="text-md sm:text-lg font-bold text-gray-700 mb-2">
              Trading Volume
            </h2>
            {/* Table for large screens */}
            <div className="hidden sm:block border border-gray-200 rounded-lg">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="p-2 text-left text-xs font-semibold text-gray-600">
                      Time
                    </th>
                    <th className="p-2 text-right text-xs font-semibold text-gray-600">
                      Price
                    </th>
                    <th className="p-2 text-right text-xs font-semibold text-gray-600">
                      Volume
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {realtimeData.reverse().map((data, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-2 text-left text-xs text-gray-800">
                        {data.time}
                      </td>
                      <td className="p-2 text-right text-xs text-gray-800">
                        {currentSymbol}
                        {parseFloat(data.currentPrice).toFixed(2)}
                      </td>
                      <td className="p-2 text-right text-xs text-gray-800">
                        {parseInt(data.volume, 10).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Cards for small screens */}
            <div className="sm:hidden grid gap-2 overflow-y-auto max-h-64">
              {realtimeData.reverse().map((data, index) => (
                <div
                  key={index}
                  className="bg-gray-50 p-2 rounded-lg shadow-sm border"
                >
                  <p className="text-xs text-gray-500">
                    Time: {data.time || ""}
                  </p>
                  <p className="text-xs text-gray-800 font-semibold">
                    Price: {data.currentPrice || ""}
                  </p>
                  <p className="text-xs text-gray-800 font-semibold">
                    Volume: {data.volume || ""}
                  </p>
                </div>
              ))}
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
