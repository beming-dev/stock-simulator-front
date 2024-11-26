import React from "react";
import { Link, useNavigate } from "react-router-dom";

interface Trade {
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
}

const Dashboard: React.FC = () => {
  // Mock portfolio data
  const portfolio: Trade[] = [
    {
      symbol: "AAPL",
      name: "Apple Inc.",
      quantity: 10,
      averagePrice: 145.0,
      currentPrice: 150.0,
    },
    {
      symbol: "GOOGL",
      name: "GOOGL Inc.",
      quantity: 5,
      averagePrice: 700.0,
      currentPrice: 720.0,
    },
    {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      quantity: 8,
      averagePrice: 3350.0,
      currentPrice: 3400.0,
    },
  ];

  // Calculate Profit/Loss Percentage
  const calculateProfitLoss = (averagePrice: number, currentPrice: number) => {
    return ((currentPrice - averagePrice) / averagePrice) * 100;
  };

  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto py-12">
        <h2 className="text-3xl font-bold text-blue-600 mb-8">
          Your Portfolio
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <table className="w-full border-collapse border border-gray-200">
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
              {portfolio.map((trade) => {
                const profitLoss = calculateProfitLoss(
                  trade.averagePrice,
                  trade.currentPrice
                );
                return (
                  <tr
                    key={trade.symbol}
                    className="hover:bg-gray-50"
                    onClick={() => navigate(`/detail?id=${trade.symbol}`)}
                  >
                    <td className="p-4 text-left text-sm text-gray-800 border-b">
                      {trade.name}
                    </td>
                    <td className="p-4 text-left text-sm text-gray-800 border-b">
                      {trade.symbol}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-800 border-b">
                      {trade.quantity}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-800 border-b">
                      ${trade.averagePrice.toFixed(2)}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-800 border-b">
                      ${trade.currentPrice.toFixed(2)}
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
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
