import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import StockDetail from "./pages/StockDetail";
import LoginSuccessPage from "./pages/LoginSuccess";

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/detail" element={<StockDetail />} />
        <Route path="/login-success" element={<LoginSuccessPage />} />
      </Routes>
    </Router>
  );
};

export default App;
