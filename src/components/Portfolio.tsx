import React from "react";

interface Trade {
  symbol: string;
  quantity: number;
}

interface PortfolioProps {
  portfolio: Trade[];
}

const Portfolio: React.FC<PortfolioProps> = ({ portfolio }) => {
  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Your Portfolio</h3>
      <ul className="space-y-4">
        {portfolio.map((trade, index) => (
          <li
            key={index}
            className="flex justify-between bg-gray-100 p-4 rounded-lg shadow-md"
          >
            <span>
              {trade.quantity} shares of {trade.symbol}
            </span>
            <span className="font-semibold text-gray-700">{trade.symbol}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Portfolio;
