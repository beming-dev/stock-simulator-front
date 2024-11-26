import React, { createContext, useState, useContext, ReactNode } from "react";

// Define the shape of the context
interface AuthContextType {
  token: string | null;
  isLoggedIn: boolean;
  login: (newToken: string) => void;
  logout: () => void;
}

// Create Auth Context with a default value of `undefined`
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom Hook to use Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Define the props for AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem("token")
  );

  const login = (newToken: string) => {
    sessionStorage.setItem("token", newToken); // Store token in session storage
    setToken(newToken); // Update state
  };

  const logout = () => {
    sessionStorage.removeItem("token"); // Remove token from storage
    setToken(null); // Clear state
  };

  const isLoggedIn = !!token; // Check if token exists

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
