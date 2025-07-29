import React, { useState, useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
// import StockChart from "../components/StockChart";
import { StockData } from "../type/type";
import axios from "axios";
import { StructuredDataType, useWebSocket } from "../context/WebSocketContext";
import CandleChart, { StockChartData } from "../components/CandleChart";
import Star from "../components/Star";
import BuyBtn from "../components/BuyBtn";
import SellBtn from "../components/SellBtn";
import StockVolume from "../components/StockVolume";

const StockDetail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const stockSymbol: string = searchParams.get("id") || "AAPL";

  const [stock, setStock] = useState<StockData | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [currentSymbol, setCurrentSymbol] = useState("$");
  const [chartData, setChartData] = useState<StockChartData[]>([]);

  const { sendMessage, messages, isConnected } = useWebSocket();
  const location = useLocation();

  //get current stock price when user enter this page
  useEffect(() => {
    const backUrl = import.meta.env.VITE_BACK_BASE_URL;
    axios
      .get(`${backUrl}/stockApi/currentPrice?SYMB=${stockSymbol}`)
      .then(({ data }: { data: StockData }) => setStock(data));

    axios
      .get(`${backUrl}/stockApi/chartData?SYMB=${stockSymbol}`)
      .then(({ data }: { data: StockChartData[] }) => setChartData(data));
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

  useEffect(() => {
    if (stock) {
      let symbolMessage;
      if (/^[A-Za-z]/.test(stockSymbol)) {
        symbolMessage = messages["DNAS" + stockSymbol];
      } else {
        symbolMessage = messages[stockSymbol];
      }
      if (!symbolMessage) return;

      const lastMessage: StructuredDataType =
        symbolMessage[symbolMessage?.length - 1 || 0];
      const lastChartData = chartData[0];

      const hhmm = lastChartData.date.slice(-6, -2);
      const yymmdd = lastChartData.date.slice(0, 8);
      const newhhmm = lastMessage.time.slice(-6, -2);

      if (hhmm == newhhmm) {
        const newChartData = {
          ...lastChartData,
          date: yymmdd + newhhmm + "00",
          high:
            lastChartData.high > lastMessage.currentPrice
              ? lastChartData.high
              : lastMessage.currentPrice,
          low:
            lastChartData.low < lastMessage.currentPrice
              ? lastChartData.low
              : lastMessage.currentPrice,
          close: lastMessage.currentPrice,
        };

        const updatedChartData = [...chartData];
        updatedChartData[0] = newChartData;
        setChartData((chartData: any) => updatedChartData);
      } else {
        const newChartData = {
          ...lastChartData,
          date: yymmdd + newhhmm + "00",
          high: lastMessage.currentPrice,
          low: lastMessage.currentPrice,
          open: lastMessage.currentPrice,
          close: lastMessage.currentPrice,
        };
        setChartData((chartData: any) => [newChartData, ...chartData]);
      }
    }
  }, [messages]);

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

            <div className="mt-4 sm:mt-0 flex">
              <p className="text-lg sm:text-xl font-semibold text-blue-500">
                Current Price: {currentSymbol}
                {parseFloat(stock?.price.toString()).toFixed(2) || ""}
              </p>
              <Star stockSymbol={stockSymbol} />
            </div>
          </div>

          {/* Stock Chart */}
          <div className="mb-20">
            <h2 className="text-lg sm:text-xl font-bold text-gray-700 mb-4">
              Stock Chart
            </h2>
            <div className="w-full h-auto bg-gray-100 flex items-center justify-center rounded-lg">
              <CandleChart data={chartData} />
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
                <BuyBtn stockSymbol={stockSymbol} quantity={quantity} />
                <SellBtn stockSymbol={stockSymbol} quantity={quantity} />
              </div>
            </div>
          </div>

          {/* Volume Section */}
          <StockVolume
            stockSymbol={stockSymbol}
            stock={stock}
            setStock={setStock}
            currentSymbol={currentSymbol}
            messages={messages}
          />
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
