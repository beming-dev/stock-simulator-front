import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { StockUtils } from "../utils/stock";
import { STOCK } from "../constants/Stock";

interface Stock {
  symb: string;
  rate: string;
  name: string;
  last: string;
}

const StockItem = (stock: Stock) => {
  const country = StockUtils.KoEnBySymbol(stock.symb);

  return (
    <Link to={`/detail?id=${stock.symb}`} key={stock.symb}>
      <div
        key={stock.symb}
        className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200"
      >
        <h4 className="text-lg font-bold text-gray-800">{stock.name}</h4>
        <span className="font-bold text-gray-700 mt-2">({stock.symb})</span>
        <p className="text-gray-600 mt-2">
          {stock.last}
          {country === STOCK.COUNTRY.KO ? "\\" : "$"}{" "}
          <span
            className={`font-bold ${
              stock.rate.substring(0, 1) === "-"
                ? "text-blue-500"
                : "text-red-500"
            }`}
          >
            ({stock.rate}%)
          </span>
        </p>
      </div>
    </Link>
  );
};

const StockList: React.FC = () => {
  const [korStocks, setKorStocks] = useState<Stock[]>([]);
  const [nasStocks, setNasStocks] = useState<Stock[]>([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACK_BASE_URL}/stockApi/mainList`, {
        withCredentials: true,
      })
      .then(({ data }) => {
        setKorStocks(data.kor);
        setNasStocks(data.nas);
      })
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="flex gap-10">
      <div className="flex-1 shrink-0">
        <h3 className="text-xl font-semibold mb-4">Korea Top Volume</h3>
        <div className="flex flex-col gap-3">
          {korStocks.map((stock) => StockItem(stock))}
        </div>
      </div>
      <div className="flex-1 shrink-0">
        <h3 className="text-xl font-semibold mb-4">Nasdaq Top Volume</h3>
        <div className="flex flex-col gap-3">
          {nasStocks.map((stock) => StockItem(stock))}
        </div>
      </div>
    </div>
  );
};

export default StockList;
