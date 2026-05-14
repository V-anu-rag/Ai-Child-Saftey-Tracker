"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && window.location.protocol === "https:" || window.location.hostname === "localhost") {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("🚀 [SW] Registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.error("❌ [SW] Registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}
