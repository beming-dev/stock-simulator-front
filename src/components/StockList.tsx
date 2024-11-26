import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Stock {
  symbol: string;
  price: number;
}

const StockList: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);

  useEffect(() => {
    setStocks([
      { symbol: "AAPL", price: 150 },
      { symbol: "GOOGL", price: 2800 },
      { symbol: "AMZN", price: 3400 },
    ]);
  }, []);

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Available Stocks</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stocks.map((stock) => (
          <Link to={`/detail?id=${stock.symbol}`} key={stock.symbol}>
            <div
              key={stock.symbol}
              className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200"
            >
              <h4 className="text-lg font-bold text-gray-800">
                {stock.symbol}
              </h4>
              <p className="text-gray-600 mt-2">${stock.price}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default StockList;
