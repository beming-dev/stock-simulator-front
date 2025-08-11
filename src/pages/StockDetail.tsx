import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
// import StockChart from "../components/StockChart";
import { Holding, StockData } from "../type/type";
import axios from "axios";
import { StructuredDataType, useWebSocket } from "../context/WebSocketContext";
import CandleChart, { StockChartData } from "../components/CandleChart";
import Star from "../components/Star";
import BuyBtn from "../components/BuyBtn";
import SellBtn from "../components/SellBtn";
import StockVolume from "../components/StockVolume";
import axiosWithToken from "../utils/customAxios";
import { useAuth } from "../context/AuthContext";
import { StockUtils } from "../utils/stock";

const StockDetail: React.FC = React.memo(() => {
  const [searchParams] = useSearchParams();
  const stockSymbol: string = searchParams.get("id") || "AAPL";

  const [stock, setStock] = useState<StockData | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [currentSymbol, setCurrentSymbol] = useState("$");
  const [chartData, setChartData] = useState<StockChartData[]>([]);
  const [holding, setHolding] = useState<null | Holding>(null);

  const { sendMessage, messages, isConnected } = useWebSocket();
  const location = useLocation();
  const { token } = useAuth();

  // 성능 최적화를 위한 ref들
  const isVisible = useRef<boolean>(true);
  const pendingMessagesRef = useRef<StructuredDataType[]>([]);
  const chartDataRef = useRef<StockChartData[]>([]);

  // 차트 데이터 ref 업데이트
  useEffect(() => {
    chartDataRef.current = chartData;
  }, [chartData]);

  // 컴포넌트 최상단에 추가 - 성능 최적화된 메시지 처리
  const processMessage = useCallback((lastMessage: StructuredDataType) => {
    if (!chartDataRef.current.length) return;

    const lastChart = chartDataRef.current[0];
    const hhmm = lastChart.date.slice(-6, -2);
    const yymmdd = lastChart.date.slice(0, 8);
    const newhhmm = lastMessage.time.slice(-6, -2);

    const currentPrice = parseFloat(lastMessage.currentPrice);
    const lastHigh = parseFloat(lastChart.high);
    const lastLow = parseFloat(lastChart.low);

    if (hhmm === newhhmm) {
      // 같은 분 안에서 업데이트
      const updated = {
        ...lastChart,
        date: yymmdd + newhhmm + "00",
        high: Math.max(lastHigh, currentPrice).toString(),
        low: Math.min(lastLow, currentPrice).toString(),
        close: lastMessage.currentPrice,
      };
      setChartData((cd) => {
        const copy = [...cd];
        copy[0] = updated;
        return copy;
      });
    } else {
      // 새로운 분이 시작됐을 때
      const newData = {
        ...lastChart,
        date: yymmdd + newhhmm + "00",
        open: lastMessage.currentPrice,
        high: lastMessage.currentPrice,
        low: lastMessage.currentPrice,
        close: lastMessage.currentPrice,
      };
      setChartData((cd) => [newData, ...cd.slice(0, 99)]); // 최대 100개만 유지
    }
  }, []);

  // 가시성 변경 처리 - 성능 최적화
  useEffect(() => {
    const onVisibilityChange = () => {
      const isNowVisible = document.visibilityState === "visible";
      isVisible.current = isNowVisible;

      if (isNowVisible && pendingMessagesRef.current.length > 0) {
        // 가장 최신 메시지만 처리하여 성능 향상
        const latestMessage =
          pendingMessagesRef.current[pendingMessagesRef.current.length - 1];
        processMessage(latestMessage);
        pendingMessagesRef.current = []; // 비우기
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [processMessage]);

  //get current stock price when user enter this page
  useEffect(() => {
    const backUrl = import.meta.env.VITE_BACK_BASE_URL;
    axios
      .get(`${backUrl}/stockApi/currentPrice?SYMB=${stockSymbol}`)
      .then(({ data }: { data: StockData }) => setStock(data));

    axios
      .get(`${backUrl}/stockApi/chartData?SYMB=${stockSymbol}`)
      .then(({ data }: { data: StockChartData[] }) => setChartData(data));

    if (token) {
      axiosWithToken(token)
        .get(`${backUrl}/stock/item?symbol=${stockSymbol}`)
        .then(({ data }: { data: Holding }) => {
          console.log(data);
          setHolding(data);
        });
    }
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
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isConnected, stockSymbol, location.pathname]);

  // 메시지 처리 - 성능 최적화
  useEffect(() => {
    if (!stock) return;

    // 방금 들어온 메시지 가져오기
    let symbolMessage = /^[A-Za-z]/.test(stockSymbol)
      ? messages["DNAS" + stockSymbol]
      : messages[stockSymbol];
    if (!symbolMessage || symbolMessage.length === 0) return;

    const lastMessage = symbolMessage[symbolMessage.length - 1];

    if (isVisible.current) {
      // 탭이 보이는 상태면 바로 처리
      processMessage(lastMessage);
    } else {
      // 백그라운드일 땐 pending에 추가 (최대 10개만 유지)
      pendingMessagesRef.current = [
        ...pendingMessagesRef.current.slice(-9),
        lastMessage,
      ];
    }
  }, [messages, stock, processMessage]);

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
            <div className="flex flex-wrap items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                placeholder="Enter quantity"
                className="w-full sm:w-1/3 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="flex w-full sm:w-auto justify-between space-x-4">
                <BuyBtn
                  stockSymbol={stockSymbol}
                  quantity={quantity}
                  price={stock.price as number}
                  setHolding={setHolding}
                />
                <SellBtn
                  stockSymbol={stockSymbol}
                  quantity={quantity}
                  price={stock.price as number}
                  maximum={holding ? holding.amount : 0}
                  setHolding={setHolding}
                />
              </div>
            </div>

            {/* 요약 대시보드 */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* 현재 가격 */}
              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">Average Price</p>
                <p className="text-base sm:text-lg font-semibold text-gray-800">
                  {holding && currentSymbol}
                  {holding?.average?.toFixed(2) || "No Stock"}
                </p>
              </div>

              {/* 보유 수량 */}
              <div className="bg-gray-50 p-4 rounded-lg shadow">
                <p className="text-sm text-gray-500">Holdings</p>
                <p className="text-base sm:text-lg font-semibold text-gray-800">
                  {holding ? holding?.amount : 0} shares
                </p>
              </div>

              {/* 수익률 */}
              <div
                className={` sm:col-span-2 bg-gray-50 p-4 rounded-lg shadow ${
                  parseFloat("1") < 0 ? "text-red-500" : "text-green-500"
                }`}
              >
                <p className="text-sm text-gray-500">Profit Rate</p>
                <p className="text-base sm:text-lg font-semibold">
                  {holding
                    ? StockUtils.calculateProfitAmount(
                        holding?.average as number,
                        parseFloat(stock.price as string),
                        holding.amount
                      )
                    : 0}
                  {holding && currentSymbol}&nbsp;(
                  {holding
                    ? StockUtils.calculateProfitRate(
                        holding?.average as number,
                        parseFloat(stock.price as string)
                      )
                    : 0}
                  %)
                </p>
              </div>
            </div>

            <div className="flex justify-start items-center mt-4">
              <span className="shrink-0 mr-4">Current price: </span>
              <span className="m-0 w-full sm:w-1/3">
                {currentSymbol}
                {stock.price || ""}
              </span>
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
          <h2 className="text-3xl sm:text-3xl font-bold text-gray-700">
            Stock Not Found
          </h2>
          <h3 className="text-2xl sm:text-2xl font-bold text-gray-700">
            (ETF and Reverage is not supported yet.)
          </h3>
          <p className="text-sm sm:text-base text-gray-500">
            Please provide a valid stock ID in the query.
          </p>
        </div>
      )}
    </div>
  );
});

StockDetail.displayName = "StockDetail";

export default StockDetail;
