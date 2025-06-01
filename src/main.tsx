import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// Only initialize Tempo in development mode
if (import.meta.env.DEV) {
  try {
    const { TempoDevtools } = await import("tempo-devtools");
    TempoDevtools.init();
  } catch (error) {
    console.warn("Tempo devtools not available:", error);
  }
}

const basename = import.meta.env.BASE_URL;

// Check if the root element exists before rendering
const rootElement = document.getElementById("root");

if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </React.StrictMode>,
    );
  } catch (error) {
    console.error("Failed to render application:", error);

    // Show a user-friendly error message
    rootElement.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif;">
        <h1 style="color: #333;">Application Error</h1>
        <p style="color: #666;">The application failed to load. Please try again later.</p>
      </div>
    `;
  }
} else {
  console.error("Root element not found");
}
