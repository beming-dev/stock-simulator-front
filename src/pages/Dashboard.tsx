import React, { useState } from "react";
import Portfolio from "../components/Portfolio";
import TradeForm from "../components/TradeForm";

interface Trade {
  symbol: string;
  quantity: number;
}

const Dashboard: React.FC = () => {
  const [portfolio, setPortfolio] = useState<Trade[]>([]);

  const handleTrade = (trade: Trade) => {
    setPortfolio((prev) => [...prev, trade]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto py-12">
        <h2 className="text-3xl font-bold text-blue-600 mb-8">
          Your Dashboard
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Portfolio portfolio={portfolio} />
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <TradeForm onTrade={handleTrade} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
