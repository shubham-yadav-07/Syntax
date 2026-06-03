import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import App from "./app/App";
import "./styles/globals.css";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#1E293B",
          color: "#fff",
          border: "1px solid #475569",
          fontSize: "14px",
        },
        success: { iconTheme: { primary: "#7C3AED", secondary: "#fff" } },
        error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
      }}
    />
  </StrictMode>
);
