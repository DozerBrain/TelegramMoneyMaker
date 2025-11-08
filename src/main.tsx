import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";                  // main game screen
import "@/styles/mascot.css";             // 👈 Mr.T animations

// OPTIONAL: if you already made telegram.ts
// import { initTelegram } from "@/lib/telegram";
// initTelegram();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
