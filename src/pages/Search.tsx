import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import throttle from "lodash.throttle"; // lodash.throttle 설치 필요
import { StockData } from "../type/type";

const PAGE_SIZE = 50;

const StockSearchPage: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<StockData[]>([]);
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // ▶️ 0.5초 스로틀링된 setQuery
  const throttledSetQuery = useRef(
    throttle((val: string) => {
      setQuery(val);
      setPage(0);
      setResults([]);
      setHasMore(true);
    }, 500)
  ).current;

  // 언마운트 시 스로틀 취소
  useEffect(() => {
    return () => {
      throttledSetQuery.cancel();
    };
  }, [throttledSetQuery]);

  // 입력 onChange 에서 바로 setQuery 하지 않고 throttledSetQuery 호출
  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    throttledSetQuery(e.target.value);
  };

  // query 변경 시 결과 초기화 (throttle 내부에서도 해주지만, 안전하게 한 번 더)
  useEffect(() => {
    setResults([]);
    setPage(0);
    setHasMore(true);
  }, [query]);

  // 데이터 페칭
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const backUrl = import.meta.env.VITE_BACK_BASE_URL;
        const url =
          `${backUrl}/stock/search?page=${page}&country=KO` +
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
  }, [page, query]);

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
    <div className="max-w-5xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 mt-20">
        Stock Search
      </h1>
      <input
        type="text"
        onChange={onInputChange}
        placeholder="Enter symbol or name"
        className="w-full p-2 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* ─────────── 결과 그리드 ─────────── */}
      {results.length === 0 && !loading && query && (
        <p className="text-center text-gray-500">No results found.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 min-h-screen">
        {results.map((stock) => (
          <Link
            key={stock.symbol}
            to={`/detail?id=${stock.symbol}`}
            className="block p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition"
          >
            <p className="font-semibold text-gray-800 truncate">{stock.name}</p>
            <p className="text-sm text-gray-500 truncate">{stock.symbol}</p>
          </Link>
        ))}
      </div>

      {/* 옵저버용 빈 div */}
      <div ref={sentinelRef} className="h-1"></div>

      {loading && <p className="text-center text-gray-500 mt-4">Loading...</p>}
      {error && <p className="text-center text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default StockSearchPage;
