import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import { WebSocketProvider } from "./context/WebSocketContext.tsx";

createRoot(document.getElementById("root")!).render(
  <WebSocketProvider>
    <AuthProvider>
      <App />
    </AuthProvider>
  </WebSocketProvider>
);
