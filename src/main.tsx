import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/mobile.css"; // Mobile-first styles
import "./lib/i18n"; // Initialize i18n

createRoot(document.getElementById("root")!).render(<App />);
