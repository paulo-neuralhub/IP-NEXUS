import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/mobile.css"; // Mobile-first styles
import "./lib/i18n"; // Initialize i18n
import { unregisterServiceWorker } from "@/lib/pwa/register-sw";

// Prevent Service Worker caching in Lovable preview/dev.
// Cached mixed chunks can cause React "dispatcher null" hook crashes.
if (import.meta.env.DEV) {
  unregisterServiceWorker().catch(() => {
    // ignore
  });
}

createRoot(document.getElementById("root")!).render(<App />);
