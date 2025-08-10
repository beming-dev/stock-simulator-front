import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
// ⚠️ 번들러가 에러 나면: npm i lodash, import throttle from "lodash/throttle"
import throttle from "lodash.throttle";
import { StockData } from "../type/type";
import { STOCK } from "../constants/Stock";

const PAGE_SIZE = 50;

const StockSearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<StockData[]>([]);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // 🔹 NEW: KO / EN 토글을 위한 상태
  const [country, setCountry] = useState<any>(STOCK.COUNTRY.KO);

  const sentinelRef = useRef<HTMLDivElement>(null);

  const throttledSetQuery = useRef(
    throttle((val: string) => {
      setQuery(val);
      setPage(0);
      setResults([]);
      setHasMore(true);
    }, 500)
  ).current;

  useEffect(() => () => throttledSetQuery.cancel(), [throttledSetQuery]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    throttledSetQuery(e.target.value);
  };

  // ✅ country가 바뀌어도 초기화되도록 의존성에 포함
  useEffect(() => {
    setResults([]);
    setPage(0);
    setHasMore(true);
  }, [query, country]);

  // 데이터 페칭 (country 반영)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const backUrl = import.meta.env.VITE_BACK_BASE_URL;
        const url =
          `${backUrl}/stock/search?page=${page}&country=${country}` +
          (query.trim() ? `&keyword=${encodeURIComponent(query.trim())}` : "");
        const { data } = await axios.get<StockData[]>(url);
        setResults((prev) => (page === 0 ? data : [...prev, ...data]));
        setHasMore(data.length === PAGE_SIZE);
      } catch {
        setError("검색 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (hasMore) load();
  }, [page, query, country, hasMore]);

  // 무한 스크롤 옵저버
  useEffect(() => {
    if (loading) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" }
    );
    const el = sentinelRef.current;
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [loading, hasMore]);

  return (
    <div className="max-w-5xl mx-auto mt-8 px-6 overflow-x-hidden">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 mt-20">
        Stock Search
      </h1>

      <input
        type="text"
        onChange={onInputChange}
        placeholder="Enter symbol or name"
        className="w-full p-2 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* 🔹 NEW: KO / EN 토글 (세그먼트 버튼) */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-sm text-gray-600">Country</span>
        <div className="inline-flex rounded-lg  overflow-hidden space-x-2">
          <button
            type="button"
            onClick={() => setCountry(STOCK.COUNTRY.KO)}
            className={
              "px-3 py-1.5 text-sm font-medium border-l border-gray-300 " +
              (country === STOCK.COUNTRY.KO
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50")
            }
            aria-pressed={country === STOCK.COUNTRY.KO}
          >
            KO
          </button>
          <button
            type="button"
            onClick={() => setCountry(STOCK.COUNTRY.EN)}
            className={
              "px-3 py-1.5 text-sm font-medium border-l border-gray-300 " +
              (country === STOCK.COUNTRY.EN
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50")
            }
            aria-pressed={country === STOCK.COUNTRY.EN}
          >
            EN
          </button>
        </div>
      </div>

      <div className="w-full min-h-screen">
        {results.length === 0 && !loading && query && (
          <p className="text-center text-gray-500">No results found.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
          {results.map((stock) => (
            <Link
              key={`${country}:${stock.symbol}`} // 🔹 country 포함해 key 충돌 방지
              to={`/detail?id=${stock.symbol}`}
              className="block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition"
            >
              <p className="font-semibold text-gray-800 truncate">
                {stock.name}
              </p>
              <p className="text-sm text-gray-500 truncate">{stock.symbol}</p>
            </Link>
          ))}
        </div>
      </div>

      <div ref={sentinelRef} className="h-1" />

      {loading && <p className="text-center text-gray-500 mt-4">Loading...</p>}
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default StockSearchPage;
