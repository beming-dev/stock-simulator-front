import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Stock {
  symb: string;
  rate: string;
  name: string;
  last: string;
}

const StockList: React.FC = () => {
  const [korStocks, setKorStocks] = useState<Stock[]>([]);
  const [nasStocks, setNasStocks] = useState<Stock[]>([]);
  const { token } = useAuth();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BACK_BASE_URL}/stockApi/mainList`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
      <div className="flex-1">
        <h3 className="text-xl font-semibold mb-4">Korea Top Volume</h3>
        <div className="flex flex-col gap-3">
          {korStocks.map((stock) => (
            <Link to={`/detail?id=${stock.symb}`} key={stock.symb}>
              <div
                key={stock.symb}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200"
              >
                <h4 className="text-lg font-bold text-gray-800">
                  {stock.name}
                </h4>
                <span className="font-bold text-gray-700 mt-2">
                  ({stock.symb})
                </span>
                <p className="text-gray-600 mt-2">{stock.last}\</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-semibold mb-4">Nasdaq Top Volume</h3>
        <div className="flex flex-col gap-3">
          {nasStocks.map((stock) => (
            <Link to={`/detail?id=${stock.symb}`} key={stock.symb}>
              <div
                key={stock.symb}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200"
              >
                <h4 className="text-lg font-bold text-gray-800">
                  {stock.name}
                </h4>
                <span className="font-bold text-gray-700 mt-2">
                  ({stock.symb})
                </span>
                <p className="text-gray-600 mt-2">${stock.last}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StockList;
