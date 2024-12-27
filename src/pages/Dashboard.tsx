import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

interface Trade {
  symbol: string;
  amount: number;
  average: number;
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
                  //trade.currentPrice
                  trade.average
                );
                return (
                  <tr
                    key={trade.symbol}
                    className="hover:bg-gray-50"
                    onClick={() => navigate(`/detail?id=${trade.symbol}`)}
                  >
                    <td className="p-4 text-left text-sm text-gray-800 border-b">
                      {trade.symbol}
                    </td>
                    <td className="p-4 text-left text-sm text-gray-800 border-b">
                      {trade.symbol}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-800 border-b">
                      {trade.amount}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-800 border-b">
                      ${trade.average.toFixed(2)}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-800 border-b">
                      ${trade.average.toFixed(2)}
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
              const profitLoss = calculateProfitLoss(
                trade.average,
                trade.average
              );
              return (
                <div
                  key={trade.symbol}
                  className="p-4 bg-gray-50 rounded-lg shadow-md border hover:bg-gray-100"
                  onClick={() => navigate(`/detail?id=${trade.symbol}`)}
                >
                  <h3 className="text-lg font-bold text-gray-800">
                    {trade.symbol} ({trade.symbol})
                  </h3>
                  <p className="text-sm text-gray-600">
                    Quantity: {trade.amount}
                  </p>
                  <p className="text-sm text-gray-600">
                    Avg. Price: ${trade.average.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Current Price: ${trade.average.toFixed(2)}
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
