import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

//  Captura el evento antes de que React se monte
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  (window as any).__pwaPrompt = e;  // lo guardamos globalmente
});

createRoot(document.getElementById("root")!).render(<App />);