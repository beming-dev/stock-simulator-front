import React from "react";
import StockList from "../components/StockList";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-gray-100 p-5 pt-[80px]">
      <h2 className="text-4xl font-bold text-blue-600 mb-4">
        Welcome to Stock Simulator
      </h2>
      <p className="text-lg text-gray-700 mb-8">
        Start trading with our simulation platform.
      </p>
      <Link
        to="/dashboard"
        className="bg-blue-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-blue-600 transition duration-200"
      >
        Go to Dashboard
      </Link>
      <div className="mt-12 w-full max-w-4xl">
        <StockList />
      </div>
    </div>
  );
};

export default Home;
