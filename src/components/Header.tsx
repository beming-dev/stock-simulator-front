import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-blue-600 text-white shadow-md z-10">
      <div className="container mx-auto flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-bold">Stock Simulator</h1>
        <nav className="space-x-6">
          <Link
            to="/"
            className="hover:text-yellow-300 transition duration-200"
          >
            Home
          </Link>
          <Link
            to="/dashboard"
            className="hover:text-yellow-300 transition duration-200"
          >
            Dashboard
          </Link>
          <Link
            to="/login"
            className="hover:text-yellow-300 transition duration-200"
          >
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
