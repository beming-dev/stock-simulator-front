import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBars, FaTimes } from "react-icons/fa";

const Header: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onLogoutClick = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false); // 로그아웃 후 메뉴 닫기
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-blue-600 text-white shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center px-4 py-3">
        {/* 로고 */}
        <Link
          to="/"
          className="text-2xl font-bold whitespace-nowrap text-white"
        >
          Stock Simulator
        </Link>

        {/* 햄버거 아이콘 (화면 크기가 md 이하일 때만 표시) */}
        <div className="sm:hidden">
          <button
            onClick={toggleMenu}
            aria-label="Toggle Menu"
            className="text-white transition duration-200 bg-transparent border-0 focus:outline-none"
          >
            {isMenuOpen ? (
              <FaTimes className="text-2xl" />
            ) : (
              <FaBars className="text-2xl" />
            )}
          </button>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav
          className={`fixed sm:relative top-0 left-0 w-64 sm:w-auto sm:flex flex-col sm:flex-row items-center bg-blue-600 sm:bg-transparent h-screen sm:h-auto transition-transform duration-300 ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
          }`}
        >
          <ul className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center mt-16 sm:mt-0">
            <li>
              <Link
                to="/"
                className="text-white hover:text-yellow-300 transition duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard"
                className="text-white hover:text-yellow-300 transition duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
            </li>
            <li>
              {isLoggedIn ? (
                <span
                  onClick={onLogoutClick}
                  className="text-white hover:text-yellow-300 cursor-pointer transition duration-200"
                >
                  Logout
                </span>
              ) : (
                <Link
                  to="/login"
                  className="text-white hover:text-yellow-300 transition duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
