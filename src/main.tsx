import React from "react";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

// Wrap in an IIFE to handle async operations and errors
(async () => {
  try {
    // Check if Supabase environment variables are available and log status
    const supabaseUrl =
      import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL;
    const supabaseAnonKey =
      import.meta.env.VITE_SUPABASE_ANON_KEY ||
      import.meta.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        "Supabase environment variables not detected. Some features may not work correctly.",
      );
    } else {
      console.log("Supabase environment variables detected successfully.");
    }

    // Only initialize Tempo in development mode
    if (import.meta.env.DEV) {
      try {
        const { TempoDevtools } = await import("tempo-devtools");
        TempoDevtools.init();
      } catch (error) {
        console.warn("Tempo devtools not available:", error);
      }
    }

    // Dynamically import ReactDOM and App to handle potential errors
    const [ReactDOM, { default: App }] = await Promise.all([
      import("react-dom/client"),
      import("./App.tsx"),
    ]);

    const basename = import.meta.env.BASE_URL;

    // Only attempt to render if we're in a browser environment
    if (typeof document !== "undefined") {
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
              <p style="color: #999; font-size: 0.8rem; margin-top: 20px;">Error details: ${error instanceof Error ? error.message : "Unknown error"}</p>
            </div>
          `;
        }
      } else {
        console.error("Root element not found");
      }
    }
  } catch (error) {
    console.error("Critical application error:", error);

    // If we're in a browser environment, show an error message
    if (typeof document !== "undefined") {
      document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif;">
          <h1 style="color: #333;">Critical Error</h1>
          <p style="color: #666;">The application encountered a critical error during initialization.</p>
          <p style="color: #999; font-size: 0.8rem; margin-top: 20px;">Error details: ${error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      `;
    }
  }
})();
