import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Automatically inject ngrok bypass header into all API requests
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  const newInit = { ...(init || {}) };
  const headers = new Headers(newInit.headers || {});
  headers.set('ngrok-skip-browser-warning', 'true');
  newInit.headers = headers;
  return originalFetch(input, newInit);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
