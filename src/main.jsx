import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import App from "./App.jsx";


// =====================================================
// SKILL LAB - PWA INSTALL PROMPT
// =====================================================

window.__skillLabInstallPrompt = null;


// =====================================================
// BEFORE INSTALL PROMPT
// =====================================================

window.addEventListener(
  "beforeinstallprompt",
  (event) => {

    console.log(
      "🔥 Skill Lab install prompt available"
    );

    // Stop Chrome automatic prompt
    event.preventDefault();

    // Save prompt
    window.__skillLabInstallPrompt = event;

    // Tell Login page
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
      "✅ Skill Lab installed"
    );

    window.__skillLabInstallPrompt = null;

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
// ONE SERVICE WORKER
// =====================================================
//
// This SAME service worker handles:
//
// 1. PWA
// 2. Firebase background notification
//
// =====================================================

if ("serviceWorker" in navigator) {

  window.addEventListener(
    "load",
    async () => {

      try {

        const registration =
          await navigator.serviceWorker.register(
            "/sw.js",
            {
              scope: "/",
            }
          );

        console.log(
          "✅ Skill Lab Service Worker registered:",
          registration.scope
        );

      } catch (error) {

        console.error(
          "❌ Service Worker registration failed:",
          error
        );

      }

    }
  );

}