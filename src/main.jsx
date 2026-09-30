import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import App from "./App.jsx";

// =====================================================
// SKILL LAB - GLOBAL PWA INSTALL PROMPT
// =====================================================
//
// IMPORTANT:
// beforeinstallprompt can fire BEFORE Login.jsx loads.
// So we capture it globally here.
// =====================================================

window.__skillLabInstallPrompt = null;

// =====================================================
// BEFORE INSTALL PROMPT
// =====================================================

window.addEventListener(
  "beforeinstallprompt",
  (event) => {
    console.log(
      "🔥🔥 GLOBAL BEFORE INSTALL PROMPT RECEIVED 🔥🔥"
    );

    // Prevent Chrome's automatic install prompt
    event.preventDefault();

    // Save globally
    window.__skillLabInstallPrompt = event;

    // =================================================
    // Notify Login.jsx if it is already mounted
    // =================================================

    window.dispatchEvent(
      new Event("skillLabInstallAvailable")
    );
  }
);

// =====================================================
// APP INSTALLED
// =====================================================

window.addEventListener(
  "appinstalled",
  () => {
    console.log(
      "✅ Skill Lab PWA installed successfully"
    );

    window.__skillLabInstallPrompt = null;

    // Keep asked flag
    localStorage.setItem(
      "skillLabInstallAsked",
      "true"
    );
  }
);

// =====================================================
// REACT APP
// =====================================================

createRoot(
  document.getElementById("root")
).render(

  <StrictMode>

    <BrowserRouter>

      <GoogleOAuthProvider
        clientId="215524937212-jeb6llfahvkjdch569uvh1lgiol6fde4.apps.googleusercontent.com"
      >

        <App />

      </GoogleOAuthProvider>

    </BrowserRouter>

  </StrictMode>

);

// =====================================================
// PWA SERVICE WORKER
// =====================================================

if ("serviceWorker" in navigator) {

  window.addEventListener(
    "load",
    () => {

      navigator.serviceWorker
        .register("/sw.js")

        .then((registration) => {

          console.log(
            "Skill Lab PWA Service Worker registered:",
            registration.scope
          );

        })

        .catch((error) => {

          console.error(
            "Skill Lab PWA Service Worker registration failed:",
            error
          );

        });

    }
  );

}