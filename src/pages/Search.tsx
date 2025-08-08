import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { StockData } from "../type/type";

const StockSearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<StockData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const handler = setTimeout(() => {
      setLoading(true);
      setError(null);
      const backUrl = import.meta.env.VITE_BACK_BASE_URL;
      axios
        .get<StockData[]>(
          `${backUrl}/stockApi/search?query=${encodeURIComponent(query)}`
        )
        .then(({ data }) => {
          setResults(data);
        })
        .catch((err) => {
          console.error(err);
          setError("검색 중 오류가 발생했습니다.");
        })
        .finally(() => {
          setLoading(false);
        });
    }, 500);

    return () => clearTimeout(handler);
  }, [query]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Stock Search</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter symbol or name"
        className="w-full p-2 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-500">{error}</p>}

      <ul className="space-y-2">
        {!loading && results.length === 0 && query.trim() && (
          <li className="text-sm text-gray-500">No results found.</li>
        )}
        {results.map((stock) => (
          <li key={stock.symbol}>
            <Link
              to={`/stock-detail?id=${stock.symbol}`}
              className="block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{stock.name}</p>
                  <p className="text-sm text-gray-500">{stock.symbol}</p>
                </div>
                <p className="text-lg font-medium text-blue-600">
                  {0}
                  {0}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StockSearchPage;
