import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import "./index.css";
import App from "./App.jsx";


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