import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { StockUtils } from "../utils/stock";
import { StockData } from "../type/type";
// import { useWebSocket } from "../context/WebSocketContext";

// const { sendMessage, messages, isConnected } = useWebSocket();

interface Trade {
  symbol: string;
  amount: number;
  average: number;
  currentPrice?: number;
  stockName: string;
}

const Dashboard: React.FC = () => {
  const { token } = useAuth();

  const [stockList, setStockList] = useState<Trade[]>([]);

  const calculateProfitLoss = (averagePrice: number, currentPrice: number) => {
    return ((currentPrice - averagePrice) / averagePrice) * 100;
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${import.meta.env.VITE_BACK_BASE_URL}/stock/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(({ data }) => setStockList(data));
  }, []);

  useEffect(() => {
    if (!token) {
      alert("로그인 후 이용해주세요.");
      navigate("/login");
    }
  }, [token, navigate]);

  const symbolString = useMemo(() => {
    if (!stockList || stockList.length === 0) return "";
    return stockList.map((t) => t.symbol).join(",");
  }, [stockList]);

  useEffect(() => {
    if (!symbolString) return; // 심볼 없으면 아무 것도 안 함

    const backUrl = import.meta.env.VITE_BACK_BASE_URL;

    // 가격 조회 함수
    const fetchPrices = () => {
      console.log("fetchPrices!", symbolString);
      axios
        .get<StockData | StockData[]>(
          `${backUrl}/stockApi/currentPrice?SYMB=${symbolString}`
        )
        .then((resp) => {
          const list = Array.isArray(resp.data) ? resp.data : [resp.data];
          setStockList((prev) =>
            prev.map((trade) => {
              const info = list.find((s) => s.symbol === trade.symbol);
              return {
                ...trade,
                currentPrice: parseFloat(info?.price ?? "0"),
              };
            })
          );
        })
        .catch((err) => {
          console.error("가격 조회 실패", err);
        });
    };

    // 즉시 한 번 호출
    fetchPrices();

    // 3초마다 반복
    const intervalId = setInterval(fetchPrices, 3000);

    // 언마운트 시나 symbolString이 바뀔 때 이전 타이머 해제
    return () => clearInterval(intervalId);
  }, [symbolString]); // ← stockList 대신 symbolString만 deps

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto py-12 px-4">
        <h2 className="text-3xl font-bold text-blue-600 mb-8">
          Your Portfolio
        </h2>

        <div className="bg-white p-6 rounded-lg shadow-md">
          {/* Table for large screens */}
          <table className="hidden md:table w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">
                  Stock Name
                </th>
                <th className="p-4 text-left text-sm font-semibold text-gray-600 border-b">
                  Symbol
                </th>
                <th className="p-4 text-right text-sm font-semibold text-gray-600 border-b">
                  Quantity
                </th>
                <th className="p-4 text-right text-sm font-semibold text-gray-600 border-b">
                  Avg. Price
                </th>
                <th className="p-4 text-right text-sm font-semibold text-gray-600 border-b">
                  Current Price
                </th>
                <th className="p-4 text-right text-sm font-semibold text-gray-600 border-b">
                  Profit/Loss (%)
                </th>
              </tr>
            </thead>
            <tbody>
              {stockList.map((trade) => {
                const profitLoss = calculateProfitLoss(
                  trade.average,
                  trade.currentPrice || trade.average
                );
                const country = StockUtils.KoEnBySymbol(trade.symbol);
                const currentSymbol = StockUtils.GetSymbolByCountry(country);

                return (
                  <tr
                    key={trade.symbol}
                    className="hover:bg-gray-50"
                    onClick={() => navigate(`/detail?id=${trade.symbol}`)}
                  >
                    <td className="p-4 text-left text-sm text-gray-800 border-b">
                      {trade.stockName}
                    </td>
                    <td className="p-4 text-left text-sm text-gray-800 border-b">
                      {trade.symbol}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-800 border-b">
                      {trade.amount}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-800 border-b">
                      {currentSymbol}
                      {trade.average.toFixed(2)}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-800 border-b">
                      {currentSymbol}
                      {trade.currentPrice?.toFixed(2)}
                    </td>
                    <td
                      className={`p-4 text-right text-sm font-semibold border-b ${
                        profitLoss >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {profitLoss.toFixed(2)}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Responsive cards for small screens */}
          <div className="md:hidden grid gap-4">
            {stockList.map((trade) => {
              const country = StockUtils.KoEnBySymbol(trade.symbol);
              const currentSymbol = StockUtils.GetSymbolByCountry(country);

              const profitLoss = calculateProfitLoss(
                trade.average,
                trade.currentPrice || trade.average
              );
              return (
                <div
                  key={trade.symbol}
                  className="p-4 bg-gray-50 rounded-lg shadow-md border hover:bg-gray-100"
                  onClick={() => navigate(`/detail?id=${trade.symbol}`)}
                >
                  <h3 className="text-lg font-bold text-gray-800">
                    {trade.stockName} ({trade.symbol})
                  </h3>
                  <p className="text-sm text-gray-600">
                    Quantity: {trade.amount}
                  </p>
                  <p className="text-sm text-gray-600">
                    Avg. Price: {currentSymbol}
                    {trade.average.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Current Price: {currentSymbol}
                    {trade.currentPrice?.toFixed(2)}
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      profitLoss >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    Profit/Loss: {profitLoss.toFixed(2)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
